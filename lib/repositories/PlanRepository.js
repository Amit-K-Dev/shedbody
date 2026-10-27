import { BaseRepository } from "./BaseRepository.js";

/**
 * D1 Repository for Plans domain.
 */
export class PlanRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, "plans");
  }

  /**
   * Helper to safely parse stored JSON fields (workout, meals) to match Supabase jsonb objects.
   */
  _parseJson(val) {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "object") return val;
    try {
      return JSON.parse(val);
    } catch (err) {
      console.warn("PlanRepository: Failed to parse stored JSON field, returning null:", err.message);
      return null;
    }
  }

  /**
   * Formats a plan row to ensure response-shape parity with Supabase.
   */
  _formatPlan(plan) {
    if (!plan) return null;
    let createdAt = plan.created_at;
    if (typeof createdAt === 'number' || (typeof createdAt === 'string' && /^\d+$/.test(createdAt))) {
      const num = Number(createdAt);
      createdAt = new Date(num < 1e11 ? num * 1000 : num).toISOString();
    }
    return {
      ...plan,
      created_at: createdAt,
      is_active: Boolean(plan.is_active),
      workout: this._parseJson(plan.workout),
      meals: this._parseJson(plan.meals),
    };
  }

  /**
   * Overrides BaseRepository.findById to format JSON fields and boolean active flags.
   */
  async findById(id, userId) {
    this._validateUser(userId);
    const sql = `SELECT * FROM plans WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1`;
    const plan = await this.adapter.queryOne(sql, [id, userId]);
    return plan ? this._formatPlan(plan) : null;
  }

  /**
   * Adapts a plan, deactivating the previous active plan, creating a new plan with provenance,
   * and linking previous_plan_id and resulting_plan_id in adaptation_events atomically.
   */
  async adaptPlan(userId, payload) {
    this._validateUser(userId);

    // 1. Identify and validate the predecessor plan to adapt from
    let previousPlanId = payload.p_previous_plan_id || payload.previous_plan_id;
    if (!previousPlanId) {
      const activePlanSql = `SELECT id FROM plans WHERE user_id = ? AND is_active = 1 AND deleted_at IS NULL ORDER BY created_at DESC, rowid DESC LIMIT 1`;
      const activePlan = await this.adapter.queryOne(activePlanSql, [userId]);
      if (!activePlan || !activePlan.id) {
        throw new Error("No active plan found to adapt from");
      }
      previousPlanId = activePlan.id;
    } else {
      const checkPlanSql = `SELECT id FROM plans WHERE id = ? AND user_id = ? AND is_active = 1 AND deleted_at IS NULL LIMIT 1`;
      const validPlan = await this.adapter.queryOne(checkPlanSql, [previousPlanId, userId]);
      if (!validPlan) {
        throw new Error("Specified previous plan is not active or does not belong to user");
      }
    }

    // 2. Cross-tenant goal validation & race protection
    const goalId = payload.p_goal_id || payload.goal_id;
    if (!goalId) {
      throw new Error("Goal ID is required for adaptation");
    }
    const goalRow = await this.adapter.queryOne(`SELECT user_id, status FROM goals WHERE id = ?`, [goalId]);
    if (goalRow && goalRow.user_id !== userId) {
      throw new Error("Unauthorized: Cross-tenant goal access is prohibited.");
    }

    // 3. Idempotency Check: Same Event (matching Supabase adapt_plan RPC)
    const windowStart = payload.p_evaluation_window_start || payload.evaluation_window_start;
    const windowEnd = payload.p_evaluation_window_end || payload.evaluation_window_end;
    const existingSql = `
      SELECT resulting_plan_id, id 
      FROM adaptation_events 
      WHERE user_id = ? AND goal_id = ? AND evaluation_window_start = ? AND evaluation_window_end = ? 
      LIMIT 1
    `;
    const existingEvent = await this.adapter.queryOne(existingSql, [userId, goalId, windowStart, windowEnd]);
    if (existingEvent) {
      return {
        resulting_plan_id: existingEvent.resulting_plan_id,
        adaptation_event_id: existingEvent.id,
        is_newly_persisted: false
      };
    }

    const newPlanId = crypto.randomUUID();
    const eventId = crypto.randomUUID();

    // 4. Atomic batch execution
    // Deactivate existing active plans for this user to guarantee exactly ONE active plan
    const statements = [
      {
        sql: `UPDATE plans SET is_active = 0 WHERE user_id = ? AND is_active = 1`,
        params: [userId]
      },
      {
        sql: `
          INSERT INTO plans (id, user_id, goal, diet_type, level, calories, protein, workout, meals, is_active, provenance)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'adaptation')
        `,
        params: [
          newPlanId,
          userId,
          payload.p_plan_goal || payload.goal,
          payload.p_diet_type || payload.diet_type || payload.dietType,
          payload.p_level || payload.level,
          payload.p_calories || payload.calories,
          payload.p_protein || payload.protein,
          typeof payload.p_workout === 'object' ? JSON.stringify(payload.p_workout) : (payload.p_workout || (typeof payload.workout === 'object' ? JSON.stringify(payload.workout) : (payload.workout || null))),
          typeof payload.p_meals === 'object' ? JSON.stringify(payload.p_meals) : (payload.p_meals || (typeof payload.meals === 'object' ? JSON.stringify(payload.meals) : (payload.meals || null)))
        ]
      },
      {
        sql: `
          INSERT INTO adaptation_events (
            id, user_id, goal_id, evaluation_window_start, evaluation_window_end,
            previous_plan_id, resulting_plan_id,
            previous_calorie_target, proposed_calorie_target, final_calorie_target,
            current_weight, current_tdee, is_clamped, explanation_snapshot
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          eventId,
          userId,
          goalId,
          windowStart,
          windowEnd,
          previousPlanId,
          newPlanId,
          payload.p_previous_calorie_target ?? payload.previous_calorie_target,
          payload.p_proposed_calorie_target ?? payload.proposed_calorie_target,
          payload.p_final_calorie_target ?? payload.final_calorie_target,
          payload.p_current_weight ?? payload.current_weight,
          payload.p_current_tdee ?? payload.current_tdee,
          (payload.p_is_clamped || payload.is_clamped) ? 1 : 0,
          payload.p_explanation_snapshot !== undefined
            ? (typeof payload.p_explanation_snapshot === 'object' ? JSON.stringify(payload.p_explanation_snapshot) : String(payload.p_explanation_snapshot))
            : (payload.explanation_snapshot !== undefined
                ? (typeof payload.explanation_snapshot === 'object' ? JSON.stringify(payload.explanation_snapshot) : String(payload.explanation_snapshot))
                : '{}')
        ]
      }
    ];

    await this.adapter.batch(statements);

    return {
      resulting_plan_id: newPlanId,
      adaptation_event_id: eventId,
      is_newly_persisted: true
    };
  }

  /**
   * Retrieves the active plan for a user with parsed JSON fields.
   */
  async getActivePlan(userId) {
    this._validateUser(userId);
    const sql = `SELECT * FROM plans WHERE user_id = ? AND is_active = 1 AND deleted_at IS NULL ORDER BY created_at DESC, rowid DESC LIMIT 1`;
    const plan = await this.adapter.queryOne(sql, [userId]);
    return plan ? this._formatPlan(plan) : null;
  }

  /**
   * Retrieves all plans for a user with parsed JSON fields.
   */
  async getPlans(userId) {
    this._validateUser(userId);
    const sql = `
      SELECT id, goal, level, diet_type, calories, protein, workout, meals, is_active, provenance, created_at
      FROM plans 
      WHERE user_id = ? AND deleted_at IS NULL 
      ORDER BY created_at DESC, rowid DESC 
      LIMIT 50
    `;
    const rows = await this.adapter.query(sql, [userId]);
    return (rows || []).map((row) => this._formatPlan(row));
  }

  /**
   * Saves a new plan, deactivates previous active plans, and returns the formatted active plan.
   */
  async savePlan(userId, payload) {
    this._validateUser(userId);

    const newPlanId = crypto.randomUUID();

    const statements = [
      {
        sql: `UPDATE plans SET is_active = 0 WHERE user_id = ? AND is_active = 1`,
        params: [userId]
      },
      {
        sql: `
          INSERT INTO plans (id, user_id, goal, diet_type, level, calories, protein, workout, meals, is_active, provenance)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        `,
        params: [
          newPlanId,
          userId,
          payload.goal,
          payload.diet_type || payload.dietType,
          payload.level,
          payload.calories,
          payload.protein,
          typeof payload.workout === 'object' ? JSON.stringify(payload.workout) : (payload.workout || null),
          typeof payload.meals === 'object' ? JSON.stringify(payload.meals) : (payload.meals || null),
          payload.provenance || 'manual'
        ]
      }
    ];

    await this.adapter.batch(statements);
    
    return await this.getActivePlan(userId);
  }

  /**
   * Soft deletes a specific plan.
   */
  async deletePlan(userId, planId) {
    this._validateUser(userId);
    const sql = `UPDATE plans SET deleted_at = strftime('%s', 'now'), is_active = 0 WHERE id = ? AND user_id = ?`;
    await this.adapter.execute(sql, [planId, userId]);
  }

  /**
   * Clears all plans for a user.
   */
  async clearAllPlans(userId) {
    this._validateUser(userId);
    const sql = `UPDATE plans SET deleted_at = strftime('%s', 'now'), is_active = 0 WHERE user_id = ? AND deleted_at IS NULL`;
    await this.adapter.execute(sql, [userId]);
  }
}

// lib/repositories/NutritionRepository.js
import { BaseRepository } from './BaseRepository.js';

export class NutritionRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, 'nutrition_logs');
  }

  /**
   * Replaces PostgreSQL RPC: upsert_nutrition_log
   * Secures tenant isolation and explicitly queries the active plan to establish historical snapshots.
   */
  async getUpsertStatement(userId, logDate, calories, protein, water) {
    this._validateUser(userId);

    if (calories !== null && calories < 0) throw new Error("Calories out of bounds");
    if (protein !== null && protein < 0) throw new Error("Protein out of bounds");
    if (water !== null && water < 0) throw new Error("Water out of bounds");

    // Retrieve the active plan for target snapshots
    const planSql = `SELECT calories, protein FROM plans WHERE user_id = ? AND is_active = 1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`;
    const plan = await this.adapter.queryOne(planSql, [userId]);
    
    const targetCalories = plan ? plan.calories : null;
    const targetProtein = plan ? plan.protein : null;
    const newId = `nutri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const upsertSql = `
      INSERT INTO nutrition_logs (
        id, user_id, log_date, calories_consumed, protein_consumed, water_ml, 
        target_calories_snapshot, target_protein_snapshot, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))
      ON CONFLICT(user_id, log_date) DO UPDATE SET
        calories_consumed = excluded.calories_consumed,
        protein_consumed = excluded.protein_consumed,
        water_ml = excluded.water_ml,
        updated_at = strftime('%s', 'now')
    `;

    return {
      sql: upsertSql,
      params: [newId, userId, logDate, calories, protein, water, targetCalories, targetProtein]
    };
  }

  /**
   * Replaces PostgreSQL RPC: upsert_nutrition_log
   * Secures tenant isolation and explicitly queries the active plan to establish historical snapshots.
   */
  async upsertLog(userId, logDate, calories, protein, water) {
    const stmt = await this.getUpsertStatement(userId, logDate, calories, protein, water);
    await this.adapter.execute(stmt.sql, stmt.params);

    // Fetch the inserted/updated record
    const fetchSql = `SELECT * FROM nutrition_logs WHERE user_id = ? AND log_date = ? LIMIT 1`;
    return this.adapter.queryOne(fetchSql, [userId, logDate]);
  }

  /**
   * Fetches nutrition logs for a user within an optional date range.
   */
  async getNutrition(userId, startOrOptions = {}, maybeEnd = null) {
    this._validateUser(userId);

    let startDate = null;
    let endDate = null;
    if (typeof startOrOptions === 'string') {
      startDate = startOrOptions;
      endDate = maybeEnd;
    } else if (startOrOptions && typeof startOrOptions === 'object') {
      startDate = startOrOptions.startDate;
      endDate = startOrOptions.endDate;
    }

    let sql = `SELECT * FROM nutrition_logs WHERE user_id = ?`;
    const params = [userId];

    if (startDate) {
      sql += ` AND log_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND log_date <= ?`;
      params.push(endDate);
    }

    sql += ` ORDER BY log_date DESC`;

    return (await this.adapter.query(sql, params)) || [];
  }
}

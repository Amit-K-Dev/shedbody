import { BaseRepository } from "./BaseRepository.js";

/**
 * D1 Repository for EAV Metric Ledger.
 * Replaces Supabase MetricWriteAdapter.
 */
export class MetricRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, "metric_entries");
  }

  /**
   * Commits an array of metric changes securely in D1.
   * 
   * @param {string} userId - The authenticated user's ID
   * @param {string} logDate - YYYY-MM-DD calendar date
   * @param {Object} payload - Map of metric IDs to their new values (or null for clear)
   * @param {string} source - Source of the write ('manual', 'device', 'system')
   */
  async getCommitStatements(userId, logDate, payload, source = 'manual') {
    this._validateUser(userId);

    if (!logDate) {
      throw new Error("Missing required context (logDate).");
    }

    const statements = [];
    
    // We only need to fetch plans if calories or protein are being modified
    let activePlan = null;
    let fetchedPlan = false;

    // Define valid metrics and their mapping constraints
    const metricConstraints = {
      weight: { type: 'numeric' },
      body_fat: { type: 'numeric' },
      calories: { type: 'numeric', requiresSnapshot: true },
      protein: { type: 'numeric', requiresSnapshot: true },
      water: { type: 'numeric' },
      steps: { type: 'numeric' },
      sleep: { type: 'numeric' },
      workout: { type: 'boolean' }
    };

    for (const [metricId, value] of Object.entries(payload)) {
      if (value === undefined) continue; // Sparse update: Ignore omitted fields
      if (!metricConstraints[metricId]) continue; // Ignore unknown metrics

      const constraint = metricConstraints[metricId];
      let valueNumeric = null;
      let isDeleted = false;

      // Handle explicit clear (tombstone)
      if (value === null || value === "") {
        isDeleted = true;
      } else {
        // Parse value based on expected type
        if (constraint.type === 'boolean') {
          valueNumeric = value ? 1.0 : 0.0;
        } else {
          valueNumeric = Number(value);
          if (isNaN(valueNumeric) || !Number.isFinite(valueNumeric)) {
            console.error(`Invalid numeric value for metric ${metricId}:`, value);
            continue; // Skip invalid values
          }
        }
      }

      // Metadata for target snapshots
      let metadata = null;
      if (constraint.requiresSnapshot && !isDeleted) {
        if (!fetchedPlan) {
          activePlan = await this.adapter.queryOne(
            `SELECT calories, protein FROM plans 
             WHERE user_id = ? AND is_active = 1 AND deleted_at IS NULL 
             ORDER BY created_at DESC LIMIT 1`,
            [userId]
          );
          fetchedPlan = true;
        }

        if (activePlan) {
          metadata = JSON.stringify({
            target_calories_snapshot: activePlan.calories,
            target_protein_snapshot: activePlan.protein
          });
        }
      }

      // Instead of an insert, use an UPSERT (ON CONFLICT) so we overwrite multiple writes for the same metric on the same day if deleted_at is null.
      // But wait! metric_entries id is random uuid, and we don't have a unique constraint on (user_id, metric_id, log_date). 
      // Actually, wait, let's look at the schema for metric_entries in D1:
      // CREATE INDEX "idx_metric_entries_user_metric_date" ON "metric_entries"("user_id", "metric_id", "log_date");
      // It's not a unique index. So we do an INSERT, just like Supabase MetricWriteAdapter did.
      // We rely on vw_metric_entries_latest to read the newest one.
      
      const id = crypto.randomUUID();
      
      statements.push({
        sql: `INSERT INTO metric_entries 
              (id, user_id, metric_id, log_date, value_numeric, source, metadata, deleted_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          id,
          userId,
          metricId,
          logDate,
          isDeleted ? null : valueNumeric,
          source,
          metadata,
          isDeleted ? Math.floor(Date.now() / 1000) : null
        ]
      });
    }

    return statements;
  }

  async commit(userId, logDate, payload, source = 'manual') {
    const statements = await this.getCommitStatements(userId, logDate, payload, source);
    if (statements.length === 0) return { success: true }; // Nothing to do

    // Bulk atomic insert using batch
    try {
      await this.adapter.batch(statements);
      return { success: true };
    } catch (error) {
      console.error("[MetricRepository] Bulk insert failed:", error);
      throw error;
    }
  }

  async _fetchAndPivot(userId, metricIds, { startDate, endDate, limit, orderAsc = false } = {}) {
    this._validateUser(userId);
    if (!metricIds || metricIds.length === 0) return [];

    let sql = `SELECT metric_id, log_date, value_numeric, deleted_at, id, created_at 
               FROM vw_metric_entries_latest 
               WHERE user_id = ? AND metric_id IN (${metricIds.map(() => '?').join(',')}) AND deleted_at IS NULL`;
    const params = [userId, ...metricIds];

    if (startDate) {
      sql += ` AND log_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND log_date <= ?`;
      params.push(endDate);
    }

    sql += ` ORDER BY log_date ${orderAsc ? 'ASC' : 'DESC'}`;

    const data = await this.adapter.query(sql, params);
    if (!data || data.length === 0) return [];

    const grouped = new Map();
    for (const row of data) {
      if (!grouped.has(row.log_date)) {
        grouped.set(row.log_date, { log_date: row.log_date, _metadata: {} });
      }
      grouped.get(row.log_date)[row.metric_id] = row.value_numeric;
      grouped.get(row.log_date)._metadata[row.metric_id] = {
        id: row.id,
        created_at: row.created_at
      };
    }

    const results = Array.from(grouped.values());
    if (limit) {
      return results.slice(0, limit);
    }
    return results;
  }

  async getProgress(userId, options = {}) {
    this._validateUser(userId);
    const raw = await this._fetchAndPivot(userId, ['weight', 'body_fat'], options);
    return raw.map(row => {
      const out = { entry_date: row.log_date, notes: null };
      if (row.weight !== undefined) {
        out.weight = row.weight;
        out.id = row._metadata.weight.id;
        out.created_at = row._metadata.weight.created_at;
      } else if (row.body_fat !== undefined) {
        out.id = row._metadata.body_fat.id;
        out.created_at = row._metadata.body_fat.created_at;
      }
      if (row.body_fat !== undefined) out.body_fat = row.body_fat;
      return out;
    });
  }

  async getNutrition(userId, options = {}) {
    this._validateUser(userId);
    const raw = await this._fetchAndPivot(userId, ['calories', 'protein', 'water'], options);
    return raw.map(row => {
      const out = { log_date: row.log_date };
      if (row.calories !== undefined) out.calories_consumed = row.calories;
      if (row.protein !== undefined) out.protein_consumed = row.protein;
      if (row.water !== undefined) out.water_ml = row.water;
      return out;
    });
  }

  async getLifestyle(userId, options = {}) {
    this._validateUser(userId);
    const raw = await this._fetchAndPivot(userId, ['steps', 'sleep', 'workout'], options);
    return raw.map(row => {
      const out = { log_date: row.log_date };
      if (row.steps !== undefined) out.steps_count = row.steps;
      if (row.sleep !== undefined) out.sleep_hours = row.sleep;
      if (row.workout !== undefined) {
        if (row.workout === 1.0) out.workout_completed = true;
        else if (row.workout === 0.0) out.workout_completed = false;
      }
      return out;
    });
  }

  async getLatestAnchors(userId) {
    this._validateUser(userId);
    const metrics = ['workout', 'steps', 'sleep', 'water', 'protein', 'weight'];
    
    // In SQLite, we can just run a separate query for each metric (no parallelism via batch needed for simple queries, but we can do it via loop)
    const latest = {};
    for (const metric of metrics) {
      const row = await this.adapter.queryOne(
        `SELECT metric_id, log_date, value_numeric 
         FROM vw_metric_entries_latest 
         WHERE user_id = ? AND metric_id = ? AND deleted_at IS NULL AND value_numeric > 0 
         ORDER BY log_date DESC LIMIT 1`,
        [userId, metric]
      );
      if (row) {
        latest[metric] = row;
      }
    }

    return {
      lifestyleLogs: [
        latest['workout'] ? { log_date: latest['workout'].log_date, workout_completed: true } : null,
        latest['steps'] ? { log_date: latest['steps'].log_date, steps_count: latest['steps'].value_numeric } : null,
        latest['sleep'] ? { log_date: latest['sleep'].log_date, sleep_hours: latest['sleep'].value_numeric } : null
      ].filter(Boolean),

      nutritionLogs: [
        latest['water'] ? { log_date: latest['water'].log_date, water_ml: latest['water'].value_numeric } : null,
        latest['protein'] ? { log_date: latest['protein'].log_date, protein_consumed: latest['protein'].value_numeric } : null
      ].filter(Boolean),

      habitEntries: [], 
      progressEntries: [
        latest['weight'] ? { entry_date: latest['weight'].log_date, weight: latest['weight'].value_numeric } : null
      ].filter(Boolean)
    };
  }
}

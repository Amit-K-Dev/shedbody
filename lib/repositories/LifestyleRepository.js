import { BaseRepository } from './BaseRepository.js';

export class LifestyleRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, 'lifestyle_logs');
  }

  /**
   * Replaces PostgreSQL RPC: upsert_lifestyle_log
   * Secures tenant isolation and explicitly inserts/updates lifestyle metrics.
   */
  async getUpsertStatement(userId, logDate, workoutCompleted, stepsCount, sleepHours) {
    this._validateUser(userId);

    if (stepsCount !== null && stepsCount < 0) throw new Error("Steps out of bounds");
    if (sleepHours !== null && sleepHours < 0) throw new Error("Sleep out of bounds");
    
    // Validate bounds based on schema
    if (stepsCount !== null && stepsCount > 100000) throw new Error("Steps out of bounds");
    if (sleepHours !== null && sleepHours > 24) throw new Error("Sleep out of bounds");

    const newId = `life_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // SQLite has no boolean, map to 0/1, or null
    let workoutInt = null;
    if (workoutCompleted === true) workoutInt = 1;
    else if (workoutCompleted === false) workoutInt = 0;

    const upsertSql = `
      INSERT INTO lifestyle_logs (
        id, user_id, log_date, workout_completed, steps_count, sleep_hours, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))
      ON CONFLICT(user_id, log_date) DO UPDATE SET
        workout_completed = excluded.workout_completed,
        steps_count = excluded.steps_count,
        sleep_hours = excluded.sleep_hours,
        updated_at = strftime('%s', 'now')
    `;

    return {
      sql: upsertSql,
      params: [newId, userId, logDate, workoutInt, stepsCount, sleepHours]
    };
  }

  /**
   * Replaces PostgreSQL RPC: upsert_lifestyle_log
   * Secures tenant isolation and explicitly inserts/updates lifestyle metrics.
   */
  async upsertLog(userId, logDate, workoutCompleted, stepsCount, sleepHours) {
    const stmt = await this.getUpsertStatement(userId, logDate, workoutCompleted, stepsCount, sleepHours);
    await this.adapter.execute(stmt.sql, stmt.params);

    // Fetch the inserted/updated record
    const fetchSql = `SELECT * FROM lifestyle_logs WHERE user_id = ? AND log_date = ? LIMIT 1`;
    const result = await this.adapter.queryOne(fetchSql, [userId, logDate]);
    
    // Map boolean back for the application
    if (result) {
      if (result.workout_completed === 1) result.workout_completed = true;
      else if (result.workout_completed === 0) result.workout_completed = false;
    }
    
    return result;
  }

  /**
   * Fetches lifestyle logs for a user within an optional date range.
   */
  async getLifestyle(userId, startOrOptions = {}, maybeEnd = null) {
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

    let sql = `SELECT * FROM lifestyle_logs WHERE user_id = ?`;
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

    const rows = await this.adapter.query(sql, params);
    return (rows || []).map(row => ({
      ...row,
      workout_completed: row.workout_completed === 1 ? true : row.workout_completed === 0 ? false : null
    }));
  }
}

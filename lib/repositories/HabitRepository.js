import { BaseRepository } from "./BaseRepository.js";

/**
 * D1 Repository for Habits domain.
 */
export class HabitRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, "habit_entries");
  }

  /**
   * Upserts a habit entry.
   * 
   * @param {string} userId - The authenticated user's ID
   * @param {string} habitName - Valid habit name
   * @param {string} logDate - YYYY-MM-DD
   * @param {boolean} completed - Whether it was completed
   */
  async upsertHabitEntry(userId, habitName, logDate, completed) {
    const stmt = this.getUpsertStatement(userId, habitName, logDate, completed);
    return await this.adapter.execute(stmt.sql, stmt.params);
  }

  /**
   * Generates upsert statement object for batch operations.
   */
  getUpsertStatement(userId, habitName, logDate, completed) {
    this._validateUser(userId);

    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const completedInt = completed ? 1 : 0;

    const sql = `
      INSERT INTO habit_entries (id, user_id, habit_name, log_date, completed)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, habit_name, log_date) 
      DO UPDATE SET 
        completed = excluded.completed,
        updated_at = strftime('%s', 'now')
    `;

    return {
      sql,
      params: [id, userId, habitName, logDate, completedInt]
    };
  }

  /**
   * Fetches habits for a user within an optional date range.
   */
  async getHabits(userId, startOrOptions = {}, maybeEnd = null) {
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

    let sql = `SELECT * FROM habit_entries WHERE user_id = ?`;
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

    const data = await this.adapter.query(sql, params);
    return (data || []).map(row => ({
      ...row,
      completed: row.completed === 1
    }));
  }
}

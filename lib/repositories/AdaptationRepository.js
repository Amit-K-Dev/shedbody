import { BaseRepository } from "./BaseRepository.js";

/**
 * D1 Repository for Adaptation events.
 */
export class AdaptationRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, "adaptation_events");
  }

  /**
   * Fetches recent adaptation events for a user with ISO string timestamps.
   */
  async getAdaptationEvents(userId, limit = 5) {
    this._validateUser(userId);

    const sql = `
      SELECT id, created_at 
      FROM adaptation_events 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;

    const data = await this.adapter.query(sql, [userId, limit]);
    return (data || []).map(row => {
      let createdAt = row.created_at;
      if (typeof createdAt === 'number' || (typeof createdAt === 'string' && /^\d+$/.test(createdAt))) {
        const num = Number(createdAt);
        createdAt = new Date(num < 1e11 ? num * 1000 : num).toISOString();
      }
      return {
        id: row.id,
        created_at: createdAt
      };
    });
  }

  /**
   * Finds an adaptation event by ID and validates user ownership.
   */
  async findById(id, userId) {
    this._validateUser(userId);
    const sql = `SELECT * FROM adaptation_events WHERE id = ? AND user_id = ? LIMIT 1`;
    return await this.adapter.queryOne(sql, [id, userId]);
  }

  /**
   * Checks for an existing adaptation event matching evaluation window.
   */
  async findIdempotentEvent(userId, goalId, windowStart, windowEnd) {
    this._validateUser(userId);
    const sql = `
      SELECT resulting_plan_id, id 
      FROM adaptation_events 
      WHERE user_id = ? AND goal_id = ? AND evaluation_window_start = ? AND evaluation_window_end = ? 
      LIMIT 1
    `;
    return await this.adapter.queryOne(sql, [userId, goalId, windowStart, windowEnd]);
  }
}

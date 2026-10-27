// lib/repositories/BaseRepository.js

/**
 * BaseRepository enforces tenant isolation (RLS equivalent) at the application layer.
 * All domain repositories must extend this class.
 */
export class BaseRepository {
  /**
   * @param {import('./D1Adapter').D1Adapter} adapter 
   * @param {string} tableName 
   */
  constructor(adapter, tableName) {
    if (!adapter) throw new Error("D1Adapter is required");
    if (!tableName) throw new Error("tableName is required");
    
    this.adapter = adapter;
    this.tableName = tableName;
  }

  /**
   * Ensures that user_id is provided for every query.
   * This is our application-level Row Level Security (RLS).
   */
  _validateUser(userId) {
    if (!userId) {
      throw new Error("SECURITY FAULT: user_id is required for tenant isolation.");
    }
  }

  /**
   * Fetch a single record belonging to a user.
   */
  async findById(id, userId) {
    this._validateUser(userId);
    const sql = `SELECT * FROM "${this.tableName}" WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1`;
    return this.adapter.queryOne(sql, [id, userId]);
  }

  /**
   * Fetch all active records for a user.
   */
  async findAll(userId, limit = 100) {
    this._validateUser(userId);
    const sql = `SELECT * FROM "${this.tableName}" WHERE user_id = ? AND deleted_at IS NULL LIMIT ?`;
    return this.adapter.query(sql, [userId, limit]);
  }

  /**
   * Soft-delete a record securely.
   */
  async delete(id, userId) {
    this._validateUser(userId);
    const sql = `UPDATE "${this.tableName}" SET deleted_at = strftime('%s', 'now'), updated_at = strftime('%s', 'now') WHERE id = ? AND user_id = ?`;
    return this.adapter.execute(sql, [id, userId]);
  }
}

import { BaseRepository } from "./BaseRepository.js";

/**
 * D1 Repository for Notifications domain.
 */
export class NotificationRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, "notifications");
  }

  /**
   * Get notifications for a user.
   * 
   * @param {string} userId 
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getNotifications(userId, limit = 50) {
    this._validateUser(userId);
    
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    
    const rows = await this.adapter.query(sql, [userId, limit]);
    
    // Convert is_read from 0/1 to boolean to match Supabase API
    return (rows || []).map(row => ({
      ...row,
      is_read: row.is_read === 1
    }));
  }

  /**
   * Get unread count for a user.
   * 
   * @param {string} userId 
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    this._validateUser(userId);
    
    const sql = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `;
    
    const result = await this.adapter.queryOne(sql, [userId]);
    return result ? result.count : 0;
  }

  /**
   * Mark all notifications as read for a user.
   * 
   * @param {string} userId 
   */
  async markAllAsRead(userId) {
    this._validateUser(userId);
    
    const sql = `
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ? AND is_read = 0
    `;
    
    return await this.adapter.execute(sql, [userId]);
  }

  /**
   * Mark a specific notification as read.
   * 
   * @param {string} userId 
   * @param {string} notificationId 
   */
  async markAsRead(userId, notificationId) {
    this._validateUser(userId);
    
    const sql = `
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ? AND id = ?
    `;
    
    return await this.adapter.execute(sql, [userId, notificationId]);
  }

  /**
   * Upsert notification candidates.
   * 
   * @param {string} userId 
   * @param {Array} candidates 
   */
  async upsertCandidates(userId, candidates) {
    this._validateUser(userId);
    
    if (!candidates || candidates.length === 0) return true;

    // We can use batch for multiple upserts
    const statements = candidates.map(candidate => {
      return {
        sql: `
          INSERT INTO notifications (id, user_id, type, title, message, action_url, created_at, deterministic_key)
          VALUES (?, ?, ?, ?, ?, ?, strftime('%s', 'now'), ?)
          ON CONFLICT(user_id, deterministic_key) DO NOTHING
        `,
        params: [
          candidate.id || crypto.randomUUID(),
          candidate.user_id,
          candidate.type,
          candidate.title,
          candidate.message,
          candidate.action_url || null,
          candidate.deterministic_key
        ]
      };
    });

    await this.adapter.batch(statements);
    return true;
  }

  /**
   * Create a single notification.
   */
  async createNotification({ userId, type, title, message, actionUrl, action_url, deterministicKey, deterministic_key }) {
    this._validateUser(userId);
    const id = crypto.randomUUID();
    const dKey = deterministicKey || deterministic_key || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const aUrl = actionUrl || action_url || null;

    const sql = `
      INSERT INTO notifications (id, user_id, type, title, message, action_url, created_at, deterministic_key)
      VALUES (?, ?, ?, ?, ?, ?, strftime('%s', 'now'), ?)
      ON CONFLICT(user_id, deterministic_key) DO NOTHING
    `;

    await this.adapter.execute(sql, [id, userId, type, title, message, aUrl, dKey]);
    return { id, success: true };
  }
}

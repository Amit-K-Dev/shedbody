// lib/repositories/GoalRepository.js
import { BaseRepository } from './BaseRepository.js';

export class GoalRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, 'goals');
  }

  /**
   * Fetch a single goal belonging to a user.
   * Overrides BaseRepository.findById to avoid the non-existent deleted_at column on goals.
   */
  async findById(id, userId) {
    this._validateUser(userId);
    const sql = `SELECT * FROM goals WHERE id = ? AND user_id = ? LIMIT 1`;
    return this.adapter.queryOne(sql, [id, userId]);
  }

  /**
   * Replaces PostgreSQL RPC: create_weight_goal
   * Uses D1 batching to achieve transactional integrity without advisory locks.
   */
  async createWeightGoal(userId, targetValue) {
    this._validateUser(userId);
    
    if (!targetValue || targetValue <= 0) {
      throw new Error("target_value must be greater than 0");
    }

    // 1. Fetch current active goal
    const currentGoalSql = `SELECT * FROM goals WHERE user_id = ? AND domain = 'weight' AND status = 'active'`;
    const currentGoal = await this.adapter.queryOne(currentGoalSql, [userId]);
    
    if (currentGoal && currentGoal.target_value === targetValue) {
      // Idempotent return: synchronize profile cache via UPSERT matching Supabase RPC semantics
      await this.adapter.execute(
        `INSERT INTO user_profiles (user_id, target_weight, updated_at)
         VALUES (?, ?, strftime('%s', 'now'))
         ON CONFLICT(user_id) DO UPDATE SET
           target_weight = excluded.target_weight,
           updated_at = strftime('%s', 'now')`,
        [userId, targetValue]
      );
      return currentGoal;
    }

    // 2. Fetch start value (from latest progress or user_profiles)
    const startValueSql = `
      SELECT value_numeric as weight 
      FROM metric_entries 
      WHERE user_id = ? AND metric_id = 'weight' AND deleted_at IS NULL 
      ORDER BY log_date DESC, recorded_at DESC LIMIT 1
    `;
    let startValueRow = await this.adapter.queryOne(startValueSql, [userId]);
    
    if (!startValueRow) {
      const profileSql = `SELECT weight FROM user_profiles WHERE user_id = ?`;
      startValueRow = await this.adapter.queryOne(profileSql, [userId]);
    }
    
    const startValue = startValueRow ? startValueRow.weight : null;

    // 3. Prepare Batch Statements using standard adapter statement objects { sql, params }
    const statements = [];

    // Abandon old goal if exists
    if (currentGoal) {
      statements.push({
        sql: `UPDATE goals SET status = 'abandoned', updated_at = strftime('%s', 'now') WHERE id = ? AND user_id = ?`,
        params: [currentGoal.id, userId]
      });
    }

    // Insert new goal
    const newGoalId = crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];
    
    statements.push({
      sql: `INSERT INTO goals (id, user_id, domain, start_value, target_value, start_date, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))`,
      params: [newGoalId, userId, 'weight', startValue, targetValue, today, 'active']
    });

    // Sync profile via UPSERT matching Supabase RPC semantics
    statements.push({
      sql: `INSERT INTO user_profiles (user_id, target_weight, updated_at)
            VALUES (?, ?, strftime('%s', 'now'))
            ON CONFLICT(user_id) DO UPDATE SET
              target_weight = excluded.target_weight,
              updated_at = strftime('%s', 'now')`,
      params: [userId, targetValue]
    });

    // Execute Batch
    await this.adapter.batch(statements);

    // Return the newly created goal via overridden findById
    return this.findById(newGoalId, userId);
  }

  /**
   * Gets the active goal for a specific domain.
   */
  async getActiveGoal(userId, domain = 'weight') {
    this._validateUser(userId);
    const sql = `SELECT * FROM goals WHERE user_id = ? AND domain = ? AND status = 'active' ORDER BY created_at DESC, rowid DESC LIMIT 1`;
    return this.adapter.queryOne(sql, [userId, domain]);
  }

  /**
   * Gets the goal history for a specific domain.
   */
  async getGoalHistory(userId, domain = 'weight') {
    this._validateUser(userId);
    const sql = `SELECT * FROM goals WHERE user_id = ? AND domain = ? ORDER BY created_at DESC, rowid DESC`;
    return this.adapter.query(sql, [userId, domain]);
  }

  /**
   * Sets a goal for a domain, abandoning previous active goals.
   */
  async setGoal(userId, domain = 'weight', targetValue, startDate = null, targetDate = null) {
    this._validateUser(userId);
    
    if (!targetValue || targetValue <= 0) {
      throw new Error("target_value must be greater than 0");
    }

    const today = startDate || new Date().toISOString().split('T')[0];
    const newGoalId = crypto.randomUUID();

    const statements = [
      {
        sql: `UPDATE goals SET status = 'abandoned', updated_at = strftime('%s', 'now') WHERE user_id = ? AND domain = ? AND status = 'active'`,
        params: [userId, domain]
      },
      {
        sql: `INSERT INTO goals (id, user_id, domain, target_value, start_date, target_date, status, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, 'active', strftime('%s', 'now'), strftime('%s', 'now'))`,
        params: [newGoalId, userId, domain, targetValue, today, targetDate]
      }
    ];

    if (domain === 'weight') {
      statements.push({
        sql: `INSERT INTO user_profiles (user_id, target_weight, updated_at)
              VALUES (?, ?, strftime('%s', 'now'))
              ON CONFLICT(user_id) DO UPDATE SET
                target_weight = excluded.target_weight,
                updated_at = strftime('%s', 'now')`,
        params: [userId, targetValue]
      });
    }

    await this.adapter.batch(statements);
    return this.findById(newGoalId, userId);
  }
}

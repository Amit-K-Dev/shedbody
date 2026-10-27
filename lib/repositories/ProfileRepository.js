import { BaseRepository } from "./BaseRepository.js";

export class ProfileRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, "user_profiles");
  }

  /**
   * Fetches the user profile metrics (streak, gamification level)
   */
  async getProfileStats(userId) {
    this._validateUser(userId);
    const sql = `SELECT streak_count, gamification_level, weight, target_weight, height, xp 
       FROM user_profiles 
       WHERE user_id = ? 
       LIMIT 1`;
    const result = await this.adapter.queryOne(sql, [userId]);
    return result || null;
  }

  /**
   * Fetches the full user profile
   */
  async getProfile(userId) {
    this._validateUser(userId);
    const sql = `SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1`;
    const result = await this.adapter.queryOne(sql, [userId]);
    return result || null;
  }

  /**
   * Upserts the user profile
   */
  async upsertProfile(userId, profile) {
    this._validateUser(userId);

    const query = `
      INSERT INTO user_profiles (user_id, goal, weight, height, age, diet_type, level, gender, unit_system, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
      ON CONFLICT(user_id) DO UPDATE SET 
        goal = EXCLUDED.goal,
        weight = EXCLUDED.weight,
        height = EXCLUDED.height,
        age = EXCLUDED.age,
        diet_type = EXCLUDED.diet_type,
        level = EXCLUDED.level,
        gender = EXCLUDED.gender,
        unit_system = EXCLUDED.unit_system,
        updated_at = strftime('%s', 'now')
    `;

    await this.adapter.execute(query, [
      userId,
      profile.goal || 'maintain',
      profile.weight || null,
      profile.height || null,
      profile.age || null,
      profile.diet_type || null,
      profile.level || null,
      profile.gender || null,
      profile.unit_system || 'metric'
    ]);
    
    return await this.getProfile(userId);
  }

  /**
   * Updates global reminder settings in the user profile
   */
  async updateReminderSettings(userId, enabled, time) {
    this._validateUser(userId);
    const query = `
      UPDATE user_profiles
      SET 
        reminder_enabled = ?,
        reminder_time = ?,
        updated_at = strftime('%s', 'now')
      WHERE user_id = ?
    `;
    // SQLite uses 1/0 for booleans.
    const enabledInt = enabled ? 1 : 0;
    const timeStr = time || '20:00:00';
    
    await this.adapter.execute(query, [enabledInt, timeStr, userId]);
    return true;
  }

  /**
   * Fetches public profile data (used for leaderboards, experts, etc.)
   * Since it's public, it can take an explicit targetUserId if needed,
   * but for the logged-in user it uses this.userId.
   * Since it's public, it doesn't strictly need isolation, but we pass the targetUserId.
   */
  async getPublicProfile(targetUserId) {
    this._validateUser(targetUserId);
    const sql = `SELECT id, display_name, bio, avatar_url, role 
        FROM public_profiles 
        WHERE id = ? 
        LIMIT 1`;
    const result = await this.adapter.queryOne(sql, [targetUserId]);
    return result || null;
  }

  /**
   * Fetches the number of plans saved by the user
   */
  async getSavedPlansCount(userId) {
    this._validateUser(userId);
    const sql = `SELECT COUNT(id) as count 
       FROM plans 
       WHERE user_id = ?`;
    const result = await this.adapter.queryOne(sql, [userId]);
    return result?.count || 0;
  }

  /**
   * Fetches notification/profile preferences
   */
  async getPreferences(userId) {
    this._validateUser(userId);
    const sql = `SELECT workout_reminders, goal_reminders, habit_reminders, weekly_progress, plan_updates 
       FROM notification_preferences 
       WHERE user_id = ? 
       LIMIT 1`;
    const data = await this.adapter.queryOne(sql, [userId]);
    return {
      workout_reminders: data?.workout_reminders === 0 ? false : (data?.workout_reminders === 1 ? true : true),
      goal_reminders: data?.goal_reminders === 0 ? false : (data?.goal_reminders === 1 ? true : true),
      habit_reminders: data?.habit_reminders === 0 ? false : (data?.habit_reminders === 1 ? true : true),
      weekly_progress: data?.weekly_progress === 0 ? false : (data?.weekly_progress === 1 ? true : true),
      plan_updates: data?.plan_updates === 0 ? false : (data?.plan_updates === 1 ? true : true),
    };
  }

  /**
   * Updates notification/profile preferences (Upsert)
   */
  async updatePreferences(userId, updates) {
    this._validateUser(userId);
    const fields = [];
    const values = [];
    const settableFields = [
      'workout_reminders', 
      'goal_reminders', 
      'habit_reminders', 
      'weekly_progress', 
      'plan_updates'
    ];

    for (const field of settableFields) {
      if (updates[field] !== undefined) {
        fields.push(field);
        values.push(updates[field] ? 1 : 0);
      }
    }

    if (fields.length === 0) return true;

    // For the INSERT part
    const placeholders = fields.map(() => '?').join(', ');
    
    // For the UPDATE part
    const updateClauses = fields.map(f => `${f} = EXCLUDED.${f}`).join(', ');

    const query = `
      INSERT INTO notification_preferences (user_id, ${fields.join(", ")})
      VALUES (?, ${placeholders})
      ON CONFLICT(user_id) DO UPDATE SET 
        ${updateClauses},
        updated_at = CURRENT_TIMESTAMP
    `;

    // Values: [user_id, ...fieldValues]
    await this.adapter.execute(query, [userId, ...values]);
    return true;
  }

  /**
   * Updates streak based on last active date
   */
  async processStreak(userId) {
    this._validateUser(userId);
    const sql = `SELECT streak_count, last_active_date FROM user_profiles WHERE user_id = ? LIMIT 1`;
    const profile = await this.adapter.queryOne(sql, [userId]);
    if (!profile) return null;

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const lastDate = profile.last_active_date;
    let newStreak = profile.streak_count || 0;

    if (!lastDate) {
      newStreak = 1;
    } else if (lastDate === todayKey) {
      return newStreak;
    } else if (lastDate === yesterdayKey) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    await this.adapter.execute(
      `UPDATE user_profiles SET streak_count = ?, last_active_date = ? WHERE user_id = ?`,
      [newStreak, todayKey, userId]
    );

    return newStreak;
  }

  /**
   * Adds XP to a user's profile and processes level ups
   */
  async addXP(userId, amount) {
    this._validateUser(userId);
    const sql = `SELECT xp, gamification_level FROM user_profiles WHERE user_id = ? LIMIT 1`;
    const profile = await this.adapter.queryOne(sql, [userId]);
    if (!profile) return null;

    let currentXP = profile.xp || 0;
    let currentLevel = profile.gamification_level || 1;

    currentXP += amount;

    // Level formula: level * 100 XP to next level
    let nextLevelXP = currentLevel * 100;
    while (currentXP >= nextLevelXP) {
      currentXP -= nextLevelXP;
      currentLevel += 1;
      nextLevelXP = currentLevel * 100;
    }

    await this.adapter.execute(
      `UPDATE user_profiles SET xp = ?, gamification_level = ? WHERE user_id = ?`,
      [currentXP, currentLevel, userId]
    );

    return { xp: currentXP, level: currentLevel, leveledUp: currentLevel > (profile.gamification_level || 1) };
  }

  /**
   * Awards a badge to the user if they don't already have it
   */
  async awardBadge(userId, badgeName) {
    this._validateUser(userId);
    const sql = `SELECT id FROM badges WHERE name = ? LIMIT 1`;
    const badge = await this.adapter.queryOne(sql, [badgeName]);
    if (!badge) return false;

    // Use INSERT IGNORE equivalent: ON CONFLICT DO NOTHING
    const query = `
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (?, ?)
      ON CONFLICT(user_id, badge_id) DO NOTHING
    `;

    await this.adapter.execute(query, [userId, badge.id]);
    return true;
  }

  /**
   * Updates last_notification_sync for the user.
   */
  async updateLastNotificationSync(userId) {
    this._validateUser(userId);
    
    const query = `
      UPDATE user_profiles 
      SET last_notification_sync = CURRENT_TIMESTAMP 
      WHERE user_id = ?
    `;
    
    await this.adapter.execute(query, [userId]);
    return true;
  }

  /**
   * Fetches users eligible for notification sync (cron usage only).
   */
  async getUsersForNotificationSync(limit = 50) {
    const sql = `
      SELECT user_id 
      FROM user_profiles 
      ORDER BY last_notification_sync ASC NULLS FIRST 
      LIMIT ?
    `;
    const result = await this.adapter.query(sql, [limit]);
    return result || [];
  }
}

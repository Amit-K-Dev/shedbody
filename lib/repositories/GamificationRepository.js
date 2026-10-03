import { getDbClient } from "../db/index.js";

/**
 * Data Access Layer for User Gamification (XP and Streaks).
 */
export class GamificationRepository {
  /**
   * Adds XP to a user and calculates level ups.
   *
   * @param {string} userId - The authenticated user's ID
   * @param {number} xpAmount - Amount of XP to add
   * @param {Object} [dbClient] - Optional injected db client
   * @returns {Promise<Object>} { xp, level }
   */
  static async addUserXp(userId, xpAmount, dbClient = null) {
    if (!userId) throw new Error("Unauthorized: userId is required");
    if (typeof xpAmount !== 'number' || xpAmount < 0) {
      throw new Error("xpAmount must be a non-negative number");
    }

    const db = dbClient || await getDbClient();
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // 1. Fetch current XP and Level
      const { data: profile, error: fetchError } = await db
        .from("user_profiles")
        .select("xp, gamification_level, last_weight_log_xp_date")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("[GamificationRepository] Error fetching profile for XP:", fetchError);
        throw fetchError;
      }
      if (!profile) {
        throw new Error(`Profile not found for user ${userId}. It may not exist or is hidden by RLS.`);
      }

      const todayDate = new Date();
      const todayStr = todayDate.toISOString().split('T')[0];
      const oldXpDate = profile.last_weight_log_xp_date;

      // Idempotency check: if already awarded today, return early
      if (oldXpDate === todayStr) {
        return { xp: profile.xp || 0, level: profile.gamification_level || 1 };
      }

      let currentXp = profile.xp || 0;
      let currentLevel = profile.gamification_level || 1;

      const oldXp = currentXp; // Store for OCC

      currentXp += Math.max(xpAmount, 0);
      let threshold = currentLevel * 100;

      // Calculate level ups
      while (currentXp >= threshold) {
        currentXp -= threshold;
        currentLevel += 1;
        threshold = currentLevel * 100;
      }

      // 2. Update profile with OCC
      let query = db
        .from("user_profiles")
        .update({
          xp: currentXp,
          gamification_level: currentLevel,
          last_weight_log_xp_date: todayStr,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("xp", oldXp); // OCC Condition

      if (oldXpDate === null) {
        query = query.is("last_weight_log_xp_date", null);
      } else {
        query = query.eq("last_weight_log_xp_date", oldXpDate);
      }

      const { data: updatedProfiles, error: updateError } = await query.select();

      if (updateError) {
        console.error("[GamificationRepository] Error updating XP:", updateError);
        throw updateError;
      }

      if (updatedProfiles && updatedProfiles.length > 0) {
        return { xp: currentXp, level: currentLevel };
      }
      // If zero rows updated, it means 'xp' changed concurrently. Loop and retry.
    }

    throw new Error("Failed to add user XP due to concurrent modifications after max retries.");
  }

  /**
   * Updates a user's streak based on their last active date.
   *
   * @param {string} userId - The authenticated user's ID
   * @param {Object} [dbClient] - Optional injected db client
   * @returns {Promise<number>} new streak
   */
  static async updateUserStreak(userId, dbClient = null) {
    if (!userId) throw new Error("Unauthorized: userId is required");

    const db = dbClient || await getDbClient();
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // 1. Fetch current streak data
      const { data: profile, error: fetchError } = await db
        .from("user_profiles")
        .select("last_active_date, streak_count")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("[GamificationRepository] Error fetching profile for streak:", fetchError);
        throw fetchError;
      }
      if (!profile) {
        throw new Error(`Profile not found for user ${userId}. It may not exist or is hidden by RLS.`);
      }

      const todayDate = new Date();
      const todayStr = todayDate.toISOString().split('T')[0];
      
      const yesterdayDate = new Date(todayDate);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

      const lastDate = profile.last_active_date;
      let newStreak = profile.streak_count || 0;
      const oldStreak = newStreak; // OCC Condition

      if (!lastDate) {
        newStreak = 1;
      } else if (lastDate === todayStr) {
        return newStreak; // Already updated today, no changes needed
      } else if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1; // Streak broken
      }

      // 2. Update profile with OCC
      let query = db
        .from("user_profiles")
        .update({
          streak_count: newStreak,
          last_active_date: todayStr,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("streak_count", oldStreak); // OCC Condition 1

      if (lastDate === null) {
        query = query.is("last_active_date", null); // OCC Condition 2
      } else {
        query = query.eq("last_active_date", lastDate); // OCC Condition 2
      }

      const { data: updatedProfiles, error: updateError } = await query.select();

      if (updateError) {
        console.error("[GamificationRepository] Error updating streak:", updateError);
        throw updateError;
      }

      if (updatedProfiles && updatedProfiles.length > 0) {
        return newStreak;
      }
      
      // If zero rows updated, concurrent modification happened. Retry.
    }

    throw new Error("Failed to update user streak due to concurrent modifications after max retries.");
  }
}

import { getDbClient } from "../db/index.js";

/**
 * Data Access Layer for Progress Entries.
 * Designed to enforce user_id explicitly in application space,
 * replacing the old Supabase RPC approach.
 */
export class ProgressRepository {
  /**
   * Upserts a progress entry for a user on a specific date.
   * 
   * Note on Atomicity: This executes a read-then-write pattern (SELECT then UPDATE/INSERT)
   * which is not perfectly atomic and has a small race window. If two concurrent requests
   * attempt to insert for the same user and date, one will fail due to the database's 
   * UNIQUE(user_id, entry_date) WHERE deleted_at IS NULL constraint. This limitation 
   * is acceptable as the unique constraint provides the final integrity boundary.
   * Duplicate/race errors will bubble up deterministically.
   * 
   * @param {string} userId - The authenticated user's ID
   * @param {Object} data 
   * @param {number} data.weight
   * @param {string} data.entryDate - YYYY-MM-DD
   * @param {number} [data.bodyFat]
   * @param {string} [data.notes]
   * @param {Object} [dbClient] - Optional Supabase client (used for dependency injection/testing)
   * @returns {Promise<Object>} The upserted progress entry
   */
  static async upsertProgressEntry(userId, { weight, entryDate, bodyFat = null, notes = null }, dbClient = null) {
    if (!userId) throw new Error("Unauthorized: userId is required");

    const db = dbClient || await getDbClient();

    // 1. Idempotency check: see if an entry already exists for this user/date
    const { data: existing, error: fetchError } = await db
      .from("progress_entries")
      .select("id")
      .eq("user_id", userId)
      .eq("entry_date", entryDate)
      .is("deleted_at", null)
      .maybeSingle();

    if (fetchError) {
      console.error("[ProgressRepository] Error fetching existing entry:", fetchError);
      throw fetchError;
    }

    const now = new Date().toISOString();

    if (existing) {
      // 2. Update existing entry
      // We explicitly include .eq('user_id', userId) for safety even though id is present.
      const { data, error } = await db
        .from("progress_entries")
        .update({
          weight,
          body_fat: bodyFat,
          notes,
          updated_at: now
        })
        .eq("id", existing.id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("[ProgressRepository] Error updating entry:", error);
        throw error;
      }
      return { data, action: 'update' };
    } else {
      // 3. Insert new entry
      const { data, error } = await db
        .from("progress_entries")
        .insert({
          user_id: userId,
          weight,
          body_fat: bodyFat,
          notes,
          entry_date: entryDate,
          updated_at: now
        })
        .select()
        .single();

      if (error) {
        console.error("[ProgressRepository] Error inserting entry:", error);
        throw error;
      }
      return { data, action: 'insert' };
    }
  }

  /**
   * Fetches all progress entries for a user.
   */
  static async getEntries(userId) {
    if (!userId) throw new Error("Unauthorized: userId is required");

    const db = await getDbClient();
    const { data, error } = await db
      .from("progress_entries")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("entry_date", { ascending: false });

    if (error) {
      console.error("[ProgressRepository] Error fetching entries:", error);
      throw error;
    }

    return data || [];
  }
}

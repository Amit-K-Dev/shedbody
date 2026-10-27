import { getDbClient } from "../db/index.js";
import { MetricReadAdapter } from "./MetricReadAdapter.js";

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

    // In the new EAV model, atomicity is guaranteed per HTTP API request.
    // We just pass the metrics to the centralized adapter.
    const payload = {
      weight: weight,
      body_fat: bodyFat
    };

    // Note: 'notes' is officially deprecated in EAV design and not mapped.
    const { data, error } = await (await import('./MetricWriteAdapter.js')).MetricWriteAdapter.commit(
      { supabase: db, userId: userId, logDate: entryDate },
      payload,
      'manual'
    );

    if (error) {
      console.error("[ProgressRepository] Error inserting entry via MetricWriteAdapter:", error);
      throw error;
    }

    return { data, action: 'insert' };
  }

  /**
   * Fetches all progress entries for a user.
   */
  static async getEntries(userId) {
    if (!userId) throw new Error("Unauthorized: userId is required");

    const db = await getDbClient();
    try {
      const data = await MetricReadAdapter.getProgress(
        { supabase: db, userId },
        { orderAsc: false } // entry_date descending
      );
      return data || [];
    } catch (error) {
      console.error("[ProgressRepository] Error fetching entries:", error);
      throw error;
    }
  }
}

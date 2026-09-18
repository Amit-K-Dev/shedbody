import { createClient } from "@/lib/supabase/server";
import { validateDateRange } from "@/lib/analytics/engine";

/**
 * Fetches historical progress entries within a bounded date range.
 *
 * @param {Object} authContext - Context needed for secure data access (not strictly required here since we use createClient() but kept for signature compatibility/future dependency injection if needed, usually we just use cookies()).
 * @param {string} startDateStr - ISO Date string (YYYY-MM-DD) for inclusive start bound.
 * @param {string} endDateStr - ISO Date string (YYYY-MM-DD) for inclusive end bound.
 * @returns {Promise<Array>} Bounded array of progress_entries
 */
export async function getBoundedProgress(authContext, startDateStr, endDateStr) {
  validateDateRange(startDateStr, endDateStr);

  const supabase = authContext?.supabase || (await createClient());
  let userId = authContext?.userId;

  if (!userId) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthenticated request to analytics data layer");
    }

    userId = user.id;
  }

  const { data, error } = await supabase
    .from("progress_entries")
    .select("id, weight, body_fat, entry_date, created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .gte("entry_date", startDateStr)
    .lte("entry_date", endDateStr)
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch bounded progress:", error);
    throw new Error("Failed to fetch analytics dataset");
  }

  return data || [];
}

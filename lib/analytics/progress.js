import { MetricReadAdapter } from "@/lib/repositories/MetricReadAdapter";
import { validateDateRange } from "@/lib/analytics/engine";
import { createClient } from "@/lib/supabase/server";

/**
 * Fetches historical progress entries within a bounded date range.
 *
 * @param {Object} authContext - Context needed for secure data access
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

  try {
    const data = await MetricReadAdapter.getProgress(
      { supabase, userId },
      { startDate: startDateStr, endDate: endDateStr, orderAsc: true }
    );
    return data || [];
  } catch (error) {
    console.error("Failed to fetch bounded progress:", error);
    throw new Error("Failed to fetch analytics dataset");
  }
}

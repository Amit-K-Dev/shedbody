import { validateDateRange } from "@/lib/analytics/engine";
import { MetricRepository } from "@/lib/repositories/MetricRepository.js";
import { D1Adapter } from "@/lib/repositories/D1Adapter.js";
import { getUser } from "@/lib/auth/getUser.js";

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

  let userId = authContext?.userId;

  if (!userId) {
    const user = authContext?.user || (await getUser());
    userId = user?.id;
  }

  if (!userId && authContext?.supabase) {
    const { data: { user }, error: authError } = await authContext.supabase.auth.getUser();
    if (!authError && user) userId = user.id;
  }

  if (!userId) {
    throw new Error("Unauthenticated request to analytics data layer");
  }

  try {
    const adapter = new D1Adapter();
    const metricRepo = new MetricRepository(adapter);
    const data = await metricRepo.getProgress(userId, { startDate: startDateStr, endDate: endDateStr, orderAsc: true });
    if (data && data.length > 0) return data;
  } catch (d1Error) {
    console.warn("D1 getBoundedProgress fallback:", d1Error?.message);
  }

  // Lazy Supabase fallback
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const { MetricReadAdapter } = await import("@/lib/repositories/MetricReadAdapter");
      const supabase = authContext?.supabase || (await createClient());
      const data = await MetricReadAdapter.getProgress(
        { supabase, userId },
        { startDate: startDateStr, endDate: endDateStr, orderAsc: true }
      );
      return data || [];
    } catch (fallbackErr) {
      console.error("Failed to fetch bounded progress from fallback:", fallbackErr);
      throw new Error("Failed to fetch analytics dataset");
    }
  }

  return [];
}

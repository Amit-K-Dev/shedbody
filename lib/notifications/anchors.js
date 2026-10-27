import { getUser } from "@/lib/auth/getUser.js";

/**
 * Fetches the most recent relevant dates for metrics required by the Notification Engine.
 * This guarantees that inactivity rules don't fail when a user's last action is older than 30 days,
 * without having to load unlimited historical rows into memory.
 */
export async function getHistoricalAnchors(authContext) {
  let userId = authContext?.userId;

  if (!userId) {
    const user = authContext?.user || (await getUser());
    userId = user?.id;
  }

  if (!userId && authContext?.supabase) {
    const { data: { user } } = await authContext.supabase.auth.getUser();
    userId = user?.id;
  }
  
  if (!userId) return { habitEntries: [], lifestyleLogs: [], nutritionLogs: [], progressEntries: [] };

  try {
    const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
    const { MetricRepository } = await import("@/lib/repositories/MetricRepository.js");
    
    const adapter = new D1Adapter();
    const metricRepo = new MetricRepository(adapter);
    
    let habitData = null;
    try {
      const hData = await adapter.query(
        `SELECT log_date, habit_name, completed FROM habit_entries 
         WHERE user_id = ? AND habit_name = 'meditation' AND completed = 1 
         ORDER BY log_date DESC LIMIT 1`, 
        [userId]
      );
      if (hData && hData.length > 0) {
        habitData = { ...hData[0], completed: hData[0].completed === 1 };
      }
    } catch (e) {
      console.warn("D1 habit entry fetch failed:", e);
    }
    
    const eavAnchors = await metricRepo.getLatestAnchors(userId);
    
    if (eavAnchors) {
      return {
        lifestyleLogs: eavAnchors.lifestyleLogs || [],
        nutritionLogs: eavAnchors.nutritionLogs || [],
        habitEntries: [habitData].filter(Boolean),
        progressEntries: eavAnchors.progressEntries || []
      };
    }
  } catch (d1Err) {
    console.warn("D1 getHistoricalAnchors fallback:", d1Err?.message);
  }

  // Lazy Supabase fallback
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const { MetricReadAdapter } = await import("@/lib/repositories/MetricReadAdapter");
      const supabase = authContext?.supabase || (await createClient());

      const { data: habitDataSupabase } = await supabase.from('habit_entries')
        .select('log_date, habit_name, completed')
        .eq('user_id', userId)
        .eq('habit_name', 'meditation')
        .eq('completed', true)
        .order('log_date', { ascending: false })
        .limit(1);

      const eavAnchorsSupabase = await MetricReadAdapter.getLatestAnchors({ supabase, userId });

      return {
        lifestyleLogs: eavAnchorsSupabase.lifestyleLogs || [],
        nutritionLogs: eavAnchorsSupabase.nutritionLogs || [],
        habitEntries: [habitDataSupabase?.[0]].filter(Boolean),
        progressEntries: eavAnchorsSupabase.progressEntries || []
      };
    } catch (fallbackErr) {
      console.error("Fallback error in getHistoricalAnchors:", fallbackErr);
    }
  }

  return { habitEntries: [], lifestyleLogs: [], nutritionLogs: [], progressEntries: [] };
}

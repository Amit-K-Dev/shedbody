import { createClient } from "@/lib/supabase/server";
import { MetricReadAdapter } from "@/lib/repositories/MetricReadAdapter";

/**
 * Fetches the most recent relevant dates for metrics required by the Notification Engine.
 * This guarantees that inactivity rules don't fail when a user's last action is older than 30 days,
 * without having to load unlimited historical rows into memory.
 */
export async function getHistoricalAnchors(authContext) {
  const supabase = authContext?.supabase || (await createClient());
  let userId = authContext?.userId;

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }
  
  if (!userId) return { habitEntries: [], lifestyleLogs: [], nutritionLogs: [], progressEntries: [] };

  const { data: habitData } = await supabase.from('habit_entries')
    .select('log_date, habit_name, completed')
    .eq('user_id', userId)
    .eq('habit_name', 'meditation')
    .eq('completed', true)
    .order('log_date', { ascending: false })
    .limit(1);

  const eavAnchors = await MetricReadAdapter.getLatestAnchors({ supabase, userId });

  return {
    lifestyleLogs: eavAnchors.lifestyleLogs,
    nutritionLogs: eavAnchors.nutritionLogs,
    habitEntries: [
      habitData?.[0]
    ].filter(Boolean),
    progressEntries: eavAnchors.progressEntries
  };
}

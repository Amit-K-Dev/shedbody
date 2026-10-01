import { createClient } from "@/lib/supabase/server";

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

  const queries = [
    // 1. Last Workout
    supabase.from('lifestyle_logs')
      .select('log_date, workout_completed')
      .eq('user_id', userId)
      .eq('workout_completed', true)
      .order('log_date', { ascending: false })
      .limit(1),

    // 2. Last Steps
    supabase.from('lifestyle_logs')
      .select('log_date, steps_count')
      .eq('user_id', userId)
      .gt('steps_count', 0)
      .order('log_date', { ascending: false })
      .limit(1),

    // 3. Last Sleep
    supabase.from('lifestyle_logs')
      .select('log_date, sleep_hours')
      .eq('user_id', userId)
      .gt('sleep_hours', 0)
      .order('log_date', { ascending: false })
      .limit(1),

    // 4. Last Water
    supabase.from('nutrition_logs')
      .select('log_date, water_ml')
      .eq('user_id', userId)
      .gt('water_ml', 0)
      .order('log_date', { ascending: false })
      .limit(1),

    // 5. Last Protein
    supabase.from('nutrition_logs')
      .select('log_date, protein_consumed')
      .eq('user_id', userId)
      .gt('protein_consumed', 0)
      .order('log_date', { ascending: false })
      .limit(1),

    // 6. Last Meditation
    supabase.from('habit_entries')
      .select('log_date, habit_name, completed')
      .eq('user_id', userId)
      .eq('habit_name', 'meditation')
      .eq('completed', true)
      .order('log_date', { ascending: false })
      .limit(1),

    // 7. Last Progress (Weight)
    supabase.from('progress_entries')
      .select('entry_date, weight')
      .eq('user_id', userId)
      .not('weight', 'is', null)
      .order('entry_date', { ascending: false })
      .limit(1)
  ];

  const results = await Promise.all(queries);

  return {
    lifestyleLogs: [
      results[0].data?.[0], // workout
      results[1].data?.[0], // steps
      results[2].data?.[0]  // sleep
    ].filter(Boolean),
    
    nutritionLogs: [
      results[3].data?.[0], // water
      results[4].data?.[0]  // protein
    ].filter(Boolean),
    
    habitEntries: [
      results[5].data?.[0]  // meditation
    ].filter(Boolean),
    
    progressEntries: [
      results[6].data?.[0]  // progress
    ].filter(Boolean)
  };
}

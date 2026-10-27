/**
 * Fetches notification preferences for a given user.
 * If no preference row exists, returns effective defaults.
 */
export async function getNotificationPreferences({ supabase, userId }) {
  if (!userId) return null;

  try {
    const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
    const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
    const adapter = new D1Adapter();
    adapter._checkDb();
    const profileRepo = new ProfileRepository(adapter);
    const prefs = await profileRepo.getPreferences(userId);
    if (prefs) return prefs;
  } catch (d1Error) {
    // Fall back to Supabase below
  }

  let client = supabase;
  if (!client) {
    try {
      const { createClient } = await import("@/lib/supabase/server.js");
      client = await createClient();
    } catch {
      // Return defaults
      return {
        workout_reminders: true,
        goal_reminders: true,
        habit_reminders: true,
        weekly_progress: true,
        plan_updates: true,
      };
    }
  }

  const { data, error } = await client
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching notification preferences:", error);
  }

  return {
    workout_reminders: data?.workout_reminders ?? true,
    goal_reminders: data?.goal_reminders ?? true,
    habit_reminders: data?.habit_reminders ?? true,
    weekly_progress: data?.weekly_progress ?? true,
    plan_updates: data?.plan_updates ?? true,
  };
}

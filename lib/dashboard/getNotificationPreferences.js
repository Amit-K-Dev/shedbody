/**
 * Fetches notification preferences for a given user.
 * If no preference row exists, returns effective defaults.
 */
export async function getNotificationPreferences({ supabase, userId }) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

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

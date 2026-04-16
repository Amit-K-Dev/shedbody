import { createClient } from "@/lib/supabase/server";

export async function updateStreak(userId) {
  const supabase = await createClient();

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  const { data: profile, error: fetchError } = await supabase
    .from("user_profiles")
    .select("streak_count, last_active_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError || !profile) {
    console.error("Error fetching profile for streak:", fetchError);
    return null;
  }

  const lastDate = profile.last_active_date;
  let newStreak = profile.streak_count || 0;

  // Streak Logic
  if (!lastDate) {
    newStreak = 1;
  } else if (lastDate === todayKey) {
    return newStreak;
  } else {
    if (lastDate === yesterdayKey) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  // Supabase column is a date, so store YYYY-MM-DD instead of a timestamp.
  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      streak_count: newStreak,
      last_active_date: todayKey,
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Error updating streak:", updateError);
    return profile.streak_count;
  }

  return newStreak;
}

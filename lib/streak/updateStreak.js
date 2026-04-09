import { createClient } from "@/lib/supabase/server";

export async function updateStreak(userId) {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const last = new Date(lastDate);

    if (last.toDateString() === yesterday.toDateString()) {
      newStreak += 1;
    } else if (last.toDateString() !== new Date().toDateString()) {
      newStreak = 1;
    }
  }

  // Safe update with ISO date string
  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      streak_count: newStreak,
      last_active_date: today.toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Error updating streak:", updateError);
    return profile.streak_count;
  }

  return newStreak;
}

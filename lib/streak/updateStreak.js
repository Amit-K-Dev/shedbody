import { createClient } from "@/lib/supabase/server";

export async function updateStreak(userId) {
  const supabase = createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const lastDate = profile.last_active_date;

  let newStreak = profile.streak_count || 0;

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

  await supabase
    .from("user_profiles")
    .update({
      streak_count: newStreak,
      last_active_date: today,
    })
    .eq("id", userId);

  return newStreak;
}

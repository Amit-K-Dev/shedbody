import { createClient } from "@/lib/supabase/server";

export async function checkBadges(userId, streak) {
  const supabase = createClient();

  if (streak >= 7) {
    await awardBadge(userId, "7-day-streak");
  }

  if (streak >= 30) {
    await awardBadge(userId, "30-day-streak");
  }
}

async function awardBadge(userId, badgeName) {
  const supabase = createClient();

  const { data: badge } = await supabase
    .from("user_badges")
    .select("*")
    .eq("name", badgeName)
    .single();

  if (!badge) return;

  const { data: existing } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .eq("badge_id", badge.id)
    .single();

  if (!existing) return;

  await supabase.from("user_badges").insert([
    {
      user_id: userId,
      badge_id: badge.id,
    },
  ]);
}

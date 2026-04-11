import { createClient } from "@/lib/supabase/server";

export async function checkBadges(userId, streak) {
  const supabase = await createClient();

  // Check for 7 days
  if (streak >= 7) {
    await awardBadge(userId, "7-day-streak", supabase);
  }

  // Check for 30 days
  if (streak >= 30) {
    await awardBadge(userId, "30-day-streak", supabase);
  }
}

async function awardBadge(userId, badgeName, supabase) {
  const { data: badge, error: badgeError } = await supabase
    .from("badges")
    .select("id")
    .eq("name", badgeName)
    .single();

  if (badgeError || !badge) return;

  const { data: existing } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badge.id)
    .maybeSingle();

  if (existing) return;

  const { error: insertError } = await supabase.from("user_badges").insert([
    {
      user_id: userId,
      badge_id: badge.id,
    },
  ]);

  if (insertError) {
    console.error(`Failed to award badge ${badgeName}:`, insertError);
  }
}

import { createClient } from "@/lib/supabase/server";

export async function addXP(userId, amount) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("xp, level")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  let newXP = (profile.xp || 0) + amount;
  let level = profile.level || 1;

  // Level up logic
  const xpToNextLevel = level * 100;

  if (newXP >= xpToNextLevel) {
    level += 1;
    newXP -= xpToNextLevel;
  }

  await supabase
    .from("user_profiles")
    .update({ xp: newXP, level })
    .eq("id", userId);

  return { xp: newXP, level };
}

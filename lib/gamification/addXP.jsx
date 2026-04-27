import { createClient } from "@/lib/supabase/server";

export async function addXP(userId, amount) {
  const supabase = await createClient();

  const { data: rpcResult, error: rpcError } = await supabase
    .rpc("add_user_xp", {
      target_user_id: userId,
      xp_amount: amount,
    })
    .maybeSingle();

  if (!rpcError && rpcResult) {
    return {
      xp: rpcResult.xp,
      level: rpcResult.level,
    };
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("xp, gamification_level")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !profile) return null;

  let newXP = (profile.xp || 0) + amount;
  let currentLevel = profile.gamification_level || 1;

  const xpToNextLevel = currentLevel * 100;

  if (newXP >= xpToNextLevel) {
    currentLevel += 1;
    newXP -= xpToNextLevel;
  }

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      xp: newXP,
      gamification_level: currentLevel,
    })
    .eq("user_id", userId);

  if (updateError) return null;

  return { xp: newXP, level: currentLevel };
}

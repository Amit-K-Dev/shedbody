import { createClient } from "@/lib/supabase/server";

export async function getProfileData(authContext) {
  try {
    const supabase = authContext?.supabase || (await createClient());
    let userId = authContext?.userId;

    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      userId = user?.id;
    }

    if (!userId) return null;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("target_weight, height, xp, gamification_level, streak_count")
      .eq("user_id", userId)
      .maybeSingle();

    return profile;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
}

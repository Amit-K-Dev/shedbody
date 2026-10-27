import { ProfileRepository } from "@/lib/repositories/ProfileRepository.js";
import { D1Adapter } from "@/lib/repositories/D1Adapter.js";
import { getUser } from "@/lib/auth/getUser.js";

export async function getProfileData(authContext) {
  try {
    let userId = authContext?.userId;

    if (!userId) {
      const user = authContext?.user || (await getUser());
      userId = user?.id;
    }

    if (!userId && authContext?.supabase) {
      const {
        data: { user },
        error: authError,
      } = await authContext.supabase.auth.getUser();
      if (!authError && user) userId = user.id;
    }

    if (!userId) return null;

    try {
      const adapter = new D1Adapter();
      const profileRepo = new ProfileRepository(adapter);
      const stats = await profileRepo.getProfileStats(userId);
      if (stats) {
        return stats;
      }
    } catch (d1Error) {
      console.warn("D1 getProfileData fallback:", d1Error?.message);
    }

    // Lazy Supabase fallback if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = authContext?.supabase || (await createClient());
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("weight, target_weight, height, xp, gamification_level, streak_count")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && profile) {
        return profile;
      }
    }

    return null;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
}

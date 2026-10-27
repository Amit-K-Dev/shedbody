import { ProfileRepository } from "@/lib/repositories/ProfileRepository.js";
import { D1Adapter } from "@/lib/repositories/D1Adapter.js";
import { getUser } from "@/lib/auth/getUser.js";

export async function getStreak(authContext) {
  let userId = authContext?.userId;

  if (!userId) {
    const user = authContext?.user || (await getUser());
    userId = user?.id;
  }

  if (!userId && authContext?.supabase) {
    const { data } = await authContext.supabase.auth.getUser();
    userId = data?.user?.id;
  }

  if (!userId) return 0;

  try {
    const adapter = new D1Adapter();
    const profileRepo = new ProfileRepository(adapter);
    const profile = await profileRepo.getProfileStats(userId);
    if (profile?.streak_count !== undefined) {
      return profile.streak_count;
    }
  } catch (d1Error) {
    console.warn("D1 getStreak fallback:", d1Error?.message);
  }

  // Lazy Supabase fallback
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = authContext?.supabase || (await createClient());
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("streak_count")
        .eq("user_id", userId)
        .maybeSingle();

      return profile?.streak_count || 0;
    } catch {
      return 0;
    }
  }

  return 0;
}

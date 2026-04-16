import { createClient } from "@/lib/supabase/server";

export async function getStreak(authContext) {
  const supabase = authContext?.supabase || (await createClient());
  let userId = authContext?.userId;

  if (!userId) {
    const { data } = await supabase.auth.getUser();
    userId = data?.user?.id;
  }

  if (!userId) return 0;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("streak_count")
    .eq("user_id", userId)
    .maybeSingle();

  return profile?.streak_count || 0;
}

import { createClient } from "@/lib/supabase/server";

export async function getStreak() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) return 0;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("streak_count")
    .eq("id", user.id)
    .single();

  return profile?.streak_count || 0;
}

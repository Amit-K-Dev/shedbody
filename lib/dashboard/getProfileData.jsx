import { createClient } from "@/lib/supabase/server";

export async function getProfileData() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("target_weight, xp, level")
      .eq("user_id", user.id)
      .maybeSingle();

    return profile;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
}

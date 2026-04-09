import { createClient } from "@/lib/supabase/server";

export async function getWeightData() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Database Error Handling
    const { data: weights, error: dbError } = await supabase
      .from("progress_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (dbError) {
      console.error("Error fetching weight data:", dbError);
      return [];
    }

    return weights || [];
  } catch (error) {
    console.error("Crash in getWeightData:", error);
    return [];
  }
}

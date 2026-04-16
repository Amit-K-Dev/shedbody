import { createClient } from "@/lib/supabase/server";

export async function getWeightData(authContext) {
  try {
    const supabase = authContext?.supabase || (await createClient());
    let userId = authContext?.userId;

    if (!userId) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return [];
      }

      userId = user.id;
    }

    if (!userId) {
      return [];
    }

    // Database Error Handling
    const { data: weights, error: dbError } = await supabase
      .from("progress_entries")
      .select("id, weight, body_fat, notes, entry_date, created_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("entry_date", { ascending: true })
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

import { createClient } from "@/lib/supabase/server";
import { MetricReadAdapter } from "@/lib/repositories/MetricReadAdapter";

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

    // Delegate to Canonical EAV Adapter
    const weights = await MetricReadAdapter.getProgress({ supabase, userId });
    return weights || [];
  } catch (error) {
    console.error("Crash in getWeightData:", error);
    return [];
  }
}

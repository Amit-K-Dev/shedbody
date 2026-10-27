import { MetricRepository } from "@/lib/repositories/MetricRepository.js";
import { D1Adapter } from "@/lib/repositories/D1Adapter.js";
import { getUser } from "@/lib/auth/getUser.js";

export async function getWeightData(authContext) {
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

      if (!authError && user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return [];
    }

    // Direct D1 MetricRepository query
    try {
      const adapter = new D1Adapter();
      const metricRepo = new MetricRepository(adapter);
      const d1Data = await metricRepo.getProgress(userId);
      if (d1Data && d1Data.length > 0) return d1Data;
    } catch (d1Error) {
      console.warn("D1 getWeightData fallback:", d1Error?.message);
    }

    // Lazy Supabase fallback
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const { MetricReadAdapter } = await import("@/lib/repositories/MetricReadAdapter");
        const supabase = authContext?.supabase || (await createClient());
        const weights = await MetricReadAdapter.getProgress({ supabase, userId });
        return weights || [];
      } catch (fallbackErr) {
        console.error("Supabase fallback error in getWeightData:", fallbackErr);
      }
    }

    return [];
  } catch (error) {
    console.error("Crash in getWeightData:", error);
    return [];
  }
}

import { MetricReadAdapter } from "@/lib/repositories/MetricReadAdapter";

export async function getLifestyleData({ supabase, userId }, startDate, endDate) {
  if (!userId || !startDate || !endDate) return [];

  try {
    if (process.env.ENABLE_D1_METRICS === "true") {
      try {
        const { MetricRepository } = await import("@/lib/repositories/MetricRepository.js");
        const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
        const adapter = new D1Adapter();
        adapter._checkDb();
        const metricRepo = new MetricRepository(adapter);
        const d1Data = await metricRepo.getLifestyle(userId, { startDate, endDate });
        if (d1Data) return d1Data;
      } catch (d1Error) {
        console.error("D1 getLifestyleData error, falling back to Supabase:", d1Error);
      }
    }
    let client = supabase;
    if (!client) {
      try {
        const { createClient } = await import("@/lib/supabase/server.js");
        client = await createClient();
      } catch {
        return [];
      }
    }
    const data = await MetricReadAdapter.getLifestyle({ supabase: client, userId }, { startDate, endDate });
    return data || [];
  } catch (err) {
    console.error("getLifestyleData crash:", err);
    return [];
  }
}

import { MetricReadAdapter } from "@/lib/repositories/MetricReadAdapter";

export async function getLifestyleData({ supabase, userId }, startDate, endDate) {
  if (!userId || !startDate || !endDate) return [];

  try {
    const data = await MetricReadAdapter.getLifestyle({ supabase, userId }, startDate, endDate);
    return data || [];
  } catch (err) {
    console.error("getLifestyleData crash:", err);
    return [];
  }
}

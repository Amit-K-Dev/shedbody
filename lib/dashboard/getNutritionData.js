import { MetricReadAdapter } from "@/lib/repositories/MetricReadAdapter";

export async function getNutritionData({ supabase, userId }, startDate, endDate) {
  if (!userId || !startDate || !endDate) return [];

  try {
    const data = await MetricReadAdapter.getNutrition({ supabase, userId }, startDate, endDate);
    return data || [];
  } catch (err) {
    console.error("getNutritionData crash:", err);
    return [];
  }
}

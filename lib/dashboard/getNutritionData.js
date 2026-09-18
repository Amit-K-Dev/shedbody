export async function getNutritionData({ supabase, userId }, startDate, endDate) {
  if (!userId || !startDate || !endDate) return [];

  try {
    const { data, error } = await supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", startDate)
      .lte("log_date", endDate)
      .order("log_date", { ascending: false });

    if (error) {
      console.error("Error fetching nutrition data:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("getNutritionData crash:", err);
    return [];
  }
}

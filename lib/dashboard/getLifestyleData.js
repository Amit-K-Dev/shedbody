export async function getLifestyleData({ supabase, userId }, startDate, endDate) {
  if (!userId || !startDate || !endDate) return [];

  try {
    const { data, error } = await supabase
      .from("lifestyle_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", startDate)
      .lte("log_date", endDate)
      .order("log_date", { ascending: false });

    if (error) {
      console.error("Error fetching lifestyle data:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("getLifestyleData crash:", err);
    return [];
  }
}

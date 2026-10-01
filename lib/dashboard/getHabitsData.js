export async function getHabitsData(context, startDate, endDate) {
  if (!context || !context.supabase || !context.userId) return [];
  const { supabase, userId } = context;
  
  let query = supabase
    .from("habit_entries")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false });

  if (startDate) {
    query = query.gte("log_date", startDate);
  }
  if (endDate) {
    query = query.lte("log_date", endDate);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching habit_entries:", error);
    return [];
  }
  
  return data || [];
}

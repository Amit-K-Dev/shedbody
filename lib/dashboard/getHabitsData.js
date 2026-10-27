export async function getHabitsData(context, startDate, endDate) {
  if (!context || !context.userId) return [];
  const { userId } = context;

  try {
    const { HabitRepository } = await import("@/lib/repositories/HabitRepository.js");
    const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
    const adapter = new D1Adapter();
    adapter._checkDb();
    const habitRepo = new HabitRepository(adapter);
    const d1Data = await habitRepo.getHabits(userId, { startDate, endDate });
    if (d1Data) return d1Data;
  } catch (error) {
    // Fall back to Supabase if D1 is not active or query fails
  }

  let client = context.supabase;
  if (!client) {
    try {
      const { createClient } = await import("@/lib/supabase/server.js");
      client = await createClient();
    } catch {
      return [];
    }
  }
  if (!client) return [];

  let query = client
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

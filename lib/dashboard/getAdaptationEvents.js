/**
 * Fetches recent adaptation events for a given user.
 */
export async function getAdaptationEvents(authContext, limit = 5) {
  const { supabase, userId } = authContext;
  
  if (!userId) return [];

  const { data, error } = await supabase
    .from("adaptation_events")
    .select("id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching adaptation events:", error);
    return [];
  }

  return data || [];
}

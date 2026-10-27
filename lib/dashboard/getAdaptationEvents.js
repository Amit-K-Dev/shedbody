/**
 * Fetches recent adaptation events for a given user.
 */
export async function getAdaptationEvents(authContext, limit = 5) {
  const { supabase, userId } = authContext;
  
  if (!userId) return [];

  if (process.env.ENABLE_D1_ADAPTIVE === "true") {
    try {
      const { AdaptationRepository } = await import("@/lib/repositories/AdaptationRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const adaptationRepo = new AdaptationRepository(adapter);
      return await adaptationRepo.getAdaptationEvents(userId, limit);
    } catch (error) {
      console.error("Error fetching adaptation_events from D1, falling back to Supabase:", error);
    }
  }

  let client = supabase;
  if (!client) {
    try {
      const { createClient } = await import("@/lib/supabase/server.js");
      client = await createClient();
    } catch (e) {
      return [];
    }
  }
  if (!client) return [];

  const { data, error } = await client
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

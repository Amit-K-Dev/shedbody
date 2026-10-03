import { getSupabaseClient, getSupabaseBuildClient } from "./supabase.js";
// import { getD1Client } from "./d1.js";

// The unified DB client getter
export async function getDbClient() {
  // CF-3 currently forces Supabase production path
  return await getSupabaseClient();
}

export function getBuildClient() {
  return getSupabaseBuildClient();
}

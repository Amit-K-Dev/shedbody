import { createClient } from "../../lib/supabase/server.js";
import { createClient as createStandardClient } from "@supabase/supabase-js";

// Safe wrapper for server-side Supabase client
export async function getSupabaseClient() {
  return await createClient();
}

// Build-time client without cookies
export function getSupabaseBuildClient() {
  return createStandardClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

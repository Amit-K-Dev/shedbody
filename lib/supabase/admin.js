import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Ensure this module is never imported on the client side
if (typeof window !== 'undefined') {
  throw new Error('Supabase admin client must only be used on the server');
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }

  // Create admin client with service role key, bypassing RLS
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

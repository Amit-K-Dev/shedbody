import { handleCronRequest } from '../../../../lib/notifications/cronHandler.js';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncUser } from '@/lib/notifications/syncUser';

// Force dynamic execution for Vercel Cron
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is not configured');
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  return await handleCronRequest(req, cronSecret, createAdminClient, syncUser);
}

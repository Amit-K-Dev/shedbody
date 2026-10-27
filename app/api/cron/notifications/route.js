import { handleCronRequest } from '../../../../lib/notifications/cronHandler.js';
import { syncUser } from '@/lib/notifications/syncUser';
import { logger } from '../../../../lib/observability/logger.js';

// Force dynamic execution for Vercel Cron
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    logger.error('cron.config.error', {
      details: {
        reason: 'missing_cron_secret'
      }
    });
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const getAdminClient = async () => {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      return createAdminClient();
    } catch {
      return null;
    }
  };

  return await handleCronRequest(req, cronSecret, getAdminClient, syncUser);
}

import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/getUser.js';
import { syncUser } from '@/lib/notifications/syncUser';

export async function POST(req) {
  try {
    // 1. Authenticate Caller
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    let supabase = null;
    try {
      const { createClient } = await import('@/lib/supabase/server');
      supabase = await createClient();
    } catch {}

    const authContext = { supabase, userId };

    // 2. Perform Synchronization
    const result = await syncUser(authContext);

    // 3. Update last_notification_sync on success
    if (result.success) {
      const isD1NotificationsEnabled = process.env.ENABLE_D1_NOTIFICATIONS === "true";
      let d1Updated = false;

      if (isD1NotificationsEnabled) {
        try {
          const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
          const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
          const adapter = new D1Adapter();
          adapter._checkDb();
          const profileRepo = new ProfileRepository(adapter);
          await profileRepo.updateLastNotificationSync(userId);
          d1Updated = true;
        } catch (d1Err) {
          console.warn(`Failed to update last_notification_sync (D1) for user ${userId}, falling back to Supabase:`, d1Err?.message || d1Err);
        }
      }

      if (!d1Updated) {
        try {
          const { createAdminClient } = await import('@/lib/supabase/admin');
          const adminSupabase = createAdminClient();
          await adminSupabase
            .from('user_profiles')
            .update({ last_notification_sync: new Date().toISOString() })
            .eq('user_id', userId);
        } catch (adminErr) {
          console.error("Failed to update last_notification_sync in Supabase:", adminErr);
        }
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Notification Sync Error:', error);
    // Return safe 500 error, no sensitive details
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

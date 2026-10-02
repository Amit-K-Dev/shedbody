import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncUser } from '@/lib/notifications/syncUser';

export async function POST(req) {
  try {
    // 1. Authenticate Caller
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const authContext = { supabase, userId };

    // 2. Perform Synchronization
    const result = await syncUser(authContext);

    // 3. Update last_notification_sync on success
    if (result.success) {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('user_profiles')
        .update({ last_notification_sync: new Date().toISOString() })
        .eq('user_id', userId);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Notification Sync Error:', error);
    // Return safe 500 error, no sensitive details
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

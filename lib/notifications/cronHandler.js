export async function handleCronRequest(req, cronSecret, createAdminClient, syncUser) {
  try {
    // 1. Verify CRON_SECRET
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch a batch of eligible users
    const adminSupabase = createAdminClient();
    
    // Select users ordered by oldest sync first
    const { data: users, error: fetchError } = await adminSupabase
      .from('user_profiles')
      .select('user_id')
      .order('last_notification_sync', { ascending: true, nullsFirst: true })
      .limit(50); // Bounded batch size

    if (fetchError) {
      console.error('Failed to fetch eligible users for cron:', fetchError);
      return Response.json({ error: 'Database Error' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return Response.json({
        success: true,
        processed: 0,
        succeeded: 0,
        failed: 0,
        notificationsCreated: 0
      });
    }

    // 3. Process users with bounded concurrency (chunking)
    const CHUNK_SIZE = 5;
    let succeeded = 0;
    let failed = 0;
    let totalNotificationsCreated = 0;

    for (let i = 0; i < users.length; i += CHUNK_SIZE) {
      const chunk = users.slice(i, i + CHUNK_SIZE);
      
      const chunkPromises = chunk.map(async (userRow) => {
        const userId = userRow.user_id;
        try {
          // Perform the sync using the admin client context for this specific user
          const result = await syncUser({ supabase: adminSupabase, userId });
          
          // Update the timestamp on success
          await adminSupabase
            .from('user_profiles')
            .update({ last_notification_sync: new Date().toISOString() })
            .eq('user_id', userId);
            
          return { success: true, created: result.created };
        } catch (err) {
          console.error(`Cron sync failed for user ${userId}:`, err);
          
          // Even on failure, update the timestamp so the poison-pill user
          // moves to the back of the queue and doesn't starve healthy users.
          try {
            await adminSupabase
              .from('user_profiles')
              .update({ last_notification_sync: new Date().toISOString() })
              .eq('user_id', userId);
          } catch (updateErr) {
            console.error(`Failed to update timestamp for failed user ${userId}:`, updateErr);
          }

          return { success: false };
        }
      });

      // Await the current chunk to finish before moving to the next
      const chunkResults = await Promise.allSettled(chunkPromises);

      for (const res of chunkResults) {
        if (res.status === 'fulfilled' && res.value.success) {
          succeeded++;
          totalNotificationsCreated += (res.value.created || 0);
        } else {
          failed++;
        }
      }
    }

    // 4. Return summary
    return Response.json({
      success: true,
      processed: users.length,
      succeeded,
      failed,
      notificationsCreated: totalNotificationsCreated
    });

  } catch (error) {
    console.error('Fatal Cron Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

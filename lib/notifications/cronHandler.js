import { logger, pseudonymizeId } from '../observability/logger.js';

function isD1NotificationsEnabled(env = {}) {
  const flag = env.ENABLE_D1_NOTIFICATIONS || (typeof process !== 'undefined' ? process.env?.ENABLE_D1_NOTIFICATIONS : undefined);
  return flag === "true";
}

export async function handleCronRequest(req, cronSecret, createAdminClient, syncUser, env = {}) {
  const startTime = Date.now();
  const requestId = req?.headers?.get ? (
    req.headers.get('x-request-id') ||
    req.headers.get('x-correlation-id') ||
    req.headers.get('cf-ray') ||
    null
  ) : null;

  const cronLogger = logger.withContext({
    service: 'notifications',
    runtime: 'nextjs',
    ...(requestId ? { requestId } : {})
  });

  try {
    // 1. Verify CRON_SECRET (safe failure logging without logging secret or header value)
    const authHeader = req?.headers?.get ? req.headers.get('authorization') : null;
    if (authHeader !== `Bearer ${cronSecret}`) {
      cronLogger.warn('cron.auth.failure', {
        details: {
          reason: !authHeader ? 'missing_authorization_header' : 'invalid_bearer_token'
        }
      });
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d1Enabled = isD1NotificationsEnabled(env);
    const dbBinding = env.DB || (typeof process !== 'undefined' ? process.env?.DB : undefined);

    cronLogger.info('cron.run.started', {
      details: {
        d1OptIn: d1Enabled,
        hasDbBinding: Boolean(dbBinding)
      }
    });

    // 2. Fetch a batch of eligible users
    let users = [];
    let adminSupabase = null;

    if (d1Enabled) {
      try {
        const { ProfileRepository } = await import('../repositories/ProfileRepository.js');
        const { D1Adapter } = await import('../repositories/D1Adapter.js');
        const adapter = new D1Adapter(dbBinding);
        const profileRepo = new ProfileRepository(adapter);
        users = await profileRepo.getUsersForNotificationSync(50);
      } catch (fetchError) {
        cronLogger.warn('cron.d1.fallback', {
          details: {
            action: 'getUsersForNotificationSync',
            fallbackTarget: 'supabase'
          },
          error: fetchError
        });
        // Fall back to Supabase below
      }
    }

    if (!users || users.length === 0) {
      const clientOrPromise = createAdminClient ? createAdminClient() : null;
      adminSupabase = clientOrPromise instanceof Promise ? await clientOrPromise : clientOrPromise;
      if (adminSupabase) {
        // Select users ordered by oldest sync first
        const { data, error: fetchError } = await adminSupabase
          .from('user_profiles')
          .select('user_id')
          .order('last_notification_sync', { ascending: true, nullsFirst: true })
          .limit(50); // Bounded batch size
          
        if (fetchError) {
          cronLogger.error('cron.fetch_users.failed', {
            details: {
              source: 'supabase'
            },
            error: fetchError
          });
          return Response.json({ error: 'Database Error' }, { status: 500 });
        }
        users = data || [];
      }
    }

    if (!users || users.length === 0) {
      const durationMs = Date.now() - startTime;
      cronLogger.info('cron.run.completed', {
        durationMs,
        details: {
          processed: 0,
          succeeded: 0,
          failed: 0,
          notificationsCreated: 0
        }
      });
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
          let d1Updated = false;
          if (d1Enabled) {
            try {
              const { ProfileRepository } = await import('../repositories/ProfileRepository.js');
              const { D1Adapter } = await import('../repositories/D1Adapter.js');
              const adapter = new D1Adapter(dbBinding);
              const profileRepo = new ProfileRepository(adapter);
              await profileRepo.updateLastNotificationSync(userId);
              d1Updated = true;
            } catch (d1Err) {
              cronLogger.warn('cron.d1.fallback', {
                details: {
                  action: 'updateLastNotificationSync',
                  fallbackTarget: 'supabase'
                },
                error: d1Err
              });
            }
          }
          
          if (!d1Updated && adminSupabase) {
            await adminSupabase
              .from('user_profiles')
              .update({ last_notification_sync: new Date().toISOString() })
              .eq('user_id', userId);
          }
            
          return { success: true, created: result.created };
        } catch (err) {
          cronLogger.error('cron.user.failed', {
            details: {
              userRef: pseudonymizeId(userId),
              retryable: true
            },
            error: err
          });
          
          // Do NOT advance last_notification_sync on failure.
          // Advancing the timestamp on error would cause transient failures to
          // silently mark unwritten notifications as completed, resulting in data loss.
          // Leaving the timestamp unchanged allows the user to be retried on subsequent runs.
          // Because errors are caught per user, the remaining users in the chunk/batch
          // are not blocked or starved.
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
    const durationMs = Date.now() - startTime;
    cronLogger.info('cron.run.completed', {
      durationMs,
      details: {
        processed: users.length,
        succeeded,
        failed,
        notificationsCreated: totalNotificationsCreated
      }
    });

    return Response.json({
      success: true,
      processed: users.length,
      succeeded,
      failed,
      notificationsCreated: totalNotificationsCreated
    });

  } catch (error) {
    const durationMs = Date.now() - startTime;
    cronLogger.error('cron.run.failed', {
      durationMs,
      error
    });
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

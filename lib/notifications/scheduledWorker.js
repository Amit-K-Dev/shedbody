/**
 * Cloudflare Worker Scheduled Handler for Notifications
 *
 * Invoked by Cloudflare Cron Triggers (e.g. crons = ["0 0 * * *"]).
 *
 * LOCKED SAFEGUARD:
 * - D1 notification processing is explicitly opt-in via ENABLE_D1_NOTIFICATIONS === "true".
 * - When disabled (or if env.DB is not bound), the scheduled run logs and skips execution,
 *   preserving Supabase / Vercel Cron as authoritative production source of truth.
 * - Adheres to CF-4 identity prerequisites: avoids unresolvable foreign-key writes when disabled.
 */

import { D1Adapter } from '../repositories/D1Adapter.js';
import { ProfileRepository } from '../repositories/ProfileRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { logger, pseudonymizeId } from '../observability/logger.js';

export async function handleScheduledNotifications(event, env = {}, ctx = null, customSyncUser = null) {
  const startTime = Date.now();
  const jobId = event?.cron 
    ? `cron_${event.cron}_${event.scheduledTime || Date.now()}` 
    : (event?.scheduledTime ? `job_${event.scheduledTime}` : null);

  const workerLogger = logger.withContext({
    service: 'notifications-worker',
    runtime: 'cloudflare-worker',
    ...(jobId ? { jobId } : {})
  });

  const isD1NotificationsEnabled = Boolean(env.DB && env.ENABLE_D1_NOTIFICATIONS === "true");

  if (!isD1NotificationsEnabled) {
    const reasonCode = !env.DB ? 'binding_missing' : 'flag_disabled';
    const reason = !env.DB 
      ? 'D1 database binding (env.DB) is missing' 
      : 'ENABLE_D1_NOTIFICATIONS is not enabled';
      
    workerLogger.info('worker.scheduled.skipped', {
      details: {
        reason: reasonCode,
        message: reason,
        hasBinding: Boolean(env.DB),
        flagValue: env.ENABLE_D1_NOTIFICATIONS || 'unset'
      }
    });

    return {
      status: 'skipped',
      reason,
      processed: 0
    };
  }

  // When enabled in local testing or future Cloudflare deployment
  try {
    const adapter = new D1Adapter(env.DB);
    const profileRepo = new ProfileRepository(adapter);
    const notificationRepo = new NotificationRepository(adapter);

    const batchLimit = Number(env.CRON_BATCH_SIZE || 50);
    workerLogger.info('worker.scheduled.started', {
      details: {
        batchLimit
      }
    });

    const eligibleUsers = await profileRepo.getUsersForNotificationSync(batchLimit);

    if (!eligibleUsers || eligibleUsers.length === 0) {
      const durationMs = Date.now() - startTime;
      workerLogger.info('worker.scheduled.completed', {
        durationMs,
        details: {
          processed: 0,
          succeeded: 0,
          failed: 0
        }
      });
      return {
        status: 'completed',
        processed: 0,
        succeeded: 0,
        failed: 0
      };
    }

    let succeeded = 0;
    let failed = 0;

    for (const userRow of eligibleUsers) {
      const userId = userRow.user_id;
      try {
        if (customSyncUser) {
          await customSyncUser({ userId, profileRepo, notificationRepo });
        }
        await profileRepo.updateLastNotificationSync(userId);
        succeeded++;
      } catch (err) {
        workerLogger.error('worker.user.failed', {
          details: {
            // SENSITIVE TELEMETRY: userRef is a non-cryptographic pseudonymous correlation
            // identifier for operational diagnostics only.
            userRef: pseudonymizeId(userId),
            retryable: true
          },
          error: err
        });
        // Do NOT advance last_notification_sync on failure.
        // Catching the error ensures subsequent users in the batch continue processing without starvation.
        failed++;
      }
    }

    const durationMs = Date.now() - startTime;
    workerLogger.info('worker.scheduled.completed', {
      durationMs,
      details: {
        processed: eligibleUsers.length,
        succeeded,
        failed
      }
    });

    return {
      status: 'completed',
      processed: eligibleUsers.length,
      succeeded,
      failed
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    workerLogger.error('worker.scheduled.failed', {
      durationMs,
      error: err
    });
    return {
      status: 'error',
      error: err.message
    };
  }
}

export default {
  async scheduled(event, env, ctx) {
    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(handleScheduledNotifications(event, env, ctx));
    } else {
      await handleScheduledNotifications(event, env, ctx);
    }
  }
};

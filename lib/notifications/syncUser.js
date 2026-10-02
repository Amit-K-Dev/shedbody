import { createAdminClient } from '@/lib/supabase/admin';
import { generateNotificationCandidates } from '@/lib/notifications/engine';
import { getHistoricalAnchors } from '@/lib/notifications/anchors';

import { getProfileData } from '@/lib/dashboard/getProfileData';
import { getBoundedProgress } from '@/lib/analytics/progress';
import { getActiveGoal } from '@/lib/goals';
import { getHabitsData } from '@/lib/dashboard/getHabitsData';
import { getLifestyleData } from '@/lib/dashboard/getLifestyleData';
import { getNutritionData } from '@/lib/dashboard/getNutritionData';
import { getNotificationPreferences } from '@/lib/dashboard/getNotificationPreferences';
import { getAdaptationEvents } from '@/lib/dashboard/getAdaptationEvents';

/**
 * Synchronizes notifications for a given user.
 * 
 * @param {Object} authContext - { supabase, userId }
 * @returns {Promise<{ success: boolean, created: number }>}
 */
export async function syncUser(authContext) {
  const { userId } = authContext;
  if (!userId) {
    throw new Error('syncUser requires a valid userId in authContext');
  }

  // 1. Fetch required context
  // Bound the primary fetch to 30 days to keep performance reasonable for the engine,
  // while also fetching narrow historical anchors to prevent inactivity cutoff bugs.
  const now = new Date();
  const past = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
  const endDate = now.toISOString().slice(0, 10);
  const startDate = past.toISOString().slice(0, 10);

  const [
    profileData,
    progressEntries,
    activeWeightGoal,
    habitEntries,
    lifestyleLogs,
    nutritionLogs,
    preferences,
    adaptationEvents,
    anchors
  ] = await Promise.all([
    getProfileData(authContext),
    getBoundedProgress(authContext, startDate, endDate),
    getActiveGoal('weight', authContext),
    getHabitsData(authContext, startDate, endDate),
    getLifestyleData(authContext, startDate, endDate),
    getNutritionData(authContext, startDate, endDate),
    getNotificationPreferences(authContext),
    getAdaptationEvents(authContext, 5), // Get last 5 events (not date bounded)
    getHistoricalAnchors(authContext)
  ]);

  // Merge recent 30-day bounded data with absolute historical anchors.
  // The engine's `generateHabitMatrix` safely deduplicates by date or simply assigns true if any log has completion.
  const systemContext = {
    habitEntries: [...habitEntries, ...anchors.habitEntries],
    lifestyleLogs: [...lifestyleLogs, ...anchors.lifestyleLogs],
    nutritionLogs: [...nutritionLogs, ...anchors.nutritionLogs],
    progressEntries: [...progressEntries, ...anchors.progressEntries],
    adaptationEvents
  };

  // Current Date as YYYY-MM-DD
  const currentDate = endDate;

  // 2. Generate Candidates (Pure Engine)
  const goals = activeWeightGoal ? [activeWeightGoal] : [];
  
  // Timeline is unused inside engine in this implementation, pass empty array
  const candidates = generateNotificationCandidates(
    profileData,
    [],
    goals,
    preferences,
    systemContext,
    currentDate
  );

  if (!candidates || candidates.length === 0) {
    return { success: true, created: 0 };
  }

  // 3. Persist Candidates Safely Using Admin Client
  const adminSupabase = createAdminClient();

  const { error: insertError } = await adminSupabase
    .from('notifications')
    .upsert(candidates, {
      onConflict: 'user_id,deterministic_key',
      ignoreDuplicates: true
    });

  if (insertError) {
    console.error(`Failed to insert notifications for user ${userId}:`, insertError);
    throw new Error('Database insertion failed');
  }

  return { success: true, created: candidates.length };
}

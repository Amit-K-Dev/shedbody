import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    // 2. Fetch required context
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

    // 3. Generate Candidates (Pure Engine)
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
      return NextResponse.json({ success: true, created: 0 });
    }

    // 4. Persist Candidates Safely Using Admin Client
    const adminSupabase = createAdminClient();

    const { error: insertError } = await adminSupabase
      .from('notifications')
      .upsert(candidates, {
        onConflict: 'user_id,deterministic_key',
        ignoreDuplicates: true
      });

    if (insertError) {
      console.error('Failed to insert notifications:', insertError);
      throw new Error('Database insertion failed');
    }

    return NextResponse.json({ success: true, created: candidates.length });

  } catch (error) {
    console.error('Notification Sync Error:', error);
    // Return safe 500 error, no sensitive details
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

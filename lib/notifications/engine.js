import { generateHabitMatrix, PREDEFINED_HABITS } from '../habits/engine.js';

/**
 * Calculates the difference in full calendar days between two ISO date strings (YYYY-MM-DD).
 */
function diffDays(currentDateStr, pastDateStr) {
  const current = new Date(currentDateStr + "T00:00:00Z");
  const past = new Date(pastDateStr + "T00:00:00Z");
  return Math.floor((current.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns the ISO week format (YYYY-Www) for a given date.
 */
function getISOWeek(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

/**
 * Generates notification candidates deterministically based on input state.
 * No internal Date.now() usage or implicit timezone logic.
 */
export function generateNotificationCandidates(
  userProfile,
  timeline,
  goals,
  preferences,
  systemContext,
  currentDate
) {
  const candidates = [];
  
  if (!userProfile || !userProfile.user_id || !currentDate) {
    return candidates;
  }
  
  const prefs = {
    workout_reminders: true,
    goal_reminders: true,
    habit_reminders: true,
    weekly_progress: true,
    plan_updates: true,
    ...(preferences || {})
  };
  
  const {
    habitEntries = [],
    lifestyleLogs = [],
    nutritionLogs = [],
    progressEntries = [],
    adaptationEvents = []
  } = systemContext || {};

  const matrix = generateHabitMatrix(habitEntries, lifestyleLogs, nutritionLogs);

  // 1. WORKOUT REMINDER
  if (prefs.workout_reminders !== false) {
    let lastWorkoutDate = null;
    for (const day of matrix) {
      if (day.habits.workout) {
        lastWorkoutDate = day.date;
        break; // matrix is sorted descending, so first is newest
      }
    }
    
    if (lastWorkoutDate) {
      const daysSince = diffDays(currentDate, lastWorkoutDate);
      if (daysSince >= 3) {
        candidates.push({
          user_id: userProfile.user_id,
          type: 'workout_reminder',
          title: 'Time to get moving',
          message: 'It\'s been a few days since your last workout. Ready to jump back in?',
          action_url: '/dashboard',
          deterministic_key: `workout_reminder_since_${lastWorkoutDate}`
        });
      }
    }
  }

  // 2. GOAL REMINDER
  if (prefs.goal_reminders !== false && goals && Array.isArray(goals)) {
    for (const goal of goals) {
      if (goal.status === 'active' && goal.domain === 'weight') {
        let lastEntryDate = null;
        for (const entry of progressEntries) {
          if (entry.weight !== null && entry.weight !== undefined) {
            const entryDate = entry.entry_date || (entry.created_at ? entry.created_at.slice(0, 10) : null);
            if (!lastEntryDate || entryDate > lastEntryDate) {
              lastEntryDate = entryDate;
            }
          }
        }
        
        if (lastEntryDate) {
          const daysSince = diffDays(currentDate, lastEntryDate);
          if (daysSince >= 5) {
            candidates.push({
              user_id: userProfile.user_id,
              type: 'goal_reminder',
              title: 'Goal check-in',
              message: 'Update your progress to stay on track with your goal.',
              action_url: '/dashboard',
              deterministic_key: `goal_reminder_${goal.id}_since_${lastEntryDate}`
            });
          }
        }
      }
    }
  }

  // 3. HABIT REMINDER
  if (prefs.habit_reminders !== false) {
    // Determine history for each habit
    const habitHistory = {};
    PREDEFINED_HABITS.forEach(h => habitHistory[h] = false);
    
    for (const day of matrix) {
      for (const h of PREDEFINED_HABITS) {
        if (day.habits[h]) {
          habitHistory[h] = true;
        }
      }
    }
    
    for (const h of PREDEFINED_HABITS) {
      if (h === 'workout') continue; // Exclude workout to prevent duplicates with workout_reminder
      
      if (habitHistory[h]) {
        let lastCompletionDate = null;
        for (const day of matrix) {
          if (day.habits[h]) {
            lastCompletionDate = day.date;
            break; // sorted newest first
          }
        }
        
        if (lastCompletionDate) {
          const daysSince = diffDays(currentDate, lastCompletionDate);
          if (daysSince >= 2) {
            candidates.push({
              user_id: userProfile.user_id,
              type: 'habit_reminder',
              title: 'Keep your streak alive',
              message: `Don't forget to log your ${h} today.`,
              action_url: '/dashboard',
              deterministic_key: `habit_reminder_${h}_since_${lastCompletionDate}`
            });
          }
        }
      }
    }
  }

  // 4. WEEKLY PROGRESS
  if (prefs.weekly_progress !== false) {
    const currentD = new Date(currentDate + "T00:00:00Z");
    if (currentD.getUTCDay() === 0) { // 0 = Sunday
      candidates.push({
        user_id: userProfile.user_id,
        type: 'weekly_progress',
        title: 'Weekly Progress',
        message: 'Your weekly progress report is ready.',
        action_url: '/reports',
        deterministic_key: `weekly_progress_${getISOWeek(currentDate)}`
      });
    }
  }

  // 5. PLAN UPDATE
  if (prefs.plan_updates !== false && adaptationEvents && Array.isArray(adaptationEvents)) {
    for (const event of adaptationEvents) {
      if (event.id) {
        candidates.push({
          user_id: userProfile.user_id,
          type: 'plan_update',
          title: 'Plan Adapted',
          message: 'Your plan has been updated based on your recent progress.',
          action_url: '/dashboard',
          deterministic_key: `plan_update_${event.id}`
        });
      }
    }
  }

  return candidates;
}

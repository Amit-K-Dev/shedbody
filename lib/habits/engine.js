export const PREDEFINED_HABITS = [
  'workout',
  'steps',
  'water',
  'sleep',
  'protein',
  'meditation'
];

/**
 * Builds a deterministic daily habit completion matrix.
 * Derives completion status from lifestyle_logs and nutrition_logs to avoid duplicate sources of truth.
 * Falls back to explicit habit_entries where applicable (e.g., meditation).
 *
 * @param {Array} habitEntries - Explicit boolean habit completions from DB
 * @param {Array} lifestyleLogs - Daily lifestyle logs from DB
 * @param {Array} nutritionLogs - Daily nutrition logs from DB
 * @returns {Array} List of daily habit summaries sorted chronologically descending
 */
export function generateHabitMatrix(habitEntries = [], lifestyleLogs = [], nutritionLogs = []) {
  const map = new Map();

  const getOrCreate = (date) => {
    if (!map.has(date)) {
      map.set(date, {
        date: date,
        habits: {
          workout: false,
          steps: false,
          water: false,
          sleep: false,
          protein: false,
          meditation: false
        }
      });
    }
    return map.get(date);
  };

  // 1. Process explicit habit entries (baseline)
  for (const entry of habitEntries || []) {
    const date = entry.log_date || (entry.created_at ? entry.created_at.slice(0, 10) : null);
    if (!date || !entry.habit_name) continue;
    const day = getOrCreate(date);
    if (day.habits[entry.habit_name] !== undefined) {
      day.habits[entry.habit_name] = Boolean(entry.completed);
    }
  }

  // 2. Derive native metrics (overrides explicit entries to enforce single source of truth)
  for (const log of lifestyleLogs || []) {
    const date = log.log_date || (log.created_at ? log.created_at.slice(0, 10) : null);
    if (!date) continue;
    const day = getOrCreate(date);
    
    if (log.workout_completed) {
      day.habits.workout = true;
    }
    // MVP rule: Any logged steps count > 0 is considered habit completed for the day
    if (log.steps_count !== null && log.steps_count !== undefined && log.steps_count > 0) {
      day.habits.steps = true;
    }
    // MVP rule: Any logged sleep > 0 is considered habit completed
    if (log.sleep_hours !== null && log.sleep_hours !== undefined && log.sleep_hours > 0) {
      day.habits.sleep = true;
    }
  }

  for (const log of nutritionLogs || []) {
    const date = log.log_date || (log.created_at ? log.created_at.slice(0, 10) : null);
    if (!date) continue;
    const day = getOrCreate(date);

    // MVP rule: Any logged water > 0 is considered habit completed
    if (log.water_ml !== null && log.water_ml !== undefined && log.water_ml > 0) {
      day.habits.water = true;
    }
    // MVP rule: Any logged protein > 0 is considered habit completed
    if (log.protein_consumed !== null && log.protein_consumed !== undefined && log.protein_consumed > 0) {
      day.habits.protein = true;
    }
  }

  // 3. Return array sorted by date descending (newest first)
  return Array.from(map.values()).sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });
}

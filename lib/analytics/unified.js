export function mergeDailyMetrics(progressEntries = [], nutritionLogs = [], lifestyleLogs = []) {
  const map = new Map();

  const getOrCreate = (date) => {
    if (!map.has(date)) {
      map.set(date, {
        date: date,
        body: { weight: null, bodyFat: null },
        nutrition: { calories: null, protein: null, water: null },
        lifestyle: { workoutCompleted: null, steps: null, sleepHours: null }
      });
    }
    return map.get(date);
  };

  const safeNumber = (val) => (val === null || val === undefined || val === "") ? null : Number(val);
  const safeBoolean = (val) => (val === null || val === undefined || val === "") ? null : Boolean(val);

  // 1. Process Progress Entries (Body)
  // Sort by created_at ascending to ensure the latest entry for a day overwrites earlier ones.
  const sortedProgress = [...progressEntries].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeA - timeB;
  });

  for (const item of sortedProgress) {
    const date = item.entry_date || (item.created_at ? item.created_at.slice(0, 10) : null);
    if (!date) continue;

    const entry = getOrCreate(date);
    if (item.weight !== undefined) entry.body.weight = safeNumber(item.weight);
    if (item.body_fat !== undefined) entry.body.bodyFat = safeNumber(item.body_fat);
  }

  // 2. Process Nutrition Logs
  for (const item of nutritionLogs) {
    const date = item.log_date;
    if (!date) continue;

    const entry = getOrCreate(date);
    if (item.calories !== undefined) entry.nutrition.calories = safeNumber(item.calories);
    if (item.protein !== undefined) entry.nutrition.protein = safeNumber(item.protein);
    if (item.water_ml !== undefined) entry.nutrition.water = safeNumber(item.water_ml);
  }

  // 3. Process Lifestyle Logs
  for (const item of lifestyleLogs) {
    const date = item.log_date;
    if (!date) continue;

    const entry = getOrCreate(date);
    if (item.workout_completed !== undefined) {
      entry.lifestyle.workoutCompleted = safeBoolean(item.workout_completed);
    }
    if (item.steps_count !== undefined) {
      entry.lifestyle.steps = safeNumber(item.steps_count);
    }
    if (item.sleep_hours !== undefined) {
      entry.lifestyle.sleepHours = safeNumber(item.sleep_hours);
    }
  }

  // 4. Return sorted by date ASC
  return Array.from(map.values()).sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return 0;
  });
}

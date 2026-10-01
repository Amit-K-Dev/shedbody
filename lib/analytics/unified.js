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

/**
 * Generates a unified, deterministic chronological timeline of health events.
 * 
 * @param {Array} progressEntries - DB rows from progress_entries
 * @param {Array} nutritionLogs - DB rows from nutrition_logs
 * @param {Array} lifestyleLogs - DB rows from lifestyle_logs
 * @param {Array} insights - Generated deterministic insights
 * @param {Object} options - { startDate, endDate, limit }
 * @returns {Array} Timeline items sorted chronologically (descending by timestamp)
 */
export function generateTimeline(progressEntries = [], nutritionLogs = [], lifestyleLogs = [], insights = [], options = {}) {
  const events = [];
  const seenIds = new Set();
  const { startDate, endDate, limit } = options;

  const pushEvent = (event) => {
    if (startDate && event.date < startDate) return;
    if (endDate && event.date > endDate) return;
    
    if (seenIds.has(event.id)) return;
    seenIds.add(event.id);
    
    events.push(event);
  };

  // 1. Process Progress Entries (Body)
  for (const item of progressEntries || []) {
    const date = item.entry_date || (item.created_at ? item.created_at.slice(0, 10) : null);
    if (!date) continue;
    const timestamp = item.created_at || `${date}T00:00:00.000Z`;

    if (item.weight !== undefined && item.weight !== null) {
      pushEvent({
        id: `weight-${item.id || timestamp}`,
        date,
        timestamp,
        type: 'body',
        label: 'Weight',
        value: `${item.weight} kg`,
        source: 'user',
        _sortWeight: 1
      });
    }
  }

  // 2. Process Lifestyle Logs (Workouts and Steps)
  for (const item of lifestyleLogs || []) {
    const date = item.log_date || (item.created_at ? item.created_at.slice(0, 10) : null);
    if (!date) continue;
    const timestamp = item.created_at || `${date}T00:00:00.000Z`;

    if (item.workout_completed) {
      pushEvent({
        id: `workout-${item.id || timestamp}`,
        date,
        timestamp,
        type: 'lifestyle',
        label: 'Workout completed',
        value: true,
        source: 'user',
        _sortWeight: 2
      });
    }

    if (item.steps_count !== undefined && item.steps_count !== null) {
      pushEvent({
        id: `steps-${item.id || timestamp}`,
        date,
        timestamp,
        type: 'lifestyle',
        label: 'Steps',
        value: `${item.steps_count.toLocaleString()} steps`,
        source: 'device',
        _sortWeight: 3
      });
    }
  }

  // 3. Process Nutrition Logs (Nutrition and Water)
  for (const item of nutritionLogs || []) {
    const date = item.log_date || (item.created_at ? item.created_at.slice(0, 10) : null);
    if (!date) continue;
    const timestamp = item.created_at || `${date}T00:00:00.000Z`;

    if (item.calories !== undefined && item.calories !== null) {
      pushEvent({
        id: `nutrition-${item.id || timestamp}`,
        date,
        timestamp,
        type: 'nutrition',
        label: 'Nutrition logged',
        value: `${item.calories} kcal`,
        source: 'user',
        _sortWeight: 4
      });
    }

    if (item.water_ml !== undefined && item.water_ml !== null) {
      const waterL = (item.water_ml / 1000).toFixed(1);
      pushEvent({
        id: `water-${item.id || timestamp}`,
        date,
        timestamp,
        type: 'nutrition',
        label: 'Water',
        value: `${waterL} L`,
        source: 'user',
        _sortWeight: 5
      });
    }
  }

  // 4. Process Insights
  for (const item of insights || []) {
    if (!item.timestamp) continue;
    const date = item.timestamp.slice(0, 10);
    const timestamp = item.timestamp.length > 10 ? item.timestamp : `${date}T00:00:00.000Z`;

    // Make label a readable format (e.g., "WEIGHT TREND CHANGE" -> "Weight trend change")
    const formattedLabel = item.id.replace(/_/g, ' ').toLowerCase();
    const finalLabel = formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1);

    pushEvent({
      id: `insight-${item.id}-${timestamp}`,
      date,
      timestamp,
      type: 'insight',
      label: 'AI insight generated',
      value: item.observation,
      source: 'ai',
      _sortWeight: 6
    });
  }

  // 5. Deterministic sorting
  events.sort((a, b) => {
    // Descending by timestamp (newer first)
    if (a.timestamp > b.timestamp) return -1;
    if (a.timestamp < b.timestamp) return 1;
    
    // If same timestamp, use deterministic _sortWeight tie-breaker
    return a._sortWeight - b._sortWeight;
  });

  // 6. Apply limit if provided
  let finalEvents = events;
  if (limit && typeof limit === 'number' && limit > 0) {
    finalEvents = finalEvents.slice(0, limit);
  }

  // 7. Remove internal sort fields
  return finalEvents.map(({ _sortWeight, ...rest }) => rest);
}

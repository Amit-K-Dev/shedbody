function addDays(dateStr, days) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Generates a deterministic report based on a timeline.
 * 
 * @param {Array} timeline - Array of chronological events
 * @param {String} type - 'weekly', 'monthly', 'goal', 'progress'
 * @param {Object} goal - Goal context (e.g., { domain: 'weight', target_value: 75, start_value: 80 })
 * @param {String} currentDate - YYYY-MM-DD
 * @param {Object} options - { startDate, endDate } overrides
 */
export function generateReport(timeline = [], type = 'weekly', goal = null, currentDate = new Date().toISOString().slice(0,10), options = {}) {
  const report = {
    type,
    period: { start: null, end: null },
    whatHappened: [],
    whatImproved: [],
    whatDeclined: [],
    importantTrends: [],
    recommendations: []
  };

  if (!timeline || !Array.isArray(timeline) || timeline.length === 0) {
    report.whatHappened.push("No data available for this period.");
    return report;
  }

  // Determine period boundaries
  let startDate = options.startDate;
  let endDate = options.endDate || currentDate;

  if (!startDate) {
    if (type === 'weekly') startDate = addDays(endDate, -6);
    else if (type === 'monthly') startDate = addDays(endDate, -29);
    else {
      // For 'goal' or 'progress', default to the first event's date in the timeline
      const dates = timeline.map(e => e.date).sort();
      startDate = dates.length > 0 ? dates[0] : endDate;
    }
  }

  report.period = { start: startDate, end: endDate };

  // Filter timeline for this period
  const periodEvents = timeline.filter(e => e.date >= startDate && e.date <= endDate);
  
  if (periodEvents.length === 0) {
    report.whatHappened.push(`No activity recorded between ${startDate} and ${endDate}.`);
    return report;
  }

  // Aggregate metrics
  let workoutCount = 0;
  let totalSteps = 0;
  let stepsDays = 0;
  let weightEntries = [];
  let insights = [];

  for (const event of periodEvents) {
    if (event.type === 'lifestyle' && event.label === 'Workout completed') {
      workoutCount++;
    }
    if (event.type === 'lifestyle' && event.label === 'Steps') {
      const steps = parseInt(event.value.replace(/,/g, ''), 10);
      if (!isNaN(steps)) {
        totalSteps += steps;
        stepsDays++;
      }
    }
    if (event.type === 'body' && event.label === 'Weight') {
      const w = parseFloat(event.value);
      if (!isNaN(w)) {
        weightEntries.push({ date: event.date, weight: w });
      }
    }
    if (event.type === 'insight') {
      insights.push(event.value);
    }
  }

  // Sort weight entries chronologically
  weightEntries.sort((a, b) => a.date.localeCompare(b.date));

  // 1. What happened
  report.whatHappened.push(`Logged ${periodEvents.length} total events.`);
  if (workoutCount > 0) report.whatHappened.push(`Completed ${workoutCount} workouts.`);
  if (stepsDays > 0) {
    const avgSteps = Math.round(totalSteps / stepsDays);
    report.whatHappened.push(`Averaged ${avgSteps.toLocaleString()} steps across ${stepsDays} logged days.`);
  }

  // 2. Weight Analysis (Improvements / Declines / Trends)
  if (weightEntries.length >= 2) {
    const firstW = weightEntries[0].weight;
    const lastW = weightEntries[weightEntries.length - 1].weight;
    const diff = lastW - firstW;
    const absDiff = Math.abs(diff);
    const diffStr = absDiff.toFixed(1) + ' kg';

    report.importantTrends.push(`Weight changed from ${firstW} kg to ${lastW} kg (${diff > 0 ? '+' : '-'}${diffStr}).`);

    if (absDiff >= 0.1) {
      if (!goal || goal.domain !== 'weight' || goal.start_value === undefined || goal.target_value === undefined) {
        report.whatHappened.push(`Weight ${diff > 0 ? 'increased' : 'decreased'} by ${diffStr} (neutral/uncertain without a specific weight goal).`);
      } else {
        // Evaluate based on goal
        const isLosingWeightGoal = goal.start_value > goal.target_value;
        const isGainingWeightGoal = goal.start_value < goal.target_value;
        
        if (isLosingWeightGoal) {
          if (diff < 0) {
            report.whatImproved.push(`Weight dropped by ${diffStr}, moving towards fat loss goal.`);
          } else {
            report.whatDeclined.push(`Weight increased by ${diffStr}, moving away from fat loss goal.`);
          }
        } else if (isGainingWeightGoal) {
          if (diff > 0) {
            report.whatImproved.push(`Weight increased by ${diffStr}, moving towards muscle gain goal.`);
          } else {
            report.whatDeclined.push(`Weight dropped by ${diffStr}, moving away from muscle gain goal.`);
          }
        } else {
           report.whatHappened.push(`Weight ${diff > 0 ? 'increased' : 'decreased'} by ${diffStr}.`);
        }
      }
    } else {
      report.importantTrends.push(`Weight remained relatively stable.`);
    }
  } else if (weightEntries.length === 1) {
     report.whatHappened.push(`Logged weight once (${weightEntries[0].weight} kg). Need more data for trends.`);
  }

  // Lifestyle improvements/declines
  if (type === 'weekly') {
    if (workoutCount >= 3) {
      report.whatImproved.push(`Strong workout consistency (${workoutCount} workouts this week).`);
    } else if (workoutCount === 0) {
      report.whatDeclined.push(`No workouts logged this week.`);
    }
  }

  // 4. Insights mapping to trends
  if (insights.length > 0) {
    report.importantTrends.push(`Generated ${insights.length} AI insight(s) during this period.`);
  }

  // 5. Recommendations
  if (report.whatDeclined.length > 0) {
    report.recommendations.push("Focus on recovering consistency in areas that declined this period.");
  } else if (report.whatImproved.length > 0) {
    report.recommendations.push("Keep up the great momentum! Consistency is key.");
  } else if (periodEvents.length > 0) {
    report.recommendations.push("Ensure you log your weight, workouts, and nutrition to get better insights.");
  }

  return report;
}

export const rules = [
  {
    id: "WEIGHT_TREND_CHANGE",
    category: "body",
    priority: 10,
    canEvaluate: (timeline) => {
      if (!timeline || timeline.length === 0) return false;
      
      const latestDate = timeline[timeline.length - 1].date;
      const currentStart = _addDays(latestDate, -6);
      const previousStart = _addDays(latestDate, -13);
      const previousEnd = _addDays(latestDate, -7);

      let currentValid = 0;
      let previousValid = 0;

      for (const entry of timeline) {
        if (entry.body && entry.body.weight !== null && entry.body.weight !== undefined) {
          if (entry.date >= currentStart && entry.date <= latestDate) {
            currentValid++;
          } else if (entry.date >= previousStart && entry.date <= previousEnd) {
            previousValid++;
          }
        }
      }

      return currentValid >= 2 && previousValid >= 1;
    },
    evaluate: (timeline) => {
      const latestDate = timeline[timeline.length - 1].date;
      const currentStart = _addDays(latestDate, -6);
      const previousStart = _addDays(latestDate, -13);
      const previousEnd = _addDays(latestDate, -7);

      let currentSum = 0;
      let currentCount = 0;
      let previousSum = 0;
      let previousCount = 0;

      for (const entry of timeline) {
        if (entry.body && entry.body.weight !== null && entry.body.weight !== undefined) {
          if (entry.date >= currentStart && entry.date <= latestDate) {
            currentSum += entry.body.weight;
            currentCount++;
          } else if (entry.date >= previousStart && entry.date <= previousEnd) {
            previousSum += entry.body.weight;
            previousCount++;
          }
        }
      }

      const currentAvg = currentSum / currentCount;
      const previousAvg = previousSum / previousCount;
      const diff = currentAvg - previousAvg;
      
      if (Math.abs(diff) < 0.5) {
        return null;
      }

      const direction = diff > 0 ? "higher" : "lower";
      const confidence = currentCount >= 4 && previousCount >= 3 ? "high" : "medium";

      return {
        id: "WEIGHT_TREND_CHANGE",
        category: "body",
        priority: 10,
        observation: "Your average weight changed over the comparison period.",
        evidence: `Previous 7-day average: ${previousAvg.toFixed(1)} kg; current 7-day average: ${currentAvg.toFixed(1)} kg; change: ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg.`,
        interpretation: `Your recent average weight is ${direction} than the previous comparison period.`,
        recommendation: "Continue logging weight consistently so the trend can be monitored over time.",
        confidence: confidence,
        timestamp: latestDate,
        type: "info"
      };
    }
  },
  {
    id: "WORKOUT_CONSISTENCY",
    category: "lifestyle",
    priority: 20,
    canEvaluate: (timeline) => {
      if (!timeline || timeline.length === 0) return false;
      const latestDate = timeline[timeline.length - 1].date;
      const currentStart = _addDays(latestDate, -6);
      const previousStart = _addDays(latestDate, -13);
      const previousEnd = _addDays(latestDate, -7);

      let currentValid = 0;
      let previousValid = 0;

      for (const entry of timeline) {
        if (entry.lifestyle && (entry.lifestyle.workoutCompleted === true || entry.lifestyle.workoutCompleted === false)) {
          if (entry.date >= currentStart && entry.date <= latestDate) {
            currentValid++;
          } else if (entry.date >= previousStart && entry.date <= previousEnd) {
            previousValid++;
          }
        }
      }
      return currentValid >= 2 && previousValid >= 1;
    },
    evaluate: (timeline) => {
      const latestDate = timeline[timeline.length - 1].date;
      const currentStart = _addDays(latestDate, -6);
      const previousStart = _addDays(latestDate, -13);
      const previousEnd = _addDays(latestDate, -7);

      let currentTrue = 0;
      let previousTrue = 0;
      let latestValidDate = "";

      for (const entry of timeline) {
        if (entry.lifestyle && (entry.lifestyle.workoutCompleted === true || entry.lifestyle.workoutCompleted === false)) {
          if (entry.date >= currentStart && entry.date <= latestDate) {
            if (entry.lifestyle.workoutCompleted === true) currentTrue++;
            if (entry.date > latestValidDate) latestValidDate = entry.date;
          } else if (entry.date >= previousStart && entry.date <= previousEnd) {
            if (entry.lifestyle.workoutCompleted === true) previousTrue++;
          }
        }
      }

      if (currentTrue === previousTrue) {
        return null;
      }

      if (currentTrue < previousTrue) {
        return {
          id: "WORKOUT_CONSISTENCY_DROP",
          category: "lifestyle",
          priority: 20,
          observation: "Your workout frequency decreased this week.",
          evidence: `Previous 7 days: ${previousTrue} workout(s). Current 7 days: ${currentTrue} workout(s).`,
          interpretation: "You completed fewer workouts in the current comparison period.",
          recommendation: "Try to schedule a light session to rebuild your momentum.",
          confidence: "medium",
          timestamp: latestValidDate,
          type: "warning"
        };
      } else {
        return {
          id: "WORKOUT_CONSISTENCY_IMPROVED",
          category: "lifestyle",
          priority: 20,
          observation: "Your workout frequency increased this week.",
          evidence: `Previous 7 days: ${previousTrue} workout(s). Current 7 days: ${currentTrue} workout(s).`,
          interpretation: "You successfully completed more workouts in the current comparison period.",
          recommendation: "Keep up the excellent consistency and ensure you are recovering adequately.",
          confidence: "high",
          timestamp: latestValidDate,
          type: "positive"
        };
      }
    }
  },
  {
    id: "NUTRITION_CALORIC_ADHERENCE",
    category: "nutrition",
    priority: 30,
    canEvaluate: (timeline, profile, activePlan) => {
      if (!timeline || timeline.length === 0) return false;
      if (!activePlan || typeof activePlan.calories !== 'number' || !Number.isFinite(activePlan.calories) || activePlan.calories <= 0) return false;

      const latestDate = timeline[timeline.length - 1].date;
      const currentStart = _addDays(latestDate, -6);
      let currentValid = 0;

      for (const entry of timeline) {
        if (entry.nutrition && typeof entry.nutrition.calories === 'number') {
          if (entry.date >= currentStart && entry.date <= latestDate) {
            currentValid++;
          }
        }
      }

      return currentValid >= 3;
    },
    evaluate: (timeline, profile, activePlan) => {
      const latestDate = timeline[timeline.length - 1].date;
      const currentStart = _addDays(latestDate, -6);
      
      let sum = 0;
      let count = 0;
      let latestValidDate = "";

      for (const entry of timeline) {
        if (entry.nutrition && typeof entry.nutrition.calories === 'number') {
          if (entry.date >= currentStart && entry.date <= latestDate) {
            sum += entry.nutrition.calories;
            count++;
            if (entry.date > latestValidDate) latestValidDate = entry.date;
          }
        }
      }

      const average = sum / count;
      const target = activePlan.calories;
      const deviation = Math.abs(average - target) / target;

      if (deviation <= 0.10) {
        return {
          id: "NUTRITION_CALORIC_ADHERENCE_POSITIVE",
          category: "nutrition",
          priority: 30,
          observation: "You are accurately hitting your calorie target.",
          evidence: `7-day average: ${Math.round(average)} kcal. Target: ${Math.round(target)} kcal (within 10%).`,
          interpretation: "Your recent caloric intake is well-aligned with your active plan.",
          recommendation: "Maintain this intake level for consistent progress.",
          confidence: count >= 5 ? "high" : "medium",
          timestamp: latestValidDate,
          type: "positive"
        };
      }

      return null;
    }
  }
];

function _addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

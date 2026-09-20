export const rules = [
  {
    id: "WEIGHT_TREND_CHANGE",
    category: "body",
    priority: 10,
    canEvaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      if (!timeline || timeline.length === 0) return false;
      if (!isValidDate(currentDate)) return false;
      
      const currentStart = _addDays(currentDate, -6);
      const previousStart = _addDays(currentDate, -13);
      const previousEnd = _addDays(currentDate, -7);

      let currentValid = 0;
      let previousValid = 0;

      for (const entry of timeline) {
        if (entry.body && entry.body.weight !== null && entry.body.weight !== undefined) {
          if (entry.date >= currentStart && entry.date <= currentDate) {
            currentValid++;
          } else if (entry.date >= previousStart && entry.date <= previousEnd) {
            previousValid++;
          }
        }
      }

      return currentValid >= 2 && previousValid >= 1;
    },
    evaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      const currentStart = _addDays(currentDate, -6);
      const previousStart = _addDays(currentDate, -13);
      const previousEnd = _addDays(currentDate, -7);

      let currentSum = 0;
      let currentCount = 0;
      let previousSum = 0;
      let previousCount = 0;
      let latestWeightDate = "";

      for (const entry of timeline) {
        if (entry.body && entry.body.weight !== null && entry.body.weight !== undefined) {
          if (entry.date >= currentStart && entry.date <= currentDate) {
            currentSum += entry.body.weight;
            currentCount++;
            if (entry.date > latestWeightDate) latestWeightDate = entry.date;
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
        timestamp: latestWeightDate,
        type: "info"
      };
    }
  },
  {
    id: "WORKOUT_CONSISTENCY",
    category: "lifestyle",
    priority: 20,
    canEvaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      if (!timeline || timeline.length === 0) return false;
      if (!isValidDate(currentDate)) return false;
      
      const currentStart = _addDays(currentDate, -6);
      const previousStart = _addDays(currentDate, -13);
      const previousEnd = _addDays(currentDate, -7);

      let currentValid = 0;
      let previousValid = 0;

      for (const entry of timeline) {
        if (entry.lifestyle && (entry.lifestyle.workoutCompleted === true || entry.lifestyle.workoutCompleted === false)) {
          if (entry.date >= currentStart && entry.date <= currentDate) {
            currentValid++;
          } else if (entry.date >= previousStart && entry.date <= previousEnd) {
            previousValid++;
          }
        }
      }
      return currentValid >= 2 && previousValid >= 1;
    },
    evaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      const currentStart = _addDays(currentDate, -6);
      const previousStart = _addDays(currentDate, -13);
      const previousEnd = _addDays(currentDate, -7);

      let currentTrue = 0;
      let previousTrue = 0;
      let latestValidDate = "";

      for (const entry of timeline) {
        if (entry.lifestyle && (entry.lifestyle.workoutCompleted === true || entry.lifestyle.workoutCompleted === false)) {
          if (entry.date >= currentStart && entry.date <= currentDate) {
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
    canEvaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      if (!timeline || timeline.length === 0) return false;
      if (!isValidDate(currentDate)) return false;
      if (!activePlan || typeof activePlan.calories !== 'number' || !Number.isFinite(activePlan.calories) || activePlan.calories <= 0) return false;

      const currentStart = _addDays(currentDate, -6);
      let currentValid = 0;

      for (const entry of timeline) {
        if (entry.nutrition && typeof entry.nutrition.calories === 'number' && Number.isFinite(entry.nutrition.calories)) {
          if (entry.date >= currentStart && entry.date <= currentDate) {
            currentValid++;
          }
        }
      }

      return currentValid >= 3;
    },
    evaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      const currentStart = _addDays(currentDate, -6);
      
      let sum = 0;
      let count = 0;
      let latestValidDate = "";

      for (const entry of timeline) {
        if (entry.nutrition && typeof entry.nutrition.calories === 'number' && Number.isFinite(entry.nutrition.calories)) {
          if (entry.date >= currentStart && entry.date <= currentDate) {
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
  },
  {
    id: "PROTEIN_CONSISTENCY",
    category: "nutrition",
    priority: 35,
    canEvaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      if (!timeline || timeline.length === 0) return false;
      if (!isValidDate(currentDate)) return false;
      if (!activePlan || typeof activePlan.protein !== 'number' || !Number.isFinite(activePlan.protein) || activePlan.protein <= 0) return false;

      const currentStart = _addDays(currentDate, -6);
      let currentValid = 0;

      for (const entry of timeline) {
        if (entry.nutrition && typeof entry.nutrition.protein === 'number' && Number.isFinite(entry.nutrition.protein)) {
          if (entry.date >= currentStart && entry.date <= currentDate) {
            currentValid++;
          }
        }
      }

      return currentValid >= 3;
    },
    evaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      const currentStart = _addDays(currentDate, -6);
      
      let sum = 0;
      let count = 0;
      let latestValidDate = "";

      for (const entry of timeline) {
        if (entry.nutrition && typeof entry.nutrition.protein === 'number' && Number.isFinite(entry.nutrition.protein)) {
          if (entry.date >= currentStart && entry.date <= currentDate) {
            sum += entry.nutrition.protein;
            count++;
            if (entry.date > latestValidDate) latestValidDate = entry.date;
          }
        }
      }

      const average = sum / count;
      const target = activePlan.protein;
      const deviation = Math.abs(average - target) / target;

      if (deviation <= 0.10) {
        return {
          id: "PROTEIN_CONSISTENCY_POSITIVE",
          category: "nutrition",
          priority: 35,
          observation: "You are accurately hitting your protein target.",
          evidence: `7-day average: ${Math.round(average)}g. Target: ${Math.round(target)}g (within 10%).`,
          interpretation: "Your recent protein intake is well-aligned with your active plan.",
          recommendation: "Maintain this intake level for consistent progress.",
          confidence: count >= 5 ? "high" : "medium",
          timestamp: latestValidDate,
          type: "positive"
        };
      }

      return null;
    }
  },
  {
    id: "GOAL_PROGRESS",
    category: "body",
    priority: 5,
    canEvaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      if (!timeline || timeline.length === 0) return false;
      if (!activeWeightGoal) return false;
      if (activeWeightGoal.domain !== "weight" || activeWeightGoal.status !== "active") return false;
      if (typeof activeWeightGoal.start_value !== 'number' || !Number.isFinite(activeWeightGoal.start_value)) return false;
      if (typeof activeWeightGoal.target_value !== 'number' || !Number.isFinite(activeWeightGoal.target_value)) return false;
      if (activeWeightGoal.start_value === activeWeightGoal.target_value) return false;

      let hasValidWeight = false;
      for (const entry of timeline) {
        if (entry.body && typeof entry.body.weight === 'number' && Number.isFinite(entry.body.weight)) {
          hasValidWeight = true;
          break;
        }
      }

      return hasValidWeight;
    },
    evaluate: (timeline, profile, activePlan, activeWeightGoal, currentDate) => {
      let latestWeight = null;
      let latestWeightDate = "";

      for (const entry of timeline) {
        if (entry.body && typeof entry.body.weight === 'number' && Number.isFinite(entry.body.weight)) {
          latestWeight = entry.body.weight;
          if (entry.date > latestWeightDate) {
             latestWeightDate = entry.date;
          }
        }
      }

      if (latestWeight === null) return null;

      const startValue = activeWeightGoal.start_value;
      const targetValue = activeWeightGoal.target_value;

      const rawProgress = (latestWeight - startValue) / (targetValue - startValue);
      const displayProgress = Math.max(0, Math.min(1, rawProgress));
      
      let interpretation = "";
      let displayPercentage = Math.round(displayProgress * 100);

      if (rawProgress >= 1) {
        interpretation = "You are at or beyond your target.";
      } else if (rawProgress < 0) {
        interpretation = "Your current weight is moving away from the target relative to the starting point.";
      } else {
        interpretation = `You have completed approximately ${displayPercentage}% of your weight goal.`;
      }

      return {
        id: "GOAL_PROGRESS_INFO",
        category: "body",
        priority: 5,
        observation: "Current state of your active weight goal.",
        evidence: `Start: ${startValue}, Target: ${targetValue}, Current: ${latestWeight}. Progress: ${displayPercentage}% (Raw: ${(rawProgress * 100).toFixed(1)}%).`,
        interpretation: interpretation,
        recommendation: "Keep tracking your weight to monitor your progress over time.",
        confidence: "high",
        timestamp: latestWeightDate,
        type: "info"
      };
    }
  }
];

function _addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isValidDate(dateStr) {
  if (typeof dateStr !== 'string' || dateStr.length !== 10) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  
  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(5, 7), 10);
  const day = parseInt(dateStr.slice(8, 10), 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  const d = new Date(dateStr + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return false;
  
  return d.getUTCFullYear() === year &&
         d.getUTCMonth() + 1 === month &&
         d.getUTCDate() === day;
}

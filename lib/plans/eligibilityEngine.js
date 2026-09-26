/**
 * CURRENT ADAPTIVE ELIGIBILITY POLICY CONSTANTS
 * Note: Target-adjustment policy (calorie math) is intentionally deferred.
 */
const POLICY = {
  EVALUATION_WINDOW_DAYS: 7,
  MIN_WEIGHT_LOGS: 2,
  MIN_NUTRITION_LOGS: 5,
  MIN_CALORIE_ADHERENCE: 85,
  MAX_CALORIE_ADHERENCE: 115,
  PLATEAU_THRESHOLD_KG_PER_DAY: 0.02,
  COOLDOWN_DAYS: 7
};

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Deterministically evaluates if an active plan is eligible for adaptation.
 * 
 * @param {Array} timeline - Array of metric entries
 * @param {Object} activePlan - The currently active plan
 * @param {Object} activeWeightGoal - The active weight goal
 * @param {String} currentDate - YYYY-MM-DD
 * @returns {Object} { eligible, reasonCode, evidence }
 */
export function evaluateAdaptationEligibility(timeline, activePlan, activeWeightGoal, currentDate) {
  if (!currentDate) {
    return failClosed("INSUFFICIENT_DATA", "Missing current date.");
  }

  // 1. Cooldown Check
  if (activePlan && activePlan.created_at) {
    const createdTime = new Date(activePlan.created_at).getTime();
    // Assuming currentDate is at 00:00:00Z of the current day for evaluation purposes,
    // or just use exact time diff. Let's use exact time diff to be safe.
    const currentTime = new Date(currentDate + "T00:00:00Z").getTime();
    
    // Fallback if created_at is not standard ISO, but standard is expected.
    if (!Number.isNaN(createdTime) && !Number.isNaN(currentTime)) {
      const daysSinceCreation = (currentTime - createdTime) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < POLICY.COOLDOWN_DAYS) {
        return failClosed("COOLDOWN_ACTIVE", `Plan is only ${daysSinceCreation.toFixed(1)} days old. Must be >= ${POLICY.COOLDOWN_DAYS}.`);
      }
    }
  }

  // 2. Goal Direction Check
  let goalDirection = "maintain";
  if (activeWeightGoal && activeWeightGoal.status === "active") {
    const start = activeWeightGoal.start_value;
    const target = activeWeightGoal.target_value;
    if (typeof start === "number" && typeof target === "number" && Number.isFinite(start) && Number.isFinite(target)) {
      if (start > target) goalDirection = "lose";
      else if (start < target) goalDirection = "gain";
    }
  }

  if (goalDirection === "maintain") {
    return failClosed("UNSUPPORTED_GOAL", "Goal direction is maintain or unsupported.");
  }

  // 3. Data Sufficiency Check
  const windowStart = addDays(currentDate, -(POLICY.EVALUATION_WINDOW_DAYS - 1)); // 7-day inclusive
  
  const validWindowEntries = (timeline || []).filter(entry => {
    return entry.date >= windowStart && entry.date <= currentDate;
  });

  // Extract weight logs
  const validWeights = validWindowEntries
    .filter(e => e.metrics && typeof e.metrics.weightKg === "number" && Number.isFinite(e.metrics.weightKg))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Extract nutrition logs
  const validNutrition = validWindowEntries
    .filter(e => e.metrics && typeof e.metrics.calories === "number" && Number.isFinite(e.metrics.calories));

  if (validNutrition.length < POLICY.MIN_NUTRITION_LOGS) {
    return failClosed("INSUFFICIENT_DATA", `Only ${validNutrition.length} nutrition logs in window. Minimum is ${POLICY.MIN_NUTRITION_LOGS}.`);
  }

  if (validWeights.length < POLICY.MIN_WEIGHT_LOGS) {
    return failClosed("INSUFFICIENT_DATA", `Only ${validWeights.length} weight logs in window. Minimum is ${POLICY.MIN_WEIGHT_LOGS}.`);
  }

  // 4. Adherence Check
  const calSum = validNutrition.reduce((sum, e) => sum + e.metrics.calories, 0);
  const calAvg = calSum / validNutrition.length;
  
  const targetCalories = activePlan && activePlan.calories ? activePlan.calories : null;
  if (!targetCalories || typeof targetCalories !== "number" || !Number.isFinite(targetCalories)) {
    return failClosed("INSUFFICIENT_DATA", "Active plan is missing valid target calories.");
  }

  const calorieAdherence = Math.round((calAvg / targetCalories) * 1000) / 10;
  
  if (calorieAdherence < POLICY.MIN_CALORIE_ADHERENCE || calorieAdherence > POLICY.MAX_CALORIE_ADHERENCE) {
    return failClosed("LOW_ADHERENCE", `Calorie adherence is ${calorieAdherence}%. Acceptable range is ${POLICY.MIN_CALORIE_ADHERENCE}%-${POLICY.MAX_CALORIE_ADHERENCE}%.`);
  }

  // 5. Weight Trend Check
  const firstW = validWeights[0];
  const lastW = validWeights[validWeights.length - 1];
  
  const weightChange = lastW.metrics.weightKg - firstW.metrics.weightKg;
  const d1 = new Date(firstW.date + "T00:00:00Z").getTime();
  const d2 = new Date(lastW.date + "T00:00:00Z").getTime();
  
  let durationDays = (d2 - d1) / (1000 * 60 * 60 * 24);
  
  // If first and last weight are on the same day, we can't compute a rate.
  if (durationDays <= 0) {
     return failClosed("INSUFFICIENT_DATA", "Cannot compute weight trend; all weight logs are on the same day.");
  }

  const weightRateOfChange = Math.round((weightChange / durationDays) * 100) / 100;

  const evidence = {
    windowDays: POLICY.EVALUATION_WINDOW_DAYS,
    loggedWeightDays: validWeights.length,
    loggedNutritionDays: validNutrition.length,
    calorieAdherence,
    weightRateOfChange,
    goalDirection
  };

  // Determine state
  const absRate = Math.abs(weightRateOfChange);

  if (absRate < POLICY.PLATEAU_THRESHOLD_KG_PER_DAY) {
    return {
      eligible: true,
      reasonCode: "ELIGIBLE_PLATEAU",
      evidence
    };
  }

  // Check on-track
  if (goalDirection === "lose") {
    if (weightRateOfChange > 0) {
       // Gaining weight on a cut is a plateau/regression
       return {
         eligible: true,
         reasonCode: "ELIGIBLE_PLATEAU",
         evidence
       };
    } else {
       // Faster than plateau threshold -> on track (no rapid-change threshold)
       return {
         eligible: false,
         reasonCode: "ON_TRACK",
         evidence
       };
    }
  } else if (goalDirection === "gain") {
    if (weightRateOfChange < 0) {
       // Losing weight on a bulk is a regression/plateau
       return {
         eligible: true,
         reasonCode: "ELIGIBLE_PLATEAU",
         evidence
       };
    } else {
       // Faster than plateau threshold -> on track
       return {
         eligible: false,
         reasonCode: "ON_TRACK",
         evidence
       };
    }
  }

  return failClosed("UNSUPPORTED_GOAL", "Reached end without state match.");
}

function failClosed(reasonCode, message) {
  return {
    eligible: false,
    reasonCode,
    evidence: { error: message }
  };
}

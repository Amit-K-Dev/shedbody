/**
 * Phase 4.6: Pure Deterministic AI Context Builder
 *
 * Transforms pre-fetched, validated user data into a bounded, sanitized,
 * provenance-tagged AiContextPayload for future AI consumption.
 *
 * Architecture:
 *   Authenticated Server Layer
 *     → pre-fetched + validated data
 *     → Pure Context Builder (this module)
 *     → AiContextPayload
 *     → Future AI / LLM layer
 *
 * This module:
 *   - Receives pre-fetched data only (no DB, no auth, no network)
 *   - Never mutates input objects
 *   - Is fully deterministic: same input → same output
 *   - Does not call any LLM or AI service
 */

// ---------------------------------------------------------------------------
// Date Validation (replicates Phase 4.4 isValidDate from rules.js)
// ---------------------------------------------------------------------------

/**
 * Validates a YYYY-MM-DD string as a real Gregorian calendar date.
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidDate(dateStr) {
  if (typeof dateStr !== "string" || dateStr.length !== 10) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(5, 7), 10);
  const day = parseInt(dateStr.slice(8, 10), 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const d = new Date(dateStr + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return false;

  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() + 1 === month &&
    d.getUTCDate() === day
  );
}

/**
 * Adds (or subtracts) days from a YYYY-MM-DD string.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days - positive or negative integer
 * @returns {string} YYYY-MM-DD
 */
function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Intent Classification (Deterministic keyword/token matching)
// ---------------------------------------------------------------------------

/**
 * @typedef {"WEIGHT_TREND"|"GOAL_PROGRESS"|"NUTRITION_ADHERENCE"|"WORKOUT_LIFESTYLE"|"GENERAL_SUMMARY"} Intent
 */

const INTENT_PATTERNS = [
  {
    intent: "GOAL_PROGRESS",
    pattern: /goal|target|progress|finish|reach|milestone/i,
  },
  {
    intent: "WEIGHT_TREND",
    pattern: /weight|fat|scale|heavier|lighter|kg|lbs|plateau/i,
  },
  {
    intent: "NUTRITION_ADHERENCE",
    pattern: /calorie|calories|protein|food|eat|diet|water|macro|nutrition/i,
  },
  {
    intent: "WORKOUT_LIFESTYLE",
    pattern: /work\s*out|workout|gym|exercise|train|sleep|step|active/i,
  },
];

/**
 * Classifies a user question into one of the five canonical intents.
 * Falls back to GENERAL_SUMMARY for empty, null, or ambiguous questions.
 * @param {string|null|undefined} question
 * @returns {Intent}
 */
export function classifyIntent(question) {
  if (!question || typeof question !== "string" || question.trim() === "") {
    return "GENERAL_SUMMARY";
  }

  for (const { intent, pattern } of INTENT_PATTERNS) {
    if (pattern.test(question)) {
      return intent;
    }
  }

  return "GENERAL_SUMMARY";
}

// ---------------------------------------------------------------------------
// Domain / Window configuration per intent
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} IntentConfig
 * @property {boolean} includeBody
 * @property {boolean} includeNutrition
 * @property {boolean} includeLifestyle
 * @property {boolean} includeGoal
 * @property {boolean} includePlan
 * @property {number} bodyWindowDays - inclusive calendar days for body domain
 * @property {number} nutritionWindowDays
 * @property {number} lifestyleWindowDays
 * @property {string[]} relevantInsightCategories
 */

const INTENT_CONFIGS = {
  WEIGHT_TREND: {
    includeBody: true,
    includeNutrition: true,
    includeLifestyle: true,
    includeGoal: true,
    includePlan: true,
    bodyWindowDays: 14,
    nutritionWindowDays: 7,
    lifestyleWindowDays: 7,
    relevantInsightCategories: ["body", "nutrition", "lifestyle"],
  },
  GOAL_PROGRESS: {
    includeBody: true,
    includeNutrition: false,
    includeLifestyle: false,
    includeGoal: true,
    includePlan: false,
    bodyWindowDays: 14,
    nutritionWindowDays: 0,
    lifestyleWindowDays: 0,
    relevantInsightCategories: ["body"],
  },
  NUTRITION_ADHERENCE: {
    includeBody: false,
    includeNutrition: true,
    includeLifestyle: false,
    includeGoal: false,
    includePlan: true,
    bodyWindowDays: 0,
    nutritionWindowDays: 7,
    lifestyleWindowDays: 0,
    relevantInsightCategories: ["nutrition"],
  },
  WORKOUT_LIFESTYLE: {
    includeBody: false,
    includeNutrition: false,
    includeLifestyle: true,
    includeGoal: false,
    includePlan: true,
    bodyWindowDays: 0,
    nutritionWindowDays: 0,
    lifestyleWindowDays: 7,
    relevantInsightCategories: ["lifestyle"],
  },
  GENERAL_SUMMARY: {
    includeBody: true,
    includeNutrition: true,
    includeLifestyle: true,
    includeGoal: true,
    includePlan: true,
    bodyWindowDays: 7,
    nutritionWindowDays: 7,
    lifestyleWindowDays: 7,
    relevantInsightCategories: ["body", "nutrition", "lifestyle"],
  },
};

// ---------------------------------------------------------------------------
// Timeline bounding
// ---------------------------------------------------------------------------

/**
 * Filters timeline entries to a bounded window [startDate, endDate] inclusive.
 * Never includes entries with dates after currentDate.
 * Does not mutate the input array.
 * @param {Array<Object>} timeline
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Array<Object>}
 */
function boundTimeline(timeline, startDate, endDate) {
  if (!Array.isArray(timeline)) return [];
  return timeline.filter(
    (entry) =>
      typeof entry.date === "string" &&
      entry.date >= startDate &&
      entry.date <= endDate
  );
}

// ---------------------------------------------------------------------------
// Observation builders (construct new objects — never mutate input)
// ---------------------------------------------------------------------------

/**
 * Builds OBSERVED body observations from bounded timeline entries.
 * @param {Array<Object>} entries
 * @returns {Array<Object>}
 */
function buildBodyObservations(entries) {
  const observations = [];
  for (const entry of entries) {
    if (!entry.body) continue;
    if (entry.body.weight === null && entry.body.bodyFat === null) continue;
    observations.push({
      type: "OBSERVED",
      date: entry.date,
      weightKg: entry.body.weight,
      bodyFatPercent: entry.body.bodyFat,
    });
  }
  return observations;
}

/**
 * Builds OBSERVED nutrition observations from bounded timeline entries.
 * @param {Array<Object>} entries
 * @returns {Array<Object>}
 */
function buildNutritionObservations(entries) {
  const observations = [];
  for (const entry of entries) {
    if (!entry.nutrition) continue;
    if (
      entry.nutrition.calories === null &&
      entry.nutrition.protein === null &&
      entry.nutrition.water === null
    )
      continue;
    observations.push({
      type: "OBSERVED",
      date: entry.date,
      calories: entry.nutrition.calories,
      proteinGrams: entry.nutrition.protein,
      waterMl: entry.nutrition.water,
    });
  }
  return observations;
}

/**
 * Builds OBSERVED lifestyle observations from bounded timeline entries.
 * @param {Array<Object>} entries
 * @returns {Array<Object>}
 */
function buildLifestyleObservations(entries) {
  const observations = [];
  for (const entry of entries) {
    if (!entry.lifestyle) continue;
    if (
      entry.lifestyle.workoutCompleted === null &&
      entry.lifestyle.steps === null &&
      entry.lifestyle.sleepHours === null
    )
      continue;
    observations.push({
      type: "OBSERVED",
      date: entry.date,
      workoutCompleted: entry.lifestyle.workoutCompleted,
      steps: entry.lifestyle.steps,
      sleepHours: entry.lifestyle.sleepHours,
    });
  }
  return observations;
}

// ---------------------------------------------------------------------------
// Derived analytics builders
// ---------------------------------------------------------------------------

/**
 * Computes derived weight analytics from body observations.
 * @param {Array<Object>} bodyObs - OBSERVED body entries
 * @param {number} windowDays - the window in days
 * @returns {Array<Object>} DERIVED metric objects
 */
function deriveWeightAnalytics(bodyObs, windowDays) {
  const derived = [];
  const validWeights = bodyObs.filter(
    (o) => o.weightKg !== null && o.weightKg !== undefined
  );

  if (validWeights.length === 0) return derived;

  // Average weight
  const sum = validWeights.reduce((acc, o) => acc + o.weightKg, 0);
  const avg = sum / validWeights.length;
  derived.push({
    type: "DERIVED",
    metric: "averageWeight",
    value: Math.round(avg * 10) / 10,
    unit: "kg",
    calculation: { method: "mean", window: `${windowDays}d` },
  });

  // Weight change (first valid to last valid)
  if (validWeights.length >= 2) {
    const first = validWeights[0];
    const last = validWeights[validWeights.length - 1];
    const change = last.weightKg - first.weightKg;
    derived.push({
      type: "DERIVED",
      metric: "weightChange",
      value: Math.round(change * 10) / 10,
      unit: "kg",
      calculation: { method: "delta", window: `${windowDays}d` },
    });

    // Rate of change
    const d1 = new Date(first.date + "T00:00:00Z").getTime();
    const d2 = new Date(last.date + "T00:00:00Z").getTime();
    const durationDays = (d2 - d1) / (1000 * 60 * 60 * 24);
    if (durationDays > 0) {
      derived.push({
        type: "DERIVED",
        metric: "weightRateOfChange",
        value: Math.round((change / durationDays) * 100) / 100,
        unit: "kg/day",
        calculation: {
          method: "delta_over_duration",
          window: `${windowDays}d`,
        },
      });
    }
  }

  return derived;
}

/**
 * Computes derived nutrition analytics from nutrition observations.
 * @param {Array<Object>} nutritionObs - OBSERVED nutrition entries
 * @param {number|null} targetCalories
 * @param {number|null} targetProtein
 * @returns {Array<Object>} DERIVED metric objects
 */
function deriveNutritionAnalytics(nutritionObs, targetCalories, targetProtein) {
  const derived = [];

  const validCalories = nutritionObs.filter(
    (o) =>
      o.calories !== null &&
      o.calories !== undefined &&
      typeof o.calories === "number" &&
      Number.isFinite(o.calories)
  );
  const validProtein = nutritionObs.filter(
    (o) =>
      o.proteinGrams !== null &&
      o.proteinGrams !== undefined &&
      typeof o.proteinGrams === "number" &&
      Number.isFinite(o.proteinGrams)
  );

  if (validCalories.length > 0) {
    const calSum = validCalories.reduce((acc, o) => acc + o.calories, 0);
    const calAvg = calSum / validCalories.length;
    derived.push({
      type: "DERIVED",
      metric: "averageCalories",
      value: Math.round(calAvg),
      unit: "kcal",
      calculation: { method: "mean", window: "7d" },
    });

    if (
      targetCalories !== null &&
      targetCalories !== undefined &&
      typeof targetCalories === "number" &&
      Number.isFinite(targetCalories) &&
      targetCalories > 0
    ) {
      derived.push({
        type: "DERIVED",
        metric: "calorieAdherence",
        value: Math.round((calAvg / targetCalories) * 1000) / 10,
        unit: "%",
        calculation: { method: "percentage_of_target", window: "7d" },
      });
    }
  }

  if (validProtein.length > 0) {
    const protSum = validProtein.reduce((acc, o) => acc + o.proteinGrams, 0);
    const protAvg = protSum / validProtein.length;
    derived.push({
      type: "DERIVED",
      metric: "averageProtein",
      value: Math.round(protAvg),
      unit: "g",
      calculation: { method: "mean", window: "7d" },
    });

    if (
      targetProtein !== null &&
      targetProtein !== undefined &&
      typeof targetProtein === "number" &&
      Number.isFinite(targetProtein) &&
      targetProtein > 0
    ) {
      derived.push({
        type: "DERIVED",
        metric: "proteinAdherence",
        value: Math.round((protAvg / targetProtein) * 1000) / 10,
        unit: "%",
        calculation: { method: "percentage_of_target", window: "7d" },
      });
    }
  }

  return derived;
}

/**
 * Computes derived lifestyle analytics from lifestyle observations.
 * @param {Array<Object>} lifestyleObs - OBSERVED lifestyle entries
 * @returns {Array<Object>} DERIVED metric objects
 */
function deriveLifestyleAnalytics(lifestyleObs) {
  const derived = [];

  const withWorkout = lifestyleObs.filter(
    (o) => o.workoutCompleted === true || o.workoutCompleted === false
  );
  if (withWorkout.length > 0) {
    const workoutCount = withWorkout.filter(
      (o) => o.workoutCompleted === true
    ).length;
    derived.push({
      type: "DERIVED",
      metric: "totalWorkouts",
      value: workoutCount,
      unit: "sessions",
      calculation: { method: "count", window: "7d" },
    });
  }

  const validSteps = lifestyleObs.filter(
    (o) =>
      o.steps !== null &&
      o.steps !== undefined &&
      typeof o.steps === "number" &&
      Number.isFinite(o.steps)
  );
  if (validSteps.length > 0) {
    const stepSum = validSteps.reduce((acc, o) => acc + o.steps, 0);
    derived.push({
      type: "DERIVED",
      metric: "averageSteps",
      value: Math.round(stepSum / validSteps.length),
      unit: "steps/day",
      calculation: { method: "mean", window: "7d" },
    });
  }

  const validSleep = lifestyleObs.filter(
    (o) =>
      o.sleepHours !== null &&
      o.sleepHours !== undefined &&
      typeof o.sleepHours === "number" &&
      Number.isFinite(o.sleepHours)
  );
  if (validSleep.length > 0) {
    const sleepSum = validSleep.reduce((acc, o) => acc + o.sleepHours, 0);
    derived.push({
      type: "DERIVED",
      metric: "averageSleep",
      value: Math.round((sleepSum / validSleep.length) * 10) / 10,
      unit: "hours/night",
      calculation: { method: "mean", window: "7d" },
    });
  }

  return derived;
}

// ---------------------------------------------------------------------------
// Goal progress (pure deterministic, replicates logic from rules.js)
// ---------------------------------------------------------------------------

/**
 * Calculates goal progress deterministically.
 * @param {Object|null} activeGoal
 * @param {Array<Object>} bodyObs - OBSERVED body entries (must be sorted by date ASC)
 * @returns {{ progressPercent: number, latestWeightKg: number|null }|null}
 */
function calculatePureGoalProgress(activeGoal, bodyObs) {
  if (!activeGoal) return null;
  if (activeGoal.domain !== "weight") return null;
  if (
    typeof activeGoal.start_value !== "number" ||
    !Number.isFinite(activeGoal.start_value)
  )
    return null;
  if (
    typeof activeGoal.target_value !== "number" ||
    !Number.isFinite(activeGoal.target_value)
  )
    return null;
  if (activeGoal.start_value === activeGoal.target_value) return null;

  const validWeights = bodyObs.filter(
    (o) => o.weightKg !== null && o.weightKg !== undefined
  );
  if (validWeights.length === 0) return null;

  const latestWeight = validWeights[validWeights.length - 1].weightKg;
  const start = activeGoal.start_value;
  const target = activeGoal.target_value;
  const raw = ((latestWeight - start) / (target - start)) * 100;
  const clamped = Math.max(0, Math.min(100, Math.round(raw)));

  return { progressPercent: clamped, latestWeightKg: latestWeight };
}

// ---------------------------------------------------------------------------
// Sanitized profile builder
// ---------------------------------------------------------------------------

/**
 * Builds a sanitized profile object from the raw profile.
 * Strips PII: user_id, email, full_name, avatar_url, etc.
 * @param {Object|null} profile
 * @returns {Object|null}
 */
function buildSanitizedProfile(profile) {
  if (!profile) return null;
  return {
    heightCm: profile.height !== undefined ? profile.height : null,
    currentWeightKg: profile.weight !== undefined ? profile.weight : null,
  };
}

// ---------------------------------------------------------------------------
// Sanitized goal builder
// ---------------------------------------------------------------------------

/**
 * Builds a sanitized USER_GOAL object from the raw active goal.
 * @param {Object|null} activeGoal
 * @param {number|null} progressPercent
 * @returns {Object|null}
 */
function buildSanitizedGoal(activeGoal, progressPercent) {
  if (!activeGoal) return null;
  return {
    type: "USER_GOAL",
    domain: activeGoal.domain || null,
    startValue: activeGoal.start_value !== undefined ? activeGoal.start_value : null,
    targetValue:
      activeGoal.target_value !== undefined ? activeGoal.target_value : null,
    startDate: activeGoal.start_date || null,
    targetDate: activeGoal.target_date || null,
    progressPercent: progressPercent !== null ? progressPercent : null,
  };
}

// ---------------------------------------------------------------------------
// Sanitized plan targets builder
// ---------------------------------------------------------------------------

/**
 * Builds a sanitized TARGET object from the raw active plan.
 * Strips raw workout JSON, meal JSON, internal IDs.
 * @param {Object|null} activePlan
 * @returns {Object|null}
 */
function buildSanitizedPlanTargets(activePlan) {
  if (!activePlan) return null;
  return {
    type: "TARGET",
    goal: activePlan.goal || null,
    level: activePlan.level || null,
    dietType: activePlan.diet_type || null,
    dailyCalories:
      typeof activePlan.calories === "number" && Number.isFinite(activePlan.calories)
        ? activePlan.calories
        : null,
    dailyProteinGrams:
      typeof activePlan.protein === "number" && Number.isFinite(activePlan.protein)
        ? activePlan.protein
        : null,
  };
}

// ---------------------------------------------------------------------------
// Insight filtering
// ---------------------------------------------------------------------------

const MAX_INSIGHTS = 5;

/**
 * Filters and limits deterministic insights by intent relevance.
 * Never mutates the input array. Never rewrites insight content.
 * @param {Array<Object>} insights
 * @param {string[]} relevantCategories
 * @returns {Array<Object>} - sanitized DETERMINISTIC_INSIGHT array (max 5)
 */
function filterInsights(insights, relevantCategories) {
  if (!Array.isArray(insights) || insights.length === 0) return [];

  const filtered = insights
    .filter(
      (insight) =>
        insight &&
        typeof insight.category === "string" &&
        relevantCategories.includes(insight.category)
    )
    .slice(0, MAX_INSIGHTS);

  return filtered.map((insight) => ({
    type: "DETERMINISTIC_INSIGHT",
    id: insight.id,
    category: insight.category,
    observation: insight.observation,
    evidence: insight.evidence,
    interpretation: insight.interpretation,
    recommendation: insight.recommendation,
    confidence: insight.confidence,
  }));
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Assembles a bounded, sanitized, provenance-tagged context payload for AI consumption.
 * Pure function: receives pre-fetched, validated data from the Authenticated Server Layer.
 *
 * @param {Object} params
 * @param {string|null|undefined} params.question - The user's input question or prompt
 * @param {string} params.currentDate - Explicit Server UTC anchor (YYYY-MM-DD)
 * @param {Object|null} params.profile - User profile data
 * @param {Object|null} params.activeGoal - Active weight goal
 * @param {Object|null} params.activePlan - Active protocol plan
 * @param {Array<Object>} params.timeline - Unified daily timeline
 * @param {Array<Object>} params.insights - Deterministic insights
 * @returns {Object} AiContextPayload
 */
export function buildAiContext({
  question,
  currentDate,
  profile,
  activeGoal,
  activePlan,
  timeline,
  insights,
}) {
  // ── Validate currentDate ──────────────────────────────────────────────
  if (!isValidDate(currentDate)) {
    return {
      metadata: {
        currentDate: null,
        intent: classifyIntent(question),
        error: "INVALID_CURRENT_DATE",
      },
      profile: buildSanitizedProfile(profile),
      userGoal: null,
      protocolTarget: null,
      observations: [],
      derivedAnalytics: [],
      deterministicInsights: [],
    };
  }

  // ── Classify intent ───────────────────────────────────────────────────
  const intent = classifyIntent(question);
  const config = INTENT_CONFIGS[intent];

  // ── Bound timelines per domain ────────────────────────────────────────
  const safeTimeline = Array.isArray(timeline) ? timeline : [];

  let bodyObs = [];
  let bodyDerived = [];
  if (config.includeBody && config.bodyWindowDays > 0) {
    const bodyStart = addDays(currentDate, -(config.bodyWindowDays - 1));
    const bounded = boundTimeline(safeTimeline, bodyStart, currentDate);
    bodyObs = buildBodyObservations(bounded);
    bodyDerived = deriveWeightAnalytics(bodyObs, config.bodyWindowDays);
  }

  let nutritionObs = [];
  let nutritionDerived = [];
  if (config.includeNutrition && config.nutritionWindowDays > 0) {
    const nutStart = addDays(currentDate, -(config.nutritionWindowDays - 1));
    const bounded = boundTimeline(safeTimeline, nutStart, currentDate);
    nutritionObs = buildNutritionObservations(bounded);
    const targetCal = activePlan ? activePlan.calories : null;
    const targetProt = activePlan ? activePlan.protein : null;
    nutritionDerived = deriveNutritionAnalytics(
      nutritionObs,
      targetCal,
      targetProt
    );
  }

  let lifestyleObs = [];
  let lifestyleDerived = [];
  if (config.includeLifestyle && config.lifestyleWindowDays > 0) {
    const lifeStart = addDays(currentDate, -(config.lifestyleWindowDays - 1));
    const bounded = boundTimeline(safeTimeline, lifeStart, currentDate);
    lifestyleObs = buildLifestyleObservations(bounded);
    lifestyleDerived = deriveLifestyleAnalytics(lifestyleObs);
  }

  // ── Goal ──────────────────────────────────────────────────────────────
  let goalPayload = null;
  if (config.includeGoal && activeGoal) {
    // Use all body observations available (from the widest body window)
    const goalProgress = calculatePureGoalProgress(activeGoal, bodyObs);
    goalPayload = buildSanitizedGoal(
      activeGoal,
      goalProgress ? goalProgress.progressPercent : null
    );
  }

  // ── Plan targets ──────────────────────────────────────────────────────
  let planPayload = null;
  if (config.includePlan && activePlan) {
    planPayload = buildSanitizedPlanTargets(activePlan);
  }

  // ── Merge observations ────────────────────────────────────────────────
  const allObservations = [...bodyObs, ...nutritionObs, ...lifestyleObs];

  // ── Merge derived analytics ───────────────────────────────────────────
  const allDerived = [
    ...bodyDerived,
    ...nutritionDerived,
    ...lifestyleDerived,
  ];

  // ── Filter insights ───────────────────────────────────────────────────
  const filteredInsights = filterInsights(
    insights,
    config.relevantInsightCategories
  );

  // ── Determine the effective window for metadata ───────────────────────
  const maxWindow = Math.max(
    config.bodyWindowDays,
    config.nutritionWindowDays,
    config.lifestyleWindowDays
  );

  // ── Assemble payload ──────────────────────────────────────────────────
  return {
    metadata: {
      currentDate: currentDate,
      intent: intent,
      windowDays: maxWindow,
    },
    profile: buildSanitizedProfile(profile),
    userGoal: goalPayload,
    protocolTarget: planPayload,
    observations: allObservations,
    derivedAnalytics: allDerived,
    deterministicInsights: filteredInsights,
  };
}

/**
 * Phase 4.7: Pure Deterministic AI Context Validator
 *
 * This module acts as a structural and security firewall for the AiContextPayload.
 * It strictly validates shapes, dates, numbers, and securely rejects PII, UUIDs, and unknown fields.
 *
 * Contract:
 * - valid payload   -> { valid: true, data: payload }
 * - invalid payload -> { valid: false, error: "Reason..." }
 * - Never mutates the payload.
 * - Never returns partial payloads.
 */

// ---------------------------------------------------------------------------
// Strict Validation Configuration
// ---------------------------------------------------------------------------

const ALLOWED_INTENTS = [
  "WEIGHT_TREND",
  "GOAL_PROGRESS",
  "NUTRITION_ADHERENCE",
  "WORKOUT_LIFESTYLE",
  "GENERAL_SUMMARY"
];

const ALLOWED_CONFIDENCE = ["high", "medium"];
const ALLOWED_INSIGHT_CATEGORIES = ["body", "lifestyle", "nutrition"];

const UUID_PATTERN = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/;

const FORBIDDEN_EXACT_KEYS = [
  "user_id", "userId", "email", "notes", "full_name", "fullName", "avatar_url", "avatarUrl"
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isObject(val) {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

function isFiniteNumber(val) {
  return typeof val === "number" && Number.isFinite(val);
}

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

// ---------------------------------------------------------------------------
// Security & PII Scan (Recursive)
// ---------------------------------------------------------------------------

function checkSensitiveContent(obj, path = []) {
  if (obj === null || obj === undefined) return null;

  if (typeof obj === "string") {
    if (UUID_PATTERN.test(obj)) return `UUID detected at ${path.join('.')}`;
    if (EMAIL_PATTERN.test(obj)) return `Email detected at ${path.join('.')}`;
    return null;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const err = checkSensitiveContent(obj[i], [...path, i]);
      if (err) return err;
    }
    return null;
  }

  if (isObject(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      const pathStr = currentPath.join('.');

      // Reject forbidden keys
      if (FORBIDDEN_EXACT_KEYS.includes(key)) {
        return `Forbidden key '${key}' detected at ${pathStr}`;
      }
      if (key === "id") {
        // Only allowed at deterministicInsights[i].id
        if (!(path.length === 2 && path[0] === "deterministicInsights")) {
          return `Forbidden id key detected at ${pathStr}`;
        }
      }
      if (key.endsWith("_id") || key.endsWith("Id")) {
        return `Forbidden identifier key '${key}' detected at ${pathStr}`;
      }

      const err = checkSensitiveContent(value, currentPath);
      if (err) return err;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Structural Validators
// ---------------------------------------------------------------------------

function fail(msg) {
  throw new Error(msg);
}

function checkKeys(obj, allowedKeys, pathStr) {
  if (!isObject(obj)) fail(`${pathStr} must be an object`);
  const keys = Object.keys(obj);
  for (const k of keys) {
    if (!allowedKeys.includes(k)) {
      fail(`Unknown field '${k}' at ${pathStr}`);
    }
  }
}

function validateMetadata(meta) {
  checkKeys(meta, ["currentDate", "intent", "windowDays"], "metadata");

  if (!isValidDate(meta.currentDate)) fail(`metadata.currentDate must be a valid YYYY-MM-DD string`);
  if (!ALLOWED_INTENTS.includes(meta.intent)) fail(`metadata.intent has invalid value '${meta.intent}'`);
  if (!isFiniteNumber(meta.windowDays) || !Number.isInteger(meta.windowDays) || meta.windowDays < 1 || meta.windowDays > 30) {
    fail(`metadata.windowDays must be an integer between 1 and 30`);
  }
  
  return meta.currentDate;
}

function validateProfile(profile) {
  if (profile === null) return;
  checkKeys(profile, ["heightCm", "currentWeightKg"], "profile");
  if (profile.heightCm !== null && (!isFiniteNumber(profile.heightCm) || profile.heightCm <= 0)) fail(`profile.heightCm invalid`);
  if (profile.currentWeightKg !== null && (!isFiniteNumber(profile.currentWeightKg) || profile.currentWeightKg <= 0)) fail(`profile.currentWeightKg invalid`);
}

function validateUserGoal(goal, currentDate) {
  if (goal === null) return;
  checkKeys(goal, ["type", "domain", "startValue", "targetValue", "startDate", "targetDate", "progressPercent"], "userGoal");

  if (goal.type !== "USER_GOAL") fail(`userGoal.type must be USER_GOAL`);
  if (goal.domain !== null && typeof goal.domain !== "string") fail(`userGoal.domain must be string or null`);
  if (goal.startValue !== null && !isFiniteNumber(goal.startValue)) fail(`userGoal.startValue must be number or null`);
  if (goal.targetValue !== null && !isFiniteNumber(goal.targetValue)) fail(`userGoal.targetValue must be number or null`);
  
  if (goal.progressPercent !== null && (!isFiniteNumber(goal.progressPercent) || goal.progressPercent < 0 || goal.progressPercent > 100)) {
    fail(`userGoal.progressPercent must be between 0 and 100`);
  }

  if (goal.startDate !== null) {
    if (!isValidDate(goal.startDate)) fail(`userGoal.startDate invalid date`);
    if (goal.startDate > currentDate) fail(`userGoal.startDate cannot be in the future`);
  }
  
  if (goal.targetDate !== null) {
    if (!isValidDate(goal.targetDate)) fail(`userGoal.targetDate invalid date`);
    // targetDate CAN be in the future, so no bounds check against currentDate needed
  }
}

function validateProtocolTarget(target) {
  if (target === null) return;
  checkKeys(target, ["type", "goal", "level", "dietType", "dailyCalories", "dailyProteinGrams"], "protocolTarget");

  if (target.type !== "TARGET") fail(`protocolTarget.type must be TARGET`);
  if (target.goal !== null && typeof target.goal !== "string") fail(`protocolTarget.goal invalid`);
  if (target.level !== null && typeof target.level !== "string") fail(`protocolTarget.level invalid`);
  if (target.dietType !== null && typeof target.dietType !== "string") fail(`protocolTarget.dietType invalid`);
  if (target.dailyCalories !== null && (!isFiniteNumber(target.dailyCalories) || target.dailyCalories < 0)) fail(`protocolTarget.dailyCalories invalid`);
  if (target.dailyProteinGrams !== null && (!isFiniteNumber(target.dailyProteinGrams) || target.dailyProteinGrams < 0)) fail(`protocolTarget.dailyProteinGrams invalid`);
}

function validateObservations(obsList, currentDate) {
  if (!Array.isArray(obsList)) fail(`observations must be an array`);

  const allowed = ["type", "date", "weightKg", "bodyFatPercent", "calories", "proteinGrams", "waterMl", "workoutCompleted", "steps", "sleepHours"];

  for (let i = 0; i < obsList.length; i++) {
    const obs = obsList[i];
    const p = `observations[${i}]`;
    checkKeys(obs, allowed, p);
    
    if (obs.type !== "OBSERVED") fail(`${p}.type must be OBSERVED`);
    if (!isValidDate(obs.date)) fail(`${p}.date invalid`);
    if (obs.date > currentDate) fail(`${p}.date cannot be in the future`);

    if (obs.weightKg !== undefined && obs.weightKg !== null && (!isFiniteNumber(obs.weightKg) || obs.weightKg < 0)) fail(`${p}.weightKg invalid`);
    if (obs.bodyFatPercent !== undefined && obs.bodyFatPercent !== null && (!isFiniteNumber(obs.bodyFatPercent) || obs.bodyFatPercent < 0 || obs.bodyFatPercent > 100)) fail(`${p}.bodyFatPercent invalid`);
    if (obs.calories !== undefined && obs.calories !== null && (!isFiniteNumber(obs.calories) || obs.calories < 0)) fail(`${p}.calories invalid`);
    if (obs.proteinGrams !== undefined && obs.proteinGrams !== null && (!isFiniteNumber(obs.proteinGrams) || obs.proteinGrams < 0)) fail(`${p}.proteinGrams invalid`);
    if (obs.waterMl !== undefined && obs.waterMl !== null && (!isFiniteNumber(obs.waterMl) || obs.waterMl < 0)) fail(`${p}.waterMl invalid`);
    
    if (obs.workoutCompleted !== undefined && obs.workoutCompleted !== null && typeof obs.workoutCompleted !== "boolean") fail(`${p}.workoutCompleted invalid`);
    if (obs.steps !== undefined && obs.steps !== null && (!isFiniteNumber(obs.steps) || obs.steps < 0 || !Number.isInteger(obs.steps))) fail(`${p}.steps invalid`);
    if (obs.sleepHours !== undefined && obs.sleepHours !== null && (!isFiniteNumber(obs.sleepHours) || obs.sleepHours < 0)) fail(`${p}.sleepHours invalid`);
  }
}

function validateDerivedAnalytics(derivedList) {
  if (!Array.isArray(derivedList)) fail(`derivedAnalytics must be an array`);

  const allowedKeys = ["type", "metric", "value", "unit", "calculation"];
  const calcAllowedKeys = ["method", "window"];

  for (let i = 0; i < derivedList.length; i++) {
    const d = derivedList[i];
    const p = `derivedAnalytics[${i}]`;
    
    checkKeys(d, allowedKeys, p);
    if (d.type !== "DERIVED") fail(`${p}.type must be DERIVED`);
    if (typeof d.metric !== "string") fail(`${p}.metric invalid`);
    if (!isFiniteNumber(d.value)) fail(`${p}.value must be a finite number`);
    if (typeof d.unit !== "string") fail(`${p}.unit invalid`);
    
    checkKeys(d.calculation, calcAllowedKeys, `${p}.calculation`);
    if (typeof d.calculation.method !== "string") fail(`${p}.calculation.method invalid`);
    if (typeof d.calculation.window !== "string") fail(`${p}.calculation.window invalid`);
  }
}

function validateDeterministicInsights(insights) {
  if (!Array.isArray(insights)) fail(`deterministicInsights must be an array`);
  if (insights.length > 5) fail(`deterministicInsights array exceeds maximum length of 5`);

  // Based on contextBuilder.js Phase 4.6 implementation which emits exactly these keys:
  const allowed = ["type", "id", "category", "observation", "evidence", "interpretation", "recommendation", "confidence"];

  for (let i = 0; i < insights.length; i++) {
    const d = insights[i];
    const p = `deterministicInsights[${i}]`;
    
    checkKeys(d, allowed, p);
    
    if (d.type !== "DETERMINISTIC_INSIGHT") fail(`${p}.type must be DETERMINISTIC_INSIGHT`);
    if (typeof d.id !== "string") fail(`${p}.id invalid`);
    if (!ALLOWED_INSIGHT_CATEGORIES.includes(d.category)) {
      fail(`${p}.category must be one of [${ALLOWED_INSIGHT_CATEGORIES.join(',')}], got '${d.category}'`);
    }
    if (typeof d.observation !== "string") fail(`${p}.observation invalid`);
    if (typeof d.evidence !== "string") fail(`${p}.evidence invalid`);
    if (typeof d.interpretation !== "string") fail(`${p}.interpretation invalid`);
    if (typeof d.recommendation !== "string") fail(`${p}.recommendation invalid`);
    
    if (!ALLOWED_CONFIDENCE.includes(d.confidence)) {
      fail(`${p}.confidence must be 'high' or 'medium', got '${d.confidence}'`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main Validator Entry Point
// ---------------------------------------------------------------------------

/**
 * Validates the complete AiContextPayload.
 * @param {Object} payload 
 * @returns {{valid: boolean, data?: Object, error?: string}}
 */
export function validateAiContext(payload) {
  try {
    if (!payload || !isObject(payload)) {
      return { valid: false, error: "Payload must be an object" };
    }

    // 1. Recursive Security Scan (fails if UUIDs, emails, or forbidden keys exist)
    const securityError = checkSensitiveContent(payload);
    if (securityError) {
      return { valid: false, error: `Security validation failed: ${securityError}` };
    }

    // 2. Strict Root Structure
    checkKeys(payload, [
      "metadata",
      "profile",
      "userGoal",
      "protocolTarget",
      "observations",
      "derivedAnalytics",
      "deterministicInsights"
    ], "root");

    // 3. Validate components
    const currentDate = validateMetadata(payload.metadata);
    validateProfile(payload.profile);
    validateUserGoal(payload.userGoal, currentDate);
    validateProtocolTarget(payload.protocolTarget);
    validateObservations(payload.observations, currentDate);
    validateDerivedAnalytics(payload.derivedAnalytics);
    validateDeterministicInsights(payload.deterministicInsights);

    return { valid: true, data: payload };

  } catch (err) {
    return { valid: false, error: err.message };
  }
}

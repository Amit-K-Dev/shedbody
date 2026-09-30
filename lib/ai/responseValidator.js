/**
 * Phase 4.9: AI Coach Response Validator
 * 
 * Implements strict, deterministic validation for AI Coach responses:
 * 1. Schema Validation (types, bounds, allowed fields, enums).
 * 2. Grounding Validation Placeholder (handled by groundingValidator.js).
 * 3. Safety Validation Placeholder.
 */

const ALLOWED_RESPONSE_TYPES = [
  "analysis",
  "correction",
  "motivation",
  "action_plan",
  "educational"
];

const ALLOWED_CONFIDENCE = ["high", "medium"];

const ALLOWED_CLAIM_TYPES = [
  "DIRECT_OBSERVATION",
  "DERIVED_ANALYTIC",
  "USER_GOAL",
  "DETERMINISTIC_INSIGHT"
];

const ALLOWED_RECOMMENDATION_BASIS = [
  "GOAL_SUPPORT",
  "METRIC_CORRECTION",
  "TREND_MAINTENANCE"
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isObject(val) {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

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

// ---------------------------------------------------------------------------
// Schema Validator
// ---------------------------------------------------------------------------

function validateEvidenceItem(item, index) {
  const p = `evidence[${index}]`;
  if (!isObject(item)) fail(`${p} must be an object`);

  if (!ALLOWED_CLAIM_TYPES.includes(item.claimType)) {
    fail(`${p}.claimType is invalid`);
  }

  if (item.claimType === "DETERMINISTIC_INSIGHT") {
    checkKeys(item, ["claimType", "insightId"], p);
    if (typeof item.insightId !== "string") fail(`${p}.insightId must be a string`);
    return;
  }

  // Factual claims
  checkKeys(item, ["claimType", "supportedBy", "assertedValue", "unit"], p);

  if (!Array.isArray(item.supportedBy)) fail(`${p}.supportedBy must be an array`);
  if (item.supportedBy.length !== 1) fail(`${p}.supportedBy must contain exactly one ID`);
  if (typeof item.supportedBy[0] !== "string") fail(`${p}.supportedBy[0] must be a string`);

  const t = typeof item.assertedValue;
  if (item.assertedValue !== null && t !== "string" && t !== "number" && t !== "boolean") {
    fail(`${p}.assertedValue must be primitive or null`);
  }
  if (t === "number" && !Number.isFinite(item.assertedValue)) {
    fail(`${p}.assertedValue must be a finite number`);
  }

  if (item.unit !== null && typeof item.unit !== "string") {
    fail(`${p}.unit must be a string or null`);
  }
}

function validateRecommendationItem(item, index) {
  const p = `recommendations[${index}]`;
  if (!isObject(item)) fail(`${p} must be an object`);

  checkKeys(item, ["text", "recommendationBasis", "supportedBy"], p);

  if (typeof item.text !== "string") fail(`${p}.text must be a string`);
  if (item.text.length > 200) fail(`${p}.text exceeds 200 characters`);

  if (!ALLOWED_RECOMMENDATION_BASIS.includes(item.recommendationBasis)) {
    fail(`${p}.recommendationBasis is invalid`);
  }

  if (!Array.isArray(item.supportedBy)) fail(`${p}.supportedBy must be an array`);
  if (item.supportedBy.length === 0) fail(`${p}.supportedBy must contain at least one ID`);
  for (let i = 0; i < item.supportedBy.length; i++) {
    if (typeof item.supportedBy[i] !== "string") {
      fail(`${p}.supportedBy[${i}] must be a string`);
    }
  }
}

/**
 * Validates the exact structural schema of the AI Response.
 * @param {Object} response
 * @returns {{valid: boolean, error?: string}}
 */
export function validateAiResponseSchema(response) {
  try {
    if (!isObject(response)) fail("Response must be an object");

    checkKeys(response, [
      "type", "title", "summary", "evidence", "recommendations", "confidence", "safetyNote"
    ], "root");

    if (!ALLOWED_RESPONSE_TYPES.includes(response.type)) {
      fail(`type must be one of [${ALLOWED_RESPONSE_TYPES.join(',')}]`);
    }

    if (typeof response.title !== "string") fail("title must be a string");
    if (response.title.length > 100) fail("title exceeds 100 characters");

    if (typeof response.summary !== "string") fail("summary must be a string");
    if (response.summary.length > 500) fail("summary exceeds 500 characters");

    if (!Array.isArray(response.evidence)) fail("evidence must be an array");
    response.evidence.forEach(validateEvidenceItem);

    if (!Array.isArray(response.recommendations)) fail("recommendations must be an array");
    if (response.recommendations.length > 3) fail("more than 3 recommendations");
    response.recommendations.forEach(validateRecommendationItem);

    if (!ALLOWED_CONFIDENCE.includes(response.confidence)) {
      fail(`confidence must be 'high' or 'medium'`);
    }

    if (response.safetyNote !== null) {
      if (typeof response.safetyNote !== "string") fail("safetyNote must be string or null");
      if (response.safetyNote.length > 200) fail("safetyNote exceeds 200 characters");
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Grounding Validator Placeholder
// ---------------------------------------------------------------------------

/**
 * Grounding validation is now performed by groundingValidator.js.
 * This method simply ensures the response structure is structurally ready.
 * The AI Coach route will call the dedicated groundingValidator separately.
 */
export function validateAiResponseGrounding(response, context) {
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Safety Validator Placeholder
// ---------------------------------------------------------------------------

/**
 * Placeholder for the final health-safety policy engine.
 * @param {Object} response 
 * @returns {{valid: boolean, error?: string}}
 */
export function validateAiResponseSafety(response) {
  if (!response || typeof response.type !== "string") {
    return { valid: false, error: "Safety failure: invalid response structure" };
  }

  const blocklist = ["200 calories", "500 calories", "starve", "fasting for days"];
  
  if (Array.isArray(response.recommendations)) {
    for (const rec of response.recommendations) {
      if (typeof rec.text === "string") {
        const text = rec.text.toLowerCase();
        for (const blocked of blocklist) {
          if (text.includes(blocked)) {
            return { valid: false, error: "Extreme restriction detected in recommendation" };
          }
        }
      }
    }
  }

  return { valid: true };
}

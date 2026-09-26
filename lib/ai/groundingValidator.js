/**
 * Grounding Validator (V2 Contract)
 * 
 * Deterministically validates LLM-generated factual claims and recommendations
 * against a trusted request-scoped context dictionary.
 * 
 * Maintains a strict fail-closed architecture. No LLM calls, no regex parsing
 * for grounding, no fuzzy numeric matching.
 */

const VALID_CLAIM_TYPES = [
  "DIRECT_OBSERVATION",
  "DERIVED_ANALYTIC",
  "USER_GOAL",
  "DETERMINISTIC_INSIGHT",
  "RECOMMENDATION"
];

const VALID_RECOMMENDATION_BASIS = [
  "GOAL_SUPPORT",
  "METRIC_CORRECTION",
  "TREND_MAINTENANCE"
];

function isObject(val) {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

function fail(msg) {
  throw new Error(msg);
}

/**
 * Validates an array of claims against a trusted context dictionary.
 * @param {Array<Object>} claims - The array of claims from the LLM.
 * @param {Object} contextDictionary - The trusted, request-scoped dictionary.
 *   Format: { [refId]: { type: string, value: number, unit: string } }
 * @returns {{valid: boolean, error?: string}}
 */
export function validateGrounding(claims, contextDictionary) {
  try {
    if (!Array.isArray(claims)) fail("claims must be an array");
    if (!isObject(contextDictionary)) fail("contextDictionary must be an object");

    for (let i = 0; i < claims.length; i++) {
      const claim = claims[i];
      if (!isObject(claim)) fail(`claims[${i}] must be an object`);
      
      const cType = claim.claimType;
      if (!VALID_CLAIM_TYPES.includes(cType)) {
        fail(`claims[${i}].claimType is invalid: ${cType}`);
      }

      // Handle DETERMINISTIC_INSIGHT
      if (cType === "DETERMINISTIC_INSIGHT") {
        const iId = claim.insightId;
        if (typeof iId !== "string") {
          fail(`claims[${i}].insightId must be a string for DETERMINISTIC_INSIGHT`);
        }
        
        const ref = contextDictionary[iId];
        if (!ref) {
          fail(`claims[${i}] hallucinated insightId: ${iId}`);
        }
        if (ref.type !== "DETERMINISTIC_INSIGHT") {
          fail(`claims[${i}] insightId maps to incorrect type: ${ref.type}`);
        }
        continue;
      }

      // Ensure supportedBy array exists for all other types
      if (!Array.isArray(claim.supportedBy) || claim.supportedBy.length === 0) {
        fail(`claims[${i}] missing or empty supportedBy array`);
      }

      // Validate all reference IDs exist and are request-scoped
      const refs = [];
      for (const refId of claim.supportedBy) {
        if (typeof refId !== "string") fail(`claims[${i}].supportedBy contains non-string`);
        const ref = contextDictionary[refId];
        if (!ref) fail(`claims[${i}] hallucinated reference ID: ${refId}`);
        refs.push(ref);
      }

      // Handle RECOMMENDATION
      if (cType === "RECOMMENDATION") {
        const basis = claim.recommendationBasis;
        if (!VALID_RECOMMENDATION_BASIS.includes(basis)) {
          fail(`claims[${i}].recommendationBasis is invalid: ${basis}`);
        }

        // Structural compatibility
        let hasCompatibleRef = false;
        for (const ref of refs) {
          if (basis === "GOAL_SUPPORT") {
            if (ref.type === "USER_GOAL" || ref.type === "PROTOCOL_TARGET") {
              hasCompatibleRef = true; break;
            }
          } else if (basis === "METRIC_CORRECTION") {
            if (ref.type === "DIRECT_OBSERVATION" || ref.type === "DERIVED_ANALYTIC") {
              hasCompatibleRef = true; break;
            }
          } else if (basis === "TREND_MAINTENANCE") {
            if (ref.type === "DETERMINISTIC_INSIGHT") {
              hasCompatibleRef = true; break;
            }
          }
        }

        if (!hasCompatibleRef) {
          fail(`claims[${i}] structural compatibility failed for basis ${basis}`);
        }
        continue;
      }

      // Handle Factual Claims: DIRECT_OBSERVATION, DERIVED_ANALYTIC, USER_GOAL
      // The claim must exactly match the type of the first reference (or require all to match)
      // Since it's a specific factual claim, we require at least one reference to match the claimType exactly
      const hasMatchingType = refs.some(r => r.type === cType);
      if (!hasMatchingType) {
         fail(`claims[${i}] reference type mismatch. Expected at least one ${cType}`);
      }

      // We only verify assertedValue and unit against the reference that matches the claimType.
      // If multiple match, we find the first one that matches the type.
      const targetRef = refs.find(r => r.type === cType);
      
      const asserted = claim.assertedValue;
      const unit = claim.unit;

      if (typeof targetRef.value === "number") {
        if (typeof asserted !== "number" || !Number.isFinite(asserted)) {
          fail(`claims[${i}].assertedValue must be a finite number`);
        }
        if (asserted !== targetRef.value) {
          fail(`claims[${i}] numeric mismatch: expected ${targetRef.value}, got ${asserted}`);
        }
      } else {
        // If the trusted value is not numeric, we just ensure it matches strictly.
        if (asserted !== targetRef.value) {
          fail(`claims[${i}] value mismatch: expected ${targetRef.value}, got ${asserted}`);
        }
      }

      if (targetRef.unit && unit !== targetRef.unit) {
        fail(`claims[${i}] unit mismatch: expected ${targetRef.unit}, got ${unit}`);
      }
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

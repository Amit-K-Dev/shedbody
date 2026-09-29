/**
 * PURE ADAPTATION ENGINE
 * Deterministically calculates calorie adaptations based on eligibility state, current weight, TDEE, and bounds.
 */

// Approved Policy Constants
export const POLICY_CONSTANTS = {
  X_LOSS: 100,
  X_GAIN: 100,
  Y_GAIN: 500,
  CALORIE_FLOOR: 1200
};

const PROTEIN_FACTORS = {
  lose: 2.2, // fat_loss equivalent in eligibility mapping
  maintain: 1.8, // maintenance equivalent
  gain: 2.0 // muscle_gain equivalent
};

/**
 * Calculates adaptive calorie targets based on approved policies.
 * 
 * @param {Object} args
 * @param {Object} args.eligibility - The exact output object from eligibilityEngine.js
 * @param {Number} args.currentCalories - The current calorie target from the active plan
 * @param {Number} args.currentWeightKg - The current authoritative weight (last valid weight)
 * @param {Number} [args.currentTdee] - The current calculated TDEE (required for gain)
 * 
 * @returns {Object} Adaptation result containing status, canAdapt, and optional payload/snapshot.
 */
export function calculateAdaptation({ eligibility, currentCalories, currentWeightKg, currentTdee }) {
  // 1. Numerics Validation
  if (!Number.isFinite(currentCalories) || currentCalories <= 0) {
    return blockedResult("INSUFFICIENT_DATA", "Current calories must be a valid positive number.");
  }
  if (!Number.isFinite(currentWeightKg) || currentWeightKg <= 0) {
    return blockedResult("INSUFFICIENT_DATA", "Current weight must be a valid positive number.");
  }

  // 2. Eligibility State Checking
  if (!eligibility || eligibility.reasonCode !== "ELIGIBLE_PLATEAU") {
    // Retain the existing eligibility reasonCode
    const reasonCode = eligibility?.reasonCode || "UNSUPPORTED_GOAL";
    return blockedResult(reasonCode, "Adaptation blocked by eligibility state.");
  }

  // 3. Goal Direction
  const goalDirection = eligibility.evidence?.goalDirection;
  if (goalDirection !== "lose" && goalDirection !== "gain") {
    return blockedResult("UNSUPPORTED_GOAL", "Only lose or gain directions are supported for adaptation.");
  }

  // 4. Calculate proposed calories
  let proposedCalories;
  let finalCalories;
  let isClamped = false;
  let upperBound = null;
  
  if (goalDirection === "lose") {
    proposedCalories = currentCalories - POLICY_CONSTANTS.X_LOSS;
    
    if (currentCalories <= POLICY_CONSTANTS.CALORIE_FLOOR) {
      return blockedResult("ADAPTATION_MAXED_OUT", "Calorie target is already at or below the minimum safety floor.");
    }
    
    if (proposedCalories < POLICY_CONSTANTS.CALORIE_FLOOR) {
      finalCalories = POLICY_CONSTANTS.CALORIE_FLOOR;
      isClamped = true;
    } else {
      finalCalories = proposedCalories;
      isClamped = false;
    }
    
  } else if (goalDirection === "gain") {
    if (!Number.isFinite(currentTdee) || currentTdee <= 0) {
      return blockedResult("INSUFFICIENT_DATA", "Gain adaptation requires a valid current TDEE.");
    }
    
    upperBound = currentTdee + POLICY_CONSTANTS.Y_GAIN;
    proposedCalories = currentCalories + POLICY_CONSTANTS.X_GAIN;
    
    if (currentCalories >= upperBound) {
      return blockedResult("ADAPTATION_MAXED_OUT", "Calorie target is already at or above the upper gain bound.");
    }
    
    if (proposedCalories > upperBound) {
      finalCalories = upperBound;
      isClamped = true;
    } else {
      finalCalories = proposedCalories;
      isClamped = false;
    }
  }

  // 5. Protein Recalculation
  const proteinFactor = PROTEIN_FACTORS[goalDirection];
  const finalProtein = Math.round(currentWeightKg * proteinFactor);

  // 6. Assemble Explanation Snapshot
  const snapshot = {
    goalDirection,
    previousCalorieTarget: currentCalories,
    proposedCalorieTarget: proposedCalories,
    finalCalorieTarget: finalCalories,
    currentWeight: currentWeightKg,
    currentTdee: currentTdee !== undefined ? currentTdee : null,
    weightRateOfChange: eligibility.evidence?.weightRateOfChange !== undefined ? eligibility.evidence.weightRateOfChange : null,
    calorieAdherence: eligibility.evidence?.calorieAdherence !== undefined ? eligibility.evidence.calorieAdherence : null,
    xLoss: POLICY_CONSTANTS.X_LOSS,
    xGain: POLICY_CONSTANTS.X_GAIN,
    yGain: POLICY_CONSTANTS.Y_GAIN,
    calorieFloor: POLICY_CONSTANTS.CALORIE_FLOOR,
    gainUpperBound: upperBound,
    proteinFactor,
    finalProteinTarget: finalProtein,
    isClamped
  };

  return {
    status: "ELIGIBLE_PLATEAU",
    canAdapt: true,
    planUpdates: {
      calories: finalCalories,
      protein: finalProtein
    },
    snapshot
  };
}

function blockedResult(status, reason) {
  return {
    status,
    canAdapt: false,
    reason
  };
}

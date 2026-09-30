import { validateGrounding } from "./groundingValidator.js";

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    failed++;
    console.error(`[FAIL] ${name}`);
  }
}

function runTests() {
  console.log("Running Grounding Validator Tests...\n");

  const contextDict = {
    "obs_weightKg_2026-09-29": {
      type: "DIRECT_OBSERVATION",
      value: 80,
      unit: "kg"
    },
    "insight_123": {
      type: "DETERMINISTIC_INSIGHT"
    },
    "goal_weight": {
      type: "USER_GOAL",
      value: 75,
      unit: "kg"
    }
  };

  // 1. Valid grounded response
  let res = validateGrounding([
    {
      claimType: "DIRECT_OBSERVATION",
      supportedBy: ["obs_weightKg_2026-09-29"],
      assertedValue: 80,
      unit: "kg"
    },
    {
      claimType: "DETERMINISTIC_INSIGHT",
      insightId: "insight_123"
    },
    {
      claimType: "RECOMMENDATION",
      recommendationBasis: "METRIC_CORRECTION",
      supportedBy: ["obs_weightKg_2026-09-29"]
    }
  ], contextDict);
  assert("Valid grounded response", res.valid === true);

  // 2. Unsupported/unverified claim is rejected
  res = validateGrounding([
    {
      claimType: "DIRECT_OBSERVATION",
      supportedBy: ["obs_weightKg_2026-09-29"],
      assertedValue: 90, // mismatch
      unit: "kg"
    }
  ], contextDict);
  assert("Unsupported claim rejected (value mismatch)", res.valid === false);

  res = validateGrounding([
    {
      claimType: "DIRECT_OBSERVATION",
      supportedBy: ["hallucinated_ref"],
      assertedValue: 80,
      unit: "kg"
    }
  ], contextDict);
  assert("Unsupported claim rejected (hallucinated ref)", res.valid === false);

  // 3. Deterministic evidence accepted
  res = validateGrounding([
    {
      claimType: "DETERMINISTIC_INSIGHT",
      insightId: "insight_123"
    }
  ], contextDict);
  assert("Deterministic evidence accepted", res.valid === true);

  // 4. Recommendation basis structural mismatch
  res = validateGrounding([
    {
      claimType: "RECOMMENDATION",
      recommendationBasis: "TREND_MAINTENANCE",
      supportedBy: ["obs_weightKg_2026-09-29"] // TREND_MAINTENANCE requires DETERMINISTIC_INSIGHT
    }
  ], contextDict);
  assert("Recommendation basis mismatch rejected", res.valid === false);

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
}

runTests();

import { 
  validateAiResponseSchema, 
  validateAiResponseGrounding, 
  validateAiResponseSafety 
} from "../lib/ai/responseValidator.js";

// ---------------------------------------------------------------------------
// Test Runner
// ---------------------------------------------------------------------------

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests.push(message);
    console.error(`❌ FAIL: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

function createValidResponse(overrides = {}) {
  return {
    type: "analysis",
    title: "Your Weekly Summary",
    summary: "You have been doing great.",
    evidence: [],
    recommendations: [],
    confidence: "high",
    safetyNote: null,
    ...overrides
  };
}

// ---------------------------------------------------------------------------
// Schema Validation Tests
// ---------------------------------------------------------------------------

function runSchemaTests() {
  console.log("\n--- Schema Validation Tests ---");

  // 1. valid DIRECT_OBSERVATION
  let res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_123"], assertedValue: 85.5, unit: "kg" }]
  }));
  assert(res.valid, "1. Valid DIRECT_OBSERVATION should pass");

  // 2. valid DERIVED_ANALYTIC
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "DERIVED_ANALYTIC", supportedBy: ["da_123"], assertedValue: 85.0, unit: "kg" }]
  }));
  assert(res.valid, "2. Valid DERIVED_ANALYTIC should pass");

  // 3. valid USER_GOAL
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "USER_GOAL", supportedBy: ["goal_123"], assertedValue: 80, unit: "kg" }]
  }));
  assert(res.valid, "3. Valid USER_GOAL should pass");

  // 4. valid DETERMINISTIC_INSIGHT
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "DETERMINISTIC_INSIGHT", insightId: "insight-123" }]
  }));
  assert(res.valid, "4. Valid DETERMINISTIC_INSIGHT should pass");

  // 5. valid recommendation for each recommendationBasis
  ["GOAL_SUPPORT", "METRIC_CORRECTION", "TREND_MAINTENANCE"].forEach(basis => {
    res = validateAiResponseSchema(createValidResponse({
      recommendations: [{ text: "Do this.", recommendationBasis: basis, supportedBy: ["ref_123"] }]
    }));
    assert(res.valid, `5. Valid recommendation for basis ${basis} should pass`);
  });

  // 6. multiple recommendations up to 3
  res = validateAiResponseSchema(createValidResponse({
    recommendations: [
      { text: "R1", recommendationBasis: "GOAL_SUPPORT", supportedBy: ["ref_1"] },
      { text: "R2", recommendationBasis: "METRIC_CORRECTION", supportedBy: ["ref_2"] },
      { text: "R3", recommendationBasis: "TREND_MAINTENANCE", supportedBy: ["ref_3"] }
    ]
  }));
  assert(res.valid, "6. Multiple recommendations up to 3 should pass");

  // 7. >3 recommendations fails
  res = validateAiResponseSchema(createValidResponse({
    recommendations: [
      { text: "R1", recommendationBasis: "GOAL_SUPPORT", supportedBy: ["ref_1"] },
      { text: "R2", recommendationBasis: "METRIC_CORRECTION", supportedBy: ["ref_2"] },
      { text: "R3", recommendationBasis: "TREND_MAINTENANCE", supportedBy: ["ref_3"] },
      { text: "R4", recommendationBasis: "GOAL_SUPPORT", supportedBy: ["ref_4"] }
    ]
  }));
  assert(!res.valid, "7. More than 3 recommendations should fail");

  // 8. missing claimType fails
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ supportedBy: ["obs_123"], assertedValue: 85.5, unit: "kg" }]
  }));
  assert(!res.valid, "8. Missing claimType fails");

  // 9. factual evidence with 0 supportedBy fails
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "DIRECT_OBSERVATION", supportedBy: [], assertedValue: 85.5, unit: "kg" }]
  }));
  assert(!res.valid, "9. Factual evidence with 0 supportedBy fails");

  // 10. factual evidence with >1 supportedBy fails
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_1", "obs_2"], assertedValue: 85.5, unit: "kg" }]
  }));
  assert(!res.valid, "10. Factual evidence with >1 supportedBy fails");

  // 11. deterministic insight with supportedBy fails
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "DETERMINISTIC_INSIGHT", insightId: "insight-123", supportedBy: ["ref_123"] }]
  }));
  assert(!res.valid, "11. Deterministic insight with supportedBy fails");

  // 12. deterministic insight with assertedValue/unit fails
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "DETERMINISTIC_INSIGHT", insightId: "insight-123", assertedValue: 123 }]
  }));
  assert(!res.valid, "12. Deterministic insight with assertedValue fails");
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "DETERMINISTIC_INSIGHT", insightId: "insight-123", unit: "kg" }]
  }));
  assert(!res.valid, "12. Deterministic insight with unit fails");

  // 13. recommendation missing recommendationBasis fails
  res = validateAiResponseSchema(createValidResponse({
    recommendations: [{ text: "Do this.", supportedBy: ["ref_123"] }]
  }));
  assert(!res.valid, "13. Recommendation missing recommendationBasis fails");

  // 14. recommendation missing supportedBy fails
  res = validateAiResponseSchema(createValidResponse({
    recommendations: [{ text: "Do this.", recommendationBasis: "GOAL_SUPPORT" }]
  }));
  assert(!res.valid, "14. Recommendation missing supportedBy fails");

  // 15. recommendation with empty supportedBy fails
  res = validateAiResponseSchema(createValidResponse({
    recommendations: [{ text: "Do this.", recommendationBasis: "GOAL_SUPPORT", supportedBy: [] }]
  }));
  assert(!res.valid, "15. Recommendation with empty supportedBy fails");

  // 16. recommendation text >200 fails
  res = validateAiResponseSchema(createValidResponse({
    recommendations: [{ text: "A".repeat(201), recommendationBasis: "GOAL_SUPPORT", supportedBy: ["ref_123"] }]
  }));
  assert(!res.valid, "16. Recommendation text > 200 fails");

  // 17. unknown nested fields fail
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_123"], assertedValue: 85.5, unit: "kg", randomField: true }]
  }));
  assert(!res.valid, "17. Unknown nested fields in evidence fail");

  res = validateAiResponseSchema(createValidResponse({
    recommendations: [{ text: "Do this.", recommendationBasis: "GOAL_SUPPORT", supportedBy: ["ref_123"], anotherField: 1 }]
  }));
  assert(!res.valid, "17. Unknown nested fields in recommendation fail");

  // 18. unknown root fields fail
  res = validateAiResponseSchema({ ...createValidResponse(), unknownRoot: 123 });
  assert(!res.valid, "18. Unknown root fields fail");

  // 19. invalid enums fail
  res = validateAiResponseSchema(createValidResponse({
    type: "invalid_type"
  }));
  assert(!res.valid, "19. Invalid response type enum fails");
  
  res = validateAiResponseSchema(createValidResponse({
    evidence: [{ claimType: "INVALID_CLAIM", supportedBy: ["obs_123"], assertedValue: 85.5, unit: "kg" }]
  }));
  assert(!res.valid, "19. Invalid claimType enum fails");
  
  res = validateAiResponseSchema(createValidResponse({
    recommendations: [{ text: "Do this.", recommendationBasis: "INVALID_BASIS", supportedBy: ["ref_123"] }]
  }));
  assert(!res.valid, "19. Invalid recommendationBasis enum fails");

  // 20. invalid root field types fail
  res = validateAiResponseSchema(createValidResponse({ title: 123 }));
  assert(!res.valid, "20. Invalid root field type (title) fails");

  res = validateAiResponseSchema(createValidResponse({ summary: [] }));
  assert(!res.valid, "20. Invalid root field type (summary) fails");

  res = validateAiResponseSchema(createValidResponse({ evidence: {} }));
  assert(!res.valid, "20. Invalid root field type (evidence) fails");
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

runSchemaTests();
// validateAiResponseGrounding and validateAiResponseSafety are now placeholders here.
// They return {valid: true}.
console.log("\n--- Placeholder Tests ---");
assert(validateAiResponseGrounding().valid === true, "validateAiResponseGrounding is a placeholder");
assert(validateAiResponseSafety({type: "analysis"}).valid === true, "validateAiResponseSafety placeholder");

console.log("\n====================================");
console.log(`Tests Run: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests.length}`);
if (failedTests.length > 0) {
  console.error("FAILURES:");
  failedTests.forEach(f => console.error("- " + f));
  process.exit(1);
} else {
  console.log("✅ ALL TESTS PASSED!");
}

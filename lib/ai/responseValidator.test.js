import { validateAiResponseSchema } from "./responseValidator.js";

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
  console.log("Running Response Validator Tests...\n");

  const validResponse = {
    type: "analysis",
    title: "Valid Title",
    summary: "Valid Summary",
    evidence: [
      {
        claimType: "DIRECT_OBSERVATION",
        supportedBy: ["ref_1"],
        assertedValue: 10,
        unit: "kg"
      }
    ],
    recommendations: [
      {
        text: "Rec",
        recommendationBasis: "GOAL_SUPPORT",
        supportedBy: ["ref_1"]
      }
    ],
    confidence: "high",
    safetyNote: null
  };

  // 1. Valid supported response
  let res = validateAiResponseSchema(validResponse);
  assert("Valid supported response", res.valid === true);

  // 2. Missing required field
  const missingTitle = { ...validResponse };
  delete missingTitle.title;
  res = validateAiResponseSchema(missingTitle);
  assert("Missing required field (title)", res.valid === false);

  // 3. Invalid type
  const invalidType = { ...validResponse, type: "unsupported" };
  res = validateAiResponseSchema(invalidType);
  assert("Invalid type", res.valid === false);

  // 4. Invalid confidence
  const invalidConfidence = { ...validResponse, confidence: "100%" };
  res = validateAiResponseSchema(invalidConfidence);
  assert("Invalid confidence", res.valid === false);

  // 5. Invalid recommendations structure
  const invalidRecs = { ...validResponse, recommendations: [{ invalidField: true }] };
  res = validateAiResponseSchema(invalidRecs);
  assert("Invalid recommendations structure", res.valid === false);

  // 6. Invalid safetyNote
  const invalidSafetyNote = { ...validResponse, safetyNote: 123 };
  res = validateAiResponseSchema(invalidSafetyNote);
  assert("Invalid safetyNote", res.valid === false);

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
}

runTests();

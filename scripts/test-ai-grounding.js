import { validateGrounding } from "../lib/ai/groundingValidator.js";

const contextDict = {
  "obs_1": { type: "DIRECT_OBSERVATION", value: 78.4, unit: "kg" },
  "obs_nonnum": { type: "DIRECT_OBSERVATION", value: "high", unit: "level" },
  "cal_avg": { type: "DERIVED_ANALYTIC", value: 2050, unit: "kcal" },
  "goal_w": { type: "USER_GOAL", value: 72, unit: "kg" },
  "insight_trend": { type: "DETERMINISTIC_INSIGHT" },
  "proto_target": { type: "PROTOCOL_TARGET", value: 3, unit: "days" }
};

let passCount = 0;
let failCount = 0;

function runTest(name, claims, expectedValid) {
  const result = validateGrounding(claims, contextDict);
  if (result.valid === expectedValid) {
    console.log(`PASS: ${name}`);
    passCount++;
  } else {
    console.error(`FAIL: ${name}. Expected valid=${expectedValid}, got ${result.valid}. Error: ${result.error}`);
    failCount++;
  }
}

// 1. valid factual observation
runTest("valid factual observation", [
  { claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_1"], assertedValue: 78.4, unit: "kg" }
], true);

// 2. invalid reference ID
runTest("invalid reference ID", [
  { claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_999"], assertedValue: 78.4, unit: "kg" }
], false);

// 3. wrong reference type
runTest("wrong reference type", [
  { claimType: "DIRECT_OBSERVATION", supportedBy: ["cal_avg"], assertedValue: 2050, unit: "kcal" }
], false);

// 4. numeric mismatch
runTest("numeric mismatch", [
  { claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_1"], assertedValue: 78.0, unit: "kg" }
], false);

// 5. non-finite assertedValue
runTest("non-finite assertedValue", [
  { claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_1"], assertedValue: NaN, unit: "kg" }
], false);

runTest("non-finite assertedValue 2", [
  { claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_1"], assertedValue: "78.4", unit: "kg" }
], false);

// 6. unit mismatch
runTest("unit mismatch", [
  { claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_1"], assertedValue: 78.4, unit: "lbs" }
], false);

// 7. valid deterministic insight
runTest("valid deterministic insight", [
  { claimType: "DETERMINISTIC_INSIGHT", insightId: "insight_trend" }
], true);

// 8. hallucinated insightId
runTest("hallucinated insightId", [
  { claimType: "DETERMINISTIC_INSIGHT", insightId: "insight_fake" }
], false);

// 9. valid GOAL_SUPPORT recommendation
runTest("valid GOAL_SUPPORT recommendation", [
  { claimType: "RECOMMENDATION", recommendationBasis: "GOAL_SUPPORT", supportedBy: ["goal_w"] }
], true);

runTest("valid GOAL_SUPPORT recommendation (protocol target)", [
  { claimType: "RECOMMENDATION", recommendationBasis: "GOAL_SUPPORT", supportedBy: ["proto_target"] }
], true);

// 10. invalid GOAL_SUPPORT reference type
runTest("invalid GOAL_SUPPORT reference type", [
  { claimType: "RECOMMENDATION", recommendationBasis: "GOAL_SUPPORT", supportedBy: ["obs_1"] }
], false);

// 11. valid METRIC_CORRECTION recommendation
runTest("valid METRIC_CORRECTION recommendation", [
  { claimType: "RECOMMENDATION", recommendationBasis: "METRIC_CORRECTION", supportedBy: ["cal_avg"] }
], true);

// 12. invalid METRIC_CORRECTION reference type
runTest("invalid METRIC_CORRECTION reference type", [
  { claimType: "RECOMMENDATION", recommendationBasis: "METRIC_CORRECTION", supportedBy: ["goal_w"] }
], false);

// 13. valid TREND_MAINTENANCE recommendation
runTest("valid TREND_MAINTENANCE recommendation", [
  { claimType: "RECOMMENDATION", recommendationBasis: "TREND_MAINTENANCE", supportedBy: ["insight_trend"] }
], true);

// 14. invalid TREND_MAINTENANCE reference type
runTest("invalid TREND_MAINTENANCE reference type", [
  { claimType: "RECOMMENDATION", recommendationBasis: "TREND_MAINTENANCE", supportedBy: ["obs_1"] }
], false);

// 15. malformed claims
runTest("malformed claims (not array)", {}, false);

runTest("malformed claims (missing claimType)", [
  { supportedBy: ["obs_1"], assertedValue: 78.4, unit: "kg" }
], false);

// 16. fail-closed behavior (one valid, one invalid)
runTest("fail-closed behavior (mixed claims)", [
  { claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_1"], assertedValue: 78.4, unit: "kg" },
  { claimType: "DIRECT_OBSERVATION", supportedBy: ["obs_nonnum"], assertedValue: "low", unit: "level" } // value mismatch
], false);

console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);

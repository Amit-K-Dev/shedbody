import { evaluateAdaptationEligibility } from "../lib/plans/eligibilityEngine.js";

function runTests() {
  console.log("--- RUNNING ADAPTIVE ELIGIBILITY TESTS ---");

  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, testName) {
    if (actual === expected) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - Expected ${expected}, got ${actual}`);
      failed++;
    }
  }

  function assertObjEqual(actual, expected, testName) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr === expStr) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      console.error(`  Expected: ${expStr}`);
      console.error(`  Got:      ${actStr}`);
      failed++;
    }
  }

  const currentDate = "2023-10-15";
  const defaultActivePlan = { created_at: "2023-10-01T00:00:00Z", calories: 2000 };
  const loseGoal = { status: "active", start_value: 90, target_value: 80 };
  const gainGoal = { status: "active", start_value: 70, target_value: 80 };

  const validWeights = [
    { date: "2023-10-09", metrics: { weightKg: 85.0 } },
    { date: "2023-10-15", metrics: { weightKg: 85.0 } }
  ];

  const validNutrition = [
    { date: "2023-10-10", metrics: { calories: 2000 } },
    { date: "2023-10-11", metrics: { calories: 2000 } },
    { date: "2023-10-12", metrics: { calories: 2000 } },
    { date: "2023-10-13", metrics: { calories: 2000 } },
    { date: "2023-10-14", metrics: { calories: 2000 } }
  ];

  const fullTimeline = [...validWeights, ...validNutrition];

  // 1. cooldown active
  const recentPlan = { created_at: "2023-10-13T00:00:00Z", calories: 2000 };
  let res = evaluateAdaptationEligibility(fullTimeline, recentPlan, loseGoal, currentDate);
  assertEqual(res.eligible, false, "cooldown active -> not eligible");
  assertEqual(res.reasonCode, "COOLDOWN_ACTIVE", "cooldown active -> reasonCode");

  // 1b. cooldown boundary (just below 7 days)
  const justBelow7Days = { created_at: "2023-10-08T00:00:01Z", calories: 2000 }; // current is 15T00:00:00Z
  res = evaluateAdaptationEligibility(fullTimeline, justBelow7Days, loseGoal, currentDate);
  assertEqual(res.eligible, false, "cooldown just below 7 days -> not eligible");
  assertEqual(res.reasonCode, "COOLDOWN_ACTIVE", "cooldown just below 7 days -> reasonCode");

  // 1c. cooldown boundary (exactly 7 days)
  const exactly7Days = { created_at: "2023-10-08T00:00:00Z", calories: 2000 };
  res = evaluateAdaptationEligibility(fullTimeline, exactly7Days, loseGoal, currentDate);
  assertEqual(res.reasonCode, "ELIGIBLE_PLATEAU", "cooldown exactly 7 days -> eligible plateau (since fullTimeline is plateau)");

  // 2. insufficient nutrition data
  res = evaluateAdaptationEligibility([...validWeights, validNutrition[0]], defaultActivePlan, loseGoal, currentDate);
  assertEqual(res.eligible, false, "insufficient nutrition data -> not eligible");
  assertEqual(res.reasonCode, "INSUFFICIENT_DATA", "insufficient nutrition data -> reasonCode");

  // 3. insufficient weight data
  res = evaluateAdaptationEligibility([validWeights[0], ...validNutrition], defaultActivePlan, loseGoal, currentDate);
  assertEqual(res.eligible, false, "insufficient weight data -> not eligible");
  assertEqual(res.reasonCode, "INSUFFICIENT_DATA", "insufficient weight data -> reasonCode");

  // 3b. same-day weight logs
  const sameDayWeights = [
    { date: "2023-10-15", metrics: { weightKg: 85.0 } },
    { date: "2023-10-15", metrics: { weightKg: 84.5 } }
  ];
  res = evaluateAdaptationEligibility([...sameDayWeights, ...validNutrition], defaultActivePlan, loseGoal, currentDate);
  assertEqual(res.eligible, false, "same-day weight logs -> not eligible");
  assertEqual(res.reasonCode, "INSUFFICIENT_DATA", "same-day weight logs -> reasonCode");

  // 4. low adherence
  const lowNutrition = validNutrition.map(n => ({ date: n.date, metrics: { calories: 1500 } }));
  res = evaluateAdaptationEligibility([...validWeights, ...lowNutrition], defaultActivePlan, loseGoal, currentDate);
  assertEqual(res.eligible, false, "low adherence -> not eligible");
  assertEqual(res.reasonCode, "LOW_ADHERENCE", "low adherence -> reasonCode");

  // 5. high adherence (trigger plateau)
  res = evaluateAdaptationEligibility(fullTimeline, defaultActivePlan, loseGoal, currentDate);
  assertEqual(res.eligible, true, "high adherence + plateau -> eligible");
  assertEqual(res.reasonCode, "ELIGIBLE_PLATEAU", "high adherence + plateau -> reasonCode");

  // 6. lose-weight regression -> eligible plateau
  const regressionWeights = [
    { date: "2023-10-09", metrics: { weightKg: 85.0 } },
    { date: "2023-10-15", metrics: { weightKg: 85.5 } }
  ];
  res = evaluateAdaptationEligibility([...regressionWeights, ...validNutrition], defaultActivePlan, loseGoal, currentDate);
  assertEqual(res.eligible, true, "lose-weight regression -> eligible plateau");
  assertEqual(res.reasonCode, "ELIGIBLE_PLATEAU", "lose-weight regression -> reasonCode");

  // 7. gain-weight plateau
  res = evaluateAdaptationEligibility(fullTimeline, defaultActivePlan, gainGoal, currentDate);
  assertEqual(res.eligible, true, "gain-weight plateau -> eligible");
  assertEqual(res.reasonCode, "ELIGIBLE_PLATEAU", "gain-weight plateau -> reasonCode");

  // 8. lose-weight on-track (fast rate)
  const rapidLosingWeights = [
    { date: "2023-10-09", metrics: { weightKg: 85.0 } },
    { date: "2023-10-15", metrics: { weightKg: 83.0 } } // -2.0 over 6 days = -0.33 kg/day
  ];
  res = evaluateAdaptationEligibility([...rapidLosingWeights, ...validNutrition], defaultActivePlan, loseGoal, currentDate);
  assertEqual(res.eligible, false, "lose-weight on-track fast -> not eligible (no rapid change)");
  assertEqual(res.reasonCode, "ON_TRACK", "lose-weight on-track fast -> reasonCode");

  // 9. gain-weight on-track (fast rate)
  const rapidGainingWeights = [
    { date: "2023-10-09", metrics: { weightKg: 85.0 } },
    { date: "2023-10-15", metrics: { weightKg: 87.0 } } // +2.0 over 6 days = +0.33 kg/day
  ];
  res = evaluateAdaptationEligibility([...rapidGainingWeights, ...validNutrition], defaultActivePlan, gainGoal, currentDate);
  assertEqual(res.eligible, false, "gain-weight on-track fast -> not eligible (no rapid change)");
  assertEqual(res.reasonCode, "ON_TRACK", "gain-weight on-track fast -> reasonCode");

  // 10. unsupported/missing goal
  const maintainGoal = { status: "active", start_value: 80, target_value: 80 };
  res = evaluateAdaptationEligibility(fullTimeline, defaultActivePlan, maintainGoal, currentDate);
  assertEqual(res.eligible, false, "maintain goal -> not eligible");
  assertEqual(res.reasonCode, "UNSUPPORTED_GOAL", "maintain goal -> reasonCode");

  // 11. invalid numeric data
  const invalidNutrition = validNutrition.map(n => ({ date: n.date, metrics: { calories: NaN } }));
  res = evaluateAdaptationEligibility([...validWeights, ...invalidNutrition], defaultActivePlan, loseGoal, currentDate);
  assertEqual(res.eligible, false, "invalid numeric data -> not eligible");
  assertEqual(res.reasonCode, "INSUFFICIENT_DATA", "invalid numeric data -> reasonCode");

  // 12. exact 7-day window boundary & day 8 excluded
  const outsideWindowWeight = { date: "2023-10-08", metrics: { weightKg: 86.0 } }; // Day 8 (excluded)
  const windowBoundaryWeight = { date: "2023-10-09", metrics: { weightKg: 85.0 } }; // Day 7 (included)
  const endBoundaryWeight = { date: "2023-10-15", metrics: { weightKg: 84.0 } }; // Day 1 (included)
  
  const windowTimeline = [outsideWindowWeight, windowBoundaryWeight, endBoundaryWeight, ...validNutrition];
  res = evaluateAdaptationEligibility(windowTimeline, defaultActivePlan, loseGoal, currentDate);
  // Weight change should be from 10-09 to 10-15 (85 -> 84 = -1kg over 6 days) 
  // NOT from 10-08 (86 -> 84)
  assertEqual(res.evidence.weightRateOfChange, Math.round((-1 / 6) * 100) / 100, "day 8 excluded and 7-day window boundary honored");

  // 13. no mutation of input objects
  const timelineCopy = JSON.parse(JSON.stringify(fullTimeline));
  evaluateAdaptationEligibility(fullTimeline, defaultActivePlan, loseGoal, currentDate);
  assertObjEqual(fullTimeline, timelineCopy, "no mutation of input timeline");

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();

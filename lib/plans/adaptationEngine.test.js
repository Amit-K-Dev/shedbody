import { calculateAdaptation, POLICY_CONSTANTS } from "./adaptationEngine.js";

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
  console.log("Running B2-R Adaptation Engine Tests...\n");

  const baseEligibleLose = { reasonCode: "ELIGIBLE_PLATEAU", evidence: { goalDirection: "lose" } };
  const baseEligibleGain = { reasonCode: "ELIGIBLE_PLATEAU", evidence: { goalDirection: "gain" } };

  // --- LOSS ---
  // 1. 2000 -> 1900
  let res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 2000, currentWeightKg: 80 });
  assert("Loss: 2000 -> 1900", res.canAdapt && res.planUpdates.calories === 1900 && !res.snapshot.isClamped);

  // 2. 1250 -> 1200 clamp
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 1250, currentWeightKg: 80 });
  assert("Loss: 1250 -> 1200 clamp", res.canAdapt && res.planUpdates.calories === 1200 && res.snapshot.isClamped);

  // 3. 1200 -> ADAPTATION_MAXED_OUT
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 1200, currentWeightKg: 80 });
  assert("Loss: 1200 -> ADAPTATION_MAXED_OUT", !res.canAdapt && res.status === "ADAPTATION_MAXED_OUT");

  // 4. 1100 -> ADAPTATION_MAXED_OUT
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 1100, currentWeightKg: 80 });
  assert("Loss: 1100 -> ADAPTATION_MAXED_OUT", !res.canAdapt && res.status === "ADAPTATION_MAXED_OUT");

  // 5. invalid calories
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: -500, currentWeightKg: 80 });
  assert("Loss: invalid calories -> INSUFFICIENT_DATA", !res.canAdapt && res.status === "INSUFFICIENT_DATA");
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: NaN, currentWeightKg: 80 });
  assert("Loss: NaN calories -> INSUFFICIENT_DATA", !res.canAdapt && res.status === "INSUFFICIENT_DATA");

  // 6. missing weight
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 2000 });
  assert("Loss: missing weight -> INSUFFICIENT_DATA", !res.canAdapt && res.status === "INSUFFICIENT_DATA");

  // 7. invalid weight
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 2000, currentWeightKg: 0 });
  assert("Loss: invalid weight -> INSUFFICIENT_DATA", !res.canAdapt && res.status === "INSUFFICIENT_DATA");

  // 8. TDEE missing but loss still succeeds
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 2000, currentWeightKg: 80, currentTdee: undefined });
  assert("Loss: TDEE missing -> Succeeds", res.canAdapt === true);


  // --- GAIN ---
  // 9. TDEE 2000 -> upperBound 2500
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2000, currentWeightKg: 80, currentTdee: 2000 });
  assert("Gain: TDEE 2000 -> upperBound 2500, 2000 -> 2100", res.canAdapt && res.planUpdates.calories === 2100 && !res.snapshot.isClamped && res.snapshot.gainUpperBound === 2500);

  // 10. 2300 -> 2400
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2300, currentWeightKg: 80, currentTdee: 2000 });
  assert("Gain: 2300 -> 2400", res.canAdapt && res.planUpdates.calories === 2400 && !res.snapshot.isClamped);

  // 11. 2450 -> 2500 clamp
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2450, currentWeightKg: 80, currentTdee: 2000 });
  assert("Gain: 2450 -> 2500 clamp", res.canAdapt && res.planUpdates.calories === 2500 && res.snapshot.isClamped);

  // 12. 2500 -> ADAPTATION_MAXED_OUT
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2500, currentWeightKg: 80, currentTdee: 2000 });
  assert("Gain: 2500 -> ADAPTATION_MAXED_OUT", !res.canAdapt && res.status === "ADAPTATION_MAXED_OUT");

  // 13. 2600 -> ADAPTATION_MAXED_OUT
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2600, currentWeightKg: 80, currentTdee: 2000 });
  assert("Gain: 2600 -> ADAPTATION_MAXED_OUT", !res.canAdapt && res.status === "ADAPTATION_MAXED_OUT");

  // 14. missing TDEE -> INSUFFICIENT_DATA
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2000, currentWeightKg: 80 });
  assert("Gain: missing TDEE -> INSUFFICIENT_DATA", !res.canAdapt && res.status === "INSUFFICIENT_DATA");

  // 15. zero TDEE
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2000, currentWeightKg: 80, currentTdee: 0 });
  assert("Gain: zero TDEE -> INSUFFICIENT_DATA", !res.canAdapt && res.status === "INSUFFICIENT_DATA");

  // 16. negative TDEE
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2000, currentWeightKg: 80, currentTdee: -500 });
  assert("Gain: negative TDEE -> INSUFFICIENT_DATA", !res.canAdapt && res.status === "INSUFFICIENT_DATA");

  // 17. Infinity TDEE
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2000, currentWeightKg: 80, currentTdee: Infinity });
  assert("Gain: Infinity TDEE -> INSUFFICIENT_DATA", !res.canAdapt && res.status === "INSUFFICIENT_DATA");


  // --- PROTEIN ---
  // 18. fat_loss weight x 2.2
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 2000, currentWeightKg: 70 });
  assert("Protein: lose -> weight * 2.2", res.planUpdates.protein === Math.round(70 * 2.2));

  // 19. maintenance adaptation is unsupported but 1.8 factor exists
  res = calculateAdaptation({ eligibility: { reasonCode: "ELIGIBLE_PLATEAU", evidence: { goalDirection: "maintain" } }, currentCalories: 2000, currentWeightKg: 70 });
  assert("State: maintenance calorie adaptation is UNSUPPORTED_GOAL (blocks before protein factor 1.8 is used)", !res.canAdapt && res.status === "UNSUPPORTED_GOAL" && res.planUpdates === undefined);

  // 20. muscle_gain weight x 2.0
  res = calculateAdaptation({ eligibility: baseEligibleGain, currentCalories: 2000, currentWeightKg: 70, currentTdee: 2000 });
  assert("Protein: gain -> weight * 2.0", res.planUpdates.protein === Math.round(70 * 2.0));

  // 21. protein recalculated after successful clamp
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 1250, currentWeightKg: 70 });
  assert("Protein: recalculated after clamp", res.canAdapt && res.snapshot.isClamped && res.planUpdates.protein === Math.round(70 * 2.2));

  // 22. protein NOT generated for blocked adaptation
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 1200, currentWeightKg: 70 });
  assert("Protein: NOT generated for blocked adaptation", !res.canAdapt && res.planUpdates === undefined);


  // --- STATES ---
  // 23. COOLDOWN_ACTIVE
  res = calculateAdaptation({ eligibility: { reasonCode: "COOLDOWN_ACTIVE" }, currentCalories: 2000, currentWeightKg: 70 });
  assert("State: COOLDOWN_ACTIVE -> blocked", !res.canAdapt && res.status === "COOLDOWN_ACTIVE");

  // 24. INSUFFICIENT_DATA
  res = calculateAdaptation({ eligibility: { reasonCode: "INSUFFICIENT_DATA" }, currentCalories: 2000, currentWeightKg: 70 });
  assert("State: INSUFFICIENT_DATA -> blocked", !res.canAdapt && res.status === "INSUFFICIENT_DATA");

  // 25. LOW_ADHERENCE
  res = calculateAdaptation({ eligibility: { reasonCode: "LOW_ADHERENCE" }, currentCalories: 2000, currentWeightKg: 70 });
  assert("State: LOW_ADHERENCE -> blocked", !res.canAdapt && res.status === "LOW_ADHERENCE");

  // 26. ON_TRACK
  res = calculateAdaptation({ eligibility: { reasonCode: "ON_TRACK" }, currentCalories: 2000, currentWeightKg: 70 });
  assert("State: ON_TRACK -> blocked", !res.canAdapt && res.status === "ON_TRACK");

  // 27. UNSUPPORTED_GOAL
  res = calculateAdaptation({ eligibility: { reasonCode: "UNSUPPORTED_GOAL" }, currentCalories: 2000, currentWeightKg: 70 });
  assert("State: UNSUPPORTED_GOAL -> blocked", !res.canAdapt && res.status === "UNSUPPORTED_GOAL");

  // 28. ELIGIBLE_PLATEAU
  res = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 2000, currentWeightKg: 70 });
  assert("State: ELIGIBLE_PLATEAU -> success", res.canAdapt && res.status === "ELIGIBLE_PLATEAU");


  // --- DETERMINISM ---
  // 29. same input -> identical output
  const res1 = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 2000, currentWeightKg: 70 });
  const res2 = calculateAdaptation({ eligibility: baseEligibleLose, currentCalories: 2000, currentWeightKg: 70 });
  assert("Determinism: Identical output", JSON.stringify(res1) === JSON.stringify(res2));

  // 30. snapshot is serializable
  try {
    JSON.stringify(res1.snapshot);
    assert("Determinism: Snapshot is serializable", true);
  } catch (e) {
    assert("Determinism: Snapshot is serializable", false);
  }

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
}

runTests();

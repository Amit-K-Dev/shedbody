import { rules, isValidDate } from "./rules.js";

let passed = 0;
let failed = 0;

function assert(name, condition, details = "") {
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    failed++;
    console.error(`[FAIL] ${name} ${details}`);
  }
}

function runTests() {
  console.log("Running rules.js Tests...\n");

  const currentDate = "2026-10-01";
  const profile = {};
  const activePlan = { calories: 2000, protein: 150 };
  const activeWeightGoal = { domain: "weight", status: "active", start_value: 80, target_value: 75 };

  // Helper to generate a timeline entry
  const entry = (date, weight, workouts, calories, protein) => ({
    date,
    body: { weight },
    lifestyle: { workoutCompleted: workouts },
    nutrition: { calories, protein }
  });

  // 1. WEIGHT_TREND_CHANGE
  const weightRule = rules.find(r => r.id === "WEIGHT_TREND_CHANGE");
  assert("WEIGHT_TREND_CHANGE exists", !!weightRule);
  
  if (weightRule) {
    // Non-trigger: not enough data
    let res = weightRule.canEvaluate([], profile, activePlan, activeWeightGoal, currentDate);
    assert("WEIGHT_TREND_CHANGE: rejects empty timeline", res === false);

    // Trigger: has enough data
    // current (2026-09-25 to 2026-10-01): 2 entries needed
    // previous (2026-09-18 to 2026-09-24): 1 entry needed
    const tWeightPositive = [
      entry("2026-09-20", 81), // previous
      entry("2026-09-26", 80), // current
      entry("2026-09-27", 79)  // current
    ];
    res = weightRule.canEvaluate(tWeightPositive, profile, activePlan, activeWeightGoal, currentDate);
    assert("WEIGHT_TREND_CHANGE: accepts valid timeline", res === true);

    const evalResult = weightRule.evaluate(tWeightPositive, profile, activePlan, activeWeightGoal, currentDate);
    assert("WEIGHT_TREND_CHANGE: returns correct insight structure", evalResult && evalResult.id === "WEIGHT_TREND_CHANGE");
    
    // Non-trigger evaluate: weight diff is < 0.5kg
    const tWeightNoChange = [
      entry("2026-09-20", 80), 
      entry("2026-09-26", 80),
      entry("2026-09-27", 80.1)
    ];
    const noChangeResult = weightRule.evaluate(tWeightNoChange, profile, activePlan, activeWeightGoal, currentDate);
    assert("WEIGHT_TREND_CHANGE: returns null if change < 0.5kg", noChangeResult === null);
  }

  // 2. WORKOUT_CONSISTENCY
  const workoutRule = rules.find(r => r.id === "WORKOUT_CONSISTENCY");
  assert("WORKOUT_CONSISTENCY exists", !!workoutRule);

  if (workoutRule) {
    const tWorkoutDiff = [
      entry("2026-09-20", null, true),
      entry("2026-09-21", null, true), // previous: 2
      entry("2026-09-26", null, true),
      entry("2026-09-27", null, false),
      entry("2026-09-28", null, false) // current: 1
    ];
    let res = workoutRule.canEvaluate(tWorkoutDiff, profile, activePlan, activeWeightGoal, currentDate);
    assert("WORKOUT_CONSISTENCY: accepts valid timeline", res === true);

    const dropResult = workoutRule.evaluate(tWorkoutDiff, profile, activePlan, activeWeightGoal, currentDate);
    assert("WORKOUT_CONSISTENCY: returns drop insight", dropResult && dropResult.id === "WORKOUT_CONSISTENCY_DROP");

    const tWorkoutSame = [
      entry("2026-09-20", null, true), // previous: 1
      entry("2026-09-26", null, true),
      entry("2026-09-27", null, false) // current: 1
    ];
    const sameResult = workoutRule.evaluate(tWorkoutSame, profile, activePlan, activeWeightGoal, currentDate);
    assert("WORKOUT_CONSISTENCY: returns null on equal workouts", sameResult === null);
  }

  // 3. NUTRITION_CALORIC_ADHERENCE
  const calRule = rules.find(r => r.id === "NUTRITION_CALORIC_ADHERENCE");
  assert("NUTRITION_CALORIC_ADHERENCE exists", !!calRule);

  if (calRule) {
    const tCalGood = [
      entry("2026-09-26", null, null, 1900),
      entry("2026-09-27", null, null, 2050),
      entry("2026-09-28", null, null, 1950)
    ]; // avg 1966.6, target 2000. dev = 1.6%
    let res = calRule.canEvaluate(tCalGood, profile, activePlan, activeWeightGoal, currentDate);
    assert("NUTRITION_CALORIC_ADHERENCE: accepts valid timeline", res === true);

    const goodCalResult = calRule.evaluate(tCalGood, profile, activePlan, activeWeightGoal, currentDate);
    assert("NUTRITION_CALORIC_ADHERENCE: returns positive adherence", goodCalResult && goodCalResult.id === "NUTRITION_CALORIC_ADHERENCE_POSITIVE");

    const tCalBad = [
      entry("2026-09-26", null, null, 3000),
      entry("2026-09-27", null, null, 3500),
      entry("2026-09-28", null, null, 4000)
    ]; // avg 3500, dev > 10%
    const badCalResult = calRule.evaluate(tCalBad, profile, activePlan, activeWeightGoal, currentDate);
    assert("NUTRITION_CALORIC_ADHERENCE: returns null if not adhering", badCalResult === null);
  }

  // 4. PROTEIN_CONSISTENCY
  const proRule = rules.find(r => r.id === "PROTEIN_CONSISTENCY");
  assert("PROTEIN_CONSISTENCY exists", !!proRule);

  if (proRule) {
    const tProGood = [
      entry("2026-09-26", null, null, 0, 145),
      entry("2026-09-27", null, null, 0, 155),
      entry("2026-09-28", null, null, 0, 150)
    ]; // avg 150
    let res = proRule.canEvaluate(tProGood, profile, activePlan, activeWeightGoal, currentDate);
    assert("PROTEIN_CONSISTENCY: accepts valid timeline", res === true);

    const goodProResult = proRule.evaluate(tProGood, profile, activePlan, activeWeightGoal, currentDate);
    assert("PROTEIN_CONSISTENCY: returns positive adherence", goodProResult && goodProResult.id === "PROTEIN_CONSISTENCY_POSITIVE");

    const tProBad = [
      entry("2026-09-26", null, null, 0, 50),
      entry("2026-09-27", null, null, 0, 60),
      entry("2026-09-28", null, null, 0, 55)
    ];
    const badProResult = proRule.evaluate(tProBad, profile, activePlan, activeWeightGoal, currentDate);
    assert("PROTEIN_CONSISTENCY: returns null if not adhering", badProResult === null);
  }

  // 5. GOAL_PROGRESS
  const goalRule = rules.find(r => r.id === "GOAL_PROGRESS");
  assert("GOAL_PROGRESS exists", !!goalRule);

  if (goalRule) {
    const tGoal = [ entry("2026-09-28", 77) ]; // started 80, target 75
    let res = goalRule.canEvaluate(tGoal, profile, activePlan, activeWeightGoal, currentDate);
    assert("GOAL_PROGRESS: accepts timeline", res === true);

    const goalResult = goalRule.evaluate(tGoal, profile, activePlan, activeWeightGoal, currentDate);
    assert("GOAL_PROGRESS: evaluates correctly", goalResult && goalResult.id === "GOAL_PROGRESS_INFO");
  }

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

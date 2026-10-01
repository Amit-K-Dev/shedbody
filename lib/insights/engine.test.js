import { generateStructuredInsights } from "./engine.js";

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
  console.log("Running engine.js Tests...\n");

  const currentDate = "2026-10-01";
  const profile = {};
  const activePlan = { calories: 2000, protein: 150 };
  const activeWeightGoal = { domain: "weight", status: "active", start_value: 80, target_value: 75 };

  const entry = (date, weight, workouts, calories, protein) => ({
    date,
    body: { weight },
    lifestyle: { workoutCompleted: workouts },
    nutrition: { calories, protein }
  });

  // Construct a timeline that triggers multiple insights:
  // 1. Goal Progress
  // 2. Nutrition Caloric Adherence
  const unifiedTimeline = [
    entry("2026-09-26", 78, true, 1950, 150),
    entry("2026-09-27", 78, true, 2050, 150),
    entry("2026-09-28", 78, true, 2000, 150)
  ];

  const insights = generateStructuredInsights(unifiedTimeline, profile, activePlan, activeWeightGoal, currentDate);

  assert("Returns an array", Array.isArray(insights));
  assert("Generates multiple insights", insights.length >= 2);

  // Check structure and sorting
  // Priority: GOAL_PROGRESS (5), WEIGHT_TREND_CHANGE (10), WORKOUT_CONSISTENCY (20), NUTRITION_CALORIC_ADHERENCE (30), PROTEIN_CONSISTENCY (35)
  // Expected order based on this timeline:
  // 1. GOAL_PROGRESS_INFO (priority: 5)
  // 2. NUTRITION_CALORIC_ADHERENCE_POSITIVE (priority: 30)
  // 3. PROTEIN_CONSISTENCY_POSITIVE (priority: 35)

  if (insights.length > 0) {
    const ids = insights.map(i => i.id);
    
    assert("Contains GOAL_PROGRESS_INFO", ids.includes("GOAL_PROGRESS_INFO"));
    assert("Contains NUTRITION_CALORIC_ADHERENCE_POSITIVE", ids.includes("NUTRITION_CALORIC_ADHERENCE_POSITIVE"));
    assert("Contains PROTEIN_CONSISTENCY_POSITIVE", ids.includes("PROTEIN_CONSISTENCY_POSITIVE"));

    let sorted = true;
    for (let i = 0; i < insights.length - 1; i++) {
      if (insights[i].priority > insights[i+1].priority) {
        sorted = false;
        break;
      }
    }
    assert("Insights are sorted by priority", sorted);
  }

  // Edge case: Empty or null timeline
  assert("Handles null timeline", generateStructuredInsights(null, profile, activePlan, activeWeightGoal, currentDate).length === 0);
  assert("Handles empty timeline", generateStructuredInsights([], profile, activePlan, activeWeightGoal, currentDate).length === 0);

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

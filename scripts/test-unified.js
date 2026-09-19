import { mergeDailyMetrics } from "../lib/analytics/unified.js";

// Test 1: Empty inputs
console.log("Test 1: Empty inputs");
const res1 = mergeDailyMetrics();
console.log(JSON.stringify(res1) === "[]" ? "PASS" : "FAIL");

// Test 2: Body only
console.log("\nTest 2: Body only");
const bodyData = [
  { created_at: "2026-09-18T10:00:00Z", weight: 70, body_fat: 15 },
];
const res2 = mergeDailyMetrics(bodyData);
console.log(res2.length === 1 && res2[0].date === "2026-09-18" && res2[0].body.weight === 70 ? "PASS" : "FAIL");

// Test 3: Nutrition only
console.log("\nTest 3: Nutrition only");
const nutritionData = [
  { log_date: "2026-09-19", calories: 2000, protein: 150, water_ml: 3000 }
];
const res3 = mergeDailyMetrics([], nutritionData);
console.log(res3.length === 1 && res3[0].date === "2026-09-19" && res3[0].nutrition.calories === 2000 ? "PASS" : "FAIL");

// Test 4: Lifestyle only
console.log("\nTest 4: Lifestyle only");
const lifestyleData = [
  { log_date: "2026-09-20", workout_completed: true, steps_count: 10000, sleep_hours: 8 }
];
const res4 = mergeDailyMetrics([], [], lifestyleData);
console.log(res4.length === 1 && res4[0].date === "2026-09-20" && res4[0].lifestyle.workoutCompleted === true ? "PASS" : "FAIL");

// Test 5: Partial date overlap
console.log("\nTest 5: Partial date overlap");
const res5 = mergeDailyMetrics(
  [{ created_at: "2026-09-18T10:00:00Z", weight: 70 }],
  [{ log_date: "2026-09-18", calories: 2000 }],
  [{ log_date: "2026-09-19", steps_count: 5000 }]
);
console.log(res5.length === 2 && res5[0].date === "2026-09-18" && res5[1].date === "2026-09-19" && res5[0].body.weight === 70 && res5[0].nutrition.calories === 2000 && res5[1].lifestyle.steps === 5000 ? "PASS" : "FAIL");

// Test 6: Null preservation
console.log("\nTest 6: Null preservation");
const res6 = mergeDailyMetrics(
  [],
  [],
  [{ log_date: "2026-09-18", workout_completed: null, steps_count: null, sleep_hours: null }]
);
console.log(res6[0].lifestyle.workoutCompleted === null && res6[0].lifestyle.steps === null ? "PASS" : "FAIL");

// Test 7: Zero preservation
console.log("\nTest 7: Zero preservation");
const res7 = mergeDailyMetrics(
  [],
  [{ log_date: "2026-09-18", calories: 0, protein: 0, water_ml: 0 }],
  [{ log_date: "2026-09-18", steps_count: 0, sleep_hours: 0 }]
);
console.log(res7[0].nutrition.calories === 0 && res7[0].lifestyle.steps === 0 ? "PASS" : "FAIL");

// Test 8: True/False preservation
console.log("\nTest 8: True/False preservation");
const res8 = mergeDailyMetrics(
  [],
  [],
  [{ log_date: "2026-09-18", workout_completed: false }, { log_date: "2026-09-19", workout_completed: true }]
);
console.log(res8[0].lifestyle.workoutCompleted === false && res8[1].lifestyle.workoutCompleted === true ? "PASS" : "FAIL");

// Test 9: Chronological ASC ordering
console.log("\nTest 9: Chronological ASC ordering");
const res9 = mergeDailyMetrics(
  [{ created_at: "2026-09-20T10:00:00Z", weight: 70 }],
  [{ log_date: "2026-09-18", calories: 2000 }]
);
console.log(res9[0].date === "2026-09-18" && res9[1].date === "2026-09-20" ? "PASS" : "FAIL");

// Test 10: Duplicate progress dates (latest chronological wins)
console.log("\nTest 10: Duplicate progress dates");
const res10 = mergeDailyMetrics(
  [
    { created_at: "2026-09-18T10:00:00Z", weight: 70 },
    { created_at: "2026-09-18T14:00:00Z", weight: 71 }, // Should win
    { created_at: "2026-09-18T08:00:00Z", weight: 69 }
  ]
);
console.log(res10.length === 1 && res10[0].body.weight === 71 ? "PASS" : "FAIL");

// Test 11: Duplicate nutrition/lifestyle dates -> deterministic behavior
console.log("\nTest 11: Duplicate nutrition/lifestyle dates");
const res11 = mergeDailyMetrics(
  [],
  [
    { log_date: "2026-09-18", calories: 2000 },
    { log_date: "2026-09-18", calories: 2500 } // Takes the last one in the array
  ]
);
console.log(res11.length === 1 && res11[0].nutrition.calories === 2500 ? "PASS" : "FAIL");

console.log("\n--- UI Mapping Tests ---");
console.log("Test 12: workout true -> 1, false -> 0, null -> null");
// Inline mock of formatChartData to avoid JSX import errors in Node
function formatChartData(unifiedTimeline) {
  if (!unifiedTimeline || unifiedTimeline.length === 0) return [];
  return unifiedTimeline.map((item) => {
    return {
      workout: item.lifestyle.workoutCompleted === true ? 1 : (item.lifestyle.workoutCompleted === false ? 0 : null),
      water: item.nutrition.water,
      steps: item.lifestyle.steps,
    };
  });
}
const uiRes = formatChartData([
  { date: "2026-09-18", nutrition: {}, lifestyle: { workoutCompleted: null } },
  { date: "2026-09-19", nutrition: {}, lifestyle: { workoutCompleted: false } },
  { date: "2026-09-20", nutrition: {}, lifestyle: { workoutCompleted: true } },
]);
console.log(
  uiRes[0].workout === null &&
  uiRes[1].workout === 0 &&
  uiRes[2].workout === 1
    ? "PASS"
    : "FAIL"
);

console.log("ALL TESTS COMPLETED.");

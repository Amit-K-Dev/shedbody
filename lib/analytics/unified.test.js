import { mergeDailyMetrics, generateTimeline } from "./unified.js";

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
  console.log("Running Timeline Foundation Tests...\n");

  // 1. Empty inputs
  let timeline = generateTimeline([], [], [], []);
  assert("empty inputs return empty array", Array.isArray(timeline) && timeline.length === 0);

  // 2. null/missing domains
  timeline = generateTimeline(null, undefined, [], null);
  assert("null/missing domains handled gracefully", Array.isArray(timeline) && timeline.length === 0);

  // 3. existing mergeDailyMetrics behavior remaining intact
  const p1 = [{ created_at: "2026-10-01T10:00:00.000Z", weight: 80 }];
  const l1 = [{ log_date: "2026-10-01", workout_completed: true }];
  const n1 = [{ log_date: "2026-10-01", calories: 2000 }];
  const merged = mergeDailyMetrics(p1, n1, l1);
  assert("mergeDailyMetrics behavior remains intact", 
    merged.length === 1 && 
    merged[0].body.weight === 80 && 
    merged[0].lifestyle.workoutCompleted === true && 
    merged[0].nutrition.calories === 2000
  );

  // 4. multiple domains on the same date + chronological ordering + deterministic ordering when timestamps are equal
  // Note: generateTimeline sorts descending by timestamp. Tie-breakers: weight(1), workout(2), steps(3), nutrition(4), water(5), insight(6)
  const p2 = [{ created_at: "2026-10-01T00:00:00.000Z", weight: 72.4 }];
  const l2 = [
    { log_date: "2026-10-01", created_at: "2026-10-01T00:00:00.000Z", workout_completed: true, steps_count: 7420 },
    { log_date: "2026-10-02", created_at: "2026-10-02T00:00:00.000Z", steps_count: 5000 }
  ];
  const n2 = [{ log_date: "2026-10-01", created_at: "2026-10-01T00:00:00.000Z", calories: 2100, water_ml: 2100 }];
  const insights = [{ id: "WEIGHT_TREND", observation: "Weight dropping", timestamp: "2026-10-01T00:00:00.000Z" }];

  timeline = generateTimeline(p2, n2, l2, insights);
  
  assert("timeline contains all events (6 items)", timeline.length === 7); // weight, workout, steps, nutrition, water, insight, plus steps on 10-02
  assert("chronological ordering (descending) works", timeline[0].date === "2026-10-02" && timeline[1].date === "2026-10-01");
  
  // Check tie-breakers for 2026-10-01 (should be ordered weight -> workout -> steps -> nutrition -> water -> insight)
  const items01 = timeline.filter(i => i.date === "2026-10-01");
  assert("deterministic tie-breaker order is correct", 
    items01[0].label === "Weight" &&
    items01[1].label === "Workout completed" &&
    items01[2].label === "Steps" &&
    items01[3].label === "Nutrition logged" &&
    items01[4].label === "Water" &&
    items01[5].label === "AI insight generated"
  );

  assert("values are mapped correctly", 
    items01[0].value === "72.4 kg" &&
    items01[2].value === "7,420 steps" &&
    items01[4].value === "2.1 L"
  );

  // 5. date-range boundaries
  const boundedTimeline = generateTimeline(p2, n2, l2, insights, { startDate: "2026-10-01", endDate: "2026-10-01" });
  assert("date-range boundaries respected", boundedTimeline.length === 6 && !boundedTimeline.some(i => i.date === "2026-10-02"));

  const limitedTimeline = generateTimeline(p2, n2, l2, insights, { limit: 3 });
  assert("limit respected", limitedTimeline.length === 3);

  // 6. insight insertion
  assert("insight insertion maps source and value correctly", items01[5].source === "ai" && items01[5].value === "Weight dropping");

  // 7. duplicate prevention (test exact duplicate DB objects)
  const dupTimeline = generateTimeline([...p2, ...p2], n2, l2, insights);
  assert("duplicate prevention works for exact duplicate items", dupTimeline.filter(i => i.label === "Weight").length === 1);

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();

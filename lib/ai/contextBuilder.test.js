import { buildAiContext, classifyIntent } from "./contextBuilder.js";

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
  console.log("Running contextBuilder.js Tests...\n");

  // 1. classifyIntent
  assert("Intent: GOAL_PROGRESS", classifyIntent("am I close to my goal?") === "GOAL_PROGRESS");
  assert("Intent: WEIGHT_TREND", classifyIntent("why is my weight stuck") === "WEIGHT_TREND");
  assert("Intent: NUTRITION_ADHERENCE", classifyIntent("how are my calories") === "NUTRITION_ADHERENCE");
  assert("Intent: WORKOUT_LIFESTYLE", classifyIntent("did I workout yesterday") === "WORKOUT_LIFESTYLE");
  assert("Intent: GENERAL_SUMMARY (fallback)", classifyIntent("hello") === "GENERAL_SUMMARY");
  assert("Intent: null fallback", classifyIntent(null) === "GENERAL_SUMMARY");
  assert("Intent: empty string", classifyIntent("") === "GENERAL_SUMMARY");

  const baseParams = {
    question: "hello",
    currentDate: "2026-10-01",
    profile: { id: "p1", internal_secret: "secret", activity_level: "high", height: 180 },
    activeGoal: { domain: "weight", target_value: 75, start_value: 80 },
    activePlan: { calories: 2000, protein: 150 },
    timeline: [],
    insights: []
  };

  // 2. buildAiContext: invalid date
  const invalidDateContext = buildAiContext({ ...baseParams, currentDate: "invalid" });
  assert("buildAiContext: handles invalid date", invalidDateContext.metadata.error === "INVALID_CURRENT_DATE");

  // 3. buildAiContext: empty/minimal input behavior
  const minimalContext = buildAiContext({
    question: null,
    currentDate: "2026-10-01",
    profile: null,
    activeGoal: null,
    activePlan: null,
    timeline: null,
    insights: null
  });
  assert("buildAiContext: handles minimal/null inputs without crashing", minimalContext.metadata.intent === "GENERAL_SUMMARY" && minimalContext.observations.length === 0);

  // 4. buildAiContext: timeline bounding and filtering
  const timeline = [
    { date: "2026-09-01", body: { weight: 85 } }, // Too old for 14-day window
    { date: "2026-09-25", body: { weight: 80 } }, // Within 14-day window for weight, but not 7-day for nutrition if intent = WEIGHT_TREND
    { date: "2026-10-01", body: { weight: 79 }, nutrition: { calories: 1900 } }
  ];

  const weightContext = buildAiContext({
    ...baseParams,
    question: "weight",
    timeline
  });
  
  assert("buildAiContext: assigns correct intent", weightContext.metadata.intent === "WEIGHT_TREND");
  assert("buildAiContext: bounds observations correctly", weightContext.observations.some(o => o.weightKg === 80) && !weightContext.observations.some(o => o.weightKg === 85));

  // 5. buildAiContext: Insight filtering
  const insights = [
    { id: "W1", category: "body", observation: "o1", evidence: "e1" },
    { id: "N1", category: "nutrition", observation: "o2", evidence: "e2" }
  ];

  // GOAL_PROGRESS intent only includes "body" insights
  const goalContext = buildAiContext({
    ...baseParams,
    question: "progress", // Intent: GOAL_PROGRESS
    insights
  });

  assert("buildAiContext: filters insights by intent category", goalContext.deterministicInsights.length === 1 && goalContext.deterministicInsights[0].id === "W1");

  // 6. buildAiContext: Security/Sanitization
  const context = buildAiContext(baseParams);
  assert("buildAiContext: sanitizes profile (removes unexpected fields)", context.profile && !("internal_secret" in context.profile));

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

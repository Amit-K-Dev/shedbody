import { buildAiContext, classifyIntent } from "../lib/ai/contextBuilder.js";

// ─────────────────────────────────────────────────────────────────────────────
// Test Harness (consistent with existing test-insights.js style)
// ─────────────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    failed++;
  }
}

function assertEqual(actual, expected, testName) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    console.log(`  Expected: ${JSON.stringify(expected)}`);
    console.log(`  Actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_DATE = "2026-09-20";

function makeTimeline(entries) {
  return entries.map((e) => ({
    date: e.date,
    body: {
      weight: e.weight !== undefined ? e.weight : null,
      bodyFat: e.bodyFat !== undefined ? e.bodyFat : null,
    },
    nutrition: {
      calories: e.calories !== undefined ? e.calories : null,
      protein: e.protein !== undefined ? e.protein : null,
      water: e.water !== undefined ? e.water : null,
    },
    lifestyle: {
      workoutCompleted:
        e.workoutCompleted !== undefined ? e.workoutCompleted : null,
      steps: e.steps !== undefined ? e.steps : null,
      sleepHours: e.sleepHours !== undefined ? e.sleepHours : null,
    },
  }));
}

function makeProfile(overrides = {}) {
  return {
    user_id: "uuid-1234-should-never-appear",
    email: "test@example.com",
    full_name: "Test User",
    avatar_url: "https://example.com/avatar.jpg",
    weight: 74.0,
    height: 175,
    target_weight: 70,
    ...overrides,
  };
}

function makeGoal(overrides = {}) {
  return {
    id: "goal-uuid-should-never-appear",
    user_id: "uuid-1234-should-never-appear",
    domain: "weight",
    status: "active",
    start_value: 78.0,
    target_value: 70.0,
    start_date: "2026-01-01",
    target_date: "2026-12-31",
    ...overrides,
  };
}

function makePlan(overrides = {}) {
  return {
    id: "plan-uuid-should-never-appear",
    user_id: "uuid-1234-should-never-appear",
    goal: "lose_weight",
    level: "intermediate",
    diet_type: "balanced",
    calories: 2100,
    protein: 150,
    is_active: true,
    workout: { schedule: [{ title: "Day 1", exercises: [] }] },
    meals: { meals: [{ id: "meal1", items: "Oats" }] },
    ...overrides,
  };
}

function makeInsights() {
  return [
    {
      id: "GOAL_PROGRESS_INFO",
      category: "body",
      priority: 5,
      observation: "Goal progress observation.",
      evidence: "Start: 78, Target: 70, Current: 74.",
      interpretation: "You have completed approximately 50%.",
      recommendation: "Keep tracking.",
      confidence: "high",
      timestamp: "2026-09-20",
      type: "info",
    },
    {
      id: "WEIGHT_TREND_CHANGE",
      category: "body",
      priority: 10,
      observation: "Weight changed.",
      evidence: "Previous avg: 75.0; current avg: 74.0.",
      interpretation: "Lower.",
      recommendation: "Continue logging.",
      confidence: "medium",
      timestamp: "2026-09-19",
      type: "info",
    },
    {
      id: "WORKOUT_CONSISTENCY_IMPROVED",
      category: "lifestyle",
      priority: 20,
      observation: "Workout frequency increased.",
      evidence: "Previous: 2, Current: 4.",
      interpretation: "More workouts.",
      recommendation: "Keep it up.",
      confidence: "high",
      timestamp: "2026-09-20",
      type: "positive",
    },
    {
      id: "NUTRITION_CALORIC_ADHERENCE_POSITIVE",
      category: "nutrition",
      priority: 30,
      observation: "Hitting calorie target.",
      evidence: "Avg: 2080 kcal. Target: 2100.",
      interpretation: "Well-aligned.",
      recommendation: "Maintain.",
      confidence: "high",
      timestamp: "2026-09-20",
      type: "positive",
    },
    {
      id: "PROTEIN_CONSISTENCY_POSITIVE",
      category: "nutrition",
      priority: 35,
      observation: "Hitting protein target.",
      evidence: "Avg: 148g. Target: 150g.",
      interpretation: "Well-aligned.",
      recommendation: "Maintain.",
      confidence: "high",
      timestamp: "2026-09-19",
      type: "positive",
    },
  ];
}

// Generate a 14-day timeline with diverse data
function makeFullTimeline() {
  const entries = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(CURRENT_DATE + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    entries.push({
      date: dateStr,
      weight: 75.0 - i * 0.1,
      bodyFat: null,
      calories: 2000 + i * 10,
      protein: 140 + i,
      water: 2500,
      workoutCompleted: i % 2 === 0,
      steps: 8000 + i * 100,
      sleepHours: 7.0 + (i % 3) * 0.5,
    });
  }
  return makeTimeline(entries);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

function runTests() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Phase 4.6 — AI Context Builder Test Suite");
  console.log("═══════════════════════════════════════════════════════════\n");

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 1: Intent Classification
  // ═══════════════════════════════════════════════════════════════════════
  console.log("── Intent Classification ──────────────────────────────────\n");

  assertEqual(
    classifyIntent("Why did my weight go up?"),
    "WEIGHT_TREND",
    "Intent: weight question → WEIGHT_TREND"
  );
  assertEqual(
    classifyIntent("Am I heavier this week?"),
    "WEIGHT_TREND",
    "Intent: heavier question → WEIGHT_TREND"
  );
  assertEqual(
    classifyIntent("Is my weight plateauing?"),
    "WEIGHT_TREND",
    "Intent: plateau question → WEIGHT_TREND"
  );
  assertEqual(
    classifyIntent("I feel lighter on the scale"),
    "WEIGHT_TREND",
    "Intent: scale/lighter → WEIGHT_TREND"
  );

  assertEqual(
    classifyIntent("How close am I to my goal?"),
    "GOAL_PROGRESS",
    "Intent: goal question → GOAL_PROGRESS"
  );
  assertEqual(
    classifyIntent("How much progress have I made toward my target?"),
    "GOAL_PROGRESS",
    "Intent: progress/target → GOAL_PROGRESS"
  );
  assertEqual(
    classifyIntent("Did I reach my milestone?"),
    "GOAL_PROGRESS",
    "Intent: reach/milestone → GOAL_PROGRESS"
  );

  assertEqual(
    classifyIntent("How was my calorie intake?"),
    "NUTRITION_ADHERENCE",
    "Intent: calorie question → NUTRITION_ADHERENCE"
  );
  assertEqual(
    classifyIntent("Am I eating enough protein?"),
    "NUTRITION_ADHERENCE",
    "Intent: protein/eat → NUTRITION_ADHERENCE"
  );
  assertEqual(
    classifyIntent("How is my diet going?"),
    "NUTRITION_ADHERENCE",
    "Intent: diet → NUTRITION_ADHERENCE"
  );
  assertEqual(
    classifyIntent("Am I drinking enough water?"),
    "NUTRITION_ADHERENCE",
    "Intent: water → NUTRITION_ADHERENCE"
  );
  assertEqual(
    classifyIntent("What about my macros?"),
    "NUTRITION_ADHERENCE",
    "Intent: macro → NUTRITION_ADHERENCE"
  );

  assertEqual(
    classifyIntent("Did I work out enough?"),
    "WORKOUT_LIFESTYLE",
    "Intent: workout question → WORKOUT_LIFESTYLE"
  );
  assertEqual(
    classifyIntent("How is my sleep?"),
    "WORKOUT_LIFESTYLE",
    "Intent: sleep question → WORKOUT_LIFESTYLE"
  );
  assertEqual(
    classifyIntent("How many steps did I do?"),
    "WORKOUT_LIFESTYLE",
    "Intent: step question → WORKOUT_LIFESTYLE"
  );
  assertEqual(
    classifyIntent("Am I active enough?"),
    "WORKOUT_LIFESTYLE",
    "Intent: active → WORKOUT_LIFESTYLE"
  );
  assertEqual(
    classifyIntent("How was my gym week?"),
    "WORKOUT_LIFESTYLE",
    "Intent: gym → WORKOUT_LIFESTYLE"
  );

  assertEqual(
    classifyIntent("How did I do this week?"),
    "GENERAL_SUMMARY",
    "Intent: general question → GENERAL_SUMMARY"
  );
  assertEqual(
    classifyIntent("Give me a summary"),
    "GENERAL_SUMMARY",
    "Intent: ambiguous → GENERAL_SUMMARY"
  );
  assertEqual(
    classifyIntent(null),
    "GENERAL_SUMMARY",
    "Intent: null question → GENERAL_SUMMARY"
  );
  assertEqual(
    classifyIntent(undefined),
    "GENERAL_SUMMARY",
    "Intent: undefined question → GENERAL_SUMMARY"
  );
  assertEqual(
    classifyIntent(""),
    "GENERAL_SUMMARY",
    "Intent: empty string → GENERAL_SUMMARY"
  );
  assertEqual(
    classifyIntent("   "),
    "GENERAL_SUMMARY",
    "Intent: whitespace only → GENERAL_SUMMARY"
  );
  assertEqual(
    classifyIntent(42),
    "GENERAL_SUMMARY",
    "Intent: non-string (number) → GENERAL_SUMMARY"
  );

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 2: Invalid / Missing currentDate
  // ═══════════════════════════════════════════════════════════════════════
  console.log(
    "\n── Invalid / Missing currentDate ──────────────────────────\n"
  );

  {
    const result = buildAiContext({
      question: "How did my weight change?",
      currentDate: null,
      profile: makeProfile(),
      activeGoal: makeGoal(),
      activePlan: makePlan(),
      timeline: makeFullTimeline(),
      insights: makeInsights(),
    });
    assertEqual(
      result.metadata.error,
      "INVALID_CURRENT_DATE",
      "Invalid date: null currentDate → error"
    );
    assertEqual(
      result.observations.length,
      0,
      "Invalid date: null → no observations"
    );
    assertEqual(
      result.derivedAnalytics.length,
      0,
      "Invalid date: null → no derived"
    );
    assertEqual(
      result.deterministicInsights.length,
      0,
      "Invalid date: null → no insights"
    );
    assert(result.userGoal === null, "Invalid date: null → no goal");
    assert(
      result.protocolTarget === null,
      "Invalid date: null → no plan target"
    );
    assert(result.profile !== null, "Invalid date: profile still returned");
  }

  {
    const result = buildAiContext({
      question: "test",
      currentDate: undefined,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: [],
      insights: [],
    });
    assertEqual(
      result.metadata.error,
      "INVALID_CURRENT_DATE",
      "Invalid date: undefined currentDate → error"
    );
  }

  {
    const result = buildAiContext({
      question: "test",
      currentDate: "not-a-date",
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: [],
      insights: [],
    });
    assertEqual(
      result.metadata.error,
      "INVALID_CURRENT_DATE",
      "Invalid date: malformed string → error"
    );
  }

  {
    const result = buildAiContext({
      question: "test",
      currentDate: "2026-02-30",
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: [],
      insights: [],
    });
    assertEqual(
      result.metadata.error,
      "INVALID_CURRENT_DATE",
      "Invalid date: impossible Gregorian (Feb 30) → error"
    );
  }

  {
    const result = buildAiContext({
      question: "test",
      currentDate: "2026-13-01",
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: [],
      insights: [],
    });
    assertEqual(
      result.metadata.error,
      "INVALID_CURRENT_DATE",
      "Invalid date: month 13 → error"
    );
  }

  {
    const result = buildAiContext({
      question: "test",
      currentDate: "",
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: [],
      insights: [],
    });
    assertEqual(
      result.metadata.error,
      "INVALID_CURRENT_DATE",
      "Invalid date: empty string → error"
    );
  }

  // No fallback to timeline's latest date
  {
    const tl = makeTimeline([{ date: "2026-09-15", weight: 74.0 }]);
    const result = buildAiContext({
      question: "weight",
      currentDate: "bad",
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });
    assertEqual(
      result.metadata.currentDate,
      null,
      "Invalid date: does NOT fallback to timeline latest date"
    );
    assertEqual(
      result.observations.length,
      0,
      "Invalid date: timeline data NOT used"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 3: Window Bounding
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Window Bounding ────────────────────────────────────────\n");

  {
    // WEIGHT_TREND: body 14d window = [2026-09-07, 2026-09-20]
    const entries = [
      { date: "2026-09-06", weight: 80.0 }, // OUTSIDE (before 14d window)
      { date: "2026-09-07", weight: 76.0 }, // INSIDE (first day of 14d)
      { date: "2026-09-14", weight: 75.0 }, // INSIDE
      { date: "2026-09-20", weight: 74.0 }, // INSIDE (currentDate)
      { date: "2026-09-21", weight: 73.0 }, // OUTSIDE (future)
    ];
    const tl = makeTimeline(entries);
    const result = buildAiContext({
      question: "How did my weight change?",
      currentDate: CURRENT_DATE,
      profile: makeProfile(),
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });

    const bodyObs = result.observations.filter((o) => o.weightKg !== undefined);
    const dates = bodyObs.map((o) => o.date);
    assert(
      !dates.includes("2026-09-06"),
      "Window: body entry before 14d excluded"
    );
    assert(
      dates.includes("2026-09-07"),
      "Window: body entry on first day of 14d included"
    );
    assert(
      dates.includes("2026-09-20"),
      "Window: body entry on currentDate included"
    );
    assert(
      !dates.includes("2026-09-21"),
      "Window: future body entry excluded"
    );
  }

  {
    // NUTRITION_ADHERENCE: nutrition 7d window = [2026-09-14, 2026-09-20]
    const entries = [
      { date: "2026-09-13", calories: 2000 }, // OUTSIDE
      { date: "2026-09-14", calories: 2100 }, // INSIDE (first day of 7d)
      { date: "2026-09-20", calories: 2050 }, // INSIDE (currentDate)
      { date: "2026-09-21", calories: 1900 }, // OUTSIDE (future)
    ];
    const tl = makeTimeline(entries);
    const result = buildAiContext({
      question: "How are my calories?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: makePlan(),
      timeline: tl,
      insights: [],
    });

    const nutObs = result.observations.filter((o) => o.calories !== undefined);
    const dates = nutObs.map((o) => o.date);
    assert(
      !dates.includes("2026-09-13"),
      "Window: nutrition entry before 7d excluded"
    );
    assert(
      dates.includes("2026-09-14"),
      "Window: nutrition entry on first day of 7d included"
    );
    assert(
      dates.includes("2026-09-20"),
      "Window: nutrition entry on currentDate included"
    );
    assert(
      !dates.includes("2026-09-21"),
      "Window: future nutrition entry excluded"
    );
  }

  {
    // GENERAL_SUMMARY: all domains 7d
    const entries = [
      { date: "2026-09-13", weight: 76.0, calories: 2000, workoutCompleted: true },
      { date: "2026-09-14", weight: 75.5, calories: 2100, workoutCompleted: false },
      { date: "2026-09-20", weight: 74.0, calories: 2050, workoutCompleted: true },
    ];
    const tl = makeTimeline(entries);
    const result = buildAiContext({
      question: "How did I do this week?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });

    // GENERAL_SUMMARY uses 7-day windows for all domains
    const allDates = result.observations.map((o) => o.date);
    assert(
      !allDates.includes("2026-09-13"),
      "Window: GENERAL_SUMMARY 7d excludes older entries"
    );
    assert(
      allDates.includes("2026-09-14"),
      "Window: GENERAL_SUMMARY 7d includes first boundary day"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 4: Provenance
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Provenance ─────────────────────────────────────────────\n");

  {
    const tl = makeTimeline([
      { date: "2026-09-18", weight: 74.5, calories: 2100, workoutCompleted: true },
      { date: "2026-09-20", weight: 74.0, calories: 2050, workoutCompleted: false },
    ]);
    const result = buildAiContext({
      question: "How did I do?",
      currentDate: CURRENT_DATE,
      profile: makeProfile(),
      activeGoal: makeGoal(),
      activePlan: makePlan(),
      timeline: tl,
      insights: makeInsights(),
    });

    // OBSERVED
    const obs = result.observations;
    assert(obs.length > 0, "Provenance: observations exist");
    assert(
      obs.every((o) => o.type === "OBSERVED"),
      "Provenance: all observations tagged OBSERVED"
    );

    // DERIVED
    const derived = result.derivedAnalytics;
    assert(derived.length > 0, "Provenance: derived analytics exist");
    assert(
      derived.every((d) => d.type === "DERIVED"),
      "Provenance: all derived tagged DERIVED"
    );
    assert(
      derived.every(
        (d) => d.metric && d.unit && d.calculation && d.calculation.method && d.calculation.window
      ),
      "Provenance: all derived have metric, value, unit, calculation.method, calculation.window"
    );

    // TARGET
    assert(
      result.protocolTarget !== null,
      "Provenance: protocol target exists"
    );
    assertEqual(
      result.protocolTarget.type,
      "TARGET",
      "Provenance: plan target tagged TARGET"
    );

    // USER_GOAL
    assert(result.userGoal !== null, "Provenance: user goal exists");
    assertEqual(
      result.userGoal.type,
      "USER_GOAL",
      "Provenance: goal tagged USER_GOAL"
    );

    // DETERMINISTIC_INSIGHT
    const insights = result.deterministicInsights;
    assert(insights.length > 0, "Provenance: insights exist");
    assert(
      insights.every((i) => i.type === "DETERMINISTIC_INSIGHT"),
      "Provenance: all insights tagged DETERMINISTIC_INSIGHT"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 5: Null / Zero / False Semantics
  // ═══════════════════════════════════════════════════════════════════════
  console.log(
    "\n── Null / Zero / False Semantics ───────────────────────────\n"
  );

  {
    const tl = makeTimeline([
      {
        date: "2026-09-20",
        weight: null,
        calories: 0,
        protein: null,
        water: 0,
        workoutCompleted: false,
        steps: 0,
        sleepHours: null,
      },
    ]);
    const result = buildAiContext({
      question: "How did I do?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });

    // null weight → no body observation (all body fields null)
    const bodyObs = result.observations.filter((o) => o.weightKg !== undefined);
    assertEqual(
      bodyObs.length,
      0,
      "Null semantics: null weight → no body observation emitted"
    );

    // 0 calories is explicitly logged → should appear
    const nutObs = result.observations.filter((o) => o.calories !== undefined);
    assert(nutObs.length > 0, "Null semantics: 0 calories → observation emitted");
    assertEqual(
      nutObs[0].calories,
      0,
      "Null semantics: 0 calories preserved as 0"
    );
    assertEqual(
      nutObs[0].proteinGrams,
      null,
      "Null semantics: null protein preserved as null"
    );
    assertEqual(
      nutObs[0].waterMl,
      0,
      "Null semantics: 0 water preserved as 0"
    );

    // false workout is explicitly logged → should appear
    const lifeObs = result.observations.filter(
      (o) => o.workoutCompleted !== undefined
    );
    assert(
      lifeObs.length > 0,
      "Null semantics: false workout → observation emitted"
    );
    assertEqual(
      lifeObs[0].workoutCompleted,
      false,
      "Null semantics: false workoutCompleted preserved as false"
    );
    assertEqual(
      lifeObs[0].steps,
      0,
      "Null semantics: 0 steps preserved as 0"
    );
    assertEqual(
      lifeObs[0].sleepHours,
      null,
      "Null semantics: null sleepHours preserved as null"
    );
  }

  {
    // All nulls → no observations for that domain
    const tl = makeTimeline([
      {
        date: "2026-09-20",
        weight: null,
        bodyFat: null,
      },
    ]);
    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });
    const bodyObs = result.observations.filter((o) => o.weightKg !== undefined);
    assertEqual(
      bodyObs.length,
      0,
      "Null semantics: all-null body → no body observation"
    );
  }

  // Missing days should NOT be synthesized
  {
    const tl = makeTimeline([
      { date: "2026-09-14", weight: 75.0 },
      { date: "2026-09-20", weight: 74.0 },
      // Gap: 2026-09-15 through 2026-09-19 missing
    ]);
    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });
    const bodyObs = result.observations.filter((o) => o.weightKg !== undefined);
    assertEqual(
      bodyObs.length,
      2,
      "Null semantics: missing days NOT synthesized — only 2 observations"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 6: Privacy / PII Stripping
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Privacy / PII Stripping ─────────────────────────────────\n");

  {
    const profile = makeProfile();
    const goal = makeGoal();
    const plan = makePlan();
    const tl = makeTimeline([{ date: "2026-09-20", weight: 74.0 }]);

    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: profile,
      activeGoal: goal,
      activePlan: plan,
      timeline: tl,
      insights: [],
    });

    const json = JSON.stringify(result);

    assert(
      !json.includes("uuid-1234-should-never-appear"),
      "PII: no user_id in output"
    );
    assert(
      !json.includes("goal-uuid-should-never-appear"),
      "PII: no goal UUID in output"
    );
    assert(
      !json.includes("plan-uuid-should-never-appear"),
      "PII: no plan UUID in output"
    );
    assert(
      !json.includes("test@example.com"),
      "PII: no email in output"
    );
    assert(
      !json.includes("Test User"),
      "PII: no full_name in output"
    );
    assert(
      !json.includes("avatar.jpg"),
      "PII: no avatar_url in output"
    );
    assert(
      !json.includes("user_id"),
      "PII: no user_id key in output"
    );

    // Profile should only have safe fields
    assert(result.profile !== null, "PII: profile returned");
    assertEqual(
      result.profile.heightCm,
      175,
      "PII: profile.heightCm present"
    );
    assertEqual(
      result.profile.currentWeightKg,
      74.0,
      "PII: profile.currentWeightKg present"
    );
    assert(
      result.profile.email === undefined,
      "PII: no email on profile"
    );
    assert(
      result.profile.full_name === undefined,
      "PII: no full_name on profile"
    );
  }

  // No notes in observations
  {
    const tl = [
      {
        date: "2026-09-20",
        body: { weight: 74.0, bodyFat: null },
        nutrition: { calories: null, protein: null, water: null },
        lifestyle: { workoutCompleted: null, steps: null, sleepHours: null },
        notes: "I felt terrible today, my doctor said I have depression",
      },
    ];
    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });
    const json = JSON.stringify(result);
    assert(!json.includes("depression"), "PII: notes content not in output");
    assert(!json.includes("doctor"), "PII: notes content not in output (2)");
    assert(
      !json.includes('"notes"'),
      "PII: no notes key in output"
    );
  }

  // Plan: no raw workout/meal JSON
  {
    const plan = makePlan();
    const result = buildAiContext({
      question: "How did I do?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: plan,
      timeline: makeTimeline([
        { date: "2026-09-20", weight: 74 },
      ]),
      insights: [],
    });
    const json = JSON.stringify(result);
    assert(
      !json.includes("exercises"),
      "PII: no raw workout JSON in output"
    );
    assert(
      !json.includes("Oats"),
      "PII: no raw meal content in output"
    );
    assert(
      !json.includes("meal1"),
      "PII: no raw meal ID in output"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 7: Safety Boundaries
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Safety Boundaries ──────────────────────────────────────\n");

  // No target-date prediction
  {
    const result = buildAiContext({
      question: "When will I reach 70kg?",
      currentDate: CURRENT_DATE,
      profile: makeProfile(),
      activeGoal: makeGoal(),
      activePlan: null,
      timeline: makeTimeline([
        { date: "2026-09-20", weight: 74.0 },
      ]),
      insights: [],
    });

    // Should classify as GOAL_PROGRESS (not crash or invent predictions)
    assertEqual(
      result.metadata.intent,
      "GOAL_PROGRESS",
      "Safety: 'When will I reach 70kg?' → GOAL_PROGRESS (not a prediction engine)"
    );
    const json = JSON.stringify(result);
    assert(
      !json.includes("weeks"),
      "Safety: no time-to-target prediction in output"
    );
    assert(
      !json.includes("estimated"),
      "Safety: no estimated prediction in output"
    );
    // Goal should have progress but no predicted date
    assert(
      result.userGoal !== null,
      "Safety: goal context provided"
    );
    assert(
      result.userGoal.progressPercent !== undefined,
      "Safety: progress percentage provided"
    );
  }

  // No causal claims
  {
    const result = buildAiContext({
      question: "Why did my weight go up?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: makeTimeline([
        { date: "2026-09-18", weight: 74.0, calories: 3000 },
        { date: "2026-09-20", weight: 75.0, calories: 3200 },
      ]),
      insights: [],
    });
    const json = JSON.stringify(result);
    assert(
      !json.includes("because"),
      "Safety: no causal 'because' in output"
    );
    assert(
      !json.includes("caused"),
      "Safety: no 'caused' in output"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 8: Insight Limits & Filtering
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Insight Limits & Filtering ──────────────────────────────\n");

  {
    // Max 5 insights
    const manyInsights = [];
    for (let i = 0; i < 10; i++) {
      manyInsights.push({
        id: `INSIGHT_${i}`,
        category: "body",
        priority: i,
        observation: `Observation ${i}`,
        evidence: `Evidence ${i}`,
        interpretation: `Interpretation ${i}`,
        recommendation: `Recommendation ${i}`,
        confidence: "medium",
        timestamp: "2026-09-20",
        type: "info",
      });
    }
    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: makeTimeline([{ date: "2026-09-20", weight: 74 }]),
      insights: manyInsights,
    });
    assert(
      result.deterministicInsights.length <= 5,
      "Insight limit: max 5 insights enforced"
    );
  }

  {
    // Filter by intent relevance
    const result = buildAiContext({
      question: "How are my calories?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: makePlan(),
      timeline: makeTimeline([
        { date: "2026-09-20", calories: 2100 },
      ]),
      insights: makeInsights(),
    });
    // NUTRITION_ADHERENCE → only nutrition category
    assert(
      result.deterministicInsights.every((i) => i.category === "nutrition"),
      "Insight filter: NUTRITION_ADHERENCE only includes nutrition insights"
    );
    assert(
      result.deterministicInsights.length > 0,
      "Insight filter: at least one nutrition insight"
    );
  }

  {
    // Empty insights → empty array
    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: makeTimeline([{ date: "2026-09-20", weight: 74 }]),
      insights: [],
    });
    assertEqual(
      result.deterministicInsights.length,
      0,
      "Insight filter: empty insights → empty array"
    );
  }

  {
    // null insights → empty array
    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: makeTimeline([{ date: "2026-09-20", weight: 74 }]),
      insights: null,
    });
    assertEqual(
      result.deterministicInsights.length,
      0,
      "Insight filter: null insights → empty array"
    );
  }

  // Insight internal fields (timestamp, type) stripped
  {
    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: makeTimeline([{ date: "2026-09-20", weight: 74 }]),
      insights: makeInsights(),
    });
    for (const insight of result.deterministicInsights) {
      assert(
        insight.timestamp === undefined,
        "Insight sanitization: no timestamp in output insight"
      );
      assert(
        insight.priority === undefined,
        "Insight sanitization: no priority in output insight"
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 9: Domain Selection per Intent
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Domain Selection per Intent ─────────────────────────────\n");

  {
    // NUTRITION_ADHERENCE: should NOT include body or lifestyle observations
    const tl = makeTimeline([
      { date: "2026-09-20", weight: 74.0, calories: 2100, workoutCompleted: true },
    ]);
    const result = buildAiContext({
      question: "How are my calories?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: makeGoal(),
      activePlan: makePlan(),
      timeline: tl,
      insights: [],
    });
    const hasBody = result.observations.some((o) => o.weightKg !== undefined);
    const hasLifestyle = result.observations.some(
      (o) => o.workoutCompleted !== undefined
    );
    assert(
      !hasBody,
      "Domain selection: NUTRITION_ADHERENCE excludes body observations"
    );
    assert(
      !hasLifestyle,
      "Domain selection: NUTRITION_ADHERENCE excludes lifestyle observations"
    );
    assert(
      result.userGoal === null,
      "Domain selection: NUTRITION_ADHERENCE excludes goal"
    );
  }

  {
    // WORKOUT_LIFESTYLE: should NOT include body or nutrition observations
    const tl = makeTimeline([
      { date: "2026-09-20", weight: 74.0, calories: 2100, workoutCompleted: true, steps: 10000, sleepHours: 7.5 },
    ]);
    const result = buildAiContext({
      question: "Did I work out enough?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: makePlan(),
      timeline: tl,
      insights: [],
    });
    const hasBody = result.observations.some((o) => o.weightKg !== undefined);
    const hasNutrition = result.observations.some(
      (o) => o.calories !== undefined
    );
    assert(
      !hasBody,
      "Domain selection: WORKOUT_LIFESTYLE excludes body"
    );
    assert(
      !hasNutrition,
      "Domain selection: WORKOUT_LIFESTYLE excludes nutrition"
    );
    assert(
      result.userGoal === null,
      "Domain selection: WORKOUT_LIFESTYLE excludes goal"
    );
  }

  {
    // GOAL_PROGRESS: should NOT include nutrition or lifestyle
    const tl = makeTimeline([
      { date: "2026-09-20", weight: 74.0, calories: 2100, workoutCompleted: true },
    ]);
    const result = buildAiContext({
      question: "How close am I to my goal?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: makeGoal(),
      activePlan: makePlan(),
      timeline: tl,
      insights: [],
    });
    const hasNutrition = result.observations.some(
      (o) => o.calories !== undefined
    );
    const hasLifestyle = result.observations.some(
      (o) => o.workoutCompleted !== undefined
    );
    assert(
      !hasNutrition,
      "Domain selection: GOAL_PROGRESS excludes nutrition"
    );
    assert(
      !hasLifestyle,
      "Domain selection: GOAL_PROGRESS excludes lifestyle"
    );
    assert(
      result.protocolTarget === null,
      "Domain selection: GOAL_PROGRESS excludes plan target"
    );
    assert(
      result.userGoal !== null,
      "Domain selection: GOAL_PROGRESS includes goal"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 10: Missing Goal / Plan / Timeline
  // ═══════════════════════════════════════════════════════════════════════
  console.log(
    "\n── Missing Goal / Plan / Timeline ──────────────────────────\n"
  );

  {
    const result = buildAiContext({
      question: "How close am I to my goal?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: [],
      insights: [],
    });
    assert(result.userGoal === null, "Missing goal: userGoal is null");
    assert(
      result.protocolTarget === null,
      "Missing plan: protocolTarget is null"
    );
    assertEqual(
      result.observations.length,
      0,
      "Missing timeline: no observations"
    );
    assertEqual(
      result.derivedAnalytics.length,
      0,
      "Missing timeline: no derived"
    );
  }

  {
    // Missing plan → calorie/protein adherence derived metrics should not appear
    const tl = makeTimeline([
      { date: "2026-09-20", calories: 2100 },
    ]);
    const result = buildAiContext({
      question: "How are my calories?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });
    const adherence = result.derivedAnalytics.filter(
      (d) => d.metric === "calorieAdherence"
    );
    assertEqual(
      adherence.length,
      0,
      "Missing plan: no calorie adherence derived metric"
    );
  }

  {
    // null profile → profile is null in output
    const result = buildAiContext({
      question: "test",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: [],
      insights: [],
    });
    assertEqual(result.profile, null, "Missing profile: profile is null");
  }

  {
    // null timeline → treated as empty
    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: null,
      insights: [],
    });
    assertEqual(
      result.observations.length,
      0,
      "Null timeline: treated as empty"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 11: Purity / Immutability
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Purity / Immutability ───────────────────────────────────\n");

  {
    const profile = makeProfile();
    const goal = makeGoal();
    const plan = makePlan();
    const tl = makeFullTimeline();
    const insights = makeInsights();

    const profileBefore = deepClone(profile);
    const goalBefore = deepClone(goal);
    const planBefore = deepClone(plan);
    const tlBefore = deepClone(tl);
    const insightsBefore = deepClone(insights);

    buildAiContext({
      question: "How did I do?",
      currentDate: CURRENT_DATE,
      profile,
      activeGoal: goal,
      activePlan: plan,
      timeline: tl,
      insights,
    });

    assertEqual(
      JSON.stringify(profile),
      JSON.stringify(profileBefore),
      "Immutability: profile unchanged after buildAiContext"
    );
    assertEqual(
      JSON.stringify(goal),
      JSON.stringify(goalBefore),
      "Immutability: goal unchanged after buildAiContext"
    );
    assertEqual(
      JSON.stringify(plan),
      JSON.stringify(planBefore),
      "Immutability: plan unchanged after buildAiContext"
    );
    assertEqual(
      JSON.stringify(tl),
      JSON.stringify(tlBefore),
      "Immutability: timeline unchanged after buildAiContext"
    );
    assertEqual(
      JSON.stringify(insights),
      JSON.stringify(insightsBefore),
      "Immutability: insights unchanged after buildAiContext"
    );
  }

  // Deterministic: same input → same output
  {
    const profile = makeProfile();
    const goal = makeGoal();
    const plan = makePlan();
    const tl = makeFullTimeline();
    const insights = makeInsights();

    const params = {
      question: "How did my weight change?",
      currentDate: CURRENT_DATE,
      profile,
      activeGoal: goal,
      activePlan: plan,
      timeline: tl,
      insights,
    };

    const result1 = buildAiContext(params);
    const result2 = buildAiContext(params);
    assertEqual(
      JSON.stringify(result1),
      JSON.stringify(result2),
      "Determinism: same input → identical output"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 12: Derived Analytics
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Derived Analytics ───────────────────────────────────────\n");

  {
    const tl = makeTimeline([
      { date: "2026-09-14", weight: 75.0 },
      { date: "2026-09-20", weight: 74.0 },
    ]);
    const result = buildAiContext({
      question: "How did my weight change?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });

    const avgWeight = result.derivedAnalytics.find(
      (d) => d.metric === "averageWeight"
    );
    assert(avgWeight !== undefined, "Derived: averageWeight computed");
    assertEqual(avgWeight.unit, "kg", "Derived: averageWeight unit is kg");
    assertEqual(
      avgWeight.calculation.method,
      "mean",
      "Derived: averageWeight method is mean"
    );

    const weightChange = result.derivedAnalytics.find(
      (d) => d.metric === "weightChange"
    );
    assert(weightChange !== undefined, "Derived: weightChange computed");
    assertEqual(
      weightChange.value,
      -1.0,
      "Derived: weightChange = 74.0 - 75.0 = -1.0"
    );

    const rateOfChange = result.derivedAnalytics.find(
      (d) => d.metric === "weightRateOfChange"
    );
    assert(rateOfChange !== undefined, "Derived: weightRateOfChange computed");
    assertEqual(
      rateOfChange.unit,
      "kg/day",
      "Derived: weightRateOfChange unit is kg/day"
    );
  }

  {
    // Nutrition derived with plan targets
    const tl = makeTimeline([
      { date: "2026-09-18", calories: 2000, protein: 140 },
      { date: "2026-09-20", calories: 2200, protein: 160 },
    ]);
    const plan = makePlan({ calories: 2100, protein: 150 });
    const result = buildAiContext({
      question: "How are my calories?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: plan,
      timeline: tl,
      insights: [],
    });

    const avgCal = result.derivedAnalytics.find(
      (d) => d.metric === "averageCalories"
    );
    assert(avgCal !== undefined, "Derived: averageCalories computed");
    assertEqual(
      avgCal.value,
      2100,
      "Derived: averageCalories = (2000+2200)/2 = 2100"
    );

    const calAdherence = result.derivedAnalytics.find(
      (d) => d.metric === "calorieAdherence"
    );
    assert(calAdherence !== undefined, "Derived: calorieAdherence computed");
    assertEqual(
      calAdherence.value,
      100.0,
      "Derived: calorieAdherence = 2100/2100*100 = 100%"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 13: Goal Progress
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Goal Progress ──────────────────────────────────────────\n");

  {
    const tl = makeTimeline([
      { date: "2026-09-20", weight: 74.0 },
    ]);
    const goal = makeGoal({ start_value: 78.0, target_value: 70.0 });
    const result = buildAiContext({
      question: "How close am I to my goal?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: goal,
      activePlan: null,
      timeline: tl,
      insights: [],
    });
    assert(result.userGoal !== null, "Goal: userGoal present");
    assertEqual(
      result.userGoal.progressPercent,
      50,
      "Goal: (74 - 78) / (70 - 78) * 100 = 50%"
    );
    assertEqual(
      result.userGoal.domain,
      "weight",
      "Goal: domain is weight"
    );
    assertEqual(
      result.userGoal.startValue,
      78.0,
      "Goal: startValue correct"
    );
    assertEqual(
      result.userGoal.targetValue,
      70.0,
      "Goal: targetValue correct"
    );
  }

  {
    // No body observations → no goal progress
    const tl = makeTimeline([
      { date: "2026-09-20", calories: 2100 },
    ]);
    const goal = makeGoal();
    const result = buildAiContext({
      question: "How close am I to my goal?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: goal,
      activePlan: null,
      timeline: tl,
      insights: [],
    });
    // Goal should still be present but with null progress
    assert(
      result.userGoal !== null,
      "Goal: userGoal present even without weight"
    );
    assertEqual(
      result.userGoal.progressPercent,
      null,
      "Goal: no weight → null progress"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 14: Metadata
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Metadata ───────────────────────────────────────────────\n");

  {
    const result = buildAiContext({
      question: "How did my weight change?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: [],
      insights: [],
    });
    assertEqual(
      result.metadata.currentDate,
      CURRENT_DATE,
      "Metadata: currentDate preserved"
    );
    assertEqual(
      result.metadata.intent,
      "WEIGHT_TREND",
      "Metadata: intent correct"
    );
    assertEqual(
      result.metadata.windowDays,
      14,
      "Metadata: windowDays for WEIGHT_TREND = 14"
    );
    assert(
      result.metadata.error === undefined,
      "Metadata: no error on valid date"
    );
  }

  {
    const result = buildAiContext({
      question: "How are my calories?",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: [],
      insights: [],
    });
    assertEqual(
      result.metadata.windowDays,
      7,
      "Metadata: windowDays for NUTRITION_ADHERENCE = 7"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 15: Duplicate Timeline Dates
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Duplicate Timeline Dates ────────────────────────────────\n");

  {
    const tl = makeTimeline([
      { date: "2026-09-20", weight: 74.0 },
      { date: "2026-09-20", weight: 74.5 },
    ]);
    const result = buildAiContext({
      question: "weight",
      currentDate: CURRENT_DATE,
      profile: null,
      activeGoal: null,
      activePlan: null,
      timeline: tl,
      insights: [],
    });
    const bodyObs = result.observations.filter((o) => o.weightKg !== undefined);
    assertEqual(
      bodyObs.length,
      2,
      "Duplicate dates: both observations preserved (no dedup in context builder)"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 16: Full Integration (WEIGHT_TREND with all data)
  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n── Full Integration ───────────────────────────────────────\n");

  {
    const tl = makeFullTimeline();
    const result = buildAiContext({
      question: "Why did my weight go up this week?",
      currentDate: CURRENT_DATE,
      profile: makeProfile(),
      activeGoal: makeGoal(),
      activePlan: makePlan(),
      timeline: tl,
      insights: makeInsights(),
    });

    assert(result.metadata !== undefined, "Integration: metadata present");
    assertEqual(
      result.metadata.intent,
      "WEIGHT_TREND",
      "Integration: intent is WEIGHT_TREND"
    );
    assert(
      result.observations.length > 0,
      "Integration: observations present"
    );
    assert(
      result.derivedAnalytics.length > 0,
      "Integration: derived analytics present"
    );
    assert(
      result.deterministicInsights.length > 0,
      "Integration: insights present"
    );
    assert(
      result.deterministicInsights.length <= 5,
      "Integration: insights <= 5"
    );
    assert(result.profile !== null, "Integration: profile present");
    assert(result.userGoal !== null, "Integration: goal present");
    assert(result.protocolTarget !== null, "Integration: plan present");

    // Verify no generatedAt (nondeterministic)
    const json = JSON.stringify(result);
    assert(
      !json.includes("generatedAt"),
      "Integration: no nondeterministic generatedAt field"
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════
  console.log(
    "\n═══════════════════════════════════════════════════════════"
  );
  console.log(`  TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(
    "═══════════════════════════════════════════════════════════\n"
  );

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

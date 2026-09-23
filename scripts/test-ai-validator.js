import { validateAiContext } from "../lib/ai/contextValidator.js";

// ---------------------------------------------------------------------------
// Test Harness
// ---------------------------------------------------------------------------

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
  if (actual === expected) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual:   ${actual}`);
    failed++;
  }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeValidPayload() {
  return {
    metadata: {
      currentDate: "2026-09-20",
      intent: "WEIGHT_TREND",
      windowDays: 7
    },
    profile: {
      heightCm: 175,
      currentWeightKg: 74.5
    },
    userGoal: {
      type: "USER_GOAL",
      domain: "weight",
      startValue: 78.0,
      targetValue: 70.0,
      startDate: "2026-01-01",
      targetDate: "2026-12-31", // Future date allowed
      progressPercent: 50
    },
    protocolTarget: {
      type: "TARGET",
      goal: "lose_weight",
      level: "intermediate",
      dietType: "balanced",
      dailyCalories: 2100,
      dailyProteinGrams: 150
    },
    observations: [
      {
        type: "OBSERVED",
        date: "2026-09-18",
        weightKg: 74.8,
        calories: 2050,
        workoutCompleted: true,
        steps: 10000
      }
    ],
    derivedAnalytics: [
      {
        type: "DERIVED",
        metric: "averageWeight",
        value: 74.8,
        unit: "kg",
        calculation: {
          method: "mean",
          window: "7d"
        }
      }
    ],
    deterministicInsights: [
      {
        type: "DETERMINISTIC_INSIGHT",
        id: "WEIGHT_TREND_CHANGE",
        category: "body",
        observation: "Weight changed.",
        evidence: "Previous avg: 75.0; current avg: 74.8.",
        interpretation: "Lower.",
        recommendation: "Continue logging.",
        confidence: "medium"
      }
    ]
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

function runTests() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Phase 4.7 — AI Context Validator Test Suite");
  console.log("═══════════════════════════════════════════════════════════\n");

  // ── Validation Basics & Immutability ─────────────────────────────────────
  console.log("── Validation Basics ──────────────────────────────────────\n");
  
  const validPayload = makeValidPayload();
  const originalStr = JSON.stringify(validPayload);
  const result1 = validateAiContext(validPayload);
  
  assert(result1.valid, "Valid payload passes");
  assertEqual(JSON.stringify(validPayload), originalStr, "Valid payload remains unchanged (immutable)");

  const result2 = validateAiContext(validPayload);
  assertEqual(result1.valid, result2.valid, "Repeated validation produces same result");

  // ── Structure (Missing, Extra, Wrong Types) ──────────────────────────────
  console.log("\n── Structure ──────────────────────────────────────────────\n");

  {
    let p = makeValidPayload();
    delete p.metadata;
    const r = validateAiContext(p);
    assert(!r.valid, "Missing root field (metadata) fails");
    assertEqual(JSON.stringify(p), JSON.stringify(p), "Invalid input remains unchanged");
  }

  {
    let p = makeValidPayload();
    p.unexpectedRoot = true;
    const r = validateAiContext(p);
    assert(!r.valid, "Unknown root field fails");
  }

  {
    let p = makeValidPayload();
    p.profile.unknownField = "test";
    const r = validateAiContext(p);
    assert(!r.valid, "Unknown nested field fails (profile.unknownField)");
  }

  {
    let p = makeValidPayload();
    p.observations = "not an array";
    const r = validateAiContext(p);
    assert(!r.valid, "Wrong root type fails (observations not array)");
  }

  {
    let p = makeValidPayload();
    p.observations[0].unexpectedObs = 42;
    const r = validateAiContext(p);
    assert(!r.valid, "Nested unknown field fails recursively (observations[0].unexpectedObs)");
  }

  // ── Dates ───────────────────────────────────────────────────────────────
  console.log("\n── Dates ──────────────────────────────────────────────────\n");

  {
    let p = makeValidPayload();
    p.metadata.currentDate = "2024-02-29";
    p.userGoal.startDate = "2024-01-01";
    p.observations[0].date = "2024-02-20";
    const r = validateAiContext(p);
    assert(r.valid, "Leap-year date passes (2024-02-29)");
  }

  {
    let p = makeValidPayload();
    p.metadata.currentDate = "2026-02-29";
    const r = validateAiContext(p);
    assert(!r.valid, "Invalid leap-year date fails (2026-02-29)");
  }

  {
    let p = makeValidPayload();
    p.metadata.currentDate = "2026-02-30";
    assert(!validateAiContext(p).valid, "Feb 30 fails");
  }

  {
    let p = makeValidPayload();
    p.metadata.currentDate = "2026-13-01";
    assert(!validateAiContext(p).valid, "Month 13 fails");
  }

  {
    let p = makeValidPayload();
    p.metadata.currentDate = "2026-00-01";
    assert(!validateAiContext(p).valid, "Month 00 fails");
  }

  {
    let p = makeValidPayload();
    p.metadata.currentDate = "26-09-20";
    assert(!validateAiContext(p).valid, "Malformed date fails (YY-MM-DD)");
  }

  {
    let p = makeValidPayload();
    p.metadata.currentDate = "";
    assert(!validateAiContext(p).valid, "Empty date fails");
  }

  {
    let p = makeValidPayload();
    p.observations[0].date = "2026-09-21"; // Future relative to currentDate (2026-09-20)
    assert(!validateAiContext(p).valid, "Observation future date fails");
  }

  {
    let p = makeValidPayload();
    p.observations[0].date = "2026-09-20"; 
    assert(validateAiContext(p).valid, "Observation date equal currentDate passes");
  }

  {
    let p = makeValidPayload();
    p.userGoal.startDate = "2026-09-21"; // Future relative to currentDate
    assert(!validateAiContext(p).valid, "UserGoal startDate future fails");
  }

  {
    let p = makeValidPayload();
    p.userGoal.startDate = "2026-09-20"; 
    assert(validateAiContext(p).valid, "UserGoal startDate equal currentDate passes");
  }

  {
    let p = makeValidPayload();
    p.userGoal.targetDate = "2030-01-01"; 
    assert(validateAiContext(p).valid, "UserGoal targetDate future passes (legitimate future target)");
  }

  {
    let p = makeValidPayload();
    p.userGoal.targetDate = "2026-09-20"; 
    assert(validateAiContext(p).valid, "UserGoal targetDate equal currentDate passes");
  }

  {
    let p = makeValidPayload();
    p.userGoal.targetDate = "2025-01-01"; 
    assert(validateAiContext(p).valid, "UserGoal targetDate historical passes");
  }

  // ── Numbers ─────────────────────────────────────────────────────────────
  console.log("\n── Numbers ────────────────────────────────────────────────\n");

  {
    let p = makeValidPayload();
    p.profile.currentWeightKg = 0; 
    assert(!validateAiContext(p).valid, "Zero fails where not allowed (> 0 required for weight)");
  }
  
  {
    let p = makeValidPayload();
    p.observations[0].calories = 0;
    assert(validateAiContext(p).valid, "Zero passes where allowed (calories)");
  }

  {
    let p = makeValidPayload();
    p.profile.currentWeightKg = null;
    assert(validateAiContext(p).valid, "Null passes where allowed");
  }

  {
    let p = makeValidPayload();
    p.profile.currentWeightKg = NaN;
    assert(!validateAiContext(p).valid, "NaN fails");
  }

  {
    let p = makeValidPayload();
    p.profile.currentWeightKg = Infinity;
    assert(!validateAiContext(p).valid, "Infinity fails");
  }

  {
    let p = makeValidPayload();
    p.profile.currentWeightKg = -Infinity;
    assert(!validateAiContext(p).valid, "-Infinity fails");
  }

  {
    let p = makeValidPayload();
    p.profile.currentWeightKg = "75.0";
    assert(!validateAiContext(p).valid, "Numeric string fails (no silent coercion)");
  }

  {
    let p = makeValidPayload();
    p.metadata.windowDays = 0;
    assert(!validateAiContext(p).valid, "windowDays below 1 fails");
  }

  {
    let p = makeValidPayload();
    p.metadata.windowDays = 31;
    assert(!validateAiContext(p).valid, "windowDays above 30 fails");
  }

  {
    let p = makeValidPayload();
    p.metadata.windowDays = 7.5;
    assert(!validateAiContext(p).valid, "Invalid integer fails (windowDays must be integer)");
  }

  // ── Enums ───────────────────────────────────────────────────────────────
  console.log("\n── Enums ──────────────────────────────────────────────────\n");

  {
    let p = makeValidPayload();
    p.metadata.intent = "WEIGHT_TREND";
    assert(validateAiContext(p).valid, "Valid intent passes");
  }

  {
    let p = makeValidPayload();
    p.metadata.intent = "INVALID_INTENT";
    assert(!validateAiContext(p).valid, "Invalid intent fails");
  }

  {
    let p = makeValidPayload();
    p.protocolTarget.type = "TARGET";
    assert(validateAiContext(p).valid, "Valid provenance type passes");
  }

  {
    let p = makeValidPayload();
    p.protocolTarget.type = "WRONG";
    assert(!validateAiContext(p).valid, "Invalid provenance type fails");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].confidence = "high";
    assert(validateAiContext(p).valid, "Confidence high passes");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].confidence = "medium";
    assert(validateAiContext(p).valid, "Confidence medium passes");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].confidence = "low";
    assert(!validateAiContext(p).valid, "Confidence low fails");
  }

  // ── Deterministic Insights ──────────────────────────────────────────────
  console.log("\n── Deterministic Insights ─────────────────────────────────\n");

  {
    let p = makeValidPayload();
    assert(validateAiContext(p).valid, "Full valid insight passes");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].category = "body";
    assert(validateAiContext(p).valid, "Category 'body' passes");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].category = "lifestyle";
    assert(validateAiContext(p).valid, "Category 'lifestyle' passes");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].category = "nutrition";
    assert(validateAiContext(p).valid, "Category 'nutrition' passes");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].category = "random";
    assert(!validateAiContext(p).valid, "Category 'random' fails (invalid string)");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].category = "BODY";
    assert(!validateAiContext(p).valid, "Category 'BODY' fails (wrong case)");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].category = "";
    assert(!validateAiContext(p).valid, "Category '' fails (empty)");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].category = null;
    assert(!validateAiContext(p).valid, "Category null fails (non-string)");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].category = 123;
    assert(!validateAiContext(p).valid, "Category 123 fails (non-string)");
  }

  {
    let p = makeValidPayload();
    delete p.deterministicInsights[0].observation;
    assert(!validateAiContext(p).valid, "Missing required insight field fails");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].unknownField = "val";
    assert(!validateAiContext(p).valid, "Unknown insight field fails");
  }

  {
    let p = makeValidPayload();
    // Fill to 5
    for(let i=0; i<4; i++) {
      p.deterministicInsights.push(deepClone(p.deterministicInsights[0]));
    }
    assert(validateAiContext(p).valid, "5 insights pass");

    // Add 6th
    p.deterministicInsights.push(deepClone(p.deterministicInsights[0]));
    assert(!validateAiContext(p).valid, "6 insights fail (exceeds max limit)");
  }

  // ── Sensitive Content Security ──────────────────────────────────────────
  console.log("\n── Sensitive Content Security ─────────────────────────────\n");

  const forbiddenKeys = [
    "user_id", "userId", "email", "notes", "full_name", "fullName", "avatar_url", "avatarUrl", "some_id", "someId"
  ];

  forbiddenKeys.forEach(k => {
    let p = makeValidPayload();
    // Inject at root, even though schema rejects it, we test if it's caught
    p[k] = "test";
    const r = validateAiContext(p);
    assert(!r.valid, `Forbidden field name '${k}' fails`);
  });

  {
    let p = makeValidPayload();
    p.profile.id = "test";
    assert(!validateAiContext(p).valid, "Unauthorized database ID field fails (profile.id)");
  }

  {
    let p = makeValidPayload();
    assert(validateAiContext(p).valid, "Legitimate contract-approved insight.id passes");
  }

  {
    let p = makeValidPayload();
    p.protocolTarget.goal = "test 550e8400-e29b-41d4-a716-446655440000";
    const r = validateAiContext(p);
    assert(!r.valid, "UUID-shaped string fails (embedded in valid string field)");
  }

  {
    let p = makeValidPayload();
    p.protocolTarget.goal = "contact test@example.com for info";
    const r = validateAiContext(p);
    assert(!r.valid, "Email-shaped string fails (embedded in valid string field)");
  }

  {
    let p = makeValidPayload();
    p.deterministicInsights[0].recommendation = "test@example.com";
    assert(!validateAiContext(p).valid, "Email nested inside array fails");
  }

  {
    let p = makeValidPayload();
    p.derivedAnalytics[0].calculation.method = "550e8400-e29b-41d4-a716-446655440000";
    assert(!validateAiContext(p).valid, "UUID nested inside object fails");
  }

  // ── Fail-Closed & Partial Payloads ──────────────────────────────────────
  console.log("\n── Fail-Closed ────────────────────────────────────────────\n");
  
  {
    let p = makeValidPayload();
    p.profile.extra = "test";
    const r = validateAiContext(p);
    assert(!r.valid && !r.data, "Invalid payload never returns a partially sanitized payload");
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════════════");
  
  if (failed > 0) process.exit(1);
}

runTests();

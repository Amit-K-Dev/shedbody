# Phase 4.4 Deterministic Insight Engine Hardening & Phase 5 Readiness Audit

## 1. Scope
This document is a strict read-only architectural audit of the Phase 4 deterministic insight engine. It evaluates the current rule inventory, rule quality, architectural maturity, repetition risks, and readiness for integration with the Phase 5 AI Coach.

Files inspected:
- `lib/insights/engine.js`
- `lib/insights/rules.js`
- `lib/analytics/unified.js`
- `app/(dashboard)/dashboard/page.js`
- `scripts/test-insights.js`

## 2. Current Deterministic Rule Inventory

### 1. `WEIGHT_TREND_CHANGE`
- **ID:** `WEIGHT_TREND_CHANGE`
- **Category:** `body`
- **Type:** `info`
- **Priority:** 10
- **Source Data:** `timeline[].body.weight`
- **Evaluation Window:** Previous 7 days vs Current 7 days (anchored to the last date in the timeline)
- **Minimum Data:** `currentValid >= 2` and `previousValid >= 1`
- **Target Source:** None (relative to self)
- **Null Semantics:** `null` and `undefined` are ignored.
- **Timestamp Source:** `latestDate` (the chronological end of the timeline, regardless of whether a weight was logged that day).
- **Confidence:** "high" if `currentCount >= 4` & `previousCount >= 3`, else "medium".
- **Output:** Only triggers if `Math.abs(diff) >= 0.5`.
- **Repeatable:** Yes, repeats daily as long as the 14-day window math remains valid.
- **Assumptions:** Assumes the last element of the timeline is conceptually "today".

### 2. `WORKOUT_CONSISTENCY`
- **ID:** `WORKOUT_CONSISTENCY_DROP` / `WORKOUT_CONSISTENCY_IMPROVED`
- **Category:** `lifestyle`
- **Type:** `warning` / `positive`
- **Priority:** 20
- **Source Data:** `timeline[].lifestyle.workoutCompleted`
- **Evaluation Window:** Previous 7 days vs Current 7 days
- **Minimum Data:** `currentValid >= 2` and `previousValid >= 1` (valid = boolean)
- **Target Source:** None (relative to self)
- **Null Semantics:** Strict boolean check (`=== true` or `=== false`).
- **Timestamp Source:** The latest date in the current 7-day window containing a valid boolean observation.
- **Confidence:** DROP = "medium", IMPROVED = "high".
- **Output:** Triggers if current count differs from previous count.
- **Repeatable:** Yes.

### 3. `NUTRITION_CALORIC_ADHERENCE`
- **ID:** `NUTRITION_CALORIC_ADHERENCE_POSITIVE`
- **Category:** `nutrition`
- **Type:** `positive`
- **Priority:** 30
- **Source Data:** `timeline[].nutrition.calories`
- **Evaluation Window:** Current 7 days
- **Minimum Data:** `currentValid >= 3`
- **Target Source:** `activePlan.calories`
- **Null Semantics:** `typeof === 'number'`. Preserves 0, ignores null.
- **Timestamp Source:** The latest date in the current 7-day window containing a valid calorie observation.
- **Confidence:** "high" if `count >= 5`, else "medium".
- **Output:** Triggers if deviation `<= 0.10`.
- **Repeatable:** Yes.

### 4. `PROTEIN_CONSISTENCY`
- **ID:** `PROTEIN_CONSISTENCY_POSITIVE`
- **Category:** `nutrition`
- **Type:** `positive`
- **Priority:** 35
- **Source Data:** `timeline[].nutrition.protein`
- **Evaluation Window:** Current 7 days
- **Minimum Data:** `currentValid >= 3`
- **Target Source:** `activePlan.protein`
- **Null Semantics:** `typeof === 'number' && Number.isFinite()`. Preserves 0.
- **Timestamp Source:** The latest date in the current 7-day window containing a valid protein observation.
- **Confidence:** "high" if `count >= 5`, else "medium".
- **Output:** Triggers if deviation `<= 0.10`.
- **Repeatable:** Yes.

### 5. `GOAL_PROGRESS`
- **ID:** `GOAL_PROGRESS_INFO`
- **Category:** `body`
- **Type:** `info`
- **Priority:** 5
- **Source Data:** `timeline[].body.weight`
- **Evaluation Window:** Entire timeline
- **Minimum Data:** `>= 1` valid weight
- **Target Source:** `activeWeightGoal.start_value` & `target_value`
- **Null Semantics:** `typeof === 'number' && Number.isFinite()`.
- **Timestamp Source:** The exact date of the latest valid weight observation in the entire timeline.
- **Confidence:** "high".
- **Output:** Calculates `rawProgress` and `displayProgress` (bounded 0-100%).
- **Repeatable:** Yes, repeats on every dashboard load for active goals.

---

## 3. Rule Quality / Hardening Audit
The engine is highly robust, pure, and stateless, but several specific edge cases require hardening:

1. **Future-Date Vulnerability (Timeline Anchor):** 
   - `WEIGHT_TREND_CHANGE` uses `const latestDate = timeline[timeline.length - 1].date;` as the anchor for "today".
   - If a user accidentally logs a weight or lifestyle entry for the year 2029, the entire analytics window shifts to 2029, causing all 7-day window rules to return `null` for current real-world data.
2. **`WEIGHT_TREND_CHANGE` Timestamp:**
   - It assigns `timestamp: latestDate` directly. This date might not contain a weight observation (e.g., if the latest entry is just water). It should be anchored to the latest valid *weight* date, similar to `GOAL_PROGRESS`.
3. **Missing `isFinite` Check:**
   - `NUTRITION_CALORIC_ADHERENCE` checks `typeof === 'number'`, but fails to check `Number.isFinite(...)` (unlike `PROTEIN_CONSISTENCY`). It is vulnerable to `NaN` or `Infinity`.
4. **Timezone/Date Parsing (Unified Timeline):**
   - `unified.js` sorts progress using `new Date(a.created_at).getTime()`. If `created_at` lacks a 'Z' offset, this parse can vary between local server time and UTC, potentially placing a late-night log on the wrong logical date.

---

## 4. Insight Noise / Repetition Audit
Currently, **all** insights repeat on every dashboard render if the conditions are met.
- **Acceptable Repetition:** The dashboard functions as a "current state" snapshot. Seeing "Workout Consistency Improved" every day during a good week is acceptable for a visual dashboard.
- **AI Coach Risk:** A conversational AI Coach cannot repeat the exact same insight 7 days in a row without seeming broken. 
- **Verdict:** For Phase 4 (Dashboard), stateless repetition is fine. For Phase 5 (AI), the AI layer must track exactly which insights it has "acknowledged" or "spoken" to the user, either by persisting a `notified_at` state or maintaining a conversational context window.

---

## 5. Structured Insight Contract Audit
The contract is consistently adhered to. 
- **Types:** Constrained correctly to `positive`, `warning`, `info`.
- **Confidence:** Constrained to `high` and `medium`.
- **Interpretation:** Neutrally worded. No unsupported medical or causal claims are made.
- **Timestamp Inconsistency:** `WEIGHT_TREND_CHANGE` does not strictly use an evidence-based timestamp (it uses the timeline end date). All other rules correctly track the `latestValidDate`.

---

## 6. Engine Architecture Audit
The engine is exceptionally well-architected.
- **Pure & Stateless:** `evaluate` and `canEvaluate` take primitive/object inputs and return predictable outputs.
- **Database-Independent:** No Supabase or database calls leak into the rules.
- **Extensible:** Adding rules only requires appending to the `rules` array.
- **Deterministic Sort:** Ensures stable UI rendering regardless of rule evaluation order.

---

## 7. Analytics → Insights Boundary Audit
- `unifiedTimeline` successfully abstracts the raw DB schema away from the engine.
- Missing values correctly map to `null`, while explicit `0` inputs remain `0`.
- **Leakage:** No UI strings or components leak into the engine.

---

## 8. Data Quality / Target Gap Audit (Deferred Items)
The following domains were correctly deferred:
- **Water Consistency**
- **Steps Consistency**
- **Sleep Consistency**
- **Reason for Deferral:** There are currently no canonical targets in `activePlan`, `goals`, or `profile` for these metrics. 
- **Architectural Placement:** Targets for these metrics should conceptually live in a dedicated `preferences` or `user_targets` schema, rather than cluttering the active diet `plan`. They cannot be deterministically evaluated for adherence until a target exists.

---

## 9. Test Coverage Audit
- **Coverage:** 60 strict behavioral tests cover the engine logic.
- **Strengths:** Covers mathematical boundaries (`-10%`, `+10%`, `>10%`), zero vs null preservation, and `GOAL_PROGRESS` unbounded raw math (`< 0` and `> 1`).
- **Gaps to Fill:**
  - Future-dated timeline entries (testing how the 7-day anchor behaves).
  - NaN/Infinity specific tests for Caloric Adherence.

---

## 10. Performance / Scale Audit
- **Complexity:** `O(R * N)` where R = rules and N = days in timeline. For 5 years of data (1825 days) and 10 rules, this is < 20,000 iterations.
- **Verdict:** Highly performant. No premature optimization required.

---

## 11. Privacy / Safety Audit
- No user PII is exposed.
- No AI is triggered in the evaluation path.
- No medical claims are generated (e.g., "You are losing weight because of X").

---

## 12. Phase 5 AI Coach Readiness
The deterministic engine is **almost fully ready** to serve as the factual foundation for the Phase 5 AI Coach. It successfully abstracts raw DB logs into clean, explainable, English-readable facts.

**What is missing for AI:**
1. **Insight Acknowledgement State:** The AI needs to know if the user has already been notified of `GOAL_PROGRESS_INFO`. The stateless engine cannot provide this. The AI layer (or an intervening persistence layer) must track `last_notified_insight_ids`.
2. **Current Date Injection:** The engine's reliance on `timeline[timeline.length - 1].date` means if a user hasn't logged data in 3 weeks, the engine pretends "today" is 3 weeks ago. The AI Coach must be able to inject the *actual current real-world date* so the engine can say "No data logged recently" instead of acting like time stopped.

---

## 13. Phase 4 Completeness Assessment
Phase 4 (Deterministic Engine) is structurally **COMPLETE**. 
No new domains (Water/Steps/Sleep) can be added without database schema changes for targets.

However, it needs a final **Phase 4.4 Hardening Slice** to fix the timeline date anchoring and math vulnerabilities before it is handed off to Phase 5.

---

## 14. Recommended Next Step (Phase 4.4 Scope)
**Phase 4.4 should be a strict Hardening & Engine Parameterization slice.**
It must NOT add new rules.

**Scope of Phase 4.4:**
1. Update `engine.js` and `rules.js` to accept an explicit `currentDate` parameter (passed down from `page.js` or `engine.js` wrapper) instead of deriving "today" exclusively from `timeline[timeline.length - 1]`.
2. Fix `WEIGHT_TREND_CHANGE` to output the date of the latest valid weight observation, not the generic `latestDate`.
3. Add `Number.isFinite` validation to `NUTRITION_CALORIC_ADHERENCE`.
4. Update `scripts/test-insights.js` to cover these fixes.

**Rollback Considerations:**
Because the engine is fully stateless, changes can be cleanly reverted via Git without risking database corruption or schema rollbacks.

# Phase 4.2 - Deterministic Insight Engine Audit

## 1. Current State (Phase 4.1 Foundation)
- **Pipeline:** `unifiedTimeline` is successfully built using `mergeDailyMetrics` and passed to `generateStructuredInsights` alongside `profileData` and `activePlan`.
- **Engine Runner:** `lib/insights/engine.js` runs synchronously, safely wrapping rule evaluation in `try...catch`, deduplicating by rule ID, and enforcing a strict deterministic sort (priority -> category -> id).
- **Output:** Returns an array of `StructuredInsight` objects.
- **UI:** `components/dashboard/PremiumInsights.jsx` cleanly maps over the objects, applying styles via the `type` field (`info`, `warning`, `success`, `trend`).

## 2. Candidate Rule Findings

### Goal Progress Audit
- **Current Flow:** `getActiveGoal` is queried in `page.js`, but `activeWeightGoal` is currently **not** passed into `generateStructuredInsights`. The engine receives `activePlan` but not the active goal object itself.
- **Milestone Spam Risk:** As noted in the Phase 4.1 design, emitting "Goal Milestone Reached!" purely deterministically on every dashboard load creates severe spam. Without persistence (e.g., a `user_milestones` table to track what has already been acknowledged), the rule will trigger repeatedly for the same milestone every time the page loads.
- **Verdict:** Should remain **DEFERRED** until a persistence/acknowledgment layer is added. Do not invent milestone state.

### Workout Consistency Audit
- **Semantics:** `unifiedTimeline` extracts `workoutCompleted` correctly (`true` = completed, `false` = skipped, `null` = untracked).
- **Comparison:** Comparing the current 7 days vs the previous 7 days is mathematically safe provided we rely on actual tracked days, not missing data.
- **Data Sufficiency:** We must enforce a minimum number of valid observations (where `workoutCompleted !== null`) in both windows. E.g., `currentValid >= 2` and `previousValid >= 1`. If the user tracked nothing this week, it is `null`, and the rule must abort rather than falsely claiming a "workout decline".
- **Verdict:** Safe and deterministic. Ready for implementation.

### Nutrition Consistency Audit
- **Target Source:** The active calorie target must come from `activePlan.calories`.
- **Active Plan Lookup:** `page.js` successfully fetches and passes `currentPlan` to the engine as the third parameter.
- **Semantics:** `unifiedTimeline` extracts `calories` as a number or `null`. Explicit `0` is technically valid but rare; `null` means untracked.
- **Data Sufficiency:** Calorie adherence should only be evaluated if the user has an `activePlan` and has logged nutrition for a minimum number of days in the current 7-day window (e.g., `>= 3` valid days).
- **Verdict:** Safe and deterministic, provided the rule immediately aborts if `!activePlan` or `!activePlan.calories`.

## 3. Data Sufficiency
To prevent low-confidence hallucinations or false warnings:
- **Workout Consistency:** Requires `currentValid >= 2` and `previousValid >= 1` boolean logs in their respective 7-day windows.
- **Nutrition Consistency:** Requires an active plan with a calorie target, plus `currentValid >= 3` days of logged calories in the trailing 7 days.
- **Empty States:** If thresholds aren't met, the rules will cleanly return `null` and the UI will continue to show the standard fallback empty state, exactly as designed.

## 4. Determinism & Security
- Both Workout Consistency and Nutrition Consistency can be written as 100% pure JavaScript functions.
- They do not mutate the `unifiedTimeline`.
- They do not require AI/LLMs or Supabase API calls inside the rule itself.
- They will preserve stable IDs (e.g., `WORKOUT_CONSISTENCY_DROP`, `NUTRITION_CALORIE_ADHERENCE`).

## 5. UI Contract
- `PremiumInsights.jsx` dynamically binds icons and colors based on `type`.
- It already supports `warning` (orange), `success` (emerald), `info` (blue), and `trend` (purple).
- No UI redesign is required to support the new rules. The frontend is fully decoupled from the rule logic.

## 6. Scope Recommendation (Phase 4.2)
To maintain the smallest safe vertical slice, **Phase 4.2 should implement Workout Consistency and Nutrition Consistency together.** 
- Goal Progress should be explicitly excluded and deferred until milestone persistence is architected.
- Protein, Water, Steps, and Sleep should be deferred to Phase 4.3 to keep the PR small and testable.

## 7. Exact Files to Modify
- `lib/insights/rules.js` (Add `WORKOUT_CONSISTENCY` and `NUTRITION_ADHERENCE` rules to the array)
- `scripts/test-insights.js` (Add test cases for the new rules)

*(No changes needed in `page.js` or `PremiumInsights.jsx` because the engine already receives `activePlan` and the UI already handles generic structured outputs).*

## 8. Test Plan
`scripts/test-insights.js` must be updated with mocked `unifiedTimeline` data arrays validating:
1. **Workout Sufficiency Fail:** Aborts when current 7 days have `null` workouts (0 valid).
2. **Workout Drop:** Triggers warning when previous 7 days had 4 `true` workouts, and current 7 days have 1 `true` and 3 `false` workouts.
3. **Workout Increase:** Triggers success/positive when previous had 1, current has 4.
4. **Nutrition Sufficiency Fail:** Aborts if `activePlan` is undefined.
5. **Nutrition Adherence:** Triggers success if 7-day average calories is within ±10% of `activePlan.calories`.
6. **Nutrition Over/Under:** Triggers warning if 7-day average deviates significantly (>15%) from the plan.

## 9. Non-Goals
- No milestone spam (Goal Progress deferred).
- No new UI components.
- No database migrations.
- No modifications to the analytics unification logic.

## 10. Rollback Approach
If the new rules fail in production, rollback is instant: simply remove the two objects from the `rules` array in `lib/insights/rules.js`. The engine will safely revert to running only the Weight Trend rule.

---

### Verdict: READY FOR DESIGN
The existing Phase 4.1 foundation is robust, pure, and ready to accept the Workout Consistency and Nutrition Consistency rules without architectural modifications.

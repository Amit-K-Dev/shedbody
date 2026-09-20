# Phase 4.3 - Deterministic Insight Engine Design

## 1. Scope
This document strictly defines the implementation contract for Phase 4.3 of the Deterministic Insight Engine. It details the design of two new insight rules based on the Phase 4.3 architectural audit:
1. PROTEIN_CONSISTENCY
2. GOAL_PROGRESS

This phase introduces no new database schema, relies on purely deterministic functions, and preserves the stateless nature of the insight engine.

---

## 2. Architecture
- **Data Pipeline:** `app/(dashboard)/dashboard/page.js` merges Progress, Nutrition, and Lifestyle records into a `unifiedTimeline`.
- **Engine Signature Modification:** The insight engine in `lib/insights/engine.js` will be updated to accept a fourth parameter:
  ```javascript
  export function generateStructuredInsights(unifiedTimeline, profile, activePlan, activeWeightGoal)
  ```
- **Execution:** `generateStructuredInsights` evaluates all rules deterministically in `lib/insights/rules.js`.
- **UI:** The generated `StructuredInsight` objects are rendered natively by `PremiumInsights.jsx`.

---

## 3. Protein Consistency Contract
**Source Data:**
- Actual: `unifiedTimeline.nutrition.protein`
- Target: `activePlan.protein`

**Target Validation:**
- `activePlan` must exist.
- `activePlan.protein` must be finite and strictly `> 0`.
- Missing, invalid, NaN, or Infinity target results in no insight (`null`).

**Window & Data Semantics:**
- Evaluates the **current 7-day window** (same semantics as Phase 4.1/4.2).
- `null`/`undefined` means untracked and is ignored.
- `0` is an explicit tracked value and MUST NOT be converted to `null`.
- Requires a minimum of **3 valid protein observations**. Less than 3 results in no insight (`null`).

**Calculation & Output:**
- Calculates the arithmetic mean of valid current-window protein observations.
- Calculates deviation from `activePlan.protein`.
- If average is within inclusive **±10%** of target, outputs a `positive` insight (`category: "nutrition"`, `type: "positive"`).
- If deviation is **>10%**, outputs no insight (`null`) to prevent nagging.
- The `timestamp` maps to the latest valid current-window protein observation date.
- Insight ID must be deterministic (e.g., `PROTEIN_CONSISTENCY_POSITIVE`).
- No medical or causal claims. No inferred targets.

---

## 4. Goal Progress Contract
**Source Data:**
- `activeWeightGoal` (object)
- Latest valid finite `weight` available in the **entire** `unifiedTimeline.body.weight` (Goal Progress is a current-state insight and does NOT use the 7-day analytics window).
- The `timestamp` must be the actual date of that latest valid weight observation.

**Preconditions:**
- `activeWeightGoal` must exist.
- `activeWeightGoal.domain` must equal `"weight"`.
- `activeWeightGoal.status` must equal `"active"`.
- `start_value` and `target_value` must be finite numbers.
- Current weight must be a finite number.
- If any precondition fails, returns `null` (no insight).
- If `start_value === target_value` (degenerate goal), returns `null`.

**Calculation Formula & Semantics:**
```javascript
rawProgress = (currentWeight - start_value) / (target_value - start_value)
displayProgress = Math.max(0, Math.min(1, rawProgress))
```
This algebraic formula naturally handles both weight-loss and weight-gain correctly. The bounded `displayProgress` is used for percentage presentation. However, the raw mathematical state (`rawProgress`) must remain available to the rule so that evidence/interpretation accurately distinguishes:
- `rawProgress < 0`: Current weight is moving away from the target relative to the starting point.
- `0 <= rawProgress <= 1`: Current progress toward target.
- `rawProgress >= 1`: Current weight is at or beyond target.

Do not falsely describe a `rawProgress` of `-0.2` as exactly `0%` progress without explaining the bounded display semantics. Do not falsely describe `rawProgress` of `1.2` as exactly `100%` achievement.

---

## 5. Direction and Boundary Semantics (Goal Progress)
- **Weight-loss goal:** `target_value < start_value` (e.g., 80 → 70, current 75 = 50%)
- **Weight-gain goal:** `target_value > start_value` (e.g., 70 → 80, current 75 = 50%)

**Boundary Behavior:**
The engine calculates a bounded display progress of 0% to 100%, but preserves exact evidence mathematically.
- **Moving away from target (progress < 0):** Bounded display is 0%.
- **Exactly 0%, 25%, 50%, 75%:** Distinct, explainable states.
- **Goal Completion / Beyond target (progress >= 1):** Bounded display is 100%. Described neutrally as "at or beyond target".

**Insight Interpretation Constraints:**
This rule describes **CURRENT GOAL STATE**, not historical milestone crossings. The rule must not claim when the goal was historically achieved because no persisted milestone-crossing state exists.
- Valid: "You have completed approximately X% of your weight goal." or "You are at or beyond your target."
- Invalid: "You just crossed 50% today!", "Goal Achieved", or "You achieved your goal today".

---

## 6. Structured Insight Contract
Both rules strictly adhere to the established shape:
```javascript
{
  id: String,             // Deterministic identifier
  category: String,       // "nutrition" | "body"
  priority: Number,       // 1 (Highest) to 100 (Lowest)
  observation: String,    // Factual statement of what happened
  evidence: String,       // Mathematical proof
  interpretation: String, // Contextual meaning (No medical/causal claims)
  recommendation: String, // Actionable next step
  confidence: String,     // "high" | "medium"
  timestamp: String,      // "YYYY-MM-DD" of actual evidence date
  type: String            // "positive" | "warning" | "info"
}
```

---

## 7. NULL / Zero Semantics
- `null` or `undefined` strictly means **untracked** and must be ignored.
- `0` is an **explicit tracked value** and must be preserved in mathematical averages.
- `false` is an **explicit tracked boolean** where applicable.
- Coercion rules: DO NOT coerce `null` → `0`, `null` → `false`, or missing values → `0`.

---

## 8. Determinism
All outputs are 100% reproducible for a given `unifiedTimeline`, `profile`, `activePlan`, and `activeWeightGoal`. Engine ordering relies on priority, category, and ID to guarantee visual stability.

---

## 9. Repetition/State Considerations
The insights generated by Goal Progress are level-triggered, stateless UI dashboard cards. Repetition (e.g., "You are at 50% progress" displayed for multiple days) is intentional and harmless within the `PremiumInsights` UI construct. It serves as passive context rather than active spam. No milestone persistence is introduced.

---

## 10. Complete Test Matrix

### Protein Consistency Tests
- `activePlan` is missing → `null`
- `activePlan.protein` missing / `0` / negative / NaN / Infinity → `null`
- Fewer than 3 valid protein observations → `null`
- Exactly 3 valid observations handled correctly.
- `null` observations are ignored; explicit `0` is mathematically averaged.
- Average within `±10%` threshold → `positive`
- Average exactly `+10%` boundary → `positive`
- Average exactly `-10%` boundary → `positive`
- Deviation `> 10%` → `null`
- Timestamp maps precisely to the latest valid observation date.
- Output is strictly deterministic.

### Goal Progress Tests
- Goal object is missing / non-active / non-weight domain → `null`
- Missing or invalid `start_value` / `target_value` → `null`
- Missing `current_weight` → `null`
- Degenerate goal (`start_value === target_value`) → `null`
- Weight-loss scenario: 80 → 70, current 75 evaluates to 50% progress.
- Weight-gain scenario: 70 → 80, current 75 evaluates to 50% progress.
- Progress `< 0%` (moving away) is safely bounded to 0%.
- Evaluates correctly at 25%, 50%, 75%.
- Progress `>= 100%` (at or beyond target) → bounded display progress = 100%.
- Timestamp maps precisely to the latest valid weight entry date.
- Emits current state, not milestone-crossing claims.

### Regression Requirements
- Existing `WEIGHT_TREND_CHANGE` behavior is mathematically unchanged.
- Existing `WORKOUT_CONSISTENCY` behavior is unchanged.
- Existing `NUTRITION_CALORIC_ADHERENCE` behavior is unchanged.

---

## 11. Implementation Boundary
The implementation strictly spans:
- `lib/insights/engine.js` (Parameter signature update only)
- `lib/insights/rules.js` (Addition of two pure rule objects)
- `app/(dashboard)/dashboard/page.js` (Passing `activeWeightGoal` into engine)
- `scripts/test-insights.js` (Adding the complete test matrix)

There are **zero** database changes, migrations, API route modifications, or UI structural changes.

---

## 12. Deferred Domains
The following domains are explicitly **DEFERRED** due to a lack of canonical authoritative targets in the current schema:
- **Water Consistency** (actual data exists, no target)
- **Steps Consistency** (actual data exists, no target)
- **Sleep Consistency** (actual data exists, no target)

No generic targets will be invented or assumed.

---

## 13. Safety / Privacy
- No medical diagnoses, causal, or pseudo-medical claims.
- No AI or external LLM service calls.
- No new persistent data tracking or database schemas.

---

## 14. Rollback Plan
Phase 4.3 can be instantly and safely rolled back by:
1. Reverting the `engine.js` signature modification.
2. Reverting the `page.js` function call arguments.
3. Removing the two newly appended rule objects from `rules.js`.
4. Removing their associated tests.
No database or data rollback will be necessary.

---

## 15. Final Approval Checklist
- [x] Protein Consistency defined mathematically.
- [x] Goal Progress defined purely as current state without milestone persistence.
- [x] Boundary behaviors for weight loss/gain clearly articulated.
- [x] Engine signature change explicitly outlined.
- [x] Water, Steps, and Sleep explicitly deferred.

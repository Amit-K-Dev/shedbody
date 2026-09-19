# Phase 4.2 - Deterministic Insight Engine Design

## 1. Goal and Scope
Design the smallest safe implementation for Phase 4.2 of the Deterministic Insight Engine.
This design explicitly **includes**:
- `WORKOUT_CONSISTENCY` rule
- `NUTRITION_CALORIC_ADHERENCE` rule

This design explicitly **defers** (Non-Goals):
- Goal Progress (requires milestone persistence to avoid spam)
- Protein Consistency
- Water Consistency
- Steps Trend
- Sleep Consistency
- Any modifications to `page.js`, `PremiumInsights.jsx`, database schemas, or migrations.
- AI, LLMs, Supabase API calls, or medical/causal claims.

---

## 2. Structured Insight Contract
The engine returns an array of objects strictly matching this shape:

```javascript
{
  id: String,             // Stable identifier (e.g., "WORKOUT_CONSISTENCY_DROP")
  category: String,       // "lifestyle" | "nutrition"
  priority: Number,       // 1 (Highest) to 100 (Lowest)
  observation: String,    // Factual statement of what happened
  evidence: String,       // The mathematical proof/data points
  interpretation: String, // Contextual meaning (no medical/causal claims)
  recommendation: String, // Actionable next step
  confidence: String,     // "high" | "medium" (No "low" confidence)
  timestamp: String,      // "YYYY-MM-DD" of the latest evidence date
  type: String            // "positive" | "warning" | "info" ONLY
}
```

**Constraint Resolution:**
- `type` is strictly restricted to `"positive"`, `"warning"`, or `"info"`. `"success"` and `"trend"` are explicitly forbidden for Phase 4.2 generation.
- `PremiumInsights.jsx` will safely consume `"positive"` (rendering with the default Info styling) without requiring any code changes.

---

## 3. Rule Design: WORKOUT_CONSISTENCY

**Source Data:** `unifiedTimeline.lifestyle.workoutCompleted`
- `true` = Completed
- `false` = Explicitly skipped
- `null`/`undefined` = Untracked

**Requirements & Semantics:**
- Compares the **current 7-day window** (days 0-6) against the **previous 7-day window** (days 7-13).
- **Minimum Data Sufficiency:**
  - Current window must have `>= 2` valid observations (`!== null`).
  - Previous window must have `>= 1` valid observation (`!== null`).
  - If either window lacks sufficient valid observations, the rule returns `null`.
- **Logic:**
  - `currentTrueCount < previousTrueCount` → Returns warning insight (`WORKOUT_CONSISTENCY_DROP`).
  - `currentTrueCount > previousTrueCount` → Returns positive insight (`WORKOUT_CONSISTENCY_IMPROVED`).
  - `currentTrueCount === previousTrueCount` → Returns `null` (no insight).
- **Timestamp:** `"YYYY-MM-DD"` of the most recent valid observation in the current window.
- **Constraints:** Never converts `null` to `false` or `0`. No causal claims (e.g., "This drop is why you gained weight").

---

## 4. Rule Design: NUTRITION_CALORIC_ADHERENCE

**Source Data:** 
- Target: `activePlan.calories`
- Actual: `unifiedTimeline.nutrition.calories`

**Requirements & Semantics:**
- **Pre-condition:** If `!activePlan` or `!activePlan.calories`, return `null`. Do not invent or estimate a target.
- **Null Semantics:** `null`/`undefined` means untracked. Explicit `0` remains `0`.
- **Minimum Data Sufficiency:**
  - Current 7-day window must have `>= 3` valid observations (`!== null`).
  - If insufficient, return `null`.
- **Logic:**
  - Calculate the average daily calories over the valid days in the current 7-day window.
  - Calculate deviation: `deviation = Math.abs(averageCalories - activePlan.calories) / activePlan.calories`.
  - `deviation <= 0.10` (within ±10%) → Returns positive insight (`NUTRITION_CALORIC_ADHERENCE_POSITIVE`).
  - `deviation > 0.10` (outside ±10%) → **Returns `null`**. (Conservative design choice: we explicitly refrain from generating warning insights for poor adherence in Phase 4.2 to prevent nagging, unless further architectural approval is granted).
- **Timestamp:** `"YYYY-MM-DD"` of the most recent valid calorie log in the current window.
- **Constraints:** No causal/medical claims.

---

## 5. Implementation Scope
Only two files will be created/modified:
1. `lib/insights/rules.js`: Append the two pure functions to the exported `rules` array.
2. `scripts/test-insights.js`: Append deterministic unit tests verifying every branch.

*Removing these two rules from the array guarantees an instant rollback to Phase 4.1 behavior.*

---

## 6. Exact Test Matrix (`scripts/test-insights.js`)

### Workout Consistency Tests
1. **Insufficient Current Data:** 1 valid log in current, 3 in previous → Evaluates to `null`.
2. **Insufficient Previous Data:** 4 valid logs in current, 0 in previous → Evaluates to `null`.
3. **Null Ignored:** `[true, null, null, null, null, null, false]` (2 valid logs) → Handled correctly as 2 valid observations.
4. **False Counted:** `false` is treated as a valid tracked observation but does not increment the `true` completion count.
5. **Drop Warning:** Previous has 4 `true`, Current has 1 `true` → Outputs `WORKOUT_CONSISTENCY_DROP` (`type: "warning"`).
6. **Improvement Positive:** Previous has 1 `true`, Current has 4 `true` → Outputs `WORKOUT_CONSISTENCY_IMPROVED` (`type: "positive"`).
7. **Equal Counts:** Previous has 3 `true`, Current has 3 `true` → Evaluates to `null`.
8. **Deterministic Timestamp:** Timestamp perfectly matches the latest date with a valid boolean.

### Nutrition Adherence Tests
1. **No Active Plan:** `activePlan` is undefined or missing calories → Evaluates to `null`.
2. **Insufficient Logs:** 2 valid logs in current 7 days → Evaluates to `null`.
3. **Null Ignored / Zero Preserved:** `[2000, 0, null, 1500, null, null, null]` (3 valid logs) → Correctly averages the three valid logs (`(2000+0+1500)/3`).
4. **Positive Adherence:** Average is `2050`, Target is `2000` (within 10%) → Outputs `NUTRITION_CALORIC_ADHERENCE_POSITIVE` (`type: "positive"`).
5. **Boundary Behavior (Outside ±10%):** Average is `1500`, Target is `2000` (deviation 25%) → Evaluates to `null` (Nag-prevention feature).
6. **Deterministic Timestamp:** Timestamp perfectly matches the latest date with a valid calorie log.

---

### Verdict: READY FOR IMPLEMENTATION
The rules are mathematically sound, pure, data-grounded, and require zero structural changes to the UI or Data layers.

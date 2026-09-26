# Phase 4.4 Insight Engine Hardening Design

## 1. Scope
Phase 4.4 is a strict hardening and parameterization slice for the Phase 4 deterministic insight engine. Its scope is exclusively limited to resolving explicit timeline anchoring, timestamp generation, and numerical validation safety. 

No new insight domains, database changes, AI layers, or notification persistence mechanisms are included in this phase.

## 2. Current Problem
The engine currently derives its anchor for "today" from the final entry in the `unifiedTimeline` (`timeline[timeline.length - 1].date`). 
This creates structural vulnerabilities:
1. **Future-Date Vulnerability:** If a future-dated log is ingested (e.g., year 2029), the entire 7-day analytics window shifts to 2029, discarding present-day data.
2. **Sparse Timeline Anchor:** If a user stops logging for 3 weeks, the engine anchors "today" to a date 3 weeks ago, rather than correctly identifying a current lack of data.
3. **Improper Timestamping:** `WEIGHT_TREND_CHANGE` outputs the generic `latestDate` as its insight timestamp rather than the date of the actual weight observation.

## 3. Explicit `currentDate` Contract
The engine signature must be updated to accept an explicit `currentDate`:

```javascript
generateStructuredInsights(
  unifiedTimeline,
  profile,
  activePlan,
  activeWeightGoal,
  currentDate
)
```

### Exact Window Contract
For every window-based rule, `currentDate` is the deterministic evaluation anchor.

- **Current 7 Days:** Exactly `currentDate` through `currentDate - 6 calendar days`.
- **Previous 7 Days (where applicable):** Exactly `currentDate - 7` through `currentDate - 13 calendar days`.
- **Overlap:** None.
- **Out of bounds:** Records outside these ranges are ignored. Future-dated records relative to `currentDate` are strictly ignored.
- **Missing Days:** Ignored. Zeroes/observations are NOT artificially synthesized.

### Rule-by-Rule Date Behavior
1. **WEIGHT_TREND_CHANGE**
   - `currentDate` anchored.
   - Evaluates current 7d vs previous 7d.
2. **WORKOUT_CONSISTENCY**
   - `currentDate` anchored.
   - Evaluates current 7d vs previous 7d.
3. **NUTRITION_CALORIC_ADHERENCE**
   - `currentDate` anchored.
   - Evaluates current 7d.
4. **PROTEIN_CONSISTENCY**
   - `currentDate` anchored.
   - Evaluates current 7d.
5. **GOAL_PROGRESS**
   - Evaluates the **entire timeline**.
   - Does NOT use the `currentDate` window. It continues selecting the latest valid finite weight from the entire historical timeline.

## 4. `currentDate` Source / Timezone Semantics
**Limitation:** The current application architecture (Server Components in Next.js) does not store or pass a user-local timezone profile. 

**Decision:** 
`currentDate` will be supplied by `app/(dashboard)/dashboard/page.js`.
Because there is no reliable user timezone available, the safest existing canonical source that matches the rest of the dashboard's analytics fetching logic will be used:
`new Date().toISOString().slice(0, 10)`

**Documentation of Ambiguity:** 
This represents the **Server UTC date**, not the guaranteed browser-local date. A user near midnight UTC might see their "today" shift a few hours out of sync with their local clock. This is a known architectural limitation that must be addressed in a future phase via a timezone preference in the database or client-side hydration. We will NOT invent an artificial timezone solution in Phase 4.4.

## 5. Current Date Validation
A pure validation contract for `currentDate` must be enforced before rule evaluation:
- It must be a real calendar date string in `YYYY-MM-DD` format.
- It must accept valid dates (e.g., `"2024-05-15"`).
- It must strictly reject missing, malformed, or impossible dates without introducing external library dependencies.
- **Rejected Examples:** `""`, `undefined`, `null`, `"2026-9-2"`, `"2026-13-01"`, `"2026-02-30"`, or arbitrary strings.

## 6. Missing/Invalid Current Date
If `currentDate` is missing or invalid according to the validation contract:
- All window-based rules must safely return `null` and not emit insights.
- `GOAL_PROGRESS` may still evaluate and emit insights because it is not window-based.
- The engine must gracefully skip windowed rules and NOT throw an error.
- There must be **no fallback** to `timeline[timeline.length - 1].date`.
- There must be **no generated/artificial date** fallback (e.g., `new Date()`).

## 7. Weight Trend Contract
- Evaluates the strict `currentDate` window boundaries.
- Preserves the `±0.5` kg significance threshold.
- The insight's timestamp must be the **latest actual valid weight observation date** used during the window evaluation, NOT the `currentDate` or the end of the timeline. If multiple valid weights exist in the current window, the chronologically latest one wins.

## 8. Caloric Finite Validation
`NUTRITION_CALORIC_ADHERENCE` currently checks `typeof === 'number'`. It must be hardened to prevent `NaN` or `Infinity` from passing validation.
- Requires `Number.isFinite(entry.nutrition.calories)`.
- **Preserved Semantics:**
  - `null` / `undefined` = untracked (ignored)
  - `0` = explicit tracked value (valid)
  - Positive finite values = valid
  - `NaN`, `Infinity`, `-Infinity` = invalid
  - Threshold remains exactly `±10%` inclusive.
  - Requires exactly `>= 3` valid observations in the current 7-day window.

## 9. Regression Contract
All existing Phase 4 rules must remain active and functional:
- `WEIGHT_TREND_CHANGE`
- `WORKOUT_CONSISTENCY` (Drop/Improved)
- `NUTRITION_CALORIC_ADHERENCE_POSITIVE`
- `PROTEIN_CONSISTENCY_POSITIVE`
- `GOAL_PROGRESS_INFO`

Except for anchoring windows to the explicit `currentDate`, output generation logic remains identical.

## 10. Test Matrix Update
The following explicit test requirements must be added or adapted in `scripts/test-insights.js`:

**Current Date Anchoring for ALL Window-Based Rules:**
Tests must explicitly prove that:
1. `WEIGHT_TREND_CHANGE` uses the injected `currentDate`.
2. `WORKOUT_CONSISTENCY` uses the injected `currentDate`.
3. `NUTRITION_CALORIC_ADHERENCE` uses the injected `currentDate`.
4. `PROTEIN_CONSISTENCY` uses the injected `currentDate`.

**Window & Boundary Tests:**
- Future-dated records do not shift any window.
- Sparse timelines evaluate correctly relative to the injected date.
- An old timeline end date does NOT become the anchor.
- Exact calendar boundary conditions (e.g., an entry exactly 7 days before `currentDate` goes to the previous window, not the current one).
- Invalid `currentDate` prevents windowed insights from generating entirely.
- `GOAL_PROGRESS` correctly bypasses the missing `currentDate` restriction and functions on the entire timeline.

**Weight Trend & Caloric Safety Tests:**
- Weight Trend outputs the timestamp of the latest weight observation, NOT the timeline end or `currentDate`.
- Timelines containing `NaN` or `Infinity` for calories safely ignore those days.
- Zero (`0`) calorie values are counted as valid observations (if explicitly logged).
- Values > 10% deviation safely return no insight.

**Regression:**
- Existing goal progress, protein, and workout tests must successfully pass when given an injected `currentDate`.

## 11. Implementation Boundary
Files permitted to be modified during implementation:
- `docs/phase4-insight-engine-4.4-design.md`
- `lib/insights/engine.js`
- `lib/insights/rules.js`
- `app/(dashboard)/dashboard/page.js`
- `scripts/test-insights.js`

No other files are allowed to be modified.

## 12. Rollback Plan
Since the insight engine is entirely stateless and functionally pure, reverting these changes carries zero database or migration risk. A standard `git revert` or restoring from the `9a2fb2f` commit will safely restore Phase 4.3 logic.

## 13. Deferred Items
Water Consistency, Steps Consistency, and Sleep Consistency are strictly deferred until Phase 5 or later when canonical targets are added to the database schema.

## 14. Phase 5 Impact
By decoupling the evaluation anchor from the raw log data and parameterizing it via `currentDate`, the engine allows the Phase 5 AI Coach to evaluate a user's status accurately based on real-world time, resolving the "frozen in time" vulnerability when users are absent.

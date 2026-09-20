# Phase 4.3 - Deterministic Insight Engine Audit

## 1. Scope
This document provides a read-only architectural audit of the current Phase 4 insight engine and evaluates candidate domains for Phase 4.3. The goal is to determine which domains can safely be implemented as purely deterministic, state-free rules without inventing data or introducing medical risk.

**Candidates Evaluated:**
1. Goal Progress
2. Protein Consistency
3. Water Consistency
4. Steps Consistency
5. Sleep Consistency

---

## 2. Current Architecture (Phase 4.2 Foundation)
- **Data Flow:** `page.js` fetches multiple streams (Progress, Nutrition, Lifestyle, Plans, Goals) and builds a `unifiedTimeline` using `mergeDailyMetrics`. 
- **Engine Signature:** Currently, `page.js` calls `generateStructuredInsights(unifiedTimeline, profile, currentPlan)`.
- **Rule Pipeline:** `lib/insights/rules.js` contains `WEIGHT_TREND_CHANGE`, `WORKOUT_CONSISTENCY`, and `NUTRITION_CALORIC_ADHERENCE`. They are pure, stateless, try-catch protected, and enforce strict minimum-data thresholds.
- **UI:** `PremiumInsights.jsx` blindly maps over the `StructuredInsight` objects, picking icons/colors based solely on `type` (`positive`, `warning`, `info`). It does not cause modals, toast spam, or blocking popups; insights are just standard dashboard cards.

---

## 3. Candidate Rule Audit & Data Availability

### A. Goal Progress
- **Required Data:** `activeWeightGoal` (from `goals` table).
- **Data Availability:** Yes, the `goals` table canonically stores `start_value` and `target_value` for the `weight` domain. `page.js` already fetches `activeWeightGoal`.
- **Engine Constraint:** Currently, `activeWeightGoal` is **not** passed into `generateStructuredInsights`. Implementing this rule requires modifying the engine signature in `engine.js` and `page.js`.
- **Noise/Spam Re-evaluation:** Previous audits cited "milestone spam" as a reason to defer this. Re-evaluating against the actual architecture reveals that this concern was overstated. Insights render as passive dashboard cards. Emitting a `GOAL_PROGRESS_HALF_WAY` insight every day is repetitive, but it does not cause disruptive "popup spam." 
- **Null Semantics:** Returns `null` if no active goal exists, or if `start_value` / `target_value` are missing.
- **Verdict:** **RECOMMENDED**. The spam concern was largely theoretical given the passive UI. We can implement a level-triggered rule (e.g., "Over 50%").

### B. Protein Consistency
- **Required Data:** `unifiedTimeline.nutrition.protein` and a canonical target.
- **Data Availability:** Yes, `currentPlan` canonically stores `protein` targets.
- **Evaluation Window:** Current 7 days.
- **Minimum Observations:** `>= 3` valid days, identical to Caloric Adherence.
- **Null Semantics:** `null` is ignored. `0` is preserved. If `!activePlan.protein`, return `null`.
- **Verdict:** **RECOMMENDED**. This is a drop-in 1:1 equivalent to Caloric Adherence and fits perfectly without structural changes.

### C. Water Consistency
- **Required Data:** `unifiedTimeline.nutrition.water` and a target.
- **Data Availability:** Actuals are tracked, but **there is no canonical target**. The `plans` and `goals` schemas do not store a water target.
- **Verdict:** **DEFERRED**. We cannot invent a target (e.g., hardcoding 2000ml). Evaluating "consistency" without a target is impossible.

### D. Steps Consistency
- **Required Data:** `unifiedTimeline.lifestyle.steps` and a target.
- **Data Availability:** Actuals are tracked in `lifestyle_logs`, but **there is no canonical target** in the database.
- **Verdict:** **DEFERRED**. Same as Water. We cannot evaluate adherence without an authoritative target.

### E. Sleep Consistency
- **Required Data:** `unifiedTimeline.lifestyle.sleepHours` and a target.
- **Data Availability:** Actuals are tracked, but **there is no canonical target**.
- **Verdict:** **DEFERRED**.

---

## 4. Determinism, Safety, and Null Semantics
For the recommended domains (Goal Progress and Protein Consistency):
- Both can be evaluated mathematically and deterministically.
- `null` strictly means "untracked" and will be skipped in average calculations.
- If data sufficiency (`>= 3` logs for Protein) or preconditions (`activeWeightGoal` for Goal Progress) are unmet, the rules cleanly return `null` and do not generate an insight.
- No medical or causal claims are made.

---

## 5. Recommended Phase 4.3 Scope
**Implement:**
1. **Goal Progress** (Requires passing `activeWeightGoal` to the insight engine).
2. **Protein Consistency** (Requires no engine modifications).

**Explicitly Deferred:**
- Water Consistency (No DB target)
- Steps Consistency (No DB target)
- Sleep Consistency (No DB target)

---

## 6. Implementation Boundary
To implement Phase 4.3 safely:
1. **Modify `lib/insights/engine.js`**: Update signature to `(unifiedTimeline, profile, activePlan, activeGoal)`.
2. **Modify `app/(dashboard)/dashboard/page.js`**: Pass `activeWeightGoal` to `generateStructuredInsights`.
3. **Modify `lib/insights/rules.js`**: Append `PROTEIN_CONSISTENCY` and `GOAL_PROGRESS`.
4. **Modify `scripts/test-insights.js`**: Add deterministic unit tests.

---

## 7. Test Requirements
- **Goal Progress:** Test undefined goals, identical start/target, 25%, 50%, 75%, and 100% completion boundary conditions.
- **Protein Consistency:** Test missing `activePlan.protein`, insufficient logs, ignoring `null`, preserving `0`, and adherence boundary logic.

---

## 8. Rollback Plan
- Revert the `engine.js` and `page.js` function signatures.
- Remove the two rules from `rules.js`.
- The UI will instantly fallback to Phase 4.2 behavior without database or state corruption.

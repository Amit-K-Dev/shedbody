# Phase 4 Deterministic Insight Engine Design

## 1. Architecture Goal
Design the smallest safe Phase 4 v1 deterministic insight engine. The architecture will follow a pure pipeline:
`Data → Analytics → Deterministic Rules → Structured Insights → UI`

No AI/LLM models, no external APIs, and no non-deterministic logic.

## 2. Insight Contract
Insights will strictly follow a deterministic structured format. 

```javascript
{
  id: "string",             // Stable rule ID (e.g., "WEIGHT_TREND_CHANGE")
  category: "string",       // "body", "lifestyle", "nutrition"
  priority: 1,              // Number for deterministic sorting (lower is higher priority)
  observation: "string",    // Directly observable factual statement based on data
  evidence: "string",       // Concrete data point(s) supporting the observation
  interpretation: "string", // Cautious interpretation of what this data implies
  recommendation: "string", // Practical, actionable, non-medical advice
  confidence: "string",     // "high", "medium" (low is not generated)
  timestamp: "string",      // Evidence-period end date (YYYY-MM-DD)
  type: "string"            // "positive", "warning", "info"
}
```
**Decision on `type`:** Required for UI presentation to replace the current fragile string matching. Allowed values are strictly: `"positive"`, `"warning"`, `"info"`.

## 3. Engine Contract
The engine is a pure, synchronous JavaScript function.
- **Input arguments:** `(unifiedTimeline, profile, activePlan)`
- **Output:** `Array<StructuredInsight>`
- **Purity:** Does not mutate source arrays. Does not query Supabase, call APIs, or write data.
- **Deterministic Ordering:** Collects all valid insights, sorts by priority, then category, then ID.
- **Duplicate Prevention:** A `Set` or map is used to ensure a unique `id` is only added once per run.
- **Invalid/Missing Input:** If `unifiedTimeline` is empty or invalid, returns `[]`.

## 4. Rule Contract
Rules are defined in a simple array structure. No complex frameworks.
File: `lib/insights/rules.js`

```javascript
{
  id: "RULE_ID",
  category: "category",
  priority: number,
  
  // Data Sufficiency Check: Returns true if there is enough valid data to evaluate
  canEvaluate: (timeline, profile, activePlan) => boolean,
  
  // Logic: Returns a StructuredInsight or null if conditions are not met
  evaluate: (timeline, profile, activePlan) => structuredInsight | null
}
```

## 5. Data Sufficiency
Missing data (`null`) represents untracked days and must never be treated as a negative action. 
- `null`/missing: Untracked. Ignored or disqualifies the rule if minimum valid days aren't met.
- `0`: Explicit zero. Treated as a valid tracked entry.
- `false`: Explicit failure/skip. Treated as a valid tracked entry.

A rule **must return no insight** if the minimum valid observations are not met. 

## 6. V1 Rules (Phase 4.1 Scope)

### A. Weight Trend (ACTIVE IN PHASE 4.1)
- **ID:** `WEIGHT_TREND_CHANGE`
- **Category:** `body`
- **Required Inputs:** `unifiedTimeline` (with weight)
- **Evidence Window:** Last 7 days vs previous 7 days
- **Minimum Observations:** Current window requires >= 2 valid weight observations. Previous window requires >= 1 valid weight observation.
- **Evaluation Logic:** 
  - Compare current window average vs previous window average.
  - Null/missing weights are ignored.
  - Explicit zero is technically valid data but weight domain constraints should already prevent invalid zero weight.
  - Stable difference threshold is explicitly set (e.g., diff < 0.5kg is considered stable).
- **Output Type:** `info`
- **Explicit non-trigger:** Weight is stable (diff < 0.5kg). 
- **Important:** No goal should be required merely to detect a weight trend. Do not make Weight Trend disappear simply because no active goal exists. The rule should describe the observed trend without making an unsupported claim about whether the trend is "good" or "bad". If goal context is later needed for interpretation, defer that to the Goal Progress rule.

**PHASE 4.2+ CANDIDATES (Deferred from 4.1):**

### B. Goal Progress (Phase 4.2+ Candidate)
- Deferred because Phase 4 v1 has NO persistence, meaning we cannot avoid repeatedly emitting the same milestone on every dashboard request. Do not invent historical milestone state. Must be deferred until a deterministic non-spam approach is available.

### C. Workout Consistency (Phase 4.2+ Candidate)
- **Required Inputs:** `unifiedTimeline` (workoutCompleted)
- **Data Sufficiency:** BOTH comparison periods (current 7 days vs previous 7 days) must contain sufficient valid observations (e.g., >= 1 valid log in each). A missing current period must NOT become zero and must NOT produce a "workout decline" insight.
- **Null Safety:** null/missing = untracked. false = explicitly skipped. true = completed.

### D. Nutrition Consistency (Phase 4.2+ Candidate)
- **Nutrition Target Source:** The active plan calorie target (`activePlan.calories`). Do NOT use a profile target field. No active plan = no calorie adherence insight. Never invent or estimate a target.

**FUTURE RULES:**
- Protein Consistency, Water Consistency, Steps Trend, Sleep Consistency.

## 7. Confidence Model
A simple deterministic confidence model:
- **high**: Evaluated on substantial, consistent data.
- **medium**: Evaluated on moderate data meeting minimum thresholds.
- **low**: Insufficient data (most rules will refuse to run).
*Rule: Do not generate low-confidence insights. Minimum data thresholds must guarantee at least medium confidence.*

## 8. Timestamp Semantics
**Timestamp** means: `evidence-period end`.
It is the date (YYYY-MM-DD) of the latest historical record used to satisfy the rule's evidence. This strictly grounds the insight in actual logged history.

## 9. Deterministic Ordering
When multiple insights trigger, they are sorted before returning to the UI:
1. `priority` (ascending: 1 is highest)
2. `category` (alphabetical ascending)
3. `id` (alphabetical ascending)

## 10. UI Integration
- **Component:** `PremiumInsights.jsx`
- **Migration:** Change `insights.map` to expect `StructuredInsight` objects.
- **Styling:** Use `insight.type` (`positive`, `warning`, `info`) to map to icons and colors. Keep the current dashboard layout.

## 11. Legacy Insight Migration
The old `lib/ai/generateInsights.jsx` should **remain temporarily unused**. 
We will create `lib/insights/engine.js` and update `app/(dashboard)/dashboard/page.js` to import and call the new engine. The old file will be left intact for Phase 4 v1 to allow a 1-line rollback.

## 12. Testing Strategy
A pure JS test script (`scripts/test-insights.js`) will mock `unifiedTimeline` arrays.
Tests must verify:
- insufficient data (aborts)
- valid weight trend
- stable weight
- null values handling
- explicit zero handling
- duplicate rule prevention
- No Supabase or Auth mocks required (pure functional testing).

## 13. Persistence Decision
**NO persistence for v1.**
Insights are derived on-the-fly from the `unifiedTimeline` bounded fetch.

## 14. Security / Privacy
- Insights are generated strictly from the authenticated user's bounded timeline.
- No AI APIs are called, meaning zero user data is transmitted to third parties.
- No client-side privileged writes or sensitive data leakage.

## 15. Non-Goals
- No AI / LLM usage
- No adaptive plans or automatic goal modifications
- No health score calculation
- No medical diagnoses or predictive health risk claims (e.g., "This prevents diabetes")
- No causal claims not established by the data (e.g., "Your reduced workouts will stall your progress")
- No guaranteed outcomes ("will cause", "will prevent", etc.)
- No wearables integration
- No database schema changes or insight persistence
- No giant rules framework (e.g., Drools, json-rules-engine)
- No dashboard redesign
- No broad refactor

## 16. Exact Implementation Scope
Phase 4.1 implements ONLY the structured insight contract, engine runner, UI rendering, tests, and ONE active rule (Weight Trend).

Exact files to create/modify in Phase 4.1:
- `lib/insights/engine.js` (NEW)
- `lib/insights/rules.js` (NEW - contains only Weight Trend)
- `scripts/test-insights.js` (NEW)
- `components/dashboard/PremiumInsights.jsx` (MODIFY - render structured insights)
- `app/(dashboard)/dashboard/page.js` (MODIFY - replace old insight call with new engine)

## 17. Rollback Strategy
Because no database changes or persistent writes occur, rollback is entirely code-based. Reverting `page.js` and `PremiumInsights.jsx` to commit `2181aeb` instantly restores the old string-based insight behavior.

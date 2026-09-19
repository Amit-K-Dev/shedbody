# Phase 4 - Deterministic Insight Engine Audit

## 1. Current State Analysis

**File Location:** `lib/ai/generateInsights.jsx`
**UI Component:** `components/dashboard/PremiumInsights.jsx`

### How it currently works:
- **Inputs:** The `generateInsights` function accepts `weightData`, `goal`, and `bmiLogs`. It currently does **not** accept or process the newly created `unifiedTimeline` (which includes nutrition and lifestyle data).
- **Processing:** It uses simple `if/else` statements on the latest vs previous weight to calculate differences.
- **Output:** It returns an array of unstructured strings. Example: `["🔥 You lost 1.5 kg since last entry.", "⚠ You are in overweight range. Keep pushing."]`.
- **UI Rendering:** The `PremiumInsights.jsx` component maps over these strings. To determine the icon and color (Positive vs Warning vs Neutral), it performs rudimentary string matching (e.g., `insight.toLowerCase().includes("warning")`).

## 2. Architecture Gaps vs. Master Plan

Based on the `shedbody-plan.md` (Phase 4), the current implementation has several critical gaps:

1. **Unstructured Output:** The Master Plan strictly requires structured insights with explicit fields: `Observation`, `Evidence`, `Interpretation`, `Recommendation`, `Confidence`, and `Timestamp`. The current system only returns strings.
2. **Missing Domains (Blind Spots):** The current engine only looks at weight and BMI. It completely ignores workout consistency, calorie intake, protein, steps, sleep, and water, rendering it incapable of providing holistic lifestyle insights.
3. **Fragile UI Logic:** Relying on `string.includes("warning")` in the frontend to determine styling is highly brittle.
4. **No Data Sufficiency Checks:** There is no concept of "confidence" or "data sufficiency" beyond a basic `weightData.length < 2` check. It doesn't check if the user has been consistently logging data before making claims.
5. **No Rule Extensibility:** Rules are hardcoded linearly inside one function, making it difficult to add, test, or isolate new deterministic rules.
6. **File Naming:** The file is named `.jsx` but it is purely a data processing function, not a React component.

## 3. Proposed Deterministic Architecture

To fulfill Phase 4 safely without introducing AI hallucinations, we must build a **Rule-Based Insight Engine**. 

### A. The Core Engine
We should create a structured engine (e.g., `lib/insights/engine.js`) that takes the `unifiedTimeline`, `profile`, and `goals` as input.

### B. The Rule Contract
Every insight rule must follow a strict contract:
```javascript
{
  id: "RULE_WORKOUT_CONSISTENCY_DROP",
  category: "lifestyle",
  priority: 1, // Determines sorting order
  
  // Data Sufficiency Check
  canEvaluate: (unifiedTimeline) => {
    // e.g., check if there are at least 7 days of lifestyle logs
  },
  
  // The actual evaluation logic
  evaluate: (unifiedTimeline, profile) => {
    // If condition is met, return the structured insight
    return {
      observation: "Workout frequency declined.",
      evidence: "4 workouts last week → 2 workouts this week.",
      interpretation: "Your activity levels are dropping, which may stall progress.",
      recommendation: "Try to schedule at least 3 workouts this week.",
      confidence: "high",
      type: "warning" // Replaces the UI string matching
    };
  }
}
```

### C. UI Component Update
`PremiumInsights.jsx` will need to be refactored to consume this array of objects. It will use the `type` field (e.g., `positive`, `warning`, `info`) to assign the correct icons (`TrendingUp`, `AlertCircle`, `ArrowRight`) rather than guessing based on text content.

## 4. Constraints & Rules (Phase 4 Contract)
- **No AI Models:** This engine must be 100% deterministic JavaScript logic. No LLM APIs.
- **Data Sufficiency:** A rule must explicitly return `null` or skip evaluation if the user hasn't logged enough data. Missing data is NOT a failure, it is just "unknown".
- **NULL Semantics:** The engine must respect the previously established rule: `null = untracked`, `0 = explicit zero`, `true/false = explicit boolean`.
- **Pure Functions:** The insight engine must be a pure transformation pipeline (Data In -> Insights Out). No database writes, no RPCs.
- **JavaScript Only:** No TypeScript.

## 5. Next Steps for Implementation (Once Approved)
1. Create the `lib/insights/` directory to house the rules and engine.
2. Define a small set of Phase 4 v1 Rules (e.g., Weight Trend, Workout Consistency, Caloric Adherence).
3. Update `page.js` to pass `unifiedTimeline` into the new engine.
4. Refactor `PremiumInsights.jsx` to render the structured data gracefully.

# Phase 4.5: Context Engine Architecture & Design Specification

## 1. Scope & Objective

This document defines the architectural specification for the **ShedBody AI Context Engine**. 

Following the **ShedBody Master Plan (Sections 26–30)**, the platform prohibits unconstrained database queries or raw record dumping into AI prompts. Instead, the Context Engine acts as an intelligent, deterministic intermediary that:
1. Analyzes user queries to identify intent.
2. Selects only the relevant data domains (Body, Goals, Nutrition, Lifestyle, Protocol, Insights).
3. Bounds the chronological window to prevent prompt bloat and hallucination.
4. Categorizes every datum with explicit provenance (`[OBSERVED]`, `[DERIVED]`, `[TARGET]`, `[DETERMINISTIC INSIGHT]`, `[USER GOAL]`).
5. Strips all personally identifiable information (PII) and raw internal database keys.
6. Emits a compact, validated JavaScript context payload ready for prompt formatting.

This specification prepares the deterministic layer for Phase 5 without modifying existing Phase 4 production logic, calling LLMs, or altering database tables.

---

## 2. Context Engine Architecture & Information Flow

```text
                       [ Authenticated Server Layer ]
                       │ - Fetch profile, timeline, │
                       │   goals, plan, insights    │
                       └───────────────┬────────────┘
                                       │
                                       ▼
                          [ Pure Context Builder ]
                                       │
                       ┌───────────────▼──────────────┐
                       │   1. Question / Intent Router│
                       │   - Categorizes user question│
                       │   - Identifies needed domains│
                       └───────────────┬──────────────┘
                                       │
                                       ▼
                       ┌───────────────┴──────────────┐
                       │   2. Data Domain Selector    │
                       │   - Bounds timeline data     │
                       │     (7d, 14d, 30d max)       │
                       └───────────────┬──────────────┘
                                       │
                                       ▼
                       ┌───────────────┴──────────────┐
                       │   3. Provenance & Sanitize   │
                       │   - Strips PII / UUIDs / notes│
                       │   - Attaches data provenance │
                       │     (OBSERVED / TARGET / etc)│
                       └───────────────┬──────────────┘
                                       │
                                       ▼
                       ┌───────────────┴──────────────┐
                       │   4. Insight Integrator      │
                       │   - Injects verified facts   │
                       │   - Enforces limit of 3-5    │
                       └───────────────┬──────────────┘
                                       │
                                       ▼
                           [ Structured Context Object ]
                                       │
                                       ▼
                             (Future Phase 5 AI)
```

---

## 3. Module Interface Specification

The Context Engine will be housed in `lib/ai/contextBuilder.js` as a pure, testable JavaScript module:

```javascript
/**
 * Assembles a bounded, sanitized, provenance-tagged context payload for AI consumption.
 * Pure function: receives pre-fetched, validated data from the Authenticated Server Layer.
 *
 * @param {Object} params
 * @param {string} params.question - The user's input question or prompt
 * @param {string} params.currentDate - Explicit Server UTC anchor (YYYY-MM-DD)
 * @param {Object} params.profile - User profile data
 * @param {Object} params.activeGoal - Active weight goal
 * @param {Object} params.activePlan - Active protocol plan
 * @param {Array<Object>} params.timeline - Unified daily timeline
 * @param {Array<Object>} params.insights - Deterministic insights
 * @returns {AiContextPayload}
 */
export function buildAiContext({ question, currentDate, profile, activeGoal, activePlan, timeline, insights })
```

---

## 4. Intent Classification & Domain Selection

To ensure minimal and relevant context selection, the engine classifies queries into five canonical intents:

| Intent Key | Sample Questions | Selected Domains | Timeline Window | Target Window |
|---|---|---|---|---|
| `WEIGHT_TREND` | "Why did my weight increase this week?", "Is my weight plateauing?" | Body (Weight), Nutrition (Calories/Water), Lifestyle (Workouts) | 14 days weight<br>7 days nutrition & workouts | Active goal & Active plan |
| `GOAL_PROGRESS` | "How close am I to my goal?", "How much progress have I made toward my goal?" | Goals, Body (Start & Current Weight) | 14 days weight + start entry | Active goal |
| `NUTRITION_ADHERENCE` | "Am I eating enough protein?", "How was my calorie intake?" | Nutrition (Calories, Protein, Water), Plan Targets | 7 days nutrition | Active plan targets |
| `WORKOUT_LIFESTYLE` | "Did I hit my workout targets?", "How is my sleep affecting exercise?" | Lifestyle (Workouts, Steps, Sleep), Protocol Schedule | 7 days lifestyle | Active plan workout |
| `GENERAL_SUMMARY` | "How did I do this week?", "Give me a wellness review" | All Domains (Body, Nutrition, Lifestyle, Goals, Protocol) | 7 days all domains | Active goal & plan |

### Intent Classifier Algorithm (Deterministic Keyword & Pattern Matcher):
For Phase 4.6, the router will use regex and token-based heuristics (zero external API calls):
- **Weight:** `/weight|fat|scale|heavier|lighter|kg|lbs|plateau/i`
- **Goal:** `/goal|target|progress|finish|reach|milestone/i`
- **Nutrition:** `/calorie|protein|food|eat|diet|water|macro|nutrition/i`
- **Lifestyle:** `/workout|gym|exercise|train|sleep|step|active/i`
- **Fallback:** If ambiguous or multi-faceted, defaults to `GENERAL_SUMMARY` with a strict 7-day bound.

---

## 5. Domain Selectors & Bounding Logic

### 5.1 Body Domain
- **Window:** 14 calendar days (`[currentDate - 13, currentDate]`).
- **Fields Extracted:** `entry_date`, `weight`, `body_fat`.
- **Exclusions:** `notes` field is explicitly excluded to eliminate unstructured PII leak risk.
- **Analytics Attached:** Delta from 14 days ago, 7-day moving average, rate of change.

### 5.2 Goals Domain
- **Scope:** Current active weight goal (`getActiveGoal('weight')`).
- **Fields Extracted:** `domain`, `start_value`, `target_value`, `start_date`, `target_date`.
- **Derived Metrics:** `progressPercentage` computed via `calculateGoalProgress`.
- **Null Handling:** If no active goal exists, `goal` is set to `null` with `hasActiveGoal: false`.

### 5.3 Nutrition Domain
- **Window:** 7 calendar days (`[currentDate - 6, currentDate]`).
- **Fields Extracted:** `log_date`, `calories`, `protein`, `water_ml`.
- **Derived Metrics:** 7-day average calories, 7-day average protein, daily adherence flag against active plan targets.

### 5.4 Lifestyle Domain
- **Window:** 7 calendar days (`[currentDate - 6, currentDate]`).
- **Fields Extracted:** `log_date`, `workout_completed`, `steps_count`, `sleep_hours`.
- **Derived Metrics:** Total workouts in 7 days, average daily step count, average nightly sleep.

### 5.5 Active Plan Domain
- **Scope:** Active protocol (`plans.is_active === true`).
- **Fields Extracted:** `goal`, `level`, `diet_type`, `calories`, `protein`, protocol name, meal summary.
- **Exclusions:** Raw internal meal IDs and unparsed database JSON trees.

### 5.6 Deterministic Insights Domain
- **Scope:** Outputs of `generateStructuredInsights(unifiedTimeline, profile, plan, goal, currentDate)`.
- **Filtering:** Only insights relevant to the detected intent are passed, preserving their `observation`, `evidence`, and `confidence`.
- **Limit:** Enforce a hard upper bound of 3–5 insights passed to the AI to prevent context bloat and over-analysis.

---

## 6. Data Provenance & Structure

Every data field in the payload carries an explicit structural provenance tag to prevent the LLM from confusing prescribed targets with user logs:

```javascript
{
  "metadata": {
    "currentDate": "2026-09-20",
    "intent": "WEIGHT_TREND",
    "windowDays": 14
  },
  "provenance": {
    "userGoal": {
      "type": "USER_GOAL",
      "targetWeightKg": 70.0,
      "startWeightKg": 78.0,
      "calculatedProgressPercent": 50
    },
    "protocolTarget": {
      "type": "TARGET",
      "dailyCalories": 2100,
      "dailyProteinGrams": 150
    },
    "observations": [
      {
        "type": "OBSERVED",
        "date": "2026-09-19",
        "weightKg": 74.0,
        "calories": 2080,
        "proteinGrams": 145,
        "workoutCompleted": true
      }
    ],
    "derivedAnalytics": [
      {
        "type": "DERIVED",
        "metric": "weightChange",
        "value": -0.4,
        "unit": "kg",
        "calculation": { "method": "delta", "window": "14d" }
      },
      {
        "type": "DERIVED",
        "metric": "calorieAdherence",
        "value": 98.5,
        "unit": "%",
        "calculation": { "method": "percentage_of_target", "window": "7d" }
      }
    ],
    "deterministicInsights": [
      {
        "type": "DETERMINISTIC_INSIGHT",
        "id": "NUTRITION_CALORIC_ADHERENCE_POSITIVE",
        "observation": "You are accurately hitting your calorie target.",
        "evidence": "7-day average: 2080 kcal. Target: 2100 kcal (within 10%).",
        "confidence": "high"
      }
    ]
  }
}
```

---

## 7. Privacy, Sanitization & PII Stripping

The Context Engine enforces strict data hygiene before returning any context payload:

```javascript
// Sanitization Rules
const sanitizePayload = (raw) => {
  // 1. Never include authentication or user metadata
  delete raw.user_id;
  delete raw.email;
  delete raw.full_name;
  delete raw.avatar_url;
  
  // 2. Remove database row UUIDs
  raw.timeline?.forEach(entry => delete entry.id);
  
  // 3. Strip open-ended user notes
  raw.timeline?.forEach(entry => delete entry.notes);
  
  return raw;
};
```

---

## 8. AI Safety & Medical Guardrails

### 8.1 System Prompt Safety Directives
The prompt wrapper constructed around the context payload must contain non-negotiable safety guardrails:
1. **Consultation Requirement:** "You are a wellness coach, not a medical doctor. Do not diagnose conditions or prescribe medications."
2. **Eating Disorder Safeguard:** "If the user expresses feelings of guilt about eating or asks for compensatory behaviors (fasting after eating, laxatives), gently redirect to balanced consistency."
3. **Association is Not Causation:** The AI must never convert correlations into causal claims (e.g., "your weight increased because you ate more" is disallowed unless a future validated causal model exists).
4. **No Future Target-Date Predictions:** The AI must not predict when a user will hit a specific target (e.g., "you will hit X kg in Y weeks").
*(Note: Hardcoded safety thresholds like 1200/1500 kcal limits or deficit bounds are removed from the Context Builder; these belong to the future safety layer).* 

### 8.2 Response Schema Verification
The response from the AI must be validated against the schema defined in the audit:
- Must contain `title`, `summary`, `evidence`, `recommendations`, `confidence`.
- Explicitly reject regex-based safety validation for AI output; rely on future structured schema, evidence, and policy validation.

---

## 9. Performance & Bounded Limits

- **Maximum Allowed Window:** 30 days under all circumstances.
- **Default Window:** 7 to 14 days.
- **Execution Overhead:** Target: keep context construction lightweight and in-memory. Performance should be benchmarked after implementation.
- **Token Efficiency:** Complete prompt + context payload is strictly bounded to < 1,000 tokens, well below standard model context windows.

---

## 10. Verification & Test Plan

A dedicated unit test suite will be created in `scripts/test-ai-context.js` covering:
1. **Intent Classification Accuracy:** Verifies sample queries route to correct domains.
2. **Window Bounding:** Asserts that observations outside the lookback window are never included.
3. **PII & UUID Omission:** Verifies no IDs, emails, or notes exist in output.
4. **Provenance Labeling:** Asserts correct assignment of `OBSERVED`, `DERIVED`, `TARGET`, `USER_GOAL`.
5. **Edge Cases:** Missing active goal, missing plan, zero logged entries, invalid Gregorian date strings.

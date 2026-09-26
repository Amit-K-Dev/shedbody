# Phase 4.9: AI Coach Response Contract

## 1. AI Coach Response Type
The AI Coach response type is a CLOSED ENUM, explicitly distinct from the Phase 4 deterministic insight enum (`info | warning | positive`). It defines the conceptual coaching stance of the response.

**Allowed Values:**
- `"analysis"`: Neutrally explains observed data, trends, or progress based on the validated context.
- `"correction"`: Identifies a negative deviation from the protocol or goal and provides corrective guidance.
- `"motivation"`: Provides positive reinforcement, celebrating consistency, adherence, or milestones.
- `"action_plan"`: Offers forward-looking recommendations ONLY. Must not permit predictions, guarantees, ETA calculations, or claims that an action will produce a specific future outcome.
- `"educational"`: Answers a general question with factual knowledge (grounded in safety policies) without relying on user-specific metrics.

## 2. Exact AI Coach Response Schema
The response payload parsed from the LLM must conform exactly to this schema. Additional fields are FORBIDDEN.

```javascript
{
  type: "analysis" | "correction" | "motivation" | "action_plan" | "educational", // Required
  title: string, // Required. Max 100 chars.
  summary: string, // Required. Max 500 chars.
  evidence: EvidenceReference[], // Required. Can be an empty array [].
  recommendations: string[], // Required. Max 3 items. Max 200 chars each. Can be empty [].
  confidence: "high" | "medium", // Required.
  safetyNote: string | null // Required key. Must be string (max 200 chars) or null.
}
```

## 3. Exact EvidenceReference Contract
To prevent hallucinations and PII exposure, the AI must provide machine-verifiable references to the `AiContextPayload` for any user-specific factual claims. Generic `id` keys and database identifiers are explicitly forbidden.

The schema uses a discriminated structure based on `sourceType`:

**A. Schema for Metrics and Goals**
```javascript
{
  sourceType: "OBSERVATION" | "DERIVED_ANALYTIC" | "USER_GOAL" | "PROTOCOL_TARGET", 
  date: string | null, // Required ONLY if sourceType is "OBSERVATION" (Format: YYYY-MM-DD)
  key: string, // Required. Must be from the strict allowlist defined below.
  assertedValue: number | string | boolean | null // Required. The exact value to match in the context.
}
```

**B. Schema for Deterministic Insights**
```javascript
{
  sourceType: "DETERMINISTIC_INSIGHT",
  insightId: string // Required. The exact string ID of the matched insight.
}
```

**Strict Key Allowlist (derived exactly from Phase 4.6 AiContextPayload):**
- **`OBSERVATION`**: `"weightKg"`, `"bodyFatPercent"`, `"calories"`, `"proteinGrams"`, `"waterMl"`, `"workoutCompleted"`, `"steps"`, `"sleepHours"`
- **`DERIVED_ANALYTIC`**: `"averageWeight"`, `"weightChange"`, `"weightRateOfChange"`, `"averageCalories"`, `"calorieAdherence"`, `"averageProtein"`, `"proteinAdherence"`, `"totalWorkouts"`, `"averageSteps"`, `"averageSleep"`
- **`USER_GOAL`**: `"domain"`, `"startValue"`, `"targetValue"`, `"startDate"`, `"targetDate"`, `"progressPercent"`
- **`PROTOCOL_TARGET`**: `"goal"`, `"level"`, `"dietType"`, `"dailyCalories"`, `"dailyProteinGrams"`

## 4. Grounding Rules

### A. Evidence-Reference Matching (Deterministic Verification)
The **Grounding Validator** implements strict equality matching (`===`) against the actual Phase 4.6 `AiContextPayload`:
- **`OBSERVATION`**: Matches if `context.observations` contains an entry where `date === ref.date` and `entry[ref.key] === ref.assertedValue`.
- **`DERIVED_ANALYTIC`**: Matches if `context.derivedAnalytics` contains an entry where `metric === ref.key` and `value === ref.assertedValue`.
- **`USER_GOAL`**: Matches if `context.userGoal` exists and `context.userGoal[ref.key] === ref.assertedValue`.
- **`PROTOCOL_TARGET`**: Matches if `context.protocolTarget` exists and `context.protocolTarget[ref.key] === ref.assertedValue`.
- **`DETERMINISTIC_INSIGHT`**: Matches if `context.deterministicInsights` contains an entry where `id === ref.insightId`.

**Failure**: If ANY `EvidenceReference` fails to match the provided context exactly, the entire response fails Grounding Validation.

### B. Claim Grounding (Contractual Constraint)
Because a deterministic JavaScript validator cannot reliably parse arbitrary natural-language prose to verify if a summary perfectly aligns with the `evidence` array (without invoking an LLM-as-judge, which is forbidden), the system enforces claim grounding through strict contractual constraints:
- **Constraint**: The LLM prompt must strictly forbid the generation of user-specific factual claims (metrics, dates, goals) in the `summary` or `recommendations` that are not explicitly represented in the returned `evidence` array.
- **Limitation**: The Grounding Validator deterministically verifies the *validity* of the evidence array, but it cannot deterministically verify the *prose*. The architecture explicitly acknowledges that evidence matching does not provide perfect hallucination prevention for natural-language synthesis. 
- **Unsupported claim**: If the AI attempts to make a factual claim without a matching evidence reference, it violates the prompt constraints. 
- **Forbidden content**: Predictive ETA/target-date forecasting (e.g., "You will reach your goal by Oct 15"), guarantees, or medical diagnoses are strictly forbidden and violate Safety/Grounding rules.

## 5. Safety Fallback Contract
If the **Safety Validator** fails:
- The provider response MUST be discarded entirely.
- Raw provider output MUST NEVER reach the client.
- Internal safety rules MUST NEVER reach the client.
- **Fallback Behavior**: The server must return a controlled `HTTP 422 Unprocessable Entity` with the exact JSON payload: 
  `{ "error": "AI_SAFETY_VIOLATION" }`.
- *(Deferred/Future)*: The frontend UI will catch this specific error code and render a static safety fallback card. Implementing this UI is not a Phase 4.9 dependency.

## 6. Validation Failure Taxonomy
The server MUST adhere to these deterministic status codes:
- **Authentication failure**: `HTTP 401 Unauthorized`.
- **Request validation failure**: `HTTP 400 Bad Request` (e.g., question too long, empty).
- **Context Builder failure**: `HTTP 500 Internal Server Error` (Controlled server failure; no AI provider call made).
- **Context Validator failure**: `HTTP 500 Internal Server Error` (Controlled server failure; no AI provider call made).
- **Provider failure**: `HTTP 502 Bad Gateway` (Network error, timeout).
- **Response schema failure**: `HTTP 500 Internal Server Error` (Malformed JSON, missing fields, or schema constraint violation from the LLM).
- **Grounding failure**: `HTTP 422 Unprocessable Entity` with `{ "error": "AI_GROUNDING_VIOLATION" }` (Evidence references failed to match context).
- **Safety failure**: `HTTP 422 Unprocessable Entity` with `{ "error": "AI_SAFETY_VIOLATION" }`.

# Phase 4.7: Context Validator & AI Gateway Schema Design

## 1. Scope & Objective

This document defines the architectural specification for the **ShedBody Context Validator**, to be implemented in Phase 4.7.

Based on the Phase 4.7 audit, the `Context Builder` successfully acts as a pure transformation layer. However, the `AiContextPayload` it emits must be strictly validated before traversing to the external AI Gateway. Unvalidated payloads pose a risk of hallucination or PII leakage if upstream database shapes change. 

The **Context Validator** acts as a structural firewall. It enforces a strict schema on the `AiContextPayload`, guaranteeing its shape, types, and bounds. 

The validation contract is defined independently of the validation library. The final implementation will either be a pure JavaScript validator using explicit allowlists/contracts, or a schema validation library if there is a demonstrated benefit.

---

## 2. Context Validator Architecture

### 2.1 Concise Validation Pipeline

```text
Context Builder
→ structural validation
→ recursive sensitive-content validation
→ approved payload
→ Future AI Gateway

Invalid at any stage
→ reject
→ no partial payload
→ no AI call
```

### 2.2 Responsibility Split
**Context Builder:**
- selects relevant data
- bounds temporal windows
- derives metrics
- sanitizes inputs
- constructs the `AiContextPayload`

**Context Validator:**
- validates structure
- validates types
- validates allowed fields
- validates bounds
- validates exact Gregorian dates
- validates finite numbers
- rejects contract violations
- does NOT fetch data
- does NOT sanitize by silently dropping fields
- does NOT mutate the payload
- does NOT call AI

**Future AI Gateway:**
- receives ONLY a validator-approved payload
- handles LLM/provider interaction
- performs future output schema validation
- executes future safety policy validation

### 2.3 Principles
- **True Fail-Closed Validation**: If the payload contains unexpected, undocumented, or malformed fields, validation immediately fails. 
- **No Silent Stripping**: The validator does NOT sanitize or silently drop unexpected fields. Unexpected field → Validation failure → Context rejected → Future AI Gateway is NOT called.
- **Strict Boundary Enforcements**: Strictness applies recursively to every object boundary (root payload, metadata, profile, provenance, userGoal, protocolTarget, observation, derivedAnalytics, calculation, deterministicInsight).

---

## 3. The `AiContextPayload` Validation Contract

The validator will strictly enforce the following structural contract, represented here in JavaScript-oriented pseudocode.

### 3.1 Date & Temporal Validation Rules
Regex alone is insufficient. A value such as "2026-99-99" matches a format but is not a valid date.
- Must be exact `YYYY-MM-DD` format.
- Must be a real Gregorian calendar date.
- Impossible dates (e.g., Feb 30) must be rejected.
- No timezone conversion.
- No system-date fallback.

**Future-Date Semantics:**
- `metadata.currentDate` is the strict reference date.
- `Observation.date` MUST be `<= metadata.currentDate`.
- `UserGoal.startDate` MUST be `<= metadata.currentDate`.
- `UserGoal.targetDate` MAY be in the future (because it represents a target). The validator must not reject a legitimate future `UserGoal.targetDate`.

### 3.2 UUID/PII Content Protection (Recursive Rejection)
The validator must perform sensitive-content validation recursively on every level of the payload. It must reject (not sanitize) both:
- **Forbidden/Unknown Field Names:** `user_id`, `email`, `notes`, and any database-ID/UUID field names.
- **Sensitive Content Injection:** Any otherwise allowed string fields containing UUID-shaped values, email-shaped values, or raw database records.

This is a strict rejection mechanism. The validator must never silently strip the content.

### 3.3 Finite Number Rules
All numeric fields crossing the validator boundary must reject:
- `NaN`
- `Infinity`
- `-Infinity`
Explicitly, valid zero (`0`) must be preserved when the domain permits it. The validator must not silently coerce invalid numeric values.

### 3.4 Root Payload Schema
```javascript
{
  metadata: MetadataObject,
  profile: ProfileObject | null,
  userGoal: UserGoalObject | null,
  protocolTarget: ProtocolTargetObject | null,
  observations: Array<ObservationObject>,
  derivedAnalytics: Array<DerivedAnalyticsObject>,
  deterministicInsights: Array<DeterministicInsightObject> // Must not exceed 5
}
// Any undocumented root or nested field MUST trigger failure.
```

### 3.5 Metadata Schema
```javascript
{
  currentDate: String, // Valid YYYY-MM-DD Gregorian date
  intent: String, // Must be "WEIGHT_TREND", "GOAL_PROGRESS", "NUTRITION_ADHERENCE", "WORKOUT_LIFESTYLE", or "GENERAL_SUMMARY"
  windowDays: Number // Finite Integer, between 1 and 30
}
```

### 3.6 Profile Schema
```javascript
{
  heightCm: Number | null, // Finite positive number or null
  currentWeightKg: Number | null // Finite positive number or null
}
```

### 3.7 Provenance Objects

**Target Schema (Active Plan)**
```javascript
{
  type: "TARGET",
  goal: String | null,
  level: String | null,
  dietType: String | null,
  dailyCalories: Number | null, // Finite
  dailyProteinGrams: Number | null // Finite
}
```

**User Goal Schema**
```javascript
{
  type: "USER_GOAL",
  domain: String | null,
  startValue: Number | null, // Finite
  targetValue: Number | null, // Finite
  startDate: String | null, // Valid YYYY-MM-DD (<= metadata.currentDate)
  targetDate: String | null, // Valid YYYY-MM-DD (may be future)
  progressPercent: Number | null // Finite
}
```

**Observation Schema (Timeline)**
```javascript
{
  type: "OBSERVED",
  date: String, // Valid YYYY-MM-DD (<= metadata.currentDate)
  weightKg: Number | null, // Finite
  bodyFatPercent: Number | null, // Finite
  calories: Number | null, // Finite
  proteinGrams: Number | null, // Finite
  waterMl: Number | null, // Finite
  workoutCompleted: Boolean | null,
  steps: Number | null, // Finite
  sleepHours: Number | null // Finite
}
```

**Derived Analytics Schema**
```javascript
{
  type: "DERIVED",
  metric: String,
  value: Number, // Finite
  unit: String,
  calculation: {
    method: String,
    window: String
  }
}
```

**Deterministic Insight Schema**
```javascript
{
  type: "DETERMINISTIC_INSIGHT",
  id: String,
  category: String,
  observation: String,
  evidence: String,
  interpretation: String,
  recommendation: String,
  confidence: String // Must be "high" or "medium"
}
```

---

## 4. Implementation Plan for Phase 4.7

To preserve the boundary between pure context building and context validation, we will implement the validator as a separate module in `lib/ai/contextValidator.js`.

### 4.1 Validator Test Contract

The `scripts/test-ai-validator.js` suite must enforce the following explicit failure and success contracts:

- valid payload passes
- missing required field fails
- wrong type fails
- unknown root field fails
- unknown nested field fails
- invalid Gregorian date fails
- malformed date fails
- future date according to payload contract where applicable (e.g. `Observation.date > currentDate` fails)
- legitimate future date passes (e.g. `UserGoal.targetDate > currentDate`)
- `NaN` fails
- `Infinity` fails
- `-Infinity` fails
- zero remains valid
- `null` remains valid where contract allows it
- `windowDays < 1` fails
- `windowDays > 30` fails
- insights > 5 fails
- invalid intent fails
- invalid provenance type fails
- malformed derived calculation fails
- `user_id` injected anywhere fails
- `email` injected anywhere fails
- `notes` injected anywhere fails
- UUID/database IDs injected anywhere fail
- UUID-shaped strings inside valid fields fail
- email-shaped strings inside valid fields fail
- input object remains unchanged
- valid payload returns deterministic validated output

---

## 5. Security & Safety Implications

By implementing the `Context Validator` with a true fail-closed strategy recursively enforcing all object boundaries and string contents, the AI Gateway is completely protected from unhandled data evolution in the upstream database. If a bug ever included a new `medical_history` field, or allowed an un-sanitized ID, the validator will aggressively reject the payload.

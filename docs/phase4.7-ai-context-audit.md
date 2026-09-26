# Phase 4.7: AI Context Architecture Audit

## 1. Executive Summary

This document audits the Phase 4.6 implementation of the `Context Builder` (`lib/ai/contextBuilder.js`) against the requirements established in Phase 4.5. The objective is to determine if the resulting `AiContextPayload` is secure, deterministic, and structurally sound enough to serve as the strict input contract for a future AI Gateway.

The audit confirms that the Phase 4.6 Context Builder successfully fulfills the requirements for a pure, deterministic data transformation layer. It successfully bounds temporal data, categorizes intent, strips Personally Identifiable Information (PII), and labels data provenance.

---

## 2. Current Phase 4.6 Implementation

The `Context Builder` receives pre-fetched, validated data (profile, active goal, active plan, timeline, insights) and a `currentDate`, and returns a bounded `AiContextPayload`.
- **Pure Function**: It has zero side-effects, zero network calls, and zero database imports.
- **Test Coverage**: Verified by 167 behavioral tests in `scripts/test-ai-context.js`.

---

## 3. AiContextPayload Contract Audit

- **Match to Design**: The output strictly matches the Phase 4.5 `AiContextPayload` schema.
- **Completeness**: All requested fields (metadata, profile, userGoal, protocolTarget, observations, derivedAnalytics, deterministicInsights) are present and correctly populated.
- **Exposure**: The payload uses explicit whitelisting (e.g., `buildSanitizedProfile`) to prevent unnecessary field exposure. No raw database rows are leaked.

---

## 4. Intent Audit

- **Determinism**: Five intents (`WEIGHT_TREND`, `GOAL_PROGRESS`, `NUTRITION_ADHERENCE`, `WORKOUT_LIFESTYLE`, `GENERAL_SUMMARY`) are implemented using deterministic regex token matching.
- **Ambiguity Handling**: Safe fallback to `GENERAL_SUMMARY` for null, empty, or multi-domain questions.
- **Prediction Prevention**: Questions requesting predictions (e.g., "When will I reach 70kg?") correctly route to `GOAL_PROGRESS`. The output payload computes `progressPercent` but contains no predictive timestamps or future ETAs.

---

## 5. Temporal/Window Audit

- **Date Validation**: Strict Gregorian date checking via `isValidDate`. Rejects impossible dates (e.g., Feb 30, Month 13) and missing dates without falling back to a system clock.
- **Future-Date Semantics**: `metadata.currentDate` is strictly used as the reference date. The audit confirms that `Observation.date` and `UserGoal.startDate` are `<= metadata.currentDate`. The payload correctly allows `UserGoal.targetDate` to be a legitimate future date. No system time fallback is used.
- **Bounding**: Timeline is securely bounded to 7-day and 14-day inclusive windows ending exactly on `currentDate`.
- **Sparse Timelines**: Correctly handles sparse arrays by skipping nulls without synthesizing fake timeline entries.

---

## 6. Provenance Audit

- **Tags**: Every emitted record is strictly tagged with its origin (`OBSERVED`, `DERIVED`, `TARGET`, `USER_GOAL`, or `DETERMINISTIC_INSIGHT`).
- **Derived Explainability**: Derived metrics explicitly declare `metric`, `value`, `unit`, and `calculation` (including `method` and `window`), allowing the future AI to explain the math rather than hallucinate it.

---

## 7. Privacy Audit

- **PII Stripping**: The Context Builder explicitly drops `user_id`, `email`, `full_name`, and `avatar_url`.
- **UUIDs**: All internal database UUIDs are dropped.
- **Unstructured Data**: `notes`, raw workout JSON, and raw meal JSON are rigorously stripped.
- **Validator Escalation (UUID/PII Content Protection)**: The upcoming Context Validator must escalate this from sanitization to strict rejection. If forbidden fields (`user_id`, `email`, `notes`, database IDs) or sensitive content embedded inside allowed strings (UUID-shaped or email-shaped values) are detected, the payload must be recursively rejected, never silently stripped.

---

## 8. Determinism Audit

- **Input/Output**: Identical inputs reliably produce identical outputs.
- **Isolation**: Zero dependencies on `Date.now()`, `Math.random()`, or network state.

---

## 9. Insight Integration Audit

- **Filtering**: Correctly filters the existing deterministic insights down to only those categories relevant to the detected intent.
- **Limits**: Strictly caps at a maximum of 5 insights.
- **Confidence Contract**: Matches the Phase 4 deterministic insight contract (allowing only "high" and "medium", rejecting "low").
- **Deterministic Insight Shape**: The Context Builder does not expose a reduced insight shape; it intentionally outputs the full structured deterministic insight shape (`id`, `category`, `observation`, `evidence`, `interpretation`, `recommendation`, `confidence`). The validator must strictly validate this full shape.

---

## 10. Safety Boundary Audit

- **Medical / Dangerous Advice**: The Context Builder itself makes zero medical, dietary, or behavioral claims; it strictly passes pre-computed deterministic facts and observations.
- **Association ≠ Causation**: The payload provides correlations (e.g., average calories vs weight change) but asserts no causal links.
- **Unsupported Prediction**: Future dates (except explicit user goals) are entirely excluded from the logic, guaranteeing the LLM cannot base a prediction on fabricated context.

---

## 11. Context Size Audit

- **Bounded Payload**: The payload is bounded by intent-specific windows, field whitelisting, and a maximum of five deterministic insights.
- **Duplication/Domains**: Domains not required by the user's intent are aggressively pruned, saving tokens and reducing distraction for the future LLM.

---

## 12. Future AI Gateway Boundary

- **Suitability**: The `AiContextPayload` is highly suitable as a strict input contract.
- **Remaining Needs**: The future gateway still requires output schema validation (e.g., verifying the LLM returns the required JSON structure) and post-generation safety checks.

---

## 13. Findings

- **INFO**: The strictness of the Context Builder is an asset, but it implies the boundary between it and the AI Gateway should be strongly typed.

---

## 14. Readiness Assessment

The Phase 4.6 Context Builder is **FULLY READY** to serve as the data generation layer for the Context Engine. 

---

## 15. Recommended Architecture & Next Implementation Slice

### Architectural Decision: Context Validator

While the Context Builder is pure, it does not strictly validate its own output schema against external corruption or unexpected server loader mutations. A Context Validator acts as a strict structural firewall before the AI Gateway.

**Implementation Independence:**
Phase 4.7 must define the validation contract independently of any validation library. The implementation decision will be:
- either a pure JavaScript validator using explicit allowlists/contracts
- or a schema validation library if there is a demonstrated benefit

No dependency will be added or installed during this documentation phase.

### Responsibility Split
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
- does NOT mutate payload
- does NOT call AI

**Future AI Gateway:**
- receives ONLY validator-approved payloads
- handles LLM/provider interaction later
- performs future output schema validation
- handles post-processor safety policy validation

### Failure Contract

The validator enforces a concise, fail-closed validation pipeline:

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

# Adaptive Nutrition Adjustment Policy

## 1. Purpose
Define the policy boundary between:
Eligibility → Adjustment → New Plan

## 2. Scope
Explicitly state what this policy does NOT implement.
This document outlines the proposed deterministic logic for translating an eligibility state into a concrete nutrition adjustment.
This policy does NOT implement:
- Application logic or engine calculations.
- Modifications to existing `plans` schema or database migrations.
- AI-based decision-making.
- Plan creation or insertion mechanisms.
- Actual numeric magnitudes, floors, or ceilings unless explicitly stated as an existing authoritative fact.

## 3. Existing authoritative inputs
The following are existing facts and inputs currently available in the system:
- **active plan**: Stored in the `plans` table (`is_active = true`), containing current targets (`calories`, `protein`).
- **active weight goal**: Managed by `lib/goals.js` (`domain = 'weight'`, `status = 'active'`).
- **current calories**: Deterministically generated targets derived from `lib/calculators/calorie.jsx`.
- **current protein**: Deterministically generated targets based on weight and goal.
- **eligibility result**: Output of the Adaptive Eligibility Engine (`lib/plans/eligibilityEngine.js`).
- **goal direction**: Implicit from the active weight goal (`target_value` vs `start_value`).
- **adherence**: Calorie adherence computed via `contextBuilder.js` over a 7-day window.
- **weight trend**: `weightRateOfChange` derived via `lib/analytics/engine.js`.

## 4. Eligibility → Adjustment mapping

| Eligibility state | Automatic adjustment? | Policy status | Notes |
|---|---|---|---|
| COOLDOWN_ACTIVE | No | EXISTING FACT | Engine blocks adjustment for 7 days after creation. |
| INSUFFICIENT_DATA | No | EXISTING FACT | Fails closed; no adjustment. |
| LOW_ADHERENCE | UNRESOLVED | UNRESOLVED — REQUIRES APPROVAL | Determine if targets should decrease, hold, or break. |
| ELIGIBLE_PLATEAU | Yes (candidate) | UNRESOLVED — REQUIRES APPROVAL | Adjustment direction/magnitude pending approval. |
| ON_TRACK | No | PROPOSED POLICY — REQUIRES APPROVAL | System should not adjust targets if progress is steady. |
| UNSUPPORTED_GOAL | No | EXISTING FACT | Fails closed; no adjustment. |

## 5. Adjustment direction
**PROPOSED POLICY — REQUIRES APPROVAL**

Candidate semantics for adjustments based on state and goal:
- **weight-loss goal + plateau/regression** → candidate calorie decrease
- **weight-gain goal + plateau/regression** → candidate calorie increase
- **ON_TRACK** → no adjustment

These are proposed and not yet final.

## 6. Adjustment magnitude
**UNRESOLVED DECISION**

The exact magnitude of calorie adjustment when a plateau is detected is completely unresolved. Possible approaches exist but NO decision has been made:
- fixed kcal step
- percentage-based adjustment
- another explicitly approved deterministic method

## 7. Calorie safety boundaries
**EXISTING FACT:**
- 1200 kcal is an existing authoritative floor in the initial calorie calculator (`lib/calculators/calorie.jsx`).

**UNRESOLVED DECISION:**
- **existing initial-plan floor** vs **future adaptive-adjustment safety policy**: It is unresolved whether the existing 1200 kcal initial-plan floor will serve as the absolute floor for adaptive adjustments, or if gender-specific/other safety limits will be introduced.
- **Calorie ceiling**: There is no authoritative ceiling; a ceiling policy must be defined and approved.

## 8. Protein behavior
**EXISTING FACTS:**
- Existing protein targets are deterministic.
- No authoritative protein safety floor/ceiling currently exists.

**UNRESOLVED DECISION:**
- Adaptive protein behavior is unresolved.

## 9. Plan versioning
**EXISTING FACTS:**
- no `plan_versions` table currently exists.
- `upsert_plan` creates a new `plans` row.
- old plan becomes inactive.
- new plan becomes active.

**UNRESOLVED DECISION:**
- reuse existing `plans`/`upsert_plan` structure for adaptive plan tracking
OR
- introduce explicit `plan_versions` table

## 10. Cooldown / repeated adaptation
**EXISTING FACTS:**
- A 7-day cooldown is enforced by the Eligibility Engine.

Clearly distinguish:
- **eligibility protection**: (Engine level)
- **adjustment policy**: (Math/semantics)
- **plan creation/versioning**: (Database level)

No additional cooldown logic should be added to the adjustment policy unless explicitly approved.

## 11. Idempotency
**UNRESOLVED DECISION**

The requirement: The same evaluation should not create multiple adaptations.
The mechanism for ensuring idempotency is unresolved and must be decided/verified before implementation.

## 12. Explainability
**UNRESOLVED DECISION**

An adaptation result must eventually expose explainable data to the user and AI context. At minimum, the schema must consider:
- previous calorie target
- new calorie target
- adjustment direction
- adjustment amount
- eligibility reason
- supporting evidence
- goal direction
- cooldown state

Final schema is unresolved.

## 13. Determinism
**APPROVED POLICY DECISION**

The future adjustment policy must be:
- deterministic
- pure where possible
- reproducible from explicit inputs
- free from AI decisions
- free from network-dependent decisions

## 14. Safety boundaries
**UNRESOLVED DECISIONS**

Explicitly list unresolved safety questions:
- adaptive calorie floor
- adaptive calorie ceiling
- protein boundaries
- special populations/medical restrictions
- other health constraints

## 15. Testing requirements
**APPROVED POLICY DECISION**

Future implementation must test:
- normal cases
- boundary cases
- missing data
- invalid data
- extreme values
- directionality
- repeated adaptation/idempotency
- cooldown interaction
- floor/ceiling behavior once approved

## 16. Decision checklist
Before ANY implementation can begin, the following must be explicitly approved:

- [ ] A. Adjustment direction
- [ ] B. Adjustment magnitude
- [ ] C. Calorie floor for adaptive adjustments
- [ ] D. Calorie ceiling
- [ ] E. Protein behavior
- [ ] F. Plan/version architecture
- [ ] G. Idempotency mechanism
- [ ] H. Explainability contract
- [ ] I. Safety/edge-case handling

## 17. Explicitly deferred
Explicitly deferred from this slice:
- rapid-change adaptation
- AI-based target decisions
- medical/clinical personalization
- new safety limits not already authoritative
- automatic protein adaptation unless separately approved
- `plan_versions` schema unless separately approved

## 18. Implementation gate
**NO IMPLEMENTATION UNTIL:**
- policy decisions are approved
- unresolved numerical rules are resolved
- safety boundaries are explicitly approved
- plan/version strategy is approved
- idempotency behavior is defined
- tests are specified

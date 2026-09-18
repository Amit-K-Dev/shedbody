# Phase 3 Slice 2 — Architecture Audit

## Current State
The ShedBody architecture has successfully completed Phase 1 (Foundation) and Phase 2 (Unified Tracking). The system currently handles user profiles, physical measurements (weight, body fat), and weight goal setting via a mature, hardened RPC-based architecture. 

The application successfully implements the "Recommend" and "Measure" stages of the fitness lifecycle, but currently lacks the "Act" (execution tracking) stage. Users can generate plans and measure their weight, but they cannot currently track their daily adherence to those plans.

## Existing Domain Inventory
The current codebase organizes domains into dedicated directories and modules, primarily within `app/(dashboard)` and `lib/`:
- **Body Metrics:** Handled by `progress_entries` and `lib/storage.js`.
- **Goals:** Handled by `goals` and `lib/goals.js`.
- **Calculators:** Handled by `calculator_results` and `lib/calculations/`.
- **Plans:** Handled by the `plans` table and `app/(dashboard)/plans/page.js`.

## Workout Audit
- **Data Model:** Workouts are generated as static JSON artifacts stored in `plans.workout` (JSONB).
- **Structure:** V2 Elite plans structure workouts as an array of days, each containing a `title`, `target_muscles`, `exercises` (with sets, reps, rest), and `finisher_cardio`.
- **Persistence:** Generated routines are persisted, but historical execution is completely absent.
- **Tracking:** There is no mechanism to log completed workouts, exercises, or sets. No relational tables exist for exercises or workout histories.

## Nutrition Audit
- **Data Model:** Nutrition is generated as static JSON artifacts stored in `plans.meals` (JSONB). High-level targets are stored directly as `plans.calories` (numeric) and `plans.protein` (numeric).
- **Structure:** V2 plans include macro breakdowns (protein, carbs, fats) and specific meal recommendations.
- **Persistence:** Meal recommendations and targets are persisted. Historical intake is absent.
- **Tracking:** There is no mechanism to log daily caloric intake, macros, or consumed meals. No relational tables exist for food entries or nutrition logs.

## Activity / Habit / Recovery Audit
- **Data Model:** Completely absent from the database schema.
- **Tracking:** There are no tables, API routes, or UI components for tracking water intake, steps, sleep, or general habits.
- **Historical:** No persistence exists for daily lifestyle activities.

## Database Audit
The current live schema (public) contains:
- `user_profiles`: Core user metadata and synchronized weight cache.
- `goals`: Canonical source for target metrics (RLS: SELECT only; writes via RPC).
- `progress_entries`: Canonical historical log of body measurements (weight, body fat).
- `plans`: Generated AI recommendations (contains jsonb for workouts/meals).
- `calculator_results`: Snapshots of TDEE/Macro calculator inputs and outputs.
- `badges` / `user_badges`: Gamification system.

**Key Findings:**
No existing table is suitable to absorb daily execution tracking (workouts or nutrition) without violating its domain boundary. `progress_entries` is strictly for body measurements. `plans` is strictly for generated assignments.

## Plans vs Tracking
It is critical to distinguish between *Plans* (what the user is prescribed to do) and *Tracking* (what the user actually did).
- **Generated Plan:** Exists (`plans` table). Represents the recommendation/assignment.
- **User Action / Execution:** Missing (`nutrition_logs` table proposed). Represents the actual user execution/history.

## Architecture Gaps

| Domain | Exists? | Persisted? | Historical? | Canonical Source | Current Limitations |
|--------|---------|------------|-------------|------------------|---------------------|
| Body Metrics | Yes | Yes | Yes | `progress_entries` | Limited to weight/body fat |
| Goals | Yes | Yes | Yes | `goals` | Highly mature and secure |
| Nutrition | Partial | Targets Only | No | `plans` | Cannot log daily macro intake |
| Workout | Partial | Plan Only | No | `plans` | Cannot log completed workouts/sets |
| Activity/Habits | No | No | No | None | Completely absent |
| Sleep/Recovery | No | No | No | None | Completely absent |
| Plans | Yes | Yes | Yes | `plans` | Static blobs; no adherence tracking |
| Calculators | Yes | Yes | Yes | `calculator_results`| Snapshots only |

## Recommended Next Domain
**Recommendation: Nutrition Tracking (Daily Macros & Hydration)**

**Architectural Justification:**
1. **The CICO Loop:** The application's primary goal is weight management (`goals` domain) and weight measurement (`progress_entries`). Weight change is fundamentally driven by Calories In, Calories Out (CICO). Tracking "Calories In" (Nutrition) bridges the gap between the generated `plans.calories` and the resulting `progress_entries.weight`.
2. **Readiness & Reuse:** The `plans` table already extracts `calories` and `protein` into top-level numeric columns. A daily nutrition log can immediately query the active plan to establish the daily target baseline, enabling immediate UI progress bars and adherence analytics.
3. **Simplicity over Workout:** A robust workout tracker requires a complex relational hierarchy (Workouts -> Exercises -> Sets -> Reps). Nutrition tracking at a macro level (Calories, Protein, Water) can be modeled efficiently in a single, flat time-series table per day, making it the perfect Slice 2 candidate to introduce daily execution tracking without architectural bloat.

## Proposed Slice 2 Architecture Contract
- **Domain Boundary:** Daily Nutrition & Hydration Execution Tracking. This is explicitly NOT a generic daily health table; it will not contain sleep, mood, steps, habits, recovery, workout, or other unrelated fields.
- **Canonical Data Model:** A new `nutrition_logs` time-series table.
- **Minimum Required Entities:**
  ```text
  nutrition_logs
  - id uuid
  - user_id uuid
  - log_date date
  - calories_consumed numeric
  - protein_consumed numeric
  - water_ml numeric
  - target_calories_snapshot numeric nullable
  - target_protein_snapshot numeric nullable
  - created_at
  - updated_at
  ```
- **Historical Target Preservation:** Target snapshots are necessary because historical adherence must not change when the user's active plan changes later. For example, if on Day 1 the active plan target is 2500 kcal and the user logs 2200 kcal, their Day 1 adherence is evaluated against 2500 kcal. If their active plan later changes to 3000 kcal, Day 1's adherence must still reference the historical 2500 kcal target, not 3000. Snapshots ensure this. We will NOT invent historical targets; if no applicable plan target exists, the snapshot fields may remain NULL.
- **Relationship Separation:** `nutrition_logs` should NOT copy the entire plan JSONB. It only snapshots the top-level macro targets to measure execution against.
- **Ownership Model:** Users own their logs. 1:1 relationship between a User and a specific Date (`log_date`).
- **Timezone Management:** `log_date` must be defined as the user's local calendar date, not blindly as a database UTC date. While timezone infrastructure will not be fully implemented yet, the write path must receive or derive the user's intended local date safely.

## Security Requirements
- **Validation:** 
  - `calories_consumed >= 0`
  - `protein_consumed >= 0`
  - `water_ml >= 0`
  - Reject `NaN` and infinite values.
  - Reasonable upper bounds must be defined before implementation.
  - `log_date` must be a valid calendar date.
- **Concurrency:** The table must have a unique `(user_id, log_date)` constraint/index. Writes will use an atomic upsert (`ON CONFLICT (user_id, log_date) DO UPDATE`) to prevent duplicate daily logs under concurrent conditions.
- **Write Path:** Direct client writes (`INSERT`/`UPDATE`/`DELETE`) to the table must be completely denied (`authenticated` and `anon` roles). All writes must occur through a `SECURITY DEFINER` RPC.
- **RPC Constraints:** The RPC must explicitly set `search_path = ''`. `EXECUTE` privileges should only be granted to `authenticated` and `service_role`; `anon` and `PUBLIC` execute access must be denied.
- **RLS:** Must be enabled. `SELECT` restricted strictly to `auth.uid() = user_id`.

## Analytics Implications
This domain-specific table unlocks vital execution analytics, including:
- Daily calorie adherence
- Daily protein adherence
- Hydration adherence
- Weekly/monthly consistency tracking
- Correlation with body-weight history later
*(Note: These analytics will not be implemented in this slice, but the table schema is designed to enable them).*

## Future AI Implications
Historical nutrition execution can eventually be combined with `goals`, `plans`, and `progress_entries` for adaptive AI recommendations. 
*(Note: Adaptive AI will not be implemented in this slice).*

## Explicit Non-Goals
Slice 2 MUST NOT include:
- A generic giant unified health table.
- A granular food database (barcode scanning, ingredient relational mapping).
- Recipe databases or meal-level food catalogs.
- Workout execution tracking (sets/reps).
- Sleep tracking, habit tracking, or mood tracking.
- Wearable integration (Apple Health, Google Fit).
- AI or predictive analytics based on adherence.
- Health scores or automated adaptive plans.
- Profile page redesigns or broader Dashboard redesigns.

## Implementation Readiness
- **High:** The architecture pattern established in Phase 3 Slice 1 (Goals) is highly repeatable. We have proven the Server Action -> RPC -> Secured Table flow.
- No foundational refactoring is required to start this slice.

## Risks
- **Timezone Drift:** `log_date` must be carefully managed to align with the user's local timezone, rather than UTC, to ensure logs accurately reflect their "day".
- **Schema Sprawl:** We must resist the temptation to add `mood`, `sleep`, or `steps` to this table prematurely. Stick strictly to the Nutrition domain boundary.

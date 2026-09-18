# Phase 3 Slice 3 — Lifestyle & Habit Tracking Design

## 1. Purpose
- Track simple daily workout completion.
- Track manually entered daily steps.
- Track daily sleep duration.
- Provide reliable historical data for future analytics and deterministic insights.

## 2. Master Plan Alignment
- Aligns with the Master Plan by fulfilling the data requirements for the Phase 3 Unified Dashboard (specifically the "Workout", "Activity", and "Recovery" sections).
- Adheres to the "Intelligence Over Features" and "Safety First" principles by avoiding premature complexity (like a full relational workout tracker) and relying on a single, deterministic logging model that mirrors the already successful Nutrition Tracking architecture.

## 3. Domain Boundary
- `plans`: Remains the exclusive source of recommended workout plans and configurations (static definitions).
- `lifestyle_logs`: The new source of actual daily lifestyle execution, activity, and recovery data.
- `nutrition_logs`: Remains the exclusive source of calories, protein, and water consumption. (Water and protein must NOT be duplicated into `lifestyle_logs`).
- `progress_entries`: Remains the exclusive source of historical body measurements (weight, body fat).

## 4. Data Model
Proposed `lifestyle_logs` table schema:
- `id`: uuid (Primary Key)
- `user_id`: uuid NOT NULL (Foreign Key to `auth.users`)
- `log_date`: date NOT NULL
- `workout_completed`: boolean NULL
- `steps_count`: integer NULL
- `sleep_hours`: numeric NULL
- `created_at`: timestamp with time zone (default `now()`)
- `updated_at`: timestamp with time zone (default `now()`)
- `UNIQUE(user_id, log_date)`

## 5. Field Semantics
- Strictly one row per user per local calendar date.
- `NULL` explicitly indicates the user did not track that specific metric for the day.
- `workout_completed = false` explicitly means the user recorded the workout as *not completed* (distinct from `NULL`).
- `steps_count` is manually entered by the user in this slice.
- `sleep_hours` is manually entered by the user.

## 6. Local Date / Sleep Date Semantics
- `sleep_hours` represents the sleep duration the user records *for that specific log_date*. The system does not attempt to derive or shift the date from UTC; semantic attribution is purely tied to the user's selected day.
- The browser generates the localized `YYYY-MM-DD` string based on the user's local timezone.
- The server validates the format and validity of the calendar date.
- There is no arbitrary UTC-date substitution at any layer of the stack.

## 7. Validation Rules
The RPC and API must enforce the following bounds to prevent malformed/extreme input while accommodating legitimate data:
- `log_date`: Must be a valid `YYYY-MM-DD` calendar date.
- `workout_completed`: Standard boolean.
- `steps_count`: `0 <= steps_count <= 100000` (Permits extreme edge cases like ultramarathons without allowing integer overflow or garbage data).
- `sleep_hours`: `0 <= sleep_hours <= 24` (Must be numeric, non-negative, finite, and strictly bounded by hours in a day).

## 8. Security / RLS
- RLS enabled on `lifestyle_logs`.
- Authenticated users can `SELECT` only their own rows (`user_id = auth.uid()`).
- No direct client `INSERT`, `UPDATE`, or `DELETE` privileges are granted.
- All writes must go exclusively through a `SECURITY DEFINER` RPC.
- The Next.js API route calls the RPC using the authenticated Supabase server client.
- The RPC strictly binds row ownership to `auth.uid()`.
- Applies the exact same security, `search_path`, and privilege-hardening standards established for `nutrition_logs`.

## 9. RPC Contract
**Signature:** `upsert_lifestyle_log(p_log_date date, p_workout_completed boolean, p_steps_count integer, p_sleep_hours numeric)`
- Performs an atomic `INSERT ... ON CONFLICT (user_id, log_date) DO UPDATE` to prevent race conditions.
- Rejects requests if `auth.uid()` is null.
- Enforces validation bounds internally; rejects invalid or non-finite numeric values.
- Preserves `created_at` on an update, while modifying `updated_at` to `now()`.
- No delete RPC is provided in this slice, as the design does not currently identify a concrete requirement for hard deletion (users can update to `NULL`).

## 10. API Contract
- **Route:** `POST /api/lifestyle`
- **Payload:** `{ log_date, workout_completed, steps_count, sleep_hours }`
- Reuses the established validation pattern (e.g., `isValidCalendarDate`).
- Safely delegates database execution to the `upsert_lifestyle_log` RPC.

## 11. UI Contract
- Implemented as a single, compact dashboard lifestyle tracking card.
- Contains a workout completion toggle, a steps numeric input, and a sleep-hours numeric input.
- Triggered via a unified Save/Upsert action.
- Must remain highly usable on mobile devices to prevent dashboard UI clutter.
- Reuses the established UI component, state management, and fetching patterns from Nutrition tracking.

## 12. Analytics Contract
- This slice solely captures and persists reliable execution data.
- It explicitly prepares the foundation for future analytics fields (workout consistency, activity trend, sleep consistency).
- There is no redesign of the dashboard analytics engine occurring within this slice.

## 13. Explicitly Out of Scope
- Relational workout execution tracking (exercises, sets, reps, weight, rest timers).
- Third-party wearable API integrations (Apple Health, Google Fit).
- Custom user-defined habits.
- AI features, adaptive plans, health scores, or predictive analytics.

## 14. Risks / Trade-offs
- **Sparse Updates:** If the UI sends partial updates (e.g., only updating steps), the API must send the full state of the form to avoid overwriting existing data with `NULL`. The frontend state must fetch the current row and use it as the default form state.
- **Form Density:** Combining three distinct metrics into one card must be handled carefully in UI design to avoid confusing users who only wish to track one metric.

## 15. Rollback Strategy
- Database: A standard `DOWN` migration script can drop the `upsert_lifestyle_log` RPC and `lifestyle_logs` table.
- Codebase: Commits can be cleanly reverted via Git without impacting the stability of `nutrition_logs` or `progress_entries`.

## 16. Test Matrix
1. **authentication**: Unauthenticated requests are rejected at the API and RPC layers.
2. **ownership isolation**: User A cannot read or overwrite User B's lifestyle logs.
3. **first insert**: Creates a new row properly initialized with `created_at`.
4. **same-day upsert**: Successfully updates the existing row, updating `updated_at` while preserving `created_at`.
5. **duplicate prevention**: `UNIQUE(user_id, log_date)` correctly blocks redundant rows.
6. **NULL handling**: Form properly handles recording one metric while explicitly leaving others `NULL`.
7. **false workout completion**: Saving `false` correctly persists boolean `false` (distinct from `NULL`).
8. **zero steps**: Properly saves `0` and differentiates it from `NULL`.
9. **valid sleep values**: Correctly processes decimal numeric values (e.g., `7.5`).
10. **invalid negative values**: Rejects negative steps (`-50`) or negative sleep (`-2`).
11. **non-finite numeric values**: API and RPC reject `NaN` or `Infinity`.
12. **timestamp behavior**: Ensures `updated_at` updates on conflict while `created_at` stays static.
13. **local-date correctness**: Server strictly processes the given YYYY-MM-DD without undesired timezone offset drift.
14. **RLS/direct-write denial**: Standard client library `.insert()` calls are explicitly blocked by RLS policies.
15. **concurrency/upsert behavior**: Parallel simultaneous submissions for the same date successfully resolve to an upsert rather than failing on unique constraint violations.

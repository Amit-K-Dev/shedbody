# Phase 3 Slice 2 — Migration 1 Design

## Objective
Introduce the canonical `nutrition_logs` table for daily Nutrition and Hydration execution tracking, enforcing strict boundaries between plan prescriptions and actual user execution.

## Table Schema
```sql
CREATE TABLE public.nutrition_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    log_date date NOT NULL,
    calories_consumed numeric,
    protein_consumed numeric,
    water_ml numeric,
    target_calories_snapshot numeric,
    target_protein_snapshot numeric,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

## Constraints
- **Primary Key:** `id`
- **Unique Constraint:** `UNIQUE(user_id, log_date)` ensuring exactly one log per user per local calendar date.
- **Check Constraints for Data Integrity:**
  - `calories_consumed >= 0` AND `calories_consumed <= 20000`
  - `protein_consumed >= 0` AND `protein_consumed <= 1500`
  - `water_ml >= 0` AND `water_ml <= 20000`
  - `target_calories_snapshot >= 0`
  - `target_protein_snapshot >= 0`
  - Explicitly reject non-finite numeric values (e.g. `NaN`).

## Foreign Keys
- `user_id` MUST reference `auth.users(id)` with `ON DELETE CASCADE`. This ensures orphan records are impossible and logs are purged if a user deletes their account.

## Indexes
- A unique index on `(user_id, log_date)` is implicitly created by the unique constraint and is sufficient for the upsert and expected date-range queries. No speculative indexes will be added.

## RLS Policies
- Enable Row Level Security (RLS) on `nutrition_logs`.
- **Select Policy:** `FOR SELECT USING (auth.uid() = user_id)`
- Direct `INSERT`, `UPDATE`, and `DELETE` policies will **NOT** be created for authenticated users.

## Table Privileges
- `PUBLIC`: `REVOKE ALL` (no table privileges).
- `anon`: `REVOKE ALL` (no table privileges).
- `authenticated`: `GRANT SELECT` only.
- `service_role`: `GRANT ALL` (full access).

## RPC Contract
```sql
CREATE OR REPLACE FUNCTION public.upsert_nutrition_log(
    p_log_date date,
    p_calories_consumed numeric,
    p_protein_consumed numeric,
    p_water_ml numeric
) RETURNS public.nutrition_logs
```
The RPC must:
- Derive `user_id` securely from `auth.uid()`.
- Validate the caller is authenticated.
- Validate inputs against bounds and reject non-finite values.
- Atomically upsert via `ON CONFLICT (user_id, log_date) DO UPDATE`.
- Establish target snapshots on `INSERT`, but preserve them on `UPDATE`.
- Explicitly set `created_at` on `INSERT`.
- Explicitly set `updated_at` on `INSERT`.
- Explicitly set `updated_at = now()` on `UPDATE`.
- Return the resulting row.

## Validation Rules
- **Nullable:** `NULL` is allowed.
- **Zero:** `0` is allowed.
- **Negatives:** Negative values are rejected.
- **Bounds:** Values above the chosen upper bounds are rejected.
- **Non-finite:** Non-finite numeric values such as `NaN`, `Infinity`, and `-Infinity` are explicitly rejected.
- **Note:** The bounds (Calories: 0–20,000; Protein: 0–1,500g; Water: 0–20,000ml) are input-validation limits to protect the database from overflow or garbage data, **not** recommended consumption targets.

## Target Snapshot Semantics
- **Creation Only:** Snapshots (`target_calories_snapshot`, `target_protein_snapshot`) are established **ONLY** on the first `INSERT`.
- **Preservation:** Subsequent `UPDATE`/upsert calls preserve the existing snapshot values.
- **Missing Plans:** If no applicable active plan exists at the time of first creation, the snapshot remains `NULL`.
- **No Invention:** The database will **never** invent historical targets if an applicable plan cannot be determined.

## NULL Semantics
- **NULL = metric not tracked:** `NULL` means the metric has not been entered.
- **0 = explicit zero:** `0` means the user explicitly recorded a value of zero (e.g., a fasting day). 
- `0` and `NULL` must not be conflated.

## Date / Timezone Semantics
- `p_log_date` must explicitly represent the user's local calendar date provided by the client application.
- The database will **NOT** silently default or fallback to `CURRENT_DATE`, as the database's UTC timestamp may not align with the user's local day boundaries.

## Concurrency
- Concurrency is managed via the `UNIQUE(user_id, log_date)` constraint combined with an atomic `ON CONFLICT (user_id, log_date) DO UPDATE` clause in the RPC. This prevents race conditions from creating duplicate log entries for the same day.

## Security Model
- **SECURITY DEFINER:** The RPC executes with elevated privileges to bypass the table's blocked write RLS.
- **Search Path:** Must use `SET search_path = ''` to prevent search path hijacking.
- **Ownership:** `user_id` is never accepted as an argument; it is strictly derived from `auth.uid()`.
- **RPC Privileges:**
  - `PUBLIC`: `EXECUTE` denied.
  - `anon`: `EXECUTE` denied.
  - `authenticated`: `EXECUTE` allowed.
  - `service_role`: `EXECUTE` allowed.

## Delete Model
- **No delete operation is implemented in Migration 1.**
- An existing row remains a historical log even if all metrics are updated to `NULL` (meaning metric not tracked).
- If deletion is needed later, it will be a separate explicitly designed operation.

## Migration Safety
- This is Migration 1. It must remain completely additive.
- It **MUST NOT** modify existing tables, existing RPCs, existing triggers, or existing domains.
- There will be NO dedicated `updated_at` trigger created or modified.

## Rollback
A safe rollback script requires no modification to existing domains:
```sql
DROP FUNCTION IF EXISTS public.upsert_nutrition_log(date, numeric, numeric, numeric);
DROP TABLE IF EXISTS public.nutrition_logs;
```

## Test Matrix
1.  **Table Creation:** Verify table, columns, types, and constraints exist.
2.  **FK Ownership:** Verify `user_id` correctly references `auth.users` with cascading delete.
3.  **RLS Policies:** Verify `SELECT` works only for own rows; verify direct `INSERT/UPDATE/DELETE` fails for authenticated users.
4.  **Anon Access:** Verify `anon` and `PUBLIC` roles are completely denied table and RPC access.
5.  **RPC Execution:** Verify `authenticated` and `service_role` can execute the RPC successfully.
6.  **Security Profile:** Verify RPC is `SECURITY DEFINER` and `search_path=''` is set.
7.  **Cross-User Protection:** Verify user cannot pass another user's UUID (implicitly verified since it's not a parameter).
8.  **Same-Day Upsert:** Verify calling RPC twice for the same `log_date` updates the row instead of duplicating.
9.  **Concurrent Upsert:** Verify no duplicate rows on simulated concurrent calls.
10. **NULL vs 0:** Verify `NULL` is accepted (untouched) and `0` is recorded correctly.
11. **Negative Values:** Verify negative values throw constraint violations.
12. **Upper Bounds:** Verify values exceeding limits (e.g., 25,000 calories) throw constraint violations.
13. **Non-finite Values:** Verify `NaN`, `Infinity`, `-Infinity` are rejected.
14. **Target Snapshot Persistence:**
    - Create log -> gets active plan snapshot.
    - Change plan.
    - Update log -> historical snapshot must remain unchanged.
15. **No Plan Snapshot:** Verify snapshot is `NULL` if no plan is active upon initial insert.
16. **Updated_At:** Verify `updated_at` correctly advances on UPDATE without relying on a trigger.

## Open Questions / Limitations
- **Limitations:** As documented, the current `plans` schema cannot establish reliable historical applicability. The chosen strategy (snapshot on initial log creation only) avoids rewriting history, but means backfilling logs for previous days will adopt the *current* plan's targets, rather than the historical one (which is unrecoverable).

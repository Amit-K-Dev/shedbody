# Phase 3 Slice 3 — Migration 1 Design

## 1. Migration Objective
- Implement the `lifestyle_logs` table to track daily workout completion, step counts, and sleep duration.
- Implement an atomic upsert RPC (`upsert_lifestyle_log`) to guarantee secure, race-condition-free writes bound to the authenticated user.
- Enforce strict Row Level Security (RLS) and privilege hardening modeled exactly after the validated `nutrition_logs` migration.

## 2. New Objects
- **Table:** `public.lifestyle_logs`
- **RPC:** `public.upsert_lifestyle_log(date, boolean, integer, numeric)`
- **RLS Policy:** "Users can view their own lifestyle logs"

## 3. Table Definition
```sql
CREATE TABLE public.lifestyle_logs (
    id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
    user_id uuid NOT NULL,
    log_date date NOT NULL,
    workout_completed boolean NULL,
    steps_count integer NULL,
    sleep_hours numeric NULL,
    created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
    updated_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);
```

## 4. Constraints
- **Foreign Key:** `user_id` references `auth.users(id) ON DELETE CASCADE`.
- **Check Constraints:** 
  - `chk_lifestyle_logs_steps_bounds`: `steps_count IS NULL OR (steps_count >= 0 AND steps_count <= 100000)`
  - `chk_lifestyle_logs_sleep_bounds`: `sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24 AND sleep_hours != 'NaN'::numeric AND sleep_hours != 'Infinity'::numeric AND sleep_hours != '-Infinity'::numeric)`

## 5. Index / Uniqueness Strategy
- **Unique Constraint:** `uq_lifestyle_logs_user_date` enforces `UNIQUE (user_id, log_date)` to guarantee exactly one log per user per local calendar date.
- This constraint implicitly creates a supporting index on `(user_id, log_date)`. No additional indices are required for MVP volumes.

## 6. RLS Policies
- `ALTER TABLE public.lifestyle_logs ENABLE ROW LEVEL SECURITY;`
- **SELECT Policy:** `USING (auth.uid() = user_id)` applied for the `authenticated` role.
- No `INSERT`, `UPDATE`, or `DELETE` policies are defined. Direct client mutations are denied by default under RLS.

## 7. Table Privileges
- `REVOKE ALL ON TABLE public.lifestyle_logs FROM PUBLIC;`
- `REVOKE ALL ON TABLE public.lifestyle_logs FROM anon;`
- `GRANT SELECT ON TABLE public.lifestyle_logs TO authenticated;`
- `GRANT ALL ON TABLE public.lifestyle_logs TO service_role;`

## 8. RPC Contract
**Signature:**
```sql
CREATE OR REPLACE FUNCTION public.upsert_lifestyle_log(
    p_log_date date,
    p_workout_completed boolean,
    p_steps_count integer,
    p_sleep_hours numeric
) RETURNS public.lifestyle_logs
```
**Behavior:**
- Determines `user_id` internally and safely via `auth.uid()`.
- Validates numeric inputs against bounds and non-finite conditions, throwing explicit errors if violated.
- Uses an atomic `INSERT ... ON CONFLICT (user_id, log_date) DO UPDATE` operation.
- Replaces the entire form state atomically (`workout_completed`, `steps_count`, `sleep_hours`) rather than coalescing NULLs, explicitly enforcing the "NULL means untracked" semantic.
- Returns the fully materialized `public.lifestyle_logs` row.

## 9. RPC Security
- `LANGUAGE plpgsql`
- `SECURITY DEFINER`
- `SET search_path = ''`
- **Privilege Hardening:**
  - `REVOKE ALL ON FUNCTION public.upsert_lifestyle_log(date, boolean, integer, numeric) FROM PUBLIC;`
  - `REVOKE ALL ON FUNCTION public.upsert_lifestyle_log(date, boolean, integer, numeric) FROM anon;`
  - `GRANT EXECUTE ON FUNCTION public.upsert_lifestyle_log(date, boolean, integer, numeric) TO authenticated;`
  - `GRANT EXECUTE ON FUNCTION public.upsert_lifestyle_log(date, boolean, integer, numeric) TO service_role;`

## 10. Validation Rules
- Explicitly rejects `NaN`, `Infinity`, and `-Infinity` for the `sleep_hours` numeric field inside the RPC and in the table CHECK constraint.
- Enforces `0 <= steps_count <= 100000`.
- Enforces `0 <= sleep_hours <= 24`.
- Validates the presence of `auth.uid()`.

## 11. Timestamp Behavior
- `created_at`: Initialized to `pg_catalog.now()` upon insertion and preserved during upserts.
- `updated_at`: Explicitly updated to `pg_catalog.now()` inside the RPC during an `UPDATE`.
- No database triggers are utilized, strictly matching the `nutrition_logs` standard.

## 12. NULL / Zero Semantics
- **NULL explicitly means "untracked"**: The RPC does NOT treat `NULL` as "leave the old value unchanged." The application must send the complete form state on every upsert. If the user clears a previously tracked metric, it is saved as `NULL`.
- `0` steps is treated as a valid explicit entry.
- `false` for `workout_completed` is an explicit negative entry, completely distinct from `NULL`.

## 13. Local Date Semantics
- `p_log_date` is processed purely as a PostgreSQL `DATE`.
- It must be explicitly supplied by the client application (based on the user's localized browser date).
- `sleep_hours` is attributed strictly to the supplied `p_log_date`.
- No UTC derivations, offsets, or substitutions occur in the database.

## 14. Compatibility Audit
A comprehensive audit of the `scratch/schema.sql`, the `nutrition_logs` migration, and the codebase confirms full compatibility:
1. **`auth.users` foreign key:** Standard and compatible.
2. **UUID Generation:** `pg_catalog.gen_random_uuid()` is natively supported and currently in use.
3. **Timestamptz Defaults:** `timestamptz` with `pg_catalog.now()` exactly mirrors existing patterns.
4. **Existing Security Patterns:** The RLS approach identically matches `nutrition_logs`.
5. **RPC Privilege Hardening:** Employs the same `REVOKE PUBLIC`, `SECURITY DEFINER`, and `search_path=''` mitigations.
6. **Supabase/Postgres Capabilities:** Standard PostgreSQL 15+ features are utilized (atomic `ON CONFLICT`).
7. **Naming Conventions:** `lifestyle_logs` and `upsert_lifestyle_log` match the established nomenclature.
8. **Conflicts:** A codebase `grep` confirms `lifestyle_logs` does not currently exist as a table, function, or index.
9. **RPC Return Type:** Returning the table type (`public.lifestyle_logs`) is fully supported and matches `upsert_nutrition_log`.
10. **Application Usage:** No existing code references `lifestyle_logs`.

## 15. Deployment Sequence
1. Create `public.lifestyle_logs` table with PK, FK, defaults, and CHECK constraints.
2. Define the `UNIQUE (user_id, log_date)` constraint.
3. Enable RLS and define the `SELECT` policy for `authenticated`.
4. Run privilege hardening `REVOKE/GRANT` commands on the table.
5. Create the `upsert_lifestyle_log` RPC function.
6. Run privilege hardening `REVOKE/GRANT` commands on the RPC.

## 16. Rollback Strategy
The `down` migration will perform a clean rollback:
```sql
DROP FUNCTION IF EXISTS public.upsert_lifestyle_log(date, boolean, integer, numeric);
DROP TABLE IF EXISTS public.lifestyle_logs;
```

## 17. Production Test Matrix
- **unauthenticated RPC:** Confirm execution immediately fails.
- **authenticated ownership:** Verify a user's API request is correctly bound to their token's UID.
- **cross-user isolation:** Confirm a user cannot read, insert, or upsert logs for another user.
- **first insert:** Ensure `created_at` initializes properly.
- **same-day upsert:** Verify updates correctly overwrite fields and refresh `updated_at`.
- **duplicate prevention:** Attempt to manually insert identical `(user_id, log_date)` pairs and catch the violation.
- **NULL values:** Confirm full-form upserts properly wipe values back to `NULL`.
- **false workout_completed:** Confirm `false` writes and returns reliably.
- **zero steps:** Confirm `0` writes and returns reliably.
- **decimal sleep:** Confirm fractional hours like `7.5` are stored correctly.
- **negative steps:** Confirm rejection.
- **negative sleep:** Confirm rejection.
- **steps > 100000:** Confirm rejection.
- **sleep > 24:** Confirm rejection.
- **NaN:** Confirm numeric NaN insertion is rejected.
- **Infinity:** Confirm Infinity insertion is rejected.
- **timestamp preservation:** Confirm `created_at` remains unchanged on subsequent updates.
- **local date correctness:** Assert the exact requested calendar date is preserved without timezone drift.
- **direct table write denial:** Test `supabase.from('lifestyle_logs').insert()` returns an RLS violation for a standard client.
- **concurrent same-day upserts:** Spam the RPC endpoint and confirm `ON CONFLICT DO UPDATE` resolves race conditions safely.

## 18. Explicitly Out of Scope
- Snapshotting or storing target goals (steps/sleep) within the logs table.
- Copying or duplicating the workout JSON definition into the log table.
- Database-level triggers.
- Wearable integrations or third-party sync capabilities.

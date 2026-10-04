# Phase 1A — Database Truth Reconciliation

## 1. Executive Summary
This report formally reconciles the database truth regarding `auth.users`, `profiles`, and `user_profiles`. The previous Phase 1A report contained contradictions, specifically implying live production schema had been accessed when it had not. This reconciliation strictly separates what is known through repository migrations (the cumulative SQL history) from what is known about the live database. 

## 2. Production Schema Retrieval Status
- **Status**: **UNVERIFIED IN LIVE DATABASE.**
- **Command Attempted**: `npx -y supabase@2.117.0 db dump --linked -f scratch/live_schema.sql`
- **Result**: The command was executed but hung indefinitely, likely awaiting an invisible interactive password prompt. The output file `scratch/live_schema.sql` was 0 bytes.
- **Verdict**: We possess NO absolute verification of the live production database schema. All subsequent schema structures are derived **entirely** from `supabase/migrations/`.

## 3. Exact profiles Schema
*Based strictly on `20260915104829_remote_schema.sql`.*

- **Primary Key**: `id` (`uuid`). Constraint: `profiles_pkey PRIMARY KEY (id)`
- **Foreign Key**: `id` references `auth.users(id)`. Constraint: `profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE`.
- **Role Column**: `role text DEFAULT 'user'::text`
- **Unique Constraints**: Implicit via PK.
- **RLS Enabled**: Yes.
- **Policies (Consolidated via `20260916120000_harden_public_profiles.sql`)**:
  - `SELECT`: `Users read own profile` (`id = auth.uid() OR public.is_admin()`)
  - `UPDATE`: `Users update own profile` (`id = auth.uid() OR public.is_admin()`)
  - `INSERT`/`DELETE`: None defined for authenticated users.
- **Anon Access**: None. Previous public access was explicitly revoked.
- **Admin Bypass**: Handled natively in the SQL policies via `OR public.is_admin()`.

## 4. Exact user_profiles Schema
*Based strictly on migration history.*

- **Primary Key**: `user_id` (`uuid`). Constraint: `user_profiles_pkey PRIMARY KEY (user_id)`
- **Foreign Key**: **NONE FOUND** in migration history referencing `auth.users`.
- **Unique Constraints**: Implicit via PK.
- **Indexes**: `idx_user_profiles_last_sync` (added in `20261002000000_last_notification_sync.sql`).
- **RLS Enabled**: Yes.
- **Policies (via `20260916100000_harden_user_profiles_privileges.sql`)**:
  - `SELECT`: `user_profiles_select_own` (`auth.uid() = user_id`)
  - `INSERT`: `user_profiles_insert_own` (`auth.uid() = user_id`)
  - `UPDATE`: `user_profiles_update_own` (`auth.uid() = user_id`)

## 5. Exact progress_entries Schema
- **Primary Key**: `id` (`uuid`). Constraint: `progress_entries_pkey PRIMARY KEY (id)`
- **Foreign Key**: **NONE FOUND** referencing `auth.users`. 
- **Columns**: `id`, `user_id`, `weight`, `created_at`, `body_fat`, `notes`, `updated_at`, `deleted_at`, `entry_date`.
- **RLS**: Enabled.

## 6. auth.users Relationships
- `profiles.id` references `auth.users(id)`.
- `user_profiles.user_id` **DOES NOT** reference `auth.users(id)` in the migration history.
- `progress_entries.user_id` **DOES NOT** reference `auth.users(id)` in the migration history.

## 7. Foreign Keys and ON DELETE Rules
- `profiles` -> `auth.users`: `ON DELETE CASCADE`.
- `user_profiles` -> `auth.users`: **NO CONSTRAINT**. An `auth.users` deletion will leave orphaned records in `user_profiles`.

## 8. Triggers
- **auth.users Triggers**: A complete scan of `supabase/migrations/` reveals **ZERO** `CREATE TRIGGER` statements executing on `auth.users`. No automatic database trigger creates `profiles` or `user_profiles` upon user signup.

## 9. RLS Policies (Migration-Verified, Live-Unverified)

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Admin bypass |
|------|-----|--------|--------|--------|--------|--------------|
| profiles | Yes | `id = auth.uid()` | None | `id = auth.uid()` | None | `public.is_admin()` |
| user_profiles | Yes | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | None | None in default policies |

## 10. RPC/Function Inventory
- **save_user_profile**:
  - Arguments: `p_goal`, `p_weight`, `p_height`, `p_age`, `p_diet_type`, `p_level`, `p_gender`, etc.
  - Security: `SECURITY DEFINER`
  - auth.uid() usage: Internally binds `v_user_id uuid := auth.uid();`
  - Tables modified: `user_profiles` (upsert via `ON CONFLICT ON CONSTRAINT user_profiles_pkey DO UPDATE`).
  - Latest Migration: `20260918051145_goals_domain_hardening.sql`.

- **upsert_progress_entry**:
  - Arguments: `p_weight`, `p_entry_date`, `p_body_fat`, `p_notes`
  - Security: `SECURITY DEFINER`
  - auth.uid() usage: Binds internally.
  - Tables modified: `progress_entries`.
  - Latest Migration: `20260917000008_slice4_progress_patch.sql`.

- **trigger_gamification_on_progress**:
  - Status: Retired in `20261003184000_retire_gamification_trigger.sql`.

## 11. Gamification Current State
- Gamification columns (`xp`, `gamification_level`, `last_weight_log_xp_date`) reside entirely on `user_profiles`.
- The database trigger (`trigger_gamification_on_progress`) handling gamification was officially **retired** on 2026-10-03.
- Gamification is currently implemented exclusively at the application layer via explicit server action updates to `user_profiles`.

## 12. Security Boundary Verification
- `lib/r2/upload.js` utilizes `@aws-sdk/client-s3` requiring native Node.js environments and accesses `.env` secrets (`R2_SECRET_ACCESS_KEY`).
- `lib/storage.js` utilizes the `"use server";` directive and evaluates `auth.uid()` through the server-side Supabase client (`createClient()`).
- **Fact**: Admin and R2 operations are indeed enforced server-side.

## 13. Migration-vs-Production Evidence Matrix

| Item | Migration Evidence | Live DB Evidence | Final Confidence |
|------|--------------------|------------------|------------------|
| user_profiles PK | `user_profiles_pkey PRIMARY KEY (user_id)` | UNVERIFIED | MIGRATION-VERIFIED |
| user_profiles.user_id FK | NOT PRESENT | UNVERIFIED | MIGRATION-VERIFIED |
| profiles PK | `profiles_pkey PRIMARY KEY (id)` | UNVERIFIED | MIGRATION-VERIFIED |
| profiles.id FK | `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE` | UNVERIFIED | MIGRATION-VERIFIED |

## 14. Contradictions Found in Previous Phase 1A Report
- The previous report ambiguously treated the migration files as "production truth." This reconciliation explicitly bifurcates the unverified live DB from the known migration state.
- The previous audit (earlier in time) claimed `id bigserial PRIMARY KEY` for `user_profiles`. This was factually incorrect based on `20260915104829_remote_schema.sql` which enforces `user_id uuid PRIMARY KEY`.

## 15. Unverified Items
- The entire state of the live production database (`ShedBodyDB`) is unverified due to CLI authentication/password prompt limitations.

## 16. Phase 1A Final Verdict
- **Verdict: GO.** We have extracted the exact, authoritative schema definitions from the repository's single source of truth (`supabase/migrations/`). The fragmentation of identity is severe and documented. We are prepared to plan Phase 1B.

## 17. Phase 1B Preconditions (To Be Answered)
Before writing any unification SQL, we must answer:
1. Is unification actually necessary, or is preserving separation of concerns (Identity vs. Domain) better?
2. If separated, which table should remain the domain profile?
3. Which columns belong to identity vs domain state?
4. What application code currently reads/writes each table?
5. How many routes/components/repositories depend on each?
6. What migration/backfill would be required?
7. What rollback strategy would exist?

# CF-2: D1 Schema Mapping

## Architectural Schema Translations

### General Construct Translation (PostgreSQL -> D1 SQLite)
| PostgreSQL Construct | Target D1 / SQLite Construct | Responsibility Boundary |
|---|---|---|
| **TABLE** | D1 Table (`CREATE TABLE`) | D1 Storage |
| **INDEX** | SQLite Index (`CREATE INDEX`) | D1 Storage |
| **FK** (Foreign Key) | SQLite FK (`REFERENCES`) | D1 Storage (with `PRAGMA foreign_keys = ON`) |
| **JSONB** | SQLite `TEXT` | D1 Storage (accessed via SQLite JSON1 functions or parsed in Application) |
| **RLS** (Row Level Security) | None (SQLite has no RLS) | **Application/Repository Authorization** (JavaScript Edge must validate `user_id` and sessions via Better Auth) |
| **RPC** (Remote Procedure Call) | None | **JavaScript or Python Service** (depending on responsibility) |
| **TRIGGER** | None | **Application / Event / Background Logic** |
| **VIEW** | D1 View (`CREATE VIEW`) | D1 Storage |
| **PL/pgSQL / Business Analytics** | None | **Python Service** (heavy analytics, AI, recommendations) |
| `uuid` type | `TEXT` type | D1 Storage (UUIDs stored as standard strings) |
| `timestamp with time zone` | `INTEGER` (Unix timestamp) | D1 Storage (Better Auth conventional format) |
| `numeric` / `double precision` | `REAL` type | D1 Storage |
| `date` | `TEXT` (YYYY-MM-DD) | D1 Storage |
| `boolean` | `INTEGER` (0/1) | D1 Storage |

---

## Table-by-Table Mapping

### 1. Better Auth (Auth Replacement)
- **Source PG Table:** `auth.users`, `auth.sessions`, `auth.identities`
- **Target D1 Table:** `user`, `session`, `account`, `verification`
- **Columns & Type Mapping:** Standard Better Auth D1 adapter schema (`id` TEXT, `email` TEXT, `createdAt` INTEGER).
- **PKs / FKs:** PK `id`, FK `userId` -> `user(id)`.
- **JSON Handling:** None.
- **Timestamps:** INTEGER (Unix timestamp) for `createdAt`, `updatedAt`.
- **RLS/Triggers:** Handled entirely by the Better Auth edge package.
- **Migration Risk:** HIGH. Supabase password hashes must be verified or reset during production migration.
- **Validation Strategy:** Covered by CF-1A Auth POC. Verify table creation natively through `better-auth`.

### 2. user_profiles
- **Source PG Table:** `public.user_profiles`
- **Target D1 Table:** `user_profiles`
- **Columns:** 
  - `user_id` uuid -> `TEXT`
  - `goal`, `target_weight`, `age`, `weight`, `height`, `level`, `diet_type`, `gender`, `unit_system` -> `TEXT` / `REAL` / `INTEGER`
  - `streak_count`, `xp`, `gamification_level` -> `INTEGER`
- **PKs:** `user_id` (TEXT)
- **FKs:** `user_id` REFERENCES `user(id)` ON DELETE CASCADE
- **Indexes:** Primary Key only.
- **Nullable / Defaults:** `goal` DEFAULT 'maintain', `xp` DEFAULT 0.
- **JSON Handling:** N/A.
- **Timestamps:** `created_at`, `updated_at` (INTEGER).
- **RLS Dependency:** Was heavily RLS-protected in Supabase. Must enforce via `D1Adapter` matching `session.user.id == req.user_id`.
- **Trigger Dependency:** Supabase `update_updated_at_column()` trigger. Replaced by Application update logic.
- **RPC Dependency:** `create_save_user_profile_rpc` -> Migrated to Next.js API layer.
- **Migration Risk:** Low. Straightforward structural mapping.

### 3. goals
- **Source PG Table:** `public.goals`
- **Target D1 Table:** `goals`
- **Columns:** `id`, `user_id`, `domain`, `start_value`, `target_value`, `start_date`, `target_date`, `status`
- **PKs:** `id` TEXT
- **FKs:** `user_id` REFERENCES `user(id)`
- **Unique Constraints:** UNIQUE (`user_id`, `domain`) WHERE `status = 'active'` -> Note: SQLite partial indexes supported (`CREATE UNIQUE INDEX goals_single_active_domain_idx ON goals(user_id, domain) WHERE status = 'active'`).
- **Timestamps:** `created_at`, `updated_at` (INTEGER).
- **RLS/Triggers/RPCs:** `create_weight_goal` RPC -> Must be implemented in JS since it handles atomic check-and-set logic. Advisory locks from Postgres must be replaced with D1 Batch / Optimistic Concurrency.
- **Migration Risk:** Medium. Concurrent goal creation requires application-side D1 transaction batches.

### 4. Unified Tracking (metrics & metric_entries)
- **Source PG Table:** `public.metrics`, `public.metric_entries`
- **Target D1 Table:** `metrics`, `metric_entries`
- **Columns:** `value_numeric` (REAL), `log_date` (TEXT), `source` (TEXT)
- **JSON Handling:** `metadata` stored as TEXT (SQLite JSON).
- **Soft-delete:** `deleted_at` (INTEGER). Append-only design retained.
- **View Dependency:** `vw_metric_entries_latest` mapped directly to SQLite View using `ROW_NUMBER() OVER (...)`. SQLite 3.25+ supports window functions, compatible with D1.
- **RLS:** Handled in Application.

### 5. nutrition_logs & lifestyle_logs & habit_entries
- **Target D1 Tables:** `nutrition_logs`, `lifestyle_logs`, `habit_entries`
- **Unique Constraints:** UNIQUE(`user_id`, `log_date`) per table, ensuring idempotency.
- **Check Constraints:** Bounds checking (`calories_consumed >= 0`) translates perfectly to SQLite `CHECK`. Note: SQLite does not strictly enforce type bounds natively like PostgreSQL without constraints, so CHECK constraints are vital.
- **RPC Dependency:** `upsert_nutrition_log`, `upsert_lifestyle_log` -> Migrated to D1 `INSERT ... ON CONFLICT (user_id, log_date) DO UPDATE` in JS application layer.

### 6. plans & adaptation_events
- **Source PG Table:** `public.plans`, `public.adaptation_events`
- **Target D1 Table:** `plans`, `adaptation_events`
- **Columns:** `previous_calorie_target`, `proposed_calorie_target` (REAL).
- **JSON Handling:** `explanation_snapshot` stored as TEXT (JSON).
- **RPC/Analytics Dependency:** AI Adaptation logic (Gate 2 / Slice 5) -> Migrated to the Python Backend.
- **Migration Risk:** High. The entire AI Coach event emission must now route securely from Edge -> Python -> D1.

### 7. notifications & notification_preferences
- **Target D1 Tables:** `notification_preferences`, `notifications`
- **Defaults/Checks:** `is_read` DEFAULT 0 (INTEGER boolean).
- **Validation Strategy:** Basic CRUD mapping. Standard local D1 test.

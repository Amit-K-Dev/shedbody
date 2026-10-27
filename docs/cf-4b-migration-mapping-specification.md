# ShedBody CF-4B Milestone 4C: Schema Compatibility & Migration Mapping Specification

## 1. Architectural Overview & Security Invariants
Target Runtime: Cloudflare Workers + Cloudflare D1 (SQLite) + Better Auth 1.7.7.
Language: Pure JavaScript (ESM); zero TypeScript.
Auth Paradigm: Passwordless (Google, Facebook, Twitter/X, LinkedIn OAuth + Resend HTTP Magic Links).

### Core Security & Anti-ATO Invariants:
1. **Preserve User UUIDs Exactly**: Supabase RFC 4122 `auth.users.id` values are retained 1:1 as the Better Auth `user.id` primary key. No synthetic or auto-incrementing surrogate keys are generated.
2. **Immutable Provider Identity Linking**: Provider accounts link strictly by immutable identifiers (`auth.identities.identity_data->>'sub'` or `provider_id`), NEVER by unverified email address matching.
3. **No Password Hash Migration**: ShedBody operates passwordless. Supabase bcrypt/argon2 password hashes are intentionally excluded from migration to eliminate credential theft attack surfaces.
4. **Idempotency & Re-run Safety**: Migration scripts use deterministic primary keys and `ON CONFLICT DO UPDATE` upserts. Re-running the migration produces zero duplicate accounts or inflated counts.
5. **Atomic Transaction Rollback**: Migrations execute in transactional batches. Any single constraint violation or malformed record rolls back the batch, preventing dirty state.
6. **Zero Source Modification & Zero PII in Telemetry**: Production backups are streamed in read-only mode, verified with pre- and post-execution SHA-256 hashes. User references in logs are pseudonymized (FNV-1a `anon_xxxxxxxx`).

---

## 2. Better Auth Core Schema Alignment

### 2.1 Table: `user`
Target: Cloudflare D1 `user` table. Matches `@better-auth/core/db` exact field definition.

| Field | Source (Supabase `auth.users`) | Destination (D1 `user`) | Transformation | Nullable | Default | Compatibility Risk & Mitigation |
|---|---|---|---|---|---|---|
| **id** | `id` (uuid) | `id` (TEXT) | Direct string cast of RFC 4122 UUID | NO (PK) | None | Zero risk; verified RFC 4122 regex format. |
| **name** | `raw_user_meta_data->>'full_name'` or `name` | `name` (TEXT) | Extracted from metadata; fallback to `email.split('@')[0]` or `'User'` | NO | `'User'` | None; sanitized and trimmed. |
| **email** | `email` (varchar) | `email` (TEXT) | Trimmed and lowercased (`email.toLowerCase()`) | NO (UQ) | None | Collision check preflight verifies 0 case-insensitive duplicates. |
| **emailVerified** | `email_confirmed_at` (timestamptz) | `emailVerified` (INTEGER) | `email_confirmed_at ? 1 : 0` | NO | `0` | Clean integer boolean mapping. |
| **image** | `raw_user_meta_data->>'avatar_url'` | `image` (TEXT) | Extracted URL string | YES | `NULL` | None. |
| **createdAt** | `created_at` (timestamptz) | `createdAt` (INTEGER) | Converted to Unix epoch seconds (`Math.floor(date / 1000)`) | NO | `strftime('%s', 'now')` | None; consistent integer seconds. |
| **updatedAt** | `updated_at` (timestamptz) | `updatedAt` (INTEGER) | Converted to Unix epoch seconds | NO | `strftime('%s', 'now')` | None. |

---

### 2.2 Table: `account`
Target: Cloudflare D1 `account` table. Matches `@better-auth/core/db` exact field definition.

| Field | Source (Supabase `auth.identities`) | Destination (D1 `account`) | Transformation | Nullable | Default | Compatibility Risk & Mitigation |
|---|---|---|---|---|---|---|
| **id** | Computed | `id` (TEXT) | Deterministic key: `acc_${providerId}_${accountId}` | NO (PK) | None | Eliminates random ID divergence on re-runs. |
| **accountId** | `identity_data->>'sub'` or `provider_id` | `accountId` (TEXT) | Extracted immutable provider subject identifier | NO | None | Never uses mutable email; verified immutable identifier. |
| **providerId** | `provider` (text) | `providerId` (TEXT) | Normalized lowercase (`google`, `facebook`, `twitter`, `linkedin`) | NO | None | Aligns with Better Auth provider registry. |
| **userId** | `user_id` (uuid) | `userId` (TEXT) | Preserved user UUID; references `user(id)` ON DELETE CASCADE | NO (FK) | None | Enforces referential integrity. |
| **accessToken** | N/A | `accessToken` (TEXT) | Set to `NULL` | YES | `NULL` | OAuth access tokens are transient; reissued on login. |
| **refreshToken**| N/A | `refreshToken` (TEXT) | Set to `NULL` | YES | `NULL` | Reissued on login. |
| **idToken** | N/A | `idToken` (TEXT) | Set to `NULL` | YES | `NULL` | Reissued on login. |
| **accessTokenExpiresAt** | N/A | `accessTokenExpiresAt` (INTEGER) | Set to `NULL` | YES | `NULL` | Set dynamically by Better Auth. |
| **refreshTokenExpiresAt** | N/A | `refreshTokenExpiresAt` (INTEGER) | Set to `NULL` | YES | `NULL` | Set dynamically by Better Auth. |
| **scope** | N/A | `scope` (TEXT) | Set to `NULL` | YES | `NULL` | Populated on next OAuth callback. |
| **password** | N/A | `password` (TEXT) | Set to `NULL` (Passwordless system) | YES | `NULL` | Supabase password hashes are NOT migrated. |
| **createdAt** | `created_at` (timestamptz) | `createdAt` (INTEGER) | Converted to Unix epoch seconds | NO | `strftime('%s', 'now')` | None. |
| **updatedAt** | `updated_at` (timestamptz) | `updatedAt` (INTEGER) | Converted to Unix epoch seconds | NO | `strftime('%s', 'now')` | None. |

---

### 2.3 Tables: `session` and `verification`
- **`session`**: Supabase sessions are short-lived JWTs. During migration cutover, all previous sessions expire naturally. Better Auth issues fresh 7-day sessions upon authentication in Cloudflare Workers.
- **`verification`**: Dynamic table for transient tokens:
  - Magic Link Tokens: `identifier = 'magic-link:${token}'`, `value = JSON({ email })`, `expiresAt = Unix epoch`.
  - OAuth State / PKCE Nonces: Generated and consumed dynamically during authorization flow.

---

## 3. User-Owned Domain Tables Mapping (11 Tables)

All domain tables enforce `FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE`.

### 3.1 `user_profiles`
- **user_id**: TEXT PK -> Preserved user UUID
- **goal**: TEXT NOT NULL DEFAULT `'maintain'`
- **target_weight**: REAL CHECK (`target_weight > 0`)
- **age**: INTEGER CHECK (`age >= 10 AND age <= 100`)
- **weight**: REAL CHECK (`weight > 0`)
- **height**: REAL CHECK (`height > 0`)
- **level**: TEXT NULLABLE
- **diet_type**: TEXT NULLABLE
- **gender**: TEXT NULLABLE
- **unit_system**: TEXT DEFAULT `'metric'`
- **streak_count**: INTEGER DEFAULT 0
- **last_active_date**: TEXT (YYYY-MM-DD)
- **xp**: INTEGER DEFAULT 0
- **reminder_enabled**: INTEGER (0/1 boolean)
- **reminder_time**: TEXT DEFAULT `'20:00:00'`
- **gamification_level**: INTEGER DEFAULT 1
- **last_notification_sync**: TEXT
- **created_at**: INTEGER Unix epoch seconds
- **updated_at**: INTEGER Unix epoch seconds
- *Unmapped Column*: `last_weight_log_xp_date` (PostgreSQL legacy column; omitted from D1 schema).

### 3.2 `profiles` (D1 Migration `0005_profiles.sql`)
- **id**: TEXT PK -> Preserved user UUID
- **full_name**: TEXT NULLABLE
- **avatar_url**: TEXT NULLABLE
- **bio**: TEXT NULLABLE
- **role**: TEXT NOT NULL DEFAULT `'user'`
- **created_at**: INTEGER Unix epoch seconds (defaults to `strftime('%s', 'now')`)
- **updated_at**: INTEGER Unix epoch seconds (defaults to `strftime('%s', 'now')`)
- *Role Authorization & Sanitization Safety*:
  - Allowed roles in ShedBody authorization model are strictly `'admin'` and `'user'` (matching Supabase check constraint `role = ANY(ARRAY['user', 'admin'])`).
  - Defensive normalization: any missing, null, or unrecognized role (e.g. `superadmin`, `root`, `moderator`) normalizes to `'user'`.
  - Only `role === 'admin'` grants administrative access; non-admin users fail closed on `/admin` and admin API endpoints.
  - Production backup verification: exactly 1 admin profile and 6 user profiles verified.

### 3.3 `goals`
- **id**: TEXT PK
- **user_id**: TEXT FK -> user(id) ON DELETE CASCADE
- **domain**: TEXT NOT NULL CHECK (`domain IN ('weight')`)
- **start_value**: REAL NULLABLE
- **target_value**: REAL NOT NULL CHECK (`target_value > 0`)
- **start_date**: TEXT NOT NULL (YYYY-MM-DD)
- **target_date**: TEXT NULLABLE (YYYY-MM-DD)
- **status**: TEXT NOT NULL DEFAULT `'active'` CHECK (`status IN ('active', 'achieved', 'abandoned')`)
- **created_at**: INTEGER Unix epoch seconds
- **updated_at**: INTEGER Unix epoch seconds
- *Constraint*: `CREATE UNIQUE INDEX goals_single_active_domain_idx ON goals(user_id, domain) WHERE status = 'active'`

### 3.4 `plans`
- **id**: TEXT PK
- **user_id**: TEXT FK -> user(id) ON DELETE CASCADE
- **goal**: TEXT NULLABLE
- **diet_type**: TEXT NULLABLE
- **level**: TEXT NULLABLE
- **calories**: REAL NULLABLE
- **protein**: REAL NULLABLE
- **workout**: TEXT NULLABLE (JSON string)
- **meals**: TEXT NULLABLE (JSON string)
- **is_active**: INTEGER NOT NULL DEFAULT 1 (0/1 boolean)
- **provenance**: TEXT CHECK (`provenance IN ('onboarding', 'manual', 'adaptation', 'goal_transition')`)
- **created_at**: INTEGER Unix epoch seconds
- **deleted_at**: INTEGER NULLABLE Unix epoch seconds
- *Unmapped Column*: `updated_at` (omitted from D1 plans schema).

### 3.5 `habit_entries`
- **id**: TEXT PK
- **user_id**: TEXT FK -> user(id) ON DELETE CASCADE
- **habit_name**: TEXT NOT NULL CHECK (`habit_name IN ('workout', 'steps', 'water', 'sleep', 'protein', 'meditation')`)
- **log_date**: TEXT NOT NULL (YYYY-MM-DD)
- **completed**: INTEGER NOT NULL DEFAULT 0 (0/1 boolean)
- **created_at**: INTEGER Unix epoch seconds
- **updated_at**: INTEGER Unix epoch seconds
- *Constraint*: `UNIQUE(user_id, habit_name, log_date)`

### 3.6 `lifestyle_logs`
- **id**: TEXT PK
- **user_id**: TEXT FK -> user(id) ON DELETE CASCADE
- **log_date**: TEXT NOT NULL (YYYY-MM-DD)
- **workout_completed**: INTEGER NULLABLE (0/1 boolean)
- **steps_count**: INTEGER NULLABLE CHECK (`steps_count >= 0`)
- **sleep_hours**: REAL NULLABLE CHECK (`sleep_hours >= 0 AND sleep_hours <= 24`)
- **created_at**: INTEGER Unix epoch seconds
- **updated_at**: INTEGER Unix epoch seconds
- *Constraint*: `UNIQUE(user_id, log_date)`

### 3.7 `metric_entries` (Unified EAV Storage)
- **id**: TEXT PK
- **user_id**: TEXT FK -> user(id) ON DELETE CASCADE
- **metric_id**: TEXT NOT NULL REFERENCES metrics(id)
- **log_date**: TEXT NOT NULL (YYYY-MM-DD)
- **recorded_at**: INTEGER NOT NULL Unix epoch seconds
- **value_numeric**: REAL NULLABLE
- **source**: TEXT NOT NULL CHECK (`source IN ('manual', 'device', 'import', 'ai', 'system')`)
- **metadata**: TEXT NULLABLE (JSON string)
- **created_at**: INTEGER NOT NULL Unix epoch seconds
- **deleted_at**: INTEGER NULLABLE Unix epoch seconds
- *Note*: Consolidates all legacy `progress_entries` weight logs from Supabase.

### 3.8 `nutrition_logs`
- **id**: TEXT PK
- **user_id**: TEXT FK -> user(id) ON DELETE CASCADE
- **log_date**: TEXT NOT NULL (YYYY-MM-DD)
- **calories_consumed**: REAL NULLABLE CHECK (`calories_consumed >= 0`)
- **protein_consumed**: REAL NULLABLE CHECK (`protein_consumed >= 0`)
- **water_ml**: REAL NULLABLE CHECK (`water_ml >= 0`)
- **target_calories_snapshot**: REAL NULLABLE CHECK (`target_calories_snapshot >= 0`)
- **target_protein_snapshot**: REAL NULLABLE CHECK (`target_protein_snapshot >= 0`)
- **created_at**: INTEGER Unix epoch seconds
- **updated_at**: INTEGER Unix epoch seconds
- *Constraint*: `UNIQUE(user_id, log_date)`

### 3.9 `notification_preferences`
- **user_id**: TEXT PK REFERENCES user(id) ON DELETE CASCADE
- **workout_reminders**: INTEGER NOT NULL DEFAULT 1 (0/1 boolean)
- **goal_reminders**: INTEGER NOT NULL DEFAULT 1 (0/1 boolean)
- **weekly_reports**: INTEGER NOT NULL DEFAULT 1 (0/1 boolean; mapped from PostgreSQL `weekly_progress`)
- **system_updates**: INTEGER NOT NULL DEFAULT 1 (0/1 boolean; mapped from PostgreSQL `plan_updates`)
- **created_at**: INTEGER Unix epoch seconds
- **updated_at**: INTEGER Unix epoch seconds

### 3.10 `notifications`
- **id**: TEXT PK
- **user_id**: TEXT FK -> user(id) ON DELETE CASCADE
- **type**: TEXT NOT NULL CHECK (`type IN ('workout_reminder', 'goal_reminder', 'weekly_report', 'system_update')`)
- **title**: TEXT NOT NULL
- **message**: TEXT NOT NULL
- **action_url**: TEXT NULLABLE
- **is_read**: INTEGER NOT NULL DEFAULT 0 (0/1 boolean)
- **deterministic_key**: TEXT NOT NULL
- **created_at**: INTEGER Unix epoch seconds
- *Constraint*: `UNIQUE(user_id, deterministic_key)`

### 3.11 `calculator_results` (D1 Migration `0004_calculator_results.sql`)
- **id**: TEXT PK
- **user_id**: TEXT NOT NULL
- **calculator_id**: TEXT NOT NULL
- **input_data**: TEXT NOT NULL (JSON string)
- **result_data**: TEXT NOT NULL (JSON string)
- **is_latest**: INTEGER DEFAULT 0 (0/1 boolean)
- **created_at**: DATETIME / TEXT DEFAULT CURRENT_TIMESTAMP (ISO-8601 string)
- **update_at**: DATETIME / TEXT DEFAULT CURRENT_TIMESTAMP (ISO-8601 string)
- **deleted_at**: DATETIME / TEXT NULLABLE (NULL for active results)
- *Timestamp Schema Reconciliation*:
  - Unlike tables using integer Unix epoch seconds, `calculator_results` intentionally preserves ISO-8601 text representation (`DATETIME` in SQLite).
  - This guarantees 100% runtime compatibility with `CalculatorRepository.js`, which inserts `CURRENT_TIMESTAMP` and queries with `ORDER BY created_at DESC LIMIT ?`.
  - SQLite text comparisons order `CURRENT_TIMESTAMP` strings (`YYYY-MM-DD HH:MM:SS`) in exact chronological sequence with historical imported timestamps.
  - Column name `update_at` preserves the exact PostgreSQL and `0004_calculator_results.sql` identifier (no `d`).

### 3.12 `adaptation_events`
- **id**: TEXT PK
- **user_id**: TEXT FK -> user(id) ON DELETE CASCADE
- **goal_id**: TEXT FK -> goals(id) ON DELETE CASCADE
- **evaluation_window_start**: TEXT NOT NULL (YYYY-MM-DD)
- **evaluation_window_end**: TEXT NOT NULL (YYYY-MM-DD)
- **previous_plan_id**: TEXT FK -> plans(id) ON DELETE CASCADE
- **resulting_plan_id**: TEXT FK -> plans(id) ON DELETE CASCADE
- **previous_calorie_target**: REAL NOT NULL
- **proposed_calorie_target**: REAL NOT NULL
- **final_calorie_target**: REAL NOT NULL
- **current_weight**: REAL NOT NULL
- **current_tdee**: REAL NULLABLE
- **is_clamped**: INTEGER NOT NULL (0/1 boolean)
- **explanation_snapshot**: TEXT NOT NULL (JSON string)
- **created_at**: INTEGER Unix epoch seconds
- *Constraint*: `UNIQUE(user_id, goal_id, evaluation_window_start, evaluation_window_end)`

---

## 4. Rehearsal Evidence Matrix & Validation Summary

| Test Suite | File / Script | Tests Executed | Status | Evidence Summary |
|---|---|---|---|---|
| **Schema Compatibility & Migration Rehearsal** | `scripts/cf-4b-migration-rehearsal.test.js` | 11 / 11 | **PASS** | Exact alignment with Better Auth 1.7.7 core tables. Synthetic rehearsal, rerun idempotency, atomic transaction rollback, and 7 auth compatibility cases verified. Real backup parsed and imported into clean D1 with 0 FK violations. |
| **Real Backup Read-Only Validator** | `scripts/cf-4b-backup-validator.js` | 1 / 1 (Full dump) | **PASS** | Read-only stream verified 7 users, 8 identities (7 Google, 1 Facebook), 11 domain tables, 0 orphaned records. Pre- and post-read SHA-256 matched 100% (`AC5D669270CEEA46D2C992BDBF63228FE9975EEFA54915000826FDB85768189F`). |
| **User Migration & Anti-ATO Validator** | `scripts/cf-4b-user-migration-validator.js` | 3 / 3 (Self-test) | **PASS** | Fails closed on email collisions, invalid UUIDs, orphaned identities, and orphaned domain records. Zero PII printed. |
| **Worker & D1 Local Integration Test** | `scripts/cf-4b-worker-integration.test.js` | 15 / 15 | **PASS** | D1 foreign keys, Resend transport, Magic link generation/consumption, OAuth initiation/callback, state mismatch, missing state, missing code, unconfigured provider, and open redirect rejection verified. |
| **Staging Preflight Validation** | `scripts/cf-4b-staging-preflight.js` | 13 / 13 | **PASS** | 4 canonical callback URLs, 10 required secret definitions, default-off feature flag verified. Production Supabase auth path untouched. |
| **OAuth Configuration & Security Test** | `scripts/cf-4b-oauth-config.test.js` | 24 / 24 | **PASS** | Canonical callback URLs, credential pairs, partial credential throws, PKCE (S256), reserved parameters, and edge handler env binding verified. |
| **CF-4B Reconciliation & Auth Gate** | `scripts/cf-4b-reconciliation.test.js` | 15 / 15 | **PASS** | Complete 175-vs-155-vs-162 record reconciliation. 100% proof of progress_entries -> metric_entries EAV transformation. Exact string equivalence of provider_id and sub. Identity lookup, anti-ATO, JSON, timestamp units, calculator_results DATETIME consistency, profiles.role authorization safety, and rerun idempotency verified. |
| **CF-11 Domain Rehearsal Suite** | `scripts/cf-11-rehearsal.test.js` | 24 / 24 | **PASS** | 0 FK violations across all domain tables with RFC 4122 Supabase UUIDs. |

---

## 5. Milestone 4D Source-to-Target Record Count Reconciliation

### 5.1 Reconciliation of the 175 vs 155 vs 162 Discrepancy
- **175 Rows (Milestone 4B count)**: Sum of 11 domain tables initially parsed from PostgreSQL dump, including 20 legacy `progress_entries` and excluding `profiles`.
- **155 Rows (Milestone 4C imported count)**: 175 minus 20 `progress_entries` (omitted because D1 has no `progress_entries` table).
- **162 Rows (Milestone 4D reconciled active domain count)**: 155 active domain rows plus 7 rows from `profiles` (which maps 1:1 to D1 `profiles`).
- **182 Rows (Total extracted domain records in source backup)**: 162 active domain rows + 20 archived legacy `progress_entries` rows.

### 5.2 Table-by-Table Reconciliation Matrix

| Source Table (Supabase) | Source Rows | Target D1 Table(s) | Imported Rows | Intentionally Excluded Rows | Reason / Classification |
|---|---|---|---|---|---|
| `auth.users` | 7 | `user` | 7 | 0 | Exact RFC 4122 UUID preserved. |
| `auth.identities` | 8 | `account` | 8 | 0 | 7 Google, 1 Facebook. Mapped via immutable `sub`. |
| `auth.sessions` | 5 | `session` | 0 | 5 | Transformed/Excluded: Supabase JWT sessions expire on cutover; Better Auth issues fresh D1 sessions on login. |
| `auth.refresh_tokens` | 22 | None | 0 | 22 | Transient OAuth refresh tokens; reissued on next login. |
| `auth.flow_state` | 20 | None | 0 | 20 | Transient login flow state; discarded on cutover. |
| `auth.mfa_amr_claims` | 5 | None | 0 | 5 | Transient MFA claims; discarded on cutover. |
| `public.profiles` | 7 | `profiles` | 7 | 0 | Display profile identity (full_name, avatar_url, role). |
| `public.user_profiles` | 6 | `user_profiles` | 6 | 0 | Fitness telemetry & settings (goal, weight, height, streak, xp). |
| `public.goals` | 10 | `goals` | 10 | 0 | Active/achieved user goals; unique active domain enforced. |
| `public.plans` | 12 | `plans` | 12 | 0 | Meal & workout plans; JSON text preserved. |
| `public.habit_entries` | 12 | `habit_entries` | 12 | 0 | Daily habit completion logs. |
| `public.lifestyle_logs` | 10 | `lifestyle_logs` | 10 | 0 | Sleep and workout tracking logs. |
| `public.metric_entries` | 80 | `metric_entries` | 80 | 0 | Unified EAV metric records (includes 20 weight entries). |
| `public.nutrition_logs` | 10 | `nutrition_logs` | 10 | 0 | Daily calorie, protein, water logs. |
| `public.progress_entries` | 20 | None (archived) | 0 | 20 | **100% transformed into `metric_entries`** in PostgreSQL prior to backup. All 20 `progress_entries.id` match `metric_entries.metadata.legacy_id` where `metric_id = 'weight'`. Importing to D1 would create duplicate weight entries. |
| `public.notification_preferences` | 1 | `notification_preferences` | 1 | 0 | Preference flags (weekly_progress, plan_updates). |
| `public.notifications` | 0 | `notifications` | 0 | 0 | Empty in source backup. |
| `public.calculator_results` | 14 | `calculator_results` | 14 | 0 | Historical calculation results (input_data, result_data). |
| `public.adaptation_events` | 0 | `adaptation_events` | 0 | 0 | Empty in source backup. |
| `public.metrics` | 19 | `metrics` | Pre-seeded / 19 | 0 | System reference lookup table (seeded in `0000_initial_schema.sql`). |
| `public.posts` | 217 | `posts` | (Content) | 0 | Public content domain (CMS migration scope). |
| `public.post_views` | 7921 | `post_views` | (Analytics) | 0 | High-volume content analytics (CF-9 scope). |
| **Total User Domain Records** | **182** | **12 Target Tables** | **162** | **20** | **100% Accounted For. Zero Unaccounted Rows.** |


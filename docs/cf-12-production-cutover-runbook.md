# ShedBody CF-12: Production Cloudflare Cutover Runbook

**Version:** 1.1 (Production Cutover Hardened Edition)  
**Status:** DRAFT / PENDING OPERATOR AUTHORIZATION  
**Target Architecture:** Cloudflare D1 (Database), Cloudflare Workers (OpenNext Application & Dedicated Auth Worker), Cloudflare R2 (Storage)  
**Safety Classification:** STRICT SAFETY CONTROLS ACTIVE. Zero production changes executed autonomously.

---

> [!CAUTION]
> **SAFETY & PERMISSION INVARIANT**
> Every production provisioning, migration, secret creation, deployment, and DNS command in this runbook is labeled **`[NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]`**.
> No autonomous agent may execute these commands without explicit, unambiguous human operator instruction.
> **DO NOT** create production D1 databases, migrate production data, provision production secrets, deploy to production, or change DNS autonomously.

---

## 1. Workload Separation & Configuration Architecture

The ShedBody Cloudflare infrastructure comprises two strictly decoupled Worker workloads with distinct configurations, execution lifecycles, and secret scopes:

| Workload | Configuration File | Target Worker Name | Target D1 Database | Primary Responsibility |
|---|---|---|---|---|
| **Auth Worker** | `workers/auth-worker/wrangler.toml` | `shedbody-auth-worker` | `shedbody-d1` | Better Auth engine, social OAuth providers, transactional magic-link dispatch, native rate limiting |
| **Next.js App Worker** | `wrangler.toml` (Root) | `shedbody` | `shedbody-d1` | Next.js Server Components, Server Actions, domain repositories via `D1Adapter`, UI rendering |

### Critical Wrangler CLI Rules
- **Auth Worker Commands:** ALWAYS pass `--config workers/auth-worker/wrangler.toml`.
- **Application Worker Commands:** Default to root `wrangler.toml` (omit `--config` or pass `--config wrangler.toml`).
- **Environment Targeting:** Omitting `--env staging` targets top-level production. Never run production commands against staging UUID `1e24679a-e0b6-4b97-ad84-023e972eca52`.
- **Migration Directory:** Both configuration files explicitly define `migrations_dir` pointing to `d1-migrations/`.

---

## 2. Phase 0: Pre-Flight Verification & Backup Immutability

Before initiating any cutover operations, verify the immutability of the canonical production backup:

1. **Verify Backup Immutability (SHA-256 Checkpoint)**:
   ```bash
   # Linux / macOS
   shasum -a 256 supabase/backups/production_data.sql
   # Windows PowerShell
   Get-FileHash -Algorithm SHA256 supabase\backups\production_data.sql
   ```
   **Required Checkpoint:**  
   `AC5D669270CEEA46D2C992BDBF63228FE9975EEFA54915000826FDB85768189F`  
   *(If hash differs by even a single byte, HALT cutover immediately).*

2. **Verify Configuration Isolation**:
   Confirm that top-level production configurations in both `wrangler.toml` and `workers/auth-worker/wrangler.toml` use placeholder `local-auth-d1-placeholder` and **never** reference the staging database ID (`1e24679a-e0b6-4b97-ad84-023e972eca52`).

---

## 3. Phase 1: Production D1 Provisioning & Schema Migrations

### Step 1.1: Provision Production Cloudflare D1 Database `[NOT EXECUTED]`
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
npx wrangler d1 create shedbody-d1
```
Output will return the assigned Cloudflare database UUID:
```text
✅ Successfully created DB 'shedbody-d1' with ID 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
```

### Step 1.2: Substitute Production UUID in Configurations
Replace `local-auth-d1-placeholder` with the assigned production database UUID in:
1. `wrangler.toml` (lines 28–29):
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "shedbody-d1"
   database_id = "<PROD_D1_DATABASE_UUID>"
   preview_database_id = "<PROD_D1_DATABASE_UUID>"
   migrations_dir = "d1-migrations"
   ```
2. `workers/auth-worker/wrangler.toml` (lines 20–21):
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "shedbody-d1"
   database_id = "<PROD_D1_DATABASE_UUID>"
   preview_database_id = "<PROD_D1_DATABASE_UUID>"
   migrations_dir = "../../d1-migrations"
   ```

### Step 1.3: Apply Production D1 Migrations `[NOT EXECUTED]`
Execute the repository's real migration chain using Wrangler's native migration engine:
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
npx wrangler d1 migrations apply shedbody-d1 --remote
```

*Fallback Sequential Execution (if applying migration files manually):*
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
npx wrangler d1 execute shedbody-d1 --remote --file=./d1-migrations/0000_initial_schema.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./d1-migrations/0001_posts_schema.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./d1-migrations/0002_article_feedback.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./d1-migrations/0003_contact_submissions.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./d1-migrations/0004_calculator_results.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./d1-migrations/0005_profiles.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./d1-migrations/0006_fix_vw_metric_entries_latest.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./d1-migrations/0007_align_notifications_schema.sql
```

---

## 4. Phase 2: Production Secrets Provisioning (Workload-Separated)

Secrets must be provisioned to each worker independently via `wrangler secret put`. Never commit secret values or print them in logs.

### Workload A: Dedicated Auth Worker Secrets
Target: `--config workers/auth-worker/wrangler.toml`

#### 1. Minimum Viable Authentication (Required for Launch)
These two secrets are **mandatory** for passwordless magic-link sign-in:
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
# Minimum 32-character high-entropy secret (e.g. openssl rand -base64 32)
npx wrangler secret put BETTER_AUTH_SECRET --config workers/auth-worker/wrangler.toml

# Active Resend Production API Key (re_...) for transactional magic-link delivery
npx wrangler secret put RESEND_API_KEY --config workers/auth-worker/wrangler.toml
```

#### 2. Optional Social OAuth Providers (Configure ONLY If Credentials Exist)
Do NOT fabricate dummy credentials. If an OAuth provider is not yet provisioned in Google/Facebook/Twitter/LinkedIn developer portals, omit its secrets; Better Auth will gracefully keep that social sign-in button disabled:
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
# Google OAuth
npx wrangler secret put GOOGLE_CLIENT_ID --config workers/auth-worker/wrangler.toml
npx wrangler secret put GOOGLE_CLIENT_SECRET --config workers/auth-worker/wrangler.toml

# Facebook OAuth
npx wrangler secret put FACEBOOK_CLIENT_ID --config workers/auth-worker/wrangler.toml
npx wrangler secret put FACEBOOK_CLIENT_SECRET --config workers/auth-worker/wrangler.toml

# Twitter / X OAuth
npx wrangler secret put TWITTER_CLIENT_ID --config workers/auth-worker/wrangler.toml
npx wrangler secret put TWITTER_CLIENT_SECRET --config workers/auth-worker/wrangler.toml

# LinkedIn OAuth
npx wrangler secret put LINKEDIN_CLIENT_ID --config workers/auth-worker/wrangler.toml
npx wrangler secret put LINKEDIN_CLIENT_SECRET --config workers/auth-worker/wrangler.toml
```

---

### Workload B: Application Next.js Worker Secrets
Target: `--config wrangler.toml` (Root)

The Next.js Application Worker requires only the cryptographic secret to decrypt and verify session tokens issued by the Auth Worker:
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
# MUST match the BETTER_AUTH_SECRET provisioned on the Auth Worker
npx wrangler secret put BETTER_AUTH_SECRET --config wrangler.toml
```
> [!NOTE]
> The Application Worker does **not** receive `RESEND_API_KEY` or OAuth client secrets. All third-party credential interactions remain strictly quarantined within the edge Auth Worker.

---

## 5. Phase 3: Production Data Migration & Verification

Data migration follows the tested, idempotent procedure verified in `scripts/cf-12-batch-rehearsal.test.js` and `scripts/cf-4b-reconciliation.test.js`.

### Step 3.1: Generate Deterministic Idempotent Batches
Generate the 4 migration batch files from the authoritative backup:
```bash
node scripts/cf-12-batch-rehearsal.test.js
```
This generates:
- `scratch/5b_batch1_auth.sql`: 15 statements (7 `user` + 8 `account`)
- `scratch/5b_batch2_profiles.sql`: 13 statements (7 `profiles` + 6 `user_profiles`)
- `scratch/5b_batch3_tracking.sql`: 134 statements (10 `goals` + 12 `plans` + 12 `habit_entries` + 10 `lifestyle_logs` + 80 `metric_entries` + 10 `nutrition_logs`)
- `scratch/5b_batch4_extras.sql`: 15 statements (1 `notification_preferences` + 14 `calculator_results`)
- **Total Migrated Records:** 177 statements (All using `INSERT OR REPLACE INTO`)

### Step 3.2: Execute Batches Sequentially on Production D1 `[NOT EXECUTED]`
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
npx wrangler d1 execute shedbody-d1 --remote --file=./scratch/5b_batch1_auth.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./scratch/5b_batch2_profiles.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./scratch/5b_batch3_tracking.sql
npx wrangler d1 execute shedbody-d1 --remote --file=./scratch/5b_batch4_extras.sql
```

### Step 3.3: Row-Count Reconciliation Audit `[NOT EXECUTED]`
Execute the exact verification query against production D1:
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
npx wrangler d1 execute shedbody-d1 --remote --command "
  SELECT 'user' as tbl, count(*) as count FROM \"user\"
  UNION ALL SELECT 'account', count(*) FROM \"account\"
  UNION ALL SELECT 'profiles', count(*) FROM \"profiles\"
  UNION ALL SELECT 'user_profiles', count(*) FROM \"user_profiles\"
  UNION ALL SELECT 'goals', count(*) FROM \"goals\"
  UNION ALL SELECT 'plans', count(*) FROM \"plans\"
  UNION ALL SELECT 'habit_entries', count(*) FROM \"habit_entries\"
  UNION ALL SELECT 'lifestyle_logs', count(*) FROM \"lifestyle_logs\"
  UNION ALL SELECT 'metric_entries', count(*) FROM \"metric_entries\"
  UNION ALL SELECT 'nutrition_logs', count(*) FROM \"nutrition_logs\"
  UNION ALL SELECT 'notification_preferences', count(*) FROM \"notification_preferences\"
  UNION ALL SELECT 'calculator_results', count(*) FROM \"calculator_results\"
  UNION ALL SELECT 'metrics', count(*) FROM \"metrics\";
"
```

#### Reconciled Expected Row Counts & Technical Explanations

| Target Table | Expected Count | Source Entity & Reconciliation Explanation |
|---|---|---|
| `user` | **7** | Migrated 1:1 from `auth.users` with exact UUID preservation. |
| `account` | **8** | Migrated 1:1 from `auth.identities` (7 Google, 1 Facebook). Formatted as `acc_${provider}_${accountId}`. |
| `profiles` | **7** | Public profile display and admin role authorization (1 admin, 6 user). |
| `user_profiles` | **6** | Fitness telemetry (weight, height, target weight, streak count, xp). 1 user has not completed onboarding. |
| `goals` | **10** | Active and achieved user goals. *(Earlier drafts mistakenly claimed 27).* |
| `plans` | **12** | Nutrition and workout plans. *(Earlier drafts mistakenly claimed 24).* |
| `habit_entries` | **12** | Daily habit tracking entries. *(Correct table name is `habit_entries`, not `habits`; earlier draft claimed 6).* |
| `lifestyle_logs` | **10** | Daily lifestyle tracking logs (sleep, steps, workout). *(Earlier draft claimed 16).* |
| `metric_entries` | **80** | **EAV Consolidation:** Comprises 60 direct entries + 20 legacy weight entries consolidated from archived `progress_entries`. |
| `nutrition_logs` | **10** | Daily nutrition logs (calories, protein, water). *(Earlier draft claimed 8).* |
| `notification_preferences` | **1** | User notification preferences. |
| `calculator_results` | **14** | Saved health and fitness calculator results. |
| `metrics` | **8** | Pre-seeded reference table from `0000_initial_schema.sql` (`weight`, `body_fat`, `calories`, `protein`, `water`, `steps`, `sleep`, `workout`). |
| `notifications` | **0** | Clean zero-row table in source backup. |
| `adaptation_events` | **0** | Clean zero-row table in source backup. |
| **Total Migrated Rows** | **177** | (+ 8 pre-seeded reference metrics = **185 total rows** in D1). |

### Step 3.4: Foreign-Key & Database Integrity Checks `[NOT EXECUTED]`
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
npx wrangler d1 execute shedbody-d1 --remote --command "PRAGMA foreign_key_check;"
npx wrangler d1 execute shedbody-d1 --remote --command "PRAGMA integrity_check;"
```
**Required Output:** Zero rows returned for `foreign_key_check`; `[ { "integrity_check": "ok" } ]` for `integrity_check`. If any orphan or corruption is detected, HALT immediately.

---

## 6. Phase 4: Production Deployment & Cutover Sequence

### Step 4.1: Deploy Dedicated Auth Worker `[NOT EXECUTED]`
In `workers/auth-worker/wrangler.toml` under `[vars]`, enable authentication:
```toml
[vars]
ENABLE_CF_AUTH = "true"
```
Deploy the worker:
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
npx wrangler deploy --config workers/auth-worker/wrangler.toml
```

### Step 4.2: Build & Deploy Next.js Application Worker `[NOT EXECUTED]`
In root `wrangler.toml` under `[vars]`, activate the production feature flags:
```toml
[vars]
ENVIRONMENT = "production"
NEXT_PUBLIC_APP_ENV = "production"
ENABLE_BETTER_AUTH = "true"
NEXT_PUBLIC_ENABLE_BETTER_AUTH = "true"
ENABLE_D1_PLANS = "true"
ENABLE_D1_METRICS = "true"
ENABLE_D1_PROFILE = "true"
ENABLE_D1_GOALS = "true"
ENABLE_D1_ADAPTIVE = "true"
ENABLE_D1_NOTIFICATIONS = "true"
```
Build and deploy:
```bash
# [NOT EXECUTED - REQUIRES HUMAN AUTHORIZATION]
npm run build:worker
npx wrangler deploy --config wrangler.toml
```

### Step 4.3: Health Probes & Canary Validation `[NOT EXECUTED]`
Probe implemented, real endpoints on their Cloudflare routes before modifying DNS:
1. **Probe Auth Worker Endpoint**:
   ```bash
   curl -i https://shedbody-auth-worker.amitforge.workers.dev/api/auth/health
   # OR
   curl -i https://shedbody-auth-worker.amitforge.workers.dev/health
   ```
   **Expected Response:** HTTP 200 with JSON:
   ```json
   {
     "status": "active",
     "service": "shedbody-auth-worker",
     "enabled": true,
     "hasD1Binding": true
   }
   ```
2. **Probe Next.js App Worker Endpoints**:
   ```bash
   # Public Home Route (Must return HTTP 200 containing "ShedBody")
   curl -i https://shedbody.amitforge.workers.dev/

   # Login Route (Must return HTTP 200)
   curl -i https://shedbody.amitforge.workers.dev/login

   # Auth Proxy Health (Must proxy upstream to Auth Worker returning HTTP 200)
   curl -i https://shedbody.amitforge.workers.dev/api/auth/health
   ```
   > [!IMPORTANT]
   > Do **NOT** probe `/api/health`. That route does not exist in the Next.js application and will return HTTP 404.

### Step 4.4: Authoritative DNS Cutover `[NOT EXECUTED]`
In Cloudflare DNS Dashboard:
1. Update `shedbody.com` and `www.shedbody.com` routing from Vercel (`cname.vercel-dns.com`) to Cloudflare Workers (`shedbody`).
2. Verify SSL/TLS edge certificate status is `Active`.

---

## 7. Post-Cutover Rollback Analysis & Operational Constraints

> [!WARNING]
> **CRITICAL ARCHITECTURAL WARNING: POST-CUTOVER ROLLBACK IS NOT SAFELY EXECUTABLE**
> Reverting DNS back to Supabase/Vercel after live user traffic has begun writing to Cloudflare D1 **WILL RESULT IN USER DATA LOSS OR STATE DIVERGENCE**.
> There is currently no active bidirectional Change Data Capture (CDC) or continuous replication pipeline syncing D1 back to Supabase PostgreSQL.

### Write-Capable Tables Subject to Post-Cutover Mutation
The following 16 tables accept mutations in production:
1. `user` (New user registrations, profile name updates)
2. `session` (Session creations, revocations, logouts)
3. `account` (New OAuth account linkages)
4. `user_profiles` (Weight, height, streak count, XP updates)
5. `goals` (New goals, status transitions to `achieved`/`abandoned`)
6. `plans` (New plan generations, plan deactivations via `deleted_at`)
7. `habit_entries` (Daily habit toggles and updates)
8. `metric_entries` (New body/weight entries, soft deletions via `deleted_at`)
9. `nutrition_logs` (Daily calorie/water consumption updates)
10. `lifestyle_logs` (Daily sleep/step updates)
11. `adaptation_events` (AI plan adaptation records)
12. `notification_preferences` (Preference toggles)
13. `notifications` (System notifications, read-receipt updates via `is_read`)
14. `calculator_results` (Saved user calculations, soft deletions)
15. `article_feedback` (New reader feedback submissions)
16. `contact_submissions` (New contact form inquiries)

### Why Simple Timestamp Filtering (`created_at >= T_cutover`) Fails
1. **Existing Record Updates:** Pre-existing users and domain records created before cutover have `created_at < T_cutover`. When an existing user logs weight, completes a habit, or updates their profile, filtering by `created_at >= T_cutover` **completely misses these updates**, causing silent data regression upon rollback.
2. **Hard Deletions:** Hard deletes (e.g., session destruction on logout or account deletion) leave zero trace in SQLite/D1 without an audit log table.
3. **Missing `updated_at` on Some Tables:** `metric_entries` and `notifications` track `deleted_at` or `is_read` but lack `updated_at`.

### Operational Rollback Directive
- **Pre-DNS Cutover:** Rollback is **100% Lossless**. If issues occur during canary testing before DNS change, leave DNS on Vercel/Supabase.
- **Post-DNS Cutover:** **DO NOT ATTEMPT AUTOMATED ROLLBACK.** The operational strategy must be **FIX FORWARD**.
- If an emergency reversion to Vercel/Supabase is unavoidable:
  1. Declare an immediate emergency maintenance window.
  2. Put Cloudflare routes into read-only mode by setting feature flags to `"false"`.
  3. Perform a table-by-table differential dump between D1 and Supabase PostgreSQL.
  4. Manually reconcile delta rows and user identities into Supabase before switching DNS back.

---

## 8. Cutover Readiness Checklist

| Prerequisite Item | Status | Verification Evidence & Scope |
|---|---|---|
| **D1 Runtime Binding Resolver** | **VERIFIED** | Tested in `scripts/cf-d1-binding.test.js` (17/17 passed across isolate mocks, OpenNext context resolution, and string pseudo-binding defense). |
| **Configuration Isolation** | **VERIFIED** | Audited in `wrangler.toml` and `workers/auth-worker/wrangler.toml`; staging UUID `1e24679a-e0b6-4b97-ad84-023e972eca52` strictly isolated from production placeholder. |
| **Backup Immutability** | **VERIFIED** | Source hash `AC5D669270CEEA46D2C992BDBF63228FE9975EEFA54915000826FDB85768189F` verified across all test executions. |
| **D1 Schema Migration Chain** | **VERIFIED** | Verified with real `d1-migrations/` files (0000..0007) in `scripts/cf-12-batch-rehearsal.test.js` with `PRAGMA foreign_keys = ON`. |
| **Data Migration & Idempotency** | **VERIFIED** | Verified in `scripts/cf-12-batch-rehearsal.test.js` (177 rows + 8 seeded metrics; 0 FK violations, 0 row inflation on rerun). |
| **DAL Repositories** | **VERIFIED** | Verified in `scripts/test_d1_repositories.js` (12/12 domain repositories passing). |
| **Auth Proxy Edge Security** | **VERIFIED** | Verified in `scripts/cf-5d-3d-14a-proxy-security.test.js` (30/30 security tests passing). |
| **OpenNext Worker Build** | **VERIFIED** | Verified via `npm run build:worker` (Compiled 78/78 static pages, generated bundle `.open-next/worker.js`, exit code 0). |
| **Staging Live Deployment Smoke Test** | **VERIFIED** | Verified in `scripts/staging-smoke-test.mjs` against live staging endpoints (HTTP 200/503 gates passing). |
| **Post-Cutover Rollback Strategy** | **UNRESOLVED LIMITATION** | **Cannot guarantee lossless rollback after live writes.** Documented as "Fix Forward" or emergency maintenance differential. |
| **Production Cloudflare D1 Provisioning** | **PENDING** | **Requires Human Authorization** (`wrangler d1 create shedbody-d1`). |
| **Production Secrets Provisioning** | **PENDING** | **Requires Human Authorization** (`wrangler secret put`). |
| **Production Data Migration Execution** | **PENDING** | **Requires Human Authorization** (Applying 4 SQL batch files to remote production D1). |
| **Authoritative DNS Cutover** | **PENDING** | **Requires Human Authorization** (Pointing `shedbody.com` to Cloudflare). |

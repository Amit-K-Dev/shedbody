# ShedBody — CF-4 Phase 2 Runtime Integration Design Report

**Status**: DESIGN REPORT (REVISED WITH DESIGN CORRECTIONS)  
**Date**: 2026-10-20  
**Phase**: CF-4 Phase 2 — Final Design Corrections Gate  
**Objective**: Revise the CF-4 Phase 2 runtime integration design after validating authentication, runtime topology, data consistency, failure semantics, privacy, and reconciliation assumptions against repository evidence. This is a strictly read-only design document.

---

## 1. Executive Summary & Locked Decisions

This document provides the revised, evidence-grounded runtime integration design for **CF-4 Option C** (Supabase Auth as the authoritative Identity Provider + Cloudflare D1 `"user"` table as a downstream relational projection).

### Locked Decisions Confirmed
1. **Supabase Auth remains the sole identity authority**: No competing authentication engines (e.g., Better Auth) will be deployed as an authority. D1 `"session"`, `"account"`, and `"verification"` tables remain unused.
2. **D1 `"user"` is strictly a downstream relational projection**: The table exists exclusively to satisfy foreign-key referential integrity (`REFERENCES "user"("id") ON DELETE CASCADE`) across all 11 user-owned domain tables in Cloudflare D1.
3. **Vercel + Supabase production behavior remains unchanged**: The live production application running on Vercel with Supabase PostgreSQL and Supabase Auth continues to operate normally. No production traffic, routing, or database behaviors are modified.
4. **Target architecture remains Cloudflare Workers + D1 + R2**: Future production workloads will transition to Cloudflare edge infrastructure.
5. **JavaScript only; no TypeScript**: All code, adapters, guards, and test harnesses adhere strictly to vanilla JavaScript (`.js` / `.mjs`).
6. **All `ENABLE_D1_*` feature flags remain default-off**: Opt-in feature flags remain strictly disabled (`"false"`) in all production configuration.
7. **Strictly read-only evaluation**: No cloud infrastructure deployment, no DNS modifications, no production database access or exports, no migration execution, no callback hook installation, no secrets modifications, no git commits, and zero destructive actions.
8. **Worktree preservation**: All existing worktree changes are preserved.

---

## 2. Findings, Inferences, and Assumptions by Domain

Every statement in this report is explicitly classified as one of:
- **`[INSPECTED EVIDENCE]`**: Directly verifiable from inspected files and line ranges in this repository.
- **`[INFERENCE]`**: Logical deduction based strictly on verified evidence.
- **`[UNVERIFIED ASSUMPTION]`**: A claim that cannot be proven from local repository inspection alone and requires external/production verification.

---

### 2.1 Supabase JWT Signing Mode & Verification Architecture

#### Inspected Evidence vs. Unverified Production Assumptions
- **`[INSPECTED EVIDENCE]`**:
  - In [supabase/config.toml:L163-L173](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/supabase/config.toml#L163-L173), `jwt_expiry = 3600` (1 hour) and `enable_refresh_token_rotation = true`, while `signing_keys_path = "./signing_keys.json"` is commented out.
  - In [.env.local:L3,L5](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/.env.local#L3-L5), local environment token headers decode to `{"alg":"HS256","typ":"JWT"}`.
  - In [lib/supabase/server.js:L4-L28](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/supabase/server.js#L4-L28), sessions are managed by `@supabase/ssr` using `sb-<project-ref>-auth-token` (and chunked `.0`, `.1` cookies when size exceeds 4KB).
- **`[INFERENCE]`**:
  - The local Supabase CLI development environment generates and verifies tokens using symmetric **HS256** signed with the local JWT secret.
- **`[UNVERIFIED ASSUMPTION]`**:
  - **The hosted production Supabase project's JWT signing algorithm cannot be determined from local files alone**. While local defaults use HS256, Supabase hosted projects may be configured for symmetric HS256 (via `SUPABASE_JWT_SECRET`) or asymmetric RS256/ES256 (via GoTrue asymmetric keys and JWKS). Production signing mode must be verified prior to cutover via an approved read-only method (e.g., inspecting token headers or querying `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`) without printing secret values or tokens.

#### Verification Architecture & Fail-Closed Invariants
1. **Algorithm Whitelist & Fail-Closed Handling**:
   - The edge verifier must enforce a strict algorithm whitelist: `["HS256"]` if symmetric secret is configured, or `["RS256", "ES256"]` if JWKS is configured.
   - Any token specifying an unexpected algorithm, an unapproved algorithm, or `alg: "none"` must **fail closed immediately** (HTTP 401 Unauthorized).
   - If verification dependencies are unavailable (e.g. JWKS endpoint unreachable, network timeout, or missing `SUPABASE_JWT_SECRET` binding), the verifier must **fail closed immediately** (HTTP 500 / 503). It must **never fall back to unverified claim decoding**.
2. **Exact Claims Validation Requirements**:
   - `signature`: Verified via Web Crypto (`crypto.subtle.verify`).
   - `iss` (Issuer): Must strictly match `https://<project-ref>.supabase.co/auth/v1` (or local equivalent).
   - `aud` (Audience): Must strictly equal `"authenticated"`.
   - `exp` (Expiry): `Math.floor(Date.now() / 1000) < payload.exp` (with max 30s clock-skew tolerance).
   - `nbf` (Not Before): `Math.floor(Date.now() / 1000) >= payload.nbf - 30` (if present).
   - `sub` (Subject): Must be present and conform to RFC 4122 UUID.
3. **Cookie Extraction Security Contract**:
   - Reconstruct chunked session cookies (`.0`, `.1`).
   - Extract raw `access_token` string.
   - **Perform cryptographic signature and claims verification before trusting any payload fields**. Decoded claims must NEVER be treated as verified identity prior to signature validation.
4. **Revocation Boundaries**:
   - `[INFERENCE]`: Local JWT verification is stateless and valid only for the token's lifetime (`exp`). It cannot detect immediate user logouts, password changes, or administrative bans before token expiry.
   - High-privilege mutations (e.g. account deletion, email change, role changes) or routes with strict revocation requirements must perform an authoritative server-side call to `supabase.auth.getUser(token)` against GoTrue.

---

### 2.2 Runtime & Deployment Topology

- **`[INSPECTED EVIDENCE]`**:
  - Next.js dynamic routes, SSR pages, and Server Actions ([lib/storage.js:L1](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/storage.js#L1), [lib/goals.js:L1](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/goals.js#L1), [lib/actions/profile.js:L1](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/actions/profile.js#L1), [lib/actions/logout.js:L1](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/actions/logout.js#L1)) execute inside Vercel's Node.js runtime.
  - [wrangler.toml:L3](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/wrangler.toml#L3) specifies `pages_build_output_dir = ".vercel/output/static"`. It does NOT configure `@cloudflare/next-on-pages` or a custom edge SSR worker.
  - [package.json:L34,L42,L43](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/package.json#L34) includes native Node.js dependencies (`better-sqlite3`, `nodemailer`, `pg`) that crash in Cloudflare Workers isolates.
- **`[INFERENCE]`**:
  - Vercel Server Actions cannot access `env.DB` (D1 binding) because `env.DB` is an internal isolate capability available only on Cloudflare's network.
  - **DNS changes alone do NOT migrate Next.js Server Actions**. Proxying DNS to Cloudflare leaves Server Actions executing on Vercel without access to D1.
- **Route Classification Matrix**:
  - *Worker-Compatible*: Pure HTTP API routes using Web Request/Response APIs ([lib/api/pythonClient.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/api/pythonClient.js), [lib/repositories/D1Adapter.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/repositories/D1Adapter.js), [lib/auth/projection.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth/projection.js), [lib/notifications/scheduledWorker.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/notifications/scheduledWorker.js)).
  - *Requires Migration / Adaptation*: `app/api/auth/[...all]/route.js` (eliminating `better-sqlite3`), and transactional email dispatch (`nodemailer` SMTP must migrate to an HTTP API like Resend).
  - *Must Stay on Vercel Until Replaced*: All Next.js Server Actions and React Server Components (RSC) that depend on Next.js server runtime.

---

### 2.3 Strict Write Semantics: Zero Silent Cross-Store Fallbacks

- **`[INSPECTED EVIDENCE]`**:
  - In [lib/goals.js:L36-L50](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/goals.js#L36-L50) and [lib/storage.js:L88-L100,L128-L141](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/storage.js#L88-L100), existing code catches D1 write errors and falls back to Supabase RPCs (`create_weight_goal`, `upsert_plan`, `soft_delete_plan`).
- **`[INFERENCE]`**:
  - This catch-and-fallback pattern violates data consistency. If a D1 write times out or disconnects after being dispatched, SQLite may have committed the write. Executing the fallback against Supabase creates duplicate rows, divergent UUIDs, and split-brain states.

#### Mandatory Write Semantics Invariant
**If a request selects the D1 write path, any failure MUST fail closed. The system MUST NEVER automatically fall back to Supabase for any failed D1 write.**

#### Explicit Store Selection Modes
The architecture strictly forbids silent, per-request cross-store switching on write. Instead, the application supports two mutually exclusive, explicitly selected operational modes:
1. **Supabase-Only Mode** (`ENABLE_D1_* = "false"` or `DATA_STORE = "supabase"`):
   - All writes flow authoritatively to Supabase PostgreSQL RPCs.
   - D1 is not touched; no fallback logic is engaged.
2. **D1 Primary Mode** (`ENABLE_D1_* = "true"` or `DATA_STORE = "d1"`):
   - All writes flow exclusively to Cloudflare D1.
   - If `env.DB` is missing, pre-dispatch validation fails, a timeout occurs, or SQLite returns a constraint violation: **The request fails closed immediately**.

#### Detailed Write Failure Classification Matrix:
| Failure Scenario | Classification | Fallback to Supabase? | Prescribed System Action | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Missing D1 Binding** | System Configuration Error | **STRICTLY PROHIBITED** | Fail closed with HTTP 500 (Configuration Error). Log structured alert. | Route was configured for D1 writes; missing binding is a fatal infrastructure defect, not an opportunity for silent fallback. |
| **Pre-Dispatch Error** | Validation / Client Error | **STRICTLY PROHIBITED** | Fail closed with HTTP 400 (Bad Request). | Input validation failed before statement dispatch; switching stores cannot make invalid input valid. |
| **Constraint Violation** | SQLite `SQLITE_CONSTRAINT_*` | **STRICTLY PROHIBITED** | Fail closed with HTTP 400 / 409 (Conflict). | D1 actively evaluated and rejected the mutation; falling back to Supabase bypasses relational rules and masks bugs. |
| **Timeout / Unknown Outcome** | Dispatched Statement Timeout | **STRICTLY PROHIBITED** | Fail closed with HTTP 503 (Service Unavailable) + `operation_id`. | D1 may have committed the write. Retrying against Supabase guarantees duplicate writes and split-brain divergence. |

#### Safe Reconciliation of Unknown Commit Outcomes via Idempotency Keys
To safely recover from Tier 4 unknown commit outcomes without cross-store mutation:
1. **Operation ID Transmission**: Every mutating request must include a client-generated or gateway-generated `Idempotency-Key` or `operation_id` (UUIDv4).
2. **Idempotency Registration**: When D1 executes a mutation, the `operation_id` is recorded atomically within the transaction (or stored as a deterministic primary/unique key).
3. **Timeout Handling**: When a timeout occurs, the client receives HTTP 503 with `{ error: "D1_WRITE_TIMEOUT_UNKNOWN_OUTCOME", operation_id }`.
4. **Deterministic Reconciliation**:
   - The client or a background reconciliation worker re-submits the mutation using the **same `operation_id`**.
   - D1 checks if the `operation_id` was already committed. If found, D1 returns the existing record without re-executing business logic. If not found, D1 executes the mutation.
   - **Under no circumstances is the operation retried against Supabase**.

---

### 2.4 Read Semantics: Consistency-Classified Fallback

Not all read timeouts are safe for Supabase fallback. Falling back to Supabase after an immediate D1 write can cause **stale read anomalies** (violating Read-Your-Own-Writes consistency).

#### Read Consistency Classes:
1. **Class A: Strong / Read-Your-Own-Writes Consistency**:
   - *Scope*: Active plan management, current weight goal editing, metric entries logged in the active session.
   - *Constraint*: If D1 was the primary write target, falling back to Supabase PostgreSQL could return stale, outdated, or missing records.
   - *Prescribed Behavior*: **FAIL CLOSED** (HTTP 503 Service Unavailable / "Data temporarily unavailable"). Never serve stale data from an alternate store when strong consistency is required.
2. **Class B: Eventual / Bounded-Staleness Consistency**:
   - *Scope*: Historical trend analytics (e.g. 90-day progress charts), public blog posts/articles, notification preferences.
   - *Constraint*: A small replication delay or bounded staleness is tolerable.
   - *Prescribed Behavior*: Fallback to Supabase is **PERMITTED ONLY IF** explicitly configured as an allowed bounded-staleness fallback.
   - *Mandatory Source Recording*: Whenever a Class B fallback occurs:
     - The event must be recorded in structured telemetry: `logger.warn('read.d1.fallback', { domain, operation, fallbackSource: 'supabase' })`.
     - The HTTP response must explicitly declare the data source: `X-Data-Source: supabase-fallback`, `X-Data-Consistency: eventual`.
3. **Class C: Unconfigured / Missing Binding Pre-Check**:
   - If the application is in Supabase-Only Mode, it reads from Supabase directly.
   - If the application is in D1 Primary Mode and `env.DB` is absent, it fails closed with HTTP 500.

---

### 2.5 User Projection Correctness Audit

- **`[INSPECTED EVIDENCE]`**:
  - [lib/auth/projection.js:L113-L187](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth/projection.js#L113-L187): `validateAndMapSupabaseUser` strictly requires an authenticated server-side user object.
  - [lib/auth/projection.js:L25-L36](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth/projection.js#L25-L36): `isValidUuid` enforces RFC 4122 compliance (`/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`).
  - [lib/auth/projection.js:L344-L354,L383-L393](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth/projection.js#L344-L354): Queries D1 for existing users by email. If an existing record has a different ID, it throws `PROJECTION_CONFLICT`. Existing user IDs cannot be overwritten by another user claiming the same email.
  - [lib/auth/projection.js:L427-L458](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth/projection.js#L427-L458): `withUserProjectionGuard` intercepts foreign-key errors. It queries `checkUserExistsInD1(db, verifiedUser.id)`. If the user already exists, it immediately rethrows the original error without attempting projection. If and only if the verified user is missing from D1, it projects the user and retries the mutation **at most once**.
  - [lib/auth/projection.js:L320-L330](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth/projection.js#L320-L330): Uses exclusively `INSERT INTO "user" ... ON CONFLICT("id") DO UPDATE`. There are **zero DELETE statements**. User bans, logins, or synchronizations never delete user records or trigger foreign-key cascades.
- **`[INFERENCE]`**:
  - The projection utility satisfies all identity projection requirements without risk of cross-tenant overwrite, cascade deletion, or infinite retry loops.

---

### 2.6 Existing-User Seeding & Privacy Architecture

- **`[INSPECTED EVIDENCE]`**:
  - [lib/notifications/scheduledWorker.js:L13-L67](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/notifications/scheduledWorker.js#L13-L67) imports only `D1Adapter`, `ProfileRepository`, and `NotificationRepository`. It processes notifications solely for existing D1 profiles.
  - **The scheduled Worker contains NO Supabase Admin credentials (`createAdminClient`) and NO user reconciliation or seeding logic**.
- **`[INFERENCE]`**:
  - Claiming that the existing scheduled Worker already reconciles users is false. User reconciliation and bulk seeding is a **future administrative task**.

#### Administrative Seeding Specification (`scripts/admin-seed-users.js`)
1. **Zero Access to Production Data**:
   - This script is an offline specification. It **must not be executed against production databases** during this phase.
2. **Minimal Pseudonymous Audit Records (Privacy Standard)**:
   - **No raw emails, names, phone numbers, password hashes, or tokens may be written to quarantine files, logs, or reports**.
   - The quarantine log (`quarantine_users.json`) stores ONLY minimal pseudonymous correlation records:
     ```json
     {
       "userRef": "fnv1a_a1b2c3d4",
       "conflictType": "email_collision",
       "existingUserRef": "fnv1a_e5f67890",
       "timestamp": 1776681600
     }
     ```
   - Operator resolution of quarantined conflicts must use an access-controlled, authenticated administrative tool with strict audit logging, never an unencrypted plain-text file.
3. **Deterministic Identity Reconciliation (Beyond Row Counts)**:
   - Comparing `COUNT(*)` alone is insufficient (e.g. 100 rows in both systems can mask 5 mismatched IDs).
   - Reconciliation must perform a deterministic set-difference check comparing Supabase Auth UUIDs against D1 `"user"` UUIDs:
     - `matchedUuidsCount`: Exact UUID match in both systems.
     - `missingInD1`: Supabase UUIDs not yet projected to D1.
     - `orphansInD1`: D1 UUIDs with no parent in Supabase Auth.
     - `quarantinedCollisions`: Conflicting identities requiring manual review.
   - Any unmatched UUID or orphan halts cutover progression.
4. **Safe Pagination, Retry Limits, and Abort Conditions**:
   - **Dry-run by default**: `--dry-run` is mandatory unless explicitly overridden with `--execute`.
   - **Sequential pagination**: 100 users per page using `supabase.auth.admin.listUsers({ page, perPage: 100 })`.
   - **Retry limits**: Maximum 3 retries with exponential backoff and jitter (1s, 2s, 4s) on transient network errors.
   - **Abort criteria**: Execution immediately aborts if:
     - 3 consecutive batch writes fail.
     - Collision/quarantine rate exceeds 0.5% of total users.
     - Any unrecoverable schema or constraint violation occurs.

---

## 3. Corrected Architecture & Trust Boundaries

```
[ CLIENT BROWSER ]
       │
       ├─────────────────────────────────┐
       ▼ (Direct Passwordless Auth)      ▼ (HTTPS Request + Cookie/Bearer)
[ Supabase Auth (GoTrue) ]        [ TRUST BOUNDARY: API GATEWAY ]
  - Sole Identity Authority       Cloudflare Worker / Vercel Edge
  - Issues JWTs & Cookies                │
                                         ▼
                            [ Web Crypto JWT Verifier ]
                             - Strict Algorithm Whitelist (HS256/RS256)
                             - Validates iss, aud, exp, sub
                             - Fails closed on unknown alg/bad key
                             - Checks claims BEFORE trust
                                         │
                                         ├──────────────────────────────┐
                                         ▼ (Fast Read / Normal Write)   ▼ (High-Privilege Write)
                            [ D1 User Projection Guard ]   [ Remote Supabase Auth Check ]
                             - JIT projects missing user    - supabase.auth.getUser()
                             - Preserves exact UUIDs        - Detects bans / immediate revocation
                             - Fails closed on any D1 error
                                         │
                                         ▼
                            [ Cloudflare D1 Database ]
                             - "user" table (Projection)
                             - 11 domain tables (FK cascades)
                             - Idempotency / operation_id tracking
```

---

## 4. Security & Integration Test Matrix

| Test Identifier | Category | Target Component | Existing Coverage | Proposed New Test / Specification |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | JWT Validation | Edge Verifier | — | Valid HS256 & RS256 token verification using Web Crypto |
| **AUTH-02** | JWT Expiration | Edge Verifier | — | Token with `exp < now` rejected with 401 |
| **AUTH-03** | JWT Tampering | Edge Verifier | — | Modified payload, bad signature, or `alg: "none"` rejected with 401 |
| **AUTH-04** | JWT Issuer/Audience | Edge Verifier | — | Token with incorrect `iss` or `aud !== "authenticated"` rejected with 401 |
| **AUTH-05** | Key Rotation | Edge Verifier | — | Token with new `kid` triggers cache refresh from JWKS |
| **AUTH-06** | JWKS Failure | Edge Verifier | — | JWKS unreachable fails closed (500/503), never accepts unverified claims |
| **AUTH-07** | Cross-Tenant Security| Repositories | `cf-3-tenant-isolation.test.js`, `cf-4-projection.test.js` (Test 12) | Verified session user cannot query or mutate another user's records |
| **PROJ-01** | Idempotent Sync | Projection | `cf-4-projection.test.js` (Suite 5) | Repeated projection of identical user succeeds without changes |
| **PROJ-02** | Email Conflict | Projection | `cf-4-projection.test.js` (Suite 6) | Differing UUID with same email throws `PROJECTION_CONFLICT`, preserves existing user |
| **PROJ-03** | Missing-User JIT | JIT Guard | `cf-4-projection.test.js` (Suite 9) | Missing parent user triggers 1 projection and 1 mutation retry |
| **PROJ-04** | Unrelated FK Guard | JIT Guard | `cf-4-projection.test.js` (Suite 10)| Missing plan/goal/habit throws FK error immediately; zero retries |
| **FAIL-01** | Write Pre-Dispatch | Repositories | — | Missing `env.DB` in D1 mode fails closed with HTTP 500; NO fallback |
| **FAIL-02** | Write Unknown Outcome| Repositories | — | Dispatched D1 write timeout fails closed with 503 + `operation_id`; NO Supabase retry |
| **FAIL-03** | Constraint Reject | Repositories | — | `SQLITE_CONSTRAINT_*` fails closed with 400/409; NO Supabase fallback |
| **READ-01** | Strong Read Failure | Repositories | — | D1 timeout on Class A read fails closed with 503; NO stale fallback |
| **READ-02** | Eventual Read Fallback| Repositories | — | D1 timeout on Class B read records fallback telemetry and response header |
| **SEED-01** | Seeding Reconciliation| Admin Seeding | `cf-11-rehearsal.test.js` | Full UUID set-difference reconciliation detects 100% matched identities |
| **SEED-02** | Seeding Privacy | Admin Seeding | — | Quarantined collisions contain only pseudonymized refs; 0 emails logged |
| **RNTM-01** | Isolate Compatibility| Worker Runtime | `cf-10-runtime.test.js` | Worker scripts execute without Node built-in globals |

---

## 5. Recommended Next Implementation Phase and Prerequisites

### Prerequisites Before Implementation:
1. **Owner Approval of this Revised CF-4 Phase 2 Design Report**.
2. **Verification of Remote Supabase Production JWT Signing Mode**: Query `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json` and inspect a live token header using an approved read-only method.
3. **Refactoring of Unsafe Write Fallbacks**: Modify [lib/goals.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/goals.js) and [lib/storage.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/storage.js) to eliminate silent cross-store fallbacks on D1 write failure, replacing them with fail-closed semantics and explicit mode selection.
4. **Architectural Approval of Gateway Topology**: Confirm the private API gateway contract between Vercel Server Actions and Cloudflare Workers.

### Recommended Next Implementation Phase:
- **CF-4 Phase 2 Implementation Gate**:
  1. Implement `lib/auth/edgeJwtVerifier.js` with Web Crypto, strict algorithm whitelisting, and fail-closed handling.
  2. Implement `scripts/admin-seed-users.js` with default dry-run mode, pseudonymous quarantine logging, and UUID set-difference reconciliation.
  3. Implement `scripts/cf-4-d1-failure-semantics.test.js` and `scripts/cf-4-jwt-verification.test.js`.

---

## 6. Files Inspected and Commands Actually Executed

### Files Inspected:
1. [supabase/config.toml](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/supabase/config.toml) — Inspected auth parameters, token expiration, and signing key configuration.
2. [.env.local](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/.env.local) — Inspected local token headers (`HS256`) without printing secrets.
3. [lib/supabase/server.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/supabase/server.js) — Inspected `@supabase/ssr` server client and cookie handling.
4. [lib/supabase/admin.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/supabase/admin.js) — Inspected administrative service role client.
5. [lib/supabase/client.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/supabase/client.js) — Inspected browser Supabase client.
6. [wrangler.toml](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/wrangler.toml) — Inspected Cloudflare configuration, D1 database binding, and R2 bucket binding.
7. [package.json](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/package.json) — Inspected Node-specific dependencies (`better-sqlite3`, `nodemailer`, `pg`).
8. [vercel.json](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/vercel.json) — Inspected Vercel cron configuration for notification sync.
9. [next.config.mjs](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/next.config.mjs) — Inspected image domains and CSP security headers.
10. [lib/auth/projection.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth/projection.js) — Verified user projection validation, email conflict checks, and JIT guard invariants.
11. [lib/repositories/D1Adapter.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/repositories/D1Adapter.js) — Verified D1 database binding checks, statement execution, and error code preservation.
12. [lib/goals.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/goals.js) — Identified unsafe write fallback to Supabase RPC on catch.
13. [lib/storage.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/storage.js) — Identified unsafe write fallback to Supabase RPC on catch for plans.
14. [lib/notifications/scheduledWorker.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/notifications/scheduledWorker.js) — Confirmed absence of Supabase Admin credentials and user reconciliation logic.
15. [lib/notifications/cronHandler.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/notifications/cronHandler.js) — Inspected Vercel/Next.js cron handler and user sync fallback logic.
16. [app/(auth)/auth/callback/route.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/app/%28auth%29/auth/callback/route.js) — Inspected OAuth/OTP callback exchange and confirmed absence of unapproved D1 hooks.
17. [app/api/auth/[...all]/route.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/app/api/auth/%5B...all%5D/route.js) — Inspected Better Auth API handler and environment binding usage.
18. [lib/auth.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth.js) — Inspected Better Auth configuration and native `better-sqlite3` dependency.
19. [scripts/cf-4-projection.test.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/scripts/cf-4-projection.test.js) — Inspected test coverage across 55 test assertions.
20. [scripts/cf-10-runtime.test.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/scripts/cf-10-runtime.test.js) — Inspected runtime isolation and binding assertions.
21. [docs/cf-4-identity-decision-report.md](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/docs/cf-4-identity-decision-report.md) — Cross-referenced original Option C architectural decision report.

### Commands Actually Executed:
- **Zero terminal commands were executed** during this read-only reconnaissance and design correction phase, strictly complying with the Command Execution Permission Rule and the prompt's READ-ONLY constraint.
- Historical test results from CF-4 Phase 1 (`cf-4-projection.test.js`: 55/55 passed) and CF-11 (`cf-11-rehearsal.test.js`: 24/24 passed) are cited as prior evidence from earlier test executions, and are not claimed as newly executed during this turn.

---

## 7. Final Architectural Verdict

`CF-4 PHASE 2 DESIGN READY FOR IMPLEMENTATION REVIEW`

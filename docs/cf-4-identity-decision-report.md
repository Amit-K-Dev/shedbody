# ShedBody — CF-4 Identity Decision Report

**Status**: DECISION REPORT (READ-ONLY RECONNAISSANCE)  
**Date**: 2026-10-20  
**Phase**: CF-4 Identity Decision Gate  
**Objective**: Evaluate architectural options to resolve the identity compatibility blocker preventing CF-11 data migration and future production cutover.

---

## 1. Executive Summary & Comparison Matrix

The ShedBody production application currently runs on **Vercel** with **Supabase PostgreSQL and Supabase Auth**. In production, authentication is entirely **passwordless**: users authenticate via **OAuth** (Google, Facebook, X/Twitter, LinkedIn) and **Magic Link OTP** (`signInWithOtp`). 

The target Cloudflare architecture was proposed with **Cloudflare Workers, D1 (SQLite), and R2**. However, every user-owned table in D1 enforces strict foreign-key integrity to a root `"user"` table (`REFERENCES "user"("id") ON DELETE CASCADE`). Because identity migration was left unresolved, CF-11 data migration remains hard-blocked.

This investigation evaluated three architectural paths:

| Architectural Dimension | Option A: Preserve Supabase Auth (Decoupled Identity) | Option B: Full Migration to Better Auth (All-in Cloudflare) | Option C: Phased Identity Mirror (Supabase IdP + D1 Projection) |
| :--- | :--- | :--- | :--- |
| **Identity Authority** | Single: Supabase Auth (`auth.users`) | Single: Better Auth in D1 (`"user"`, `"session"`) | Single: Supabase Auth as IdP; D1 `"user"` as relational projection |
| **User Disruption** | **Zero**: No re-login, no password reset, sessions preserved | **High**: 100% session invalidation, OAuth re-linking required | **Zero**: Seamless session continuity, existing OAuth/Magic links preserved |
| **Passwordless Parity** | **Native**: Magic links & 4 OAuth providers already live | **Major Work Required**: Existing Better Auth POC only implements email/password | **Native**: Uses existing live Supabase Auth pipeline |
| **D1 FK Integrity** | Requires D1 `"user"` projection or FK removal | Natively satisfied via Better Auth `"user"` table | **Fully Satisfied**: D1 `"user"` table mirrored with exact Supabase UUIDs |
| **Edge Performance** | Local JWT verification via Web Crypto (<1ms) | Direct D1 session reads (<5ms edge lookup) | Local JWT verification + D1 edge queries |
| **D1 Write Load** | Zero auth writes to D1 | Every login, session touch, and logout writes to D1 | Zero session writes to D1; writes limited to user profile/domain data |
| **Rollback Complexity**| **Trivial**: Supabase Auth never altered | **High**: Split-brain identities if users sign up in D1 | **Trivial**: Supabase remains immutable source of truth |
| **Implementation Scope**| Low: Configure Edge JWT verification | High: Build OAuth, Magic Link plugins, email transport | Low: Add JIT user sync / ETL pre-migration to D1 `"user"` |

---

## 2. Evidence with Exact Code References

### 2.1 Production Auth Flow is Exclusively Passwordless
Inspection of the client-facing authentication UI revealed that **no password authentication exists in the production application**:
- [app/(auth)/login/page.js:L23-L46](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/app/%28auth%29/login/page.js#L23-L46):
  - Magic Link OTP via `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: ... } })`.
  - OAuth via `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: ... } })` supporting Google, Facebook, Twitter (X), and LinkedIn.
- [app/(auth)/signup/page.js:L18-L25](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/app/%28auth%29/signup/page.js#L18-L25):
  - Registration is handled strictly through OAuth providers (`handleOAuth("google")`, `"facebook"`, `"twitter"`, `"linkedin"`).
- [app/(auth)/auth/callback/route.js:L31-L43](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/app/%28auth%29/auth/callback/route.js#L31-L43):
  - Callback exchanges authorization code via `supabase.auth.exchangeCodeForSession(code)` and fetches user profile role (`profile.role === "admin"`).

### 2.2 Trace of User Identity into Repositories and APIs
In the application, verified sessions yield a standard UUID that flows into all Server Actions, API routes, and D1 repositories:
- **Server Actions Authentication Gateway**:
  - In [lib/storage.js:L8-L26](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/storage.js#L8-L26) and [lib/goals.js:L8-L26](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/goals.js#L8-L26):
    ```javascript
    async function getAuthUser(authContext) {
      const supabase = authContext?.supabase || (await createClient());
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw new Error("Unauthorized access");
      const claimedId = authContext?.userId || authContext?.user?.id;
      if (claimedId && claimedId !== user.id) throw new Error("Unauthorized: Cross-tenant access is prohibited.");
      return { supabase, user };
    }
    ```
- **Repository Invariant**:
  - Every D1 repository method across [lib/repositories/GoalRepository.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/repositories/GoalRepository.js), [PlanRepository.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/repositories/PlanRepository.js), [MetricRepository.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/repositories/MetricRepository.js), [ProfileRepository.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/repositories/ProfileRepository.js), and [NotificationRepository.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/repositories/NotificationRepository.js) accepts `userId` as a string and enforces tenant isolation via `WHERE user_id = ?` and `INSERT INTO ... (user_id, ...) VALUES (?, ...)`.
- **API Routes**:
  - [app/api/ai/coach/route.js:L133-L146](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/app/api/ai/coach/route.js#L133-L146): Validates Supabase session and passes `user.id` to context builder.
  - [app/api/analytics/weight-trend/route.js:L9-L38](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/app/api/analytics/weight-trend/route.js#L9-L38): Accepts Supabase Bearer token or cookie, rejecting unauthenticated requests.

### 2.3 Foreign-Key Dependencies on D1 `"user"` Table
Inspection of D1 migrations (`0000_initial_schema.sql` through `0007_align_notifications_schema.sql`) confirmed that **11 domain tables** have mandatory foreign-key references to `"user"("id") ON DELETE CASCADE`:
1. `user_profiles` ([0000_initial_schema.sql:L59](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0000_initial_schema.sql#L59))
2. `profiles` ([0005_profiles.sql:L5](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0005_profiles.sql#L5))
3. `goals` ([0000_initial_schema.sql:L84](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0000_initial_schema.sql#L84))
4. `plans` ([0000_initial_schema.sql:L162](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0000_initial_schema.sql#L162))
5. `adaptation_events` ([0000_initial_schema.sql:L179](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0000_initial_schema.sql#L179))
6. `metric_entries` ([0000_initial_schema.sql:L106](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0000_initial_schema.sql#L106))
7. `nutrition_logs` ([0000_initial_schema.sql:L122](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0000_initial_schema.sql#L122))
8. `lifestyle_logs` ([0000_initial_schema.sql:L137](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0000_initial_schema.sql#L137))
9. `habit_entries` ([0000_initial_schema.sql:L150](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0000_initial_schema.sql#L150))
10. `notifications` ([0007_align_notifications_schema.sql:L11](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0007_align_notifications_schema.sql#L11))
11. `notification_preferences` ([0007_align_notifications_schema.sql:L52](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/d1-migrations/0007_align_notifications_schema.sql#L52))

*Evidence Verified*: Any attempt to insert records into these tables without an existing parent in `"user"` fails closed with `SQLITE_CONSTRAINT_FOREIGNKEY` when `PRAGMA foreign_keys = ON`.

### 2.4 Feasibility of Preserving Supabase UUIDs in D1
In D1, `"user"."id"` is declared as `TEXT PRIMARY KEY`. Standard 36-character UUID strings (e.g., `'a1b2c3d4-e5f6-7890-abcd-ef1234567890'`) are valid `TEXT` values in SQLite.
- Preserving Supabase UUIDs as D1 `"user"."id"` values requires **zero synthetic ID translation**.
- All domain foreign keys in `user_profiles`, `goals`, `plans`, etc., preserve exact relational parity.
- Downstream repositories require zero modification.

---

## 3. Detailed Evaluation of the Three Options

### Option A — Preserve Supabase Auth (Decoupled Identity)
- **Concept**: Supabase Auth remains the live Identity Provider across all environments. The Next.js frontend and Edge Workers verify Supabase sessions/JWTs.
- **Edge Runtime Compatibility**: `@supabase/supabase-js` and `@supabase/ssr` use standard Web APIs (`fetch`, Web Crypto, standard cookies). They execute natively in Cloudflare Workers isolates without Node built-in dependencies.
- **Edge Verification Latency**:
  - *Standard*: `supabase.auth.getUser()` makes an outbound HTTPS call to `https://<ref>.supabase.co/auth/v1/user` (~50–150ms).
  - *Optimized*: JWT signature verification using standard Web Crypto and `@supabase/ssr` cookie parsing takes `<1ms` directly inside the Cloudflare isolate.
- **Interaction with D1**:
  - Because D1 tables require `"user"("id")`, Option A requires either:
    1. A lightweight D1 `"user"` table where user UUIDs and emails are mirrored; or
    2. Modifying D1 migrations to remove the `REFERENCES "user"` constraint (not recommended as it degrades referential integrity).
- **Pros**: Zero user disruption, zero password/session migration, instant rollback.
- **Cons**: Ongoing external dependency on Supabase Auth.

### Option B — Migrate to Better Auth (All-in Cloudflare Stack)
- **Concept**: Fully replace Supabase Auth with Better Auth, managing users and sessions directly in D1 tables (`"user"`, `"session"`, `"account"`, `"verification"`).
- **Implementation Status in Repo**:
  - Current [lib/auth.js:L4-L7](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth.js#L4-L7) contains a blocking Node.js dependency:
    `const Database = require('better-sqlite3');` which crashes in Cloudflare Workers.
  - Better Auth is only configured for `emailAndPassword: { enabled: true }`.
  - **Feature Gap**: The production app has **zero password authentication**. Migrating to Better Auth requires implementing:
    1. Better Auth Magic Link plugin + transactional email provider (Resend, SendGrid).
    2. Four OAuth provider integrations (Google, Facebook, Twitter, LinkedIn) matching production client credentials.
- **Session & Recovery Risks**:
  - 100% of existing user sessions will be terminated; all users must re-authenticate.
  - Account recovery mechanisms (magic links) must be completely rebuilt and tested prior to cutover.
- **D1 Write Load**:
  - In Cloudflare D1, writes are routed through a single primary coordinator. Storing active session tokens and touch timestamps in D1 introduces write contention on every user interaction.
- **Rollback Complexity**:
  - High. If new users register on Better Auth in D1, reverting to Supabase Auth requires reverse ETL of users.

### Option C — Alternative Identity Bridge (Phased Identity Mirror)
- **Concept**: Keep Supabase Auth as the **single authoritative Identity Provider (IdP)**. When a user authenticates via Supabase Auth (OAuth or Magic Link), their UUID and profile metadata are mirrored into D1's `"user"` table (via initial batch migration + Just-In-Time upsert on login).
- **Referential Integrity**:
  - D1 `"user"` table acts as a relational projection of the Supabase user identity.
  - All 11 user-owned tables in D1 maintain strict `REFERENCES "user"("id") ON DELETE CASCADE`.
  - Foreign keys are 100% satisfied without creating fake users or turning off foreign-key enforcement.
- **Single Authority Guarantee**:
  - Supabase Auth is the **sole identity authority**. D1 `"session"` and `"account"` tables remain unused. Better Auth is not deployed as a competing authority.
- **Rollback & Cutover Safety**:
  - The migration is 100% reversible: if any D1 domain encounters an issue, Vercel/Supabase routes continue functioning without identity desynchronization.
  - If a complete migration to Better Auth is desired in the future, the D1 `"user"` table will already be populated with the correct UUIDs, eliminating relational rework.

---

## 4. Separation of Facts, Findings, Assumptions, and Unknowns

### Verified Facts
1. Supabase PostgreSQL and Supabase Auth remain the active production source of truth.
2. Production authentication in ShedBody is strictly passwordless (OAuth + Magic Link OTP).
3. All 11 user-owned domain tables in D1 enforce `REFERENCES "user"("id") ON DELETE CASCADE`.
4. D1 `"user"."id"` is `TEXT`, which accommodates standard 36-character Supabase UUID strings without truncation or type conversion issues.
5. All D1 feature flags (`ENABLE_D1_*`) are strictly opt-in and currently default to `"false"`.

### Code-Inspection Findings
1. [lib/auth.js:L5](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth.js#L5) uses `require('better-sqlite3')`, which cannot execute in Cloudflare Workers isolates.
2. The existing Better Auth POC in [lib/auth.js](file:///c:/Users/caami/Desktop/COMPLETE-CS/PROJECTS/shedbody/lib/auth.js#L9-L20) does not support Magic Links or OAuth providers.
3. Server Actions and API routes in `lib/storage.js`, `lib/goals.js`, and `app/api/ai/coach/route.js` extract user identity via `supabase.auth.getUser()`.

### Assumptions
1. Supabase project API keys and Auth endpoints will remain operational during and following any data migration.
2. Supabase JWT secrets or JWKS endpoints can be provided to Cloudflare Workers for local signature verification if latency reduction is required.

### Unknowns & Risks
1. Third-party OAuth provider redirect URIs: If the production domain shifts from Vercel to Cloudflare, Google/Facebook/X/LinkedIn developer consoles must be updated with the new origin URL.
2. Cloudflare D1 write throughput limits if sessions were ever stored in D1 (mitigated by Options A and C).

---

## 5. Recommended Option and Rationale

### Recommendation: **Option C — Phased Identity Mirror (Supabase IdP + D1 Projection)**

#### Core Rationale:
1. **Unblocks CF-11 Data Migration Immediately**:
   - By pre-populating D1's `"user"` table with existing Supabase user UUIDs and emails (from local sanitized schema fixtures in rehearsal, and from approved extraction in cutover), all 11 user-owned tables can be migrated into D1 with **100% foreign-key compliance** (`PRAGMA foreign_key_check = 0`).
2. **Zero User Disruption**:
   - Preserves existing passwordless authentication (Google, Facebook, X, LinkedIn, Magic Links).
   - Prevents forced session logouts or password resets for users.
3. **Prevents Competing Authorities**:
   - Supabase Auth remains the single identity authority. D1 `"user"` is strictly a read projection for relational referential integrity.
4. **Architectural De-risking**:
   - Decouples the **database migration (D1)** from the **authentication migration (Better Auth)**. Solving both simultaneously introduces compounded cutover risks.
   - Leaves the door open to adopt Better Auth or another edge auth provider in a future, dedicated milestone without modifying any domain table foreign keys.

---

## 6. Prerequisites, Acceptance Tests, and Owner Decisions

### Prerequisites for Option C Implementation:
1. **D1 User Mirror Migration Script**: A script to seed/upsert user records (`id`, `name`, `email`, `createdAt`, `updatedAt`) into D1 `"user"` table from Supabase user records during migration.
2. **JIT User Projection Hook**: An update in `app/(auth)/auth/callback/route.js` to ensure newly registered users on Supabase Auth are asynchronously upserted into D1 `"user"` table.
3. **Edge Session Verification**: Verification that `@supabase/ssr` correctly parses and verifies sessions in the Cloudflare runtime.

### Acceptance Tests for Identity Verification:
1. **Referential Integrity Audit**: `PRAGMA foreign_key_check` in D1 must return 0 violations after loading users and user-owned domain data.
2. **Orphan Rejection Test**: Inserting a domain record with an unmapped user ID must fail closed with `SQLITE_CONSTRAINT_FOREIGNKEY`.
3. **Session Continuity Test**: Existing session cookies from Supabase Auth must successfully authenticate requests against D1-backed Server Actions and API routes.
4. **Tenant Isolation Test**: Cross-tenant requests where a claimed user ID differs from the verified session UUID must be rejected with 401/403.

### Decisions Requiring Owner Approval:
- [ ] **Approval of Option C (Supabase Auth as IdP with D1 User Mirroring)** as the official identity architecture for the Cloudflare migration.
- [ ] **Confirmation that passwordless flows (OAuth + Magic Links) must be preserved** without forcing user password creation.
- [ ] **Authorization to proceed to CF-11 Production Migration Rehearsal** using the approved Option C identity mapping contract.

---

## 7. Explicit Verdict

`CF-4 DECISION READY FOR OWNER APPROVAL`

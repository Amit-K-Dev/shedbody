# ShedBody CF-10A.5 — Staging Rollback and Incident Recovery Procedure

**Version:** 3.0 (CF-10A.5 Read-Only Staging Update)  
**Status:** Authoritative Staging Operational Procedure  
**Applies To:** Cloudflare D1 Bridge Gateway (`workers/d1-bridge`), Vercel Next.js Client (`lib/api/d1BridgeClient.js`), and Hybrid Storage Domains (`lib/goals.js`, etc.)

---

## 1. Core Principles & Non-Negotiable Invariants

1. **No "Instant" or "Automatic" Rollback:**  
   Database writes to Cloudflare D1 are durable, persistent SQLite transactions. Disabling a flag stops new traffic from routing to D1, but it does **not** roll back data already committed to D1, nor does it resolve ambiguous in-flight writes.
2. **Strict Disarm Sequencing (Vercel Before Worker):**  
   Vercel routing flags must be disabled and the redeployment verified **before** disabling the Worker gateway. If the Worker bridge is disabled first, any in-flight or subsequent requests dispatched by Vercel will receive HTTP 503 (`D1_BRIDGE_DISABLED`) and fail closed rather than falling back to Supabase.
3. **Never Automatically Retry Ambiguous Writes to Supabase:**  
   If a client received a timeout (HTTP 504 `D1_WRITE_TIMEOUT_UNKNOWN_OUTCOME`) or a network disconnect during a D1 mutation, the write may have succeeded in D1 before the connection dropped. Automatically executing the same write against Supabase risks duplicate records, skewed aggregations, or conflicting entity states.
4. **Never Delete or Reset D1 Data as a Shortcut:**  
   Do not execute `DROP TABLE`, `DELETE FROM`, or re-apply initial migrations on D1 as an operational quick-fix. Any records written during the active bridge window represent critical audit evidence and real user progress that must be reconciled.
5. **Supabase Auth Remains the Single Identity Authority:**  
   User identity is rooted in Supabase Auth. Any rollback must maintain referential integrity with `auth.users`.
6. **Authoritative JWT Signing Algorithm Invariant:**  
   - An unverified JWT header is diagnostic evidence only, never proof of the trusted signing algorithm.
   - A missing or empty JWKS endpoint does not independently prove HS256.
   - The configured signing mode (symmetric HS256 vs asymmetric RS256/ES256) must be established solely from authoritative Supabase project settings (Project Settings -> API & Auth -> JWT Settings) or documented project metadata.
   - Never reveal, copy into logs, or request production secret values.

---

## 2. Step-by-Step Rollback Execution Procedure

### Phase 1: Disarm Vercel D1 Routing Flags (First Action)
Immediately cut off client application traffic from routing through the Cloudflare D1 Bridge:
1. In the Vercel Staging Project Dashboard (or via Vercel CLI):
   ```bash
   # Remove the flag or set to false explicitly
   vercel env rm ENABLE_D1_BRIDGE staging
   # Or explicitly update to "false"
   vercel env add ENABLE_D1_BRIDGE staging false
   ```
2. Trigger an immediate redeployment of the staging deployment so that all Server Components, Server Actions, and API route workers re-initialize with the updated environment:
   ```bash
   vercel redeploy staging
   ```
3. Confirm that `ENABLE_D1_BRIDGE` is absent or evaluates strictly to `"false"` in the deployed environment.

### Phase 2: Confirm Vercel Path Reversion to Supabase
Before taking action on the Worker, confirm that Vercel is actively using the canonical Supabase PostgreSQL path:
1. Perform a test action in staging (e.g. goal fetch or goal set for a staging test user).
2. Inspect runtime application logs:
   - Confirm that `lib/goals.js` executes `supabase.rpc('create_weight_goal', ...)` or direct Supabase client queries.
   - Confirm that zero outbound HTTP requests are dispatched to `D1_BRIDGE_URL`.
   - Confirm that zero `D1BridgeClient` logs or bridge error events are emitted.

### Phase 3: Disable Worker Bridge Traffic & Deploy Configuration
Once Vercel traffic is verified 100% on Supabase, disarm the Cloudflare Worker bridge gateway to block any residual or rogue traffic:
1. **Update Worker Configuration Variable (`ENABLE_D1_BRIDGE` is a variable, NOT a secret):**
   In `workers/d1-bridge/wrangler.toml` under `[env.staging.vars]`, ensure:
   ```toml
   [env.staging.vars]
   ENABLE_D1_BRIDGE = "false"
   ```
2. **Deploy the updated Worker configuration to staging:**
   ```bash
   npx wrangler deploy --env staging
   ```
   *(Alternatively, update `ENABLE_D1_BRIDGE` to `"false"` in the Cloudflare Dashboard under Workers & Pages -> `shedbody-d1-bridge-staging` -> Settings -> Variables -> Environment Variables).*

### Phase 4: Verify the Worker Disabled Response
Using the actual implementation in `workers/d1-bridge/index.js`, the opt-in feature flag guard runs **first** (lines 64–70), before the `/health` and `/api/bridge/health` route handlers:
```javascript
if (env.ENABLE_D1_BRIDGE !== "true") {
  return jsonResponse(503, {
    success: false,
    error: "D1_BRIDGE_DISABLED",
    message: "Cloudflare D1 Bridge service is disabled",
  });
}
```
Therefore, when `ENABLE_D1_BRIDGE` is disabled:
1. **Probe `/health` or `/api/bridge/health`:**
   ```bash
   curl -i https://<worker-staging-url>/health
   ```
   **Expected Response:** **HTTP 503 Service Unavailable** (confirming the bridge guard is active):
   ```json
   HTTP/1.1 503 Service Unavailable
   Content-Type: application/json
   {
     "success": false,
     "error": "D1_BRIDGE_DISABLED",
     "message": "Cloudflare D1 Bridge service is disabled"
   }
   ```
2. **Probe an API endpoint (`/api/bridge/goals`):**
   ```bash
   curl -i -X POST https://<worker-staging-url>/api/bridge/goals
   ```
   **Expected Response:** **HTTP 503 Service Unavailable** (`D1_BRIDGE_DISABLED`).
   *(Note: The HTTP 200 `{ status: "healthy", hasBinding: true }` response is returned ONLY when `ENABLE_D1_BRIDGE === "true"`. When disabled, the flag guard intercepts all requests with HTTP 503).*

---

## 3. Post-Rollback Data Reconciliation & Ambiguous Write Inspection

### Phase 5: Audit D1 Write Outcomes Before Any Data Manipulation
Before attempting to reconcile state between D1 and Supabase:
1. Query the staging D1 database directly to inspect the timestamp range when the bridge was enabled:
   ```bash
   npx wrangler d1 execute shedbody-d1-staging --remote --command \
     "SELECT id, user_id, target_value, created_at FROM goals WHERE created_at >= '<start_of_window>' ORDER BY created_at DESC;"
   ```
2. Identify all writes committed to D1 during the testing window.

### Phase 6: How to Identify and Reconcile Partially Completed Writes

#### A. Identifying Partially Completed Writes
A write is classified as **partially completed / ambiguous** if:
- The client recorded an error or timeout (`D1_WRITE_TIMEOUT_UNKNOWN_OUTCOME` or HTTP 504), but D1 contains the committed row.
- The JIT user projection row was inserted into D1 `"user"`, but the domain transaction (`goals`) failed or timed out.
- A multi-entity operation completed step 1 (e.g., metric entry recorded) but step 2 (e.g., daily aggregate update) failed.

#### B. Safe Reconciliation Workflow
1. **Compare D1 vs Supabase Records:**
   - Query Supabase for the same `user_id` across the incident timestamp:
     ```sql
     SELECT id, user_id, target_value, created_at FROM goals WHERE user_id = '<user_uuid>' AND created_at >= '<start_of_window>';
     ```
2. **Reconciliation Rules:**
   - **Case 1: Record exists in D1 but NOT in Supabase:**  
     If the user mutation was valid and intended, manually replay the mutation to Supabase using the documented domain RPC or administrative script. Record the original D1 timestamp and correlation ID in the reconciliation audit log.
   - **Case 2: Record exists in Supabase but NOT in D1:**  
     No action required. The system rolled back to Supabase and the Supabase write is authoritative.
   - **Case 3: Inconsistent state (e.g. goal updated in D1, older goal in Supabase):**  
     Verify user intent via application logs. Update Supabase to match the latest user action. Never overwrite newer user data with stale backups.
   - **Case 4: Orphaned JIT User Projection in D1:**  
     If a D1 `"user"` row was created without corresponding domain rows, leave it in place. It does not cause harm and preserves foreign key referential integrity for future migrations.

---

## 4. Rollback Verification Checklist

| Phase | Step | Action | Responsible Tool | Success Indicator |
|---|---|---|---|---|
| **1** | Disarm Vercel | Set `ENABLE_D1_BRIDGE=false` on Vercel staging | Vercel Dashboard / CLI | Environment variable updated |
| **1** | Redeploy Vercel | Trigger staging redeploy | Vercel CLI | Deployment active with updated env |
| **2** | Confirm Supabase Path | Inspect application action logs | Vercel Logs | Supabase RPC executing, 0 bridge calls |
| **3** | Disarm Worker Variable | Set `ENABLE_D1_BRIDGE = "false"` in `wrangler.toml` `[env.staging.vars]` | Editor / Config | Config file updated |
| **3** | Deploy Worker Config | Run `npx wrangler deploy --env staging` | Wrangler CLI | Worker updated in Cloudflare |
| **4** | Verify Disabled Response | Probe `/health` and `/api/bridge/goals` | `curl` probe | Worker returns HTTP 503 `D1_BRIDGE_DISABLED` |
| **5** | Extract D1 Incident Data | Query D1 incident window writes | `wrangler d1 execute` | Complete list of D1 rows extracted |
| **6** | Cross-Reference Supabase | Compare records by `user_id` & timestamp | SQL Query / Admin tool | Zero un-reconciled discrepancies |
| **6** | Audit Log Archival | Record reconciliation actions taken | Observability Storage | Audit trace saved for post-mortem |

---

## 5. Explicit Anti-Patterns

- **NEVER** run `npx wrangler d1 execute --command "DELETE FROM ..."` or `DROP TABLE` as a rollback mechanism.
- **NEVER** configure automatic retry loops that replay failed D1 writes directly to Supabase without manual outcome inspection.
- **NEVER** disable the Worker bridge before verifying that Vercel routing has been disarmed and redeployed.
- **NEVER** treat `ENABLE_D1_BRIDGE` as a secret (`wrangler secret put`): it is a Worker environment variable defined in `[env.staging.vars]`.
- **NEVER** assume that setting a feature flag to `"false"` is instantaneous across edge CDNs; always verify with active HTTP probes.
- **NEVER** treat an unverified JWT header as proof of the server's signing algorithm (untrusted input).
- **NEVER** infer that missing or empty JWKS endpoint responses prove HS256.
- **NEVER** reveal, copy into logs, or request production secret values.

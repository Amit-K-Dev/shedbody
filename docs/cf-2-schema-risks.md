# CF-2: Schema Translation Risks

This document catalogs the unresolved PostgreSQL compatibility issues and structural risks identified during the CF-2 schema translation to Cloudflare D1.

## 1. Concurrency and Advisory Locks (High Risk)
**PostgreSQL Behavior:**
Several domain RPCs (like `create_weight_goal`) utilize `pg_advisory_xact_lock()` to prevent race conditions during idempotent upserts or sequential check-and-insert flows.
**D1 Compatibility Issue:**
D1 / SQLite does not support application-level advisory locks.
**Mitigation Strategy:**
We must utilize D1's native `batch()` API to execute operations sequentially within the same transactional context, or rely strictly on `ON CONFLICT` SQLite clauses (Optimistic Concurrency). For complex multi-table atomic checks (like verifying active goals and updating user profiles simultaneously), the Application Layer (JS) must carefully orchestrate batch statements.

## 2. Row Level Security (RLS) Deprecation (Critical)
**PostgreSQL Behavior:**
Supabase handled multi-tenant security natively in the database via RLS policies (`auth.uid() = user_id`).
**D1 Compatibility Issue:**
D1 has no concept of RLS. It runs in a trusted environment (the Edge Worker) and accesses all rows.
**Mitigation Strategy:**
The new `D1Adapter` and Repository pattern must strictly enforce tenant isolation. Every data access method MUST require `user_id` as a parameter and explicitly append `WHERE user_id = ?` to every query. If a developer forgets this in the JS layer, cross-tenant data leakage occurs.

## 3. Database Triggers (`updated_at`) (Medium Risk)
**PostgreSQL Behavior:**
`BEFORE UPDATE` triggers automatically executed `update_updated_at_column()` on almost all domain tables.
**D1 Compatibility Issue:**
While SQLite supports triggers, maintaining business logic inside SQLite triggers in a serverless database can lead to opaque debugging.
**Mitigation Strategy:**
We will move `updatedAt = Date.now()` setting explicitly into the Application Layer (D1 Repositories). D1 migrations will NOT recreate these automated triggers to adhere to our "Logic in JS/Python" mandate.

## 4. `NaN` and Infinity Check Constraints (Low Risk)
**PostgreSQL Behavior:**
PostgreSQL `numeric` supports `NaN` and `Infinity`. We had explicit `CHECK` constraints rejecting them.
**D1 Compatibility Issue:**
SQLite's `REAL` type stores IEEE 754 floating point values (including NaN and Infinity). 
**Mitigation Strategy:**
We can enforce bounds in SQLite `CHECK` constraints, but primary validation should be shifted up to Zod schemas in the Next.js API layer.

## 5. UUID Generation (Low Risk)
**PostgreSQL Behavior:**
`gen_random_uuid()` was used for PKs.
**D1 Compatibility Issue:**
D1 does not natively generate UUIDv4 via default clauses unless we use hacky `hex(randomblob(16))` constructs, which aren't true UUIDs.
**Mitigation Strategy:**
Better Auth uses random alphanumeric strings (`cuid2` or `nanoid` equivalents) for IDs, represented as `TEXT` in D1. We will generate IDs (e.g., UUIDv4 or ULID) in the Application Layer upon insertion rather than relying on the Database default generator.

## 6. RPC Translation Complexity (Medium Risk)
**PostgreSQL Behavior:**
`upsert_nutrition_log` and `upsert_lifestyle_log` were complex PL/pgSQL functions that looked up current active `plans` and inserted snapshots into logs.
**D1 Compatibility Issue:**
No PL/pgSQL support.
**Mitigation Strategy:**
The JS Application Layer must perform two steps:
1. `SELECT calories, protein FROM plans WHERE user_id = ? AND is_active = 1 LIMIT 1`
2. `INSERT ... ON CONFLICT DO UPDATE ...`
These two steps must be passed as a single array of statements to `db.batch()` to ensure atomicity.

## 7. Migration Data Porting (High Risk - For Future Phase)
While CF-2 is strictly local and read-only for production, translating the schema highlights that migrating actual Supabase data (which relies on UUIDs and strict timestamps) into D1 (which uses TEXT and INTEGER) requires a specialized ETL script. We must ensure D1 `TEXT` keys match Supabase UUID strings exactly so that foreign keys survive the cutover.

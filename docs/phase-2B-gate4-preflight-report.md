# Phase 2B — Gate 4 Preflight Report

**Date:** 2026-10-04
**Phase:** 2B Gate 4 (Preflight)
**Target:** Unified Tracking Engine
**Constraint:** READ-ONLY / DO NOT EXECUTE

---

## 1. Schema & Column Validation

**A. Schema Verification: [PASS]**
The exact current production schema has been verified for `progress_entries`, `nutrition_logs`, `lifestyle_logs`, and `metric_entries`. All tables exist in the `public` schema.

**B. Column Validations: [PASS]**
All source columns used by the proposed backfill exist and their types align safely with the target ledger:
- `id`, `user_id` are `uuid` across all tables.
- `log_date` (and `entry_date`) are `date`.
- `created_at`, `updated_at`, `deleted_at` exist natively as timestamps.
- **progress_entries**: `weight`, `body_fat` (`double precision`). `notes` (`text`).
- **nutrition_logs**: `calories_consumed`, `protein_consumed`, `water_ml`, `target_calories_snapshot`, `target_protein_snapshot` (`numeric`).
- **lifestyle_logs**: `steps_count` (`integer`), `sleep_hours` (`numeric`), `workout_completed` (`boolean`).

**C. Metrics Catalog: [PASS]**
`public.metrics` contains exactly the 8 required metric IDs: `weight`, `body_fat`, `calories`, `protein`, `water`, `steps`, `sleep`, `workout`.

## 2. Row Count Validations

**D. Expected Source Rows: [PASS]**
The legacy tracking tables still contain exactly the expected rows:
- `weight`: 20
- `body_fat`: 0
- `calories`: 10
- `protein`: 10
- `water`: 10
- `steps`: 10
- `sleep`: 10
- `workout`: 10
- **Total Expected Inserts:** 80

**E. Current Ledger State: [PASS]**
A query confirmed `metric_entries` currently contains **0 rows** with `source = 'import'` and metadata tied to legacy tables. The destination is pristine.

## 3. Provenance & Idempotency Strategy

**F. Provenance Identity: [PASS]**
The proposed identity `(metric_id, metadata->>'legacy_table', metadata->>'legacy_id')` cleanly and uniquely identifies the exact origin of every extracted data point.

**G. NOT EXISTS Dry-Run Validation: [PASS]**
- **Expected inserts on first execution**: 80
- **Expected inserts on immediate second execution**: 0
- **Expected duplicate identities**: 0
- **Concurrent Execution Risk**: If the backfill query is somehow executed twice in parallel at the exact same millisecond, a race condition could cause the `NOT EXISTS` check to pass for both transactions, resulting in two rows. However, this is an administrative backfill executed linearly, and the query-time `DISTINCT ON` mechanism mitigates any application-level impact if a duplicate row ever existed.

**H. Metadata Contract Review: [PASS]**
The JSONB contract uses `jsonb_build_object()`. When null snapshots or notes are encountered, `CASE WHEN ... IS NOT NULL` safely filters them, or they are explicitly passed avoiding `null` key clutter. The contract correctly produces:
`{"legacy_table": "...", "legacy_id": "...", "notes": "..."}` or `{"legacy_table": "...", "legacy_id": "..."}`.

**I. Workout Semantics Verification: [PASS]**
`workout_completed` (boolean) maps safely to `1.0` (true) and `0.0` (false). This perfectly matches the Phase 2B numeric unification strategy for the boolean-based `workout` metric.

**J. Database-Level Uniqueness Analysis: [PASS]**
**Question:** Does the architecture require a unique constraint on provenance identity?
**Answer:** No.
**Rationale:** The `metric_entries` ledger is append-only by design. State projection is fully resolved via `DISTINCT ON (user_id, metric_id, log_date) ORDER BY recorded_at DESC, created_at DESC, id DESC`. A unique constraint on JSONB keys (e.g. `UNIQUE (metric_id, (metadata->>'legacy_table'), (metadata->>'legacy_id'))`) would unnecessarily bloat the schema for a one-off operational backfill. The `NOT EXISTS` anti-join completely prevents duplicates across sequential executions.

---

## 4. Final Assessment

- **Current State:** 0 backfilled records.
- **Expected Execution State:** +80 records.
- **Risks:** Near zero. Source tables are not mutated. Target table is isolated and has no side-effect triggers.
- **Rollback Strategy:** `DELETE FROM metric_entries WHERE source = 'import'`.

**STATUS:** **GO** for Phase 2B Gate 4 Execution.

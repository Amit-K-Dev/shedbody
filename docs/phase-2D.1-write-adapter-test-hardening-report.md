# Phase 2D.1 — MetricWriteAdapter Test Hardening Report

## Summary
The `MetricWriteAdapter` is responsible for all non-synchronization writes into the Canonical EAV Ledger (`metric_entries`). Because it acts as the primary mutator for production tracking, it required robust isolation and comprehensive test coverage prior to the final destruction of the legacy schema (Gate 6 closure). 

This report documents the newly implemented test hardening suite, ensuring EAV mutability is stable, batch atomic, and fully resilient.

## Testing Scope & Architecture
The `MetricWriteAdapter.test.js` suite was constructed using `node:test` and covers the complete lifecycle of standard application metrics (Progress, Nutrition, Lifestyle).

### Test Coverage Details:

1. **Sparse Writes & Atomic Batches**
   - **PASS**: Verified that undefined inputs are intentionally ignored and omitted from the bulk insert payload.
   - **PASS**: Verified that partial nutrition updates only insert rows for the specific provided nutrients (e.g., updating only protein leaves calories untouched if not provided).

2. **Metric Value Mapping & Translation**
   - **PASS**: Demonstrated proper casting of numerical metrics (`weight`, `body_fat`, `calories`, `protein`, `water`, `steps`, `sleep`).
   - **PASS**: Confirmed translation logic for `workout` boolean flags (`true` -> `1`, `false` -> `0`).

3. **Null / Clear Semantics (Tombstones)**
   - **PASS**: Evaluated deletion semantics. Sending an explicitly `null` value for an active metric generates a tombstone record (a row populated with a `deleted_at` timestamp).
   - **PASS**: Confirmed that empty string inputs mapped to numerical metrics are correctly intercepted as valid null/clear commands.

4. **Nutrition Target Snapshots**
   - **PASS**: Verified integration with `TargetReadAdapter.getLatestNutritionTarget()`. The adapter correctly fetches active user targets, scales them proportionally for snapshotting, and embeds the metadata in `metadata->>daily_target_snapshot`.

5. **Validation and Edge Cases**
   - **PASS**: Enforced `Number.isFinite` validation, actively blocking `NaN`, infinity, and non-numeric invalid string casts before reaching the database layer.

6. **Error Propagation**
   - **PASS**: Confirmed that underlying bulk insert failures properly reject the operation and throw an explicit error to the caller, preventing silent failures.

## Build and Stability Verification

1. **Unit and Integration Suites (`node:test`)**
   - `MetricWriteAdapter.test.js` - **PASS** (8/8)
   - `MetricReadAdapter.test.js` - **PASS** (17/17)
   - `lib/analytics/progress.test.js` - **PASS**
   - `lib/analytics/unified.test.js` - **PASS**
   - `lib/plans/adaptationService.test.js` - **PASS** (8/8) - *Updated to mock MetricReadAdapter explicitly to fix ESM import aliasing under node:test.*

2. **Full Repository Build (`npm run build`)**
   - **PASS**: Compiled successfully via Next.js 16.1.6 (Turbopack). No regressions detected across route generation or component compilations.

3. **End-to-End EAV Stability Audit (`scratch/phase2d_readonly_validator.mjs`)**
   - **PASS**: RLS Immutability, Tombstone behavior, Read Flows, Concurrency, and Isolation confirmed intact. (9/9 tests passed).

## Next Steps
Gate 6 testing is complete and the EAV system has achieved proven production stability. The final remaining step is the **physical destruction of legacy tables** via destructive SQL migration, converting the `archive_*` tables into fully dropped tables, freeing database resources, and officially completing Phase 2.

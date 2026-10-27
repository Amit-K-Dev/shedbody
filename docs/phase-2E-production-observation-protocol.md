# Phase 2E — Production Observation Protocol

**Important Notice:** Phase 2E does not authorize permanent destruction of the archived legacy schema. 
Gate 7 — Permanent Legacy Schema Destruction requires a separate explicit authorization after the observation period and final pre-drop validation.

## 1. Objective
To define and execute a safe, read-only 14-day production observation protocol for the unified EAV metrics system. This protocol monitors write/read paths, tombstones, data integrity, and legacy dependencies to ensure stability before the final data destruction gate.

## 2. Current Architecture Baseline
* **Canonical Ledger:** `metric_entries` (append-only)
* **Canonical Projection:** `vw_metric_entries_latest` (selects the most recent entry per metric/user/date via `DISTINCT ON`)
* **Read/Write Abstractions:** `MetricReadAdapter` and `MetricWriteAdapter`
* **Legacy State:** `public.archive_progress_entries`, `public.archive_nutrition_logs`, and `public.archive_lifestyle_logs` exist but are functionally abandoned.
* **Sync Mechanisms:** `metric_entries` contains database triggers ensuring `weight` flows downstream to `user_profiles`.

## 3. Baseline Measurements (Captured: 2026-10-05)
A baseline was collected securely using `scratch/phase2e_observation_baseline.mjs`:
* **`metric_entries` Total Rows:** 1
* **Tombstones:** 0 (0.00%)
* **Metrics by Type:** `weight`: 1
* **Metrics by Source:** `manual`: 1
* **`archive_progress_entries` Rows:** 0
* **`archive_nutrition_logs` Rows:** 0
* **`archive_lifestyle_logs` Rows:** 0
* **Latest `metric_entries` Timestamp:** 2026-10-05T04:59:08.733968+00:00
* **Current Application Build Status:** PASS (Turbopack, Next.js 16.1.6, 75/75 static pages generated)
* **Current Database Object Status:** 0 dependencies on `archive_*` tables.

## 4. Observable Metrics
These metrics can be measured daily via read-only queries.

### A. Write-path Health
* **Database constraint failures:** (DERIVABLE FROM CURRENT DATA via database logs / Sentry).
* **Batch insert / sparse-update success:** (DIRECTLY OBSERVABLE NOW by monitoring `metric_entries` row growth).

### B. Read-path Health
* **`vw_metric_entries_latest` success:** (DIRECTLY OBSERVABLE NOW by querying the view directly).
* **Dashboard/API errors:** (DERIVABLE FROM CURRENT DATA via Sentry or standard Next.js error logs).

### C. Tombstone Behavior
* **Tombstone creation count:** (DIRECTLY OBSERVABLE NOW querying `WHERE deleted_at IS NOT NULL`).
* **Tombstone/read-projection consistency:** (DIRECTLY OBSERVABLE NOW by verifying tombstones don't appear in the latest view).

### D. Weight Synchronization
* **`user_profiles.weight` synchronization:** (DIRECTLY OBSERVABLE NOW by comparing `metric_entries` weight entries against `user_profiles.weight`).

### E. Data Integrity
* **Duplicate canonical rows:** (DIRECTLY OBSERVABLE NOW by validating `vw_metric_entries_latest` yields 1 row per `user_id, metric_id, log_date`).
* **Invalid identifiers:** (DIRECTLY OBSERVABLE NOW querying for nulls or unexpected strings in `metric_id`).
* **Unexpected orphaned records:** (DIRECTLY OBSERVABLE NOW via foreign key integrity checks to `auth.users`).

## 5. Non-Observable Metrics
* **Exact read latency for `vw_metric_entries_latest` per-user:** (NOT CURRENTLY OBSERVABLE natively without APM tracing tools like Datadog/NewRelic).
* **MetricWriteAdapter parsing latency:** (NOT CURRENTLY OBSERVABLE).
* **Malformed payload rejection rate:** (NOT CURRENTLY OBSERVABLE unless Sentry captures adapter input errors).

## 6. Acceptance Criteria
The system is evaluated against the following thresholds:

* **EAV Growth Rate:** Expected nominal growth based on active users (Derived from baseline).
* **Tombstone Ratio:** WARNING if >20% of new writes are tombstones (Engineering recommendation: suggests extreme UI flutter or API bug).
* **Weight Sync:** NO-GO if `user_profiles.weight` diverges from the latest `weight` in `vw_metric_entries_latest` for the same timestamp (Derived from current architecture).
* **Canonical Duplicates:** NO-GO if `vw_metric_entries_latest` returns multiple rows for the same composite key (Derived from current architecture).
* **Legacy Activity:** NO-GO if `archive_*` tables show >0 rows (Derived from baseline).
* **Error Rate:** WARNING if unexpected 500s spike in the API layer (Engineering recommendation).

## 7. Daily Checklist
Execute this checklist daily without modifying production data:
1. [ ] **Database health:** Check database connection and error logs.
2. [ ] **EAV row growth:** Run `SELECT COUNT(*) FROM metric_entries`.
3. [ ] **Tombstone behavior:** Calculate `(tombstones / total) * 100`.
4. [ ] **Latest-view integrity:** Run check for duplicate composite keys in view.
5. [ ] **Weight sync integrity:** Run check comparing view weight and profile weight.
6. [ ] **Goal creation integrity:** Validate goals match starting EAV values.
7. [ ] **Application errors:** Check APM/Sentry for adapter failures.
8. [ ] **Legacy dependency check:** Verify `archive_*` tables remain at 0 rows.

## 8. Read-only Validation Procedure
An automated read-only validation script has been created at `scratch/phase2e_observation_baseline.mjs`. It uses the Supabase JavaScript client to safely execute `COUNT` and `SELECT` aggregations over the active tables without performing any `INSERT`, `UPDATE`, `DELETE`, `ALTER`, or `DROP` statements. 

## 9. Legacy Dependency Watch
Any appearance of a new reference to legacy tables (`progress_entries`, `nutrition_logs`, `lifestyle_logs`, or their `archive_` counterparts) in PRs or logs must be strictly classified:
* **Runtime:** (Investigation trigger / NO-GO).
* **Test:** (Acceptable if mocking legacy adapters).
* **Migration:** (Acceptable if it is historical).
* **Documentation/Comment:** (Acceptable).

## 10. Data-Integrity Checks
Data-integrity is continuously evaluated for:
* **Canonical uniqueness:** Ensuring `DISTINCT ON` in the view is not masking missing timestamps.
* **Tombstone masking:** Ensuring `vw_metric_entries_latest` strictly filters out rows where `deleted_at IS NOT NULL`.
* **Weight consistency:** Ensuring the trigger has faithfully synced the value downstream.

## 11. Performance Observation
**Note:** We do NOT claim that 1M+ row performance has been validated in production.
* **Table Size Baseline:** 1 row.
* **Row Growth Baseline:** N/A (Day 0).
* **Dominant Types:** `weight`.
* **Query Shape:** Standard queries utilize the `idx_metric_entries_user_metric_date` composite index.
* **Theoretical Scaling Constraint:** The `DISTINCT ON` operation across large windows will eventually degrade. Partitioning by `log_date` or utilizing a Materialized View for historical months remain FUTURE CONSIDERATIONS until row-growth proves otherwise.

## 12. Incident Classification
* **WARNING:** Elevated error rates, high tombstone ratio, unexpected growth rate. Requires engineering review but does not halt observation.
* **NO-GO:** Data corruption, view inconsistencies, weight-sync failure, writes to `archive_*` tables. Halts observation immediately.
* **GO:** Successful traversal of 14 days without a NO-GO event.

## 13. 14-Day Observation Log Template

| Day | Date | Total EAV | Tombstone % | Archive Rows | Sync OK | View OK | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Day 0 | 2026-10-05 | 1 | 0.00% | 0 | Yes | Yes | Baseline | Initial capture |
| Day 1 | | | | | | | | |
| Day 2 | | | | | | | | |
| Day 3 | | | | | | | | |
| Day 4 | | | | | | | | |
| Day 5 | | | | | | | | |
| Day 6 | | | | | | | | |
| Day 7 | | | | | | | | |
| Day 8 | | | | | | | | |
| Day 9 | | | | | | | | |
| Day 10 | | | | | | | | |
| Day 11 | | | | | | | | |
| Day 12 | | | | | | | | |
| Day 13 | | | | | | | | |
| Day 14 | | | | | | | | |

## 14. Final Gate 7 Prerequisites
To authorize Gate 7, the following must be true at Day 14:
1. No NO-GO incidents occurred.
2. The legacy tables (`archive_*`) have sustained exactly 0 row additions.
3. No active application references to the legacy structure exist.
4. Product-Owner provides explicit authorization to execute the destructive DROP.

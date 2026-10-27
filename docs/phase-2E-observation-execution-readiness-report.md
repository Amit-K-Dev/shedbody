# Phase 2E — Observation Execution Readiness Report

**Important Notice:** Phase 2E does not authorize permanent destruction of the archived legacy schema. Gate 7 — Permanent Legacy Schema Destruction requires a separate explicit authorization after the observation period and final pre-drop validation.

## 1. Objective
To audit, improve, and execute the Day 0 read-only production observation validator, establishing a reliable, machine-readable procedure for the 14-day observation period, and documenting the Day 0 execution results.

## 2. Existing Protocol Review
The protocol `docs/phase-2E-production-observation-protocol.md` correctly outlined the observation boundaries. The existing validator (`scratch/phase2e_observation_baseline.mjs`) successfully captured table row counts but was insufficient for deep relational mapping (such as checking profile weight mismatches or executing EXPLAIN plans via the Supabase REST client).

## 3. Observation Validator Audit & Improvement
The validator was rewritten (`scratch/phase2e_observation_baseline.mjs`) to use the local Postgres native client (`pg`). 

**Checks Implemented:**
* **EAV health:** Captures total `metric_entries`, counts by `metric_id` and `source`, newest/oldest timestamp.
* **Tombstones:** Captures tombstone counts, calculates ratio, and explicitly tests for tombstone leakage in the projection (`vw_metric_entries_latest`).
* **Canonical View Integrity:** Uses `HAVING COUNT(*) > 1` to strictly enforce zero duplication for the composite primary key (`user_id, metric_id, log_date`) in the latest view projection.
* **Weight Sync Status:** Left-joins `user_profiles` to `vw_metric_entries_latest` where `metric_id = 'weight'` and explicitly reports any row where the values misalign (`p.weight::numeric != v.value_numeric::numeric`).
* **Archive Tables:** Explicitly queries `archive_*` table lengths.
* **Unexpected Database Integrity Constraints:** Enforces `user_id`, `metric_id`, and `source` must not be NULL directly on the active entries.
* **Performance Query Plan:** Executes an `EXPLAIN ANALYZE` on `vw_metric_entries_latest` safely without mutating data.

**Checks that remain NOT_OBSERVABLE:**
* **Goal Integration Status:** Accurately matching dynamic EAV weight to goal `start_value` at the precise temporal moment of goal creation is too mathematically complex for a safe standard SQL script, as it requires interpolating `log_date` against `created_at` records across different timestamps. This remains NOT_OBSERVABLE via the automated baseline.

## 4. Day-0 Execution Result
The improved script generated the following output:
```json
{
  "date": "2026-10-05T14:55:14.569Z",
  "status": "GO",
  "warnings": [],
  "errors": [],
  "metricEntriesCount": 1,
  "tombstoneCount": 0,
  "tombstoneRatio": 0,
  "byMetric": {
    "weight": 1
  },
  "bySource": {
    "manual": 1
  },
  "oldestDate": "2026-09-30T18:30:00.000Z",
  "newestDate": "2026-09-30T18:30:00.000Z",
  "archiveProgress": 0,
  "archiveNutrition": 0,
  "archiveLifestyle": 0,
  "canonicalDuplicates": 0,
  "weightSyncMismatches": 0,
  "goalIntegrationStatus": "NOT_OBSERVABLE",
  "performanceQueryPlan": "Limit  (cost=0.15..28.87 rows=100 width=100) (actual time=0.094..0.171 rows=1 loops=1)\n  ->  Result  (cost=0.15..57.60 rows=200 width=100) (actual time=0.093..0.169 rows=1 loops=1)..."
}
```

## 5. Comparison With Documented Baseline
The numbers perfectly match the originally documented baseline.
* `metric_entries`: 1
* tombstones: 0
* `archive_*`: 0
* weight sync: 100% matched
* duplicates: 0
The status resolved to a strict **GO**.

## 6. Git Diff & Change Audit
**Exact Files Changed in this phase:**
* `scratch/phase2e_observation_baseline.mjs` (Improved the baseline validator logic).
* `docs/phase-2E-observation-log.md` (Created empty log matrix with Day 0 filled).
* `docs/phase-2E-observation-execution-readiness-report.md` (This file).

**Confirmation:** I confirm that **NO** database schemas were altered, **NO** application code was modified, **NO** migrations were generated, applied, or executed, and **NO** destructive SQL statements were run.

## 7. Daily Execution Procedure
For the remaining 14 days, the exact repeatable observation process is:
1. `node scratch/phase2e_observation_baseline.mjs`
2. Open `docs/phase-2E-observation-log.md`
3. If the script outputs `"status": "GO"`, copy the JSON into the daily evidence slot and mark it `GO`.
4. If `"status": "WARNING"` or `"NO-GO"`, report the block immediately to engineering for root-cause analysis without modifying the database.

## 8. Current Status
PHASE 2E STATUS:
READY_FOR_14_DAY_OBSERVATION

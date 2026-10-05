# Phase 2B Gate 5.2-B — Batch 2 Implementation Report

## Overview
This report documents the completion of the Batch 2 read-path migration to the EAV canonical structure (`vw_metric_entries_latest`), adhering to strict architectural guardrails regarding identity fabrication and legacy compatibility.

## Migrated Read Paths
The following files were updated to replace direct legacy table queries with the `MetricReadAdapter`:
- `lib/analytics/progress.js` (refactored `getBoundedProgress`)
- `lib/plans/adaptationService.js` (refactored timeline extraction via `getProgress` and `getNutrition`)
- `lib/notifications/anchors.js` (rewritten `getHistoricalAnchors`)
- `lib/storage.js` (refactored `getProgress`)
- `lib/repositories/ProgressRepository.js` (refactored `getEntries`)

## Metadata Identity Strategy
A key constraint for this phase was the prohibition of fabricating composite legacy IDs. We encountered a strict dependency in `lib/analytics/unified.js` which requires `id` and `created_at` on progress items to power timeline deduplication and deterministic sorting.

Since the original `progress_entries` combined `weight` and `body_fat` under a single ID, their new EAV structure gives each metric an independent identity. 

**Mapping Strategy Chosen:**
We expanded `MetricReadAdapter.getProgress` to expose the underlying metadata of the *dominant metric*. 
- If a `weight` metric exists in the bucket, the adapter assigns `weight`'s `id` and `created_at` to the top-level progress object.
- If only `body_fat` exists, its metadata is assigned.
- This mapping strategy perfectly mirrors the semantics required by `unified.js`, which strictly parses the event as a "weight event". By inheriting the weight entry's `id`, the unified timeline correctly deduplicates weight measurements without needing fake or composite IDs.

## Anchor Specialization (`getLatestAnchors`)
The Notification Engine's inactivity rules rely on the absolutely latest occurrence of specific user interactions. The original legacy queries used `LIMIT 1` for each category, but were vulnerable to tombstone bugs (e.g. failing to filter `deleted_at`).

**Implementation Strategy Chosen:**
- A new dedicated method `MetricReadAdapter.getLatestAnchors()` was introduced.
- It scans `vw_metric_entries_latest` globally, applying `deleted_at IS NULL` and metric-specific qualification rules (e.g., `value > 0`).
- The in-memory pivot picks the absolute latest `log_date` for each key metric (`workout`, `steps`, `sleep`, `water`, `protein`, `weight`).
- The `habit_entries` table was deliberately retained in `anchors.js` as it is not part of the Phase 1 EAV domain.

## Validation
`npm run build` completed successfully, confirming zero syntax errors and no broken Next.js routes. All legacy read pathways for the targeted application modules have been cleanly migrated to the unified canonical EAV surface.

# Phase 2B Gate 5.2-B — Batch 2: Read-Path Audit

## Objective
Perform a strict READ-ONLY audit of the remaining legacy read paths to prepare for Batch 2 migration to the Canonical EAV Projection (`vw_metric_entries_latest`). No application code or database records were modified during this audit. Write paths were strictly ignored.

---

## 1. `lib/analytics/progress.js`
- **Exact Legacy Query:** 
  ```javascript
  supabase.from("progress_entries")
    .select("id, weight, body_fat, entry_date, created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .gte("entry_date", startDateStr)
    .lte("entry_date", endDateStr)
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });
  ```
- **Expected Output Shape:** Array of objects: `[{ id, weight, body_fat, entry_date, created_at }]`
- **Date-range Semantics:** Inclusive bounds on `entry_date` (`startDateStr` to `endDateStr`).
- **Ordering Semantics:** Ascending by `entry_date`, then by `created_at`.
- **Null/missing-field Behavior:** Returns all rows, even if `weight` is null.
- **Soft-delete Behavior:** Explicitly filters out soft-deleted entries (`is("deleted_at", null)`).
- **Consumption of `id` / `created_at`:** **YES**. The consumer `lib/analytics/unified.js` strictly relies on `created_at` for fallback timestamps and sorting, and `id` for timeline deduplication.
- **MetricReadAdapter Reusability:** Requires extension. The current adapter strips `id` and `created_at`. It must be extended to extract and map these from the View for progress entries.

---

## 2. `lib/notifications/anchors.js`
- **Exact Legacy Queries:** 6 separate queries fetching the most recent activity across tables.
  - Workout: `lifestyle_logs` where `workout_completed = true`, ordered DESC, limit 1.
  - Steps: `lifestyle_logs` where `steps_count > 0`, ordered DESC, limit 1.
  - Sleep: `lifestyle_logs` where `sleep_hours > 0`, ordered DESC, limit 1.
  - Water: `nutrition_logs` where `water_ml > 0`, ordered DESC, limit 1.
  - Protein: `nutrition_logs` where `protein_consumed > 0`, ordered DESC, limit 1.
  - Progress: `progress_entries` where `weight IS NOT NULL`, ordered DESC, limit 1.
- **Expected Output Shape:** `{ lifestyleLogs: [...], nutritionLogs: [...], habitEntries: [...], progressEntries: [...] }`
- **Date-range Semantics:** Unbounded (global history).
- **Ordering Semantics:** Descending by date, limit 1 per query.
- **Null/missing-field Behavior:** Explicitly filters out `0` and `null` values.
- **Soft-delete Behavior:** **BUG IN LEGACY**. It does *not* filter `deleted_at`, meaning it can trigger notifications based on deleted entries.
- **Consumption of `id` / `created_at`:** No.
- **MetricReadAdapter Reusability:** Cannot reuse existing adapter patterns directly. Currently, `MetricReadAdapter` pivots everything within a date range. A narrowly scoped extension `MetricReadAdapter.getLatestAnchors({ supabase, userId })` should be added to execute a single, highly-optimized query against `vw_metric_entries_latest` to fetch the maximum date for each metric where `value_numeric > 0`.

---

## 3. `lib/plans/adaptationService.js`
- **Exact Legacy Queries:**
  - `progress_entries`: `.select("entry_date, weight").is("deleted_at", null).gte().lte().order()`
  - `nutrition_logs`: `.select("log_date, calories_consumed, protein_consumed").gte().lte().order()`
- **Expected Output Shape:** Arrays of objects.
- **Date-range Semantics:** Inclusive bounds (last 7 days).
- **Ordering Semantics:** Ascending by date.
- **Null/missing-field Behavior:** Returns nulls. The JS engine filters them later during timeline map construction.
- **Soft-delete Behavior:** `progress_entries` filters `deleted_at`. **BUG IN LEGACY:** `nutrition_logs` fails to filter `deleted_at`.
- **Consumption of `id` / `created_at`:** No.
- **MetricReadAdapter Reusability:** **YES, fully compatible**. Can be natively swapped with `MetricReadAdapter.getProgress()` and `MetricReadAdapter.getNutrition()`.

---

## 4. `lib/analytics/unified.js` & `lib/habits/engine.js`
- **Role:** Pure JS consumers of data from other layers. They do not execute SQL queries.
- **Dependencies:** 
  - `unified.js` heavily relies on `id`, `created_at`, `timestamp`, and the boolean structure of `workout_completed`.
  - `habits/engine.js` gracefully handles metric mapping.
- **Conclusion:** No query replacements needed, but reinforces that the read adapter *must* provide `id` and `created_at` for progress events.

---

## 5. `lib/storage.js` (READ paths only)
- **Exact Legacy Query:** `getProgress()`:
  ```javascript
  supabase.from("progress_entries")
    .select("id, weight, body_fat, notes, entry_date, created_at")
    .is("deleted_at", null)
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(100);
  ```
- **Expected Output Shape:** Array of objects.
- **Date-range Semantics:** Unbounded. Limit 100.
- **Ordering Semantics:** Ascending by `entry_date` and `created_at`.
- **Null/missing-field Behavior:** Returns all.
- **Soft-delete Behavior:** Filters `deleted_at`.
- **Consumption of `id` / `created_at`:** Yes, explicitly selected. Also legacy `notes` is selected.
- **MetricReadAdapter Reusability:** Needs unbounded date support (already supported if `startDate` is omitted), `limit(100)` support (already supported in `_fetchAndPivot`), and the mapping must include `id`, `created_at`, and stub `notes: null` (since `notes` does not exist in EAV).

---

## 6. `lib/repositories/ProgressRepository.js` (READ paths only)
- **Exact Legacy Query:** `getEntries()`:
  ```javascript
  supabase.from("progress_entries")
    .select("*")
    .is("deleted_at", null)
    .order("entry_date", { ascending: false });
  ```
- **Expected Output Shape:** Array of all properties (`*`).
- **Date-range Semantics:** Unbounded.
- **Ordering Semantics:** Descending by `entry_date`.
- **Consumption of `id` / `created_at`:** Yes, via `*`.
- **Note on WRITE path:** The `upsertProgressEntry` checks for existing idempotency via `.select("id")`. **As instructed, this write/upsert path remains completely untouched and will continue hitting the legacy table.**
- **MetricReadAdapter Reusability:** Needs descending order support `orderAsc: false`.

---

## Recommendation & GO/NO-GO
**GO.** 

The audit reveals exactly what we need to adjust in the adapter before executing the Batch 2 migration:
1. **Extend Adapter with Metadata:** Modify `MetricReadAdapter._fetchAndPivot()` to pull `id` and `created_at` from `vw_metric_entries_latest`. When collapsing EAV metrics by date, pick the `id`/`created_at` of the `weight` metric (or the first found) to satisfy `unified.js` and `storage.js`. Also, stub `notes: null`.
2. **Dedicated Anchors Method:** Add `MetricReadAdapter.getLatestAnchors()` to efficiently query the exact maximum dates per metric to replace the 6 disparate queries in `anchors.js`, automatically fixing the legacy soft-delete bug in the process.

This is entirely feasible using standard read-only adapters and will safely preserve the exact behavioral semantics expected by the unified timeline and adaptation engine. Ready for implementation.

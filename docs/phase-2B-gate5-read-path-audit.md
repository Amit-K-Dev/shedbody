# Phase 2B Gate 5 Application Read-Path Audit

## 1. Current Read-Path Inventory

The following files contain explicit read operations against the legacy tracking tables:

- **`lib/storage.js`**
  - `getProgress()`: Reads `progress_entries` for the user dashboard.
- **`lib/repositories/ProgressRepository.js`**
  - `getEntries()`: Fetches user progress entries.
- **`lib/dashboard/getWeightData.jsx`**
  - `getWeightData()`: Fetches weight entries for UI charting.
- **`lib/dashboard/getNutritionData.js`**
  - `getNutritionData()`: Fetches `nutrition_logs` within a date bounds for UI.
- **`lib/dashboard/getLifestyleData.js`**
  - `getLifestyleData()`: Fetches `lifestyle_logs` within date bounds.
- **`lib/analytics/progress.js`**
  - `getBoundedProgress()`: Fetches bounded progress entries for analytics.
- **`lib/notifications/anchors.js`**
  - `getHistoricalAnchors()`: Reads `lifestyle_logs`, `nutrition_logs`, and `progress_entries` via 7 parallel queries to find the most recent interaction for various metrics to determine user inactivity.
- **`lib/plans/adaptationService.js`**
  - `checkAndAdaptPlan()`: Fetches bounded `progress_entries` and `nutrition_logs` and maps them internally into a timeline Map to determine plan adaptation eligibility.
- **`lib/habits/engine.js`**
  - `generateHabitMatrix()`: Takes fetched logs and derives daily boolean completions.
- **`lib/analytics/unified.js`**
  - `mergeDailyMetrics()` and `generateTimeline()`: Merge disparate legacy logs into chronological, aggregated arrays.

## 2. Legacy Dependency Matrix

| Legacy Table | Dependent Read-Path Files |
| :--- | :--- |
| `progress_entries` | `storage.js`, `ProgressRepository.js`, `getWeightData.jsx`, `anchors.js`, `progress.js`, `adaptationService.js` |
| `nutrition_logs` | `getNutritionData.js`, `anchors.js`, `adaptationService.js` |
| `lifestyle_logs` | `getLifestyleData.js`, `anchors.js` |

## 3. metric_entries Replacement Matrix

To point the application at the unified `metric_entries` ledger, queries must fundamentally shift from a horizontal (columnar) model to a vertical (EAV) model:

- **Row-to-Column Pivot**: Legacy queries returned a single row per day with multiple columns (e.g., `{ log_date, calories, protein }`). The new ledger returns multiple rows per day (`{ log_date, metric_id: 'calories', value_numeric }`, etc.). The application layer must pivot these rows back into the legacy object shapes to avoid refactoring the entire frontend component tree.
- **Latest State Projection (Append-Only Ledger)**: Legacy logs were Upserted (1 row per day). The new ledger is append-only. We must execute a database-level `DISTINCT ON` to get the latest `recorded_at` row per `(user_id, log_date, metric_id)` to filter out historical intra-day edits.

## 4. Semantic Equivalence & Risk Analysis

- **CRITICAL ARCHITECTURAL GAP (Supabase JS `DISTINCT ON`)**: Standard Supabase JS `.select()` does not support `DISTINCT ON`. If we query `.from('metric_entries')`, we will receive the full intra-day ledger history, breaking UI aggregation that expects exactly 1 value per day per metric.
  - **Mitigation Requirement**: We MUST create a PostgreSQL RPC (e.g., `get_daily_metrics`) or a View (e.g., `vw_metric_entries_latest`) to encapsulate the `DISTINCT ON` deduplication before passing data to the JS client.
- **Boolean Re-mapping**: `workout_completed` (legacy boolean) is now stored as `value_numeric = 1.0`. The read layer must map `value_numeric === 1.0` back to a javascript `true` boolean.
- **Soft Deletes**: Must explicitly filter `WHERE deleted_at IS NULL` to honor the ledger's logical deletion semantics.
- **`entry_date` vs `log_date`**: `progress_entries` historically used `entry_date`, while others used `log_date`. The unified table standardizes on `log_date`. Read mappings for progress must map `log_date` back to `entry_date` for downstream UI compatibility.

## 5. Exact Files Requiring Modification in Implementation

1. **New Database Migration**: We must create an RPC or View for `DISTINCT ON` queries.
2. `lib/storage.js`
3. `lib/repositories/ProgressRepository.js`
4. `lib/dashboard/getWeightData.jsx`
5. `lib/dashboard/getNutritionData.js`
6. `lib/dashboard/getLifestyleData.js`
7. `lib/analytics/progress.js`
8. `lib/notifications/anchors.js` (Can collapse 7 queries into 1 or 2 ledger queries)
9. `lib/plans/adaptationService.js`
10. `lib/analytics/unified.js`
11. `lib/habits/engine.js`

## 6. Files That MUST NOT Be Modified (Write Paths)

Gate 5 strictly targets the **Read Path**. The following write paths must remain entirely untouched, operating on legacy tables:
- `app/api/progress/route.js` (POST handler)
- `app/api/nutrition/route.js` (POST handler)
- `lib/repositories/ProgressRepository.js` (`upsertProgressEntry`)
- `lib/storage.js` (`addProgressEntry`)

## 7. Test / Validation Plan

1. Stand up the `DISTINCT ON` RPC or View via migration.
2. Update JS read path functions to query the new RPC/View and pivot the EAV data back into legacy JSON shapes.
3. Visually verify the Dashboard charts (Weight, Calories) still render identical data using the 80 backfilled `import` rows.
4. Verify the Adaptation Engine (`checkAndAdaptPlan`) still calculates the correct TDEE/eligibility without crashing.

## 8. Rollback Plan

Because Gate 5 isolates reads from writes and does not destructively migrate data, rolling back is trivial:
1. Revert the Git commit containing the JS read-path modifications.
2. Redeploy the application.
3. The new RPC/View can safely remain in the database unused. No data rollback is required.

## 9. Gate 5 GO / NO-GO Recommendation

**NO-GO FOR IMMEDIATE JS REFACTOR / BLOCKED BY SCHEMA**

While the javascript application audit is complete, we discovered a missing architectural component: The JS client cannot natively perform the required `DISTINCT ON` deduplication to collapse the append-only ledger into current-state UI values. 

**Recommendation:** Before modifying any JS files, we must execute a "Gate 5.1" schema update to deploy a `vw_metric_entries_latest` view or equivalent RPC. Once that database artifact is live, we can safely proceed with the JS read-path switch.

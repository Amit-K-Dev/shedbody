# Phase 2B Gate 5.2-A: Canonical Read Adapter Report

## 1. Files Inspected
- `lib/storage.js`
- `lib/repositories/ProgressRepository.js`
- `lib/dashboard/getWeightData.jsx`
- `lib/dashboard/getNutritionData.js`
- `lib/dashboard/getLifestyleData.js`

## 2. Adapter Location
The adapter was placed at `lib/repositories/MetricReadAdapter.js` to match the existing pattern established by `ProgressRepository.js` and keep data access logic centralized.

## 3. Adapter API/Functions
The `MetricReadAdapter` exposes:
- `getProgress({ supabase, userId }, options = {})`
- `getNutrition({ supabase, userId }, options = {})`
- `getLifestyle({ supabase, userId }, options = {})`
All three use a unified internal private method `_fetchAndPivot` which handles querying the canonical `vw_metric_entries_latest` View.

## 4. Exact Legacy Output Shapes Discovered
- **Progress**: `{ entry_date: String, weight: Number, body_fat: Number }`
- **Nutrition**: `{ log_date: String, calories_consumed: Number, protein_consumed: Number, water_ml: Number }`
- **Lifestyle**: `{ log_date: String, steps_count: Number, sleep_hours: Number, workout_completed: Boolean }`

## 5. EAV → Legacy Mapping
The adapter merges multiple rows for the same date into a single object. Only the requested metric IDs are queried and mapped to their respective legacy column names (e.g., `weight` -> `weight`, `calories` -> `calories_consumed`). Missing metrics in the database are left `undefined` in the resulting object without fabricating zeros.

## 6. Tombstone Handling
Tombstone filtering (`deleted_at IS NULL`) is strictly enforced at the application query level via Supabase's `.is('deleted_at', null)`. This ensures that canonical tombstones surfaced by the SQL View are correctly discarded by the adapter without leaking into the UI.

## 7. Workout Boolean Handling
The legacy `workout_completed` field expects a boolean. The adapter explicitly converts `value_numeric === 1.0` to `true` and `0.0` to `false`. Any other unexpected value logs a warning to the console and is ignored to prevent silent coercion of invalid data.

## 8. Date Grouping/Order Semantics
The query results are grouped by `log_date`. The adapter requests the database to order the rows chronologically by `log_date`. As rows are mapped sequentially, this preserves the natural ordering required by downstream consumers (like timeline charts). No duplicate resolution is needed in JS because `vw_metric_entries_latest` strictly enforces `DISTINCT ON`.

## 9. Error/Empty-Result Behavior
The adapter catches all query and mapping errors internally, logging them via `console.error` and returning an empty array `[]` as a fallback. This perfectly matches the defensive empty-array behavior found in `getWeightData.jsx` and `getNutritionData.js`.

## 10. Tests Created
Focused tests were written using `node:test` in `lib/repositories/MetricReadAdapter.test.js`:
- Progress, Nutrition, and Lifestyle mapping behavior.
- Missing optional metrics.
- Workout logic (1.0 -> true, 0.0 -> false, 2.0 -> ignored).
- Tombstone filtering.
- Empty state handling.

## 11. Test Results
All 5 test suites passed successfully (Duration: ~18ms), validating the Supabase query chaining mocks and the specific JSON pivoting logic.

## 12. Compatibility/Parity Results
The EAV pivot mapping results perfectly mirror the shape arrays returned by the legacy table selections. 
**Intentional Difference**: The adapter does *not* return `created_at` or `id` fields because `metric_entries` `created_at` reflects the ledger entry time (which changes on update), rather than the original log creation. UI components typically do not depend on `created_at` for display (they sort by `log_date`/`entry_date`). We will verify during Gate 5.2-B if any component strictly requires `id` for React keys, though `log_date` is typically used.

## 13. Files Modified
- Added: `lib/repositories/MetricReadAdapter.js`
- Added: `lib/repositories/MetricReadAdapter.test.js`

## 14. Files Explicitly NOT Modified
- `lib/storage.js`
- `lib/repositories/ProgressRepository.js`
- `lib/dashboard/getWeightData.jsx`
- `lib/dashboard/getNutritionData.js`
- `lib/dashboard/getLifestyleData.js`
- All other application read/write paths.

## 15. Database Safety Confirmation
- No database migrations were created.
- No database data was changed or queried.
- `vw_metric_entries_latest` remains unaltered.
- Legacy tables remain unaltered.

## 16. Remaining Gate 5.2 Work (Gate 5.2-B)
We must now integrate `MetricReadAdapter` into the actual application read paths (the files explicitly untouched above). This will involve refactoring those files to use the adapter and completely removing their dependency on the legacy `progress_entries`, `nutrition_logs`, and `lifestyle_logs` tables.

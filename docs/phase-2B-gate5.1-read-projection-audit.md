# Phase 2B Gate 5.1 Canonical Read Projection Audit

## 1. Problem Statement
The new `metric_entries` ledger uses an Entity-Attribute-Value (EAV), append-only design. However, the existing application layer expects a single latest state per user/date/metric. Direct queries against `metric_entries` using standard Supabase JS (`.select()`) will incorrectly return full intra-day history (multiple rows per metric per day if edits occurred), breaking aggregations. We must design a canonical database-side read projection to enforce `DISTINCT ON` deduplication before the data reaches the application.

## 2. Canonical Latest-State Semantics
The canonical definition of "latest state" for a specific `(user_id, metric_id, log_date)` is resolved deterministically using:
```sql
DISTINCT ON (user_id, metric_id, log_date)
ORDER BY user_id, metric_id, log_date, recorded_at DESC, created_at DESC, id DESC
```
- **`deleted_at` participation:** The canonical state *must* project the `deleted_at` value of the absolute latest row. If a user logs a weight, then deletes it, the append-only ledger receives a new row with `deleted_at = NOW()`. The projection must surface this deleted row as the "latest" state, allowing the application layer to filter it out (`WHERE deleted_at IS NULL`). If the projection stripped deleted rows before deduplication, it would incorrectly surface an older, superseded "active" row, creating a ghost-undelete bug.

## 3. Production Read-Only Evidence
Based on READ-ONLY queries against the 80 imported `metric_entries` rows in production:
- **Total Unique Users:** 5
- **Rows per Metric:** `weight` (20), `sleep` (10), `steps` (10), `calories` (10), `workout` (10), `water` (10), `protein` (10).
- **Duplicate Logical Dates (Collisions):** 0 (No intra-day duplicates currently exist, as expected for initial backfill).
- **Deleted Rows:** 0 (All legacy soft-deletes were either excluded during backfill or none existed in the sampled user cohort).
- **NULL values (`value_numeric`):** 0.
- **`recorded_at` collisions:** 0.

## 4. View vs RPC Comparison
We evaluated creating a PostgreSQL View (`vw_metric_entries_latest`) versus a PostgreSQL RPC (`get_daily_metrics`).

**Recommendation: PostgreSQL View (`vw_metric_entries_latest`)**
- **Supabase JS Ergonomics:** A View behaves identically to a table. The application can use `supabase.from('vw_metric_entries_latest').select()`, seamlessly allowing dynamic `.eq()`, `.gte()`, `.limit()`, and `.order()` chaining.
- **Cloudflare/D1 Portability (CF-0):** SQLite/D1 does *not* support stored procedures/RPCs. If we use `.rpc()` in our JS now, migrating to D1 requires rewriting the entire data-access layer in JS. If we use a View, D1 supports Views natively (we would just translate the `DISTINCT ON` to a Window function `ROW_NUMBER()` in D1 SQL). The JS application code will remain exactly `.from('vw_metric_entries_latest')`, achieving zero-friction portability.

## 5. Security and RLS Analysis
PostgreSQL views historically execute with the permissions of the view owner (Security Definer), which completely bypasses Row Level Security (RLS) on the underlying tables.
**Critical Security Mandate:** The view MUST be explicitly created with the `security_invoker = true` option.
```sql
CREATE OR REPLACE VIEW public.vw_metric_entries_latest 
WITH (security_invoker = true) AS ...
```
This forces the view to execute using the permissions of the calling Supabase user, preserving all tenant-isolation RLS policies configured on `metric_entries`.

## 6. Canonical Output Contract
The View will project a strict, strongly-typed EAV shape, deliberately stripping JSON provenance metadata that the UI does not need.
```ts
{
  id: uuid,
  user_id: uuid,
  metric_id: text,
  log_date: date,
  value_numeric: numeric,
  recorded_at: timestamptz,
  created_at: timestamptz,
  deleted_at: timestamptz
}
```

## 7. Legacy Compatibility Mapping (Pivoting)
The application will query the view and then pivot the EAV rows in JS into legacy columnar objects:
- **Progress:** Map `log_date` -> `entry_date`, `metric_id: 'weight'` -> `weight`, `metric_id: 'body_fat'` -> `body_fat`.
- **Nutrition:** Map `metric_id: 'calories'` -> `calories_consumed`, `protein` -> `protein_consumed`, `water` -> `water_ml`.
- **Lifestyle:** Map `metric_id: 'workout'` (1.0/0.0) -> `workout_completed` (true/false), `steps` -> `steps_count`, `sleep` -> `sleep_hours`.

## 8. Reader-by-Reader Mapping
- **`storage.js` (`getProgress`) & `ProgressRepository.js`**: Query view for `metric_id IN ('weight', 'body_fat')`, pivot into `{ entry_date, weight, body_fat }`.
- **`getWeightData.jsx`**: Same as above, mapped directly to chart props.
- **`getNutritionData.js`**: Query view for `metric_id IN ('calories', 'protein', 'water')`, group by `log_date`, pivot into `{ log_date, calories_consumed, ... }`.
- **`getLifestyleData.js`**: Query view for `metric_id IN ('steps', 'sleep', 'workout')`, group by `log_date`, pivot.
- **`analytics/progress.js` & `adaptationService.js`**: Use view with `.gte('log_date', start).lte('log_date', end)`, pivot for timeline evaluations.
- **`notifications/anchors.js`**: Currently performs 7 separate `.limit(1)` queries on legacy tables. Update to perform 7 separate `.limit(1)` queries on the View partitioned by `metric_id`, preserving exact semantics.
- **`unified.js` & `habits/engine.js`**: These modules already accept arrays of legacy objects. They will remain untouched, provided the upstream fetchers pivot the EAV rows correctly before passing them down.

## 9. Performance/Index Analysis
The query requires:
`DISTINCT ON (user_id, metric_id, log_date) ORDER BY user_id, metric_id, log_date, recorded_at DESC, created_at DESC, id DESC`
The existing `idx_metric_entries_deterministic_sort` created in Gate 2 perfectly aligns with this sort definition. The view will leverage this index efficiently. No new indexes are required.

## 10. Write-Path Separation
Gate 5 (Read-Path Switch) strictly prohibits modifying write paths. The following files will continue writing directly to `progress_entries`, `nutrition_logs`, and `lifestyle_logs` and are EXCLUDED from this scope:
- `app/api/progress/route.js`
- `app/api/nutrition/route.js`
- `lib/storage.js` (`addProgressEntry`)
- `lib/repositories/ProgressRepository.js` (`upsertProgressEntry`)

## 11. Recommended Implementation (Gate 5.1)
1. **Migration File**: Create a standard Supabase migration file: `[timestamp]_create_vw_metric_entries_latest.sql`.
2. **DDL**:
```sql
CREATE OR REPLACE VIEW public.vw_metric_entries_latest WITH (security_invoker = true) AS
SELECT DISTINCT ON (user_id, metric_id, log_date)
    id, user_id, metric_id, log_date, value_numeric, recorded_at, created_at, deleted_at
FROM public.metric_entries
ORDER BY user_id, metric_id, log_date, recorded_at DESC, created_at DESC, id DESC;
```

## 12. Test Plan
1. Apply the migration in local/staging.
2. Query the View using an authenticated Supabase JS client to verify RLS enforces `user_id` boundaries.
3. Validate that deleting a row correctly surfaces the tombstone (`deleted_at IS NOT NULL`) in the view rather than falling back to an older row.
4. Execute application-level JS refactors and ensure the UI renders the 80 backfilled records identically to production.

## 13. Rollback Plan
- **Database:** `DROP VIEW public.vw_metric_entries_latest;` (Safe, no data loss).
- **Application:** Git revert the JS read-path modifications.

## 14. GO / NO-GO Recommendation
**GO FOR IMPLEMENTATION**.
The canonical projection is fully designed, respects security constraints (security invoker), leverages existing indexing, cleanly separates concerns from JSON provenance, and ensures future Cloudflare/D1 portability.

We are ready to move to implementation: creating the migration and refactoring the JS read paths.

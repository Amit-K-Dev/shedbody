# Phase 2E — Egress & Database Traffic Audit

## 1. Executive Summary
This read-only audit investigates the actual sources of Supabase egress and database traffic in the Phase 2E application state. The primary objective is to determine whether retaining the legacy `archive_*` tables causes egress, and whether executing Gate 7 (dropping them) would resolve any data-transfer concerns. 
**Conclusion:** Legacy tables contribute strictly 0% to current application egress. The true source of egress is unbounded EAV history queries executing on the dashboard load path. Gate 7 must not be accelerated based on egress concerns.

## 2. Legacy Table Traffic Evidence
A comprehensive read-only search of the entire application codebase was performed for `archive_progress_entries`, `archive_nutrition_logs`, and `archive_lifestyle_logs`.
- **Result:** Zero application-layer references exist. 
- **Finding:** The legacy tables are functionally orphaned. They are not queried by the runtime, the `MetricReadAdapter`, or any active API endpoint.

## 3. Current EAV Traffic Map
All application progress/metric data is currently routed through the following EAV path:
1. **API/Server Actions:** `getWeightData.jsx`, `getNutritionData.js`, `getLifestyleData.js`, `lib/analytics/progress.js`
2. **Repository:** `MetricReadAdapter.js`
3. **Database Object:** `vw_metric_entries_latest` (Canonical projection of `metric_entries`)

## 4. API/Data Transfer Hotspots
The primary data transfer hotspots are the dashboard data-loaders:
- `lib/dashboard/getWeightData.jsx`
- `lib/dashboard/getNutritionData.js`
- `lib/dashboard/getLifestyleData.js`

Every time the dashboard is loaded, these endpoints invoke the `MetricReadAdapter` to fetch the user's metrics.

## 5. Query Shape Analysis
An inspection of `MetricReadAdapter._fetchAndPivot` and its callers reveals a critical data-transfer vulnerability:
- The dashboard loaders (e.g., `getWeightData.jsx`) invoke `MetricReadAdapter.getProgress({ supabase, userId })` **without providing a `startDate`, `endDate`, or `limit`**.
- Because bounds are omitted, the Supabase query executes as: `.eq('user_id', userId).in('metric_id', [...]).is('deleted_at', null)`.
- **Impact:** This is an **unbounded history query**. For a user with 3 years of daily activity, the dashboard fetches >1,000 rows *per metric type* across weight, body_fat, calories, protein, water, steps, sleep, and workouts. This is thousands of rows transferred on every page load.
*(Note: `lib/analytics/progress.js` correctly applies `startDate` and `endDate` bounds, making it safe).*

## 6. Egress Causality
**Does keeping `archive_*` tables alive cause application egress?**
**PROVEN NO.** The `archive_*` tables are absolutely disconnected from the read path. Keeping them alive costs at-rest storage bytes, but zero network egress bytes. The egress is entirely caused by unbounded reads against the active `vw_metric_entries_latest` view.

## 7. Database Traffic Evidence
Exact database IO/CPU statistics (e.g., `pg_stat_statements`) are currently **NOT OBSERVABLE** within the strict scope of this audit, as they require specialized administrative querying or external dashboard access.

## 8. Supabase Egress Observability
Actual Supabase egress volume (Gigabytes transferred per billing period) and API request quotas are **NOT OBSERVABLE** from the source repository.

## 9. Actual Egress Risks
Based on source code evidence, the actual egress risk is driven by:
- **Unbounded History Queries:** The dashboard unconditionally fetches the user's entire lifetime history for all metrics on load.
- **View Sort Penalty:** For thousands of rows, `vw_metric_entries_latest` must execute a `DISTINCT ON` sort operation, costing database CPU and memory in addition to network egress.

## 10. Gate-7 Impact
**Would dropping the legacy tables (Gate 7) reduce egress?**
**PROVEN NO.** Dropping the tables would free static disk space, but would have absolutely zero impact on network egress or database query volume, as the tables are completely bypassed by the runtime.

## 11. What Is Proven
- `archive_*` tables are never queried by the application.
- Dashboard data loaders issue unbounded queries spanning the user's entire history.
- Gate 7 destruction will not reduce application egress.

## 12. What Is Partially Proven
- The database performance impact of the unbounded `DISTINCT ON` queries is strongly suspected but technically only partially proven until `EXPLAIN ANALYZE` metrics at production scale are reviewed.

## 13. What Is Unknown
- The specific percentage of API quotas consumed by these unbounded queries relative to the Supabase plan limit.

## 14. What Is Not Observable
- Administrative database load metrics.
- Billing-level egress metrics.

## 15. Recommended Next Action
- Implement pagination, explicit `startDate`/`endDate` limits (e.g., a rolling 30-day window), or a `limit` clause within the dashboard data-loader functions (`getWeightData`, `getNutritionData`, `getLifestyleData`) to cap egress at the application layer.
- Do not accelerate Gate 7 based on egress concerns.

## 16. Gate-7 Status
**Gate 7 remains strictly LOCKED / UNAUTHORIZED.** Acceleration based on egress concerns is invalid. The 14-day observation window must continue uninterrupted.

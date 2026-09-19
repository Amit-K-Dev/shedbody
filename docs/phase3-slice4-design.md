# Phase 3 Slice 4 — Unified Dashboard Analytics Design

## 1. Objective
To construct a unified chronological daily timeline of user data (`DailyMetrics`) by safely merging `progress_entries` (body), `nutrition_logs` (nutrition), and `lifestyle_logs` (lifestyle). This timeline will simplify the dashboard orchestration and power new visual trend charts without modifying the underlying schema or compromising semantic boundaries.

## 2. Data Contract
The unified analytics layer operates strictly as a read-only, in-memory pure transformation of existing bounded server-side fetches.
- **Source of Truths:**
  - `progress_entries` (body metrics)
  - `nutrition_logs` (actual nutrition)
  - `lifestyle_logs` (actual lifestyle)
  - `goals` (weight goals)
  - `plans` (recommendations - NOT execution history)
- **Constraints:**
  - JavaScript only.
  - No database schema changes, no new materialized views, and no RPCs.
  - Existing individual APIs and tracking semantics remain perfectly isolated.

## 3. DailyMetrics Schema
The target unified shape for a single day is:

```javascript
{
  date: "YYYY-MM-DD",
  body: {
    weight: null, // number or null
    bodyFat: null // number or null
  },
  nutrition: {
    calories: null, // number or null
    protein: null, // number or null
    water: null // number or null
  },
  lifestyle: {
    workoutCompleted: null, // boolean or null
    steps: null, // number or null
    sleepHours: null // number or null
  }
}
```
*Note: This specific shape clearly partitions the domains, preventing naming collisions (e.g., if multiple domains ever add a `notes` or `duration` field) and making component prop drilling much cleaner.*

## 4. Merge Algorithm
The unified merge logic will reside in `lib/analytics/unified.js`.
1. **Initialize Date Map:** Create a JavaScript `Map` or plain object keyed by the string `YYYY-MM-DD`.
2. **Inject Body Data:** Iterate through the bounded `progress_entries`. Extract `entry_date`. If duplicate dates exist (since progress entries are timestamped), the later chronological entry will overwrite the earlier one (standard "latest-wins" deterministic behavior).
3. **Inject Nutrition Data:** Iterate through bounded `nutrition_logs`. Extract `log_date`. Set the `nutrition` sub-object.
4. **Inject Lifestyle Data:** Iterate through bounded `lifestyle_logs`. Extract `log_date`. Set the `lifestyle` sub-object.
5. **Sort and Arrayify:** Extract `Object.values(dateMap)`, and sort them strictly chronologically ascending by the `date` string (e.g., `a.date.localeCompare(b.date)`).
6. **Missing Dates:** Dates within the boundary that have absolutely zero entries in any of the three tables will NOT be artificially padded. Missing intra-range dates can be handled visually by the charting library if needed, maintaining minimal payload size.

## 5. Null/Zero/Boolean Semantics
The pure transformation MUST NOT use loose equality (`||`) that would coerce falsy values.
- **NULL:** Means untracked or explicitly cleared.
- **0:** Means explicitly tracked as zero (e.g., 0 steps).
- **false:** Means explicitly tracked as false (e.g., workout skipped).
- **Missing Domain:** If a day has a nutrition log but no lifestyle log, the `lifestyle` object for that day will contain explicit `null` values for its keys.

## 6. Dashboard Integration
**Modify `app/(dashboard)/dashboard/page.js`:**
- Keep the existing `Promise.all` fetching structure (fetching `boundedProgress`, `nutritionLogs`, `lifestyleLogs`).
- Instead of manually manipulating these arrays directly in `page.js`, pass them to `const unifiedTimeline = mergeDailyMetrics(boundedProgress, nutritionLogs, lifestyleLogs)`.
- Re-route the `unifiedTimeline` to any new analytics charts.
- **Backward Compatibility:** Existing components like `PremiumChart` (Weight) and `PremiumBMI` can be updated to read from `unifiedTimeline` (mapping `item.body.weight`), or we can pass the raw `boundedProgress` to them to avoid modifying legacy stable components. We will choose the safest path (leaving legacy chart props untouched if possible).

## 7. Chart Design
**New Component: `components/dashboard/PremiumAnalyticsCharts.jsx`**
- Will receive the `unifiedTimeline` array.
- Contains simple toggleable views (or side-by-side) to display:
  - **Calorie Consistency:** Bar chart mapping `item.date` to `item.nutrition.calories`.
  - **Steps/Sleep:** Trendlines mapping `item.lifestyle.steps` or `item.lifestyle.sleepHours`.
- The charts must visually distinguish `0` (a plotted bar at the baseline) from `null` (a gap or dashed line in the trend).

## 8. Performance Considerations
- **No Extra Queries:** We strictly reuse the exact same Supabase requests.
- **In-Memory Join:** The outer union of ~30-90 elements per array using a hash-map is `O(N)` and resolves in sub-milliseconds in Node.js.
- **Payload Size:** Extracting into the structured `DailyMetrics` object guarantees the client bundle size remains bounded and predictable.

## 9. Date Handling
- **No Timezone Overhaul:** We retain the existing server-side arithmetic bounds. `startDate` and `endDate` remain string-sliced representations.
- **UTC-Boundary Limitation Documented:** Users logging entries extremely late at night in edge timezones may have their logs straddle a calendar boundary depending on when they open the dashboard, but their logs will strictly align to the `YYYY-MM-DD` literal stored in the database.
- We do not silently shift calendar strings in the merger. `2026-09-18` maps strictly to `2026-09-18`.

## 10. Testing Plan
Since this repository does not use a formal automated testing framework (like Jest) in the application directories, we will rely on the established "scratch script" validation pattern.
- **Location:** `scratch/test-unified.js`
- **Coverage:** The script will test the `mergeDailyMetrics` pure function by mocking:
  - Empty inputs.
  - A single-domain input (e.g., only body progress).
  - Partial date overlaps.
  - Strict preservation of `null`, `0`, `true`, and `false`.
  - Chronological ASC sorting.
  - Deterministic duplicate-date behavior.

## 11. Exact Files to Create/Modify
**Create:**
- `lib/analytics/unified.js`
- `components/dashboard/PremiumAnalyticsCharts.jsx`
- `scratch/test-unified.js`

**Modify:**
- `app/(dashboard)/dashboard/page.js`

## 12. Explicit Out-of-Scope Items
- Changing the schema or moving to a generic `daily_logs` database design.
- Altering the backend API logging routes.
- Creating generative AI insights or adaptive logic on the new unified timeline.
- A full redesign of the Dashboard UX layout.
- Handling wearables or third-party syncing.

## 13. Risks and Rollback Plan
- **Risk:** Modifying `page.js` orchestration might break the existing `calculateTrend` or `generateInsights` pipelines if they receive the wrong array shape.
- **Mitigation:** We will leave `calculateTrend(boundedProgress, ...)` exactly as is for the legacy components, and only use the new `unifiedTimeline` for the new `PremiumAnalyticsCharts` initially, ensuring total isolation.
- **Rollback:** Revert `app/(dashboard)/dashboard/page.js` and delete the new files via a single atomic `git revert`. No database rollback is required since no schema changes are occurring.

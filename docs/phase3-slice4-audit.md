# Phase 3 Slice 4 — Unified Dashboard Analytics Audit

## 1. Current Architecture
- The dashboard is a Next.js Server Component (`app/(dashboard)/dashboard/page.js`).
- It executes top-down data fetching using `Promise.all` for multiple domains, passing raw data as props to Client Components (`StatCards`, `PremiumChart`, loggers, etc.).
- Dates are bounded using a hardcoded 30-day lookback window calculated via `Date` arithmetic and `.toISOString().slice(0,10)`.
- Core analytics logic (`calculateTrend`) lives in `lib/analytics/engine.js` and operates cleanly without database dependencies.
- The dashboard acts as a heavy orchestrator, performing on-the-fly BMI array mapping and timeline merging before handing data to the UI.

## 2. Current Dashboard Data Flow
- **Data Gathering:** 6 parallel requests fetch profile, bounded body progress, plans, active goal, bounded lifestyle logs, and bounded nutrition logs.
- **Transformation:** 
  - Weight data is mapped to calculate BMI trends.
  - Plan data is summarized for the "Active Protocol" card.
- **Injection:** Data flows directly into isolated logging components (`PremiumLogNutrition`, `PremiumLogLifestyle`, `PremiumAddWeight`) for full-state hydration and into chart components (`PremiumChart`, `PremiumBMI`).

## 3. Existing Reusable Analytics
- **`lib/analytics/engine.js`:** 
  - `calculateTrend()`: Safely extracts direction, change, rate of change, and point maps while actively ignoring `null`/`undefined`/`NaN` values.
  - `validateDateRange()`: Strictly enforces `YYYY-MM-DD` and limits query windows to a maximum of 365 days.
- **`lib/analytics/progress.js`:** 
  - `getBoundedProgress()`: Bounded, order-guaranteed fetch for `progress_entries`.

## 4. Body / Nutrition / Lifestyle / Goals Integration Points
- **Body (`progress_entries`):** Tracks `weight` and `body_fat`. Represents point-in-time measurements (timestamped, but grouped by `entry_date`).
- **Nutrition (`nutrition_logs`):** Tracks `calories_consumed`, `protein_consumed`, `water_ml`. Bounded by `log_date`.
- **Lifestyle (`lifestyle_logs`):** Tracks `workout_completed` (boolean), `steps_count`, `sleep_hours`. Bounded by `log_date`.
- **Goals (`goals`):** Provides the active target (`target_value`) which serves as the visual reference line on charts.

## 5. Query Count & Performance Observations
- **Queries:** The dashboard currently executes at least 6 separate Supabase network requests per render (excluding `getUser()`).
- **Overlap:** Three independent queries fetch time-series data over the exact same 30-day window (`progress_entries`, `nutrition_logs`, `lifestyle_logs`).
- **Risk:** While concurrent (`Promise.all`), transferring three disjoint sets of time-series arrays to the Next.js server adds overhead. As the dashboard grows to show more domains (e.g., correlations), merging these sets on the fly in `page.js` will become slow and fragile.

## 6. Date/Time Observations
- **Bounds calculation:** `page.js` uses `toISOString().slice(0, 10)` to calculate the 30-day window. This relies on the server's UTC date. For users in extreme time zones, the "last 30 days" might misalign slightly with their local today.
- **Storage:** All domains correctly use `YYYY-MM-DD` string columns (`entry_date` / `log_date`).
- **Analytics Parsing:** `engine.js` appends `T00:00:00Z` to ensure uniform UTC parsing, preventing local timezone shifts during duration calculations.

## 7. Missing-Data Semantics
- The domains properly support strict semantic boundaries:
  - **`NULL`** = Data was explicitly untracked/cleared.
  - **`0`** = Explicitly measured as zero (e.g., 0 steps).
  - **`false`** = Explicitly marked as not completed (e.g., workout skipped).
- **Rule:** Any unified analytics layer MUST NOT coalesce `NULL` into `0`. The difference between a rest day (0 steps) and an untracked day (NULL) must be mathematically preserved.

## 8. Problems & Risks
- **Dashboard Bloat:** `page.js` is bloated with mapping logic (e.g., BMI arrays, insight payloads).
- **Disjointed Timelines:** There is currently no single "Daily Snapshot" object. Answering "Did I hit my calorie target on the day I weighed my lowest?" requires manual matrix mapping across three different arrays.
- **UI Gap:** We are logging Nutrition and Lifestyle, but we have no charts or historical views for them on the dashboard (only Weight/BMI are currently charted).

## 9. Recommended Next Vertical Slice
**Phase 3 Slice 4: Unified Time-Series Layer & Extended Charts**
1. Create a server-side analytics merger (`lib/analytics/unified.js`) that takes the bounded outputs of Progress, Nutrition, and Lifestyle and zip-merges them into a single chronological `DailyMetrics` array.
2. Refactor `page.js` to consume this unified timeline, reducing internal mapping logic.
3. Add a simple UI component (e.g., `PremiumConsistencyChart` or extended stat cards) to actually visualize the newly collected Lifestyle and Nutrition data.

## 10. Explicit Out-of-Scope Items
- Do NOT build a full dashboard layout redesign.
- Do NOT build a holistic "Health Score".
- Do NOT build AI correlations or deterministic insights based on the unified data yet.
- Do NOT build adaptive plan shifting.
- Do NOT change the database schema (no materialized views or single `daily_logs` table).

## 11. Proposed Files to Change/Create
- **[NEW]** `lib/analytics/unified.js`: Pure functions to perform outer-joins on date strings across the three datasets.
- **[MODIFY]** `app/(dashboard)/dashboard/page.js`: Clean up orchestration by leveraging `unified.js`.
- **[NEW]** `components/dashboard/PremiumAnalyticsCharts.jsx`: Render basic trendlines/bars for calories, steps, or sleep using the unified data.

## 12. Proposed Tests
- **Unit/Behavioral:** Test the `lib/analytics/unified.js` merging logic to guarantee that:
  - Days with partial tracking correctly map `NULL` for missing domains.
  - `0` is strictly preserved and not dropped/coalesced.
  - The final array is strictly chronological.

# Phase 3 Slice 3 App Integration Audit

## 1. API
- **Proposed Route:** `POST /api/lifestyle`
- **Authentication Pattern:** Identical to Nutrition, using `supabase.auth.getUser()` in a Next.js App Router API route.
- **Error Handling:** Standard `try/catch` with `NextResponse.json` returning 400 for validation errors, 401 for auth errors, and 500 for RPC failures.
- **Date Validation:** The YYYY-MM-DD validator (`isValidCalendarDate`) currently embedded inside `app/api/nutrition/route.js` must be extracted into a shared utility (e.g., `lib/utils/dateValidator.js`) to ensure both Nutrition and Lifestyle APIs strictly enforce valid local calendar dates.
- **Request Payload:**
  ```json
  {
    "logDate": "YYYY-MM-DD",
    "workoutCompleted": true | false | null,
    "stepsCount": 5000 | 0 | null,
    "sleepHours": 7.5 | null
  }
  ```
- **RPC Invocation:** The API will execute `await supabase.rpc("upsert_lifestyle_log", { p_log_date, p_workout_completed, p_steps_count, p_sleep_hours });`

## 2. UI
- **Dashboard Layout:** The component should be placed inside the existing `ACTIONS` grid in `app/(dashboard)/dashboard/page.js` alongside `<PremiumAddWeight />` and `<PremiumLogNutrition />`.
- **Component Pattern:** A new client component `<PremiumLogLifestyle />`.
- **Primitives:** Re-use the existing visual identity of `<PremiumLogNutrition />` (e.g., Lucide icons, dark zinc background with subtle color glows, `use-toast` notifications, and disabled/loading button states).
- **Mobile Constraints:** Ensure flex layouts wrap correctly using existing Tailwind classes (`flex-col xl:flex-row`).

## 3. Current-data loading
- **Current Pattern:** The dashboard currently fetches metrics using `Promise.all` with server-side helpers (e.g., `getBoundedProgress` fetching from `progress_entries`).
- **Data Fetching:** A new helper `getLifestyleData(authContext, startDate, endDate)` should be introduced to fetch the user's `lifestyle_logs` within the dashboard's active date range.
- **Preventing NULL Overwrites:** The Nutrition API currently has a bug where omitting fields sends `NULL` to the RPC, blindly overwriting existing database values. To fix this for Lifestyle:
  - The Server Component will fetch the recent logs and pass them to the Client Component.
  - The Client Component will initialize its state (`workoutCompleted`, `stepsCount`, `sleepHours`) with the existing values from the database.
  - When submitting, untouched fields will retain their loaded values, ensuring the full-state upsert safely preserves existing data.

## 4. Local date semantics
- **Timezone Safety:** Server Components run in UTC, meaning `new Date().toISOString()` on the server might correspond to "yesterday" or "tomorrow" for the user.
- **Resolution:** The Server Component will pass an array of `recentLogs` (the bounded 30-day dataset). The Client Component will calculate `localLogDate` (e.g., `2026-09-18`) strictly in the browser using the user's local timezone. It will then `find()` the corresponding log from `recentLogs` to hydrate the UI. This mathematically eliminates UTC date-drift bugs.

## 5. Form semantics
- **workout_completed:**
  - `NULL`: Not tracked / Empty
  - `false`: Explicitly Skipped / No
  - `true`: Completed / Yes
  - *UI Implementation:* A standard checkbox is insufficient (only 2 states). A segmented control or a `<select>` dropdown (`Not Tracked`, `Completed`, `Skipped`) is required to safely express `NULL` vs `false`.
- **steps_count:**
  - `NULL`: Empty input
  - `0`: Valid integer `0`
- **sleep_hours:**
  - `NULL`: Empty input
  - Supports decimals (e.g., `7.5`).

## 6. Full-state upsert requirement
- The `upsert_lifestyle_log` RPC intentionally uses `EXCLUDED.field` without `COALESCE`. 
- By initializing the UI with the existing row state and passing all three variables back to the API on every save, the UI acts as the authoritative source of truth, satisfying the strict full-state requirement safely.

## 7. Scope protection
- **EXCLUDED:** 
  - No workout rep/set tracking.
  - No workout player/timer.
  - No Apple Health / Google Fit wearable integrations.
  - No habit builder (custom habits).
  - No sleep quality scoring or derived health scores.
  - No AI analytics additions (yet).
- **FOCUS:** Pure deterministic manual logging.

## 8. Reuse
- Extract `isValidCalendarDate` from `api/nutrition/route.js`.
- Reuse `@/components/ui/use-toast`.
- Reuse `<MotionWrapper>` and standard structural Tailwind classes from the existing dashboard page.

## 9. Proposed implementation files
- `lib/utils/dateValidator.js` **[NEW]** (Extracted validation logic)
- `app/api/nutrition/route.js` **[MODIFIED]** (Import extracted validator)
- `app/api/lifestyle/route.js` **[NEW]** (API handler)
- `lib/dashboard/getLifestyleData.js` **[NEW]** (Server data fetcher)
- `components/dashboard/PremiumLogLifestyle.jsx` **[NEW]** (UI Client Component)
- `app/(dashboard)/dashboard/page.js` **[MODIFIED]** (Server component injection)

## 10. Test plan
After implementation, perform these smoke tests without altering production schema:
1. **Dashboard Load:** Verify the page loads cleanly without errors.
2. **Local Hydration:** Log an entry directly via SQL. Verify the UI correctly mounts showing those pre-existing values.
3. **First Save:** Submit a full log for today. Verify correct DB storage.
4. **Same-Day Update:** Overwrite the same day with new values. Verify DB updates (no duplicates).
5. **Partial Metric Update:** Change only sleep. Verify workout and steps remain preserved.
6. **Clearing to NULL:** Delete steps input. Verify the DB row reflects `NULL`.
7. **False Workout:** Explicitly log workout as Skipped. Verify `false` is stored.
8. **Zero Steps:** Log `0` steps explicitly. Verify `0` is stored.
9. **Decimal Sleep:** Log `7.5` hours of sleep. Verify correct storage.
10. **Invalid Values:** Attempt to bypass client UI (e.g., negative sleep). Verify API rejects it.
11. **Authentication Failure:** Manually trigger API without a session. Verify 401 rejection.
12. **Production End-to-End:** Review the database to confirm data integrity matches the UI state perfectly.

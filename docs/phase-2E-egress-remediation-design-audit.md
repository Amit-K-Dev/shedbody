# Phase 2E — Egress Remediation Design Audit

## 1. Executive Summary
This design audit investigates the application-layer root causes of the excessive network egress identified during Phase 2E and proposes a safe, read-only remediation plan. The investigation reveals that a critical signature mismatch in the Node.js data-loader wrappers completely neuters the intended 30-day date bounds, causing the Dashboard, Timeline, and AI Coach to silently fetch the user's entire lifetime history on every navigation.

**Key Finding:** Remediation requires zero database migrations and zero modifications to the `MetricReadAdapter` core. The fix is purely syntactical within the wrapper functions, perfectly preserving Phase 2E semantics and Gate 7 separation.

## 2. Dashboard Consumer Map
Data loaders are invoked across four primary Next.js server routes, all operating with `export const dynamic = "force-dynamic"`:

1. **`app/(dashboard)/dashboard/page.js`**
   - **Intended Range:** 30 Days (Rolling)
   - **Actual Range:** Progress (30 Days), Nutrition (Lifetime), Lifestyle (Lifetime)
2. **`app/(dashboard)/timeline/page.jsx`**
   - **Intended Range:** 30 Days (Rolling)
   - **Actual Range:** Progress (30 Days), Nutrition (Lifetime), Lifestyle (Lifetime)
3. **`app/(dashboard)/reports/page.jsx`**
   - **Intended Range:** 7 Days, 30 Days, or Lifetime (depending on UI tab)
   - **Actual Range:** Same as intended for Progress. Lifetime for Nutrition/Lifestyle across all tabs.
4. **`app/api/ai/coach/route.js`**
   - **Intended Range:** 30 Days (Rolling)
   - **Actual Range:** Progress (30 Days), Nutrition (Lifetime), Lifestyle (Lifetime)

*Note: `lib/dashboard/getWeightData.jsx` was audited and found to be orphaned/dead code; `getBoundedProgress` has superseded it for all active routes.*

## 3. Data Requirement Matrix
- **Dashboard / Timeline / AI Coach:** Only require the most recent 30 days to render short-term charts, habit matrices, and context dictionaries.
- **Reports (Weekly/Monthly):** Only require 7 or 30 days.
- **Reports (Progress/Goal):** Explicitly require lifetime data to analyze historical trends.

## 4. Current Query & Response Analysis
**The Root Cause (Signature Mismatch):**
In `dashboard/page.js`, the loaders are called as:
`getLifestyleData(authContext, startDate, endDate)`

Inside `lib/dashboard/getLifestyleData.js`, it delegates to the adapter as:
`MetricReadAdapter.getLifestyle({ supabase, userId }, startDate, endDate)`

However, the `MetricReadAdapter.getLifestyle` signature expects an options object:
`static async getLifestyle({ supabase, userId }, options = {})`

Because `startDate` (a string) is passed as the `options` argument, the internal destructuring `const { startDate, endDate } = options` evaluates to `undefined`. Consequently, the adapter applies no `.gte` or `.lte` filters, defaulting to a full `user_id` table scan against the canonical view.

**Quantitative Shape:**
For a 3-year active user, the dashboard intentionally fetches ~30 progress rows. Due to the bug, it unintentionally fetches ~1,095 nutrition rows and ~1,095 lifestyle rows, multiplied by the number of metrics (calories, protein, water, steps, sleep, workout), resulting in thousands of redundant EAV rows transferred and pivoted in memory on every page load.

## 5. Duplicate Fetch Analysis
- **Cross-Navigation Redundancy:** Because all routes use `force-dynamic`, navigating from Dashboard → Timeline → Reports causes the server to re-fetch the exact same (currently unbounded) datasets sequentially. Next.js App Router cache is explicitly bypassed.
- **Over-fetching Columns:** The canonical view returns `deleted_at`, `id`, and `created_at`. While `id` and `created_at` are used by `getProgress` to map timeline edits, they are entirely ignored by `getLifestyle` and `getNutrition`, resulting in wasted JSON payload bytes from Supabase to Node.js.

## 6. Egress Remediation Options

| Strategy | Benefit | Risk | Complexity |
| :--- | :--- | :--- | :--- |
| **A. Fix Signature Bug (Bounded)** | Instantly reduces egress by >90% for long-term users by honoring the 30-day bound. | None. Fixes existing intended logic. | Low. Change positional args to an object. |
| **B. Next.js `unstable_cache`** | Prevents redundant fetches across navigations (Dashboard → Timeline). | Stale data if the user logs a metric and immediately navigates. | Medium. Requires careful tag invalidation. |
| **C. Server-Side Aggregation** | Solves the "Lifetime Reports" unbounded fetch by downsampling data in SQL. | Requires new RPCs/views, violating Phase 2E read-only lock. | High. |

## 7. Recommended Architecture
The safest, highest-impact remediation is **Strategy A**.

**Design:**
Do not modify the `MetricReadAdapter`. Instead, modify the `lib/dashboard/getLifestyleData.js` and `lib/dashboard/getNutritionData.js` wrappers to correctly construct the `options` object:

```javascript
// Example Design for getLifestyleData.js:
const options = {};
if (startDate) options.startDate = startDate;
if (endDate) options.endDate = endDate;
const data = await MetricReadAdapter.getLifestyle({ supabase, userId }, options);
```

For the `reports/page.jsx` "Progress" and "Goal" tabs, accept that they will perform an unbounded lifetime fetch. Because these tabs are rarely visited compared to the primary Dashboard, the egress cost is acceptable and requires no dangerous aggregation logic at this stage.

## 8. Migration Safety Analysis
- **Legacy Tables:** Unaffected. `archive_*` tables remain untouched.
- **Schema:** Unaffected. `metric_entries` remains strictly append-only EAV.
- **View Semantics:** Unaffected. The `DISTINCT ON` collapse logic remains identical; it simply processes a smaller date range.
- **Phase 2E Validity:** Unaffected. The read-path invariant remains completely intact.

## 9. Gate-7 Relationship
- **Is this required before Gate 7?** No.
- **Should Gate 7 wait for this?** No. They are decoupled.
- **Gate 7 Egress Benefit:** None. Gate 7 destroys legacy tables which generate zero traffic. This application-layer patch is the *only* mechanism to reduce network egress.

## 10. Implementation Plan
1. Update `lib/dashboard/getLifestyleData.js`.
2. Update `lib/dashboard/getNutritionData.js`.
3. (Optional) Remove `lib/dashboard/getWeightData.jsx` to reduce technical debt.
4. (Optional) Audit other isolated data loaders for similar signature mismatches.

## 11. Risks
- None identified. Applying the intended date bounds strictly improves performance, latency, memory usage, and network egress without altering business logic.

## 12. Open Questions
- Should `reports/page.jsx` explicitly cap lifetime queries with a `.limit(365)` to prevent extreme edge cases, or allow true lifetime? (Recommendation: Allow true lifetime for reports, as pagination would break long-term trend lines).

## 13. Final Recommendation
Implement the signature fix in the data loaders in a subsequent PR. **Do not execute Gate 7 for egress reasons.** Maintain the 14-day production observation protocol until its natural conclusion.

FILE | SUPABASE DEPENDENCY | DOMAIN | OPERATION | CURRENT SECURITY MODEL | TARGET REPOSITORY / SERVICE | MIGRATION STATUS
---|---|---|---|---|---|---
app/(admin)/admin/layout.js | createClient, supabase.auth | Admin/Security | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(admin)/admin/new-post/page.js | createClient, supabase.auth | Admin/Security | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(admin)/admin/posts/page.js | createClient | Admin/Security | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(admin)/admin/posts/[id]/page.js | createClient, supabase.auth | Admin/Security | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(auth)/auth/callback/route.js | createServerClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
app/(auth)/login/page.js | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
app/(auth)/signup/page.js | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
app/(dashboard)/dashboard/page.js | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(dashboard)/layout.js | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(dashboard)/profile/page.js | createClient, supabase.auth | Profile | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(dashboard)/profile/settings/page.js | createClient, supabase.auth | Profile | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(dashboard)/reports/page.jsx | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(dashboard)/start/page.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(dashboard)/timeline/page.jsx | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(public)/experts/[id]/page.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/(public)/page.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/admin/upload/route.js | createClient, supabase.auth | Admin/Security | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/ai/coach/route.js | createClient, supabase.auth | AI/Insights | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/article-feedback/route.js | createClient, supabase.rpc | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/contact/route.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/habits/route.js | createClient, supabase.auth, supabase.rpc | Habits | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/lifestyle/route.js | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/notifications/preferences/route.js | createClient, supabase.auth | Notifications | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/notifications/read/route.js | createClient, supabase.auth | Notifications | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/notifications/route.js | createClient, supabase.auth | Notifications | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/notifications/sync/route.js | createClient, supabase.auth | Notifications | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/nutrition/route.js | createClient, supabase.auth | Nutrition | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/plans/adapt/route.js | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/posts/route.js | createClient | Posts/Blog | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/progress/route.js | createClient, supabase.auth | Progress | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/api/view/route.js | createClient, supabase.rpc | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/image-sitemap.xml/route.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/news-sitemap.xml/route.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/rss.xml/route.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/search-index/route.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
app/sitemap.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
components/calculator/CalculatorEngine.jsx | createClient, supabase.auth, supabase.rpc | Calculators | CRUD / Auth | Supabase RLS / Auth | CalculatorRepository | [MIGRATED]
components/dashboard/PremiumSetGoal.jsx | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
components/dashboard/ReminderSettings.jsx | createClient, supabase.rpc | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
components/layout/Header.jsx | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/actions/logout.jsx | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
lib/analytics/progress.js | createClient, supabase.auth | Progress | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/auth/getUser.jsx | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
lib/dashboard/getProfileData.jsx | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/dashboard/getStreak.jsx | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/dashboard/getWeightData.jsx | createClient, supabase.auth | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/db/supabase.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
lib/gamification/addXP.jsx | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/gamification/checkBadges.jsx | createClient, supabase.from | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/goals.js | createClient, supabase.auth | Goals | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/notifications/anchors.js | createClient, supabase.auth, supabase.from | Notifications | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/plans/adaptationService.js | createClient, supabase.auth, supabase.rpc | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/plans/adaptationService.test.js | supabase.from | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/posts.jsx | createClient, supabase.from | Posts/Blog | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/storage.js | createClient, supabase.auth, supabase.rpc | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/streak/updateStreak.jsx | createClient, supabase.rpc | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [MIGRATED]
lib/supabase/admin.js | createClient | Admin/Security | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
lib/supabase/client.js | createBrowserClient, createClient | Foundation | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
lib/supabase/server.js | createServerClient, createClient | Foundation | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
proxy.js | createServerClient, supabase.auth | Foundation | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A - SUPABASE AUTH ONLY]
scripts/cf-7-audit.js | createClient | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A]
scripts/test-ai-gateway.js | createClient | AI/Insights | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A]
verify_db.js | createClient, supabase.from | Unknown | CRUD / Auth | Supabase RLS / Auth | DomainRepository | [N/A]

## CF-7 Domains 1-8 Formal Verification Matrix

| Domain | UI/Server | API | Repository | D1 Path | Auth | Tenant Isolation | Supabase Deps | RPC Deps | R2 Deps | Python Boundary | Tests | Regression Risk | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1. Profile** | `profile/page.js`, `settings/page.js` | `lib/actions/profile.js` | `ProfileRepository` | YES | `supabase.auth` | `_validateUser` | YES | `save_user_profile` | None | None | `test_d1_repositories.js` | LOW | `[IN MIGRATION]` |
| **2. Goals** | `start/page.js`, `PremiumSetGoal.jsx` | `lib/goals.js` | `GoalRepository` | YES | `supabase.auth` | `_validateUser` | YES | `create_weight_goal` | None | None | `test_d1_repositories.js` | LOW | `[IN MIGRATION]` |
| **3. Tracking** | `dashboard/page.js`, `timeline/page.jsx` | Server Actions | `MetricRepository`, `GoalRepository` | YES | `supabase.auth` | `_validateUser` | YES | None | None | None | `cf-3-tenant-isolation` | LOW | `[IN MIGRATION]` |
| **4. Nutrition** | Client Components | `app/api/nutrition/route.js` | `NutritionRepository`, `MetricRepository` | YES | `supabase.auth` | `_validateUser` | `MetricWriteAdapter` | None | None | None | `cf-3-tenant-isolation`, `cf-8-atomicity` | LOW | `[IN MIGRATION]` |
| **5. Workout** | Unified in Lifestyle | `app/api/lifestyle/route.js` | `LifestyleRepository`, `MetricRepository` | YES | `supabase.auth` | `_validateUser` | `MetricWriteAdapter` | None | None | None | `cf-3-tenant-isolation`, `cf-8-atomicity` | LOW | `[IN MIGRATION]` |
| **6. Habits** | Client Components | `app/api/habits/route.js` | `HabitRepository` | YES | `supabase.auth` | `_validateUser` | YES | `upsert_habit_entry` | None | None | None | LOW | `[IN MIGRATION]` |
| **7. Sleep/Recovery**| Unified in Lifestyle | `app/api/lifestyle/route.js` | `LifestyleRepository`, `MetricRepository` | YES | `supabase.auth` | `_validateUser` | `MetricWriteAdapter` | None | None | None | `cf-3-tenant-isolation`, `cf-8-atomicity` | LOW | `[IN MIGRATION]` |
| **8. Progress** | Client Components | `app/api/progress/route.js` | `MetricRepository`, `ProgressRepository` | YES | `supabase.auth` | `_validateUser` | `ProgressRepository` | None | None | None | `test_d1_repositories.js` | LOW | `[IN MIGRATION]` |

### Verification Summary
- **Atomic Batched Writes**: The previous regression risk regarding non-atomic dual-writes in Nutrition and Lifestyle has been **RESOLVED**. `MetricRepository`, `NutritionRepository`, and `LifestyleRepository` now expose `getCommitStatements()` and `getUpsertStatement()`. These statements are passed into `adapter.batch()` in `app/api/nutrition/route.js` and `app/api/lifestyle/route.js`, guaranteeing atomic transactions in D1. Validated via `cf-8-atomicity.test.js`.
- **Tenant Isolation**: Explicitly verified. User IDs are extracted from `supabase.auth` and bound directly into SQL queries inside Repositories. Missing User IDs throw `SECURITY FAULT`. Validated via `cf-3-tenant-isolation.test.js`.
- **Remaining Supabase Dependencies**: Repositories are dual-pathing via `process.env.DB`. When D1 is inactive, code routes to Supabase RPCs (e.g., `save_user_profile`, `create_weight_goal`, `upsert_habit_entry`). Because the fallback production path relies on these Supabase RPCs, these domains cannot be marked as fully migrated until CF-12 (Production Cutover).
- **Final Verdict**: **DOMAINS 1-8 ARE PARTIALLY IMPLEMENTED [IN MIGRATION]**. While the D1 local infrastructure is robust and atomic, the production layer remains heavily dependent on Supabase. Domains 9 and 10 MUST NOT start until we finalize this verification gate.

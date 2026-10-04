# Cloudflare Migration Audit

*This document is the result of a comprehensive read-only audit of the ShedBody repository and Supabase production environment.*

## 1. Complete PostgreSQL routine inventory

**22 routines identified in the `public` schema.**

| Function Name | Args | Return Type | Language | Security | Tables Touched | DML Types | Business Purpose | Caller | RPC Usage | Trigger Usage | CF/D1 Implication | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `adapt_plan` | p_goal_id uuid, p_eval... (16 args) | jsonb | plpgsql | DEFINER | plans, goals, adaptation_events | INS, UPD, DEL, SEL | Core AI plan adaptation logic | `lib/plans/adaptationService.js` | Yes | No | Huge logic rewrite to TS Worker | NOT STARTED |
| `add_user_xp` | target_user_id uuid, xp_amount int | TABLE | plpgsql | DEFINER | user_profiles | UPD, SEL | Gamification XP calculation | `lib/gamification/addXP.jsx` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `admin_post_stats` | none | TABLE | plpgsql | DEFINER | posts, post_views | SEL | Admin dashboard analytics | `lib/posts.jsx` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `clear_all_plans` | none | void | plpgsql | DEFINER | plans | UPD, DEL | Soft delete all user plans | `lib/storage.js` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `create_weight_goal` | p_target_value numeric | goals | plpgsql | DEFINER | goals | INS, UPD, DEL, SEL | Create/update user goals | `lib/goals.js` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `handle_new_user` | none | trigger | plpgsql | DEFINER | profiles | INS | Supabase Auth webhook | `auth.users` | No | Yes | Move to Auth provider webhook | NOT STARTED |
| `increment_views` | post_id bigint | void | plpgsql | DEFINER | posts | UPD | Increment view counter | `app/api/view/route.js` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `is_admin` | user_id uuid (default uid) | boolean | plpgsql | DEFINER | profiles | SEL | RLS admin check helper | RLS Policies | No | No | Replace with TS app-level check | NOT STARTED |
| `record_article_feedback` | post_id, hash, vote | TABLE | plpgsql | DEFINER | article_feedback | INS, UPD, SEL | Register upvote/downvote | `app/api/article-feedback` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `record_article_feedback` | post_id, hash, vote, reason, note | TABLE | plpgsql | DEFINER | article_feedback | INS, UPD, SEL | Register vote + feedback | `app/api/article-feedback` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `record_post_view` | post_id, hash, viewed_at | jsonb | plpgsql | DEFINER | post_views | INS, UPD, SEL | Register unique reader view | `app/api/view/route.js` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `save_user_profile` | p_goal, p_weight... (10 args) | TABLE | plpgsql | DEFINER | user_profiles | INS, UPD, SEL | User onboarding/settings | `lib/storage.js` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `soft_delete_plan` | p_id uuid | void | plpgsql | DEFINER | plans | UPD, DEL | Archive single plan | `lib/storage.js` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `sync_user_profile_weight`| none | trigger | plpgsql | DEFINER | progress_entries, user_profiles | INS, UPD, DEL, SEL | Keep profile weight up to date | Triggers | No | Yes | Move to app-level side-effect | NOT STARTED |
| `trigger_gamification_on_progress`| none | trigger | plpgsql | DEFINER | progress_entries | UPD | (Retired trigger logic) | None | No | No | None (Retired) | RETIRED |
| `update_updated_at_column`| none | trigger | plpgsql | INVOKER | Various | UPD | Standard timestamp trigger | Triggers | No | Yes | Set in app-level DAL | NOT STARTED |
| `update_user_streak` | target_user_id uuid | int | plpgsql | DEFINER | user_profiles | UPD, SEL | Habit streak increment | Server Actions | No | No | Rewrite to TS Worker | NOT STARTED |
| `upsert_calculator_result`| p_calculator_id, p_input, p_result| void | plpgsql | DEFINER | calculator_results | INS, UPD, DEL | Save tool calculation | `CalculatorEngine.jsx` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `upsert_habit_entry` | p_habit_name, log_date, completed | habit_entries | plpgsql | DEFINER | habit_entries | INS, UPD | Toggle habit state | `app/api/habits` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `upsert_lifestyle_log` | log_date, workout, steps, sleep | lifestyle_logs | plpgsql | DEFINER | lifestyle_logs | INS, UPD | Save daily lifestyle metrics | `app/api/lifestyle` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `upsert_nutrition_log` | log_date, calories, protein, water | nutrition_logs | plpgsql | DEFINER | nutrition_logs | INS, UPD, DEL, SEL | Save daily macros | `app/api/nutrition` | Yes | No | Rewrite to TS Worker | NOT STARTED |
| `upsert_plan` | p_goal, p_diet... (8 args) | plans | plpgsql | DEFINER | plans | INS, UPD, DEL | Manual or AI plan creation | `lib/storage.js` | Yes | No | Rewrite to TS Worker | NOT STARTED |

*(Note: `upsert_progress_entry` was called by `app/(dashboard)/start/page.js`, but it was removed from the DB in a previous migration. This is an application-side bug).*

## 2. Complete trigger inventory

**8 triggers identified in the `public` schema.**

| Trigger Name | Table | Timing | Event | Function | Affected Columns | Business Purpose | Side Effects | Worker/D1 Equivalent | Migration Status |
|---|---|---|---|---|---|---|---|---|---|
| `update_user_profiles_updated_at` | `user_profiles` | BEFORE | UPDATE | `update_updated_at_column` | `updated_at` | Audit trail | Sets `updated_at=now()` | Explicit in DAL/Worker logic | NOT STARTED |
| `update_plans_updated_at` | `plans` | BEFORE | UPDATE | `update_updated_at_column` | `updated_at` | Audit trail | Sets `updated_at=now()` | Explicit in DAL/Worker logic | NOT STARTED |
| `update_progress_updated_at` | `progress_entries` | BEFORE | UPDATE | `update_updated_at_column` | `updated_at` | Audit trail | Sets `updated_at=now()` | Explicit in DAL/Worker logic | NOT STARTED |
| `on_progress_entries_changed` | `progress_entries` | AFTER | INSERT | `sync_user_profile_weight` | Profile weight | Denormalize state | Updates `user_profiles` | Worker hook on INSERT | NOT STARTED |
| `on_progress_entries_changed` | `progress_entries` | AFTER | UPDATE | `sync_user_profile_weight` | Profile weight | Denormalize state | Updates `user_profiles` | Worker hook on UPDATE | NOT STARTED |
| `on_progress_entries_changed` | `progress_entries` | AFTER | DELETE | `sync_user_profile_weight` | Profile weight | Denormalize state | Updates `user_profiles` | Worker hook on DELETE | NOT STARTED |
| `notification_preferences_updated_at`| `notification_preferences`| BEFORE | UPDATE | `update_updated_at_column` | `updated_at` | Audit trail | Sets `updated_at=now()` | Explicit in DAL/Worker logic | NOT STARTED |
| `update_habit_entries_updated_at`| `habit_entries` | BEFORE | UPDATE | `update_updated_at_column` | `updated_at` | Audit trail | Sets `updated_at=now()` | Explicit in DAL/Worker logic | NOT STARTED |

## 3. Complete RLS inventory

**57 active RLS policies identified in the `public` schema.**

*   `article_feedback`: 1 policy (`Admins can read article feedback`)
*   `badges`: 1 policy (`Anyone can read badges`)
*   `calculator_categories`: 1 policy (`Anyone can read calculator categories`)
*   `calculator_results`: 7 policies (`Allow public insert for anonymous users`, `User can manage their own results`, `Users can delete own calculator results`, `Users can insert own calculator results`, `Users can read own calculator results`, `Users can update own calculator results`, `Users manage own calculator results`)
*   `calculators`: 1 policy (`Anyone can read calculators`)
*   `contact_submissions`: 2 policies (`Admins can read contact submissions`, `Anyone can submit contact form`)
*   `goals`: 1 policy (`Users can view their own goals`)
*   `habit_entries`: 1 policy (`Users can view their own habit entries`)
*   `lifestyle_logs`: 1 policy (`Users can view their own lifestyle logs`)
*   `adaptation_events`: 1 policy (`Users can view their own adaptation events`)
*   `metrics`: 1 policy (`Metrics are globally readable`)
*   `metric_entries`: 2 policies (`Users can insert their own metric entries`, `Users can read their own metric entries`)
*   `notification_preferences`: 4 policies (`Users can insert own notification preferences`, `Users can update own notification preferences`, `Users can view own notification preferences`, `Users can view own notification preferences` duplicate?)
*   `notifications`: 3 policies (`Users can delete own notifications`, `Users can update own notifications`, `Users can view own notifications`)
*   `nutrition_logs`: 1 policy (`Users can view their own nutrition logs`)
*   `pages`: 1 policy (`Allow public read`)
*   `plans`: 5 policies (`User can manage their plans`, `Users can delete own plans`, `Users can insert own plans`, `Users can read own plans`, `Users can update own plans`)
*   `post_views`: 2 policies (`Admins can read post views`, `Public can insert post views`)
*   `posts`: 7 policies (`Admins have full access to posts`, `Admins manage posts`, `Allow public read`, `Allow update views`, `Anyone can view published posts`, `Author can update their own posts`, `Public can read publishable posts`, `Public can read published posts`)
*   `profiles`: 2 policies (`Users read own profile`, `Users update own profile`)
*   `progress_entries`: 6 policies (`User can manage their progress`, `Users can delete own progress entries`, `Users can insert own progress entries`, `Users can read own progress entries`, `Users can update own progress entries`, `Users manage own progress entries`)
*   `redirects`: 2 policies (`Admins manage redirects`, `Public can read redirects`)
*   `user_badges`: 1 policy (`Users manage own badges`)
*   `user_profiles`: 3 policies (`user_profiles_insert_own`, `user_profiles_select_own`, `user_profiles_update_own`)

*D1 equivalent require completely shifting these declarative policies into explicit API layer middleware or DAL `WHERE user_id = ?` checks. Migration status: NOT STARTED.*

## 4. Complete public table inventory

**24 public tables identified in production.**

| Table Name | Domain/Purpose | RLS Enabled? | Triggers | DB Routines Touching It | D1 Migration Complexity | Status |
|---|---|---|---|---|---|---|
| `adaptation_events` | Tracking | Yes (1) | No | `adapt_plan` | LOW | NOT STARTED |
| `article_feedback` | Content | Yes (1) | No | `record_article_feedback` | LOW | NOT STARTED |
| `badges` | Gamification | Yes (1) | No | None | LOW | NOT STARTED |
| `calculator_categories` | Content | Yes (1) | No | None | LOW | NOT STARTED |
| `calculator_results` | Tools | Yes (7) | No | `upsert_calculator_result` | MEDIUM | NOT STARTED |
| `calculators` | Content | Yes (1) | No | None | LOW | NOT STARTED |
| `contact_submissions` | Admin | Yes (2) | No | None | LOW | NOT STARTED |
| `goals` | Tracking | Yes (1) | No | `create_weight_goal`, `adapt_plan` | MEDIUM | NOT STARTED |
| `habit_entries` | Tracking | Yes (1) | Yes (1) | `upsert_habit_entry` | LOW | NOT STARTED |
| `lifestyle_logs` | Tracking | Yes (1) | No | `upsert_lifestyle_log` | LOW | NOT STARTED |
| `metrics` | Phase 2B Core | Yes (1) | No | None | LOW | VERIFIED (Gate 2) |
| `metric_entries` | Phase 2B Core | Yes (2) | No | None | LOW | VERIFIED (Gate 2) |
| `notification_preferences` | User prefs | Yes (3) | Yes (1) | None | LOW | NOT STARTED |
| `notifications` | System | Yes (3) | No | None | LOW | NOT STARTED |
| `nutrition_logs` | Tracking | Yes (1) | No | `upsert_nutrition_log` | LOW | NOT STARTED |
| `pages` | CMS | Yes (1) | No | None | LOW | NOT STARTED |
| `plans` | AI Output | Yes (5) | Yes (1) | `upsert_plan`, `soft_delete_plan`, `clear_all_plans`, `adapt_plan` | HIGH | NOT STARTED |
| `post_views` | Analytics | Yes (2) | No | `record_post_view`, `admin_post_stats` | LOW | NOT STARTED |
| `posts` | CMS | Yes (7) | No | `increment_views`, `admin_post_stats` | MEDIUM | NOT STARTED |
| `profiles` | Auth Link | Yes (2) | No | `handle_new_user`, `is_admin` | HIGH (Auth) | NOT STARTED |
| `progress_entries` | Legacy Log | Yes (6) | Yes (4) | `trigger_gamification...` (Retired), `sync_user_profile...` | HIGH | NOT STARTED |
| `redirects` | CMS | Yes (2) | No | None | LOW | NOT STARTED |
| `user_badges` | Gamification | Yes (1) | No | None | LOW | NOT STARTED |
| `user_profiles` | User Data | Yes (3) | Yes (1) | `save_user_profile`, `add_user_xp`, `update_user_streak`, `sync_...` | HIGH | NOT STARTED |

## 5. Complete Supabase RPC usage inventory

**16 distinct `supabase.rpc()` usages identified in application source.**

| RPC Name | Source File | Route/Component | Purpose | Auth Dep | Future DAL Replacement Req | Migration Status |
|---|---|---|---|---|---|---|
| `adapt_plan` | `lib/plans/adaptationService.js` | Backend AI Plan | Run plan adaptation | Yes | Full business logic port to TS | NOT STARTED |
| `add_user_xp` | `lib/gamification/addXP.jsx` | Utils | Add XP to profile | Yes | Arithmetic UPDATE port | NOT STARTED |
| `admin_post_stats` | `lib/posts.jsx` | CMS | Analytics rollup | Yes | Standard GROUP BY port | NOT STARTED |
| `clear_all_plans` | `lib/storage.js` | User Plan Mgt | Soft delete loop | Yes | Standard UPDATE port | NOT STARTED |
| `create_weight_goal`| `lib/goals.js` | Goal Settings | Init user goal | Yes | Standard INSERT/UPDATE port | NOT STARTED |
| `increment_views` | `app/api/view/route.js` | Analytics API | Fallback view counter | No | Standard UPDATE port | NOT STARTED |
| `record_article_feedback`| `app/api/article-feedback` | CMS | Vote handler | No | Standard INSERT/UPDATE port | NOT STARTED |
| `record_post_view`| `app/api/view/route.js` | Analytics API | Unique view tracker | No | Standard INSERT/UPDATE port | NOT STARTED |
| `save_user_profile`| `lib/storage.js` | Onboarding | Profile init | Yes | Standard INSERT/UPDATE port | NOT STARTED |
| `soft_delete_plan`| `lib/storage.js` | Plan Dashboard | Soft delete 1 item | Yes | Standard UPDATE port | NOT STARTED |
| `upsert_calculator_result`| `CalculatorEngine.jsx` | Tools | Save calculator result | Yes | Standard INSERT/UPDATE port | NOT STARTED |
| `upsert_habit_entry`| `app/api/habits/route.js` | Habit Dashboard | Save habit state | Yes | Standard INSERT/UPDATE port | NOT STARTED |
| `upsert_lifestyle_log`| `app/api/lifestyle/route.js`| Tracker | Save daily log | Yes | Standard INSERT/UPDATE port | NOT STARTED |
| `upsert_nutrition_log`| `app/api/nutrition/route.js`| Tracker | Save daily log | Yes | Standard INSERT/UPDATE port | NOT STARTED |
| `upsert_plan` | `lib/storage.js` | Plan Dashboard | Save AI Plan | Yes | Standard INSERT/UPDATE port | NOT STARTED |
| `upsert_progress_entry`| `app/(dashboard)/start`| Onboarding (Bug)| Save weight (Buggy) | Yes | Fix buggy codebase ref | NOT STARTED |

## 6. Supabase Auth inventory

**Auth footprint across the codebase.**

*   `supabase.auth.getUser()`: Widely used across Server Components (`app/(dashboard)/layout.js`, `app/(admin)/admin/layout.js`), API Routes (`app/api/nutrition/route.js`, `app/api/notifications/route.js`), and Server Actions (`lib/storage.js`).
*   `supabase.auth.signInWithOtp()`: Used in `app/(auth)/login/page.js` (Browser/Server Action).
*   `supabase.auth.signInWithOAuth()`: Used in `login/page.js` and `signup/page.js` (Browser/Server Action).
*   `supabase.auth.exchangeCodeForSession()`: Used in `app/(auth)/auth/callback/route.js` (Callback API).
*   `supabase.auth.signOut()`: Used in `lib/actions/logout.jsx` (Server Action).

**Classification**: High density usage across Server Components, Server Actions, and API boundaries. A D1 migration requires fully transitioning this to a D1-compatible provider (like Better Auth) because `supabase.auth` requires a direct connection to PostgreSQL's `auth.users` schema.

## 7. Storage/R2 inventory

**Storage solutions utilized.**

*   **Supabase Storage**: No usage found.
*   **Cloudflare R2**: Actively used for image/media uploads. Discovered in:
    *   `scripts/upload-r2.js`
    *   `lib/r2/upload.js`
    *   `lib/utils/imageUrl.js` (constructs URLs using `NEXT_PUBLIC_R2_URL`).
*   **API**: Uses standard S3 compatible parameters (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`).

**Status**: R2 is already cleanly integrated. No migration of objects is required.

## 8. Environment variable inventory

| Variable | Purpose | Runtime | Supabase/Cloudflare/Other | Secret? | Worker compatibility |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Connect to DB | Client/Server | Supabase | No | EDGE-COMPATIBLE |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Connect to DB | Client/Server | Supabase | No | EDGE-COMPATIBLE |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin DB bypass | Server | Supabase | Yes | EDGE-COMPATIBLE |
| `R2_ENDPOINT` | R2 API URL | Server | Cloudflare | No | EDGE-COMPATIBLE |
| `R2_ACCESS_KEY_ID` | R2 Auth | Server | Cloudflare | Yes | EDGE-COMPATIBLE |
| `R2_SECRET_ACCESS_KEY` | R2 Auth | Server | Cloudflare | Yes | EDGE-COMPATIBLE |
| `R2_BUCKET` | R2 Bucket Name | Server | Cloudflare | No | EDGE-COMPATIBLE |
| `NEXT_PUBLIC_R2_URL` | CDN Base URL | Client/Server | Cloudflare | No | EDGE-COMPATIBLE |
| `OPENROUTER_API_KEY` | AI Provider Auth | Server | Other (AI) | Yes | EDGE-COMPATIBLE |
| `TURNSTILE_SECRET_KEY` | CF Turnstile Auth | Server | Cloudflare | Yes | EDGE-COMPATIBLE |
| `CRON_SECRET` | Auth for chron jobs | Server | System | Yes | EDGE-COMPATIBLE |
| `SMTP_HOST` (etc) | Email SMTP | Server | Other | Yes | EDGE-COMPATIBLE |
| `VIEW_HASH_SECRET` | Analytics Hashing | Server | System | Yes | EDGE-COMPATIBLE |

## 9. Worker compatibility inventory

**Node.js APIs Usage:**
*   `crypto`: Used in `app/api/view/route.js` and `app/api/article-feedback/route.js` for hashing (`crypto.createHash('sha256')`).
    *   **Status**: EDGE-COMPATIBLE (Cloudflare Workers support `node:crypto`).
*   `fs` / `path`: Used only in tests (`lib/plans/adaptationService.test.js`). Not used in production runtime.
    *   **Status**: WORKER-COMPATIBLE (Not in bundle).
*   `@supabase/supabase-js`: Fully compatible with edge environments via `fetch`.
*   `better-auth` (Discovered in `.env.better-auth.example` and `better-auth-dev.sqlite`): Seems to be an experimental/WIP implementation.

**Classification**: The application codebase has ZERO blockers for running in a Cloudflare Worker/Pages environment natively.

## 10. Data-access coupling map

**Current Architecture (High Coupling):**
UI (Client/Server) 
  → API / Server Action 
  → `@supabase/supabase-js` (implicit auth via RLS)
  → Supabase PostgREST
  → PostgreSQL RPC (`adapt_plan()`) OR direct table operations
  → PostgreSQL Triggers (`sync_user_profile_weight`)

**Future Architecture (D1 Target):**
UI (Client/Server)
  → API / Server Action
  → Domain Service (Extracts logic from Triggers/RPCs)
  → Data Access Layer / Repository (Explicitly checks Auth/UserId)
  → D1 Database Adapter
  → Cloudflare D1 (SQLite)

## 11. Migration blocker matrix

| Blocker | Evidence | Affected Area | Severity | Prerequisite | Status |
|---|---|---|---|---|---|
| PostgreSQL RLS | 57 active `pg_policies` | Security / Auth | BLOCKER | Build explicit DAL | AUDITING |
| PostgreSQL RPCs | 22 routines, 16 app call-sites | Business Logic | BLOCKER | Rewrite to TS Domain Services | AUDITING |
| PostgreSQL Triggers | 8 active triggers | Data Integrity | BLOCKER | Rewrite to TS Service Hooks | AUDITING |
| Supabase Auth Coupling | Widespread `supabase.auth` usage | Authentication | BLOCKER | Migrate to D1-compatible Auth | AUDITING |
| Schema Dialect | UUID, JSONB, TIMESTAMPTZ columns | Data Types | MEDIUM | D1 Schema conversion | AUDITING |
| App-Side Schema Drift | `upsert_progress_entry` called in app, deleted in DB | Data Integrity | LOW | Fix orphaned application code | AUDITING |
| Phase 2B Legacy Retirement | Legacy tracking tables have PostgreSQL triggers blocking D1 | Architectural | BLOCKER | Phase 2B Gate 7 (Retire legacy tables) | AUDITING |

**Architectural Dependency / Risk:**
Phase 2B Unified Tracking Engine is a prerequisite for the eventual Cloudflare/D1 migration of the tracking domain because the current legacy tracking tables contain PostgreSQL triggers/business logic that are blockers for D1. Phase 2B Gate 7 is intended to retire those legacy tracking tables after successful migration to `metric_entries`.

## 12. Final CF-0 conclusion

### CF-0 Status

VERIFIED

## Safety confirmation

- Production mutations: 0
- Application code modifications: 0
- Schema/data modifications: 0
- Dependency changes: 0
- Deployment commands: 0
- Git commits: 0

# Phase 1B — Identity & Profile Dependency Audit

## 1. Table Ownership Map (Verified from Migrations & Code)

### `auth.users`
- **Purpose:** Core identity provider (Go-True). Stores email, password hashes, and provider metadata.
- **Primary Key:** `id` (uuid)
- **Foreign Keys:** None.
- **RLS:** N/A (Handled securely by Supabase internal auth architecture).
- **Server/Client:** Interacted with via `supabase.auth` APIs on client, and via Admin endpoints on server.
- **Classification:** Pure Identity.

### `profiles`
- **Purpose:** Authorization and Role-Based Access Control (RBAC). 
- **Primary Key:** `id` (uuid)
- **Foreign Keys:** `id` references `auth.users(id) ON DELETE CASCADE`.
- **Important Columns:** `role` (default 'user').
- **RLS:** `id = auth.uid() OR is_admin()`
- **Dependencies:** `app/api/admin/upload/route.js`, `app/(admin)/admin/layout.js`, `app/(auth)/auth/callback/route.js`.
- **Classification:** Authorization.

### `user_profiles`
- **Purpose:** Fitness domain state, user onboarding preferences, and gamification state.
- **Primary Key:** `user_id` (uuid)
- **Foreign Keys:** **NONE** in migration history.
- **Important Columns:** `goal`, `target_weight`, `weight`, `height`, `age`, `diet_type`, `level`, `xp`, `gamification_level`.
- **RLS:** `user_id = auth.uid()`
- **RPCs:** `save_user_profile`
- **Dependencies:** Extensively across `app/(dashboard)`, `lib/plans/`, `lib/gamification/`, `lib/streak/`, `lib/dashboard/`.
- **Classification:** Fitness Domain & Gamification.

### `progress_entries`
- **Purpose:** Time-series history of user weigh-ins and body metrics.
- **Primary Key:** `id` (uuid)
- **Foreign Keys:** **NONE** in migration history.
- **Important Columns:** `user_id`, `weight`, `entry_date`.
- **RLS:** `user_id = auth.uid()`
- **RPCs:** `upsert_progress_entry`
- **Dependencies:** `lib/dashboard/getWeightData.jsx`, `lib/analytics/progress.js`, `lib/repositories/ProgressRepository.js`.
- **Classification:** Domain History.

## 2. Application Dependency Analysis
Search of the codebase verified that `profiles` is strictly used for determining `role === 'admin'` boundaries. `user_profiles` is used strictly for fetching/saving fitness onboarding data and gamification. 

There is **zero overlap** in application logic between these two tables. They serve entirely distinct bounding contexts within the application. 

## 3. Lifecycle Trace
1. **Signup:** `supabase.auth.signUp()` creates row in `auth.users`.
2. **Authorization:** No trigger exists. The `profiles` table is essentially empty for normal users. The OAuth/Login callback (`auth/callback/route.js`) handles absence of `profile` gracefully by defaulting to routing normal users to `/dashboard`.
3. **Onboarding:** User fills onboarding, firing `save_user_profile` RPC, which upserts to `user_profiles`.
4. **Deletion:** If an `auth.users` row is deleted, `profiles` is cascaded, but `user_profiles` and `progress_entries` are **orphaned** because they lack foreign keys.

## 4. Unification Analysis

- **Option 1: Keep Separated (RECOMMENDED).** `profiles` remains an Authorization table, `user_profiles` remains a Domain table.
  - *Advantage:* Zero application code impact. Maintains domain boundaries. Highly compatible with future Cloudflare D1/Better Auth migration (where Auth moves out, but Domain stays).
  - *Disadvantage:* Requires fixing missing foreign keys.
- **Option 2: Merge into one profile table.**
  - *Disadvantage:* High application impact. Mixes RBAC (`role`) with Domain data (`weight`), which violates clean architecture and complicates the future separation of Auth (Better Auth) from App Data.
- **Option 3: Create unified `users` table.**
  - *Disadvantage:* Massive migration risk and codebase rewrite. Not worth it right before a major Cloudflare migration.

## 5. Column Classification
- **Identity:** `profiles.id`, `user_profiles.user_id`
- **Authorization:** `profiles.role`
- **Fitness Domain:** `user_profiles.goal`, `target_weight`, `weight`, `height`, `age`, `diet_type`, `level`, `gender`, `unit_system`
- **Gamification:** `user_profiles.xp`, `gamification_level`, `last_weight_log_xp_date`
- **Notification:** `user_profiles.reminder_enabled`, `reminder_time`

*Finding: There are no duplicate semantic fields between `profiles` and `user_profiles`. They should remain separate.*

## 6. Migration / Backfill Analysis
Because we recommend **Option 1 (Keep Separated)**, no data migration, backfilling, or column-shifting is required. The only required DB change is enforcing referential integrity.

## 7. Referential-Integrity Design
The most dangerous flaw discovered is the lack of FKs on `user_profiles` and `progress_entries`. 

**Required Fix:**
1. Clean up (delete) any orphaned rows in `user_profiles` and `progress_entries` that do not match an existing `auth.users(id)`.
2. Apply `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` to both tables.

This ensures data sanitization on user deletion without touching application code. Rollback is as simple as dropping the constraints.

## 8. Auth User Creation Strategy
Current architecture uses **Application-layer profile creation** (`save_user_profile` during onboarding). 
- *Should we add a database trigger?* **NO.**
- *Reason:* The future Better Auth migration relies entirely on application-layer user creation. Implementing a Supabase trigger now would introduce a heavy coupling to Supabase PostgreSQL just before we migrate to SQLite/D1, creating unnecessary friction.

## 9. Rollback Plan
If the referential integrity migration fails, we simply drop the applied `FOREIGN KEY` constraints. Since no app code changes, application availability is entirely decoupled from this risk.

## 10. Final Architecture Recommendation
1. **Should tables be merged?** NO. Keep Auth/RBAC (`profiles`) separate from Domain (`user_profiles`).
2. **Should `user_profiles` and `progress_entries` receive FKs?** YES. This is critical for data integrity.
3. **Should profile creation use a trigger?** NO. Keep application-level upserts.
4. **What is the minimum safe Phase 1B change?** Add the two missing `ON DELETE CASCADE` foreign keys.
5. **What exact files need modification?** A single new migration file in `supabase/migrations/`.
6. **What is the safest implementation order?**
   - Write a migration to delete orphans.
   - Write a migration to enforce the foreign keys.
   - Apply.

## PHASE 1B IMPLEMENTATION VERDICT:
**GO**

The architecture is fully understood. The fix is isolated, does not require application code changes, and perfectly preserves compatibility for the future Cloudflare/Better Auth migration.

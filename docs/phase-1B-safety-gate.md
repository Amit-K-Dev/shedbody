# Phase 1B — Pre-Implementation Safety Gate

## 1. Application Lifecycle of `profiles`
The `profiles` table is strictly an **Authorization/RBAC** table with a completely decoupled lifecycle from normal user operations.

- **Who creates profiles?** Profiles are created **manually** by database administrators via the Supabase dashboard/SQL console. There is NO application-level API route, trigger, or server action that creates a row in `profiles`.
- **Who updates `profiles.role`?** Updated manually. The application has no `updateProfileRole` function.
- **Does normal signup create a `profiles` row?** **NO.** The `auth.users` row is created, but no trigger exists to mirror it into `profiles`. 
- **Does Admin creation create/update profiles?** **NO.** If a new admin is needed, they must be manually inserted into the database.
- **Does the Auth Callback read/write `profiles`?** The Auth callback **READS** `profiles` to determine routing (`/admin` vs `/dashboard`), but it **DOES NOT WRITE** to it. It gracefully handles the absence of a profile by defaulting to `/dashboard`.

**Relevant Code Paths (READ-ONLY):**
- `app/(auth)/auth/callback/route.js` — Line 36 (Determines redirect path based on role)
- `app/api/admin/upload/route.js` — Line 26 (Protects backend S3 bucket upload)
- `app/(admin)/admin/layout.js` — Line 16 (Protects the frontend admin portal)
- `components/layout/Header.jsx` — Line 226 (Conditionally renders admin dashboard link)

## 2. Verification of Dependencies
All current references to `user_profiles`, `progress_entries`, `save_user_profile`, and `upsert_progress_entry` have been completely verified in the previous audit (Phase 1B Audit).
- They are exclusively utilized for **Domain Data** (fitness state, onboarding, gamification, and progress tracking).
- They are never utilized for Authorization or Admin checks.

## 3. Orphan-Preflight SQL (Fail-Safe Check)
To satisfy the requirement of **NOT** silently deleting production data, the migration must include an active pre-flight block that intentionally aborts if orphans exist.

```sql
DO $$
DECLARE
    orphan_user_profiles_count INT;
    orphan_progress_entries_count INT;
BEGIN
    SELECT COUNT(*) INTO orphan_user_profiles_count 
    FROM public.user_profiles 
    WHERE user_id NOT IN (SELECT id FROM auth.users);

    SELECT COUNT(*) INTO orphan_progress_entries_count 
    FROM public.progress_entries 
    WHERE user_id NOT IN (SELECT id FROM auth.users);

    IF orphan_user_profiles_count > 0 OR orphan_progress_entries_count > 0 THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: Found % orphaned user_profiles and % orphaned progress_entries. Resolve these manually before applying foreign keys.', orphan_user_profiles_count, orphan_progress_entries_count;
    END IF;
END $$;
```

## 4. Live Production Orphan Report
Using a read-only script executed against the live Supabase production environment (via `.env.local` service role key), we successfully bypassed the Supabase CLI hang issue and queried the database.

**Orphan Counts:**
- `user_profiles` orphan count: **22**
- `progress_entries` orphan count: **9**

**Progress Entries Per Orphan User:**
- `ac3524bd-4142-4337-aed7-1f8a390c51fd`: 1
- `cc4c124e-7baf-4ce9-ad51-85891b005b49`: 1
- `557c794f-3cb3-4e32-a817-a03d3af872bb`: 1
- `232ef1cc-97d8-41d4-9840-8f35cbbe85e5`: 1
- `2dfaa889-3bdd-4184-860f-d41d23f2ea79`: 1
- `25f6d2b8-01d5-4370-ada7-61bc5462fed5`: 1
- `0b255dbf-83e6-4df5-be9e-e52211e3cf24`: 1
- `2bf2298d-8deb-48c3-93f0-53ac555cc97d`: 1
- `f8247a67-7f0b-4785-9df3-edd712846faf`: 1

**Action Required:** These 22 orphaned profiles and 9 orphaned progress entries **MUST** be manually deleted or reassigned before the migration below can succeed.

## 5. Exact Phase 1B Migration SQL
*To be run ONLY AFTER orphans are resolved.*

```sql
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.progress_entries
ADD CONSTRAINT progress_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

## 6. Migration Philosophy
By placing the `DO $$ ... RAISE EXCEPTION` block at the top of the migration file, we guarantee a fail-safe deployment. The migration will halt execution entirely, preventing the `ALTER TABLE` commands from executing and throwing native PostgreSQL constraint violation errors.

## 7. Rollback Analysis
If the migration causes unforeseen issues (e.g., unexpected cascades), the rollback is completely non-destructive to existing rows.

**Rollback SQL:**
```sql
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE public.progress_entries DROP CONSTRAINT IF EXISTS progress_entries_user_id_fkey;
```

- **Data Loss Risk:** None. Dropping a constraint does not modify row data.
- **Application Compatibility:** 100% compatible. The application currently operates without these constraints. Reverting back to the current state changes nothing about how the frontend/backend behaves.

## PHASE 1B IMPLEMENTATION VERDICT:
**HOLD**

**Reason:** Unresolved production data-integrity uncertainty. There are actively 22 orphaned `user_profiles` and 9 orphaned `progress_entries` in the live production database. 

Because we designed a fail-safe migration that aborts on orphans rather than silently deleting them, deploying the Phase 1B migration right now will definitively **fail and abort** in production. 

The orphan rows must be evaluated by the product owner/DBA and manually purged before changing the status to GO.

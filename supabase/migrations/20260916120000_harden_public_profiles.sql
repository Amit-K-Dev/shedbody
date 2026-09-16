-- Harden public.profiles table privileges and RLS policies
-- Removes public access, restricts authenticated column UPDATE, consolidates RLS policies

BEGIN;

-- ============================================
-- 1. DROP OBSOLETE RLS POLICIES
-- ============================================
-- Drop the public SELECT policy (allows anon to read all profiles)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Drop the legacy UPDATE policy without admin bypass
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- ============================================
-- 2. CONSOLIDATE TO CLEAN AUTHENTICATED POLICIES
-- ============================================
-- The following policies already exist and are correct:
-- "Users read own profile" - SELECT for authenticated with admin bypass
-- "Users update own profile" - UPDATE for authenticated with admin bypass
-- No action needed for these.

-- ============================================
-- 3. REVOKE ALL COLUMN PRIVILEGES FROM anon
-- ============================================
REVOKE ALL ON public.profiles FROM anon;

-- ============================================
-- 4. REVOKE ALL COLUMN PRIVILEGES FROM authenticated
-- ============================================
REVOKE ALL ON public.profiles FROM authenticated;

-- ============================================
-- 5. GRANT authenticated SELECT ON ALL COLUMNS
-- ============================================
-- Application reads: role (auth callback, admin layout), avatar_url (Header)
GRANT SELECT (id, full_name, avatar_url, role) ON public.profiles TO authenticated;

-- ============================================
-- 6. GRANT authenticated UPDATE ONLY ON USER-CONTROLLED COLUMNS
-- ============================================
-- full_name and avatar_url may be updated by the user in the future
-- role MUST NOT be updatable by users (prevents self-promotion to admin)
-- id MUST NOT be updatable (PK, FK to auth.users)
GRANT UPDATE (full_name, avatar_url) ON public.profiles TO authenticated;

-- ============================================
-- 7. ENSURE auth trigger can still create profiles
-- ============================================
-- handle_new_user() runs as SECURITY DEFINER (owner: postgres)
-- It needs INSERT on profiles table. Since it runs as postgres,
-- it has full privileges and is NOT affected by role grants.
-- No action needed - the trigger will continue to work.

COMMIT;
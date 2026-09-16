-- Harden user_profiles table privileges and RLS policies
-- Removes anon access, restricts authenticated column INSERT/UPDATE, consolidates RLS policies

BEGIN;

-- ============================================
-- 1. REVOKE ALL anon PRIVILEGES ON user_profiles
-- ============================================
REVOKE ALL ON TABLE public.user_profiles FROM anon;

-- ============================================
-- 2. REVOKE BROAD authenticated PRIVILEGES
-- ============================================
REVOKE INSERT ON TABLE public.user_profiles FROM authenticated;
REVOKE UPDATE ON TABLE public.user_profiles FROM authenticated;
REVOKE DELETE ON TABLE public.user_profiles FROM authenticated;
REVOKE TRUNCATE ON TABLE public.user_profiles FROM authenticated;
REVOKE REFERENCES ON TABLE public.user_profiles FROM authenticated;
REVOKE TRIGGER ON TABLE public.user_profiles FROM authenticated;

-- ============================================
-- 3. GRANT authenticated INSERT ONLY ON REQUIRED COLUMNS
-- ============================================
-- Onboarding (saveUserProfile upsert) requires these columns for INSERT:
-- user_id (always), goal, target_weight, weight, height, age, diet_type, level, gender, unit_system
-- reminder_enabled and reminder_time are NOT in the onboarding upsert payload; they are updated separately via UPDATE
GRANT INSERT (
    user_id,
    goal,
    target_weight,
    weight,
    height,
    age,
    diet_type,
    level,
    gender,
    unit_system
) ON TABLE public.user_profiles TO authenticated;

-- ============================================
-- 4. GRANT authenticated UPDATE ONLY ON USER-CONTROLLED COLUMNS
-- ============================================
-- Includes reminder_enabled and reminder_time (updated via ReminderSettings direct UPDATE)
GRANT UPDATE (
    goal,
    target_weight,
    weight,
    height,
    age,
    diet_type,
    level,
    gender,
    unit_system,
    reminder_enabled,
    reminder_time
) ON TABLE public.user_profiles TO authenticated;

-- ============================================
-- 5. CONSOLIDATE RLS POLICIES
-- ============================================

-- Drop all existing user_profiles policies (6 policies)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users read own user profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users update own user profile" ON public.user_profiles;

-- Create clean SELECT policy (authenticated + admin bypass)
CREATE POLICY "user_profiles_select_own"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Create clean INSERT policy (own row only)
CREATE POLICY "user_profiles_insert_own"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create clean UPDATE policy (own row + admin bypass)
-- Column-level UPDATE is controlled by GRANT above, not RLS
CREATE POLICY "user_profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ============================================
-- 6. REVOKE anon EXECUTE ON GAMIFICATION FUNCTIONS
-- ============================================
REVOKE EXECUTE ON FUNCTION public.add_user_xp(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_user_streak(uuid) FROM anon;

-- Keep authenticated and service_role EXECUTE (required by application)

COMMIT;
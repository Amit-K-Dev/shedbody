-- Fix post-migration security gaps:
-- 1. Remove obsolete broad RLS policy "User can manage their profile"
-- 2. Remove default PUBLIC EXECUTE on gamification functions (anon still had access via PUBLIC)

BEGIN;

-- 1. Remove the obsolete broad RLS policy
DROP POLICY IF EXISTS "User can manage their profile"
ON public.user_profiles;

-- 2. Remove default PUBLIC execution privileges
REVOKE EXECUTE ON FUNCTION public.add_user_xp(uuid, integer)
FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.update_user_streak(uuid)
FROM PUBLIC;

-- 3. Explicitly preserve required application access
GRANT EXECUTE ON FUNCTION public.add_user_xp(uuid, integer)
TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.update_user_streak(uuid)
TO authenticated, service_role;

COMMIT;
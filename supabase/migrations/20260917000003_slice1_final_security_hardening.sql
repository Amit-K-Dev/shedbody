-- 1. Complete table lock-down: revoke all direct writes and extended privileges from public/client roles
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLE public.progress_entries FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLE public.progress_entries FROM authenticated;

-- 2. Secure the trigger function against direct execution
-- Trigger functions are executed by the DB engine and do not require user EXECUTE privileges.
REVOKE EXECUTE ON FUNCTION public.sync_user_profile_weight() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_user_profile_weight() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_user_profile_weight() FROM authenticated;

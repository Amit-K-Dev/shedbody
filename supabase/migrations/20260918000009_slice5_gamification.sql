-- 1. Add last_weight_log_xp_date for idempotency
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_weight_log_xp_date date DEFAULT NULL;

-- 2. Create the Best-Effort Gamification Trigger Function
CREATE OR REPLACE FUNCTION public.trigger_gamification_on_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Atomic XP guard: guarantee max one execution per calendar date
    UPDATE public.user_profiles
    SET last_weight_log_xp_date = current_date
    WHERE user_id = NEW.user_id
      AND (
        last_weight_log_xp_date IS NULL
        OR last_weight_log_xp_date < current_date
      );

    IF FOUND THEN
        BEGIN
            -- Execute gamification
            PERFORM public.add_user_xp(NEW.user_id, 10);
            PERFORM public.update_user_streak(NEW.user_id);
        EXCEPTION WHEN OTHERS THEN
            -- Best-effort isolation: do not roll back progress_entries
            RAISE WARNING 'Gamification failed for user %: %', NEW.user_id, SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$;

-- 3. Revoke direct client execution
REVOKE EXECUTE ON FUNCTION public.trigger_gamification_on_progress() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_gamification_on_progress() FROM anon;
REVOKE EXECUTE ON FUNCTION public.trigger_gamification_on_progress() FROM authenticated;

-- 4. Attach the trigger to progress_entries
DROP TRIGGER IF EXISTS on_progress_entries_inserted_gamification ON public.progress_entries;
CREATE TRIGGER on_progress_entries_inserted_gamification
    AFTER INSERT ON public.progress_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_gamification_on_progress();

-- 5. Harden internal gamification functions
REVOKE EXECUTE ON FUNCTION public.add_user_xp(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_streak(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.add_user_xp(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_user_streak(uuid) TO service_role;

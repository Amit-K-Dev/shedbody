-- 1. Upsert RPC
CREATE OR REPLACE FUNCTION public.upsert_progress_entry(
    p_weight double precision,
    p_entry_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := (SELECT auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.progress_entries (user_id, weight, entry_date, updated_at)
    VALUES (v_user_id, p_weight, p_entry_date, now())
    ON CONFLICT (user_id, entry_date) WHERE deleted_at IS NULL
    DO UPDATE SET 
        weight = EXCLUDED.weight,
        updated_at = now();
END;
$$;

-- Secure the RPC EXECUTE privileges
REVOKE EXECUTE ON FUNCTION public.upsert_progress_entry(double precision, date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upsert_progress_entry(double precision, date) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_progress_entry(double precision, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_progress_entry(double precision, date) TO service_role;

-- 2. Cache Synchronization Trigger Function
CREATE OR REPLACE FUNCTION public.sync_user_profile_weight()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_latest_weight double precision;
BEGIN
    -- Handle OLD user on UPDATE (if user_id changed) or DELETE
    IF (TG_OP = 'DELETE') OR (TG_OP = 'UPDATE' AND OLD.user_id IS DISTINCT FROM NEW.user_id) THEN
        SELECT weight INTO v_latest_weight
        FROM public.progress_entries
        WHERE user_id = OLD.user_id AND deleted_at IS NULL
        ORDER BY entry_date DESC LIMIT 1;

        UPDATE public.user_profiles
        SET weight = v_latest_weight
        WHERE user_id = OLD.user_id;
    END IF;

    -- Handle NEW user on INSERT or UPDATE
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE') THEN
        SELECT weight INTO v_latest_weight
        FROM public.progress_entries
        WHERE user_id = NEW.user_id AND deleted_at IS NULL
        ORDER BY entry_date DESC LIMIT 1;

        UPDATE public.user_profiles
        SET weight = v_latest_weight
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NULL;
END;
$$;

-- 3. Attach Trigger
DROP TRIGGER IF EXISTS on_progress_entries_changed ON public.progress_entries;
CREATE TRIGGER on_progress_entries_changed
    AFTER INSERT OR UPDATE OR DELETE ON public.progress_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_profile_weight();

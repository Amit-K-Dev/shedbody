-- 1. Create the overloaded 4-argument signature first (with defaults)
CREATE OR REPLACE FUNCTION public.upsert_progress_entry(
    p_weight double precision,
    p_entry_date date,
    p_body_fat numeric DEFAULT NULL,
    p_notes text DEFAULT NULL
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

    -- Standard ON CONFLICT behavior matching Slice 1 exactly
    INSERT INTO public.progress_entries (user_id, weight, body_fat, notes, entry_date, updated_at)
    VALUES (v_user_id, p_weight, p_body_fat, p_notes, p_entry_date, now())
    ON CONFLICT (user_id, entry_date) WHERE deleted_at IS NULL
    DO UPDATE SET 
        weight = EXCLUDED.weight,
        body_fat = EXCLUDED.body_fat,
        notes = EXCLUDED.notes,
        updated_at = now();
END;
$$;

-- 2. Drop the original 2-argument signature to prevent ambiguous overload calls
DROP FUNCTION IF EXISTS public.upsert_progress_entry(double precision, date);

-- 3. Enforce precise privileges matching Slice 1
REVOKE EXECUTE ON FUNCTION public.upsert_progress_entry(double precision, date, numeric, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upsert_progress_entry(double precision, date, numeric, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_progress_entry(double precision, date, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_progress_entry(double precision, date, numeric, text) TO service_role;

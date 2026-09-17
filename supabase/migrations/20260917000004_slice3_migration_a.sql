-- Migration A: Create Slice 3 RPCs for Plans and Calculator Results

SET search_path = '';

-- 1. upsert_plan
CREATE OR REPLACE FUNCTION public.upsert_plan(
    p_goal text,
    p_diet_type text,
    p_level text,
    p_calories numeric,
    p_protein numeric,
    p_workout jsonb DEFAULT NULL,
    p_meals jsonb DEFAULT NULL
)
RETURNS public.plans
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_lock_key integer;
    v_inserted public.plans;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Generate a 32-bit integer lock key derived from user_id
    v_lock_key := hashtext(v_user_id::text);
    
    -- Acquire transaction-level advisory lock
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- Deactivate any currently active plans for this user
    UPDATE public.plans
    SET is_active = false,
        updated_at = now()
    WHERE user_id = v_user_id
      AND is_active = true
      AND deleted_at IS NULL;

    -- Insert the new active plan
    INSERT INTO public.plans (
        user_id,
        goal,
        diet_type,
        level,
        calories,
        protein,
        workout,
        meals,
        is_active
    ) VALUES (
        v_user_id,
        p_goal,
        p_diet_type,
        p_level,
        p_calories,
        p_protein,
        p_workout,
        p_meals,
        true
    )
    RETURNING * INTO v_inserted;

    RETURN v_inserted;
END;
$$;

-- 2. soft_delete_plan
CREATE OR REPLACE FUNCTION public.soft_delete_plan(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_lock_key integer;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_lock_key := hashtext(v_user_id::text);
    PERFORM pg_advisory_xact_lock(v_lock_key);

    UPDATE public.plans
    SET deleted_at = now(),
        is_active = false,
        updated_at = now()
    WHERE id = p_id
      AND user_id = v_user_id
      AND is_active = false
      AND deleted_at IS NULL;
END;
$$;

-- 3. clear_all_plans
CREATE OR REPLACE FUNCTION public.clear_all_plans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_lock_key integer;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_lock_key := hashtext(v_user_id::text);
    PERFORM pg_advisory_xact_lock(v_lock_key);

    UPDATE public.plans
    SET deleted_at = now(),
        is_active = false,
        updated_at = now()
    WHERE user_id = v_user_id
      AND deleted_at IS NULL;
END;
$$;

-- 4. upsert_calculator_result
CREATE OR REPLACE FUNCTION public.upsert_calculator_result(
    p_calculator_id uuid,
    p_input_data jsonb,
    p_result_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_lock_key integer;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    v_lock_key := hashtext(v_user_id::text);
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- Deactivate the latest result for this user and this calculator
    UPDATE public.calculator_results
    SET is_latest = false,
        updated_at = now()
    WHERE user_id = v_user_id
      AND calculator_id = p_calculator_id
      AND is_latest = true
      AND deleted_at IS NULL;

    -- Insert the new result as latest
    INSERT INTO public.calculator_results (
        user_id,
        calculator_id,
        input_data,
        result_data,
        is_latest
    ) VALUES (
        v_user_id,
        p_calculator_id,
        p_input_data,
        p_result_data,
        true
    );
END;
$$;

-- Revoke execute from PUBLIC and grant explicitly
REVOKE EXECUTE ON FUNCTION public.upsert_plan FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.soft_delete_plan FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.clear_all_plans FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upsert_calculator_result FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.upsert_plan TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.soft_delete_plan TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.clear_all_plans TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.upsert_calculator_result TO authenticated, service_role;

-- Migration: Update create_weight_goal to use vw_metric_entries_latest

CREATE OR REPLACE FUNCTION public.create_weight_goal(p_target_value numeric)
RETURNS public.goals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_existing_goal public.goals;
    v_new_goal public.goals;
    v_start_value numeric;
    v_lock_key bigint;
BEGIN
    -- Authorization: must be authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    -- Validation: target_value must be valid and positive
    IF p_target_value IS NULL OR p_target_value <= 0 THEN
        RAISE EXCEPTION 'target_value must be greater than 0';
    END IF;

    -- Advisory lock to prevent race conditions (hash user_id to bigint)
    -- We'll use a domain-specific offset for weight (e.g., 1)
    v_lock_key := hashtextextended(v_user_id::text, 1);
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- Check for existing active goal
    SELECT * INTO v_existing_goal
    FROM public.goals
    WHERE user_id = v_user_id AND domain = 'weight' AND status = 'active';

    IF FOUND THEN
        -- Same-Target Idempotency
        IF v_existing_goal.target_value = p_target_value THEN
            -- Update compatibility cache even on idempotent request
            INSERT INTO public.user_profiles (user_id, target_weight)
            VALUES (v_user_id, p_target_value)
            ON CONFLICT ON CONSTRAINT user_profiles_pkey DO UPDATE 
            SET target_weight = EXCLUDED.target_weight;
            
            RETURN v_existing_goal;
        END IF;

        -- Different Target: Abandon existing
        UPDATE public.goals
        SET status = 'abandoned', updated_at = now()
        WHERE id = v_existing_goal.id;
    END IF;

    -- Derive start_value
    -- Priority 1: Most recent non-deleted weight from vw_metric_entries_latest
    SELECT value_numeric INTO v_start_value
    FROM public.vw_metric_entries_latest
    WHERE user_id = v_user_id 
      AND metric_id = 'weight' 
      AND deleted_at IS NULL
    ORDER BY log_date DESC
    LIMIT 1;

    -- Priority 2: user_profiles.weight
    IF v_start_value IS NULL THEN
        SELECT weight INTO v_start_value
        FROM public.user_profiles
        WHERE user_id = v_user_id;
    END IF;

    -- Create new goal
    INSERT INTO public.goals (
        user_id,
        domain,
        start_value,
        target_value,
        start_date,
        target_date,
        status
    ) VALUES (
        v_user_id,
        'weight',
        v_start_value,
        p_target_value,
        CURRENT_DATE,
        NULL,
        'active'
    ) RETURNING * INTO v_new_goal;

    -- Synchronize compatibility cache
    INSERT INTO public.user_profiles (user_id, target_weight)
    VALUES (v_user_id, p_target_value)
    ON CONFLICT ON CONSTRAINT user_profiles_pkey DO UPDATE 
    SET target_weight = EXCLUDED.target_weight;

    RETURN v_new_goal;
END;
$$;

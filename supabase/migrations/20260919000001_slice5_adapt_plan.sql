-- Migration: B2-T Adapt Plan RPC & Provenance update

BEGIN;

-- 1. Update upsert_plan to support provenance
DROP FUNCTION IF EXISTS public.upsert_plan(text, text, text, numeric, numeric, jsonb, jsonb);

CREATE OR REPLACE FUNCTION public.upsert_plan(
    p_goal text,
    p_diet_type text,
    p_level text,
    p_calories numeric,
    p_protein numeric,
    p_workout jsonb DEFAULT NULL,
    p_meals jsonb DEFAULT NULL,
    p_provenance text DEFAULT 'manual'
)
RETURNS public.plans
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

    v_lock_key := hashtext(v_user_id::text);
    PERFORM pg_advisory_xact_lock(v_lock_key);

    UPDATE public.plans
    SET is_active = false,
        updated_at = now()
    WHERE user_id = v_user_id
      AND is_active = true
      AND deleted_at IS NULL;

    INSERT INTO public.plans (
        user_id,
        goal,
        diet_type,
        level,
        calories,
        protein,
        workout,
        meals,
        is_active,
        provenance
    ) VALUES (
        v_user_id,
        p_goal,
        p_diet_type,
        p_level,
        p_calories,
        p_protein,
        p_workout,
        p_meals,
        true,
        p_provenance
    )
    RETURNING * INTO v_inserted;

    RETURN v_inserted;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.upsert_plan(text, text, text, numeric, numeric, jsonb, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_plan(text, text, text, numeric, numeric, jsonb, jsonb, text) TO authenticated, service_role;


-- 2. Create adapt_plan RPC
CREATE OR REPLACE FUNCTION public.adapt_plan(
    p_goal_id uuid,
    p_evaluation_window_start date,
    p_evaluation_window_end date,
    
    -- Adaptation snapshot metrics
    p_previous_calorie_target numeric,
    p_proposed_calorie_target numeric,
    p_final_calorie_target numeric,
    p_current_weight numeric,
    p_current_tdee numeric,
    p_is_clamped boolean,
    p_explanation_snapshot jsonb,
    
    -- Plan payload
    p_plan_goal text,
    p_diet_type text,
    p_level text,
    p_calories numeric,
    p_protein numeric,
    p_workout jsonb DEFAULT NULL,
    p_meals jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_lock_key integer;
    v_existing_event public.adaptation_events;
    v_active_goal public.goals;
    v_previous_plan_id uuid;
    v_new_plan public.plans;
    v_new_event public.adaptation_events;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Use the same lock key as upsert_plan to serialize all plan mutations
    v_lock_key := hashtext(v_user_id::text);
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- 1. Idempotency Check: Same Event
    SELECT * INTO v_existing_event
    FROM public.adaptation_events
    WHERE user_id = v_user_id
      AND goal_id = p_goal_id
      AND evaluation_window_start = p_evaluation_window_start
      AND evaluation_window_end = p_evaluation_window_end;
      
    IF FOUND THEN
        -- Duplicate retry. Return existing immutable IDs.
        RETURN jsonb_build_object(
            'resulting_plan_id', v_existing_event.resulting_plan_id,
            'adaptation_event_id', v_existing_event.id,
            'is_newly_persisted', false
        );
    END IF;

    -- 2. Active Goal Revalidation (Race protection)
    SELECT * INTO v_active_goal
    FROM public.goals
    WHERE user_id = v_user_id
      AND domain = 'weight'
      AND status = 'active';

    IF v_active_goal IS NULL OR v_active_goal.id != p_goal_id THEN
        RAISE EXCEPTION 'Goal transition race: Supplied goal_id does not match currently active weight goal';
    END IF;

    -- 3. Extract the active plan to be deactivated
    SELECT id INTO v_previous_plan_id
    FROM public.plans
    WHERE user_id = v_user_id
      AND is_active = true
      AND deleted_at IS NULL;
      
    IF v_previous_plan_id IS NULL THEN
        RAISE EXCEPTION 'No active plan found to adapt from';
    END IF;

    -- 4. Deactivate old plan
    UPDATE public.plans
    SET is_active = false,
        updated_at = now()
    WHERE id = v_previous_plan_id;

    -- 5. Insert new plan
    INSERT INTO public.plans (
        user_id,
        goal,
        diet_type,
        level,
        calories,
        protein,
        workout,
        meals,
        is_active,
        provenance
    ) VALUES (
        v_user_id,
        p_plan_goal,
        p_diet_type,
        p_level,
        p_calories,
        p_protein,
        p_workout,
        p_meals,
        true,
        'adaptation'
    ) RETURNING * INTO v_new_plan;

    -- 6. Insert adaptation event
    INSERT INTO public.adaptation_events (
        user_id,
        goal_id,
        evaluation_window_start,
        evaluation_window_end,
        previous_plan_id,
        resulting_plan_id,
        previous_calorie_target,
        proposed_calorie_target,
        final_calorie_target,
        current_weight,
        current_tdee,
        is_clamped,
        explanation_snapshot
    ) VALUES (
        v_user_id,
        p_goal_id,
        p_evaluation_window_start,
        p_evaluation_window_end,
        v_previous_plan_id,
        v_new_plan.id,
        p_previous_calorie_target,
        p_proposed_calorie_target,
        p_final_calorie_target,
        p_current_weight,
        p_current_tdee,
        p_is_clamped,
        p_explanation_snapshot
    ) RETURNING * INTO v_new_event;

    -- 7. Return Result
    RETURN jsonb_build_object(
        'resulting_plan_id', v_new_plan.id,
        'adaptation_event_id', v_new_event.id,
        'is_newly_persisted', true
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.adapt_plan(
    uuid, date, date, numeric, numeric, numeric, numeric, numeric, boolean, jsonb, text, text, text, numeric, numeric, jsonb, jsonb
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adapt_plan(
    uuid, date, date, numeric, numeric, numeric, numeric, numeric, boolean, jsonb, text, text, text, numeric, numeric, jsonb, jsonb
) TO authenticated, service_role;

COMMIT;

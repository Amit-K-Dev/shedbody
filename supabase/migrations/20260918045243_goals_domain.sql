-- Phase 3 Slice 2: Goals Domain Foundation

BEGIN;

-- 1. Create goals table
CREATE TABLE public.goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain text NOT NULL,
    start_value numeric, -- Can be NULL for migrated legacy goals or if no baseline exists
    target_value numeric NOT NULL,
    start_date date NOT NULL,
    target_date date, -- Can be NULL for open-ended or migrated goals
    status text NOT NULL DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT goals_status_check CHECK (status IN ('active', 'achieved', 'abandoned')),
    CONSTRAINT goals_domain_check CHECK (domain IN ('weight')),
    CONSTRAINT goals_target_value_check CHECK (target_value > 0)
);

-- Ensure a user can only have ONE active goal per domain
CREATE UNIQUE INDEX goals_single_active_domain_idx ON public.goals(user_id, domain) WHERE status = 'active';

-- Performance and ownership indexes
CREATE INDEX goals_user_id_idx ON public.goals(user_id);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Deny all by default, except SELECT for owner
REVOKE ALL ON public.goals FROM authenticated, anon, public;
GRANT SELECT ON public.goals TO authenticated;
GRANT SELECT ON public.goals TO service_role;

CREATE POLICY "Users can view their own goals" ON public.goals
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);



-- 3. Create create_weight_goal
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
    -- Priority 1: Most recent non-deleted progress_entries with valid weight
    SELECT weight INTO v_start_value
    FROM public.progress_entries
    WHERE user_id = v_user_id AND deleted_at IS NULL AND weight IS NOT NULL
    ORDER BY entry_date DESC, created_at DESC
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

-- Secure the new RPC
REVOKE EXECUTE ON FUNCTION public.create_weight_goal(numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_weight_goal(numeric) TO authenticated, service_role;


-- 4. Idempotent Backfill
DO $$
DECLARE
    v_rec record;
    v_start_value numeric;
BEGIN
    FOR v_rec IN 
        SELECT user_id, target_weight 
        FROM public.user_profiles 
        WHERE target_weight IS NOT NULL
    LOOP
        -- Skip if active weight goal already exists
        IF EXISTS (SELECT 1 FROM public.goals WHERE user_id = v_rec.user_id AND domain = 'weight' AND status = 'active') THEN
            CONTINUE;
        END IF;

        -- Derive start_value identically to create_weight_goal
        SELECT weight INTO v_start_value
        FROM public.progress_entries
        WHERE user_id = v_rec.user_id AND deleted_at IS NULL AND weight IS NOT NULL
        ORDER BY entry_date DESC, created_at DESC
        LIMIT 1;

        IF v_start_value IS NULL THEN
            SELECT weight INTO v_start_value
            FROM public.user_profiles
            WHERE user_id = v_rec.user_id;
        END IF;

        -- Insert backfilled goal
        INSERT INTO public.goals (
            user_id,
            domain,
            start_value,
            target_value,
            start_date,
            target_date,
            status
        ) VALUES (
            v_rec.user_id,
            'weight',
            v_start_value,
            v_rec.target_weight,
            CURRENT_DATE,
            NULL,
            'active'
        );
    END LOOP;
END;
$$;

COMMIT;

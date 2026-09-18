-- Phase 3 Slice 2 Migration 1: Nutrition Tracking
--
-- Note: nutrition_logs is strictly execution history. Plans are recommendations.
-- Target snapshots preserve historical context so that plan updates do not rewrite history.
--
-- The target snapshot represents the plan target observed at log creation time. 
-- It is not a guaranteed historical reconstruction of which plan was applicable on p_log_date 
-- because the current plans schema has no validity interval.
--
-- p_log_date is a PostgreSQL DATE. It represents the user's intended local calendar date.
-- It must be explicitly supplied by the client. The database must not substitute CURRENT_DATE.
--
-- NULL means that metric was not tracked. 
-- A row where all three consumed metrics are NULL is still a valid persisted daily log.
-- Future analytics must not interpret NULL as zero.

CREATE TABLE public.nutrition_logs (
    id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
    user_id uuid NOT NULL,
    log_date date NOT NULL,
    calories_consumed numeric NULL,
    protein_consumed numeric NULL,
    water_ml numeric NULL,
    target_calories_snapshot numeric NULL,
    target_protein_snapshot numeric NULL,
    created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
    updated_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

-- Foreign Key with cascade delete
ALTER TABLE public.nutrition_logs
    ADD CONSTRAINT fk_nutrition_logs_user_id
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Unique constraint ensuring exactly one log per user per local calendar date
ALTER TABLE public.nutrition_logs
    ADD CONSTRAINT uq_nutrition_logs_user_date UNIQUE (user_id, log_date);

-- Check constraints to enforce bounds and reject negative and non-finite values
-- Explicit checks for NaN, Infinity, and -Infinity are required to prevent non-finite insertion.
ALTER TABLE public.nutrition_logs
    ADD CONSTRAINT chk_nutrition_logs_calories_bounds 
    CHECK (calories_consumed IS NULL OR (calories_consumed >= 0 AND calories_consumed <= 20000 AND calories_consumed != 'NaN'::numeric AND calories_consumed != 'Infinity'::numeric AND calories_consumed != '-Infinity'::numeric)),
    ADD CONSTRAINT chk_nutrition_logs_protein_bounds 
    CHECK (protein_consumed IS NULL OR (protein_consumed >= 0 AND protein_consumed <= 1500 AND protein_consumed != 'NaN'::numeric AND protein_consumed != 'Infinity'::numeric AND protein_consumed != '-Infinity'::numeric)),
    ADD CONSTRAINT chk_nutrition_logs_water_bounds 
    CHECK (water_ml IS NULL OR (water_ml >= 0 AND water_ml <= 20000 AND water_ml != 'NaN'::numeric AND water_ml != 'Infinity'::numeric AND water_ml != '-Infinity'::numeric)),
    ADD CONSTRAINT chk_nutrition_logs_target_calories_bounds
    CHECK (target_calories_snapshot IS NULL OR (target_calories_snapshot >= 0 AND target_calories_snapshot != 'NaN'::numeric AND target_calories_snapshot != 'Infinity'::numeric AND target_calories_snapshot != '-Infinity'::numeric)),
    ADD CONSTRAINT chk_nutrition_logs_target_protein_bounds
    CHECK (target_protein_snapshot IS NULL OR (target_protein_snapshot >= 0 AND target_protein_snapshot != 'NaN'::numeric AND target_protein_snapshot != 'Infinity'::numeric AND target_protein_snapshot != '-Infinity'::numeric));

-- Enable Row Level Security
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Select policy for authenticated users only (own rows)
CREATE POLICY "Users can view their own nutrition logs"
    ON public.nutrition_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Explicitly harden table privileges
REVOKE ALL ON TABLE public.nutrition_logs FROM PUBLIC;
REVOKE ALL ON TABLE public.nutrition_logs FROM anon;
GRANT SELECT ON TABLE public.nutrition_logs TO authenticated;
GRANT ALL ON TABLE public.nutrition_logs TO service_role;

-- Canonical RPC to securely upsert a nutrition log
CREATE OR REPLACE FUNCTION public.upsert_nutrition_log(
    p_log_date date,
    p_calories_consumed numeric,
    p_protein_consumed numeric,
    p_water_ml numeric
) RETURNS public.nutrition_logs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_target_calories numeric;
    v_target_protein numeric;
    v_result public.nutrition_logs;
BEGIN
    -- Derive user_id safely from auth.uid()
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validate input bounds to explicitly reject non-finite, negative, or overly large values
    IF p_calories_consumed IS NOT NULL AND (p_calories_consumed < 0 OR p_calories_consumed > 20000 OR p_calories_consumed = 'NaN'::numeric OR p_calories_consumed = 'Infinity'::numeric OR p_calories_consumed = '-Infinity'::numeric) THEN
        RAISE EXCEPTION 'calories_consumed is out of bounds or non-finite';
    END IF;
    IF p_protein_consumed IS NOT NULL AND (p_protein_consumed < 0 OR p_protein_consumed > 1500 OR p_protein_consumed = 'NaN'::numeric OR p_protein_consumed = 'Infinity'::numeric OR p_protein_consumed = '-Infinity'::numeric) THEN
        RAISE EXCEPTION 'protein_consumed is out of bounds or non-finite';
    END IF;
    IF p_water_ml IS NOT NULL AND (p_water_ml < 0 OR p_water_ml > 20000 OR p_water_ml = 'NaN'::numeric OR p_water_ml = 'Infinity'::numeric OR p_water_ml = '-Infinity'::numeric) THEN
        RAISE EXCEPTION 'water_ml is out of bounds or non-finite';
    END IF;

    -- Establish target snapshots from the currently active plan, if available
    -- If multiple active plans exist, order by created_at DESC to deterministically pick the most recent
    SELECT calories, protein
    INTO v_target_calories, v_target_protein
    FROM public.plans
    WHERE user_id = v_user_id
      AND is_active = true
      AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    -- Perform the atomic upsert
    INSERT INTO public.nutrition_logs (
        user_id,
        log_date,
        calories_consumed,
        protein_consumed,
        water_ml,
        target_calories_snapshot,
        target_protein_snapshot,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_log_date,
        p_calories_consumed,
        p_protein_consumed,
        p_water_ml,
        v_target_calories,
        v_target_protein,
        pg_catalog.now(),
        pg_catalog.now()
    )
    ON CONFLICT (user_id, log_date) DO UPDATE SET
        calories_consumed = EXCLUDED.calories_consumed,
        protein_consumed = EXCLUDED.protein_consumed,
        water_ml = EXCLUDED.water_ml,
        updated_at = pg_catalog.now()
        -- Note: target_calories_snapshot and target_protein_snapshot are INTENTIONALLY excluded here
        -- to preserve the historical target snapshots established on first INSERT.
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

-- Explicitly harden RPC privileges
REVOKE ALL ON FUNCTION public.upsert_nutrition_log(date, numeric, numeric, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_nutrition_log(date, numeric, numeric, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_nutrition_log(date, numeric, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_nutrition_log(date, numeric, numeric, numeric) TO service_role;

-- Phase 3 Slice 3 Migration 1: Lifestyle & Habit Tracking
--
-- Note: lifestyle_logs tracks the actual daily lifestyle execution (workout completion, steps, sleep).
-- Plans are recommendations and remain separate.
--
-- p_log_date is a PostgreSQL DATE. It represents the user's intended local calendar date.
--
-- NULL means that metric was explicitly untracked. 
-- For instance, a user might only track their sleep for the day.
-- The RPC does NOT coalesce old values. It explicitly applies the provided form state.

CREATE TABLE public.lifestyle_logs (
    id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
    user_id uuid NOT NULL,
    log_date date NOT NULL,
    workout_completed boolean NULL,
    steps_count integer NULL,
    sleep_hours numeric NULL,
    created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
    updated_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

-- Foreign Key with cascade delete
ALTER TABLE public.lifestyle_logs
    ADD CONSTRAINT fk_lifestyle_logs_user_id
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Unique constraint ensuring exactly one log per user per local calendar date
ALTER TABLE public.lifestyle_logs
    ADD CONSTRAINT uq_lifestyle_logs_user_date UNIQUE (user_id, log_date);

-- Check constraints to enforce bounds and reject negative and non-finite values
-- Explicit checks for NaN, Infinity, and -Infinity are required to prevent non-finite insertion.
ALTER TABLE public.lifestyle_logs
    ADD CONSTRAINT chk_lifestyle_logs_steps_bounds 
    CHECK (steps_count IS NULL OR (steps_count >= 0 AND steps_count <= 100000)),
    ADD CONSTRAINT chk_lifestyle_logs_sleep_bounds 
    CHECK (sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24 AND sleep_hours != 'NaN'::numeric AND sleep_hours != 'Infinity'::numeric AND sleep_hours != '-Infinity'::numeric));

-- Enable Row Level Security
ALTER TABLE public.lifestyle_logs ENABLE ROW LEVEL SECURITY;

-- Select policy for authenticated users only (own rows)
CREATE POLICY "Users can view their own lifestyle logs"
    ON public.lifestyle_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Explicitly harden table privileges
REVOKE ALL ON TABLE public.lifestyle_logs FROM PUBLIC;
REVOKE ALL ON TABLE public.lifestyle_logs FROM anon;
GRANT SELECT ON TABLE public.lifestyle_logs TO authenticated;
GRANT ALL ON TABLE public.lifestyle_logs TO service_role;

-- Canonical RPC to securely upsert a lifestyle log
CREATE OR REPLACE FUNCTION public.upsert_lifestyle_log(
    p_log_date date,
    p_workout_completed boolean,
    p_steps_count integer,
    p_sleep_hours numeric
) RETURNS public.lifestyle_logs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_result public.lifestyle_logs;
BEGIN
    -- Derive user_id safely from auth.uid()
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validate input bounds to explicitly reject non-finite, negative, or overly large values
    IF p_steps_count IS NOT NULL AND (p_steps_count < 0 OR p_steps_count > 100000) THEN
        RAISE EXCEPTION 'steps_count is out of bounds';
    END IF;

    IF p_sleep_hours IS NOT NULL AND (p_sleep_hours < 0 OR p_sleep_hours > 24 OR p_sleep_hours = 'NaN'::numeric OR p_sleep_hours = 'Infinity'::numeric OR p_sleep_hours = '-Infinity'::numeric) THEN
        RAISE EXCEPTION 'sleep_hours is out of bounds or non-finite';
    END IF;

    -- Perform the atomic upsert
    INSERT INTO public.lifestyle_logs (
        user_id,
        log_date,
        workout_completed,
        steps_count,
        sleep_hours,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_log_date,
        p_workout_completed,
        p_steps_count,
        p_sleep_hours,
        pg_catalog.now(),
        pg_catalog.now()
    )
    ON CONFLICT (user_id, log_date) DO UPDATE SET
        workout_completed = EXCLUDED.workout_completed,
        steps_count = EXCLUDED.steps_count,
        sleep_hours = EXCLUDED.sleep_hours,
        updated_at = pg_catalog.now()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

-- Explicitly harden RPC privileges
REVOKE ALL ON FUNCTION public.upsert_lifestyle_log(date, boolean, integer, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_lifestyle_log(date, boolean, integer, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_lifestyle_log(date, boolean, integer, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_lifestyle_log(date, boolean, integer, numeric) TO service_role;

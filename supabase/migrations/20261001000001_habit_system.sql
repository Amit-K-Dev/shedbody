-- Phase 2: Habit System Migration
--
-- Note: The habit_entries table tracks simple boolean completions for lifestyle habits.
-- For native metrics (workout, steps, water, sleep, protein) that have detailed tracking
-- in lifestyle_logs and nutrition_logs, this table serves as an optional fallback or override,
-- but the primary source of truth remains the detailed logs to avoid data duplication.

CREATE TABLE public.habit_entries (
    id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
    user_id uuid NOT NULL,
    habit_name text NOT NULL,
    log_date date NOT NULL,
    completed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
    updated_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

-- Foreign Key with cascade delete
ALTER TABLE public.habit_entries
    ADD CONSTRAINT fk_habit_entries_user_id
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Unique constraint ensuring exactly one log per habit per user per local calendar date
ALTER TABLE public.habit_entries
    ADD CONSTRAINT uq_habit_entries_user_habit_date UNIQUE (user_id, habit_name, log_date);

-- Check constraints for valid predefined habits required by Master Plan Phase 2
ALTER TABLE public.habit_entries
    ADD CONSTRAINT chk_habit_entries_name 
    CHECK (habit_name IN ('workout', 'steps', 'water', 'sleep', 'protein', 'meditation'));

-- Enable Row Level Security
ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;

-- Select policy for authenticated users only (own rows)
CREATE POLICY "Users can view their own habit entries"
    ON public.habit_entries
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Explicitly harden table privileges
REVOKE ALL ON TABLE public.habit_entries FROM PUBLIC;
REVOKE ALL ON TABLE public.habit_entries FROM anon;
GRANT SELECT ON TABLE public.habit_entries TO authenticated;
GRANT ALL ON TABLE public.habit_entries TO service_role;

-- Canonical RPC to securely upsert a habit entry
CREATE OR REPLACE FUNCTION public.upsert_habit_entry(
    p_habit_name text,
    p_log_date date,
    p_completed boolean
) RETURNS public.habit_entries
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_result public.habit_entries;
BEGIN
    -- Derive user_id safely from auth.uid()
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Perform the atomic upsert
    INSERT INTO public.habit_entries (
        user_id,
        habit_name,
        log_date,
        completed,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_habit_name,
        p_log_date,
        p_completed,
        pg_catalog.now(),
        pg_catalog.now()
    )
    ON CONFLICT (user_id, habit_name, log_date) DO UPDATE SET
        completed = EXCLUDED.completed,
        updated_at = pg_catalog.now()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

-- Explicitly harden RPC privileges
REVOKE ALL ON FUNCTION public.upsert_habit_entry(text, date, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_habit_entry(text, date, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_habit_entry(text, date, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_habit_entry(text, date, boolean) TO service_role;

-- Trigger for updated_at
CREATE TRIGGER update_habit_entries_updated_at
    BEFORE UPDATE ON public.habit_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

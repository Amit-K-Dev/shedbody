-- Migration: B2-Q Adaptation Events Schema & Security Baseline

BEGIN;

-- 1. Create adaptation_events table
CREATE TABLE public.adaptation_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    evaluation_window_start date NOT NULL,
    evaluation_window_end date NOT NULL,
    
    previous_plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    resulting_plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    
    previous_calorie_target numeric NOT NULL,
    proposed_calorie_target numeric NOT NULL,
    final_calorie_target numeric NOT NULL,
    current_weight numeric NOT NULL,
    current_tdee numeric,
    is_clamped boolean NOT NULL,
    
    explanation_snapshot jsonb NOT NULL,
    
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Idempotency Constraint
ALTER TABLE public.adaptation_events
  ADD CONSTRAINT uq_adaptation_idempotency 
  UNIQUE (user_id, goal_id, evaluation_window_start, evaluation_window_end);

-- 3. Plans Provenance
ALTER TABLE public.plans
  ADD COLUMN provenance text DEFAULT NULL 
  CONSTRAINT plans_provenance_check 
  CHECK (provenance IN ('onboarding', 'manual', 'adaptation', 'goal_transition'));

-- 4. RLS Baseline for adaptation_events
ALTER TABLE public.adaptation_events ENABLE ROW LEVEL SECURITY;

-- Deny all by default except explicit grants
REVOKE ALL ON public.adaptation_events FROM authenticated, anon, public;
GRANT SELECT ON public.adaptation_events TO authenticated;
GRANT SELECT ON public.adaptation_events TO service_role;

-- Allow users to read their own events
CREATE POLICY "Users can view their own adaptation events" 
    ON public.adaptation_events 
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id);

-- Note: No INSERT/UPDATE/DELETE policies are created for authenticated users.
-- This ensures writes can only occur via SECURITY DEFINER RPCs or service_role.

COMMIT;

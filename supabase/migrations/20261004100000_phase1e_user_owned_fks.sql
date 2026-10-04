-- Phase 1E: Establish user_owned referential integrity for calculator_results and user_badges

-- 1. PREFLIGHT: Verify zero orphans
DO $$
DECLARE
  calc_orphans INT;
  badge_orphans INT;
BEGIN
  SELECT COUNT(*) INTO calc_orphans
  FROM public.calculator_results cr
  WHERE cr.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = cr.user_id);

  SELECT COUNT(*) INTO badge_orphans
  FROM public.user_badges ub
  WHERE ub.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = ub.user_id);

  IF calc_orphans > 0 THEN
    RAISE EXCEPTION 'Preflight failed: % orphan records found in calculator_results', calc_orphans;
  END IF;

  IF badge_orphans > 0 THEN
    RAISE EXCEPTION 'Preflight failed: % orphan records found in user_badges', badge_orphans;
  END IF;
END $$;

-- 2. APPLY: Add Constraints
ALTER TABLE public.calculator_results
  ADD CONSTRAINT calculator_results_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.user_badges
  ADD CONSTRAINT user_badges_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 3. POSTFLIGHT: Verify Constraints
DO $$
DECLARE
  calc_fk_rule CHAR(1);
  badge_fk_rule CHAR(1);
BEGIN
  -- Verify calculator_results
  SELECT confdeltype INTO calc_fk_rule
  FROM pg_constraint
  WHERE conname = 'calculator_results_user_id_fkey'
    AND conrelid = 'public.calculator_results'::regclass;

  IF calc_fk_rule IS NULL THEN
    RAISE EXCEPTION 'Postflight failed: calculator_results_user_id_fkey does not exist';
  END IF;

  IF calc_fk_rule != 'c' THEN
    RAISE EXCEPTION 'Postflight failed: calculator_results_user_id_fkey delete rule is not CASCADE (found %)', calc_fk_rule;
  END IF;

  -- Verify user_badges
  SELECT confdeltype INTO badge_fk_rule
  FROM pg_constraint
  WHERE conname = 'user_badges_user_id_fkey'
    AND conrelid = 'public.user_badges'::regclass;

  IF badge_fk_rule IS NULL THEN
    RAISE EXCEPTION 'Postflight failed: user_badges_user_id_fkey does not exist';
  END IF;

  IF badge_fk_rule != 'c' THEN
    RAISE EXCEPTION 'Postflight failed: user_badges_user_id_fkey delete rule is not CASCADE (found %)', badge_fk_rule;
  END IF;
END $$;

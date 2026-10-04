-- Migration: Phase 1B Production FK Constraints
-- Description: Applies ON DELETE CASCADE foreign keys to user_profiles and progress_entries with preflight safety checks.

-- A. Dynamic Safety Preflight
DO $$
DECLARE
    orphan_profiles INT;
    orphan_progress INT;
BEGIN
    SELECT COUNT(*) INTO orphan_profiles 
    FROM public.user_profiles 
    WHERE user_id NOT IN (SELECT id FROM auth.users);

    SELECT COUNT(*) INTO orphan_progress 
    FROM public.progress_entries 
    WHERE user_id NOT IN (SELECT id FROM auth.users);

    IF orphan_profiles > 0 THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: Found % orphan user_profiles that do not exist in auth.users. Cannot safely apply FK constraint.', orphan_profiles;
    END IF;

    IF orphan_progress > 0 THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: Found % orphan progress_entries that do not exist in auth.users. Cannot safely apply FK constraint.', orphan_progress;
    END IF;
END $$;

-- B. Add Constraints
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.progress_entries
ADD CONSTRAINT progress_entries_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- C. Postflight Verification
DO $$
DECLARE
    profiles_fk_rule text;
    progress_fk_rule text;
BEGIN
    -- Verify user_profiles_user_id_fkey has ON DELETE CASCADE
    SELECT rc.delete_rule INTO profiles_fk_rule
    FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc 
      ON tc.constraint_name = rc.constraint_name
    WHERE tc.table_name = 'user_profiles' 
      AND tc.constraint_name = 'user_profiles_user_id_fkey';
      
    IF profiles_fk_rule IS NULL THEN
        RAISE EXCEPTION 'POSTFLIGHT FAILED: user_profiles_user_id_fkey not found';
    ELSIF profiles_fk_rule != 'CASCADE' THEN
        RAISE EXCEPTION 'POSTFLIGHT FAILED: user_profiles_user_id_fkey has incorrect delete rule: %', profiles_fk_rule;
    END IF;

    -- Verify progress_entries_user_id_fkey has ON DELETE CASCADE
    SELECT rc.delete_rule INTO progress_fk_rule
    FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc 
      ON tc.constraint_name = rc.constraint_name
    WHERE tc.table_name = 'progress_entries' 
      AND tc.constraint_name = 'progress_entries_user_id_fkey';
      
    IF progress_fk_rule IS NULL THEN
        RAISE EXCEPTION 'POSTFLIGHT FAILED: progress_entries_user_id_fkey not found';
    ELSIF progress_fk_rule != 'CASCADE' THEN
        RAISE EXCEPTION 'POSTFLIGHT FAILED: progress_entries_user_id_fkey has incorrect delete rule: %', progress_fk_rule;
    END IF;
END $$;

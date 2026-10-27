-- Migration: Phase 2C Gate 6 Legacy Deprecation (Rollback-Safe)

-- 1. Retire Dead Legacy Triggers
DROP TRIGGER IF EXISTS update_progress_updated_at ON public.progress_entries;
DROP TRIGGER IF EXISTS on_progress_entries_changed ON public.progress_entries;

-- 2. Retire Dead Legacy Functions/RPCs
DROP FUNCTION IF EXISTS public.sync_user_profile_weight();
DROP FUNCTION IF EXISTS public.trigger_gamification_on_progress();
DROP FUNCTION IF EXISTS public.upsert_nutrition_log(date, numeric, numeric, numeric);
DROP FUNCTION IF EXISTS public.upsert_lifestyle_log(date, boolean, integer, numeric);
-- Note: upsert_progress_entry does not exist in the DB, so nothing to drop.

-- 3. Rename Tables to Archive (Rollback-Safe Deprecation)
ALTER TABLE public.progress_entries RENAME TO archive_progress_entries;
ALTER TABLE public.nutrition_logs RENAME TO archive_nutrition_logs;
ALTER TABLE public.lifestyle_logs RENAME TO archive_lifestyle_logs;

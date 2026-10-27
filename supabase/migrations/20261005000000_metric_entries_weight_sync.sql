-- Phase 2B Gate 5.3: Metric Entries Weight Sync Trigger
-- Replaces the legacy progress_entries weight trigger to support EAV weight updates.

CREATE OR REPLACE FUNCTION public.sync_user_profile_weight_from_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_latest_weight double precision;
BEGIN
    -- Only process weight metrics
    IF NEW.metric_id = 'weight' THEN
        -- Find the latest non-deleted weight from the canonical view
        -- We must use the view or write the query manually against metric_entries
        SELECT value_numeric INTO v_latest_weight
        FROM public.metric_entries
        WHERE user_id = NEW.user_id 
          AND metric_id = 'weight' 
          AND deleted_at IS NULL
        ORDER BY log_date DESC, recorded_at DESC, created_at DESC, id DESC
        LIMIT 1;

        -- Update the user profile with the latest weight
        UPDATE public.user_profiles
        SET weight = v_latest_weight
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_metric_entries_weight_changed ON public.metric_entries;
CREATE TRIGGER on_metric_entries_weight_changed
    AFTER INSERT ON public.metric_entries
    FOR EACH ROW
    WHEN (NEW.metric_id = 'weight')
    EXECUTE FUNCTION public.sync_user_profile_weight_from_metrics();

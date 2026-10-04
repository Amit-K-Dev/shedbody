CREATE OR REPLACE VIEW public.vw_metric_entries_latest 
WITH (security_invoker = true) AS
SELECT DISTINCT ON (user_id, metric_id, log_date)
    id,
    user_id,
    metric_id,
    log_date,
    value_numeric,
    recorded_at,
    created_at,
    deleted_at
FROM public.metric_entries
ORDER BY 
    user_id, 
    metric_id, 
    log_date, 
    recorded_at DESC, 
    created_at DESC, 
    id DESC;

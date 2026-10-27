-- CF-7 Domain 2C: Fix vw_metric_entries_latest to rank all entries before filtering tombstones
-- Resolves tombstone resurrection bug by including deleted entries in ranking.

DROP VIEW IF EXISTS "vw_metric_entries_latest";

CREATE VIEW "vw_metric_entries_latest" AS
SELECT 
    id,
    user_id,
    metric_id,
    log_date,
    value_numeric,
    source,
    metadata,
    created_at,
    deleted_at
FROM (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, metric_id, log_date 
               ORDER BY recorded_at DESC, created_at DESC, rowid DESC, id DESC
           ) as rn
    FROM "metric_entries"
)
WHERE rn = 1;

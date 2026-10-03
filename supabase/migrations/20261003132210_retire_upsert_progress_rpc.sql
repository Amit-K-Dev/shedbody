-- CF-5.6: Retire upsert_progress_entry RPC
-- As verified by the CF-5.6 readiness audit, this function has 0 active runtime consumers.
DROP FUNCTION IF EXISTS public.upsert_progress_entry(double precision, date, numeric, text);

-- Migration C: Explicitly revoke EXECUTE from anon on Slice 3 RPCs

REVOKE EXECUTE ON FUNCTION public.upsert_plan(
  text, text, text, numeric, numeric, jsonb, jsonb
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.soft_delete_plan(
  uuid
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.clear_all_plans() FROM anon;

REVOKE EXECUTE ON FUNCTION public.upsert_calculator_result(
  uuid, jsonb, jsonb
) FROM anon;

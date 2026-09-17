-- Migration D: Attach SET search_path = '' to Slice 3 RPCs

ALTER FUNCTION public.upsert_plan(
  text, text, text, numeric, numeric, jsonb, jsonb
) SET search_path = '';

ALTER FUNCTION public.soft_delete_plan(
  uuid
) SET search_path = '';

ALTER FUNCTION public.clear_all_plans()
SET search_path = '';

ALTER FUNCTION public.upsert_calculator_result(
  uuid, jsonb, jsonb
) SET search_path = '';

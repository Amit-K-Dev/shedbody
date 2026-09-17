-- Migration B: Strict Privilege Revocation for Plans and Calculator Results

-- 1. Hardened Revocation for 'plans' table
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
ON TABLE public.plans
FROM anon, authenticated;

-- 2. Hardened Revocation for 'calculator_results' table
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
ON TABLE public.calculator_results
FROM anon, authenticated;

-- Note: SELECT is deliberately retained based on the existing RLS model.
-- Note: service_role retains full access (it isn't included in the REVOKE list).

-- Restore minimum direct write privilege on progress_entries to authenticated users.
-- This repairs the rollout sequence by allowing the currently live old application 
-- code to continue inserting until the new RPC-based code is deployed.
-- We intentionally DO NOT grant UPDATE or DELETE because the old code only inserts.
GRANT INSERT ON TABLE public.progress_entries TO authenticated;

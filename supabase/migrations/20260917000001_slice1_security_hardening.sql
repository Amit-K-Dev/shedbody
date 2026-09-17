-- Lock down direct writes to enforce the RPC boundary
REVOKE INSERT, UPDATE, DELETE ON TABLE public.progress_entries FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.progress_entries FROM authenticated;

ALTER TABLE public.plans
ADD CONSTRAINT plans_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
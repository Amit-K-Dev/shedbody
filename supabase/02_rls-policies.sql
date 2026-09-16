-- ShedBody Database RLS Policies Documentation
-- Source: scripts/supabase-hardening.sql
-- Live database export was blocked (no Supabase CLI authentication).

-- =============================================
-- RLS Policies
-- =============================================

-- posts table
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
to anon, authenticated
using (
  lower(coalesce(status, '')) = 'published'
  and title is not null
  and slug is not null
  and category is not null
  and published_at is not null
);

drop policy if exists "Admins manage posts" on public.posts;
create policy "Admins manage posts"
on public.posts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- redirects table
drop policy if exists "Public can read redirects" on public.redirects;
create policy "Public can read redirects"
on public.redirects
for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage redirects" on public.redirects;
create policy "Admins manage redirects"
on public.redirects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- post_views table
drop policy if exists "Public can insert post views" on public.post_views;
create policy "Public can insert post views"
on public.post_views
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_views.post_id
      and lower(coalesce(posts.status, '')) = 'published'
      and posts.published_at is not null
  )
);

drop policy if exists "Admins can read post views" on public.post_views;
create policy "Admins can read post views"
on public.post_views
for select
to authenticated
using (public.is_admin());

-- article_feedback table
drop policy if exists "Admins can read article feedback" on public.article_feedback;
create policy "Admins can read article feedback"
on public.article_feedback
for select
to authenticated
using (public.is_admin());

-- contact_submissions table
drop policy if exists "Anyone can submit contact form" on public.contact_submissions;
create policy "Anyone can submit contact form"
on public.contact_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read contact submissions" on public.contact_submissions;
create policy "Admins can read contact submissions"
on public.contact_submissions
for select
to authenticated
using (public.is_admin());

-- progress_entries table
drop policy if exists "Users manage own progress entries" on public.progress_entries;
create policy "Users manage own progress entries"
on public.progress_entries
for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- calculator_results table
drop policy if exists "Users manage own calculator results" on public.calculator_results;
create policy "Users manage own calculator results"
on public.calculator_results
for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- user_profiles table
drop policy if exists "Users read own user profile" on public.user_profiles;
create policy "Users read own user profile"
on public.user_profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users update own user profile" on public.user_profiles;
create policy "Users update own user profile"
on public.user_profiles
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- profiles table
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Storage policies (if buckets exist)
drop policy if exists "Public read images bucket" on storage.objects;
create policy "Public read images bucket"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('images', 'blog-images'));

drop policy if exists "Admins upload images" on storage.objects;
create policy "Admins upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('images', 'blog-images')
  and public.is_admin()
);

drop policy if exists "Admins update images" on storage.objects;
create policy "Admins update images"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('images', 'blog-images')
  and public.is_admin()
)
with check (
  bucket_id in ('images', 'blog-images')
  and public.is_admin()
);

drop policy if exists "Admins delete images" on storage.objects;
create policy "Admins delete images"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('images', 'blog-images')
  and public.is_admin()
);
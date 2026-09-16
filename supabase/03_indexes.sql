-- ShedBody Database Indexes Documentation
-- Source: scripts/supabase-hardening.sql
-- Live database export was blocked (no Supabase CLI authentication).

-- =============================================
-- Indexes
-- =============================================

-- Posts indexes
create index if not exists posts_public_latest_idx
on public.posts (status, published_at desc)
where status = 'published';

create index if not exists posts_public_category_latest_idx
on public.posts (status, category, published_at desc)
where status = 'published';

create index if not exists posts_public_views_idx
on public.posts (status, views desc)
where status = 'published';

create unique index if not exists posts_slug_unique_idx
on public.posts (lower(slug));

-- Redirects indexes
create index if not exists redirects_old_url_idx
on public.redirects (old_url);

-- Post views indexes
create index if not exists post_views_dedupe_lookup_idx
on public.post_views (post_id, user_hash, viewed_at desc);

-- Article feedback indexes
create unique index if not exists article_feedback_post_user_unique_idx
on public.article_feedback (post_id, user_hash);

create index if not exists article_feedback_post_vote_idx
on public.article_feedback (post_id, vote);

create index if not exists article_feedback_post_reason_idx
on public.article_feedback (post_id, reason)
where reason is not null;

-- Progress entries indexes
create unique index if not exists progress_entries_user_date_unique_idx
on public.progress_entries (user_id, entry_date)
where deleted_at is null;

-- Calculator results indexes
create index if not exists calculator_results_user_created_idx
on public.calculator_results (user_id, created_at desc)
where deleted_at is null;

-- User profiles indexes
create index if not exists user_profiles_user_id_idx
on public.user_profiles (user_id);
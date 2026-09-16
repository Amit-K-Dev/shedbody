


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."activity_level" AS ENUM (
    'beginner',
    'intermediate',
    'advanced',
    'expert'
);


ALTER TYPE "public"."activity_level" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_user_xp"("target_user_id" "uuid", "xp_amount" integer) RETURNS TABLE("xp" integer, "level" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_xp integer;
  current_level integer;
  threshold integer;
begin
  if auth.uid() is null or (auth.uid() <> target_user_id and not public.is_admin()) then
    raise exception 'not authorized';
  end if;

  select coalesce(user_profiles.xp, 0), coalesce(user_profiles.gamification_level, 1)
  into current_xp, current_level
  from public.user_profiles
  where user_id = target_user_id
  for update;

  if not found then
    return;
  end if;

  current_xp := current_xp + greatest(xp_amount, 0);
  threshold := current_level * 100;

  while current_xp >= threshold loop
    current_xp := current_xp - threshold;
    current_level := current_level + 1;
    threshold := current_level * 100;
  end loop;

  update public.user_profiles
  set xp = current_xp,
      gamification_level = current_level
  where user_id = target_user_id;

  xp := current_xp;
  level := current_level;
  return next;
end;
$$;


ALTER FUNCTION "public"."add_user_xp"("target_user_id" "uuid", "xp_amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_post_stats"() RETURNS TABLE("total_posts" bigint, "total_views" bigint, "avg_views" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    count(*)::bigint,
    coalesce(sum(views), 0)::bigint,
    coalesce(avg(views), 0)::numeric
  from public.posts;
end;
$$;


ALTER FUNCTION "public"."admin_post_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_views"("post_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.posts
  set views = coalesce(views, 0) + 1
  where id = increment_views.post_id
    and status = 'published'
    and published_at is not null;
end;
$$;


ALTER FUNCTION "public"."increment_views"("post_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text") RETURNS TABLE("yes_count" bigint, "no_count" bigint, "user_vote" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if target_vote not in ('yes', 'no') then
    raise exception 'invalid vote';
  end if;

  if target_user_hash is null or length(target_user_hash) < 32 then
    raise exception 'invalid user hash';
  end if;

  if not exists (
    select 1
    from public.posts
    where id = target_post_id
      and lower(coalesce(status, '')) = 'published'
      and published_at is not null
  ) then
    raise exception 'post not found';
  end if;

  insert into public.article_feedback (post_id, user_hash, vote)
  values (target_post_id, target_user_hash, target_vote)
  on conflict (post_id, user_hash)
  do update set
    vote = excluded.vote,
    updated_at = now();

  return query
  select
    count(*) filter (where article_feedback.vote = 'yes')::bigint,
    count(*) filter (where article_feedback.vote = 'no')::bigint,
    target_vote::text
  from public.article_feedback
  where article_feedback.post_id = target_post_id;
end;
$$;


ALTER FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text", "target_reason" "text", "target_note" "text") RETURNS TABLE("yes_count" bigint, "no_count" bigint, "user_vote" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if target_vote not in ('yes', 'no') then
    raise exception 'invalid vote';
  end if;

  if target_user_hash is null or length(target_user_hash) < 32 then
    raise exception 'invalid user hash';
  end if;

  if target_reason is not null and target_reason not in (
    'clear',
    'actionable',
    'evidence',
    'complete',
    'unclear',
    'missing_detail',
    'outdated',
    'hard_to_follow'
  ) then
    raise exception 'invalid reason';
  end if;

  target_note := nullif(
    left(btrim(regexp_replace(coalesce(target_note, ''), '\s+', ' ', 'g')), 280),
    ''
  );

  if not exists (
    select 1
    from public.posts
    where id = target_post_id
      and lower(coalesce(status, '')) = 'published'
      and published_at is not null
  ) then
    raise exception 'post not found';
  end if;

  insert into public.article_feedback (post_id, user_hash, vote, reason, note)
  values (target_post_id, target_user_hash, target_vote, target_reason, target_note)
  on conflict (post_id, user_hash)
  do update set
    vote = excluded.vote,
    reason = excluded.reason,
    note = excluded.note,
    updated_at = now();

  return query
  select
    count(*) filter (where article_feedback.vote = 'yes')::bigint,
    count(*) filter (where article_feedback.vote = 'no')::bigint,
    target_vote::text
  from public.article_feedback
  where article_feedback.post_id = target_post_id;
end;
$$;


ALTER FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text", "target_reason" "text", "target_note" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_post_view"("target_post_id" bigint, "target_user_hash" "text", "target_viewed_at" timestamp with time zone DEFAULT "now"()) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  existing_view_id bigint;
  next_views bigint;
begin
  if target_post_id is null or target_post_id <= 0 then
    return jsonb_build_object('success', false, 'error', 'Invalid postId');
  end if;

  if target_user_hash is null or length(target_user_hash) = 0 then
    return jsonb_build_object('success', false, 'error', 'Invalid user hash');
  end if;

  if not exists (
    select 1
    from public.posts
    where id = target_post_id
      and (
        lower(coalesce(status, '')) in ('published', 'publish')
        or status is null
      )
      and published_at is not null
  ) then
    return jsonb_build_object('success', false, 'error', 'Post not found');
  end if;

  select id
  into existing_view_id
  from public.post_views
  where post_id = target_post_id
    and user_hash = target_user_hash
    and viewed_at >= target_viewed_at - interval '30 minutes'
  limit 1;

  if existing_view_id is not null then
    select coalesce(views, 0)
    into next_views
    from public.posts
    where id = target_post_id;

    return jsonb_build_object(
      'success', true,
      'counted', false,
      'message', 'Already counted',
      'views', coalesce(next_views, 0)
    );
  end if;

  insert into public.post_views (post_id, user_hash, viewed_at)
  values (target_post_id, target_user_hash, target_viewed_at);

  update public.posts
  set views = coalesce(views, 0) + 1
  where id = target_post_id
  returning views into next_views;

  return jsonb_build_object(
    'success', true,
    'counted', true,
    'views', coalesce(next_views, 0)
  );
end;
$$;


ALTER FUNCTION "public"."record_post_view"("target_post_id" bigint, "target_user_hash" "text", "target_viewed_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_streak"("target_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  today_key date := current_date;
  yesterday_key date := current_date - 1;
  last_date date;
  new_streak integer;
begin
  if auth.uid() is null or (auth.uid() <> target_user_id and not public.is_admin()) then
    raise exception 'not authorized';
  end if;

  select last_active_date, coalesce(streak_count, 0)
  into last_date, new_streak
  from public.user_profiles
  where user_id = target_user_id
  for update;

  if not found then
    return null;
  end if;

  if last_date is null then
    new_streak := 1;
  elsif last_date = today_key then
    return new_streak;
  elsif last_date = yesterday_key then
    new_streak := new_streak + 1;
  else
    new_streak := 1;
  end if;

  update public.user_profiles
  set streak_count = new_streak,
      last_active_date = today_key
  where user_id = target_user_id;

  return new_streak;
end;
$$;


ALTER FUNCTION "public"."update_user_streak"("target_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."article_feedback" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "user_hash" "text" NOT NULL,
    "vote" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reason" "text",
    "note" "text",
    CONSTRAINT "article_feedback_note_length_check" CHECK ((("note" IS NULL) OR ("char_length"("note") <= 280))),
    CONSTRAINT "article_feedback_reason_check" CHECK ((("reason" IS NULL) OR ("reason" = ANY (ARRAY['clear'::"text", 'actionable'::"text", 'evidence'::"text", 'complete'::"text", 'unclear'::"text", 'missing_detail'::"text", 'outdated'::"text", 'hard_to_follow'::"text"])))),
    CONSTRAINT "article_feedback_vote_check" CHECK (("vote" = ANY (ARRAY['yes'::"text", 'no'::"text"])))
);


ALTER TABLE "public"."article_feedback" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."article_feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."article_feedback_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."article_feedback_id_seq" OWNED BY "public"."article_feedback"."id";



CREATE TABLE IF NOT EXISTS "public"."badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "description" "text",
    "icon" "text"
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calculator_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "icon" "text",
    "description" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."calculator_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calculator_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "calculator_id" "uuid",
    "input_data" "jsonb" NOT NULL,
    "result_data" "jsonb" NOT NULL,
    "is_latest" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "update_at" timestamp without time zone DEFAULT "now"(),
    "deleted_at" timestamp without time zone
);


ALTER TABLE "public"."calculator_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calculators" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "category_id" "uuid",
    "description" "text",
    "is_active" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "input_schema" "jsonb",
    "result_schema" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."calculators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_submissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "inquiry_type" "text" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contact_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pages" (
    "id" bigint NOT NULL,
    "title" "text",
    "slug" "text",
    "content" "text",
    "excerpt" "text",
    "published_at" timestamp without time zone
);


ALTER TABLE "public"."pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "goal" "text" NOT NULL,
    "diet_type" "text" NOT NULL,
    "level" "text" NOT NULL,
    "calories" numeric NOT NULL,
    "protein" numeric NOT NULL,
    "workout" "jsonb",
    "meals" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "deleted_at" timestamp without time zone,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT false,
    CONSTRAINT "plans_level_check" CHECK (("level" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text"])))
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" bigint NOT NULL,
    "user_hash" "text" NOT NULL,
    "viewed_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" bigint NOT NULL,
    "title" "text",
    "slug" "text",
    "content" "text",
    "excerpt" "text",
    "published_at" timestamp with time zone,
    "category" "text",
    "views" integer DEFAULT 0,
    "updated_at" timestamp with time zone,
    "processed_content" "text",
    "featured_image" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "author_id" "uuid",
    "seo_title" "text",
    "seo_desc" "text",
    "keywords" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


ALTER TABLE "public"."posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'user'::"text",
    "avatar_url" "text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."progress_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "weight" double precision NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "body_fat" double precision,
    "notes" "text",
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "deleted_at" timestamp without time zone,
    "entry_date" "date" DEFAULT CURRENT_DATE,
    CONSTRAINT "progress_entries_body_fat_check" CHECK ((("body_fat" >= (0)::double precision) AND ("body_fat" <= (100)::double precision))),
    CONSTRAINT "progress_entries_weight_check" CHECK (("weight" > (0)::double precision))
);


ALTER TABLE "public"."progress_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."redirects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "old_url" "text" NOT NULL,
    "new_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."redirects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "badge_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "goal" "text" DEFAULT 'maintain'::"text" NOT NULL,
    "target_weight" double precision,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "age" bigint,
    "weight" double precision,
    "height" double precision,
    "level" "public"."activity_level",
    "diet_type" "text",
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "gender" "text",
    "unit_system" "text" DEFAULT 'metric'::"text",
    "streak_count" integer DEFAULT 0,
    "last_active_date" "date",
    "xp" integer DEFAULT 0,
    "reminder_enabled" boolean DEFAULT false,
    "reminder_time" time without time zone DEFAULT '20:00:00'::time without time zone,
    "gamification_level" integer DEFAULT 1,
    CONSTRAINT "user_profiles_age_check" CHECK ((("age" >= 10) AND ("age" <= 100))),
    CONSTRAINT "user_profiles_height_check" CHECK (("height" > (0)::double precision)),
    CONSTRAINT "user_profiles_target_weight_check" CHECK (("target_weight" > (0)::double precision)),
    CONSTRAINT "user_profiles_weight_check" CHECK (("weight" > (0)::double precision))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."article_feedback" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."article_feedback_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."article_feedback"
    ADD CONSTRAINT "article_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calculator_categories"
    ADD CONSTRAINT "calculator_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calculator_categories"
    ADD CONSTRAINT "calculator_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."calculator_results"
    ADD CONSTRAINT "calculator_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calculators"
    ADD CONSTRAINT "calculators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calculators"
    ADD CONSTRAINT "calculators_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."contact_submissions"
    ADD CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_views"
    ADD CONSTRAINT "post_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progress_entries"
    ADD CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."redirects"
    ADD CONSTRAINT "redirects_old_url_key" UNIQUE ("old_url");



ALTER TABLE ONLY "public"."redirects"
    ADD CONSTRAINT "redirects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "article_feedback_post_reason_idx" ON "public"."article_feedback" USING "btree" ("post_id", "reason") WHERE ("reason" IS NOT NULL);



CREATE UNIQUE INDEX "article_feedback_post_user_unique_idx" ON "public"."article_feedback" USING "btree" ("post_id", "user_hash");



CREATE INDEX "article_feedback_post_vote_idx" ON "public"."article_feedback" USING "btree" ("post_id", "vote");



CREATE UNIQUE INDEX "calculator_results_one_latest_per_user_calculator_idx" ON "public"."calculator_results" USING "btree" ("user_id", "calculator_id") WHERE (("is_latest" = true) AND ("deleted_at" IS NULL));



CREATE INDEX "calculator_results_user_calculator_created_idx" ON "public"."calculator_results" USING "btree" ("user_id", "calculator_id", "created_at" DESC) WHERE ("deleted_at" IS NULL);



CREATE INDEX "calculator_results_user_created_idx" ON "public"."calculator_results" USING "btree" ("user_id", "created_at" DESC) WHERE ("deleted_at" IS NULL);



CREATE INDEX "plans_user_active_created_idx" ON "public"."plans" USING "btree" ("user_id", "is_active", "created_at" DESC) WHERE ("deleted_at" IS NULL);



CREATE INDEX "plans_user_created_idx" ON "public"."plans" USING "btree" ("user_id", "created_at" DESC) WHERE ("deleted_at" IS NULL);



CREATE INDEX "post_views_dedupe_lookup_idx" ON "public"."post_views" USING "btree" ("post_id", "user_hash", "viewed_at" DESC);



CREATE INDEX "post_views_post_hash_viewed_idx" ON "public"."post_views" USING "btree" ("post_id", "user_hash", "viewed_at" DESC);



CREATE INDEX "post_views_viewed_at_idx" ON "public"."post_views" USING "btree" ("viewed_at" DESC);



CREATE INDEX "posts_public_category_latest_idx" ON "public"."posts" USING "btree" ("status", "category", "published_at" DESC) WHERE ("status" = 'published'::"text");



CREATE INDEX "posts_public_latest_idx" ON "public"."posts" USING "btree" ("status", "published_at" DESC) WHERE ("status" = 'published'::"text");



CREATE INDEX "posts_public_views_idx" ON "public"."posts" USING "btree" ("status", "views" DESC) WHERE ("status" = 'published'::"text");



CREATE UNIQUE INDEX "posts_slug_unique_idx" ON "public"."posts" USING "btree" ("lower"("slug"));



CREATE INDEX "progress_entries_user_created_idx" ON "public"."progress_entries" USING "btree" ("user_id", "created_at") WHERE ("deleted_at" IS NULL);



CREATE UNIQUE INDEX "progress_entries_user_date_unique_idx" ON "public"."progress_entries" USING "btree" ("user_id", "entry_date") WHERE ("deleted_at" IS NULL);



CREATE INDEX "progress_entries_user_entry_date_idx" ON "public"."progress_entries" USING "btree" ("user_id", "entry_date", "created_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "redirects_old_url_idx" ON "public"."redirects" USING "btree" ("old_url");



CREATE INDEX "user_profiles_user_id_idx" ON "public"."user_profiles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_plans_updated_at" BEFORE UPDATE ON "public"."plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_progress_updated_at" BEFORE UPDATE ON "public"."progress_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."article_feedback"
    ADD CONSTRAINT "article_feedback_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calculator_results"
    ADD CONSTRAINT "calculator_results_calculator_id_fkey" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculators"("id");



ALTER TABLE ONLY "public"."calculators"
    ADD CONSTRAINT "calculators_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."calculator_categories"("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can read article feedback" ON "public"."article_feedback" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can read contact submissions" ON "public"."contact_submissions" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can read post views" ON "public"."post_views" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins have full access to posts" ON "public"."posts" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins manage posts" ON "public"."posts" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins manage redirects" ON "public"."redirects" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Allow public insert for anonymous users" ON "public"."calculator_results" FOR INSERT WITH CHECK (("user_id" IS NULL));



CREATE POLICY "Allow public read" ON "public"."pages" FOR SELECT USING (true);



CREATE POLICY "Allow public read" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Allow update views" ON "public"."posts" FOR UPDATE USING (true);



CREATE POLICY "Anyone can read badges" ON "public"."badges" FOR SELECT USING (true);



CREATE POLICY "Anyone can read calculator categories" ON "public"."calculator_categories" FOR SELECT USING (true);



CREATE POLICY "Anyone can read calculators" ON "public"."calculators" FOR SELECT USING (true);



CREATE POLICY "Anyone can submit contact form" ON "public"."contact_submissions" FOR INSERT TO "authenticated", "anon" WITH CHECK (((("char_length"("name") >= 2) AND ("char_length"("name") <= 80)) AND (("char_length"("email") >= 5) AND ("char_length"("email") <= 255)) AND (("char_length"("message") >= 10) AND ("char_length"("message") <= 3000))));



CREATE POLICY "Anyone can view published posts" ON "public"."posts" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Author can update their own posts" ON "public"."posts" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Public can insert post views" ON "public"."post_views" FOR INSERT TO "authenticated", "anon" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."posts"
  WHERE (("posts"."id" = "post_views"."post_id") AND ("lower"(COALESCE("posts"."status", ''::"text")) = 'published'::"text") AND ("posts"."published_at" IS NOT NULL)))));



CREATE POLICY "Public can read publishable posts" ON "public"."posts" FOR SELECT USING ((("title" IS NOT NULL) AND ("slug" IS NOT NULL) AND ("category" IS NOT NULL) AND ("published_at" IS NOT NULL)));



CREATE POLICY "Public can read published posts" ON "public"."posts" FOR SELECT TO "authenticated", "anon" USING ((("lower"(COALESCE("status", ''::"text")) = 'published'::"text") AND ("title" IS NOT NULL) AND ("slug" IS NOT NULL) AND ("category" IS NOT NULL) AND ("published_at" IS NOT NULL)));



CREATE POLICY "Public can read redirects" ON "public"."redirects" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "User can manage their own results" ON "public"."calculator_results" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "User can manage their plans" ON "public"."plans" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "User can manage their profile" ON "public"."user_profiles" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "User can manage their progress" ON "public"."progress_entries" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own calculator results" ON "public"."calculator_results" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own plans" ON "public"."plans" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own progress entries" ON "public"."progress_entries" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own calculator results" ON "public"."calculator_results" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own plans" ON "public"."plans" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own progress entries" ON "public"."progress_entries" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own calculator results" ON "public"."calculator_results" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own plans" ON "public"."plans" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own progress entries" ON "public"."progress_entries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own calculator results" ON "public"."calculator_results" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own plans" ON "public"."plans" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own progress entries" ON "public"."progress_entries" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own badges" ON "public"."user_badges" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own calculator results" ON "public"."calculator_results" TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Users manage own progress entries" ON "public"."progress_entries" TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Users read own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Users read own user profile" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Users update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Users update own user profile" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."article_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calculator_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calculator_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calculators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."progress_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."redirects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_user_xp"("target_user_id" "uuid", "xp_amount" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."add_user_xp"("target_user_id" "uuid", "xp_amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_user_xp"("target_user_id" "uuid", "xp_amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_post_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_post_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_post_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_views"("post_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_views"("post_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_views"("post_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text", "target_reason" "text", "target_note" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text", "target_reason" "text", "target_note" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_article_feedback"("target_post_id" bigint, "target_user_hash" "text", "target_vote" "text", "target_reason" "text", "target_note" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_post_view"("target_post_id" bigint, "target_user_hash" "text", "target_viewed_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."record_post_view"("target_post_id" bigint, "target_user_hash" "text", "target_viewed_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_post_view"("target_post_id" bigint, "target_user_hash" "text", "target_viewed_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_streak"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_streak"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_streak"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."article_feedback" TO "anon";
GRANT ALL ON TABLE "public"."article_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."article_feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."article_feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."article_feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."article_feedback_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."badges" TO "anon";
GRANT ALL ON TABLE "public"."badges" TO "authenticated";
GRANT ALL ON TABLE "public"."badges" TO "service_role";



GRANT ALL ON TABLE "public"."calculator_categories" TO "anon";
GRANT ALL ON TABLE "public"."calculator_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."calculator_categories" TO "service_role";



GRANT ALL ON TABLE "public"."calculator_results" TO "anon";
GRANT ALL ON TABLE "public"."calculator_results" TO "authenticated";
GRANT ALL ON TABLE "public"."calculator_results" TO "service_role";



GRANT ALL ON TABLE "public"."calculators" TO "anon";
GRANT ALL ON TABLE "public"."calculators" TO "authenticated";
GRANT ALL ON TABLE "public"."calculators" TO "service_role";



GRANT ALL ON TABLE "public"."contact_submissions" TO "anon";
GRANT ALL ON TABLE "public"."contact_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."pages" TO "anon";
GRANT ALL ON TABLE "public"."pages" TO "authenticated";
GRANT ALL ON TABLE "public"."pages" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON TABLE "public"."post_views" TO "anon";
GRANT ALL ON TABLE "public"."post_views" TO "authenticated";
GRANT ALL ON TABLE "public"."post_views" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."progress_entries" TO "anon";
GRANT ALL ON TABLE "public"."progress_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."progress_entries" TO "service_role";



GRANT ALL ON TABLE "public"."redirects" TO "anon";
GRANT ALL ON TABLE "public"."redirects" TO "authenticated";
GRANT ALL ON TABLE "public"."redirects" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

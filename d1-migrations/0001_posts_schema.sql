-- Migration: 0001_posts_schema
-- Description: Adds tables for the posts domain

CREATE TABLE "posts" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "category" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "processed_content" TEXT,
    "featured_image" TEXT,
    "status" TEXT DEFAULT 'draft',
    "seo_title" TEXT,
    "seo_desc" TEXT,
    "keywords" TEXT,
    "views" INTEGER DEFAULT 0,
    "author_id" TEXT, -- Can link to user, but some posts might be system generated
    "published_at" TEXT, -- ISO Date String
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "updated_at" TEXT
);

CREATE TABLE "post_views" (
    "id" TEXT PRIMARY KEY,
    "post_id" TEXT NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
    "user_hash" TEXT NOT NULL,
    "viewed_at" TEXT NOT NULL, -- ISO Date String
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE "redirects" (
    "id" TEXT PRIMARY KEY,
    "old_url" TEXT NOT NULL UNIQUE,
    "new_url" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

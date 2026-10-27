-- Migration: 0005_profiles
-- Description: Adds profiles table and public_profiles view for profile identity and admin roles

CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE VIEW IF NOT EXISTS "public_profiles" AS
SELECT 
    id,
    full_name AS display_name,
    bio,
    avatar_url,
    role
FROM "profiles";

-- Migration: 0007_align_notifications_schema.sql
-- Description: Aligns notifications CHECK constraint with application engine types
--              and updates notification_preferences schema for parity with Supabase.

-- ==============================================================================
-- 1. NOTIFICATIONS TABLE SCHEMA ALIGNMENT (REBUILD FOR UPDATED CHECK CONSTRAINT)
-- ==============================================================================

CREATE TABLE "notifications_new" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL CHECK ("type" IN ('workout_reminder', 'goal_reminder', 'habit_reminder', 'weekly_progress', 'plan_update')),
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "is_read" INTEGER NOT NULL DEFAULT 0,
    "deterministic_key" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

INSERT INTO "notifications_new" (
    "id", "user_id", "type", "title", "message", "action_url", "is_read", "deterministic_key", "created_at"
)
SELECT 
    "id", 
    "user_id", 
    CASE 
        WHEN "type" = 'weekly_report' THEN 'weekly_progress'
        WHEN "type" = 'system_update' THEN 'plan_update'
        ELSE "type"
    END,
    "title", 
    "message", 
    "action_url", 
    "is_read", 
    "deterministic_key", 
    "created_at"
FROM "notifications";

DROP TABLE "notifications";
ALTER TABLE "notifications_new" RENAME TO "notifications";

CREATE UNIQUE INDEX "notifications_user_key_unique" ON "notifications"("user_id", "deterministic_key");
CREATE INDEX "idx_notifications_user_read" ON "notifications"("user_id", "is_read");
CREATE INDEX "idx_notifications_user_created_at" ON "notifications"("user_id", "created_at" DESC);

-- ==============================================================================
-- 2. NOTIFICATION PREFERENCES TABLE ALIGNMENT
-- ==============================================================================

CREATE TABLE "notification_preferences_new" (
    "user_id" TEXT PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
    "workout_reminders" INTEGER NOT NULL DEFAULT 1,
    "goal_reminders" INTEGER NOT NULL DEFAULT 1,
    "habit_reminders" INTEGER NOT NULL DEFAULT 1,
    "weekly_progress" INTEGER NOT NULL DEFAULT 1,
    "plan_updates" INTEGER NOT NULL DEFAULT 1,
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

INSERT INTO "notification_preferences_new" (
    "user_id", "workout_reminders", "goal_reminders", "habit_reminders", "weekly_progress", "plan_updates", "created_at", "updated_at"
)
SELECT
    "user_id",
    "workout_reminders",
    "goal_reminders",
    1,
    "weekly_reports",
    "system_updates",
    "created_at",
    "updated_at"
FROM "notification_preferences";

DROP TABLE "notification_preferences";
ALTER TABLE "notification_preferences_new" RENAME TO "notification_preferences";

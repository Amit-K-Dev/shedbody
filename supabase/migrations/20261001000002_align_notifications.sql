-- Additive Migration to align notification schema with Master Plan Phase 10
-- Do not modify 20261001000000_notifications_schema.sql

BEGIN;

-- 1. Rename columns in notification_preferences to match Master Plan terminology
ALTER TABLE public.notification_preferences RENAME COLUMN weekly_reports TO weekly_progress;
ALTER TABLE public.notification_preferences RENAME COLUMN system_updates TO plan_updates;

-- 2. Add the missing habit_reminders preference
ALTER TABLE public.notification_preferences ADD COLUMN habit_reminders BOOLEAN DEFAULT true NOT NULL;

-- 3. Drop and recreate the CHECK constraint for notifications table
ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type = ANY(ARRAY['workout_reminder', 'goal_reminder', 'habit_reminder', 'weekly_progress', 'plan_update']));

COMMIT;

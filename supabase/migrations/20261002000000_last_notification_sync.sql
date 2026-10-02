-- Add last_notification_sync to track background notification generation

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS last_notification_sync TIMESTAMPTZ DEFAULT '1970-01-01'::timestamptz;

CREATE INDEX IF NOT EXISTS idx_user_profiles_last_sync ON user_profiles(last_notification_sync ASC NULLS FIRST);

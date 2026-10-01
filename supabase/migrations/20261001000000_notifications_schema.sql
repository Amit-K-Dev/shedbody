-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_reminders BOOLEAN DEFAULT true NOT NULL,
    goal_reminders BOOLEAN DEFAULT true NOT NULL,
    weekly_reports BOOLEAN DEFAULT true NOT NULL,
    system_updates BOOLEAN DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT "now"() NOT NULL,
    updated_at timestamp without time zone DEFAULT "now"() NOT NULL
);

-- Enable RLS for notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for notification_preferences
CREATE POLICY "Users can view own notification preferences" 
    ON public.notification_preferences 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" 
    ON public.notification_preferences 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" 
    ON public.notification_preferences 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create trigger to manage updated_at for notification_preferences
CREATE TRIGGER notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    deterministic_key TEXT NOT NULL,
    created_at timestamp without time zone DEFAULT "now"() NOT NULL,
    
    -- Constraint to enforce valid notification types
    CONSTRAINT notifications_type_check CHECK (type = ANY(ARRAY['workout_reminder', 'goal_reminder', 'weekly_report', 'system_update'])),
    
    -- Constraint to prevent duplicate spam
    CONSTRAINT notifications_user_key_unique UNIQUE(user_id, deterministic_key)
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view own notifications" 
    ON public.notifications 
    FOR SELECT USING (auth.uid() = user_id);

-- No INSERT policy for authenticated users to prevent client-side spoofing.
-- Notifications are generated exclusively by the backend engine.

CREATE POLICY "Users can update own notifications" 
    ON public.notifications 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
    ON public.notifications 
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created_at ON public.notifications(user_id, created_at DESC);

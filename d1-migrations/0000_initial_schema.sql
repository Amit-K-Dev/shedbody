-- CF-2 Local D1 Translation Schema
-- Target: Cloudflare D1 (SQLite)

-- ==============================================================================
-- 1. BETTER AUTH SCHEMA
-- ==============================================================================
CREATE TABLE "user" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" INTEGER NOT NULL,
    "image" TEXT,
    "createdAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL
);

CREATE TABLE "session" (
    "id" TEXT PRIMARY KEY,
    "expiresAt" INTEGER NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "createdAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "account" (
    "id" TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" INTEGER,
    "refreshTokenExpiresAt" INTEGER,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL
);

CREATE TABLE "verification" (
    "id" TEXT PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "createdAt" INTEGER,
    "updatedAt" INTEGER
);

-- ==============================================================================
-- 2. DOMAIN SCHEMA (Translated from Supabase PostgreSQL)
-- ==============================================================================

-- 2.1 USER PROFILES
CREATE TABLE "user_profiles" (
    "user_id" TEXT PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
    "goal" TEXT NOT NULL DEFAULT 'maintain',
    "target_weight" REAL,
    "age" INTEGER CHECK ("age" >= 10 AND "age" <= 100),
    "weight" REAL CHECK ("weight" > 0),
    "height" REAL CHECK ("height" > 0),
    "level" TEXT,
    "diet_type" TEXT,
    "gender" TEXT,
    "unit_system" TEXT DEFAULT 'metric',
    "streak_count" INTEGER DEFAULT 0,
    "last_active_date" TEXT,
    "xp" INTEGER DEFAULT 0,
    "reminder_enabled" INTEGER DEFAULT 0,
    "reminder_time" TEXT DEFAULT '20:00:00',
    "gamification_level" INTEGER DEFAULT 1,
    "last_notification_sync" TEXT,
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    CONSTRAINT "user_profiles_target_weight_check" CHECK ("target_weight" > 0)
);

-- 2.2 GOALS
CREATE TABLE "goals" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "domain" TEXT NOT NULL CHECK ("domain" IN ('weight')),
    "start_value" REAL,
    "target_value" REAL NOT NULL CHECK ("target_value" > 0),
    "start_date" TEXT NOT NULL, -- YYYY-MM-DD
    "target_date" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'achieved', 'abandoned')),
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
CREATE UNIQUE INDEX "goals_single_active_domain_idx" ON "goals"("user_id", "domain") WHERE "status" = 'active';

-- 2.3 UNIFIED TRACKING (METRICS & ENTRIES)
CREATE TABLE "metrics" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "data_type" TEXT NOT NULL
);

CREATE TABLE "metric_entries" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "metric_id" TEXT NOT NULL REFERENCES "metrics"("id"),
    "log_date" TEXT NOT NULL, -- YYYY-MM-DD
    "recorded_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "value_numeric" REAL,
    "source" TEXT NOT NULL CHECK ("source" IN ('manual', 'device', 'import', 'ai', 'system')),
    "metadata" TEXT, -- JSON stored as TEXT
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "deleted_at" INTEGER
);
CREATE INDEX "idx_metric_entries_user_date" ON "metric_entries"("user_id", "log_date");
CREATE INDEX "idx_metric_entries_user_metric_date" ON "metric_entries"("user_id", "metric_id", "log_date");

-- 2.4 NUTRITION LOGS
CREATE TABLE "nutrition_logs" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "log_date" TEXT NOT NULL, -- YYYY-MM-DD
    "calories_consumed" REAL CHECK ("calories_consumed" >= 0),
    "protein_consumed" REAL CHECK ("protein_consumed" >= 0),
    "water_ml" REAL CHECK ("water_ml" >= 0),
    "target_calories_snapshot" REAL CHECK ("target_calories_snapshot" >= 0),
    "target_protein_snapshot" REAL CHECK ("target_protein_snapshot" >= 0),
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
CREATE UNIQUE INDEX "uq_nutrition_logs_user_date" ON "nutrition_logs"("user_id", "log_date");

-- 2.5 LIFESTYLE LOGS
CREATE TABLE "lifestyle_logs" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "log_date" TEXT NOT NULL,
    "workout_completed" INTEGER, -- Boolean (0 or 1)
    "steps_count" INTEGER CHECK ("steps_count" >= 0),
    "sleep_hours" REAL CHECK ("sleep_hours" >= 0 AND "sleep_hours" <= 24),
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
CREATE UNIQUE INDEX "uq_lifestyle_logs_user_date" ON "lifestyle_logs"("user_id", "log_date");

-- 2.6 HABIT SYSTEM
CREATE TABLE "habit_entries" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "habit_name" TEXT NOT NULL CHECK ("habit_name" IN ('workout', 'steps', 'water', 'sleep', 'protein', 'meditation')),
    "log_date" TEXT NOT NULL,
    "completed" INTEGER NOT NULL DEFAULT 0, -- Boolean
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
CREATE UNIQUE INDEX "uq_habit_entries_user_habit_date" ON "habit_entries"("user_id", "habit_name", "log_date");

-- 2.7 PLANS
CREATE TABLE "plans" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "goal" TEXT,
    "diet_type" TEXT,
    "level" TEXT,
    "calories" REAL,
    "protein" REAL,
    "workout" TEXT,
    "meals" TEXT,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "provenance" TEXT CHECK ("provenance" IN ('onboarding', 'manual', 'adaptation', 'goal_transition')),
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "deleted_at" INTEGER
);

-- 2.8 ADAPTATION EVENTS
CREATE TABLE "adaptation_events" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "goal_id" TEXT NOT NULL REFERENCES "goals"("id") ON DELETE CASCADE,
    "evaluation_window_start" TEXT NOT NULL,
    "evaluation_window_end" TEXT NOT NULL,
    "previous_plan_id" TEXT NOT NULL REFERENCES "plans"("id") ON DELETE CASCADE,
    "resulting_plan_id" TEXT NOT NULL REFERENCES "plans"("id") ON DELETE CASCADE,
    "previous_calorie_target" REAL NOT NULL,
    "proposed_calorie_target" REAL NOT NULL,
    "final_calorie_target" REAL NOT NULL,
    "current_weight" REAL NOT NULL,
    "current_tdee" REAL,
    "is_clamped" INTEGER NOT NULL,
    "explanation_snapshot" TEXT NOT NULL, -- JSON
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
CREATE UNIQUE INDEX "uq_adaptation_idempotency" ON "adaptation_events"("user_id", "goal_id", "evaluation_window_start", "evaluation_window_end");

-- 2.9 NOTIFICATIONS
CREATE TABLE "notification_preferences" (
    "user_id" TEXT PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
    "workout_reminders" INTEGER NOT NULL DEFAULT 1,
    "goal_reminders" INTEGER NOT NULL DEFAULT 1,
    "weekly_reports" INTEGER NOT NULL DEFAULT 1,
    "system_updates" INTEGER NOT NULL DEFAULT 1,
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE "notifications" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL CHECK ("type" IN ('workout_reminder', 'goal_reminder', 'weekly_report', 'system_update')),
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "is_read" INTEGER NOT NULL DEFAULT 0,
    "deterministic_key" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
CREATE UNIQUE INDEX "notifications_user_key_unique" ON "notifications"("user_id", "deterministic_key");
CREATE INDEX "idx_notifications_user_read" ON "notifications"("user_id", "is_read");
CREATE INDEX "idx_notifications_user_created_at" ON "notifications"("user_id", "created_at" DESC);

-- ==============================================================================
-- 3. VIEWS & SYSTEM SEED DATA
-- ==============================================================================
CREATE VIEW "vw_metric_entries_latest" AS
SELECT 
    id,
    user_id,
    metric_id,
    log_date,
    value_numeric,
    source,
    metadata,
    created_at,
    deleted_at
FROM (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY user_id, metric_id, log_date ORDER BY recorded_at DESC, created_at DESC, id DESC) as rn
    FROM "metric_entries"
    WHERE deleted_at IS NULL
)
WHERE rn = 1;

INSERT INTO "metrics" ("id", "name", "unit", "data_type") VALUES
    ('weight', 'Weight', 'kg', 'numeric'),
    ('body_fat', 'Body Fat', '%', 'numeric'),
    ('calories', 'Calories', 'kcal', 'numeric'),
    ('protein', 'Protein', 'g', 'numeric'),
    ('water', 'Water', 'ml', 'numeric'),
    ('steps', 'Steps', 'count', 'numeric'),
    ('sleep', 'Sleep', 'hours', 'numeric'),
    ('workout', 'Workout', 'completed', 'boolean')
ON CONFLICT ("id") DO NOTHING;

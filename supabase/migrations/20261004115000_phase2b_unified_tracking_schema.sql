-- Phase 2B Gate 2 Schema Migration: Unified Tracking Engine

-- 1. Create metrics table (Reference/Catalog)
CREATE TABLE public.metrics (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    unit VARCHAR NOT NULL,
    data_type VARCHAR NOT NULL
);

-- 2. Create metric_entries table (Ledger)
CREATE TABLE public.metric_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    metric_id VARCHAR NOT NULL,
    log_date DATE NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    value_numeric FLOAT8,
    source VARCHAR NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT metric_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT metric_entries_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.metrics(id),
    CONSTRAINT metric_entries_source_check CHECK (source IN ('manual', 'device', 'import', 'ai', 'system'))
);

-- 3. Indexes for deterministic sorting and daily queries
CREATE INDEX idx_metric_entries_user_date ON public.metric_entries(user_id, log_date);
CREATE INDEX idx_metric_entries_user_metric_date ON public.metric_entries(user_id, metric_id, log_date);
-- Index for deterministic DISTINCT ON (user_id, metric_id, log_date) ORDER BY recorded_at DESC, created_at DESC, id DESC
CREATE INDEX idx_metric_entries_deterministic_sort ON public.metric_entries(user_id, metric_id, log_date, recorded_at DESC, created_at DESC, id DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_entries ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Metrics catalog is read-only for authenticated users
CREATE POLICY "Metrics are globally readable"
    ON public.metrics
    FOR SELECT
    TO authenticated
    USING (true);

-- Metric Entries: Strict Append-Only Ledger
-- Users can read their own entries
CREATE POLICY "Users can read their own metric entries"
    ON public.metric_entries
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert new entries (appends/revisions/tombstones)
CREATE POLICY "Users can insert their own metric entries"
    ON public.metric_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- NO UPDATE or DELETE policies are created to enforce immutability of historical rows.

-- 6. Direct Database Grants
GRANT SELECT ON public.metrics TO authenticated;
-- Explicitly granting only SELECT and INSERT to enforce append-only pattern at the privilege level
GRANT SELECT, INSERT ON public.metric_entries TO authenticated;

-- 7. Seed System Metrics Catalog
INSERT INTO public.metrics (id, name, unit, data_type) VALUES
    ('weight', 'Weight', 'kg', 'numeric'),
    ('body_fat', 'Body Fat', '%', 'numeric'),
    ('calories', 'Calories', 'kcal', 'numeric'),
    ('protein', 'Protein', 'g', 'numeric'),
    ('water', 'Water', 'ml', 'numeric'),
    ('steps', 'Steps', 'count', 'numeric'),
    ('sleep', 'Sleep', 'hours', 'numeric'),
    ('workout', 'Workout', 'completed', 'boolean')
ON CONFLICT (id) DO NOTHING;

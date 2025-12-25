-- ============================================================
-- DAILY PATH PROGRESS TABLE MIGRATION
-- ============================================================
-- This migration adds the daily_path_progress table to track
-- individual task completions per path per day
-- 
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create daily_path_progress table
CREATE TABLE IF NOT EXISTS public.daily_path_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    path_id VARCHAR(100) NOT NULL, -- References player_identities.template_id (path identifier like 'tempering-warrior-trainee')
    date DATE NOT NULL, -- ISO date string (YYYY-MM-DD)
    tasks_total INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN tasks_total > 0 THEN ROUND((tasks_completed::NUMERIC / tasks_total::NUMERIC) * 100)
            ELSE 0
        END
    ) STORED,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED')),
    completed_task_ids JSONB NOT NULL DEFAULT '[]', -- Array of task IDs that are completed
    completed_subtask_ids JSONB NOT NULL DEFAULT '[]', -- Array of subtask IDs that are completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per path per day
    UNIQUE(user_id, path_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_path_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own path progress" ON public.daily_path_progress
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own path progress" ON public.daily_path_progress
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own path progress" ON public.daily_path_progress
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_path_progress_user_path_date 
    ON public.daily_path_progress(user_id, path_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_path_progress_date 
    ON public.daily_path_progress(date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_path_progress_user_date 
    ON public.daily_path_progress(user_id, date DESC);

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_daily_path_progress_updated_at ON public.daily_path_progress;

CREATE TRIGGER update_daily_path_progress_updated_at 
    BEFORE UPDATE ON public.daily_path_progress
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.daily_path_progress IS 'Daily path progress tracking with individual task completion status for persistence across sessions';

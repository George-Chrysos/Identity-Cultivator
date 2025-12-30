-- Cultivator Identity System - Supabase Schema (updated for 13-tier + 5 identity types)
-- PostgreSQL compatible schema for Supabase
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
-- 13-tier system used by the app
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'identity_tier') THEN
        CREATE TYPE identity_tier AS ENUM ('D','D+','C','C+','B','B+','A','A+','S','S+','SS','SS+','SSS');
    END IF;
END$$;

-- Identity types used by the app
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'identity_type') THEN
        CREATE TYPE identity_type AS ENUM ('CULTIVATOR','BODYSMITH','JOURNALIST','STRATEGIST');
    END IF;
END$$;

-- If enums already exist from an earlier version, add missing labels
DO $$
DECLARE v TEXT;
BEGIN
    FOR v IN SELECT unnest(ARRAY['D+','C+','B+','A+','S+','SS','SS+','SSS']) LOOP
        BEGIN
            EXECUTE format('ALTER TYPE identity_tier ADD VALUE IF NOT EXISTS %L', v);
        EXCEPTION WHEN duplicate_object THEN
            -- ignore
        END;
    END LOOP;

    FOR v IN SELECT unnest(ARRAY['CULTIVATOR','BODYSMITH','JOURNALIST','STRATEGIST']) LOOP
        BEGIN
            EXECUTE format('ALTER TYPE identity_type ADD VALUE IF NOT EXISTS %L', v);
        EXCEPTION WHEN duplicate_object THEN
        END;
    END LOOP;
END$$;

-- Migrate legacy PATHWEAVER to STRATEGIST and prevent future PATHWEAVER inserts
DO $$
BEGIN
    -- If PATHWEAVER label exists in type, remap existing rows to STRATEGIST
    IF EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'identity_type' AND e.enumlabel = 'PATHWEAVER'
    ) THEN
        -- Update identities table values from PATHWEAVER to STRATEGIST
        UPDATE public.identities SET identity_type = 'STRATEGIST'::identity_type
        WHERE identity_type::text = 'PATHWEAVER';
    END IF;
END$$;

-- Ensure only allowed identity types are used going forward (defensive)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'identities_identity_type_allowed'
    ) THEN
        ALTER TABLE public.identities
            ADD CONSTRAINT identities_identity_type_allowed
            CHECK (identity_type IN ('CULTIVATOR','BODYSMITH','JOURNALIST','STRATEGIST'));
    END IF;
END$$;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    tier identity_tier DEFAULT 'D',
    total_days_active INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- Identities table
CREATE TABLE IF NOT EXISTS public.identities (
    id UUID PRIMARY KEY DEFAULT COALESCE(uuid_generate_v4(), gen_random_uuid()),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    image_url VARCHAR(500),
    tier identity_tier DEFAULT 'D',
    level INT DEFAULT 1 CHECK (level >= 1 AND level <= 10),
    days_completed INT DEFAULT 0,
    required_days_per_level INT DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    last_completed_date TIMESTAMPTZ,
    identity_type identity_type DEFAULT 'CULTIVATOR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for identities
ALTER TABLE public.identities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for identities
CREATE POLICY "Users can view own identities" ON public.identities
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own identities" ON public.identities
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own identities" ON public.identities
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own identities" ON public.identities
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- User Progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT COALESCE(uuid_generate_v4(), gen_random_uuid()),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    identity_id UUID NOT NULL REFERENCES public.identities(id) ON DELETE CASCADE,
    days_completed INT DEFAULT 0,
    level INT DEFAULT 1,
    tier identity_tier DEFAULT 'D',
    completed_today BOOLEAN DEFAULT FALSE,
    last_updated_date TIMESTAMPTZ DEFAULT NOW(),
    streak_days INT DEFAULT 0,
    missed_days INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, identity_id)
);

-- Enable RLS for user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Task Completions (History) table
CREATE TABLE IF NOT EXISTS public.task_completions (
    id UUID PRIMARY KEY DEFAULT COALESCE(uuid_generate_v4(), gen_random_uuid()),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    identity_id UUID NOT NULL REFERENCES public.identities(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    reversed BOOLEAN DEFAULT FALSE,
    reversed_at TIMESTAMPTZ,
    UNIQUE(user_id, identity_id, completion_date)
);

-- Enable RLS for task_completions
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_completions
CREATE POLICY "Users can view own completions" ON public.task_completions
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own completions" ON public.task_completions
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own completions" ON public.task_completions
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Indexes for performance
CREATE INDEX idx_identities_user_active ON public.identities(user_id, is_active);
CREATE INDEX idx_identities_tier_level ON public.identities(tier, level);
CREATE INDEX idx_progress_date ON public.user_progress(last_updated_date);
CREATE INDEX idx_progress_streak ON public.user_progress(streak_days DESC);
-- Covering index for FK user_progress.identity_id -> identities.id
CREATE INDEX IF NOT EXISTS idx_user_progress_identity_id ON public.user_progress(identity_id);
-- Covering index for FK task_completions.identity_id -> identities.id
CREATE INDEX IF NOT EXISTS idx_task_completions_identity_id ON public.task_completions(identity_id);
CREATE INDEX idx_completions_date ON public.task_completions(completion_date DESC);
CREATE INDEX idx_completions_user ON public.task_completions(user_id, completion_date DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_identities_updated_at BEFORE UPDATE ON public.identities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, tier, total_days_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Cultivator'),
        'D',
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper Views

-- View for active identities with progress (run with caller's privileges)
CREATE OR REPLACE VIEW public.active_identities_with_progress
WITH (security_invoker = on) AS
SELECT 
    i.*,
    p.days_completed as progress_days,
    p.completed_today,
    p.streak_days,
    p.missed_days,
    p.last_updated_date as progress_updated_at
FROM public.identities i
LEFT JOIN public.user_progress p ON i.id = p.identity_id AND i.user_id = p.user_id
WHERE i.is_active = TRUE;

-- Grant access to authenticated users
GRANT SELECT ON active_identities_with_progress TO authenticated;

-- Daily Records Table
-- Stores historical snapshots of daily progress before reset
-- Used for Dawn Summary and progress analytics
CREATE TABLE IF NOT EXISTS public.daily_records (
    id UUID PRIMARY KEY DEFAULT COALESCE(uuid_generate_v4(), gen_random_uuid()),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- The day this record represents (YYYY-MM-DD)
    
    -- Path statistics (stored as JSONB for flexibility)
    path_stats JSONB NOT NULL DEFAULT '[]',
    
    -- Quest metrics
    quests_completed INT DEFAULT 0,
    
    -- Economy metrics
    total_coins_earned INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per day
    UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own daily records" ON public.daily_records
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own daily records" ON public.daily_records
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own daily records" ON public.daily_records
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Indexes for performance
CREATE INDEX idx_daily_records_user_date ON public.daily_records(user_id, date DESC);
CREATE INDEX idx_daily_records_date ON public.daily_records(date DESC);

-- ==================== QUESTS TABLE ====================
-- User-created quests with subtasks, custom rewards, and difficulty tracking

-- Quest difficulty enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quest_difficulty') THEN
        CREATE TYPE quest_difficulty AS ENUM ('Easy', 'Moderate', 'Difficult', 'Hard', 'Hell');
    END IF;
END$$;

-- Quest status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quest_status') THEN
        CREATE TYPE quest_status AS ENUM ('today', 'backlog', 'completed');
    END IF;
END$$;

-- Main quests table
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT COALESCE(uuid_generate_v4(), gen_random_uuid()),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    project VARCHAR(200) NOT NULL,
    date VARCHAR(20) NOT NULL, -- Format: "Jan 15" 
    hour VARCHAR(10), -- Format: "14:30" or "--:--"
    status quest_status DEFAULT 'today',
    difficulty quest_difficulty DEFAULT 'Easy',
    completed_at TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT FALSE,
    days_not_completed INT DEFAULT 0, -- Counter for difficulty escalation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quest subtasks table
CREATE TABLE IF NOT EXISTS public.quest_subtasks (
    id UUID PRIMARY KEY DEFAULT COALESCE(uuid_generate_v4(), gen_random_uuid()),
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quest custom rewards table
CREATE TABLE IF NOT EXISTS public.quest_custom_rewards (
    id UUID PRIMARY KEY DEFAULT COALESCE(uuid_generate_v4(), gen_random_uuid()),
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for quests
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_custom_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quests
CREATE POLICY "Users can view own quests" ON public.quests
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own quests" ON public.quests
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own quests" ON public.quests
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own quests" ON public.quests
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- RLS Policies for quest_subtasks (via quest ownership)
CREATE POLICY "Users can view own quest subtasks" ON public.quest_subtasks
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_subtasks.quest_id AND quests.user_id = (SELECT auth.uid()))
    );

CREATE POLICY "Users can insert own quest subtasks" ON public.quest_subtasks
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_subtasks.quest_id AND quests.user_id = (SELECT auth.uid()))
    );

CREATE POLICY "Users can update own quest subtasks" ON public.quest_subtasks
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_subtasks.quest_id AND quests.user_id = (SELECT auth.uid()))
    );

CREATE POLICY "Users can delete own quest subtasks" ON public.quest_subtasks
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_subtasks.quest_id AND quests.user_id = (SELECT auth.uid()))
    );

-- RLS Policies for quest_custom_rewards (via quest ownership)
CREATE POLICY "Users can view own quest rewards" ON public.quest_custom_rewards
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_custom_rewards.quest_id AND quests.user_id = (SELECT auth.uid()))
    );

CREATE POLICY "Users can insert own quest rewards" ON public.quest_custom_rewards
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_custom_rewards.quest_id AND quests.user_id = (SELECT auth.uid()))
    );

CREATE POLICY "Users can delete own quest rewards" ON public.quest_custom_rewards
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_custom_rewards.quest_id AND quests.user_id = (SELECT auth.uid()))
    );

-- Indexes for quests
CREATE INDEX idx_quests_user_id ON public.quests(user_id);
CREATE INDEX idx_quests_user_status ON public.quests(user_id, status);
CREATE INDEX idx_quests_user_date ON public.quests(user_id, date);
CREATE INDEX idx_quest_subtasks_quest_id ON public.quest_subtasks(quest_id);
CREATE INDEX idx_quest_rewards_quest_id ON public.quest_custom_rewards(quest_id);

-- Trigger for updated_at on quests
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON public.quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.quests IS 'User-created quests with progress tracking';
COMMENT ON TABLE public.quest_subtasks IS 'Subtasks for quests';
COMMENT ON TABLE public.quest_custom_rewards IS 'Custom rewards defined by users for quest completion';

COMMENT ON TABLE public.profiles IS 'Extended user profiles linked to Supabase auth';
COMMENT ON TABLE public.identities IS 'User cultivator identities with tier and level tracking';
COMMENT ON TABLE public.user_progress IS 'Daily progress tracking for each identity';
COMMENT ON TABLE public.task_completions IS 'Historical record of all task completions';
COMMENT ON TABLE public.daily_records IS 'Historical daily snapshots taken before midnight reset';

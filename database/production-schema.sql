-- ============================================================
-- IDENTITY CULTIVATOR - PRODUCTION SCHEMA
-- ============================================================
-- Run this in Supabase SQL Editor to set up a clean production database.
-- This schema matches the TypeScript types in src/types/database.ts
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Run the query
-- 
-- NOTE: This will DROP all existing tables. Only run on fresh/test DBs!
-- 
-- ⚠️ IMPORTANT: TEMPLATE TABLES ARE OPTIONAL
-- The app uses CLIENT-SIDE constants for game content:
--   - src/constants/temperingPath.ts (tasks, levels, rewards)
--   - src/constants/tickets.ts (shop items)
-- 
-- The database only stores PLAYER DATA:
--   - profiles (stats, currency)
--   - player_identities (unlocked paths, XP, streaks)  
--   - task_logs (completion history)
--   - player_inventory (purchased items)
--
-- Template tables exist for future flexibility (admin panel, dynamic content)
-- but are NOT required for the app to function.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP EXISTING TABLES (for clean slate)
-- ============================================================
DROP TABLE IF EXISTS public.player_inventory CASCADE;
DROP TABLE IF EXISTS public.task_logs CASCADE;
DROP TABLE IF EXISTS public.player_identities CASCADE;
DROP TABLE IF EXISTS public.task_templates CASCADE;
DROP TABLE IF EXISTS public.identity_templates CASCADE;
DROP TABLE IF EXISTS public.item_templates CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop old tables if they exist (from legacy schema)
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.identities CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.task_completions CASCADE;

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
-- User profile with stats and currency (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL DEFAULT 'Cultivator',
    coins INTEGER NOT NULL DEFAULT 100,
    stars INTEGER NOT NULL DEFAULT 5,
    body_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    mind_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    soul_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    will_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    final_score NUMERIC(10, 2) NOT NULL DEFAULT 0,
    rank_tier VARCHAR(10) NOT NULL DEFAULT 'F',
    timezone VARCHAR(100) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- 2. IDENTITY_TEMPLATES TABLE
-- ============================================================
-- Static identity definitions (game content)
CREATE TABLE public.identity_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    primary_stat VARCHAR(10) NOT NULL CHECK (primary_stat IN ('BODY', 'MIND', 'SOUL')),
    tier VARCHAR(10) NOT NULL DEFAULT 'D',
    unlock_cost_stars INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    parent_path_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Everyone can read templates (they're static game data)
ALTER TABLE public.identity_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view identity templates" ON public.identity_templates
    FOR SELECT USING (true);

-- ============================================================
-- 3. TASK_TEMPLATES TABLE
-- ============================================================
-- Static task definitions
CREATE TABLE public.task_templates (
    id VARCHAR(100) PRIMARY KEY,
    identity_template_id VARCHAR(100) NOT NULL REFERENCES public.identity_templates(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    target_stat VARCHAR(10) NOT NULL CHECK (target_stat IN ('BODY', 'MIND', 'SOUL')),
    base_points_reward NUMERIC(10, 2) NOT NULL DEFAULT 0,
    coin_reward INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    path_id VARCHAR(100),
    path_level INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Everyone can read templates
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view task templates" ON public.task_templates
    FOR SELECT USING (true);

-- Index for template lookups
CREATE INDEX idx_task_templates_identity ON public.task_templates(identity_template_id);

-- ============================================================
-- 4. PLAYER_IDENTITIES TABLE
-- ============================================================
-- User's active identity instances
CREATE TABLE public.player_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_id VARCHAR(100) NOT NULL REFERENCES public.identity_templates(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
    current_xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    will_contribution NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

-- RLS for player_identities
ALTER TABLE public.player_identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own identities" ON public.player_identities
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own identities" ON public.player_identities
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own identities" ON public.player_identities
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own identities" ON public.player_identities
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Index for user lookups
CREATE INDEX idx_player_identities_user ON public.player_identities(user_id, is_active);

-- ============================================================
-- 5. TASK_LOGS TABLE
-- ============================================================
-- Task completion history
CREATE TABLE public.task_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    identity_instance_id UUID NOT NULL REFERENCES public.player_identities(id) ON DELETE CASCADE,
    task_template_id VARCHAR(100) NOT NULL REFERENCES public.task_templates(id),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    stat_points_earned NUMERIC(10, 2) NOT NULL DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0
);

-- RLS for task_logs
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task logs" ON public.task_logs
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own task logs" ON public.task_logs
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Index for history lookups
CREATE INDEX idx_task_logs_user ON public.task_logs(user_id, completed_at DESC);
CREATE INDEX idx_task_logs_identity ON public.task_logs(identity_instance_id);

-- ============================================================
-- 6. ITEM_TEMPLATES TABLE
-- ============================================================
-- Shop item definitions
CREATE TABLE public.item_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    full_description TEXT,
    cost_coins INTEGER NOT NULL DEFAULT 0,
    cost_stars INTEGER DEFAULT 0,
    effect_type VARCHAR(50) NOT NULL,
    effect_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    icon VARCHAR(100),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    category VARCHAR(50) CHECK (category IN ('tickets', 'items', 'buffs')),
    cooldown_time INTEGER, -- Hours before ticket can be bought again
    base_inflation NUMERIC(10, 2), -- Inflation multiplier per active ticket
    active_duration INTEGER, -- Hours the luxury lasts once used
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Everyone can read items
ALTER TABLE public.item_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view item templates" ON public.item_templates
    FOR SELECT USING (true);

-- ============================================================
-- 7. PLAYER_INVENTORY TABLE
-- ============================================================
-- User's inventory
CREATE TABLE public.player_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_template_id VARCHAR(100) NOT NULL REFERENCES public.item_templates(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ticket-specific columns
    is_active BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    cooldown_duration INTEGER,
    UNIQUE(user_id, item_template_id)
);

-- RLS for player_inventory
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory" ON public.player_inventory
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own inventory" ON public.player_inventory
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own inventory" ON public.player_inventory
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own inventory" ON public.player_inventory
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Index for inventory lookups
CREATE INDEX idx_player_inventory_user ON public.player_inventory(user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_identities_updated_at 
    BEFORE UPDATE ON public.player_identities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, coins, stars, body_points, mind_points, soul_points, will_points, final_score, rank_tier, timezone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Cultivator'),
        100,  -- Starting coins
        5,    -- Starting stars (enough to buy first node)
        0,
        0,
        0,
        0,
        0,
        'F',
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC')
    );
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DATA: IDENTITY TEMPLATES (OPTIONAL)
-- ============================================================
-- NOTE: These are optional - the app reads from src/constants/temperingPath.ts
-- The app currently only supports the Tempering Warrior path (10 levels)

INSERT INTO public.identity_templates (id, name, primary_stat, tier, unlock_cost_stars, description, parent_path_id) VALUES
('tempering-warrior-trainee-lvl1', 'Tempering Lv.1 - The Awakening', 'BODY', 'D', 5, 'The first step of the Iron Way. Begin forging your body.', 'warrior-1-center'),
('tempering-warrior-trainee-lvl2', 'Tempering Lv.2 - Silent Accumulation', 'BODY', 'D', 0, 'Continue the tempering process. Build the foundation.', 'warrior-1-center'),
('tempering-warrior-trainee-lvl3', 'Tempering Lv.3 - The Pressure', 'BODY', 'D+', 0, 'Deepen your practice. Feel the resistance.', 'warrior-1-center'),
('tempering-warrior-trainee-lvl4', 'Tempering Lv.4 - The Breaking Point', 'BODY', 'D+', 0, 'The body grows stronger through adversity.', 'warrior-1-center'),
('tempering-warrior-trainee-lvl5', 'Tempering Lv.5 - The Threshold', 'BODY', 'C', 0, 'Halfway through the tempering. A new realm emerges.', 'warrior-1-center'),
('tempering-warrior-trainee-lvl6', 'Tempering Lv.6 - The Compression', 'BODY', 'C', 0, 'Advanced techniques unlock. Compress the vessel.', 'warrior-1-center'),
('tempering-warrior-trainee-lvl7', 'Tempering Lv.7 - The Refinement', 'BODY', 'C+', 0, 'The frame solidifies. Impurities burn away.', 'warrior-1-center'),
('tempering-warrior-trainee-lvl8', 'Tempering Lv.8 - The Crucible', 'BODY', 'C+', 0, 'Near mastery. The final forge awaits.', 'warrior-1-center'),
('tempering-warrior-trainee-lvl9', 'Tempering Lv.9 - The Transformation', 'BODY', 'B', 0, 'Final preparations for Iron Tissue cultivation.', 'warrior-1-center'),
('tempering-warrior-trainee-lvl10', 'Tempering Lv.10 - Iron Tissue', 'BODY', 'B', 0, 'Complete the tempering. Achieve Iron Tissue rank.', 'warrior-1-center')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA: TASK TEMPLATES (ALL 50 TASKS - 5 per level × 10 levels)
-- ============================================================
-- NOTE: These are optional - the app reads from src/constants/temperingPath.ts
-- Each level has 5 gates: Rooting, Foundation, Core, Flow, Breath

INSERT INTO public.task_templates (id, identity_template_id, name, target_stat, base_points_reward, coin_reward, xp_reward, description, path_id, path_level) VALUES
-- Level 1 Tasks (The Awakening)
('tempering-lvl1-rooting', 'tempering-warrior-trainee-lvl1', 'The Rooting', 'BODY', 0.04, 30, 8, 'Zhan Zhuang: 3 Minutes - Crown pulling up, chest sinking, back rounding.', 'tempering-warrior-trainee', 1),
('tempering-lvl1-foundation', 'tempering-warrior-trainee-lvl1', 'The Foundation', 'BODY', 0.04, 30, 8, 'Wall Sit: 1 Set × 30 Seconds - Crush the lower back against the wall.', 'tempering-warrior-trainee', 1),
('tempering-lvl1-core', 'tempering-warrior-trainee-lvl1', 'The Core Link', 'BODY', 0.04, 30, 8, 'Dead Bug: 1 Set × 5 Reps (Slow) - Spinal glue.', 'tempering-warrior-trainee', 1),
('tempering-lvl1-flow', 'tempering-warrior-trainee-lvl1', 'The Flow', 'BODY', 0.04, 30, 8, '90/90 Hip Switch: 1 Set × 10 Reps - Open the Kua.', 'tempering-warrior-trainee', 1),
('tempering-lvl1-breath', 'tempering-warrior-trainee-lvl1', 'The Breath', 'BODY', 0.04, 30, 8, 'Reverse Breathing: 5 Cycles - Inhale (Belly in) / Exhale (Belly out).', 'tempering-warrior-trainee', 1),

-- Level 2 Tasks (Silent Accumulation)
('tempering-lvl2-rooting', 'tempering-warrior-trainee-lvl2', 'The Rooting', 'BODY', 0.06, 40, 8, 'Zhan Zhuang: 5 Minutes - Deepen the roots.', 'tempering-warrior-trainee', 2),
('tempering-lvl2-foundation', 'tempering-warrior-trainee-lvl2', 'The Foundation', 'BODY', 0.06, 40, 8, 'Wall Sit: 1 Set × 45 Seconds - Reinforce foundation.', 'tempering-warrior-trainee', 2),
('tempering-lvl2-core', 'tempering-warrior-trainee-lvl2', 'The Core Link', 'BODY', 0.06, 40, 8, 'Dead Bug: 2 Sets × 5 Reps - Compress core.', 'tempering-warrior-trainee', 2),
('tempering-lvl2-flow', 'tempering-warrior-trainee-lvl2', 'The Flow', 'BODY', 0.06, 40, 8, '90/90 Hip Switch: 2 Sets × 10 Reps - Refine flow.', 'tempering-warrior-trainee', 2),
('tempering-lvl2-breath', 'tempering-warrior-trainee-lvl2', 'The Breath', 'BODY', 0.06, 40, 8, 'Reverse Breathing: 10 Cycles - Control breath.', 'tempering-warrior-trainee', 2),

-- Level 3 Tasks (The Pressure)
('tempering-lvl3-rooting', 'tempering-warrior-trainee-lvl3', 'The Rooting', 'BODY', 0.08, 50, 8, 'Zhan Zhuang: 8 Minutes - The Pressure builds.', 'tempering-warrior-trainee', 3),
('tempering-lvl3-foundation', 'tempering-warrior-trainee-lvl3', 'The Foundation', 'BODY', 0.08, 50, 8, 'Wall Sit: 2 Sets × 30 Seconds - Strengthen base.', 'tempering-warrior-trainee', 3),
('tempering-lvl3-core', 'tempering-warrior-trainee-lvl3', 'The Core Link', 'BODY', 0.08, 50, 8, 'Dead Bug: 2 Sets × 8 Reps - Link the frame.', 'tempering-warrior-trainee', 3),
('tempering-lvl3-flow', 'tempering-warrior-trainee-lvl3', 'The Flow', 'BODY', 0.08, 50, 8, '90/90 Hip Switch: 3 Sets × 10 Reps - Expand flow.', 'tempering-warrior-trainee', 3),
('tempering-lvl3-breath', 'tempering-warrior-trainee-lvl3', 'The Breath', 'BODY', 0.08, 50, 8, 'Reverse Breathing: 15 Cycles - Deepen breath.', 'tempering-warrior-trainee', 3),

-- Level 4 Tasks (The Breaking Point)
('tempering-lvl4-rooting', 'tempering-warrior-trainee-lvl4', 'The Rooting', 'BODY', 0.10, 60, 8, 'Zhan Zhuang: 10 Minutes - Breaking point approaches.', 'tempering-warrior-trainee', 4),
('tempering-lvl4-foundation', 'tempering-warrior-trainee-lvl4', 'The Foundation', 'BODY', 0.10, 60, 8, 'Wall Sit: 2 Sets × 45 Seconds - Test the foundation.', 'tempering-warrior-trainee', 4),
('tempering-lvl4-core', 'tempering-warrior-trainee-lvl4', 'The Core Link', 'BODY', 0.10, 60, 8, 'Dead Bug: 3 Sets × 8 Reps - Solidify the link.', 'tempering-warrior-trainee', 4),
('tempering-lvl4-flow', 'tempering-warrior-trainee-lvl4', 'The Flow', 'BODY', 0.10, 60, 8, '90/90 Hip Switch: 3 Sets × 15 Reps - Fluid movement.', 'tempering-warrior-trainee', 4),
('tempering-lvl4-breath', 'tempering-warrior-trainee-lvl4', 'The Breath', 'BODY', 0.10, 60, 8, 'Reverse Breathing: 20 Cycles - Master the rhythm.', 'tempering-warrior-trainee', 4),

-- Level 5 Tasks (The Threshold)
('tempering-lvl5-rooting', 'tempering-warrior-trainee-lvl5', 'The Rooting', 'BODY', 0.12, 70, 8, 'Zhan Zhuang: 12 Minutes - Cross the threshold.', 'tempering-warrior-trainee', 5),
('tempering-lvl5-foundation', 'tempering-warrior-trainee-lvl5', 'The Foundation', 'BODY', 0.12, 70, 8, 'Wall Sit: 3 Sets × 30 Seconds - Unshakeable base.', 'tempering-warrior-trainee', 5),
('tempering-lvl5-core', 'tempering-warrior-trainee-lvl5', 'The Core Link', 'BODY', 0.12, 70, 8, 'Dead Bug: 3 Sets × 10 Reps - Iron core.', 'tempering-warrior-trainee', 5),
('tempering-lvl5-flow', 'tempering-warrior-trainee-lvl5', 'The Flow', 'BODY', 0.12, 70, 8, '90/90 Hip Switch: 4 Sets × 15 Reps - Seamless flow.', 'tempering-warrior-trainee', 5),
('tempering-lvl5-breath', 'tempering-warrior-trainee-lvl5', 'The Breath', 'BODY', 0.12, 70, 8, 'Reverse Breathing: 25 Cycles - Breath mastery.', 'tempering-warrior-trainee', 5),

-- Level 6 Tasks (The Compression)
('tempering-lvl6-rooting', 'tempering-warrior-trainee-lvl6', 'The Rooting', 'BODY', 0.14, 80, 8, 'Zhan Zhuang: 15 Minutes - Compress the vessel.', 'tempering-warrior-trainee', 6),
('tempering-lvl6-foundation', 'tempering-warrior-trainee-lvl6', 'The Foundation', 'BODY', 0.14, 80, 8, 'Wall Sit: 3 Sets × 45 Seconds - Foundation of steel.', 'tempering-warrior-trainee', 6),
('tempering-lvl6-core', 'tempering-warrior-trainee-lvl6', 'The Core Link', 'BODY', 0.14, 80, 8, 'Dead Bug: 4 Sets × 10 Reps - Compressed core.', 'tempering-warrior-trainee', 6),
('tempering-lvl6-flow', 'tempering-warrior-trainee-lvl6', 'The Flow', 'BODY', 0.14, 80, 8, '90/90 Hip Switch: 4 Sets × 20 Reps - Advanced flow.', 'tempering-warrior-trainee', 6),
('tempering-lvl6-breath', 'tempering-warrior-trainee-lvl6', 'The Breath', 'BODY', 0.14, 80, 8, 'Reverse Breathing: 30 Cycles - Deep compression.', 'tempering-warrior-trainee', 6),

-- Level 7 Tasks (The Refinement)
('tempering-lvl7-rooting', 'tempering-warrior-trainee-lvl7', 'The Rooting', 'BODY', 0.16, 90, 8, 'Zhan Zhuang: 18 Minutes - Refine the vessel.', 'tempering-warrior-trainee', 7),
('tempering-lvl7-foundation', 'tempering-warrior-trainee-lvl7', 'The Foundation', 'BODY', 0.16, 90, 8, 'Wall Sit: 3 Sets × 60 Seconds - Immovable.', 'tempering-warrior-trainee', 7),
('tempering-lvl7-core', 'tempering-warrior-trainee-lvl7', 'The Core Link', 'BODY', 0.16, 90, 8, 'Dead Bug: 4 Sets × 12 Reps - Refined core.', 'tempering-warrior-trainee', 7),
('tempering-lvl7-flow', 'tempering-warrior-trainee-lvl7', 'The Flow', 'BODY', 0.16, 90, 8, '90/90 Hip Switch: 5 Sets × 20 Reps - Liquid movement.', 'tempering-warrior-trainee', 7),
('tempering-lvl7-breath', 'tempering-warrior-trainee-lvl7', 'The Breath', 'BODY', 0.16, 90, 8, 'Reverse Breathing: 35 Cycles - Pure breath.', 'tempering-warrior-trainee', 7),

-- Level 8 Tasks (The Crucible)
('tempering-lvl8-rooting', 'tempering-warrior-trainee-lvl8', 'The Rooting', 'BODY', 0.18, 100, 8, 'Zhan Zhuang: 20 Minutes - The crucible.', 'tempering-warrior-trainee', 8),
('tempering-lvl8-foundation', 'tempering-warrior-trainee-lvl8', 'The Foundation', 'BODY', 0.18, 100, 8, 'Wall Sit: 4 Sets × 45 Seconds - Forged base.', 'tempering-warrior-trainee', 8),
('tempering-lvl8-core', 'tempering-warrior-trainee-lvl8', 'The Core Link', 'BODY', 0.18, 100, 8, 'Dead Bug: 5 Sets × 12 Reps - Diamond core.', 'tempering-warrior-trainee', 8),
('tempering-lvl8-flow', 'tempering-warrior-trainee-lvl8', 'The Flow', 'BODY', 0.18, 100, 8, '90/90 Hip Switch: 5 Sets × 25 Reps - Effortless.', 'tempering-warrior-trainee', 8),
('tempering-lvl8-breath', 'tempering-warrior-trainee-lvl8', 'The Breath', 'BODY', 0.18, 100, 8, 'Reverse Breathing: 40 Cycles - Automatic breath.', 'tempering-warrior-trainee', 8),

-- Level 9 Tasks (The Transformation)
('tempering-lvl9-rooting', 'tempering-warrior-trainee-lvl9', 'The Rooting', 'BODY', 0.20, 110, 8, 'Zhan Zhuang: 25 Minutes - Transformation begins.', 'tempering-warrior-trainee', 9),
('tempering-lvl9-foundation', 'tempering-warrior-trainee-lvl9', 'The Foundation', 'BODY', 0.20, 110, 8, 'Wall Sit: 4 Sets × 60 Seconds - Iron foundation.', 'tempering-warrior-trainee', 9),
('tempering-lvl9-core', 'tempering-warrior-trainee-lvl9', 'The Core Link', 'BODY', 0.20, 110, 8, 'Dead Bug: 5 Sets × 15 Reps - Unified core.', 'tempering-warrior-trainee', 9),
('tempering-lvl9-flow', 'tempering-warrior-trainee-lvl9', 'The Flow', 'BODY', 0.20, 110, 8, '90/90 Hip Switch: 6 Sets × 25 Reps - Transcendent.', 'tempering-warrior-trainee', 9),
('tempering-lvl9-breath', 'tempering-warrior-trainee-lvl9', 'The Breath', 'BODY', 0.20, 110, 8, 'Reverse Breathing: 45 Cycles - One with breath.', 'tempering-warrior-trainee', 9),

-- Level 10 Tasks (Iron Tissue)
('tempering-lvl10-rooting', 'tempering-warrior-trainee-lvl10', 'The Rooting', 'BODY', 0.22, 120, 8, 'Zhan Zhuang: 30 Minutes - Iron Tissue achieved.', 'tempering-warrior-trainee', 10),
('tempering-lvl10-foundation', 'tempering-warrior-trainee-lvl10', 'The Foundation', 'BODY', 0.22, 120, 8, 'Wall Sit: 5 Sets × 60 Seconds - Unbreakable.', 'tempering-warrior-trainee', 10),
('tempering-lvl10-core', 'tempering-warrior-trainee-lvl10', 'The Core Link', 'BODY', 0.22, 120, 8, 'Dead Bug: 6 Sets × 15 Reps - Perfect integration.', 'tempering-warrior-trainee', 10),
('tempering-lvl10-flow', 'tempering-warrior-trainee-lvl10', 'The Flow', 'BODY', 0.22, 120, 8, '90/90 Hip Switch: 6 Sets × 30 Reps - Mastery.', 'tempering-warrior-trainee', 10),
('tempering-lvl10-breath', 'tempering-warrior-trainee-lvl10', 'The Breath', 'BODY', 0.22, 120, 8, 'Reverse Breathing: 50 Cycles - Breath immortality.', 'tempering-warrior-trainee', 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA: SHOP ITEMS (ALL 16 TICKETS)
-- ============================================================
-- NOTE: These are optional - the app reads from src/constants/tickets.ts
-- Include these if you want database-driven shop content in the future

INSERT INTO public.item_templates (
  id, name, description, cost_coins, effect_type, effect_value, is_available, 
  category, short_description, full_description, cooldown_time, base_inflation, icon, created_at
) VALUES
  ('ticket-001', '15 Min Comic Reading', 'A brief delve into a graphic world. Good for micro-breaks.', 100, 'luxury', 1, true, 'tickets', 'Quick escape.', 'A brief delve into a graphic world. Good for micro-breaks.', 24, 0.5, 'BookOpen', NOW()),
  ('ticket-002', 'Eat Sweets', 'Indulge in refined sugars. Warning: High dopamine cost.', 250, 'luxury', 1, true, 'tickets', 'Sugar rush.', 'Indulge in refined sugars. Warning: High dopamine cost.', 48, 1.0, 'Candy', NOW()),
  ('ticket-003', '1 Hour Media', 'Youtube, Netflix, or Social Media. One hour of external projection.', 400, 'luxury', 1, true, 'tickets', 'Digital immersion.', 'Youtube, Netflix, or Social Media. One hour of external projection.', 24, 1.5, 'PlayCircle', NOW()),
  ('ticket-004', 'The Cloud Rain', 'Sexual release. High cost to Jing/Vital essence. Use sparingly.', 1200, 'luxury', 1, true, 'tickets', 'Essence dispersion.', 'Sexual release. High cost to Jing/Vital essence. Use sparingly to maintain cultivation base.', 168, 3.0, 'CloudRain', NOW()),
  ('ticket-005', 'Order Takeout', 'Avoid cooking. Trade gold for convenience and processed calories.', 600, 'luxury', 1, true, 'tickets', 'Lazy nutrition.', 'Avoid cooking. Trade gold for convenience and processed calories.', 48, 1.0, 'Pizza', NOW()),
  ('ticket-006', 'Meet with Friend(s)', 'Socializing in a group. External energy exchange.', 200, 'luxury', 1, true, 'tickets', 'External Yang connection.', 'Socializing in a group. External energy exchange.', 12, 0.25, 'Users', NOW()),
  ('ticket-007', 'Visit Friends', 'One-on-one social connection. Strengthening external ties.', 200, 'luxury', 1, true, 'tickets', 'Deep social bond.', 'One-on-one social connection. Strengthening external ties.', 12, 0.25, 'Home', NOW()),
  ('ticket-008', 'Cinema / Theater', 'Immersive external story. High-level disassociation.', 800, 'luxury', 1, true, 'tickets', 'Grand spectacle.', 'Immersive external story. High-level disassociation.', 72, 0.5, 'Film', NOW()),
  ('ticket-009', 'Dine Outside', 'Full service meal. The ultimate luxury for a successful week of grind.', 1000, 'luxury', 1, true, 'tickets', 'Culinary indulgence.', 'Full service meal. The ultimate luxury for a successful week of grind.', 72, 0.75, 'Utensils', NOW()),
  ('ticket-010', 'Video Games (1 Hour)', 'Active digital engagement. Drains focus but provides high stimulation.', 250, 'luxury', 1, true, 'tickets', 'Interactive escapism.', 'Active digital engagement. Drains focus but provides high stimulation.', 24, 1.0, 'Gamepad', NOW()),
  ('ticket-011', 'Online Window Shopping', 'Browsing without intent. A high-cost distraction for the mind.', 200, 'luxury', 1, true, 'tickets', 'Mental clutter.', 'Browsing without intent. A high-cost distraction for the mind.', 48, 1.5, 'ShoppingBag', NOW()),
  ('ticket-012', 'Soda / Energy Drink', 'Caffeine and sugar hit. Temporary energy at the cost of long-term stability.', 150, 'luxury', 1, true, 'tickets', 'Liquid spark.', 'Caffeine and sugar hit. Temporary energy at the cost of long-term stability.', 24, 1.0, 'Coffee', NOW()),
  ('ticket-013', 'Fancy Coffee / Boba', 'High-priced liquid dopamine. A social status vice.', 250, 'luxury', 1, true, 'tickets', 'Aesthetic consumption.', 'High-priced liquid dopamine. A social status vice.', 24, 0.75, 'CupSoda', NOW()),
  ('ticket-014', 'Alcoholic Drink (1 Unit)', 'Dulled awareness and inhibited presence. Lowers the frequency of the vessel.', 350, 'luxury', 1, true, 'tickets', 'Numbing the senses.', 'Dulled awareness and inhibited presence. Lowers the frequency of the vessel.', 24, 2.0, 'Wine', NOW()),
  ('ticket-015', 'Vaping / Smoke Hit', 'Immediate nervous system hit. Highly damaging to the breath gate.', 150, 'luxury', 1, true, 'tickets', 'Toxic breath.', 'Immediate nervous system hit. Highly damaging to the breath gate.', 24, 2.5, 'Cigarette', NOW()),
  ('ticket-016', 'Gossip / Venting Session', 'Talking about others or complaining. Drains spiritual pressure.', 200, 'luxury', 1, true, 'tickets', 'Verbal energy leak.', 'Talking about others or complaining. Drains spiritual pressure and presence.', 24, 1.0, 'MessageCircle', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify the schema is correct:

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check profiles columns
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';

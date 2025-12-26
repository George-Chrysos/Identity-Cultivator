-- ============================================================
-- PATH TABLES MIGRATION
-- ============================================================
-- This migration adds the path-based tables required by pathSyncService.ts
-- These tables store the normalized path data from temperingPath.ts constants
-- Run this in Supabase SQL Editor AFTER the production-schema.sql
--
-- Tables created:
-- 1. paths - Main path metadata (e.g., Tempering Warrior)
-- 2. path_levels - Level configurations per path (levels 1-10)
-- 3. gates - Tasks/gates within each level (5 gates per level)
-- 4. gate_subtasks - Subtasks within each gate
-- 5. trials - Trial info per level
-- ============================================================

-- ============================================================
-- 1. PATHS TABLE (Main path metadata)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.paths (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    primary_stat VARCHAR(10) NOT NULL CHECK (primary_stat IN ('BODY', 'MIND', 'SOUL')),
    tier VARCHAR(10) NOT NULL DEFAULT 'D',
    max_level INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Everyone can read paths (static game data)
ALTER TABLE public.paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view paths" ON public.paths
    FOR SELECT USING (true);

-- Authenticated users can manage paths (for client-side sync)
-- Using auth.uid() IS NOT NULL to check if user is authenticated
CREATE POLICY "Authenticated users can insert paths" ON public.paths
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update paths" ON public.paths
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete paths" ON public.paths
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 2. PATH_LEVELS TABLE (Level configurations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.path_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id VARCHAR(100) NOT NULL REFERENCES public.paths(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
    subtitle VARCHAR(200),
    xp_to_level_up INTEGER NOT NULL DEFAULT 100,
    days_required INTEGER NOT NULL DEFAULT 3,
    main_stat_limit NUMERIC(10, 2) DEFAULT 1.0,
    gate_stat_cap NUMERIC(10, 2) DEFAULT 0.2,
    base_coins INTEGER NOT NULL DEFAULT 30,
    base_stat_points NUMERIC(10, 2) NOT NULL DEFAULT 0.04,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(path_id, level)
);

-- RLS: Everyone can read path levels
ALTER TABLE public.path_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view path_levels" ON public.path_levels
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert path_levels" ON public.path_levels
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update path_levels" ON public.path_levels
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete path_levels" ON public.path_levels
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Index for path lookups
CREATE INDEX IF NOT EXISTS idx_path_levels_path ON public.path_levels(path_id, level);

-- ============================================================
-- 3. GATES TABLE (Tasks/gates within levels)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_level_id UUID NOT NULL REFERENCES public.path_levels(id) ON DELETE CASCADE,
    gate_name VARCHAR(50) NOT NULL, -- rooting, foundation, core, flow, breath, sealing
    task_name VARCHAR(200) NOT NULL,
    focus_description TEXT,
    task_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Everyone can read gates
ALTER TABLE public.gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gates" ON public.gates
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert gates" ON public.gates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update gates" ON public.gates
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete gates" ON public.gates
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Index for level lookups
CREATE INDEX IF NOT EXISTS idx_gates_level ON public.gates(path_level_id, task_order);

-- ============================================================
-- 4. GATE_SUBTASKS TABLE (Subtasks within gates)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gate_subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_id UUID NOT NULL REFERENCES public.gates(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    focus_description TEXT,
    subtask_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Everyone can read subtasks
ALTER TABLE public.gate_subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gate_subtasks" ON public.gate_subtasks
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert gate_subtasks" ON public.gate_subtasks
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete gate_subtasks" ON public.gate_subtasks
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Index for gate lookups
CREATE INDEX IF NOT EXISTS idx_gate_subtasks_gate ON public.gate_subtasks(gate_id, subtask_order);

-- ============================================================
-- 5. TRIALS TABLE (Trial info per level)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_level_id UUID NOT NULL REFERENCES public.path_levels(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tasks_description TEXT,
    focus_description TEXT,
    reward_coins INTEGER NOT NULL DEFAULT 0,
    reward_stars INTEGER NOT NULL DEFAULT 0,
    reward_stat_points NUMERIC(10, 2) NOT NULL DEFAULT 0,
    reward_item VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(path_level_id)
);

-- RLS: Everyone can read trials
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trials" ON public.trials
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert trials" ON public.trials
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update trials" ON public.trials
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete trials" ON public.trials
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Index for level lookups
CREATE INDEX IF NOT EXISTS idx_trials_level ON public.trials(path_level_id);

-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================
CREATE TRIGGER update_paths_updated_at 
    BEFORE UPDATE ON public.paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_path_levels_updated_at 
    BEFORE UPDATE ON public.path_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify the tables were created:

SELECT 'Path tables created successfully!' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('paths', 'path_levels', 'gates', 'gate_subtasks', 'trials')
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('paths', 'path_levels', 'gates', 'gate_subtasks', 'trials');

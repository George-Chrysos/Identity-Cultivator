-- ============================================================
-- PATHS TABLE - Game Content Migration
-- ============================================================
-- This table stores path definitions (Tempering, etc.)
-- Replaces client-side constants for flexibility and live updates
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Paste this file
-- 4. Run the query
-- ============================================================

-- ============================================================
-- 1. PATHS TABLE
-- ============================================================
-- Main path definitions (Tempering, Scholar, etc.)
CREATE TABLE IF NOT EXISTS public.paths (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    primary_stat VARCHAR(10) NOT NULL CHECK (primary_stat IN ('BODY', 'MIND', 'SOUL', 'WILL')),
    tier VARCHAR(10) NOT NULL DEFAULT 'D',
    max_level INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Everyone can read paths (they're static game data)
ALTER TABLE public.paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read paths" ON public.paths
    FOR SELECT USING (true);

-- ============================================================
-- 2. PATH_LEVELS TABLE
-- ============================================================
-- Level configurations for each path
CREATE TABLE IF NOT EXISTS public.path_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id VARCHAR(100) NOT NULL REFERENCES public.paths(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    subtitle VARCHAR(300),
    xp_to_level_up INTEGER NOT NULL,
    days_required INTEGER NOT NULL,
    main_stat_limit NUMERIC(10, 2),
    gate_stat_cap NUMERIC(10, 2),
    base_coins INTEGER NOT NULL,
    base_stat_points INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(path_id, level)
);

ALTER TABLE public.path_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read path_levels" ON public.path_levels
    FOR SELECT USING (true);

-- ============================================================
-- 3. GATES TABLE
-- ============================================================
-- Task gates (Rooting, Foundation, Core, Flow, Breath, etc.)
CREATE TABLE IF NOT EXISTS public.gates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_level_id UUID NOT NULL REFERENCES public.path_levels(id) ON DELETE CASCADE,
    gate_name VARCHAR(50) NOT NULL,
    task_name VARCHAR(200) NOT NULL,
    focus_description TEXT,
    task_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gates" ON public.gates
    FOR SELECT USING (true);

-- ============================================================
-- 4. SUBTASKS TABLE
-- ============================================================
-- Individual exercises/tasks within a gate
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gate_id UUID NOT NULL REFERENCES public.gates(id) ON DELETE CASCADE,
    name VARCHAR(300) NOT NULL,
    focus_description TEXT,
    subtask_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subtasks" ON public.subtasks
    FOR SELECT USING (true);

-- ============================================================
-- 5. TRIALS TABLE
-- ============================================================
-- End-of-level trials/challenges
CREATE TABLE IF NOT EXISTS public.trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_level_id UUID NOT NULL REFERENCES public.path_levels(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tasks_description TEXT,
    focus_description TEXT,
    reward_coins INTEGER NOT NULL,
    reward_stars INTEGER NOT NULL,
    reward_stat_points INTEGER NOT NULL,
    reward_item VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trials" ON public.trials
    FOR SELECT USING (true);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_path_levels_path_id ON public.path_levels(path_id);
CREATE INDEX IF NOT EXISTS idx_path_levels_level ON public.path_levels(level);
CREATE INDEX IF NOT EXISTS idx_gates_path_level_id ON public.gates(path_level_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_gate_id ON public.subtasks(gate_id);
CREATE INDEX IF NOT EXISTS idx_trials_path_level_id ON public.trials(path_level_id);

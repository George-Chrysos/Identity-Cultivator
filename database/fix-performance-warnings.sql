-- ============================================================
-- FIX SUPABASE PERFORMANCE WARNINGS
-- ============================================================
-- Run this in Supabase SQL Editor to fix RLS performance issues
-- 
-- Issues fixed:
-- 1. auth_rls_initplan: Replace auth.<function>() with (select auth.<function>())
-- 2. multiple_permissive_policies: Remove duplicate policies
-- 3. duplicate_index: Remove duplicate index on trials table
-- ============================================================

BEGIN;

-- ============================================================
-- 1. FIX AUTH RLS INITPLAN WARNINGS
-- ============================================================
-- These policies call auth.<function>() without wrapping in (select ...),
-- causing the function to be re-evaluated for each row.
-- Fix: Replace auth.uid() with (select auth.uid())

-- =========================
-- TABLE: paths
-- =========================

-- Drop and recreate INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert paths" ON public.paths;
CREATE POLICY "Authenticated users can insert paths" ON public.paths
    FOR INSERT
    WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Drop and recreate UPDATE policy  
DROP POLICY IF EXISTS "Authenticated users can update paths" ON public.paths;
CREATE POLICY "Authenticated users can update paths" ON public.paths
    FOR UPDATE
    USING ((select auth.uid()) IS NOT NULL);

-- Drop and recreate DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete paths" ON public.paths;
CREATE POLICY "Authenticated users can delete paths" ON public.paths
    FOR DELETE
    USING ((select auth.uid()) IS NOT NULL);

-- =========================
-- TABLE: path_levels
-- =========================

-- Drop and recreate INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert path_levels" ON public.path_levels;
CREATE POLICY "Authenticated users can insert path_levels" ON public.path_levels
    FOR INSERT
    WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Drop and recreate UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update path_levels" ON public.path_levels;
CREATE POLICY "Authenticated users can update path_levels" ON public.path_levels
    FOR UPDATE
    USING ((select auth.uid()) IS NOT NULL);

-- Drop and recreate DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete path_levels" ON public.path_levels;
CREATE POLICY "Authenticated users can delete path_levels" ON public.path_levels
    FOR DELETE
    USING ((select auth.uid()) IS NOT NULL);

-- =========================
-- TABLE: gates
-- =========================

-- Drop and recreate INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert gates" ON public.gates;
CREATE POLICY "Authenticated users can insert gates" ON public.gates
    FOR INSERT
    WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Drop and recreate UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update gates" ON public.gates;
CREATE POLICY "Authenticated users can update gates" ON public.gates
    FOR UPDATE
    USING ((select auth.uid()) IS NOT NULL);

-- Drop and recreate DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete gates" ON public.gates;
CREATE POLICY "Authenticated users can delete gates" ON public.gates
    FOR DELETE
    USING ((select auth.uid()) IS NOT NULL);

-- =========================
-- TABLE: gate_subtasks
-- =========================

-- Drop and recreate INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert gate_subtasks" ON public.gate_subtasks;
CREATE POLICY "Authenticated users can insert gate_subtasks" ON public.gate_subtasks
    FOR INSERT
    WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Drop and recreate DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete gate_subtasks" ON public.gate_subtasks;
CREATE POLICY "Authenticated users can delete gate_subtasks" ON public.gate_subtasks
    FOR DELETE
    USING ((select auth.uid()) IS NOT NULL);

-- =========================
-- TABLE: trials
-- =========================

-- Drop and recreate INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert trials" ON public.trials;
CREATE POLICY "Authenticated users can insert trials" ON public.trials
    FOR INSERT
    WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Drop and recreate UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update trials" ON public.trials;
CREATE POLICY "Authenticated users can update trials" ON public.trials
    FOR UPDATE
    USING ((select auth.uid()) IS NOT NULL);

-- Drop and recreate DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete trials" ON public.trials;
CREATE POLICY "Authenticated users can delete trials" ON public.trials
    FOR DELETE
    USING ((select auth.uid()) IS NOT NULL);


-- ============================================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES
-- ============================================================
-- Tables have duplicate SELECT/INSERT/UPDATE policies for the same action.
-- Fix: Remove the duplicate policies, keeping the most descriptive one.

-- =========================
-- TABLE: daily_path_progress
-- =========================
-- Duplicates: "Users can X own daily path progress" AND "Users can X own path progress"
-- Keep: "Users can X own path progress" (shorter, cleaner naming)

DROP POLICY IF EXISTS "Users can insert own daily path progress" ON public.daily_path_progress;
DROP POLICY IF EXISTS "Users can view own daily path progress" ON public.daily_path_progress;
DROP POLICY IF EXISTS "Users can update own daily path progress" ON public.daily_path_progress;

-- =========================
-- TABLE: gates
-- =========================
-- Duplicates: "Anyone can read gates" AND "Anyone can view gates"
-- Keep: "Anyone can view gates"

DROP POLICY IF EXISTS "Anyone can read gates" ON public.gates;

-- =========================
-- TABLE: path_levels
-- =========================
-- Duplicates: "Anyone can read path_levels" AND "Anyone can view path_levels"
-- Keep: "Anyone can view path_levels"

DROP POLICY IF EXISTS "Anyone can read path_levels" ON public.path_levels;

-- =========================
-- TABLE: paths
-- =========================
-- Duplicates: "Anyone can read paths" AND "Anyone can view paths"
-- Keep: "Anyone can view paths"

DROP POLICY IF EXISTS "Anyone can read paths" ON public.paths;

-- =========================
-- TABLE: trials
-- =========================
-- Duplicates: "Anyone can read trials" AND "Anyone can view trials"
-- Keep: "Anyone can view trials"

DROP POLICY IF EXISTS "Anyone can read trials" ON public.trials;


-- ============================================================
-- 3. FIX DUPLICATE INDEX
-- ============================================================
-- Table trials has identical indexes: idx_trials_level and idx_trials_path_level_id
-- Keep: idx_trials_path_level_id (more descriptive name)

DROP INDEX IF EXISTS idx_trials_level;


-- ============================================================
-- COMMIT TRANSACTION
-- ============================================================
COMMIT;


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify the fixes were applied:

-- Check RLS policies on affected tables
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('paths', 'path_levels', 'gates', 'gate_subtasks', 'trials', 'daily_path_progress')
ORDER BY tablename, cmd;

-- Check for duplicate indexes on trials
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'trials';

-- Verify no multiple permissive policies for same action
SELECT tablename, cmd, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('paths', 'path_levels', 'gates', 'gate_subtasks', 'trials', 'daily_path_progress')
AND permissive = 'PERMISSIVE'
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

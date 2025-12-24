-- ============================================================
-- FIX RLS PERFORMANCE ISSUES & SECURITY WARNINGS
-- ============================================================
-- 1. Wraps auth.uid() in SELECT subqueries (performance)
-- 2. Sets search_path on functions (security)
-- 3. Note: Leaked password protection requires dashboard config
-- 
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. FIX PROFILES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- 2. FIX PLAYER_IDENTITIES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own identities" ON public.player_identities;
DROP POLICY IF EXISTS "Users can insert own identities" ON public.player_identities;
DROP POLICY IF EXISTS "Users can update own identities" ON public.player_identities;
DROP POLICY IF EXISTS "Users can delete own identities" ON public.player_identities;

CREATE POLICY "Users can view own identities" ON public.player_identities
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own identities" ON public.player_identities
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own identities" ON public.player_identities
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own identities" ON public.player_identities
    FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================================
-- 3. FIX TASK_LOGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own task logs" ON public.task_logs;
DROP POLICY IF EXISTS "Users can insert own task logs" ON public.task_logs;

CREATE POLICY "Users can view own task logs" ON public.task_logs
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own task logs" ON public.task_logs
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 4. FIX PLAYER_INVENTORY POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own inventory" ON public.player_inventory;
DROP POLICY IF EXISTS "Users can insert own inventory" ON public.player_inventory;
DROP POLICY IF EXISTS "Users can update own inventory" ON public.player_inventory;
DROP POLICY IF EXISTS "Users can delete own inventory" ON public.player_inventory;

CREATE POLICY "Users can view own inventory" ON public.player_inventory
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own inventory" ON public.player_inventory
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own inventory" ON public.player_inventory
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own inventory" ON public.player_inventory
    FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================================
-- 5. FIX FUNCTION SEARCH_PATH SECURITY ISSUES
-- ============================================================
-- Setting search_path prevents search path injection attacks

-- Fix update_updated_at_column function
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

-- Fix handle_new_user function
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
        5,    -- Starting stars
        0, 0, 0, 0, 0,
        'F',
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC')
    );
    RETURN NEW;
END;
$$;

-- Fix update_player_stats function - DEPRECATED, DROP if it exists
-- This function was from an old version and is no longer used
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_player_stats'
    ) THEN
        DROP FUNCTION IF EXISTS public.update_player_stats CASCADE;
    END IF;
END $$;


-- ============================================================
-- VERIFICATION
-- ============================================================
-- Check that all policies have been updated
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%select auth.uid()%' THEN '✅ Optimized'
        WHEN qual LIKE '%auth.uid()%' THEN '⚠️ Needs Fix'
        ELSE '✓ OK'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'player_identities', 'task_logs', 'player_inventory')
ORDER BY tablename, policyname;

-- Verify function search_path settings
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security,
    CASE 
        WHEN proconfig IS NULL THEN '⚠️ No search_path set'
        ELSE '✅ search_path configured'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_updated_at_column', 'handle_new_user')
ORDER BY p.proname;

-- ============================================================
-- MANUAL STEP: Enable Leaked Password Protection
-- ============================================================
-- This cannot be done via SQL - must be enabled in Supabase Dashboard:
-- 1. Go to: Dashboard > Authentication > Providers > Email
-- 2. Scroll to "Security & Protection"
-- 3. Enable "Leaked Password Protection"
-- 4. Save changes
-- 
-- This prevents users from using compromised passwords from HaveIBeenPwned.org
-- ============================================================

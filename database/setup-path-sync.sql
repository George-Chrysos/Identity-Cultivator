-- ============================================================
-- INITIAL PATH SYNC - First Time Setup
-- ============================================================
-- Run this ONCE after creating the paths tables
-- This creates the tables and does the initial sync
-- After this, use the auto-sync feature from the app
-- ============================================================

-- First, ensure tables exist
-- Run this section only if you haven't run create-paths-table.sql yet

-- Note: If tables already exist, you can skip to the app auto-sync
-- Just make sure CURRENT_SYNC_VERSION in pathSyncService.ts is set,
-- then visit the app - it will auto-sync

-- ============================================================
-- VERIFICATION: Check if you need this migration
-- ============================================================
SELECT 
    tablename,
    CASE 
        WHEN tablename IS NOT NULL THEN '✅ Exists'
        ELSE '⚠️ Missing'
    END as status
FROM pg_tables
WHERE schemaname = 'public' 
    AND tablename IN ('paths', 'path_levels', 'gates', 'subtasks', 'trials')
ORDER BY tablename;

-- ============================================================
-- If all tables exist, you can skip SQL setup!
-- Just:
-- 1. Set CURRENT_SYNC_VERSION = '1.0.0' in pathSyncService.ts
-- 2. Deploy your app
-- 3. Visit the app - auto-sync will populate the database
-- ============================================================

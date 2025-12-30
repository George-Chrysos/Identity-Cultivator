-- Wipe All Users Data Script
-- WARNING: This script will DELETE ALL user data for ALL users
-- Use this for a complete database reset when deploying a new version
-- This does NOT delete auth.users entries (preserves authentication)

BEGIN;

-- Delete all daily path progress (task completion tracking)
DELETE FROM public.daily_path_progress;

-- Delete all daily records (if table exists)
DELETE FROM public.daily_records;

-- Delete all task logs (completion history)
DELETE FROM public.task_logs;

-- Delete all player inventory items
DELETE FROM public.player_inventory;

-- Delete all player identities (paths)
DELETE FROM public.player_identities;

-- Reset all profiles to initial state
UPDATE public.profiles 
SET 
  rank_tier = 'E',
  coins = 0,
  stars = 5,
  body_points = 0,
  mind_points = 0,
  soul_points = 0,
  will_points = 0,
  final_score = 0,
  updated_at = NOW();

-- Commit the transaction
COMMIT;

-- Verify the reset
SELECT 'daily_path_progress count:' as info, COUNT(*) as count FROM public.daily_path_progress
UNION ALL
SELECT 'daily_records count:', COUNT(*) FROM public.daily_records
UNION ALL
SELECT 'task_logs count:', COUNT(*) FROM public.task_logs
UNION ALL
SELECT 'player_inventory count:', COUNT(*) FROM public.player_inventory
UNION ALL
SELECT 'player_identities count:', COUNT(*) FROM public.player_identities
UNION ALL
SELECT 'profiles count:', COUNT(*) FROM public.profiles;

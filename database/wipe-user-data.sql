-- Wipe User Data Script
-- This script deletes all user-related data for a clean slate
-- Usage: Replace :user_id with the actual user UUID

-- Delete daily records (if table exists)
DELETE FROM public.daily_records WHERE user_id = :user_id;

-- Delete task logs (completion history)
DELETE FROM public.task_logs WHERE user_id = :user_id;

-- Delete player inventory items
DELETE FROM public.player_inventory WHERE user_id = :user_id;

-- Delete player identities (paths)
DELETE FROM public.player_identities WHERE user_id = :user_id;

-- Reset profile to initial state
UPDATE public.profiles 
SET 
  rank_tier = 'D',
  coins = 100,
  stars = 5,
  body_points = 0,
  mind_points = 0,
  soul_points = 0,
  will_points = 0,
  final_score = 0,
  updated_at = NOW()
WHERE id = :user_id;

-- Note: This script does NOT delete the profile itself or auth.users entry
-- to maintain user authentication while resetting game progress

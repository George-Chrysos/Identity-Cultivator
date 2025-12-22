-- ================================================
-- DEMO USER PROFILE SEEDING
-- ================================================
-- Creates demo profiles for local development
-- Run this in Supabase SQL Editor AFTER running seed-templates.sql

-- ================================================
-- DEMO USER PROFILES
-- ================================================

INSERT INTO profiles (
  id, 
  display_name, 
  coins, 
  stars, 
  body_points, 
  mind_points, 
  soul_points, 
  will_points,
  timezone,
  created_at,
  updated_at
)
VALUES
  -- Demo Cultivator (matches local auth service)
  (
    'demo-user-001',
    'Demo Cultivator',
    1000,
    50,
    25,
    30,
    20,
    15,
    'UTC',
    NOW(),
    NOW()
  ),
  
  -- Test Master (matches local auth service)
  (
    'demo-user-002',
    'Test Master',
    2500,
    100,
    50,
    60,
    40,
    30,
    'UTC',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  coins = EXCLUDED.coins,
  stars = EXCLUDED.stars,
  body_points = EXCLUDED.body_points,
  mind_points = EXCLUDED.mind_points,
  soul_points = EXCLUDED.soul_points,
  will_points = EXCLUDED.will_points,
  updated_at = NOW();

-- ================================================
-- ACTIVATE STARTER IDENTITY FOR DEMO USERS
-- ================================================
-- Give each demo user the CULTIVATOR identity

INSERT INTO player_identities (
  user_id,
  template_id,
  is_active,
  current_level,
  current_xp,
  current_streak,
  will_contribution,
  status,
  created_at,
  updated_at
)
VALUES
  -- Demo Cultivator gets CULTIVATOR identity
  (
    'demo-user-001',
    '550e8400-e29b-41d4-a716-446655440001', -- CULTIVATOR template
    true,
    3,
    45,
    5,
    0,
    'ACTIVE',
    NOW(),
    NOW()
  ),
  
  -- Test Master gets CULTIVATOR and BODYSMITH identities
  (
    'demo-user-002',
    '550e8400-e29b-41d4-a716-446655440001', -- CULTIVATOR template
    true,
    5,
    75,
    12,
    0,
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    'demo-user-002',
    '550e8400-e29b-41d4-a716-446655440002', -- BODYSMITH template
    true,
    4,
    60,
    8,
    0,
    'ACTIVE',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- ADD SOME SAMPLE TASK COMPLETIONS
-- ================================================
-- Give demo users some history

INSERT INTO task_logs (
  user_id,
  identity_instance_id,
  task_template_id,
  stat_points_earned,
  coins_earned,
  xp_earned,
  completed_at
)
SELECT
  'demo-user-001' as user_id,
  pi.id as identity_instance_id,
  '650e8400-e29b-41d4-a716-446655440101' as task_template_id, -- Morning Practice
  5 as stat_points_earned,
  10 as coins_earned,
  20 as xp_earned,
  NOW() - INTERVAL '1 day' * generate_series(1, 5) as completed_at
FROM player_identities pi
WHERE pi.user_id = 'demo-user-001'
  AND pi.template_id = '550e8400-e29b-41d4-a716-446655440001'
LIMIT 1;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check profiles
-- SELECT * FROM profiles WHERE id LIKE 'demo-user-%';

-- Check identities
-- SELECT 
--   p.display_name,
--   pi.template_id,
--   it.name as identity_name,
--   pi.current_level,
--   pi.current_xp,
--   pi.current_streak,
--   pi.is_active
-- FROM player_identities pi
-- JOIN profiles p ON p.id = pi.user_id
-- JOIN identity_templates it ON it.id = pi.template_id
-- WHERE pi.user_id LIKE 'demo-user-%';

-- Check task logs
-- SELECT 
--   tl.completed_at,
--   p.display_name,
--   it.name as identity,
--   tt.name as task,
--   tl.stat_points_earned,
--   tl.coins_earned,
--   tl.xp_earned
-- FROM task_logs tl
-- JOIN profiles p ON p.id = tl.user_id
-- JOIN player_identities pi ON pi.id = tl.identity_instance_id
-- JOIN identity_templates it ON it.id = pi.template_id
-- JOIN task_templates tt ON tt.id = tl.task_template_id
-- WHERE tl.user_id LIKE 'demo-user-%'
-- ORDER BY tl.completed_at DESC;

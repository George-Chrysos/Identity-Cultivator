-- ================================================
-- IDENTITY CULTIVATOR - DATABASE SEEDING SCRIPT
-- ================================================
-- Run this in your Supabase SQL Editor to populate templates

-- Clear existing data (optional - comment out if you want to keep data)
-- DELETE FROM task_templates;
-- DELETE FROM identity_templates;

-- ================================================
-- IDENTITY TEMPLATES
-- ================================================

INSERT INTO identity_templates (id, name, primary_stat, tier, unlock_cost_stars, description, created_at, updated_at)
VALUES
  -- Starter Identity (D Tier - Free)
  ('550e8400-e29b-41d4-a716-446655440001', 'CULTIVATOR', 'BODY', 'D', 0, 'The foundation of all paths. Master the basics of self-cultivation through daily practice and awareness.', NOW(), NOW()),
  
  -- Morning Warrior - Linked to Warrior Path (D Tier - Unlocked via Path Tree)
  ('550e8400-e29b-41d4-a716-446655440007', 'MORNING WARRIOR', 'BODY', 'D', 0, 'Rise with the sun and forge discipline through morning rituals. The warrior''s path begins at dawn.', NOW(), NOW()),
  
  -- Physical Path (C Tier)
  ('550e8400-e29b-41d4-a716-446655440002', 'BODYSMITH', 'BODY', 'C', 100, 'Forge your physical vessel into an instrument of power. Each day strengthens body and will.', NOW(), NOW()),
  
  -- Mental Path (C Tier)
  ('550e8400-e29b-41d4-a716-446655440003', 'SCHOLAR', 'MIND', 'C', 100, 'Expand the boundaries of knowledge and wisdom. The mind is the greatest weapon.', NOW(), NOW()),
  
  -- Creative Path (B Tier)
  ('550e8400-e29b-41d4-a716-446655440004', 'JOURNALIST', 'MIND', 'B', 250, 'Chronicle reality and shape narratives. Express truth through the written word.', NOW(), NOW()),
  
  -- Strategic Path (B Tier)
  ('550e8400-e29b-41d4-a716-446655440005', 'STRATEGIST', 'MIND', 'B', 250, 'Master the art of planning and execution. See patterns others miss.', NOW(), NOW()),
  
  -- Spiritual Path (A Tier)
  ('550e8400-e29b-41d4-a716-446655440006', 'MYSTIC', 'SOUL', 'A', 500, 'Connect with the deeper currents of existence. Cultivate inner peace and awareness.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  primary_stat = EXCLUDED.primary_stat,
  tier = EXCLUDED.tier,
  unlock_cost_stars = EXCLUDED.unlock_cost_stars,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- TASK TEMPLATES - CULTIVATOR PATH
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  -- Cultivator Tasks (D Tier - Basics)
  ('650e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'Morning Practice', 'Begin the day with focused intention', 'BODY', 5, 10, 20, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'Breathwork Session', 'Cultivate awareness through controlled breathing', 'SOUL', 5, 10, 20, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'Evening Reflection', 'Review the day and set intentions', 'MIND', 5, 10, 20, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- TASK TEMPLATES - MORNING WARRIOR PATH
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440007', 'Dawn Training', 'Rise at dawn and train your body', 'BODY', 10, 15, 25, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440007', 'Warrior Meditation', 'Center yourself before the battle of the day', 'SOUL', 8, 12, 20, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440007', 'Evening Review', 'Reflect on the day like a true warrior', 'MIND', 8, 12, 20, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- TASK TEMPLATES - BODYSMITH PATH
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440002', 'Strength Training', 'Build raw physical power', 'BODY', 15, 25, 30, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'Cardio Endurance', 'Forge cardiovascular resilience', 'BODY', 15, 25, 30, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440002', 'Flexibility Work', 'Maintain mobility and prevent injury', 'BODY', 10, 20, 25, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- TASK TEMPLATES - SCHOLAR PATH
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440003', 'Deep Study Session', 'Focus on learning complex material', 'MIND', 15, 25, 30, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440003', 'Research & Analysis', 'Investigate and synthesize information', 'MIND', 15, 25, 30, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440003', 'Knowledge Review', 'Reinforce and consolidate learning', 'MIND', 10, 20, 25, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- TASK TEMPLATES - JOURNALIST PATH
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440004', 'Daily Writing', 'Express thoughts through written word', 'MIND', 20, 35, 40, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440004', 'Content Creation', 'Craft meaningful narratives', 'MIND', 20, 35, 40, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440004', 'Editorial Review', 'Refine and polish your work', 'MIND', 15, 30, 35, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- TASK TEMPLATES - STRATEGIST PATH
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440005', 'Strategic Planning', 'Map out long-term objectives', 'MIND', 20, 35, 40, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440005', 'System Analysis', 'Deconstruct complex patterns', 'MIND', 20, 35, 40, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440005', 'Decision Making', 'Execute critical choices', 'MIND', 15, 30, 35, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- TASK TEMPLATES - MYSTIC PATH
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440006', 'Meditation Practice', 'Deepen inner awareness and presence', 'SOUL', 25, 45, 50, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440006', 'Energy Work', 'Cultivate and balance inner forces', 'SOUL', 25, 45, 50, NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440006', 'Contemplation', 'Reflect on deeper truths', 'SOUL', 20, 40, 45, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- VERIFICATION QUERY
-- ================================================
-- Run this to verify the data was inserted correctly:

-- SELECT 
--   it.name as identity_name,
--   it.tier,
--   it.primary_stat,
--   COUNT(tt.id) as task_count
-- FROM identity_templates it
-- LEFT JOIN task_templates tt ON tt.identity_template_id = it.id
-- GROUP BY it.id, it.name, it.tier, it.primary_stat
-- ORDER BY it.tier, it.name;

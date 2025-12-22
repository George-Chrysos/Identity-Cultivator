-- ================================================
-- TEMPERING PATH - WARRIOR TRAINEE (Levels 1-10)
-- Five-Gate System: Rooting, Foundation, Core, Flow, Breath
-- Goal: Transition from normal body to Rank C: Iron Tissue
-- ================================================
-- Run this in your Supabase SQL Editor after seed-templates.sql

-- Parent Path ID for linking (Warrior Path - Tempering Node)
-- This connects to the 'warrior-1-center' node in the Path Tree

-- ================================================
-- TEMPERING IDENTITY TEMPLATES (10 LEVELS)
-- ================================================

INSERT INTO identity_templates (id, name, primary_stat, tier, unlock_cost_stars, description, parent_path_id, created_at, updated_at)
VALUES
  -- Level 1: The Awakening
  ('tempering-warrior-trainee-lvl1', 'Tempering Lv.1', 'BODY', 'D', 0, '⚔️ Level 1: The Awakening of the Vessel', 'warrior-1-center', NOW(), NOW()),
  
  -- Level 2: The Silent Accumulation
  ('tempering-warrior-trainee-lvl2', 'Tempering Lv.2', 'BODY', 'D', 0, '⚔️ Level 2: The Silent Accumulation', 'warrior-1-center', NOW(), NOW()),
  
  -- Level 3: The Severing
  ('tempering-warrior-trainee-lvl3', 'Tempering Lv.3', 'BODY', 'D', 0, '⚔️ Level 3: The Severing of Support', 'warrior-1-center', NOW(), NOW()),
  
  -- Level 4: The Kinetic Chain
  ('tempering-warrior-trainee-lvl4', 'Tempering Lv.4', 'BODY', 'D', 0, '⚔️ Level 4: The Kinetic Chain', 'warrior-1-center', NOW(), NOW()),
  
  -- Level 5: The Iron Cauldron
  ('tempering-warrior-trainee-lvl5', 'Tempering Lv.5', 'BODY', 'D', 0, '⚔️ Level 5: The Iron Cauldron', 'warrior-1-center', NOW(), NOW()),
  
  -- Level 6: The Resonant Vessel (THE FORGING begins)
  ('tempering-warrior-trainee-lvl6', 'Tempering Lv.6', 'BODY', 'D', 0, '⚔️ Level 6: The Resonant Vessel', 'warrior-1-center', NOW(), NOW()),
  
  -- Level 7: The Rising Heat
  ('tempering-warrior-trainee-lvl7', 'Tempering Lv.7', 'BODY', 'D', 0, '⚔️ Level 7: The Rising Heat', 'warrior-1-center', NOW(), NOW()),
  
  -- Level 8: The Iron Shell
  ('tempering-warrior-trainee-lvl8', 'Tempering Lv.8', 'BODY', 'D', 0, '⚔️ Level 8: The Iron Shell', 'warrior-1-center', NOW(), NOW()),
  
  -- Level 9: The Unbreaking Will
  ('tempering-warrior-trainee-lvl9', 'Tempering Lv.9', 'BODY', 'D', 0, '⚔️ Level 9: The Unbreaking Will', 'warrior-1-center', NOW(), NOW()),
  
  -- Level 10: The Evolution Threshold
  ('tempering-warrior-trainee-lvl10', 'Tempering Lv.10', 'BODY', 'D', 0, '⚔️ Level 10: The Lighting of the Forge', 'warrior-1-center', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  primary_stat = EXCLUDED.primary_stat,
  tier = EXCLUDED.tier,
  description = EXCLUDED.description,
  parent_path_id = EXCLUDED.parent_path_id,
  updated_at = NOW();

-- ================================================
-- LEVEL 1: THE AWAKENING (3 Days × 40 XP = 120 XP)
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl1-task-rooting', 'tempering-warrior-trainee-lvl1', '🌳 The Rooting', 'Crown pulling up, chest sinking, back rounding. Do not move.', 'BODY', 2, 6, 8, NOW(), NOW()),
  ('tempering-lvl1-task-foundation', 'tempering-warrior-trainee-lvl1', '🏛️ The Foundation', 'Crush the lower back against the wall. Tuck the pelvis.', 'BODY', 2, 6, 8, NOW(), NOW()),
  ('tempering-lvl1-task-core', 'tempering-warrior-trainee-lvl1', '⚡ The Core Link', 'Spinal glue. If the back arches, the connection is lost.', 'BODY', 2, 6, 8, NOW(), NOW()),
  ('tempering-lvl1-task-flow', 'tempering-warrior-trainee-lvl1', '🌊 The Flow', 'Open the Kua (Hips) without using hands for support.', 'BODY', 2, 6, 8, NOW(), NOW()),
  ('tempering-lvl1-task-breath', 'tempering-warrior-trainee-lvl1', '💨 The Breath', 'Inhale (Belly in) / Exhale (Belly out). Find the rhythm.', 'BODY', 2, 6, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- LEVEL 2: THE SILENT ACCUMULATION (5 Days × 40 XP = 200 XP)
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl2-task-rooting', 'tempering-warrior-trainee-lvl2', '🌳 The Rooting', 'Release the jaw and shoulders. Let the flesh hang off the bone.', 'BODY', 2, 7, 8, NOW(), NOW()),
  ('tempering-lvl2-task-foundation', 'tempering-warrior-trainee-lvl2', '🏛️ The Foundation', 'Deepen the breath into the lower belly while under stress.', 'BODY', 2, 7, 8, NOW(), NOW()),
  ('tempering-lvl2-task-core', 'tempering-warrior-trainee-lvl2', '⚡ The Core Link', 'Slower movement equals deeper fascial recruitment.', 'BODY', 2, 7, 8, NOW(), NOW()),
  ('tempering-lvl2-task-flow', 'tempering-warrior-trainee-lvl2', '🌊 The Flow', 'Visualize the hip joints becoming oiled and fluid.', 'BODY', 2, 7, 8, NOW(), NOW()),
  ('tempering-lvl2-task-breath', 'tempering-warrior-trainee-lvl2', '💨 The Breath', 'Condense the air into a "Pearl" 3 inches below the navel.', 'BODY', 2, 7, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- LEVEL 3: THE SEVERING (7 Days × 40 XP = 280 XP)
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl3-task-rooting', 'tempering-warrior-trainee-lvl3', '🌳 The Rooting', 'Connect to the "Bubbling Well" point on the soles of the feet.', 'BODY', 3, 8, 8, NOW(), NOW()),
  ('tempering-lvl3-task-foundation', 'tempering-warrior-trainee-lvl3', '🏛️ The Foundation (Evolution)', '2x Shoulder width. No wall. You are the only support.', 'BODY', 3, 8, 8, NOW(), NOW()),
  ('tempering-lvl3-task-core', 'tempering-warrior-trainee-lvl3', '⚡ The Core Link', 'Eliminate the "click" in the hips through core engagement.', 'BODY', 3, 8, 8, NOW(), NOW()),
  ('tempering-lvl3-task-flow', 'tempering-warrior-trainee-lvl3', '🌊 The Flow', 'Torso stays upright; do not lean back.', 'BODY', 3, 8, 8, NOW(), NOW()),
  ('tempering-lvl3-task-breath', 'tempering-warrior-trainee-lvl3', '💨 The Breath', 'Feel the rise of internal pressure (Intra-abdominal pressure).', 'BODY', 3, 8, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- LEVEL 4: THE KINETIC CHAIN (9 Days × 40 XP = 360 XP)
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl4-task-rooting', 'tempering-warrior-trainee-lvl4', '🌳 The Rooting', 'Drop the center of gravity. Sink into the earth.', 'BODY', 3, 9, 8, NOW(), NOW()),
  ('tempering-lvl4-task-foundation', 'tempering-warrior-trainee-lvl4', '🏛️ The Foundation', 'Squeeze the glutes to seal the "Lower Gate."', 'BODY', 3, 9, 8, NOW(), NOW()),
  ('tempering-lvl4-task-core', 'tempering-warrior-trainee-lvl4', '⚡ The Core Link', 'Spinal articulation. Wake up every vertebrae.', 'BODY', 3, 9, 8, NOW(), NOW()),
  ('tempering-lvl4-task-flow', 'tempering-warrior-trainee-lvl4', '🌊 The Flow', 'Imagine the hips are the engine of all movement.', 'BODY', 3, 9, 8, NOW(), NOW()),
  ('tempering-lvl4-task-breath', 'tempering-warrior-trainee-lvl4', '💨 The Breath', 'Seal the bottom of the cauldron on the inhale.', 'BODY', 3, 9, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- LEVEL 5: THE IRON CAULDRON (11 Days × 40 XP = 440 XP)
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl5-task-rooting', 'tempering-warrior-trainee-lvl5', '🌳 The Rooting', 'Clear the mind. Thoughts are clouds; you are the sky.', 'BODY', 4, 10, 8, NOW(), NOW()),
  ('tempering-lvl5-task-foundation', 'tempering-warrior-trainee-lvl5', '🏛️ The Foundation', 'Bone Density. Imagine your skeleton is turning to iron.', 'BODY', 4, 10, 8, NOW(), NOW()),
  ('tempering-lvl5-task-core', 'tempering-warrior-trainee-lvl5', '⚡ The Core Link', 'Pull elbows to toes in plank. High-tension compression.', 'BODY', 4, 10, 8, NOW(), NOW()),
  ('tempering-lvl5-task-flow', 'tempering-warrior-trainee-lvl5', '🌊 The Flow', 'Reach for length, not height. Stretch the fascia.', 'BODY', 4, 10, 8, NOW(), NOW()),
  ('tempering-lvl5-task-breath', 'tempering-warrior-trainee-lvl5', '💨 The Breath', 'The chest must be a dead zone. Only the abdomen moves.', 'BODY', 4, 10, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- LEVEL 6: THE RESONANT VESSEL (13 Days × 40 XP = 520 XP)
-- THE FORGING BEGINS
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl6-task-rooting', 'tempering-warrior-trainee-lvl6', '🌳 The Rooting', 'Vibrate the internal organs to loosen deep tension.', 'BODY', 4, 11, 8, NOW(), NOW()),
  ('tempering-lvl6-task-foundation', 'tempering-warrior-trainee-lvl6', '🏛️ The Foundation', 'Perfect form. Chest to floor. Thighs to parallel.', 'BODY', 4, 11, 8, NOW(), NOW()),
  ('tempering-lvl6-task-core', 'tempering-warrior-trainee-lvl6', '⚡ The Core Link', 'The "Body Suit." Connect the back to the front.', 'BODY', 4, 11, 8, NOW(), NOW()),
  ('tempering-lvl6-task-flow', 'tempering-warrior-trainee-lvl6', '🌊 The Flow', 'Keep hips low. Shoulders and core must work as one.', 'BODY', 4, 11, 8, NOW(), NOW()),
  ('tempering-lvl6-task-breath', 'tempering-warrior-trainee-lvl6', '💨 The Breath', 'Compress energy into the Dantian on the exhale sound.', 'BODY', 4, 11, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- LEVEL 7: THE RISING HEAT (15 Days × 40 XP = 600 XP)
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl7-task-rooting', 'tempering-warrior-trainee-lvl7', '🌳 The Rooting', 'Feel the heat rising from the Bubbling Well to the Dantian.', 'BODY', 5, 12, 8, NOW(), NOW()),
  ('tempering-lvl7-task-foundation', 'tempering-warrior-trainee-lvl7', '🏛️ The Foundation', 'Fascial recruitment. The slow speed forces the "Bodysuit" to knit.', 'BODY', 5, 12, 8, NOW(), NOW()),
  ('tempering-lvl7-task-core', 'tempering-warrior-trainee-lvl7', '⚡ The Core Link', 'No drooping. The side of the vessel must be a solid shield.', 'BODY', 5, 12, 8, NOW(), NOW()),
  ('tempering-lvl7-task-flow', 'tempering-warrior-trainee-lvl7', '🌊 The Flow', 'Open the hips laterally. Stay low and light.', 'BODY', 5, 12, 8, NOW(), NOW()),
  ('tempering-lvl7-task-breath', 'tempering-warrior-trainee-lvl7', '💨 The Breath', 'Direct the heat from the core to the fingertips.', 'BODY', 5, 12, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- LEVEL 8: THE IRON SHELL (17 Days × 40 XP = 680 XP)
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl8-task-rooting', 'tempering-warrior-trainee-lvl8', '🌳 The Rooting', 'Discomfort is information. Do not judge it.', 'BODY', 5, 13, 8, NOW(), NOW()),
  ('tempering-lvl8-task-foundation', 'tempering-warrior-trainee-lvl8', '🏛️ The Foundation', 'Depth. You should be lower now than at Level 3.', 'BODY', 5, 13, 8, NOW(), NOW()),
  ('tempering-lvl8-task-core', 'tempering-warrior-trainee-lvl8', '⚡ The Core Link (Full Body)', 'Iron Shell: Inhale → Exhale + Squeeze EVERY muscle at 100%. Vibrate.', 'BODY', 5, 13, 8, NOW(), NOW()),
  ('tempering-lvl8-task-flow', 'tempering-warrior-trainee-lvl8', '🌊 The Flow', 'Crab: Open the chest and strengthen the posterior chain.', 'BODY', 5, 13, 8, NOW(), NOW()),
  ('tempering-lvl8-task-breath', 'tempering-warrior-trainee-lvl8', '💨 The Breath', 'Sync the "Iron Shell" squeeze with the "AAAAH" exhale.', 'BODY', 5, 13, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- LEVEL 9: THE UNBREAKING WILL (19 Days × 40 XP = 760 XP)
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl9-task-rooting', 'tempering-warrior-trainee-lvl9', '🌳 The Rooting', 'There is no self. There is only the posture.', 'BODY', 6, 14, 8, NOW(), NOW()),
  ('tempering-lvl9-task-foundation', 'tempering-warrior-trainee-lvl9', '🏛️ The Foundation', 'The muscles are dead; the fascia is alive. Push through honey.', 'BODY', 6, 14, 8, NOW(), NOW()),
  ('tempering-lvl9-task-core', 'tempering-warrior-trainee-lvl9', '⚡ The Core Link (The Gauntlet)', 'No rest between the 7 pillars. One unified cycle.', 'BODY', 6, 14, 8, NOW(), NOW()),
  ('tempering-lvl9-task-flow', 'tempering-warrior-trainee-lvl9', '🌊 The Flow', 'Fluid transitions. Move like a predator.', 'BODY', 6, 14, 8, NOW(), NOW()),
  ('tempering-lvl9-task-breath', 'tempering-warrior-trainee-lvl9', '💨 The Breath', 'Advanced Jing Sealing. The "Fire" stays in the "Furnace."', 'BODY', 6, 14, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- LEVEL 10: THE EVOLUTION THRESHOLD (21 Days × 40 XP = 840 XP)
-- ================================================

INSERT INTO task_templates (id, identity_template_id, name, description, target_stat, base_points_reward, coin_reward, xp_reward, created_at, updated_at)
VALUES
  ('tempering-lvl10-task-rooting', 'tempering-warrior-trainee-lvl10', '🌳 The Rooting (Mastery)', 'Mastery. The vessel can now contain any amount of pressure.', 'BODY', 7, 15, 8, NOW(), NOW()),
  ('tempering-lvl10-task-foundation', 'tempering-warrior-trainee-lvl10', '🏛️ The Foundation (Mastery)', 'You have become the Iron Way.', 'BODY', 7, 15, 8, NOW(), NOW()),
  ('tempering-lvl10-task-core', 'tempering-warrior-trainee-lvl10', '⚡ The Core Link (The Iron Gauntlet)', 'Absolute density. The body is a single, impenetrable unit.', 'BODY', 7, 15, 8, NOW(), NOW()),
  ('tempering-lvl10-task-flow', 'tempering-warrior-trainee-lvl10', '🌊 The Flow (The Chimera)', 'Mastery of space. Moving with the weight of the world.', 'BODY', 7, 15, 8, NOW(), NOW()),
  ('tempering-lvl10-task-sealing', 'tempering-warrior-trainee-lvl10', '🔥 The Sealing', 'The spark becomes a constant fire. You are ready to Evolve.', 'BODY', 7, 15, 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_stat = EXCLUDED.target_stat,
  base_points_reward = EXCLUDED.base_points_reward,
  coin_reward = EXCLUDED.coin_reward,
  xp_reward = EXCLUDED.xp_reward,
  updated_at = NOW();

-- ================================================
-- SUBTASK TEMPLATES FOR TEMPERING PATH
-- ================================================

-- Create subtask_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS subtask_templates (
  id VARCHAR(100) PRIMARY KEY,
  task_template_id VARCHAR(100) NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- LEVEL 1 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl1-task-rooting-subtask-1', 'tempering-lvl1-task-rooting', 'Zhan Zhuang: 3 Minutes', 'Crown pulling up, chest sinking, back rounding. Do not move.'),
  ('tempering-lvl1-task-foundation-subtask-1', 'tempering-lvl1-task-foundation', 'Wall Sit: 1 Set × 30 Seconds', 'Crush the lower back against the wall. Tuck the pelvis.'),
  ('tempering-lvl1-task-core-subtask-1', 'tempering-lvl1-task-core', 'Dead Bug: 1 Set × 5 Reps (Slow)', 'Spinal glue. If the back arches, the connection is lost.'),
  ('tempering-lvl1-task-flow-subtask-1', 'tempering-lvl1-task-flow', '90/90 Hip Switch: 1 Set × 10 Reps', 'Open the Kua (Hips) without using hands for support.'),
  ('tempering-lvl1-task-breath-subtask-1', 'tempering-lvl1-task-breath', 'Reverse Breathing: 5 Cycles', 'Inhale (Belly in) / Exhale (Belly out). Find the rhythm.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- LEVEL 2 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl2-task-rooting-subtask-1', 'tempering-lvl2-task-rooting', 'Zhan Zhuang: 5 Minutes', 'Release the jaw and shoulders. Let the flesh hang off the bone.'),
  ('tempering-lvl2-task-foundation-subtask-1', 'tempering-lvl2-task-foundation', 'Wall Sit: 2 Sets × 30 Seconds', 'Deepen the breath into the lower belly while under stress.'),
  ('tempering-lvl2-task-core-subtask-1', 'tempering-lvl2-task-core', 'Dead Bug: 2 Sets × 5 Reps', 'Slower movement equals deeper fascial recruitment.'),
  ('tempering-lvl2-task-flow-subtask-1', 'tempering-lvl2-task-flow', '90/90 Hip Switch: 2 Sets × 10 Reps', 'Visualize the hip joints becoming oiled and fluid.'),
  ('tempering-lvl2-task-breath-subtask-1', 'tempering-lvl2-task-breath', 'Reverse Breathing: 7 Cycles', 'Condense the air into a "Pearl" 3 inches below the navel.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- LEVEL 3 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl3-task-rooting-subtask-1', 'tempering-lvl3-task-rooting', 'Zhan Zhuang: 7 Minutes', 'Connect to the "Bubbling Well" point on the soles of the feet.'),
  ('tempering-lvl3-task-foundation-subtask-1', 'tempering-lvl3-task-foundation', 'Horse Stance (Ma Bu): 1 Set × 30 Seconds', '2x Shoulder width. No wall. You are the only support.'),
  ('tempering-lvl3-task-core-subtask-1', 'tempering-lvl3-task-core', 'Dead Bug: 2 Sets × 8 Reps', 'Eliminate the "click" in the hips through core engagement.'),
  ('tempering-lvl3-task-flow-subtask-1', 'tempering-lvl3-task-flow', '90/90 Hip Switch: 2 Sets × 12 Reps', 'Torso stays upright; do not lean back.'),
  ('tempering-lvl3-task-breath-subtask-1', 'tempering-lvl3-task-breath', 'Reverse Breathing: 9 Cycles', 'Feel the rise of internal pressure (Intra-abdominal pressure).')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- LEVEL 4 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl4-task-rooting-subtask-1', 'tempering-lvl4-task-rooting', 'Zhan Zhuang: 9 Minutes', 'Drop the center of gravity. Sink into the earth.'),
  ('tempering-lvl4-task-foundation-subtask-1', 'tempering-lvl4-task-foundation', 'Horse Stance: 2 Sets × 30 Seconds', 'Maintain posture.'),
  ('tempering-lvl4-task-foundation-subtask-2', 'tempering-lvl4-task-foundation', 'Glute Bridge Hold: 1 Set × 30 Seconds', 'Squeeze the glutes to seal the "Lower Gate."'),
  ('tempering-lvl4-task-core-subtask-1', 'tempering-lvl4-task-core', 'Cat-Cow: 1 Set × 10 Reps (Slow)', 'Spinal articulation. Wake up every vertebrae.'),
  ('tempering-lvl4-task-core-subtask-2', 'tempering-lvl4-task-core', 'Dead Bug: 3 Sets × 8 Reps', 'Maintain core engagement.'),
  ('tempering-lvl4-task-flow-subtask-1', 'tempering-lvl4-task-flow', '90/90 Hip Switch: 3 Sets × 12 Reps', 'Imagine the hips are the engine of all movement.'),
  ('tempering-lvl4-task-breath-subtask-1', 'tempering-lvl4-task-breath', 'Reverse Breathing: 11 Cycles + Perineum Lock', 'Seal the bottom of the cauldron on the inhale.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- LEVEL 5 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl5-task-rooting-subtask-1', 'tempering-lvl5-task-rooting', 'Zhan Zhuang: 11 Minutes', 'Clear the mind. Thoughts are clouds; you are the sky.'),
  ('tempering-lvl5-task-foundation-subtask-1', 'tempering-lvl5-task-foundation', 'Horse Stance: 2 Sets × 45 Seconds', 'Bone Density. Imagine your skeleton is turning to iron.'),
  ('tempering-lvl5-task-foundation-subtask-2', 'tempering-lvl5-task-foundation', 'Glute Bridge Hold: 2 Sets × 30 Seconds', 'Maintain glute engagement.'),
  ('tempering-lvl5-task-core-subtask-1', 'tempering-lvl5-task-core', 'Hard-Style Plank: 1 Set × 30 Seconds', 'Pull elbows to toes in plank. High-tension compression.'),
  ('tempering-lvl5-task-core-subtask-2', 'tempering-lvl5-task-core', 'Cat-Cow: 2 Sets × 10 Reps', 'Maintain spinal articulation.'),
  ('tempering-lvl5-task-flow-subtask-1', 'tempering-lvl5-task-flow', 'Bird Dog: 2 Sets × 10 Reps (Slow)', 'Reach for length, not height. Stretch the fascia.'),
  ('tempering-lvl5-task-breath-subtask-1', 'tempering-lvl5-task-breath', 'Reverse Breathing: 13 Cycles', 'The chest must be a dead zone. Only the abdomen moves.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- LEVEL 6 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl6-task-rooting-subtask-1', 'tempering-lvl6-task-rooting', 'Zhan Zhuang: 13 Minutes + Low Frequency Hum', 'Vibrate the internal organs to loosen deep tension.'),
  ('tempering-lvl6-task-foundation-subtask-1', 'tempering-lvl6-task-foundation', 'Standard Push-ups: 3 Sets × 10 Reps', 'Perfect form. Chest to floor.'),
  ('tempering-lvl6-task-foundation-subtask-2', 'tempering-lvl6-task-foundation', 'Standard Squats: 3 Sets × 15 Reps', 'Thighs to parallel.'),
  ('tempering-lvl6-task-core-subtask-1', 'tempering-lvl6-task-core', 'Plank: 3 Sets × 30 Seconds', 'The "Body Suit." Connect the back to the front.'),
  ('tempering-lvl6-task-core-subtask-2', 'tempering-lvl6-task-core', 'Superman Hold: 3 Sets × 30 Seconds', 'Posterior chain engagement.'),
  ('tempering-lvl6-task-flow-subtask-1', 'tempering-lvl6-task-flow', 'Bear Mobility (Crawl): 3 Sets × 30 Seconds', 'Keep hips low. Shoulders and core must work as one.'),
  ('tempering-lvl6-task-breath-subtask-1', 'tempering-lvl6-task-breath', 'AAAAH Mantra (Sound): 15 Cycles', 'Compress energy into the Dantian on the exhale sound.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- LEVEL 7 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl7-task-rooting-subtask-1', 'tempering-lvl7-task-rooting', 'Zhan Zhuang: 15 Minutes', 'Feel the heat rising from the Bubbling Well to the Dantian.'),
  ('tempering-lvl7-task-foundation-subtask-1', 'tempering-lvl7-task-foundation', 'Tempo Push-ups (3s/3s): 3 Sets × 8 Reps', 'Fascial recruitment. The slow speed forces the "Bodysuit" to knit.'),
  ('tempering-lvl7-task-foundation-subtask-2', 'tempering-lvl7-task-foundation', 'Tempo Squats (3s/3s): 3 Sets × 12 Reps', 'Maintain tempo control.'),
  ('tempering-lvl7-task-core-subtask-1', 'tempering-lvl7-task-core', 'Side Planks: 3 Sets × 30 Seconds (Per Side)', 'No drooping. The side of the vessel must be a solid shield.'),
  ('tempering-lvl7-task-core-subtask-2', 'tempering-lvl7-task-core', 'Hollow Body Hold: 3 Sets × 20 Seconds', 'Core compression.'),
  ('tempering-lvl7-task-flow-subtask-1', 'tempering-lvl7-task-flow', 'Bear Crawl: 45 Seconds', 'Forward movement.'),
  ('tempering-lvl7-task-flow-subtask-2', 'tempering-lvl7-task-flow', 'Monkey Mobility (Lateral): 3 Sets × 30 Seconds', 'Open the hips laterally. Stay low and light.'),
  ('tempering-lvl7-task-breath-subtask-1', 'tempering-lvl7-task-breath', 'AAAAH Mantra: 20 Cycles + Heat Circulation Visualization', 'Direct the heat from the core to the fingertips.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- LEVEL 8 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl8-task-rooting-subtask-1', 'tempering-lvl8-task-rooting', 'Zhan Zhuang: 20 Minutes', 'Discomfort is information. Do not judge it.'),
  ('tempering-lvl8-task-foundation-subtask-1', 'tempering-lvl8-task-foundation', 'Tempo Push-ups (5s/5s): 3 Sets × 6 Reps', 'Depth and control.'),
  ('tempering-lvl8-task-foundation-subtask-2', 'tempering-lvl8-task-foundation', 'Horse Stance: 2 Sets × 90 Seconds', 'You should be lower now than at Level 3.'),
  ('tempering-lvl8-task-foundation-subtask-3', 'tempering-lvl8-task-foundation', 'Cossack Squat: 3 Sets × 8 Reps/Side', 'Lateral leg strength.'),
  ('tempering-lvl8-task-core-subtask-1', 'tempering-lvl8-task-core', 'The Iron Shell (Isometrics): 5 Sets × 10 Seconds Max Tension', 'Inhale → Exhale + Squeeze EVERY muscle at 100%. Vibrate.'),
  ('tempering-lvl8-task-core-subtask-2', 'tempering-lvl8-task-core', 'Hollow Body Hold: 3 Sets × 35 Seconds', 'Extended hold.'),
  ('tempering-lvl8-task-core-subtask-3', 'tempering-lvl8-task-core', 'Lunge Hold (L/R): 3 Sets × 45 Seconds', 'Static strength.'),
  ('tempering-lvl8-task-flow-subtask-1', 'tempering-lvl8-task-flow', 'Bear (45s) + Monkey (45s) + Crab Mobility (30s)', 'Crab: Open the chest and strengthen the posterior chain.'),
  ('tempering-lvl8-task-breath-subtask-1', 'tempering-lvl8-task-breath', 'AAAAH Mantra: 25 Cycles + Jing Sealing', 'Sync the "Iron Shell" squeeze with the "AAAAH" exhale.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- LEVEL 9 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl9-task-rooting-subtask-1', 'tempering-lvl9-task-rooting', 'Zhan Zhuang: 25 Minutes', 'There is no self. There is only the posture.'),
  ('tempering-lvl9-task-foundation-subtask-1', 'tempering-lvl9-task-foundation', 'Master Tempo Push-ups (10s/10s): 3 Sets × 5 Reps', 'The muscles are dead; the fascia is alive. Push through honey.'),
  ('tempering-lvl9-task-foundation-subtask-2', 'tempering-lvl9-task-foundation', 'Master Tempo Squats (10s/10s): 3 Sets × 8 Reps', 'Ultra-slow control.'),
  ('tempering-lvl9-task-foundation-subtask-3', 'tempering-lvl9-task-foundation', 'Archer Push-ups: 2 Sets × 5 Reps/Side', 'Unilateral strength.'),
  ('tempering-lvl9-task-core-subtask-1', 'tempering-lvl9-task-core', 'The 7 Pillar Gauntlet: Plank, Side L/R, Lunge L/R, Superman, Hollow Body (45s each)', 'No rest between the 7 pillars. One unified cycle.'),
  ('tempering-lvl9-task-core-subtask-2', 'tempering-lvl9-task-core', 'Iron Shell: 8 Sets × 15 Seconds', 'Maximum tension.'),
  ('tempering-lvl9-task-flow-subtask-1', 'tempering-lvl9-task-flow', 'Animal Synthesis: 5 Minutes continuous Bear/Monkey/Crab', 'Fluid transitions. Move like a predator.'),
  ('tempering-lvl9-task-breath-subtask-1', 'tempering-lvl9-task-breath', 'AAAAH Mantra: 30 Cycles', 'Advanced Jing Sealing. The "Fire" stays in the "Furnace."')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- LEVEL 10 SUBTASKS
-- ================================================

INSERT INTO subtask_templates (id, task_template_id, name, description)
VALUES
  ('tempering-lvl10-task-rooting-subtask-1', 'tempering-lvl10-task-rooting', 'Zhan Zhuang: 35 Minutes', 'Mastery. The vessel can now contain any amount of pressure.'),
  ('tempering-lvl10-task-foundation-subtask-1', 'tempering-lvl10-task-foundation', 'Master Tempo (10s/10s) Push-ups: 5 Sets × 5 Reps', 'You have become the Iron Way.'),
  ('tempering-lvl10-task-foundation-subtask-2', 'tempering-lvl10-task-foundation', 'Archer Push-ups: 4 Sets × 8 Reps/Side', 'Advanced unilateral strength.'),
  ('tempering-lvl10-task-foundation-subtask-3', 'tempering-lvl10-task-foundation', 'Low Horse Stance (Thighs Parallel): 5 Sets × 2 Minutes', 'Ultimate leg endurance.'),
  ('tempering-lvl10-task-core-subtask-1', 'tempering-lvl10-task-core', 'The 7 Pillar Gauntlet (90s each) + 10 Sets × 15s Iron Shell', 'Absolute density. The body is a single, impenetrable unit.'),
  ('tempering-lvl10-task-flow-subtask-1', 'tempering-lvl10-task-flow', 'The Chimera Flow: 30 Minutes non-stop mobility (Bear/Monkey/Crab)', 'Mastery of space. Moving with the weight of the world.'),
  ('tempering-lvl10-task-sealing-subtask-1', 'tempering-lvl10-task-sealing', 'Unified Vibration: 50 Cycles', 'The spark becomes a constant fire. You are ready to Evolve.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ================================================
-- TRIAL TEMPLATES FOR TEMPERING PATH
-- ================================================

CREATE TABLE IF NOT EXISTS trial_templates (
  id VARCHAR(100) PRIMARY KEY,
  identity_template_id VARCHAR(100) NOT NULL REFERENCES identity_templates(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  tasks TEXT NOT NULL,
  coin_reward INT DEFAULT 0,
  star_reward INT DEFAULT 0,
  item_reward VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO trial_templates (id, identity_template_id, name, description, tasks, coin_reward, star_reward, item_reward)
VALUES
  ('trial-tempering-lvl1', 'tempering-warrior-trainee-lvl1', 'The Bronze Statue', 'Total stillness. Observe the urge to itch or move, but do not react.', 'Zhan Zhuang: 8 Minutes (Continuous)', 300, 1, 'Old Iron Key'),
  ('trial-tempering-lvl2', 'tempering-warrior-trainee-lvl2', 'The Stone Roots', 'Transition without rest. Use leg fatigue to test the mind.', 'Zhan Zhuang: 10 Minutes + Wall Sit: 1 Set × 60 Seconds', 500, 1, 'Vial of Spring Water'),
  ('trial-tempering-lvl3', 'tempering-warrior-trainee-lvl3', 'The Unshakable Pillar', 'Ronin''s Indifference. Let the legs burn; the face remains calm.', 'Zhan Zhuang: 15 Minutes + Horse Stance: 3 Sets × 30 Seconds', 800, 2, 'Rough Linen Tunic'),
  ('trial-tempering-lvl4', 'tempering-warrior-trainee-lvl4', 'The Serpent''s Breath', 'The movement is a slave to the breath. Synchronize perfectly.', 'Cat-Cow: 3 Minutes Continuous + Reverse Breathing: 25 Cycles (Seiza)', 1200, 2, 'Bamboo Scroll'),
  ('trial-tempering-lvl5', 'tempering-warrior-trainee-lvl5', 'The Five-Minute Fire', 'Embrace the shaking. It is the nervous system upgrading.', 'Horse Stance: 5 Minutes (Cumulative) + Plank: 2 Minutes (Cumulative)', 1500, 3, 'Copper Wrist Weights'),
  ('trial-tempering-lvl6', 'tempering-warrior-trainee-lvl6', 'The Thunderous Silence', 'Use the sound vibration to stay calm during the crawl.', 'Zhan Zhuang: 20 Minutes + Bear Crawl: 2 Minutes (Continuous)', 2000, 3, 'Tiger Balm'),
  ('trial-tempering-lvl7', 'tempering-warrior-trainee-lvl7', 'The Lateral Gate', 'Total control over the lateral lines of the body.', 'Monkey Flow: 3 Minutes + Horse Stance: 5 Minutes (Cumulative)', 2500, 3, 'Weighted Vest'),
  ('trial-tempering-lvl8', 'tempering-warrior-trainee-lvl8', 'The Diamond Body', 'Total exhaustion of the nervous system. The standing will feel light.', 'Iron Shell: 20 Sets × 10s + Zhan Zhuang: 10 Minutes (Immediately after)', 3000, 4, 'Iron Wrist Beads'),
  ('trial-tempering-lvl9', 'tempering-warrior-trainee-lvl9', 'The Red Furnace', 'Maintain perfect tension and heat throughout the entire flow.', 'Master Tempo Gauntlet (10/10 Pushups + Squats) + 5m Animal Flow', 3500, 5, 'Ronin''s Bokken'),
  ('trial-tempering-lvl10', 'tempering-warrior-trainee-lvl10', 'The Gate of Fire', 'This is the point of no return. You are no longer a trainee. You are a Warrior.', 'Zhan Zhuang (30m) + Iron Shell (10 sets) + Recite the Vow', 5000, 1, 'Crown | Unlock: Stage 2')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tasks = EXCLUDED.tasks,
  coin_reward = EXCLUDED.coin_reward,
  star_reward = EXCLUDED.star_reward,
  item_reward = EXCLUDED.item_reward,
  updated_at = NOW();

-- Add parent_path_id column to identity_templates if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'identity_templates' AND column_name = 'parent_path_id'
  ) THEN
    ALTER TABLE identity_templates ADD COLUMN parent_path_id VARCHAR(100);
  END IF;
END $$;

-- Create index for faster lookups by parent path
CREATE INDEX IF NOT EXISTS idx_identity_templates_parent_path ON identity_templates(parent_path_id);

-- ================================================
-- VERIFICATION QUERY
-- ================================================
-- Run this to verify the seeding was successful:
-- SELECT 
--   it.id, it.name, it.description,
--   COUNT(tt.id) as task_count,
--   COUNT(st.id) as subtask_count
-- FROM identity_templates it
-- LEFT JOIN task_templates tt ON tt.identity_template_id = it.id
-- LEFT JOIN subtask_templates st ON st.task_template_id = tt.id
-- WHERE it.id LIKE 'tempering%'
-- GROUP BY it.id, it.name, it.description
-- ORDER BY it.id;

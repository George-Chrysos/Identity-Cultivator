-- ============================================================
-- SEED DATA - Tempering Path (New Paths Schema)
-- ============================================================
-- Populates all 10 levels of the Tempering Warrior Trainee path
-- Run after: create-paths-table.sql
-- ============================================================

-- ============================================================
-- INSERT PATH
-- ============================================================
INSERT INTO public.paths (id, name, description, primary_stat, tier, max_level)
VALUES (
    'tempering-warrior-trainee',
    'Tempering',
    'Warrior Trainee path focusing on body cultivation through the Five-Gate System',
    'BODY',
    'D',
    10
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  primary_stat = EXCLUDED.primary_stat,
  tier = EXCLUDED.tier,
  max_level = EXCLUDED.max_level,
  updated_at = NOW();

-- ============================================================
-- LEVEL 1: The Awakening
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 1, 'The Awakening of the Vessel', 120, 3, 1.0, 0.2, 30, 2)
  ON CONFLICT (path_id, level) DO UPDATE SET
    subtitle = EXCLUDED.subtitle,
    xp_to_level_up = EXCLUDED.xp_to_level_up,
    days_required = EXCLUDED.days_required,
    main_stat_limit = EXCLUDED.main_stat_limit,
    gate_stat_cap = EXCLUDED.gate_stat_cap,
    base_coins = EXCLUDED.base_coins,
    base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate1 AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting', 'Crown pulling up, chest sinking, back rounding. Do not move.', 1
  FROM level_insert
  ON CONFLICT DO NOTHING
  RETURNING id
),
gate2 AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'foundation', 'The Foundation', 'Crush the lower back against the wall. Tuck the pelvis.', 2
  FROM level_insert
  ON CONFLICT DO NOTHING
  RETURNING id
),
gate3 AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'core', 'The Core Link', 'Spinal glue. If the back arches, the connection is lost.', 3
  FROM level_insert
  ON CONFLICT DO NOTHING
  RETURNING id
),
gate4 AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'flow', 'The Flow', 'Open the Kua (Hips) without using hands for support.', 4
  FROM level_insert
  ON CONFLICT DO NOTHING
  RETURNING id
),
gate5 AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'breath', 'The Breath', 'Inhale (Belly in) / Exhale (Belly out). Find the rhythm.', 5
  FROM level_insert
  ON CONFLICT DO NOTHING
  RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Bronze Statue', 'The Bronze Statue', 'Zhan Zhuang: 8 Minutes (Continuous)', 'Total stillness. Observe the urge to itch or move, but do not react.', 200, 1, 1, 'Kaskol of Darkness'
FROM level_insert
ON CONFLICT DO NOTHING;

-- Subtasks for Level 1
WITH gate_lookup AS (
  SELECT g.id, g.gate_name
  FROM public.gates g
  JOIN public.path_levels pl ON g.path_level_id = pl.id
  WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 1
)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 3 Minutes', 'Crown pulling up, chest sinking, back rounding. Do not move.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL
SELECT id, 'Wall Sit: 1 Set × 30 Seconds', 'Crush the lower back against the wall. Tuck the pelvis.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL
SELECT id, 'Dead Bug: 1 Set × 5 Reps (Slow)', 'Spinal glue. If the back arches, the connection is lost.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL
SELECT id, '90/90 Hip Switch: 1 Set × 10 Reps', 'Open the Kua (Hips) without using hands for support.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL
SELECT id, 'Reverse Breathing: 5 Cycles', 'Inhale (Belly in) / Exhale (Belly out). Find the rhythm.', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEVEL 2: The Silent Accumulation
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 2, 'The Silent Accumulation', 200, 5, 1.25, 0.25, 35, 3)
  ON CONFLICT (path_id, level) DO UPDATE SET
    subtitle = EXCLUDED.subtitle, xp_to_level_up = EXCLUDED.xp_to_level_up, days_required = EXCLUDED.days_required,
    main_stat_limit = EXCLUDED.main_stat_limit, gate_stat_cap = EXCLUDED.gate_stat_cap, base_coins = EXCLUDED.base_coins, base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate_inserts AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting', 'Release the jaw and shoulders. Let the flesh hang off the bone.', 1 FROM level_insert
  UNION ALL SELECT id, 'foundation', 'The Foundation', 'Deepen the breath into the lower belly while under stress.', 2 FROM level_insert
  UNION ALL SELECT id, 'core', 'The Core Link', 'Slower movement equals deeper fascial recruitment.', 3 FROM level_insert
  UNION ALL SELECT id, 'flow', 'The Flow', 'Visualize the hip joints becoming oiled and fluid.', 4 FROM level_insert
  UNION ALL SELECT id, 'breath', 'The Breath', 'Condense the air into a "Pearl" 3 inches below the navel.', 5 FROM level_insert
  ON CONFLICT DO NOTHING
  RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Stone Roots', 'The Stone Roots', 'Zhan Zhuang: 10 Minutes + Wall Sit: 1 Set × 60 Seconds', 'Transition without rest. Use leg fatigue to test the mind.', 300, 1, 1, 'Gentleman Gloves'
FROM level_insert ON CONFLICT DO NOTHING;

WITH gate_lookup AS (
  SELECT g.id, g.gate_name FROM public.gates g
  JOIN public.path_levels pl ON g.path_level_id = pl.id
  WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 2
)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 5 Minutes', 'Release the jaw and shoulders. Let the flesh hang off the bone.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL SELECT id, 'Wall Sit: 2 Sets × 30 Seconds', 'Deepen the breath into the lower belly while under stress.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Dead Bug: 2 Sets × 5 Reps', 'Slower movement equals deeper fascial recruitment.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, '90/90 Hip Switch: 2 Sets × 10 Reps', 'Visualize the hip joints becoming oiled and fluid.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'Reverse Breathing: 7 Cycles', 'Condense the air into a "Pearl" 3 inches below the navel.', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEVEL 3: The Severing
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 3, 'The Severing of Support', 280, 7, 1.5, 0.3, 40, 3)
  ON CONFLICT (path_id, level) DO UPDATE SET subtitle = EXCLUDED.subtitle, xp_to_level_up = EXCLUDED.xp_to_level_up, days_required = EXCLUDED.days_required, main_stat_limit = EXCLUDED.main_stat_limit, gate_stat_cap = EXCLUDED.gate_stat_cap, base_coins = EXCLUDED.base_coins, base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate_inserts AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting', 'Connect to the "Bubbling Well" point on the soles of the feet.', 1 FROM level_insert
  UNION ALL SELECT id, 'foundation', 'The Foundation (Evolution)', '2x Shoulder width. No wall. You are the only support.', 2 FROM level_insert
  UNION ALL SELECT id, 'core', 'The Core Link', 'Eliminate the "click" in the hips through core engagement.', 3 FROM level_insert
  UNION ALL SELECT id, 'flow', 'The Flow', 'Torso stays upright; do not lean back.', 4 FROM level_insert
  UNION ALL SELECT id, 'breath', 'The Breath', 'Feel the rise of internal pressure (Intra-abdominal pressure).', 5 FROM level_insert
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Unshakable Pillar', 'The Unshakable Pillar', 'Zhan Zhuang: 15 Minutes + Horse Stance: 3 Sets × 30 Seconds', 'Ronin''s Indifference. Let the legs burn; the face remains calm.', 500, 2, 1, 'Long Coat of Elegance'
FROM level_insert ON CONFLICT DO NOTHING;

WITH gate_lookup AS (
  SELECT g.id, g.gate_name FROM public.gates g JOIN public.path_levels pl ON g.path_level_id = pl.id WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 3
)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 7 Minutes', 'Connect to the "Bubbling Well" point on the soles of the feet.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL SELECT id, 'Horse Stance (Ma Bu): 1 Set × 30 Seconds', '2x Shoulder width. No wall. You are the only support.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Dead Bug: 2 Sets × 8 Reps', 'Eliminate the "click" in the hips through core engagement.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, '90/90 Hip Switch: 2 Sets × 12 Reps', 'Torso stays upright; do not lean back.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'Reverse Breathing: 9 Cycles', 'Feel the rise of internal pressure (Intra-abdominal pressure).', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEVEL 4: The Kinetic Chain
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 4, 'The Kinetic Chain', 360, 9, 1.75, 0.35, 45, 4)
  ON CONFLICT (path_id, level) DO UPDATE SET subtitle = EXCLUDED.subtitle, xp_to_level_up = EXCLUDED.xp_to_level_up, days_required = EXCLUDED.days_required, main_stat_limit = EXCLUDED.main_stat_limit, gate_stat_cap = EXCLUDED.gate_stat_cap, base_coins = EXCLUDED.base_coins, base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate_inserts AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting', 'Drop the center of gravity. Sink into the earth.', 1 FROM level_insert
  UNION ALL SELECT id, 'foundation', 'The Foundation', 'Squeeze the glutes to seal the "Lower Gate."', 2 FROM level_insert
  UNION ALL SELECT id, 'core', 'The Core Link', 'Spinal articulation. Wake up every vertebrae.', 3 FROM level_insert
  UNION ALL SELECT id, 'flow', 'The Flow', 'Imagine the hips are the engine of all movement.', 4 FROM level_insert
  UNION ALL SELECT id, 'breath', 'The Breath', 'Seal the bottom of the cauldron on the inhale.', 5 FROM level_insert
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Serpent''s Breath', 'The Serpent''s Breath', 'Cat-Cow: 3 Minutes Continuous + Reverse Breathing: 25 Cycles (Seiza)', 'The movement is a slave to the breath. Synchronize perfectly.', 600, 2, 1, 'Bamboo Scroll'
FROM level_insert ON CONFLICT DO NOTHING;

WITH gate_lookup AS (SELECT g.id, g.gate_name FROM public.gates g JOIN public.path_levels pl ON g.path_level_id = pl.id WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 4)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 9 Minutes', 'Drop the center of gravity. Sink into the earth.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL SELECT id, 'Horse Stance: 2 Sets × 30 Seconds', 'Maintain posture.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Glute Bridge Hold: 1 Set × 30 Seconds', 'Squeeze the glutes to seal the "Lower Gate."', 2 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Cat-Cow: 1 Set × 10 Reps (Slow)', 'Spinal articulation. Wake up every vertebrae.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Dead Bug: 3 Sets × 8 Reps', 'Maintain core engagement.', 2 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, '90/90 Hip Switch: 3 Sets × 12 Reps', 'Imagine the hips are the engine of all movement.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'Reverse Breathing: 11 Cycles + Perineum Lock', 'Seal the bottom of the cauldron on the inhale.', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEVEL 5: The Iron Cauldron
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 5, 'The Iron Cauldron', 440, 11, 2.0, 0.4, 50, 4)
  ON CONFLICT (path_id, level) DO UPDATE SET subtitle = EXCLUDED.subtitle, xp_to_level_up = EXCLUDED.xp_to_level_up, days_required = EXCLUDED.days_required, main_stat_limit = EXCLUDED.main_stat_limit, gate_stat_cap = EXCLUDED.gate_stat_cap, base_coins = EXCLUDED.base_coins, base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate_inserts AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting', 'Clear the mind. Thoughts are clouds; you are the sky.', 1 FROM level_insert
  UNION ALL SELECT id, 'foundation', 'The Foundation', 'Bone Density. Imagine your skeleton is turning to iron.', 2 FROM level_insert
  UNION ALL SELECT id, 'core', 'The Core Link', 'Pull elbows to toes in plank. High-tension compression.', 3 FROM level_insert
  UNION ALL SELECT id, 'flow', 'The Flow', 'Reach for length, not height. Stretch the fascia.', 4 FROM level_insert
  UNION ALL SELECT id, 'breath', 'The Breath', 'The chest must be a dead zone. Only the abdomen moves.', 5 FROM level_insert
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Five-Minute Fire', 'The Five-Minute Fire', 'Horse Stance: 5 Minutes (Cumulative) + Plank: 2 Minutes (Cumulative)', 'Embrace the shaking. It is the nervous system upgrading.', 800, 3, 1, 'Copper Wrist Weights'
FROM level_insert ON CONFLICT DO NOTHING;

WITH gate_lookup AS (SELECT g.id, g.gate_name FROM public.gates g JOIN public.path_levels pl ON g.path_level_id = pl.id WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 5)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 11 Minutes', 'Clear the mind. Thoughts are clouds; you are the sky.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL SELECT id, 'Horse Stance: 2 Sets × 45 Seconds', 'Bone Density. Imagine your skeleton is turning to iron.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Glute Bridge Hold: 2 Sets × 30 Seconds', 'Maintain glute engagement.', 2 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Hard-Style Plank: 1 Set × 30 Seconds', 'Pull elbows to toes in plank. High-tension compression.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Cat-Cow: 2 Sets × 10 Reps', 'Maintain spinal articulation.', 2 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Bird Dog: 2 Sets × 10 Reps (Slow)', 'Reach for length, not height. Stretch the fascia.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'Reverse Breathing: 13 Cycles', 'The chest must be a dead zone. Only the abdomen moves.', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEVEL 6: The Resonant Vessel
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 6, 'The Resonant Vessel', 520, 13, 2.5, 0.5, 55, 5)
  ON CONFLICT (path_id, level) DO UPDATE SET subtitle = EXCLUDED.subtitle, xp_to_level_up = EXCLUDED.xp_to_level_up, days_required = EXCLUDED.days_required, main_stat_limit = EXCLUDED.main_stat_limit, gate_stat_cap = EXCLUDED.gate_stat_cap, base_coins = EXCLUDED.base_coins, base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate_inserts AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting', 'Vibrate the internal organs to loosen deep tension.', 1 FROM level_insert
  UNION ALL SELECT id, 'foundation', 'The Foundation', 'Perfect form. Chest to floor. Thighs to parallel.', 2 FROM level_insert
  UNION ALL SELECT id, 'core', 'The Core Link', 'The "Body Suit." Connect the back to the front.', 3 FROM level_insert
  UNION ALL SELECT id, 'flow', 'The Flow', 'Keep hips low. Shoulders and core must work as one.', 4 FROM level_insert
  UNION ALL SELECT id, 'breath', 'The Breath', 'Compress energy into the Dantian on the exhale sound.', 5 FROM level_insert
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Thunderous Silence', 'The Thunderous Silence', 'Zhan Zhuang: 20 Minutes + Bear Crawl: 2 Minutes (Continuous)', 'Use the sound vibration to stay calm during the crawl.', 1200, 3, 1, 'Tiger Balm'
FROM level_insert ON CONFLICT DO NOTHING;

WITH gate_lookup AS (SELECT g.id, g.gate_name FROM public.gates g JOIN public.path_levels pl ON g.path_level_id = pl.id WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 6)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 13 Minutes + Low Frequency Hum', 'Vibrate the internal organs to loosen deep tension.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL SELECT id, 'Standard Push-ups: 3 Sets × 10 Reps', 'Perfect form. Chest to floor.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Standard Squats: 3 Sets × 15 Reps', 'Thighs to parallel.', 2 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Plank: 3 Sets × 30 Seconds', 'The "Body Suit." Connect the back to the front.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Superman Hold: 3 Sets × 30 Seconds', 'Posterior chain engagement.', 2 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Bear Mobility (Crawl): 3 Sets × 30 Seconds', 'Keep hips low. Shoulders and core must work as one.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'AAAAH Mantra (Sound): 15 Cycles', 'Compress energy into the Dantian on the exhale sound.', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEVEL 7: The Rising Heat
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 7, 'The Rising Heat', 600, 15, 2.5, 0.5, 60, 5)
  ON CONFLICT (path_id, level) DO UPDATE SET subtitle = EXCLUDED.subtitle, xp_to_level_up = EXCLUDED.xp_to_level_up, days_required = EXCLUDED.days_required, main_stat_limit = EXCLUDED.main_stat_limit, gate_stat_cap = EXCLUDED.gate_stat_cap, base_coins = EXCLUDED.base_coins, base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate_inserts AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting', 'Feel the heat rising from the Bubbling Well to the Dantian.', 1 FROM level_insert
  UNION ALL SELECT id, 'foundation', 'The Foundation', 'Fascial recruitment. The slow speed forces the "Bodysuit" to knit.', 2 FROM level_insert
  UNION ALL SELECT id, 'core', 'The Core Link', 'No drooping. The side of the vessel must be a solid shield.', 3 FROM level_insert
  UNION ALL SELECT id, 'flow', 'The Flow', 'Open the hips laterally. Stay low and light.', 4 FROM level_insert
  UNION ALL SELECT id, 'breath', 'The Breath', 'Direct the heat from the core to the fingertips.', 5 FROM level_insert
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Lateral Gate', 'The Lateral Gate', 'Monkey Flow: 3 Minutes + Horse Stance: 5 Minutes (Cumulative)', 'Total control over the lateral lines of the body.', 2000, 3, 1, 'Weighted Vest'
FROM level_insert ON CONFLICT DO NOTHING;

WITH gate_lookup AS (SELECT g.id, g.gate_name FROM public.gates g JOIN public.path_levels pl ON g.path_level_id = pl.id WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 7)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 15 Minutes', 'Feel the heat rising from the Bubbling Well to the Dantian.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL SELECT id, 'Tempo Push-ups (3s/3s): 3 Sets × 8 Reps', 'Fascial recruitment. The slow speed forces the "Bodysuit" to knit.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Tempo Squats (3s/3s): 3 Sets × 12 Reps', 'Maintain tempo control.', 2 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Side Planks: 3 Sets × 30 Seconds (Per Side)', 'No drooping. The side of the vessel must be a solid shield.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Hollow Body Hold: 3 Sets × 20 Seconds', 'Core compression.', 2 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Bear Crawl: 45 Seconds', 'Forward movement.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'Monkey Mobility (Lateral): 3 Sets × 30 Seconds', 'Open the hips laterally. Stay low and light.', 2 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'AAAAH Mantra: 20 Cycles + Heat Circulation Visualization', 'Direct the heat from the core to the fingertips.', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEVEL 8: The Iron Shell
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 8, 'The Iron Shell', 680, 17, 2.5, 0.5, 65, 6)
  ON CONFLICT (path_id, level) DO UPDATE SET subtitle = EXCLUDED.subtitle, xp_to_level_up = EXCLUDED.xp_to_level_up, days_required = EXCLUDED.days_required, main_stat_limit = EXCLUDED.main_stat_limit, gate_stat_cap = EXCLUDED.gate_stat_cap, base_coins = EXCLUDED.base_coins, base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate_inserts AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting', 'Discomfort is information. Do not judge it.', 1 FROM level_insert
  UNION ALL SELECT id, 'foundation', 'The Foundation', 'Depth. You should be lower now than at Level 3.', 2 FROM level_insert
  UNION ALL SELECT id, 'core', 'The Core Link (Full Body)', 'Iron Shell: Inhale → Exhale + Squeeze EVERY muscle at 100%. Vibrate.', 3 FROM level_insert
  UNION ALL SELECT id, 'flow', 'The Flow', 'Crab: Open the chest and strengthen the posterior chain.', 4 FROM level_insert
  UNION ALL SELECT id, 'breath', 'The Breath', 'Sync the "Iron Shell" squeeze with the "AAAAH" exhale.', 5 FROM level_insert
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Diamond Body', 'The Diamond Body', 'Iron Shell: 20 Sets × 10s + Zhan Zhuang: 10 Minutes (Immediately after)', 'Total exhaustion of the nervous system. The standing will feel light.', 2500, 4, 1, 'Iron Wrist Beads'
FROM level_insert ON CONFLICT DO NOTHING;

WITH gate_lookup AS (SELECT g.id, g.gate_name FROM public.gates g JOIN public.path_levels pl ON g.path_level_id = pl.id WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 8)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 20 Minutes', 'Discomfort is information. Do not judge it.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL SELECT id, 'Tempo Push-ups (5s/5s): 3 Sets × 6 Reps', 'Depth and control.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Horse Stance: 2 Sets × 90 Seconds', 'You should be lower now than at Level 3.', 2 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Cossack Squat: 3 Sets × 8 Reps/Side', 'Lateral leg strength.', 3 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'The Iron Shell (Isometrics): 5 Sets × 10 Seconds Max Tension', 'Inhale → Exhale + Squeeze EVERY muscle at 100%. Vibrate.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Hollow Body Hold: 3 Sets × 35 Seconds', 'Extended hold.', 2 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Lunge Hold (L/R): 3 Sets × 45 Seconds', 'Static strength.', 3 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Bear (45s) + Monkey (45s) + Crab Mobility (30s)', 'Crab: Open the chest and strengthen the posterior chain.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'AAAAH Mantra: 25 Cycles + Jing Sealing', 'Sync the "Iron Shell" squeeze with the "AAAAH" exhale.', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEVEL 9: The Unbreaking Will
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 9, 'The Unbreaking Will', 760, 19, 2.5, 0.5, 70, 6)
  ON CONFLICT (path_id, level) DO UPDATE SET subtitle = EXCLUDED.subtitle, xp_to_level_up = EXCLUDED.xp_to_level_up, days_required = EXCLUDED.days_required, main_stat_limit = EXCLUDED.main_stat_limit, gate_stat_cap = EXCLUDED.gate_stat_cap, base_coins = EXCLUDED.base_coins, base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate_inserts AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting', 'There is no self. There is only the posture.', 1 FROM level_insert
  UNION ALL SELECT id, 'foundation', 'The Foundation', 'The muscles are dead; the fascia is alive. Push through honey.', 2 FROM level_insert
  UNION ALL SELECT id, 'core', 'The Core Link (The Gauntlet)', 'No rest between the 7 pillars. One unified cycle.', 3 FROM level_insert
  UNION ALL SELECT id, 'flow', 'The Flow', 'Fluid transitions. Move like a predator.', 4 FROM level_insert
  UNION ALL SELECT id, 'breath', 'The Breath', 'Advanced Jing Sealing. The "Fire" stays in the "Furnace."', 5 FROM level_insert
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Red Furnace', 'The Red Furnace', 'Master Tempo Gauntlet (10/10 Pushups + Squats) + 5m Animal Flow', 'Maintain perfect tension and heat throughout the entire flow.', 3000, 5, 1, 'Ronin''s Bokken'
FROM level_insert ON CONFLICT DO NOTHING;

WITH gate_lookup AS (SELECT g.id, g.gate_name FROM public.gates g JOIN public.path_levels pl ON g.path_level_id = pl.id WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 9)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 25 Minutes', 'There is no self. There is only the posture.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL SELECT id, 'Master Tempo Push-ups (10s/10s): 3 Sets × 5 Reps', 'The muscles are dead; the fascia is alive. Push through honey.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Master Tempo Squats (10s/10s): 3 Sets × 8 Reps', 'Ultra-slow control.', 2 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Archer Push-ups: 2 Sets × 5 Reps/Side', 'Unilateral strength.', 3 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'The 7 Pillar Gauntlet: Plank, Side L/R, Lunge L/R, Superman, Hollow Body (45s each)', 'No rest between the 7 pillars. One unified cycle.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Iron Shell: 8 Sets × 15 Seconds', 'Maximum tension.', 2 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'Animal Synthesis: 5 Minutes continuous Bear/Monkey/Crab', 'Fluid transitions. Move like a predator.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'AAAAH Mantra: 30 Cycles', 'Advanced Jing Sealing. The "Fire" stays in the "Furnace."', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEVEL 10: The Lighting of the Forge
-- ============================================================
WITH level_insert AS (
  INSERT INTO public.path_levels (path_id, level, subtitle, xp_to_level_up, days_required, main_stat_limit, gate_stat_cap, base_coins, base_stat_points)
  VALUES ('tempering-warrior-trainee', 10, 'The Lighting of the Forge', 840, 21, 2.5, 0.5, 75, 7)
  ON CONFLICT (path_id, level) DO UPDATE SET subtitle = EXCLUDED.subtitle, xp_to_level_up = EXCLUDED.xp_to_level_up, days_required = EXCLUDED.days_required, main_stat_limit = EXCLUDED.main_stat_limit, gate_stat_cap = EXCLUDED.gate_stat_cap, base_coins = EXCLUDED.base_coins, base_stat_points = EXCLUDED.base_stat_points
  RETURNING id
),
gate_inserts AS (
  INSERT INTO public.gates (path_level_id, gate_name, task_name, focus_description, task_order)
  SELECT id, 'rooting', 'The Rooting (Mastery)', 'Mastery. The vessel can now contain any amount of pressure.', 1 FROM level_insert
  UNION ALL SELECT id, 'foundation', 'The Foundation (Mastery)', 'You have become the Iron Way.', 2 FROM level_insert
  UNION ALL SELECT id, 'core', 'The Core Link (The Iron Gauntlet)', 'Absolute density. The body is a single, impenetrable unit.', 3 FROM level_insert
  UNION ALL SELECT id, 'flow', 'The Flow (The Chimera)', 'Mastery of space. Moving with the weight of the world.', 4 FROM level_insert
  UNION ALL SELECT id, 'breath', 'The Breath (Sealing)', 'The spark becomes a constant fire. You are ready to Evolve.', 5 FROM level_insert
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.trials (path_level_id, name, description, tasks_description, focus_description, reward_coins, reward_stars, reward_stat_points, reward_item)
SELECT id, 'The Gate of Fire', 'The Gate of Fire', 'Zhan Zhuang (30m) + Iron Shell (10 sets) + Recite the Vow', 'This is the point of no return. You are no longer a trainee. You are a Warrior.', 3000, 1, 50, 'Crown | Unlock: Stage 2'
FROM level_insert ON CONFLICT DO NOTHING;

WITH gate_lookup AS (SELECT g.id, g.gate_name FROM public.gates g JOIN public.path_levels pl ON g.path_level_id = pl.id WHERE pl.path_id = 'tempering-warrior-trainee' AND pl.level = 10)
INSERT INTO public.subtasks (gate_id, name, focus_description, subtask_order)
SELECT id, 'Zhan Zhuang: 35 Minutes', 'Mastery. The vessel can now contain any amount of pressure.', 1 FROM gate_lookup WHERE gate_name = 'rooting'
UNION ALL SELECT id, 'Master Tempo (10s/10s) Push-ups: 5 Sets × 5 Reps', 'You have become the Iron Way.', 1 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Archer Push-ups: 4 Sets × 8 Reps/Side', 'Advanced unilateral strength.', 2 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'Low Horse Stance (Thighs Parallel): 5 Sets × 2 Minutes', 'Ultimate leg endurance.', 3 FROM gate_lookup WHERE gate_name = 'foundation'
UNION ALL SELECT id, 'The 7 Pillar Gauntlet (90s each) + 10 Sets × 15s Iron Shell', 'Absolute density. The body is a single, impenetrable unit.', 1 FROM gate_lookup WHERE gate_name = 'core'
UNION ALL SELECT id, 'The Chimera Flow: 30 Minutes non-stop mobility (Bear/Monkey/Crab)', 'Mastery of space. Moving with the weight of the world.', 1 FROM gate_lookup WHERE gate_name = 'flow'
UNION ALL SELECT id, 'Unified Vibration: 50 Cycles', 'The spark becomes a constant fire. You are ready to Evolve.', 1 FROM gate_lookup WHERE gate_name = 'breath'
ON CONFLICT DO NOTHING;

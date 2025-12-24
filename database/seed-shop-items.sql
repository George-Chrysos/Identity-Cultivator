-- Seed Shop Items for Identity Cultivator
-- Run this in Supabase SQL editor to populate the item_templates table

-- Clear existing items (optional - comment out if you want to keep existing data)
-- DELETE FROM public.item_templates;

-- Insert shop items (buffs/items)
INSERT INTO public.item_templates (id, name, description, cost_coins, cost_stars, effect_type, effect_value, is_available, category, created_at)
VALUES
  ('item-001', 'Cheat Meal', 'Guilt-free fuel.', 300, NULL, 'reward', 1, true, 'items', NOW()),
  ('item-002', 'Cinema Night', 'Escape reality.', 500, NULL, 'reward', 1, true, 'items', NOW()),
  ('item-003', 'Coffee Boost', 'Extra energy surge.', 150, NULL, 'buff', 1, true, 'buffs', NOW()),
  ('item-004', 'Game Time', 'Level up your fun.', 400, NULL, 'reward', 1, true, 'items', NOW()),
  ('item-005', 'Movie Marathon', 'Binge without guilt.', 600, NULL, 'reward', 1, true, 'items', NOW()),
  ('item-006', 'Rest Day Pass', 'Skip the grind today.', 250, NULL, 'skip', 1, true, 'items', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  cost_coins = EXCLUDED.cost_coins,
  cost_stars = EXCLUDED.cost_stars,
  effect_type = EXCLUDED.effect_type,
  effect_value = EXCLUDED.effect_value,
  is_available = EXCLUDED.is_available,
  category = EXCLUDED.category;

-- Insert ticket items (luxury tickets with inflation mechanics)
INSERT INTO public.item_templates (
  id, name, description, cost_coins, effect_type, effect_value, is_available, 
  category, short_description, full_description, cooldown_time, base_inflation, icon, created_at
)
VALUES
  ('ticket-001', '15 Min Comic Reading', 'A brief delve into a graphic world. Good for micro-breaks.', 100, 'luxury', 1, true, 'tickets', 'Quick escape.', 'A brief delve into a graphic world. Good for micro-breaks.', 24, 0.5, 'BookOpen', NOW()),
  ('ticket-002', 'Eat Sweets', 'Indulge in refined sugars. Warning: High dopamine cost.', 250, 'luxury', 1, true, 'tickets', 'Sugar rush.', 'Indulge in refined sugars. Warning: High dopamine cost.', 48, 1.0, 'Candy', NOW()),
  ('ticket-003', '1 Hour Media', 'Youtube, Netflix, or Social Media. One hour of external projection.', 400, 'luxury', 1, true, 'tickets', 'Digital immersion.', 'Youtube, Netflix, or Social Media. One hour of external projection.', 24, 1.5, 'PlayCircle', NOW()),
  ('ticket-004', 'The Cloud Rain', 'Sexual release. High cost to Jing/Vital essence. Use sparingly to maintain cultivation base.', 1200, 'luxury', 1, true, 'tickets', 'Essence dispersion.', 'Sexual release. High cost to Jing/Vital essence. Use sparingly to maintain cultivation base.', 168, 3.0, 'CloudRain', NOW()),
  ('ticket-005', 'Order Takeout', 'Avoid cooking. Trade gold for convenience and processed calories.', 600, 'luxury', 1, true, 'tickets', 'Lazy nutrition.', 'Avoid cooking. Trade gold for convenience and processed calories.', 48, 1.0, 'Pizza', NOW()),
  ('ticket-006', 'Meet with Friend(s)', 'Socializing in a group. External energy exchange.', 200, 'luxury', 1, true, 'tickets', 'External Yang connection.', 'Socializing in a group. External energy exchange.', 12, 0.25, 'Users', NOW()),
  ('ticket-007', 'Visit Friends', 'One-on-one social connection. Strengthening external ties.', 200, 'luxury', 1, true, 'tickets', 'Deep social bond.', 'One-on-one social connection. Strengthening external ties.', 12, 0.25, 'Home', NOW()),
  ('ticket-008', 'Cinema / Theater', 'Immersive external story. High-level disassociation.', 800, 'luxury', 1, true, 'tickets', 'Grand spectacle.', 'Immersive external story. High-level disassociation.', 72, 0.5, 'Film', NOW()),
  ('ticket-009', 'Dine Outside', 'Full service meal. The ultimate luxury for a successful week of grind.', 1000, 'luxury', 1, true, 'tickets', 'Culinary indulgence.', 'Full service meal. The ultimate luxury for a successful week of grind.', 72, 0.75, 'Utensils', NOW()),
  ('ticket-010', 'Video Games (1 Hour)', 'Active digital engagement. Drains focus but provides high stimulation.', 250, 'luxury', 1, true, 'tickets', 'Interactive escapism.', 'Active digital engagement. Drains focus but provides high stimulation.', 24, 1.0, 'Gamepad', NOW()),
  ('ticket-011', 'Online Window Shopping', 'Browsing without intent. A high-cost distraction for the mind.', 200, 'luxury', 1, true, 'tickets', 'Mental clutter.', 'Browsing without intent. A high-cost distraction for the mind.', 48, 1.5, 'ShoppingBag', NOW()),
  ('ticket-012', 'Soda / Energy Drink', 'Caffeine and sugar hit. Temporary energy at the cost of long-term stability.', 150, 'luxury', 1, true, 'tickets', 'Liquid spark.', 'Caffeine and sugar hit. Temporary energy at the cost of long-term stability.', 24, 1.0, 'Coffee', NOW()),
  ('ticket-013', 'Fancy Coffee / Boba', 'High-priced liquid dopamine. A social status vice.', 250, 'luxury', 1, true, 'tickets', 'Aesthetic consumption.', 'High-priced liquid dopamine. A social status vice.', 24, 0.75, 'CupSoda', NOW()),
  ('ticket-014', 'Alcoholic Drink (1 Unit)', 'Dulled awareness and inhibited presence. Lowers the frequency of the vessel.', 350, 'luxury', 1, true, 'tickets', 'Numbing the senses.', 'Dulled awareness and inhibited presence. Lowers the frequency of the vessel.', 24, 2.0, 'Wine', NOW()),
  ('ticket-015', 'Vaping / Smoke Hit', 'Immediate nervous system hit. Highly damaging to the breath gate.', 150, 'luxury', 1, true, 'tickets', 'Toxic breath.', 'Immediate nervous system hit. Highly damaging to the breath gate.', 24, 2.5, 'Cigarette', NOW()),
  ('ticket-016', 'Gossip / Venting Session', 'Talking about others or complaining. Drains spiritual pressure and presence.', 200, 'luxury', 1, true, 'tickets', 'Verbal energy leak.', 'Talking about others or complaining. Drains spiritual pressure and presence.', 24, 1.0, 'MessageCircle', NOW()),
  ('ticket-017', 'Eat Fast Food', 'Quick processed meal. Convenient but taxing on the body vessel.', 350, 'luxury', 1, true, 'tickets', 'Quick processed fuel.', 'Quick processed meal. Convenient but taxing on the body vessel. High in sodium and unhealthy fats.', 24, 1.0, 'Burger', NOW()),
  ('ticket-018', 'Joint', 'Cannabis consumption. Alters consciousness and dulls presence. Use mindfully.', 500, 'luxury', 1, true, 'tickets', 'Mind fog.', 'Cannabis consumption. Alters consciousness and dulls presence. Can lead to lethargy and reduced motivation.', 48, 2.0, 'Leaf', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  cost_coins = EXCLUDED.cost_coins,
  effect_type = EXCLUDED.effect_type,
  effect_value = EXCLUDED.effect_value,
  is_available = EXCLUDED.is_available,
  category = EXCLUDED.category,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  cooldown_time = EXCLUDED.cooldown_time,
  base_inflation = EXCLUDED.base_inflation,
  icon = EXCLUDED.icon;

-- Verify insertion
SELECT id, name, cost_coins, effect_type, category, is_available FROM public.item_templates ORDER BY category, cost_coins;


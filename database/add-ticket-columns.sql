-- Migration: Add Ticket System Columns to item_templates
-- Run this in Supabase SQL editor to add ticket-specific fields

-- Add new columns for ticket system
ALTER TABLE public.item_templates
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'items',
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS full_description TEXT,
ADD COLUMN IF NOT EXISTS cooldown_time NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS base_inflation NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

-- Add index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_item_templates_category ON public.item_templates(category);

-- Add check constraint for category values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'item_templates_category_check'
    ) THEN
        ALTER TABLE public.item_templates
            ADD CONSTRAINT item_templates_category_check
            CHECK (category IN ('tickets', 'items', 'buffs'));
    END IF;
END$$;

-- Update existing items to have proper category
UPDATE public.item_templates
SET category = CASE
    WHEN effect_type = 'buff' OR effect_type = 'xp_multiplier' OR effect_type = 'stat_boost' THEN 'buffs'
    WHEN effect_type = 'luxury' THEN 'tickets'
    ELSE 'items'
END
WHERE category IS NULL OR category = 'items';

-- Add comment to table
COMMENT ON COLUMN public.item_templates.category IS 'Item category: tickets (luxury items with inflation), items (regular purchases), buffs (temporary boosts)';
COMMENT ON COLUMN public.item_templates.short_description IS 'Brief description for ticket cards';
COMMENT ON COLUMN public.item_templates.full_description IS 'Detailed description for ticket modals';
COMMENT ON COLUMN public.item_templates.cooldown_time IS 'How long does inflation will be added in the shop when purchasing a ticket';
COMMENT ON COLUMN public.item_templates.base_inflation IS 'Percentage increase (e.g., 1.0 = 100%) for each instance existing in inventory';
COMMENT ON COLUMN public.item_templates.icon IS 'Lucide-react icon name or emoji';

-- Verify changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'item_templates' AND table_schema = 'public'
ORDER BY ordinal_position;

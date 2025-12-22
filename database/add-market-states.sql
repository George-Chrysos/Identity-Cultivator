-- ============================================================
-- MARKET STATES TABLE MIGRATION
-- ============================================================
-- Stores market inflation/cooldown states per user per ticket
-- Previously stored in localStorage via shopStore
-- ============================================================

-- Create market_states table
CREATE TABLE IF NOT EXISTS public.market_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ticket_id VARCHAR(100) NOT NULL REFERENCES public.item_templates(id),
    last_purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cooldown_duration INTEGER NOT NULL DEFAULT 24, -- Hours until inflation expires
    base_inflation NUMERIC(5, 2) NOT NULL DEFAULT 0.25, -- e.g., 0.25 = 25%
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, ticket_id)
);

-- Add RLS policies
ALTER TABLE public.market_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own market states" ON public.market_states
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own market states" ON public.market_states
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own market states" ON public.market_states
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own market states" ON public.market_states
    FOR DELETE USING (auth.uid() = user_id);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_market_states_user ON public.market_states(user_id);
CREATE INDEX IF NOT EXISTS idx_market_states_ticket ON public.market_states(ticket_id);
CREATE INDEX IF NOT EXISTS idx_market_states_user_ticket ON public.market_states(user_id, ticket_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_market_states_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_market_states_updated_at ON public.market_states;
CREATE TRIGGER update_market_states_updated_at
    BEFORE UPDATE ON public.market_states
    FOR EACH ROW EXECUTE FUNCTION update_market_states_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.market_states IS 'Tracks market inflation/cooldown states for shop tickets per user';
COMMENT ON COLUMN public.market_states.last_purchased_at IS 'Timestamp when the ticket was last purchased, used to calculate cooldown expiration';
COMMENT ON COLUMN public.market_states.cooldown_duration IS 'Duration in hours until the inflation resets to base price';
COMMENT ON COLUMN public.market_states.base_inflation IS 'Inflation percentage as decimal (e.g., 0.5 = 50% price increase)';

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- Run this to verify the table was created correctly:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'market_states' AND table_schema = 'public';

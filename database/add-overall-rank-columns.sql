-- Migration: Add Overall Rank fields to profiles table
-- Description: Adds final_score and rank_tier columns to track player's overall rank
-- Run this in Supabase SQL Editor

-- Add final_score column (numeric with 2 decimal places)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS final_score NUMERIC(6, 2) DEFAULT 0 NOT NULL;

-- Add rank_tier column (text for F, F+, E, E+, D, D+, C, C+, B, B+, A, A+, S)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS rank_tier VARCHAR(3) DEFAULT 'F' NOT NULL;

-- Add index for rank tier queries
CREATE INDEX IF NOT EXISTS idx_profiles_rank_tier ON public.profiles(rank_tier);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.final_score IS 'Calculated overall rank score based on Body, Mind, Soul, Will dimensions';
COMMENT ON COLUMN public.profiles.rank_tier IS 'Overall rank tier (F, F+, E, E+, D, D+, C, C+, B, B+, A, A+, S)';

-- Update existing profiles with calculated rank (if any exist)
-- This will be recalculated automatically when dimensions change
UPDATE public.profiles
SET 
  final_score = 0,
  rank_tier = 'F'
WHERE final_score IS NULL OR rank_tier IS NULL;

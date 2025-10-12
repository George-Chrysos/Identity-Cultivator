/**
 * Tier-related constants
 * Single source of truth for tier ordering and scoring
 */

import { IdentityTier } from '@/models/cultivatorTypes';

/**
 * Tier order mapping (higher number = better tier)
 */
export const TIER_ORDER: Record<IdentityTier, number> = {
  'SSS': 13,
  'SS+': 12,
  'SS': 11,
  'S+': 10,
  'S': 9,
  'A+': 8,
  'A': 7,
  'B+': 6,
  'B': 5,
  'C+': 4,
  'C': 3,
  'D+': 2,
  'D': 1,
} as const;

/**
 * Get numeric score for a tier
 */
export const getTierScore = (tier: IdentityTier): number => {
  return TIER_ORDER[tier];
};

/**
 * Compare two tiers
 * @returns positive if tier1 > tier2, negative if tier1 < tier2, 0 if equal
 */
export const compareTiers = (tier1: IdentityTier, tier2: IdentityTier): number => {
  return TIER_ORDER[tier1] - TIER_ORDER[tier2];
};

/**
 * Get the previous tier (for evolution downgrade logic)
 */
export const getPreviousTier = (currentTier: IdentityTier): IdentityTier => {
  switch (currentTier) {
    case 'SSS': return 'SS+';
    case 'SS+': return 'SS';
    case 'SS': return 'S+';
    case 'S+': return 'S';
    case 'S': return 'A+';
    case 'A+': return 'A';
    case 'A': return 'B+';
    case 'B+': return 'B';
    case 'B': return 'C+';
    case 'C+': return 'C';
    case 'C': return 'D+';
    case 'D+': return 'D';
    case 'D': return 'D';
    default: return 'D';
  }
};

/**
 * Get the old tier (simplified version for certain calculations)
 */
export const getOldTier = (currentTier: IdentityTier): IdentityTier => {
  switch (currentTier) {
    case 'C': return 'D';
    case 'B': return 'C';
    case 'A': return 'B';
    case 'S': return 'A';
    default: return 'D';
  }
};

/**
 * All tiers in ascending order
 */
export const TIERS_ASCENDING: IdentityTier[] = [
  'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S+', 'SS', 'SS+', 'SSS'
] as const;

/**
 * All tiers in descending order
 */
export const TIERS_DESCENDING: IdentityTier[] = [
  'SSS', 'SS+', 'SS', 'S+', 'S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D'
] as const;

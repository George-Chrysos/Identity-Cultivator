import { logger } from './logger';

/**
 * Player Dimensions Interface
 */
export interface PlayerDimensions {
  body: number;
  mind: number;
  soul: number;
  will: number;
}

/**
 * Overall Rank Result
 */
export interface OverallRankResult {
  finalScore: number;
  rankTier: string;
}

/**
 * Stat Point Thresholds - Maps rank letters to minimum points
 * These match getStatRank() in PlayerCard.tsx
 */
const STAT_THRESHOLDS = [
  { min: 0, rank: 'F', value: 0 },
  { min: 5, rank: 'F+', value: 1 },
  { min: 10, rank: 'E', value: 2 },
  { min: 15, rank: 'E+', value: 3 },
  { min: 20, rank: 'D', value: 4 },
  { min: 25, rank: 'D+', value: 5 },
  { min: 30, rank: 'C', value: 6 },
  { min: 35, rank: 'C+', value: 7 },
  { min: 40, rank: 'B', value: 8 },
  { min: 45, rank: 'B+', value: 9 },
  { min: 50, rank: 'A', value: 10 },
  { min: 55, rank: 'A+', value: 11 },
  { min: 60, rank: 'S', value: 12 },
] as const;

/**
 * Convert raw stat points to a rank value (0-12 scale)
 * F=0, F+=1, E=2, E+=3, D=4, D+=5, C=6, C+=7, B=8, B+=9, A=10, A+=11, S=12
 */
const statPointsToRankValue = (points: number): number => {
  for (let i = STAT_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= STAT_THRESHOLDS[i].min) {
      return STAT_THRESHOLDS[i].value;
    }
  }
  return 0;
};

/**
 * Overall Rank Thresholds - Maps average rank value to overall rank
 * Average of 4 stats on 0-12 scale → Overall rank letter
 * Uses midpoints between rank values for more accurate mapping
 */
const OVERALL_RANK_THRESHOLDS = [
  { min: 0, rank: 'F' },
  { min: 0.5, rank: 'F+' },
  { min: 1.5, rank: 'E' },
  { min: 2.5, rank: 'E+' },
  { min: 4.0, rank: 'D' },
  { min: 4.5, rank: 'D+' },
  { min: 5.5, rank: 'C' },
  { min: 6.5, rank: 'C+' },
  { min: 7.5, rank: 'B' },
  { min: 8.5, rank: 'B+' },
  { min: 9.5, rank: 'A' },
  { min: 10.5, rank: 'A+' },
  { min: 11.5, rank: 'S' },
] as const;

/**
 * Map average rank value to overall rank tier
 */
const mapAverageToRank = (avgValue: number): string => {
  for (let i = OVERALL_RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (avgValue >= OVERALL_RANK_THRESHOLDS[i].min) {
      return OVERALL_RANK_THRESHOLDS[i].rank;
    }
  }
  return 'F';
};

/**
 * Calculate Overall Rank from player dimensions
 * 
 * Formula: 70/30 Weighted Rank
 * 1. Convert each stat's raw points to a rank value (0-12 scale)
 * 2. Sort the 4 rank values from highest to lowest
 * 3. EliteAverage = Average of top 3 values (70% weight)
 * 4. Anchor = Lowest value (30% weight)
 * 5. FinalValue = (EliteAverage * 0.7) + (Anchor * 0.3)
 * 6. Map the final value to a rank letter
 * 
 * Example: Stats with rank values (6, 6, 6, 2)
 *   EliteAverage = (6 + 6 + 6) / 3 = 6
 *   Anchor = 2
 *   FinalValue = (6 * 0.7) + (2 * 0.3) = 4.2 + 0.6 = 4.8 → D+ rank
 * 
 * @param dimensions - Player's four core dimensions (raw stat points)
 * @returns Object with finalScore and rankTier
 */
export const calculateOverallRank = (dimensions: PlayerDimensions): OverallRankResult => {
  const { body, mind, soul, will } = dimensions;
  
  // Step 1: Convert raw points to rank values (0-12 scale)
  const bodyRank = statPointsToRankValue(body);
  const mindRank = statPointsToRankValue(mind);
  const soulRank = statPointsToRankValue(soul);
  const willRank = statPointsToRankValue(will);
  
  // Step 2: Sort rank values from highest to lowest
  const sortedRanks = [bodyRank, mindRank, soulRank, willRank].sort((a, b) => b - a);
  
  // Step 3: Calculate EliteAverage (top 3 values)
  const eliteAverage = (sortedRanks[0] + sortedRanks[1] + sortedRanks[2]) / 3;
  
  // Step 4: Get Anchor (lowest value)
  const anchor = sortedRanks[3];
  
  // Step 5: Calculate weighted final value (70/30 split)
  const finalValue = (eliteAverage * 0.7) + (anchor * 0.3);
  
  // Step 6: Map to rank tier
  const rankTier = mapAverageToRank(finalValue);
  
  // Score is the final value for display (0-12 scale)
  const finalScore = Math.round(finalValue * 100) / 100;
  
  logger.debug('Overall rank calculated', {
    rawDimensions: { body, mind, soul, will },
    rankValues: { bodyRank, mindRank, soulRank, willRank },
    sortedRanks,
    eliteAverage,
    anchor,
    finalValue,
    finalScore,
    rankTier,
  });
  
  return {
    finalScore,
    rankTier,
  };
};

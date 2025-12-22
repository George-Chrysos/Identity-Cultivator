/**
 * The Blind Leveling System - Seal Progression Logic
 * Calculates seal levels based on consistency (total_days_active)
 */

export interface SealProgressData {
  level: number;
  progressToNext: number; // 0-100%
  daysToNextLevel: number;
  multiplier: number; // Stat bonus multiplier
}

/**
 * Calculate seal progression using the Blind Leveling formula
 * 
 * Formula: Level = Floor(total_days_active / 5)
 * 
 * Progression Tiers:
 * - 0-4 Days = Level 0 (Unsealed)
 * - 5-9 Days = Level 1 (The Spark)
 * - 10-14 Days = Level 2
 * - 25 Days = Level 5 (The Habit)
 * - 50 Days = Level 10 (The Transmutation)
 * 
 * @param totalDaysActive - Cumulative count of days this seal was selected
 * @returns SealProgressData with level, progress, and multiplier
 */
export const calculateSealProgress = (totalDaysActive: number): SealProgressData => {
  // Calculate current level
  const level = Math.floor(totalDaysActive / 5);
  
  // Calculate progress to next level (0-100%)
  const daysIntoCurrentLevel = totalDaysActive % 5;
  const progressToNext = (daysIntoCurrentLevel / 5) * 100;
  
  // Calculate days needed to reach next level
  const daysToNextLevel = 5 - daysIntoCurrentLevel;
  
  // Calculate stat multiplier
  // Formula: 1 + (level * 0.05)
  // Example: Level 5 = 1.25x, Level 10 = 1.50x
  const multiplier = 1 + (level * 0.05);
  
  return {
    level,
    progressToNext,
    daysToNextLevel,
    multiplier,
  };
};

/**
 * Get the display name for a seal level
 * @param level - The seal level
 * @returns Human-readable level name
 */
export const getSealLevelName = (level: number): string => {
  if (level === 0) return 'Unsealed';
  if (level === 1) return 'The Spark';
  if (level >= 2 && level <= 4) return 'The Ember';
  if (level === 5) return 'The Habit';
  if (level >= 6 && level <= 9) return 'The Foundation';
  if (level === 10) return 'The Transmutation';
  if (level >= 11 && level <= 14) return 'The Master';
  if (level >= 15) return 'The Legend';
  return `Level ${level}`;
};

/**
 * Calculate total stat bonus from all seals
 * Used for calculating the user's Body/Mind/Soul stats
 * 
 * @param sealLevels - Map of seal_id to level
 * @returns Combined multiplier for stat calculations
 */
export const calculateTotalSealMultiplier = (sealLevels: Record<string, number>): number => {
  const multipliers = Object.values(sealLevels).map(level => {
    return 1 + (level * 0.05);
  });
  
  // Average all multipliers
  if (multipliers.length === 0) return 1;
  const sum = multipliers.reduce((acc, m) => acc + m, 0);
  return sum / multipliers.length;
};

/**
 * Check if a seal should trigger a level-up notification
 * Call this after updating totalDaysActive
 * 
 * @param oldDays - Previous total_days_active
 * @param newDays - Updated total_days_active
 * @returns true if the user leveled up
 */
export const didSealLevelUp = (oldDays: number, newDays: number): boolean => {
  const oldLevel = Math.floor(oldDays / 5);
  const newLevel = Math.floor(newDays / 5);
  return newLevel > oldLevel;
};

/**
 * Streak Manager Service
 * Handles streak milestone calculations, rewards, and Will point progression.
 * 
 * Formula: Milestone = (2 * currentLevel) + 1
 * Sub-Milestones: For levels >= 5, trigger mini-rewards every 7 days
 * Will gains calibrated for E(10) → D+(~25) across 10 levels
 * 
 * @module services/StreakManager
 */

import { logger } from '@/utils/logger';

// ==================== TYPES ====================

export interface StreakMilestone {
  level: number;
  milestoneDays: number;
  rewards: {
    coins: number;
    stars: number;
    ticket?: string;
  };
  willGain: number;
}

export interface SubMilestone {
  day: number;
  rewards: {
    coins: number;
    stars: number;
  };
  willGain: number;
}

export interface StreakState {
  currentStreak: number;
  maxStreak: number;
  currentLevel: number;
  totalWillEarned: number;
  streakHistory: StreakHistoryEntry[];
}

export interface StreakHistoryEntry {
  level: number;
  maxStreak: number;
  completedAt: string;
  willEarned: number;
}

export type StreakStage = 'ember' | 'flame' | 'singularity' | 'explosion';

export interface StreakVisualState {
  stage: StreakStage;
  daysUntilMilestone: number;
  progressPercent: number;
  isSubMilestoneDay: boolean;
}

// ==================== CONSTANTS ====================

/**
 * Milestone configuration per level
 * User-defined rewards and Will gains for streak completion
 * 
 * Sub-milestones: For levels >= 4, trigger at day 7 and 14
 * - Level 4-6: Day 7 sub-milestone
 * - Level 7-10: Day 7 and Day 14 sub-milestones
 */
export const STREAK_MILESTONES: StreakMilestone[] = [
  // L1: 3 days milestone
  { level: 1, milestoneDays: 3, rewards: { coins: 50, stars: 0 }, willGain: 0.25 },
  
  // L2: 5 days milestone
  { level: 2, milestoneDays: 5, rewards: { coins: 75, stars: 1 }, willGain: 0.40 },
  
  // L3: 7 days milestone
  { level: 3, milestoneDays: 7, rewards: { coins: 100, stars: 0 }, willGain: 0.60 },
  
  // L4: 9 days milestone (sub-milestone at day 7)
  { level: 4, milestoneDays: 9, rewards: { coins: 150, stars: 0 }, willGain: 0.80 },
  
  // L5: 11 days milestone (sub-milestone at day 7)
  { level: 5, milestoneDays: 11, rewards: { coins: 250, stars: 2 }, willGain: 1.00 },
  
  // L6: 13 days milestone (sub-milestone at day 7)
  { level: 6, milestoneDays: 13, rewards: { coins: 350, stars: 0 }, willGain: 1.25 },
  
  // L7: 15 days milestone (sub-milestones at day 7, 14)
  { level: 7, milestoneDays: 15, rewards: { coins: 450, stars: 0 }, willGain: 1.50 },
  
  // L8: 17 days milestone (sub-milestones at day 7, 14)
  { level: 8, milestoneDays: 17, rewards: { coins: 500, stars: 3 }, willGain: 2.00 },
  
  // L9: 19 days milestone (sub-milestones at day 7, 14)
  { level: 9, milestoneDays: 19, rewards: { coins: 750, stars: 0 }, willGain: 2.50 },
  
  // L10: 21 days milestone (sub-milestones at day 7, 14)
  { level: 10, milestoneDays: 21, rewards: { coins: 1000, stars: 5 }, willGain: 3.00 },
];

// Sub-milestone rewards (triggered at day 7 for levels >= 4, and day 14 for levels >= 7)
export const SUB_MILESTONE_REWARDS: SubMilestone = {
  day: 7, // Base trigger day - also triggers at 14 for levels >= 7
  rewards: { coins: 50, stars: 0 },
  willGain: 0.15,
};

// Maximum total Will points earnable from streak system (L1-10)
export const MAX_TOTAL_WILL = 15.0;

// ==================== CORE FUNCTIONS ====================

/**
 * Calculate milestone days for a given level using formula: (2 * level) + 1
 */
export const calculateMilestoneDays = (level: number): number => {
  return (2 * level) + 1;
};

/**
 * Get milestone configuration for a level
 */
export const getMilestoneForLevel = (level: number): StreakMilestone | null => {
  return STREAK_MILESTONES.find(m => m.level === level) || null;
};

/**
 * Check if current streak has reached the milestone for the level
 */
export const hasReachedMilestone = (currentStreak: number, level: number): boolean => {
  const milestone = getMilestoneForLevel(level);
  if (!milestone) return false;
  return currentStreak >= milestone.milestoneDays;
};

/**
 * Check if current day is a sub-milestone day
 * - Level 4-6: Sub-milestone at day 7 only
 * - Level 7-10: Sub-milestones at day 7 AND day 14
 */
export const isSubMilestoneDay = (currentStreak: number, level: number): boolean => {
  // Sub-milestones only start at level 4
  if (level < 4) return false;
  
  const milestone = getMilestoneForLevel(level);
  if (!milestone) return false;
  
  // Don't count sub-milestone on the exact final milestone day
  if (currentStreak === milestone.milestoneDays) return false;
  
  // Day 7 sub-milestone for levels >= 4
  if (currentStreak === 7 && level >= 4) return true;
  
  // Day 14 sub-milestone for levels >= 7
  if (currentStreak === 14 && level >= 7) return true;
  
  return false;
};

/**
 * Get sub-milestone rewards if applicable
 */
export const getSubMilestoneRewards = (currentStreak: number, level: number): SubMilestone | null => {
  if (!isSubMilestoneDay(currentStreak, level)) return null;
  return SUB_MILESTONE_REWARDS;
};

/**
 * Calculate Will gain with float precision (floor to 2 decimal places)
 */
export const calculateWillGain = (baseWill: number): number => {
  return Math.floor(baseWill * 100) / 100;
};

/**
 * Calculate total Will points that can be earned from levels 1-10
 * Used for validation and cap enforcement
 */
export const calculateTotalWillFromMilestones = (): number => {
  let total = 0;
  
  for (const milestone of STREAK_MILESTONES) {
    total += milestone.willGain;
    
    // Add sub-milestone Will for levels >= 5
    if (milestone.level >= 5) {
      const numSubMilestones = Math.floor((milestone.milestoneDays - 1) / 7);
      total += numSubMilestones * SUB_MILESTONE_REWARDS.willGain;
    }
  }
  
  return calculateWillGain(total);
};

/**
 * Enforce Will cap - ensures total Will earned never exceeds MAX_TOTAL_WILL
 */
export const enforceWillCap = (currentTotal: number, proposedGain: number): number => {
  const newTotal = currentTotal + proposedGain;
  if (newTotal > MAX_TOTAL_WILL) {
    return Math.max(0, calculateWillGain(MAX_TOTAL_WILL - currentTotal));
  }
  return calculateWillGain(proposedGain);
};

// ==================== VISUAL STATE ====================

/**
 * Determine the visual stage based on streak progress
 * Stage 1: Ember (Days 1-2)
 * Stage 2: Blue Flame (Day 3 to sub-milestone threshold)
 * Stage 3: Singularity (1-2 days before milestone) - ONLY available at level >= 4
 * Stage 4: Explosion (Milestone day) - ONLY available at level >= 4
 * 
 * Note: For levels 1-3, max stage is "flame" to create anticipation for higher levels.
 * The intense visual effects (singularity/explosion) are unlocked after proving
 * initial consistency through the first 3 levels (~7+ day streaks).
 */
export const getStreakVisualState = (currentStreak: number, level: number): StreakVisualState => {
  const milestone = getMilestoneForLevel(level);
  if (!milestone) {
    return {
      stage: 'ember',
      daysUntilMilestone: Infinity,
      progressPercent: 0,
      isSubMilestoneDay: false,
    };
  }

  const milestoneDays = milestone.milestoneDays;
  const daysUntilMilestone = Math.max(0, milestoneDays - currentStreak);
  const progressPercent = Math.min(100, (currentStreak / milestoneDays) * 100);
  const isSubMilestone = isSubMilestoneDay(currentStreak, level);

  // For levels 1-3, cap at flame stage (no singularity/explosion)
  // This means intense effects require level >= 4 (streak > 7 days proven)
  const canAccessAdvancedStages = level >= 4;

  let stage: StreakStage;

  if (currentStreak >= milestoneDays) {
    // At milestone - explosion only if level >= 4, otherwise flame
    stage = canAccessAdvancedStages ? 'explosion' : 'flame';
  } else if (currentStreak <= 2) {
    // Days 1-2 are always ember stage
    stage = 'ember';
  } else if (daysUntilMilestone <= 2 && canAccessAdvancedStages) {
    // 1-2 days before milestone (but not days 1-2) - only at level >= 4
    stage = 'singularity';
  } else {
    // Day 3+ before singularity threshold
    stage = 'flame';
  }

  return {
    stage,
    daysUntilMilestone,
    progressPercent,
    isSubMilestoneDay: isSubMilestone,
  };
};

// ==================== STREAK STATE MANAGEMENT ====================

/**
 * Create initial streak state
 */
export const createInitialStreakState = (): StreakState => ({
  currentStreak: 0,
  maxStreak: 0,
  currentLevel: 1,
  totalWillEarned: 0,
  streakHistory: [],
});

/**
 * Increment streak and check for rewards
 * Returns the rewards to be given (if any)
 */
export const incrementStreak = (
  state: StreakState
): {
  newState: StreakState;
  milestoneReached: boolean;
  subMilestoneReached: boolean;
  rewards: StreakMilestone['rewards'] | null;
  subRewards: SubMilestone['rewards'] | null;
  willGain: number;
} => {
  const newStreak = state.currentStreak + 1;
  const newMaxStreak = Math.max(state.maxStreak, newStreak);
  
  let willGain = 0;
  let rewards: StreakMilestone['rewards'] | null = null;
  let subRewards: SubMilestone['rewards'] | null = null;
  let milestoneReached = false;
  let subMilestoneReached = false;

  // Check for sub-milestone (before main milestone check)
  if (isSubMilestoneDay(newStreak, state.currentLevel)) {
    subMilestoneReached = true;
    subRewards = SUB_MILESTONE_REWARDS.rewards;
    const cappedSubWill = enforceWillCap(state.totalWillEarned, SUB_MILESTONE_REWARDS.willGain);
    willGain += cappedSubWill;
  }

  // Check for main milestone
  const milestone = getMilestoneForLevel(state.currentLevel);
  if (milestone && newStreak >= milestone.milestoneDays && state.currentStreak < milestone.milestoneDays) {
    milestoneReached = true;
    rewards = milestone.rewards;
    const cappedWill = enforceWillCap(state.totalWillEarned + willGain, milestone.willGain);
    willGain += cappedWill;
  }

  const newState: StreakState = {
    ...state,
    currentStreak: newStreak,
    maxStreak: newMaxStreak,
    totalWillEarned: calculateWillGain(state.totalWillEarned + willGain),
  };

  logger.info('Streak incremented', { 
    newStreak, 
    milestoneReached, 
    subMilestoneReached,
    willGain,
    totalWill: newState.totalWillEarned,
  });

  return {
    newState,
    milestoneReached,
    subMilestoneReached,
    rewards,
    subRewards,
    willGain: calculateWillGain(willGain),
  };
};

/**
 * Handle prestige reset (level up)
 * Saves max streak to history and resets current streak to 0
 */
export const handlePrestigeReset = (state: StreakState): StreakState => {
  const milestone = getMilestoneForLevel(state.currentLevel);
  const willEarned = milestone?.willGain || 0;

  // Save current level's streak to history
  const historyEntry: StreakHistoryEntry = {
    level: state.currentLevel,
    maxStreak: state.maxStreak,
    completedAt: new Date().toISOString(),
    willEarned: calculateWillGain(willEarned),
  };

  const newState: StreakState = {
    currentStreak: 0, // CRITICAL: Reset to 0 on level up (Purification)
    maxStreak: 0, // Reset max streak for new level
    currentLevel: state.currentLevel + 1,
    totalWillEarned: state.totalWillEarned,
    streakHistory: [...state.streakHistory, historyEntry],
  };

  logger.info('Prestige reset triggered', {
    previousLevel: state.currentLevel,
    newLevel: newState.currentLevel,
    maxStreakSaved: historyEntry.maxStreak,
    currentStreak: newState.currentStreak,
  });

  return newState;
};

/**
 * Reset streak on missed day (breaks the chain)
 */
export const resetStreak = (state: StreakState): StreakState => {
  logger.info('Streak broken', { previousStreak: state.currentStreak });
  
  return {
    ...state,
    currentStreak: 0,
  };
};

// ==================== VALIDATION ====================

/**
 * Validate that the milestone formula is correct for level 10
 */
export const validateMilestoneFormula = (): boolean => {
  const level10Milestone = calculateMilestoneDays(10);
  const expected = 21; // (2 * 10) + 1 = 21
  
  if (level10Milestone !== expected) {
    logger.error('Milestone formula validation failed', { level10Milestone, expected });
    return false;
  }
  
  logger.info('Milestone formula validated', { level10: level10Milestone });
  return true;
};

/**
 * Validate total Will points are within cap
 */
export const validateWillCap = (): boolean => {
  const totalWill = calculateTotalWillFromMilestones();
  const isValid = totalWill >= 12 && totalWill <= MAX_TOTAL_WILL;
  
  if (!isValid) {
    logger.error('Will cap validation failed', { totalWill, min: 12, max: MAX_TOTAL_WILL });
  } else {
    logger.info('Will cap validated', { totalWill });
  }
  
  return isValid;
};

// ==================== REWARD INTEGRATION ====================

/**
 * Award milestone rewards using the gameStore's updateRewards function.
 * This integrates Will stat gains the same way Body/Mind/Soul stats are awarded.
 * 
 * @param updateRewards - The gameStore's updateRewards function (coins, statType, statPoints, stars)
 * @param milestoneRewards - Rewards from reaching a milestone
 * @param subMilestoneRewards - Rewards from reaching a sub-milestone
 * @param willGain - Will points to award (already cap-enforced)
 */
export const awardMilestoneRewards = async (
  updateRewards: (coins: number, statType: string, statPoints: number, stars?: number) => Promise<void>,
  milestoneRewards: StreakMilestone['rewards'] | null,
  subMilestoneRewards: SubMilestone['rewards'] | null,
  willGain: number
): Promise<void> => {
  // Aggregate all coin/star rewards
  let totalCoins = 0;
  let totalStars = 0;

  if (subMilestoneRewards) {
    totalCoins += subMilestoneRewards.coins;
    totalStars += subMilestoneRewards.stars;
  }

  if (milestoneRewards) {
    totalCoins += milestoneRewards.coins;
    totalStars += milestoneRewards.stars;
  }

  // Award coins and stars together
  if (totalCoins > 0 || totalStars > 0) {
    await updateRewards(totalCoins, '', 0, totalStars);
    logger.info('Milestone rewards awarded', { coins: totalCoins, stars: totalStars });
  }

  // Award Will points using the same pattern as Body stat
  // The updateRewards function accepts 'will' as statType
  if (willGain > 0) {
    await updateRewards(0, 'will', willGain);
    logger.info('Milestone Will points awarded', { willGain });
  }

  // Log ticket rewards - tickets are handled through inventory system
  if (milestoneRewards?.ticket) {
    logger.info('Milestone ticket reward pending', { 
      ticket: milestoneRewards.ticket 
    });
  }
};

/**
 * Calculate and award rewards for streak milestone completion.
 * Call this when all daily tasks are completed.
 * 
 * @param currentStreak - Current streak count (before increment)
 * @param level - Current player level
 * @param updateRewards - The gameStore's updateRewards function
 * @returns Object containing reward info and whether to show celebration
 */
export const processStreakCompletion = async (
  currentStreak: number,
  level: number,
  totalWillEarned: number,
  updateRewards: (coins: number, statType: string, statPoints: number) => Promise<void>
): Promise<{
  newStreak: number;
  milestoneReached: boolean;
  subMilestoneReached: boolean;
  willGained: number;
  showCelebration: boolean;
}> => {
  const newStreak = currentStreak + 1;
  
  let willGained = 0;
  let milestoneReached = false;
  let subMilestoneReached = false;

  // Check for sub-milestone
  if (isSubMilestoneDay(newStreak, level)) {
    subMilestoneReached = true;
    const cappedWill = enforceWillCap(totalWillEarned, SUB_MILESTONE_REWARDS.willGain);
    willGained += cappedWill;
    
    await awardMilestoneRewards(
      updateRewards,
      null,
      SUB_MILESTONE_REWARDS.rewards,
      cappedWill
    );
  }

  // Check for main milestone
  const milestone = getMilestoneForLevel(level);
  if (milestone && newStreak >= milestone.milestoneDays && currentStreak < milestone.milestoneDays) {
    milestoneReached = true;
    const cappedWill = enforceWillCap(totalWillEarned + willGained, milestone.willGain);
    willGained += cappedWill;
    
    await awardMilestoneRewards(
      updateRewards,
      milestone.rewards,
      null,
      cappedWill
    );
  }

  logger.info('Streak completion processed', {
    newStreak,
    milestoneReached,
    subMilestoneReached,
    willGained,
  });

  return {
    newStreak,
    milestoneReached,
    subMilestoneReached,
    willGained: calculateWillGain(willGained),
    showCelebration: milestoneReached,
  };
};

/**
 * Progression Service
 * Handles level progression, streak milestone integration, and Will stat awards.
 * 
 * @module services/ProgressionService
 */

import { logger } from '@/utils/logger';
import {
  StreakState,
  StreakMilestone,
  SubMilestone,
  incrementStreak,
  handlePrestigeReset,
  resetStreak,
  getMilestoneForLevel,
  hasReachedMilestone,
  calculateWillGain,
  enforceWillCap,
  MAX_TOTAL_WILL,
  createInitialStreakState,
  getStreakVisualState,
  StreakVisualState,
} from './StreakManager';

// ==================== TYPES ====================

export interface ProgressionState {
  level: number;
  currentXP: number;
  maxXP: number;
  streakState: StreakState;
}

export interface TaskCompletionResult {
  xpGained: number;
  coinsGained: number;
  statPointsGained: number;
  streakIncremented: boolean;
  milestoneReached: boolean;
  subMilestoneReached: boolean;
  milestoneRewards: StreakMilestone['rewards'] | null;
  subMilestoneRewards: SubMilestone['rewards'] | null;
  willGained: number;
  leveledUp: boolean;
  newLevel: number | null;
  visualState: StreakVisualState;
}

export interface DailyCompletionResult {
  success: boolean;
  streakResult: ReturnType<typeof incrementStreak>;
  visualState: StreakVisualState;
}

export interface LevelUpResult {
  success: boolean;
  previousLevel: number;
  newLevel: number;
  streakReset: boolean;
  historyEntry: {
    level: number;
    maxStreak: number;
    willEarned: number;
  };
}

// ==================== PROGRESSION SERVICE ====================

/**
 * Create initial progression state
 */
export const createInitialProgressionState = (level: number = 1, maxXP: number = 100): ProgressionState => ({
  level,
  currentXP: 0,
  maxXP,
  streakState: createInitialStreakState(),
});

/**
 * Process daily task completion
 * Handles streak increment, milestone checks, and reward calculation
 */
export const processDailyCompletion = (
  streakState: StreakState,
  isAllTasksComplete: boolean = true
): DailyCompletionResult => {
  if (!isAllTasksComplete) {
    return {
      success: false,
      streakResult: {
        newState: streakState,
        milestoneReached: false,
        subMilestoneReached: false,
        rewards: null,
        subRewards: null,
        willGain: 0,
      },
      visualState: getStreakVisualState(streakState.currentStreak, streakState.currentLevel),
    };
  }

  const streakResult = incrementStreak(streakState);
  const visualState = getStreakVisualState(
    streakResult.newState.currentStreak,
    streakResult.newState.currentLevel
  );

  logger.info('Daily completion processed', {
    newStreak: streakResult.newState.currentStreak,
    milestoneReached: streakResult.milestoneReached,
    subMilestoneReached: streakResult.subMilestoneReached,
    willGain: streakResult.willGain,
    visualStage: visualState.stage,
  });

  return {
    success: true,
    streakResult,
    visualState,
  };
};

/**
 * Process level up (prestige reset)
 * Saves streak history and resets current streak to 0
 */
export const processLevelUp = (streakState: StreakState): LevelUpResult => {
  const previousLevel = streakState.currentLevel;
  const milestone = getMilestoneForLevel(previousLevel);
  
  // Check if milestone was reached before allowing level up
  if (!hasReachedMilestone(streakState.currentStreak, previousLevel)) {
    logger.warn('Level up attempted without reaching milestone', {
      currentStreak: streakState.currentStreak,
      requiredStreak: milestone?.milestoneDays,
    });
    
    return {
      success: false,
      previousLevel,
      newLevel: previousLevel,
      streakReset: false,
      historyEntry: {
        level: previousLevel,
        maxStreak: streakState.maxStreak,
        willEarned: 0,
      },
    };
  }

  const newState = handlePrestigeReset(streakState);
  const lastHistoryEntry = newState.streakHistory[newState.streakHistory.length - 1];

  logger.info('Level up processed', {
    previousLevel,
    newLevel: newState.currentLevel,
    streakReset: newState.currentStreak === 0,
    maxStreakSaved: lastHistoryEntry.maxStreak,
  });

  return {
    success: true,
    previousLevel,
    newLevel: newState.currentLevel,
    streakReset: true,
    historyEntry: {
      level: lastHistoryEntry.level,
      maxStreak: lastHistoryEntry.maxStreak,
      willEarned: lastHistoryEntry.willEarned,
    },
  };
};

/**
 * Process streak break (missed day)
 */
export const processStreakBreak = (streakState: StreakState): StreakState => {
  logger.info('Processing streak break', { currentStreak: streakState.currentStreak });
  return resetStreak(streakState);
};

/**
 * Calculate Will points to award with cap enforcement
 */
export const calculateWillAward = (
  currentTotalWill: number,
  proposedWillGain: number
): { actualGain: number; capped: boolean; newTotal: number } => {
  const actualGain = enforceWillCap(currentTotalWill, proposedWillGain);
  const capped = actualGain < proposedWillGain;
  const newTotal = calculateWillGain(currentTotalWill + actualGain);

  logger.debug('Will award calculated', {
    currentTotal: currentTotalWill,
    proposed: proposedWillGain,
    actual: actualGain,
    capped,
    newTotal,
  });

  return { actualGain, capped, newTotal };
};

/**
 * Get current progression summary
 */
export const getProgressionSummary = (state: ProgressionState): {
  level: number;
  xpProgress: number;
  streak: number;
  maxStreak: number;
  totalWill: number;
  nextMilestone: number;
  visualState: StreakVisualState;
} => {
  const visualState = getStreakVisualState(
    state.streakState.currentStreak,
    state.level
  );
  const milestone = getMilestoneForLevel(state.level);

  return {
    level: state.level,
    xpProgress: (state.currentXP / state.maxXP) * 100,
    streak: state.streakState.currentStreak,
    maxStreak: state.streakState.maxStreak,
    totalWill: state.streakState.totalWillEarned,
    nextMilestone: milestone?.milestoneDays || 0,
    visualState,
  };
};

/**
 * Validate progression state integrity
 */
export const validateProgressionState = (state: ProgressionState): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (state.level < 1 || state.level > 10) {
    errors.push(`Invalid level: ${state.level}. Must be 1-10.`);
  }

  if (state.currentXP < 0 || state.currentXP > state.maxXP) {
    errors.push(`Invalid XP: ${state.currentXP}. Must be 0-${state.maxXP}.`);
  }

  if (state.streakState.currentStreak < 0) {
    errors.push(`Invalid streak: ${state.streakState.currentStreak}. Must be >= 0.`);
  }

  if (state.streakState.totalWillEarned > MAX_TOTAL_WILL) {
    errors.push(`Will cap exceeded: ${state.streakState.totalWillEarned}. Max is ${MAX_TOTAL_WILL}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ==================== REWARD AGGREGATION ====================

/**
 * Aggregate all rewards from a milestone + sub-milestone
 */
export const aggregateRewards = (
  milestoneRewards: StreakMilestone['rewards'] | null,
  subMilestoneRewards: SubMilestone['rewards'] | null
): { coins: number; stars: number; ticket?: string } => {
  let coins = 0;
  let stars = 0;
  let ticket: string | undefined;

  if (subMilestoneRewards) {
    coins += subMilestoneRewards.coins;
    stars += subMilestoneRewards.stars;
  }

  if (milestoneRewards) {
    coins += milestoneRewards.coins;
    stars += milestoneRewards.stars;
    ticket = milestoneRewards.ticket;
  }

  return { coins, stars, ticket };
};

// Re-export types and functions from StreakManager for convenience
export type {
  StreakState,
  StreakMilestone,
  SubMilestone,
  StreakVisualState,
  StreakStage,
} from './StreakManager';

export {
  createInitialStreakState,
  getStreakVisualState,
  hasReachedMilestone,
  getMilestoneForLevel,
  calculateWillGain,
  MAX_TOTAL_WILL,
  STREAK_MILESTONES,
} from './StreakManager';

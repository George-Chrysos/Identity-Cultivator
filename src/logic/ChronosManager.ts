/**
 * ChronosManager - The Midnight Reset Engine
 * 
 * Implements the 9 rules for daily reset logic:
 * 
 * Rule 1: When all tasks of a PathCard are completed, status changes to COMPLETED
 * Rule 2: When all tasks of a PathCard are completed, streak increases by 1
 * Rule 3: At midnight, all tasks reset to unchecked (rewards NOT reverted)
 * Rule 4: At midnight, PathCard status resets to PENDING
 * Rule 5: At midnight, Homepage shows new date
 * Rule 6: At midnight, uncompleted quests update date to new day
 * Rule 7: At midnight, recurring quests update date and reset (rewards kept)
 * Rule 8: Task completion updates daily_path_progress, streak reset if <100%
 * Rule 9: Each path tracks streak, start_day, current_xp, xp_needed
 * 
 * @module logic/ChronosManager
 */

import { logger } from '@/utils/logger';
import { gameDB } from '@/api/gameDatabase';
import type { 
  UserProfile, 
  PlayerIdentityWithDetails, 
  DailyPathProgress,
  DailyRecord,
  PathDailyStat,
} from '@/types/database';
import type { Quest } from '@/components/quest/QuestCard';

// ============================================================
// TYPES
// ============================================================

export interface ChronosResetResult {
  success: boolean;
  pathsProcessed: number;
  questsProcessed: number;
  streaksReset: string[]; // Path IDs where streak was reset to 0
  streaksMaintained: string[]; // Path IDs where streak was maintained
  dailyRecord: DailyRecord | null;
  errors: string[];
}

export interface PathProgressState {
  pathId: string;
  pathName: string;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  status: 'PENDING' | 'COMPLETED';
  streakBefore: number;
  streakAfter: number;
}

export interface DailyTaskState {
  completedTasks: string[];
  completedSubtasks: string[];
  date: string;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 * Supports testing mode via global store
 */
export const getTodayISO = (): string => {
  const testingStore = (window as unknown as { 
    __testingStore?: { 
      getState: () => { isTestingMode: boolean; testingDate: string } 
    } 
  }).__testingStore;
  
  if (testingStore) {
    const state = testingStore.getState();
    if (state.isTestingMode) {
      return new Date(state.testingDate).toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
};

/**
 * Get yesterday's date as ISO string
 */
export const getYesterdayISO = (): string => {
  const today = new Date(getTodayISO());
  today.setDate(today.getDate() - 1);
  return today.toISOString().split('T')[0];
};

/**
 * Format date for quest system (e.g., "Dec 25")
 */
export const formatDateForQuest = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

/**
 * Get today's formatted date for quests
 */
export const getTodayFormatted = (): string => {
  return formatDateForQuest(new Date(getTodayISO()));
};

// ============================================================
// DAILY PATH PROGRESS MANAGEMENT
// ============================================================

/**
 * Upsert daily path progress when a task is toggled
 * Rule 8: Every task completion updates today's record
 */
export const upsertDailyPathProgress = async (
  userId: string,
  pathId: string,
  totalTasks: number,
  completedTasks: number,
  completedTaskIds: string[] = [],
  completedSubtaskIds: string[] = []
): Promise<DailyPathProgress | null> => {
  const today = getTodayISO();
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const status = percentage === 100 ? 'COMPLETED' : 'PENDING';

  try {
    const result = await gameDB.upsertDailyPathProgress({
      user_id: userId,
      path_id: pathId,
      date: today,
      tasks_total: totalTasks,
      tasks_completed: completedTasks,
      status,
      completed_task_ids: completedTaskIds,
      completed_subtask_ids: completedSubtaskIds,
    });

    logger.debug('Daily path progress upserted', {
      pathId,
      date: today,
      completedTasks,
      totalTasks,
      percentage,
      status,
      taskIds: completedTaskIds.length,
      subtaskIds: completedSubtaskIds.length,
    });

    return result;
  } catch (error) {
    logger.error('Failed to upsert daily path progress', { error, pathId, userId });
    return null;
  }
};

/**
 * Get yesterday's path progress for streak verification
 * Rule 8: Check historic record to reset streak if <100%
 */
export const getYesterdayProgress = async (
  userId: string,
  pathId: string
): Promise<DailyPathProgress | null> => {
  const yesterday = getYesterdayISO();

  try {
    return await gameDB.getDailyPathProgress(userId, pathId, yesterday);
  } catch (error) {
    logger.error('Failed to get yesterday progress', { error, pathId, userId });
    return null;
  }
};

// ============================================================
// STREAK MANAGEMENT
// ============================================================

/**
 * Evaluate and update streak based on yesterday's completion
 * Rule 8: Reset streak to 0 if yesterday was <100%
 */
export const evaluateStreak = async (
  identity: PlayerIdentityWithDetails,
  yesterdayProgress: DailyPathProgress | null
): Promise<{ newStreak: number; wasReset: boolean }> => {
  const currentStreak = identity.current_streak || 0;

  // If no yesterday progress, this could be:
  // 1. First day using the app
  // 2. App wasn't used yesterday
  // In either case, reset streak to 0 (they missed a day)
  if (!yesterdayProgress) {
    logger.info('No yesterday progress found - resetting streak', {
      pathId: identity.id,
      pathName: identity.template?.name,
      currentStreak,
    });
    return { newStreak: 0, wasReset: true };
  }

  // Check yesterday's completion percentage
  if (yesterdayProgress.percentage < 100) {
    logger.info('Yesterday incomplete - resetting streak', {
      pathId: identity.id,
      pathName: identity.template?.name,
      yesterdayPercentage: yesterdayProgress.percentage,
      currentStreak,
    });
    return { newStreak: 0, wasReset: true };
  }

  // Yesterday was 100% - maintain streak (don't double increment)
  // The streak was already incremented when tasks were completed
  logger.info('Yesterday complete - maintaining streak', {
    pathId: identity.id,
    pathName: identity.template?.name,
    currentStreak,
  });
  return { newStreak: currentStreak, wasReset: false };
};

// ============================================================
// MAIN CHRONOS RESET FUNCTION
// ============================================================

/**
 * Execute the daily reset algorithm
 * Called when app detects day has changed
 * 
 * @param userProfile - Current user profile
 * @param activeIdentities - User's active paths
 * @param quests - User's quests
 * @param dailyTaskStates - Current task completion states
 * @param callbacks - Store update callbacks
 */
export const executeDailyReset = async (
  userProfile: UserProfile,
  activeIdentities: PlayerIdentityWithDetails[],
  quests: Quest[],
  dailyTaskStates: Record<string, DailyTaskState>,
  callbacks: {
    updateQuest: (questId: string, updates: Partial<Quest>) => Promise<void>;
    updateIdentityStreak: (identityId: string, streak: number) => Promise<void>;
    updateLastResetDate: (date: string) => Promise<void>;
    clearDailyTaskStates: () => void;
  }
): Promise<ChronosResetResult> => {
  const result: ChronosResetResult = {
    success: false,
    pathsProcessed: 0,
    questsProcessed: 0,
    streaksReset: [],
    streaksMaintained: [],
    dailyRecord: null,
    errors: [],
  };

  const today = getTodayISO();
  const todayFormatted = getTodayFormatted();

  logger.info('Executing Chronos Reset', {
    userId: userProfile.id,
    lastResetDate: userProfile.last_reset_date,
    today,
    pathCount: activeIdentities.length,
    questCount: quests.length,
  });

  try {
    // ========================================
    // STEP 1: Create daily snapshot BEFORE changes
    // ========================================
    const pathStats: PathDailyStat[] = [];

    for (const identity of activeIdentities) {
      const tasks = identity.available_tasks || [];
      const state = dailyTaskStates[identity.id];
      const completedTaskIds = state ? new Set(state.completedTasks) : new Set<string>();
      const completedCount = completedTaskIds.size;
      const totalCount = tasks.length;

      // Get yesterday's progress for streak evaluation
      const yesterdayProgress = await getYesterdayProgress(userProfile.id, identity.id);
      const { newStreak, wasReset } = await evaluateStreak(identity, yesterdayProgress);

      pathStats.push({
        path_id: identity.id,
        path_name: identity.template?.name || 'Unknown Path',
        completed_count: completedCount,
        total_count: totalCount,
        streak_before: identity.current_streak,
        streak_after: newStreak,
      });

      // Track which streaks were reset vs maintained
      if (wasReset) {
        result.streaksReset.push(identity.id);
      } else {
        result.streaksMaintained.push(identity.id);
      }

      // ========================================
      // STEP 2: Update streak in database (Rule 8)
      // ========================================
      if (newStreak !== identity.current_streak) {
        try {
          await callbacks.updateIdentityStreak(identity.id, newStreak);
          logger.debug('Streak updated', {
            pathId: identity.id,
            oldStreak: identity.current_streak,
            newStreak,
          });
        } catch (error) {
          result.errors.push(`Failed to update streak for ${identity.id}: ${error}`);
        }
      }

      result.pathsProcessed++;
    }

    // Save daily record (for Dawn Summary display)
    const dailyRecord: DailyRecord = {
      id: `record-${Date.now()}`,
      user_id: userProfile.id,
      date: getYesterdayISO(), // Record is for yesterday's data
      path_stats: pathStats,
      quests_completed: quests.filter(q => q.status === 'completed').length,
      total_coins_earned: 0, // Could be calculated from task logs
      created_at: new Date().toISOString(),
    };

    try {
      await gameDB.saveDailyRecord(dailyRecord);
      result.dailyRecord = dailyRecord;
    } catch (error) {
      logger.warn('Failed to save daily record', { error });
      result.errors.push(`Failed to save daily record: ${error}`);
    }

    // ========================================
    // STEP 3: Reset task states (Rule 3 & 4)
    // CRITICAL: Do NOT trigger negative rewards
    // ========================================
    callbacks.clearDailyTaskStates();
    logger.debug('Daily task states cleared - tasks reset to unchecked');

    // ========================================
    // STEP 4: Quest Migration (Rules 6 & 7)
    // ========================================
    for (const quest of quests) {
      try {
        if (quest.isRecurring) {
          // Rule 7: Recurring quest - reset to today, uncheck, keep rewards
          await callbacks.updateQuest(quest.id, {
            date: todayFormatted,
            status: 'today',
            // Don't touch completedAt - keeps history
          });
          logger.debug('Reset recurring quest', { questId: quest.id, questTitle: quest.title });
        } else if (quest.status !== 'completed') {
          // Rule 6: Non-recurring incomplete quest - move to today
          await callbacks.updateQuest(quest.id, {
            date: todayFormatted,
            status: 'today',
          });
          logger.debug('Moved incomplete quest to today', { questId: quest.id });
        }
        // Rule: Completed non-recurring quests stay in history

        result.questsProcessed++;
      } catch (error) {
        result.errors.push(`Failed to process quest ${quest.id}: ${error}`);
      }
    }

    // ========================================
    // STEP 5: Update last reset date (Rule 5)
    // ========================================
    await callbacks.updateLastResetDate(today);

    result.success = true;
    logger.info('Chronos Reset completed successfully', {
      pathsProcessed: result.pathsProcessed,
      questsProcessed: result.questsProcessed,
      streaksReset: result.streaksReset.length,
      streaksMaintained: result.streaksMaintained.length,
      errors: result.errors.length,
    });

  } catch (error) {
    logger.error('Chronos Reset failed', { error });
    result.errors.push(`Fatal error: ${error}`);
  }

  return result;
};

// ============================================================
// TASK COMPLETION HANDLER
// ============================================================

/**
 * Handle task completion with daily progress tracking
 * Called by PathCard when a task is toggled
 * 
 * Rules implemented:
 * - Rule 1: Status changes to COMPLETED when all tasks done
 * - Rule 2: Streak increments when all tasks done
 * - Rule 8: Updates daily_path_progress record
 */
export const handleTaskCompletion = async (
  userId: string,
  pathId: string,
  totalTasks: number,
  completedTasks: number,
  currentStreak: number,
  callbacks: {
    updateIdentityStreak: (identityId: string, streak: number) => Promise<void>;
    updateIdentityLastCompleted: (identityId: string, date: string) => Promise<void>;
  }
): Promise<{
  newStatus: 'PENDING' | 'COMPLETED';
  newStreak: number;
  percentage: number;
}> => {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const newStatus = percentage === 100 ? 'COMPLETED' : 'PENDING';

  // Rule 8: Update daily progress record
  await upsertDailyPathProgress(userId, pathId, totalTasks, completedTasks);

  // Rule 1 & 2: If all tasks completed, update streak
  let newStreak = currentStreak;
  if (newStatus === 'COMPLETED' && percentage === 100) {
    newStreak = currentStreak + 1;
    
    try {
      await callbacks.updateIdentityStreak(pathId, newStreak);
      await callbacks.updateIdentityLastCompleted(pathId, getTodayISO());
      
      logger.info('Path completed - streak incremented', {
        pathId,
        oldStreak: currentStreak,
        newStreak,
      });
    } catch (error) {
      logger.error('Failed to update streak on completion', { error, pathId });
    }
  }

  return {
    newStatus,
    newStreak,
    percentage,
  };
};

// ============================================================
// EXPORTS
// ============================================================

export const ChronosManager = {
  getTodayISO,
  getYesterdayISO,
  getTodayFormatted,
  formatDateForQuest,
  upsertDailyPathProgress,
  getYesterdayProgress,
  evaluateStreak,
  executeDailyReset,
  handleTaskCompletion,
};

export default ChronosManager;

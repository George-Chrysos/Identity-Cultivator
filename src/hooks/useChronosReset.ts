/**
 * useChronosReset Hook
 * 
 * Handles the "Midnight Reset" logic for Anima Forge.
 * Detects when a new day has started and processes the transition
 * of Paths, Streaks, and Quests.
 * 
 * Uses ChronosManager for centralized logic implementation.
 * 
 * @module hooks/useChronosReset
 */

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useQuestStore } from '@/store/questStore';
import { logger } from '@/utils/logger';
import { ChronosManager } from '@/logic/ChronosManager';
import type { DailyRecord, PathDailyStat } from '@/types/database';

// Re-export utility functions from ChronosManager for backwards compatibility
const getTodayISO = ChronosManager.getTodayISO;

interface ChronosResetState {
  showDawnSummary: boolean;
  lastResetDate: string | null;
  dailyRecord: DailyRecord | null;
}

interface ChronosResetActions {
  executeReset: () => Promise<void>;
  executeManualReset: () => Promise<void>;
  dismissDawnSummary: () => void;
}

interface UseChronosResetReturn extends ChronosResetState, ChronosResetActions {}

/**
 * Hook for managing daily reset logic
 * 
 * Trigger: On app initialization, compares userProfile.last_reset_date with current date
 * 
 * Reset Algorithm (implemented in ChronosManager):
 * Rule 1: PathCard status → COMPLETED when all tasks done
 * Rule 2: Streak +1 when all tasks done
 * Rule 3: Tasks reset at midnight (rewards kept)
 * Rule 4: PathCard status → PENDING at midnight
 * Rule 5: Homepage shows new date
 * Rule 6: Uncompleted quests move to new day
 * Rule 7: Recurring quests reset (rewards kept)
 * Rule 8: daily_path_progress tracking + streak verification
 * Rule 9: Per-path streak/XP tracking
 */
export const useChronosReset = (): UseChronosResetReturn => {
  const hasRunRef = useRef(false);
  
  // Game store selectors
  const userProfile = useGameStore((state) => state.userProfile);
  const activeIdentities = useGameStore((state) => state.activeIdentities);
  const dailyTaskStates = useGameStore((state) => state.dailyTaskStates);
  
  // Quest store selectors
  const quests = useQuestStore((state) => state.quests);
  const updateQuest = useQuestStore((state) => state.updateQuest);
  
  // Local state for dawn summary (stored in gameStore)
  const showDawnSummary = useGameStore((state) => state.showDawnSummary);
  const setShowDawnSummary = useGameStore((state) => state.setShowDawnSummary);
  const dailyRecord = useGameStore((state) => state.lastDailyRecord);
  const setLastDailyRecord = useGameStore((state) => state.setLastDailyRecord);
  const updateLastResetDate = useGameStore((state) => state.updateLastResetDate);
  const updateIdentityStreak = useGameStore((state) => state.updateIdentityStreak);

  /**
   * Creates a daily snapshot before reset
   * Note: Used for local fallback if ChronosManager fails
   */
  const _createDailySnapshot = useCallback((): Omit<DailyRecord, 'id' | 'created_at'> => {
    const today = getTodayISO();
    
    // Build path stats from active identities using dailyTaskStates
    const pathStats: PathDailyStat[] = activeIdentities.map((identity) => {
      const tasks = identity.available_tasks || [];
      const taskState = dailyTaskStates[identity.id];
      const completedTaskIds = taskState ? new Set(taskState.completedTasks) : new Set<string>();
      const completedCount = completedTaskIds.size;
      const totalCount = tasks.length;
      const allCompleted = totalCount > 0 && completedCount === totalCount;
      
      return {
        path_id: identity.id,
        path_name: identity.template?.name || 'Unknown Path',
        completed_count: completedCount,
        total_count: totalCount,
        streak_before: identity.current_streak,
        streak_after: allCompleted 
          ? identity.current_streak + 1 
          : 0,
      };
    });

    // Count completed quests
    const questsCompleted = quests.filter(q => q.status === 'completed').length;

    const record: Omit<DailyRecord, 'id' | 'created_at'> = {
      user_id: userProfile?.id || 'anonymous',
      date: today,
      path_stats: pathStats,
      quests_completed: questsCompleted,
      total_coins_earned: 0, // Could be calculated from task logs if needed
    };

    return record;
  }, [activeIdentities, dailyTaskStates, quests, userProfile?.id]);
  void _createDailySnapshot; // Suppress unused warning - kept for fallback

  /**
   * Executes the full reset algorithm using ChronosManager
   * Implements all 9 rules for daily reset
   */
  const executeReset = useCallback(async (): Promise<void> => {
    if (!userProfile) {
      logger.warn('Cannot execute reset: No user profile');
      return;
    }

    const today = getTodayISO();

    logger.info('Executing Chronos Reset via ChronosManager', { 
      lastResetDate: userProfile.last_reset_date, 
      today 
    });

    try {
      // Execute the centralized reset logic
      const result = await ChronosManager.executeDailyReset(
        userProfile,
        activeIdentities,
        quests,
        dailyTaskStates,
        {
          updateQuest,
          updateIdentityStreak,
          updateLastResetDate,
          clearDailyTaskStates: () => {
            // Clear all daily task states in the store
            // This is done by setting dailyTaskStates to {}
            // The gameStore.resetDailyProgress handles this
            useGameStore.getState().resetDailyProgress(dailyTaskStates);
          },
        }
      );

      // Store the daily record for Dawn Summary display
      if (result.dailyRecord) {
        setLastDailyRecord(result.dailyRecord);
      }

      // Show dawn summary if successful
      if (result.success) {
        setShowDawnSummary(true);
      }

      logger.info('Chronos Reset completed', { 
        success: result.success,
        pathsProcessed: result.pathsProcessed,
        questsProcessed: result.questsProcessed,
        streaksReset: result.streaksReset.length,
        streaksMaintained: result.streaksMaintained.length,
        errors: result.errors,
      });

      if (result.errors.length > 0) {
        logger.warn('Chronos Reset completed with errors', { errors: result.errors });
      }
    } catch (error) {
      logger.error('Chronos Reset failed', { error });
      throw error;
    }
  }, [
    userProfile, 
    activeIdentities, 
    quests, 
    dailyTaskStates,
    updateQuest, 
    updateIdentityStreak,
    setLastDailyRecord,
    setShowDawnSummary,
    updateLastResetDate,
  ]);

  /**
   * Manual reset trigger for testing
   */
  const executeManualReset = useCallback(async (): Promise<void> => {
    logger.info('Manual Chronos Reset triggered');
    await executeReset();
  }, [executeReset]);

  /**
   * Dismiss the dawn summary modal
   */
  const dismissDawnSummary = useCallback(() => {
    setShowDawnSummary(false);
  }, [setShowDawnSummary]);

  /**
   * Check if reset is needed on mount/profile change
   */
  useEffect(() => {
    // Prevent running multiple times
    if (hasRunRef.current) return;
    if (!userProfile) return;

    const today = getTodayISO();
    const lastReset = userProfile.last_reset_date;

    // If no last reset date exists (column missing in DB or new user),
    // just set it to today WITHOUT triggering a reset.
    // This prevents clearing dailyTaskStates on page refresh when the
    // last_reset_date column doesn't exist in production DB.
    if (!lastReset) {
      logger.info('No last_reset_date found, initializing to today (no reset)', { today });
      hasRunRef.current = true;
      // Just update the date without doing a full reset
      updateLastResetDate(today).catch(error => {
        logger.error('Failed to initialize last_reset_date', { error });
      });
      return;
    }

    // If dates differ (actual day change), trigger reset
    if (lastReset !== today) {
      logger.info('Day change detected, triggering Chronos Reset', { 
        lastReset, 
        today 
      });
      hasRunRef.current = true;
      executeReset();
    }
  }, [userProfile, executeReset, updateLastResetDate]);

  return {
    showDawnSummary,
    lastResetDate: userProfile?.last_reset_date || null,
    dailyRecord,
    executeReset,
    executeManualReset,
    dismissDawnSummary,
  };
};

export default useChronosReset;

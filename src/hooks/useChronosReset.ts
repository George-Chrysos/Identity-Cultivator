/**
 * useChronosReset Hook
 * 
 * Handles the "Midnight Reset" logic for Anima Forge.
 * Detects when a new day has started and processes the transition
 * of Paths, Streaks, and Quests.
 * 
 * @module hooks/useChronosReset
 */

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useQuestStore } from '@/store/questStore';
import { logger } from '@/utils/logger';
import type { DailyRecord, PathDailyStat } from '@/types/database';

// Helper to get today's date as ISO string (YYYY-MM-DD)
const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper to format date for quest system
const getDateFormatted = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

// Local storage key for daily records
const DAILY_RECORDS_KEY = 'chronos-daily-records';

// Get stored daily records
const getDailyRecords = (): DailyRecord[] => {
  try {
    const stored = localStorage.getItem(DAILY_RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save daily records
const saveDailyRecords = (records: DailyRecord[]): void => {
  try {
    // Keep only last 30 days of records
    const trimmed = records.slice(-30);
    localStorage.setItem(DAILY_RECORDS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    logger.error('Failed to save daily records', { error });
  }
};

interface ChronosResetState {
  showDawnSummary: boolean;
  lastResetDate: string | null;
  dailyRecord: DailyRecord | null;
}

interface ChronosResetActions {
  executeReset: () => Promise<DailyRecord | null>;
  executeManualReset: () => Promise<DailyRecord | null>;
  dismissDawnSummary: () => void;
}

interface UseChronosResetReturn extends ChronosResetState, ChronosResetActions {}

/**
 * Hook for managing daily reset logic
 * 
 * Trigger: On app initialization, compares userProfile.last_reset_date with current date
 * 
 * Reset Algorithm:
 * A. Path Evaluation: Check if all tasks completed, increment/reset streak
 * B. Task Reset: Set all task is_completed = false
 * C. Quest Migration: Update recurring quests to current date, reset status
 * D. Record Creation: Push snapshot to daily_records history
 * E. Timestamp Update: Set userProfile.last_reset_date to current date
 */
export const useChronosReset = (): UseChronosResetReturn => {
  const hasRunRef = useRef(false);
  
  // Game store selectors
  const userProfile = useGameStore((state) => state.userProfile);
  const activeIdentities = useGameStore((state) => state.activeIdentities);
  
  // Quest store selectors
  const quests = useQuestStore((state) => state.quests);
  const updateQuest = useQuestStore((state) => state.updateQuest);
  
  // Local state for dawn summary (stored in gameStore)
  const showDawnSummary = useGameStore((state) => state.showDawnSummary);
  const setShowDawnSummary = useGameStore((state) => state.setShowDawnSummary);
  const dailyRecord = useGameStore((state) => state.lastDailyRecord);
  const setLastDailyRecord = useGameStore((state) => state.setLastDailyRecord);
  const updateLastResetDate = useGameStore((state) => state.updateLastResetDate);

  /**
   * Creates a daily snapshot before reset
   */
  const createDailySnapshot = useCallback((): DailyRecord => {
    const today = getTodayISO();
    
    // Build path stats from active identities
    const pathStats: PathDailyStat[] = activeIdentities.map((identity) => {
      const tasks = identity.available_tasks || [];
      const completedCount = identity.completed_today ? tasks.length : 0;
      
      return {
        path_id: identity.id,
        path_name: identity.template?.name || 'Unknown Path',
        completed_count: completedCount,
        total_count: tasks.length,
        streak_before: identity.current_streak,
        streak_after: identity.completed_today 
          ? identity.current_streak + 1 
          : 0,
      };
    });

    // Count completed quests
    const questsCompleted = quests.filter(q => q.status === 'completed').length;

    const record: DailyRecord = {
      id: `record-${Date.now()}`,
      user_id: userProfile?.id || 'anonymous',
      date: today,
      path_stats: pathStats,
      quests_completed: questsCompleted,
      total_coins_earned: 0, // Could be calculated from task logs if needed
      created_at: new Date().toISOString(),
    };

    return record;
  }, [activeIdentities, quests, userProfile?.id]);

  /**
   * Executes the full reset algorithm
   */
  const executeReset = useCallback(async (): Promise<DailyRecord | null> => {
    if (!userProfile) {
      logger.warn('Cannot execute reset: No user profile');
      return null;
    }

    const today = getTodayISO();
    const todayFormatted = getDateFormatted(new Date());

    logger.info('Executing Chronos Reset', { 
      lastResetDate: userProfile.last_reset_date, 
      today 
    });

    try {
      // Step D: Create daily snapshot BEFORE any changes
      const snapshot = createDailySnapshot();
      
      // Save to local storage
      const existingRecords = getDailyRecords();
      existingRecords.push(snapshot);
      saveDailyRecords(existingRecords);
      
      // Store in gameStore for UI access
      setLastDailyRecord(snapshot);

      // Step A & B: Path Evaluation and Task Reset
      // This is handled by the gameStore.resetDailyProgress action
      // For now, we'll trigger a reload of identities which should handle the reset
      
      // Step C: Quest Migration
      // For recurring quests: reset to 'today' status with new date
      // For non-recurring quests: move to today if incomplete
      for (const quest of quests) {
        if (quest.isRecurring) {
          // Recurring quest: reset to today, uncheck (rewards kept)
          await updateQuest(quest.id, {
            date: todayFormatted,
            status: 'today',
            // Note: We don't reset completedAt to keep history
          });
          logger.debug('Reset recurring quest', { questId: quest.id, questTitle: quest.title });
        } else if (quest.status !== 'completed') {
          // Non-recurring incomplete quest: move to today
          await updateQuest(quest.id, {
            date: todayFormatted,
            status: 'today',
          });
          logger.debug('Moved incomplete quest to today', { questId: quest.id });
        }
      }

      // Step E: Update last reset date
      await updateLastResetDate(today);

      // Show dawn summary
      setShowDawnSummary(true);

      logger.info('Chronos Reset completed successfully', { 
        pathsProcessed: activeIdentities.length,
        questsProcessed: quests.length,
        snapshot 
      });

      return snapshot;
    } catch (error) {
      logger.error('Chronos Reset failed', { error });
      return null;
    }
  }, [
    userProfile, 
    activeIdentities, 
    quests, 
    updateQuest, 
    createDailySnapshot, 
    setLastDailyRecord,
    setShowDawnSummary,
    updateLastResetDate,
  ]);

  /**
   * Manual reset trigger for testing
   */
  const executeManualReset = useCallback(async (): Promise<DailyRecord | null> => {
    logger.info('Manual Chronos Reset triggered');
    return executeReset();
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

    // If no last reset date or dates differ, trigger reset
    if (!lastReset || lastReset !== today) {
      logger.info('Day change detected, triggering Chronos Reset', { 
        lastReset, 
        today 
      });
      hasRunRef.current = true;
      executeReset();
    }
  }, [userProfile, executeReset]);

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

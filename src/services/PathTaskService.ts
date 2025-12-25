/**
 * PathTaskService - Decoupled Task Logic Layer
 * 
 * Handles all task-related business logic:
 * - Task toggle (complete/uncomplete)
 * - Daily path progress tracking (Rule 8)
 * - Streak management (Rules 1, 2)
 * - Reward calculations
 * 
 * This service decouples logic from PathCard.tsx UI component.
 * 
 * @module services/PathTaskService
 */

import { logger } from '@/utils/logger';
import { gameDB } from '@/api/gameDatabase';
import { ChronosManager } from '@/logic/ChronosManager';
import { getPathTaskRewards, isPathRegistered } from '@/constants/pathRegistry';
import type { PlayerIdentityWithDetails } from '@/types/database';

// ============================================================
// TYPES
// ============================================================

export interface Task {
  id: string;
  title: string;
  description: string;
  rewards: {
    xp: number;
    stat: string;
    points: number;
    coins: number;
  };
  subtasks?: Subtask[];
  path_id?: string;
  path_level?: number;
}

export interface Subtask {
  id: string;
  name: string;
  description?: string;
}

export interface TaskRewards {
  coins: number;
  stat: string;
  points: number;
}

export interface TaskToggleResult {
  success: boolean;
  newCompletedTasks: Set<string>;
  newCompletedSubtasks: Set<string>;
  xpChange: number;
  rewards: TaskRewards;
  isAllTasksCompleted: boolean;
  newStreak: number;
  newStatus: 'pending' | 'completed';
  shouldShowMilestone: boolean;
  milestoneData?: {
    coins: number;
    stars: number;
    willGain: number;
  };
}

export interface PathState {
  completedTasks: Set<string>;
  completedSubtasks: Set<string>;
  currentXP: number;
  maxXP: number;
  streak: number;
  status: 'pending' | 'completed';
  allTasksWereCompleted: boolean;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get task rewards from path registry or fallback to static rewards
 */
export const getTaskRewards = (task: Task): TaskRewards => {
  const pathRegistered = task.path_id ? isPathRegistered(task.path_id) : false;
  
  if (task.path_id && task.path_level && pathRegistered) {
    const pathRewards = getPathTaskRewards(task.path_id, task.path_level);
    return {
      coins: pathRewards.coins,
      stat: pathRewards.primaryStat,
      points: pathRewards.statPoints,
    };
  }
  
  // Fallback to task's static rewards
  return {
    coins: task.rewards.coins,
    stat: task.rewards.stat,
    points: task.rewards.points,
  };
};

// ============================================================
// TASK TOGGLE LOGIC
// ============================================================

/**
 * Toggle a task's completion status
 * 
 * Rules implemented:
 * - Rule 1: Status changes to COMPLETED when all tasks done
 * - Rule 2: Streak increments when all tasks done (first time)
 * - Rule 8: Updates daily_path_progress record
 */
export const toggleTask = async (
  taskId: string,
  tasks: Task[],
  currentState: PathState,
  userId: string,
  pathId: string,
  currentLevel: number
): Promise<TaskToggleResult> => {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  const wasCompleted = currentState.completedTasks.has(taskId);
  const taskRewards = getTaskRewards(task);

  // Clone state for updates
  const newCompletedTasks = new Set(currentState.completedTasks);
  const newCompletedSubtasks = new Set(currentState.completedSubtasks);
  let xpChange = 0;
  let newStreak = currentState.streak;
  let newStatus: 'pending' | 'completed' = currentState.status;
  let isAllTasksCompleted = false;
  let shouldShowMilestone = false;
  let milestoneData: { coins: number; stars: number; willGain: number } | undefined;

  if (wasCompleted) {
    // ========================================
    // UNCOMPLETE TASK
    // ========================================
    newCompletedTasks.delete(taskId);
    xpChange = -task.rewards.xp;
    newStatus = 'pending';

    // Uncheck all subtasks when parent is unchecked
    if (task.subtasks) {
      task.subtasks.forEach(st => newCompletedSubtasks.delete(st.id));
    }

    // If all tasks were previously completed, revert streak by 1
    if (currentState.allTasksWereCompleted) {
      newStreak = Math.max(0, currentState.streak - 1);
    }

    logger.info('Task unchecked', {
      taskId,
      xpChange,
      newStreak,
      rewards: {
        coins: -taskRewards.coins,
        stat: taskRewards.stat,
        points: -taskRewards.points,
      },
    });
  } else {
    // ========================================
    // COMPLETE TASK
    // ========================================
    newCompletedTasks.add(taskId);
    xpChange = task.rewards.xp;

    // Check all subtasks when parent is checked
    if (task.subtasks) {
      task.subtasks.forEach(st => newCompletedSubtasks.add(st.id));
    }

    // Check if this completes all tasks for the FIRST time
    if (newCompletedTasks.size === tasks.length && !currentState.allTasksWereCompleted) {
      isAllTasksCompleted = true;
      newStatus = 'completed';
      newStreak = currentState.streak + 1;

      logger.info('All tasks completed!', {
        taskId,
        newStreak,
        tasksCompleted: newCompletedTasks.size,
        totalTasks: tasks.length,
      });

      // Check for milestone rewards
      const milestoneInfo = checkMilestoneRewards(newStreak, currentLevel);
      if (milestoneInfo) {
        shouldShowMilestone = true;
        milestoneData = milestoneInfo;
      }
    }

    logger.info('Task checked', {
      taskId,
      xpChange,
      newStreak,
      rewards: taskRewards,
    });
  }

  // ========================================
  // UPDATE DAILY PATH PROGRESS (Rule 8)
  // ========================================
  try {
    await ChronosManager.upsertDailyPathProgress(
      userId,
      pathId,
      tasks.length,
      newCompletedTasks.size
    );
  } catch (error) {
    logger.error('Failed to update daily path progress', { error, pathId });
    // Don't throw - this is non-critical
  }

  return {
    success: true,
    newCompletedTasks,
    newCompletedSubtasks,
    xpChange,
    rewards: wasCompleted 
      ? { coins: -taskRewards.coins, stat: taskRewards.stat, points: -taskRewards.points }
      : taskRewards,
    isAllTasksCompleted,
    newStreak,
    newStatus,
    shouldShowMilestone,
    milestoneData,
  };
};

/**
 * Toggle a subtask's completion status
 */
export const toggleSubtask = (
  taskId: string,
  subtaskId: string,
  tasks: Task[],
  currentState: PathState
): {
  newCompletedSubtasks: Set<string>;
  shouldAutoCheckParent: boolean;
} => {
  const task = tasks.find(t => t.id === taskId);
  if (!task?.subtasks) {
    throw new Error(`Task not found or has no subtasks: ${taskId}`);
  }

  const wasSubtaskCompleted = currentState.completedSubtasks.has(subtaskId);
  const newCompletedSubtasks = new Set(currentState.completedSubtasks);

  if (wasSubtaskCompleted) {
    newCompletedSubtasks.delete(subtaskId);
    return {
      newCompletedSubtasks,
      shouldAutoCheckParent: false,
    };
  } else {
    newCompletedSubtasks.add(subtaskId);
    
    // Check if all subtasks are now complete
    const allSubtasksCompleted = task.subtasks.every(
      st => st.id === subtaskId || newCompletedSubtasks.has(st.id)
    );

    return {
      newCompletedSubtasks,
      shouldAutoCheckParent: allSubtasksCompleted && !currentState.completedTasks.has(taskId),
    };
  }
};

// ============================================================
// MILESTONE REWARDS
// ============================================================

/**
 * Check if streak triggers milestone rewards
 */
const checkMilestoneRewards = (
  streak: number,
  level: number
): { coins: number; stars: number; willGain: number } | null => {
  // Import milestone logic from StreakManager
  try {
    const { 
      getMilestoneForLevel, 
      isSubMilestoneDay, 
      SUB_MILESTONE_REWARDS 
    } = require('@/services/StreakManager');

    const milestone = getMilestoneForLevel(level);
    const isSubMilestone = isSubMilestoneDay(streak, level);
    const isFinalMilestone = milestone && streak === milestone.milestoneDays;

    if (!isSubMilestone && !isFinalMilestone) {
      return null;
    }

    let totalCoins = 0;
    let totalStars = 0;
    let willGain = 0;

    if (isSubMilestone) {
      totalCoins += SUB_MILESTONE_REWARDS.rewards.coins;
      totalStars += SUB_MILESTONE_REWARDS.rewards.stars;
      willGain += SUB_MILESTONE_REWARDS.willGain;
    }

    if (isFinalMilestone && milestone) {
      totalCoins += milestone.rewards.coins;
      totalStars += milestone.rewards.stars;
      willGain += milestone.willGain;
    }

    return { coins: totalCoins, stars: totalStars, willGain };
  } catch (error) {
    logger.warn('StreakManager not available for milestone check', { error });
    return null;
  }
};

// ============================================================
// STREAK PERSISTENCE
// ============================================================

/**
 * Persist streak update to database
 */
export const persistStreak = async (
  identityId: string,
  streak: number
): Promise<void> => {
  try {
    await gameDB.updateIdentity(identityId, {
      current_streak: streak,
    });
    logger.info('Streak persisted', { identityId, streak });
  } catch (error) {
    logger.warn('Failed to persist streak - may be in offline mode', { error, identityId });
    // Don't throw - optimistic update should remain
  }
};

/**
 * Persist last completed date to database
 */
export const persistLastCompleted = async (
  identityId: string,
  date: string
): Promise<void> => {
  try {
    await gameDB.updateIdentity(identityId, {
      last_completed_date: date,
    } as Partial<PlayerIdentityWithDetails>);
    logger.info('Last completed date persisted', { identityId, date });
  } catch (error) {
    logger.warn('Failed to persist last completed date', { error, identityId });
  }
};

// ============================================================
// EXPORTS
// ============================================================

export const PathTaskService = {
  getTaskRewards,
  toggleTask,
  toggleSubtask,
  persistStreak,
  persistLastCompleted,
};

export default PathTaskService;

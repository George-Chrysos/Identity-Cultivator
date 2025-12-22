import { useMemo, useCallback } from 'react';
import type { PlayerIdentityWithDetails, TaskTemplate } from '@/types/database';
import { getTemperingLevel, generateTemperingTaskTemplates, TEMPERING_TEMPLATE_ID } from '@/constants/temperingPath';
import { logger } from '@/utils/logger';

/**
 * Transformed task for PathCard display
 */
export interface TransformedTask {
  id: string;
  title: string;
  description: string;
  rewards: {
    xp: number;
    stat: string;
    points: number;
    coins: number;
  };
  subtasks?: {
    id: string;
    name: string;
    description?: string;
  }[];
  path_id?: string;
  path_level?: number;
}

/**
 * Trial info for PathCard display
 */
export interface TrialInfo {
  name: string;
  description: string;
  tasks: string;
  rewards: {
    coins: number;
    stars: number;
    bodyPoints: number;
    item: string;
  };
}

/**
 * Next level data for level-up transitions
 */
export interface NextLevelData {
  title: string;
  subtitle: string;
  tasks: TransformedTask[];
  trialInfo: TrialInfo;
  maxXP: number;
}

import type { TemperingLevelConfig } from '@/constants/temperingPath';

interface TransformedIdentityResult {
  /** Whether this is a tempering path identity */
  isTemperingPath: boolean;
  /** Tempering level configuration (undefined if not tempering) */
  temperingConfig: TemperingLevelConfig | undefined;
  /** Tasks transformed for PathCard display */
  transformedTasks: TransformedTask[];
  /** Trial info for display (undefined if not available) */
  trialInfo: TrialInfo | undefined;
  /** Maximum XP for current level */
  maxXP: number;
  /** Get next level data for level-up transitions */
  getNextLevelData: (newLevel: number) => NextLevelData | null;
}

/**
 * Transform a single task to PathCard format
 */
const transformTask = (
  task: TaskTemplate,
  isTemperingPath: boolean,
  currentLevel: number
): TransformedTask => ({
  id: task.id,
  title: task.name,
  description: task.description || `Complete ${task.name} to earn rewards and progress your cultivation journey.`,
  rewards: {
    xp: task.xp_reward,
    stat: task.target_stat,
    points: task.base_points_reward,
    coins: task.coin_reward,
  },
  subtasks: task.subtasks?.map((subtask) => ({
    id: subtask.id,
    name: subtask.name,
    description: subtask.description,
  })),
  path_id: task.path_id || (isTemperingPath ? TEMPERING_TEMPLATE_ID : undefined),
  path_level: task.path_level || (isTemperingPath ? currentLevel : undefined),
});

/**
 * useTransformedIdentity - Transform identity data for PathCard display
 * 
 * Consolidates transformation logic that was previously duplicated in:
 * - Homepage.tsx (lines 343-418)
 * - gameDatabase.ts task transformations
 * 
 * This hook provides memoized transformations for:
 * 1. Detecting tempering path identities
 * 2. Getting level configuration
 * 3. Transforming tasks to PathCard format
 * 4. Building trial info
 * 5. Getting next level data for level-up transitions
 * 
 * @param identity - Player identity with details
 * @returns Transformed identity data for PathCard display
 * 
 * @example
 * ```tsx
 * const {
 *   isTemperingPath,
 *   temperingConfig,
 *   transformedTasks,
 *   trialInfo,
 *   maxXP,
 *   getNextLevelData,
 * } = useTransformedIdentity(identity);
 * 
 * return (
 *   <PathCard
 *     tasks={transformedTasks}
 *     trialInfo={trialInfo}
 *     maxXP={maxXP}
 *     onLevelUp={isTemperingPath ? getNextLevelData : undefined}
 *   />
 * );
 * ```
 */
export const useTransformedIdentity = (
  identity: PlayerIdentityWithDetails
): TransformedIdentityResult => {
  const currentLevel = identity.current_level;
  
  // Detect tempering path
  const isTemperingPath = useMemo(() => 
    identity.template.id.startsWith(TEMPERING_TEMPLATE_ID),
    [identity.template.id]
  );

  // Get tempering config
  const temperingConfig = useMemo(() => 
    isTemperingPath ? getTemperingLevel(currentLevel) ?? undefined : undefined,
    [isTemperingPath, currentLevel]
  );

  // Transform tasks
  const transformedTasks = useMemo(() => {
    const tasks = identity.available_tasks.map((task) => {
      const transformed = transformTask(task, isTemperingPath, currentLevel);
      
      logger.debug('Task transformed', { 
        taskId: task.id, 
        originalPathId: task.path_id,
        finalPathId: transformed.path_id,
        finalPathLevel: transformed.path_level,
        isTemperingPath,
      });
      
      return transformed;
    });
    
    return tasks;
  }, [identity.available_tasks, isTemperingPath, currentLevel]);

  // Build trial info
  const trialInfo = useMemo((): TrialInfo | undefined => {
    if (!temperingConfig) return undefined;
    
    return {
      name: temperingConfig.trial.name,
      description: temperingConfig.trial.focus,
      tasks: temperingConfig.trial.tasks,
      rewards: temperingConfig.trial.rewards,
    };
  }, [temperingConfig]);

  // Calculate max XP
  const maxXP = useMemo(() => 
    temperingConfig?.xpToLevelUp || 100 * (currentLevel + 1),
    [temperingConfig, currentLevel]
  );

  // Get next level data (memoized callback)
  const getNextLevelData = useCallback((newLevel: number): NextLevelData | null => {
    const nextConfig = getTemperingLevel(newLevel);
    if (!nextConfig) return null;
    
    // Generate tasks for next level
    const nextTasks = generateTemperingTaskTemplates(newLevel);
    const transformedNextTasks = nextTasks.map((task) => 
      transformTask(task, true, newLevel)
    );
    
    return {
      title: `Tempering Lv.${newLevel}`,
      subtitle: nextConfig.subtitle,
      tasks: transformedNextTasks,
      trialInfo: {
        name: nextConfig.trial.name,
        description: nextConfig.trial.focus,
        tasks: nextConfig.trial.tasks,
        rewards: nextConfig.trial.rewards,
      },
      maxXP: nextConfig.xpToLevelUp,
    };
  }, []);

  return {
    isTemperingPath,
    temperingConfig,
    transformedTasks,
    trialInfo,
    maxXP,
    getNextLevelData,
  };
};

export default useTransformedIdentity;

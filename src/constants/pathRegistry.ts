/**
 * Path Registry - Unified configuration system for all cultivation paths
 * 
 * This module provides:
 * 1. Base interface that all 52 paths must implement
 * 2. Central registry for looking up path configurations
 * 3. Helper functions to get rewards based on path and level
 * 
 * Architecture:
 * - Each path (like temperingPath) registers its levels here
 * - Tasks reference path_id + level to look up rewards
 * - Single source of truth for coins, stat points, XP per level
 */

import { PrimaryStat } from '@/types/database';
import { logger } from '@/utils/logger';

// ==================== BASE INTERFACES ====================

/**
 * Base trial rewards structure - all paths use this
 */
export interface TrialRewards {
  coins: number;
  stars: number;
  bodyPoints?: number;
  mindPoints?: number;
  soulPoints?: number;
  item?: string;
}

/**
 * Base trial configuration - all paths use this
 */
export interface TrialConfig {
  name: string;
  tasks: string;
  focus: string;
  rewards: TrialRewards;
}

/**
 * Base subtask definition for path configs
 */
export interface PathSubtask {
  name: string;
  focus: string;
}

/**
 * Base task definition for path configs
 */
export interface PathTask {
  gate: string;
  name: string;
  subtasks: PathSubtask[];
  focus: string;
}

/**
 * Base level configuration - all 52 paths must provide this structure
 * This is the single source of truth for level-specific rewards
 */
export interface BaseLevelConfig {
  level: number;
  subtitle: string;
  xpToLevelUp: number;
  daysRequired: number;
  baseCoins: number;           // Coins per task completion
  baseStatPoints: number;      // Stat points per task completion
  primaryStat: PrimaryStat;    // Which stat this path targets
  tasks: PathTask[];
  trial: TrialConfig;
}

/**
 * Path metadata - describes a cultivation path
 */
export interface PathMetadata {
  id: string;                  // Unique path identifier (e.g., 'tempering-warrior-trainee')
  name: string;                // Display name (e.g., 'Tempering')
  description: string;         // Path description
  primaryStat: PrimaryStat;    // Primary stat this path trains
  tier: string;                // Starting tier
  maxLevel: number;            // Maximum level in this path
}

/**
 * Complete path configuration
 */
export interface PathConfig {
  metadata: PathMetadata;
  levels: BaseLevelConfig[];
}

// ==================== PATH REGISTRY ====================

/**
 * Central registry storing all path configurations
 * Key: path_id (e.g., 'tempering-warrior-trainee')
 * Value: PathConfig
 */
const PATH_REGISTRY: Map<string, PathConfig> = new Map();

/**
 * Register a path configuration
 * Called by each path module (e.g., temperingPath.ts)
 */
export const registerPath = (config: PathConfig): void => {
  PATH_REGISTRY.set(config.metadata.id, config);
  logger.info('Path registered', { pathId: config.metadata.id, levelsCount: config.levels.length });
};

/**
 * Get a path configuration by ID
 */
export const getPathConfig = (pathId: string): PathConfig | undefined => {
  return PATH_REGISTRY.get(pathId);
};

/**
 * Get level configuration for a specific path and level
 */
export const getPathLevelConfig = (pathId: string, level: number): BaseLevelConfig | undefined => {
  const config = PATH_REGISTRY.get(pathId);
  return config?.levels.find(l => l.level === level);
};

/**
 * Get task rewards for a specific path and level
 * This is the primary function to use when awarding/deducting coins
 */
export const getPathTaskRewards = (pathId: string, level: number): {
  coins: number;
  statPoints: number;
  primaryStat: PrimaryStat;
} => {
  const levelConfig = getPathLevelConfig(pathId, level);
  
  if (!levelConfig) {
    logger.warn('getPathTaskRewards: No level config found', { pathId, level });
    return { coins: 0, statPoints: 0, primaryStat: 'BODY' };
  }
  
  const rewards = {
    coins: levelConfig.baseCoins,
    statPoints: levelConfig.baseStatPoints,
    primaryStat: levelConfig.primaryStat,
  };
  
  logger.debug('getPathTaskRewards returning', { pathId, level, rewards });
  return rewards;
};

/**
 * Get trial rewards for a specific path and level
 */
export const getPathTrialRewards = (pathId: string, level: number): TrialRewards | undefined => {
  const levelConfig = getPathLevelConfig(pathId, level);
  return levelConfig?.trial.rewards;
};

/**
 * Get trial info for a specific path and level
 */
export const getPathTrialInfo = (pathId: string, level: number): TrialConfig | undefined => {
  const levelConfig = getPathLevelConfig(pathId, level);
  return levelConfig?.trial;
};

/**
 * Get all registered path IDs
 */
export const getAllPathIds = (): string[] => {
  return Array.from(PATH_REGISTRY.keys());
};

/**
 * Get all registered paths metadata
 */
export const getAllPathsMetadata = (): PathMetadata[] => {
  return Array.from(PATH_REGISTRY.values()).map(p => p.metadata);
};

/**
 * Check if a path is registered
 */
export const isPathRegistered = (pathId: string): boolean => {
  const result = PATH_REGISTRY.has(pathId);
  logger.debug('isPathRegistered check', { pathId, result, registrySize: PATH_REGISTRY.size });
  return result;
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate XP per task for a level (total XP / number of tasks)
 */
export const calculateXpPerTask = (pathId: string, level: number): number => {
  const levelConfig = getPathLevelConfig(pathId, level);
  if (!levelConfig) return 0;
  
  const taskCount = levelConfig.tasks.length;
  if (taskCount === 0) return 0;
  
  // Assuming daily XP completion, divide by tasks
  return Math.round(levelConfig.xpToLevelUp / (levelConfig.daysRequired * taskCount));
};

/**
 * Get streak requirement for trial (2n+1 formula)
 */
export const getTrialStreakRequirement = (level: number): number => {
  return 2 * level + 1;
};

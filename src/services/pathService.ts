/**
 * Path Service - Fetch & Cache Game Path Data
 * Loads from Supabase with localStorage fallback to constants
 * 
 * @usage
 * const tempering = await pathService.getPath('tempering-warrior-trainee');
 * const level = await pathService.getPathLevel('tempering-warrior-trainee', 1);
 */

import { supabase } from '@/lib/supabase';
import { TEMPERING_LEVELS } from '@/constants/temperingPath';
import { handleError } from './errorHandler';
import { syncPathsToDatabase } from './pathSyncService';

const CACHE_KEY = 'path-cache';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours (daily refresh)

interface CachedPath {
  timestamp: number;
  data: any;
}

/**
 * Get all cached paths from localStorage
 */
const getCachedPaths = (): Record<string, CachedPath> | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    handleError(error, 'getCachedPaths');
    return null;
  }
};

/**
 * Save path to cache
 */
const cachePath = (pathId: string, data: any) => {
  try {
    const existing = getCachedPaths() || {};
    existing[pathId] = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(existing));
  } catch (error) {
    handleError(error, 'cachePath');
  }
};

/**
 * Check if cache is still valid
 */
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

/**
 * Fallback to constants if DB unavailable
 */
const getFallbackPath = (pathId: string) => {
  if (pathId === 'tempering-warrior-trainee') {
    return {
      id: pathId,
      name: 'Tempering',
      description: 'Warrior Trainee path (Offline Mode)',
      primary_stat: 'BODY',
      tier: 'D',
      max_level: 10,
      levels: TEMPERING_LEVELS,
    };
  }
  return null;
};

/**
 * Fetch a complete path with all levels, gates, and trials
 */
export const getPath = async (pathId: string) => {
  // Check cache first
  const cached = getCachedPaths()?.[pathId];
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

  try {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('paths')
      .select(`
        id,
        name,
        description,
        primary_stat,
        tier,
        max_level,
        path_levels (
          id,
          level,
          subtitle,
          xp_to_level_up,
          days_required,
          main_stat_limit,
          gate_stat_cap,
          base_coins,
          base_stat_points,
          gates (
            id,
            gate_name,
            task_name,
            focus_description,
            task_order,
            subtasks (
              id,
              name,
              focus_description,
              subtask_order
            )
          ),
          trials (
            id,
            name,
            description,
            tasks_description,
            focus_description,
            reward_coins,
            reward_stars,
            reward_stat_points,
            reward_item
          )
        )
      `)
      .eq('id', pathId)
      .single();

    if (error) throw error;
    
    // If data not found, might need to sync from constants
    if (!data) {
      // Try auto-sync once
      await syncPathsToDatabase();
      // Retry the query
      const { data: retryData, error: retryError } = await supabase
        .from('paths')
        .select(`
          id,
          name,
          description,
          primary_stat,
          tier,
          max_level,
          path_levels (
            id,
            level,
            subtitle,
            xp_to_level_up,
            days_required,
            main_stat_limit,
            gate_stat_cap,
            base_coins,
            base_stat_points,
            gates (
              id,
              gate_name,
              task_name,
              focus_description,
              task_order,
              subtasks (
                id,
                name,
                focus_description,
                subtask_order
              )
            ),
            trials (
              id,
              name,
              description,
              tasks_description,
              focus_description,
              reward_coins,
              reward_stars,
              reward_stat_points,
              reward_item
            )
          )
        `)
        .eq('id', pathId)
        .single();
      
      if (!retryError && retryData) {
        cachePath(pathId, retryData);
        return retryData;
      }
      
      throw new Error(`Path not found: ${pathId}`);
    }

    // Cache and return
    cachePath(pathId, data);
    return data;
  } catch (error) {
    handleError(error, `getPath(${pathId})`);
    
    // Fallback to constants
    const fallback = getFallbackPath(pathId);
    if (fallback) {
      cachePath(pathId, fallback);
      return fallback;
    }
    
    throw new Error(`Failed to load path: ${pathId}`);
  }
};

/**
 * Fetch a specific level with gates and trials
 */
export const getPathLevel = async (pathId: string, level: number) => {
  try {
    const path = await getPath(pathId);
    const pathLevel = path.path_levels?.find(
      (p: any) => p.level === level
    );

    if (!pathLevel) {
      throw new Error(`Level ${level} not found in path ${pathId}`);
    }

    return pathLevel;
  } catch (error) {
    handleError(error, `getPathLevel(${pathId}, ${level})`);
    throw error;
  }
};

/**
 * Fetch gates for a specific level
 */
export const getGates = async (pathId: string, level: number) => {
  try {
    const pathLevel = await getPathLevel(pathId, level);
    return pathLevel.gates || [];
  } catch (error) {
    handleError(error, `getGates(${pathId}, ${level})`);
    throw error;
  }
};

/**
 * Fetch trial for a specific level
 */
export const getTrial = async (pathId: string, level: number) => {
  try {
    const pathLevel = await getPathLevel(pathId, level);
    return pathLevel.trials?.[0] || null;
  } catch (error) {
    handleError(error, `getTrial(${pathId}, ${level})`);
    throw error;
  }
};

/**
 * Clear all path caches (useful after server updates)
 */
export const clearPathCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    handleError(error, 'clearPathCache');
  }
};

/**
 * Preload a path to avoid async waterfalls
 */
export const preloadPath = async (pathId: string) => {
  try {
    await getPath(pathId);
  } catch (error) {
    handleError(error, `preloadPath(${pathId})`);
  }
};

export const pathService = {
  getPath,
  getPathLevel,
  getGates,
  getTrial,
  clearPathCache,
  preloadPath,
};

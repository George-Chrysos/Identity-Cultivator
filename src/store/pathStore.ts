/**
 * Path Store - Zustand store for path data with caching
 * Manages fetching, caching, and selecting path data
 * 
 * @usage
 * const paths = usePathStore((s) => s.paths);
 * const getTempering = usePathStore((s) => s.getPath('tempering-warrior-trainee'));
 */

import { create } from 'zustand';
import { pathService } from '@/services/pathService';
import { handleError } from '@/services/errorHandler';

interface PathLevel {
  id: string;
  level: number;
  subtitle: string;
  xp_to_level_up: number;
  days_required: number;
  main_stat_limit: number;
  gate_stat_cap: number;
  base_coins: number;
  base_stat_points: number;
  gates: Gate[];
  trials: Trial[];
}

interface Gate {
  id: string;
  gate_name: string;
  task_name: string;
  focus_description: string;
  task_order: number;
  subtasks: Subtask[];
}

interface Subtask {
  id: string;
  name: string;
  focus_description: string;
  subtask_order: number;
}

interface Trial {
  id: string;
  name: string;
  description: string;
  tasks_description: string;
  focus_description: string;
  reward_coins: number;
  reward_stars: number;
  reward_stat_points: number;
  reward_item: string;
}

interface PathData {
  id: string;
  name: string;
  description: string;
  primary_stat: string;
  tier: string;
  max_level: number;
  path_levels: PathLevel[];
}

interface PathStoreState {
  // Data
  paths: Record<string, PathData>;
  loadingPaths: Set<string>;
  error: string | null;

  // Actions
  loadPath: (pathId: string) => Promise<PathData>;
  getPath: (pathId: string) => PathData | null;
  getPathLevel: (pathId: string, level: number) => PathLevel | null;
  getGates: (pathId: string, level: number) => Gate[];
  getTrial: (pathId: string, level: number) => Trial | null;
  isLoadingPath: (pathId: string) => boolean;
  clearCache: () => void;
}

export const usePathStore = create<PathStoreState>((set, get) => ({
  // State
  paths: {},
  loadingPaths: new Set(),
  error: null,

  // Load path from service (handles DB + fallback)
  loadPath: async (pathId: string) => {
    const existing = get().paths[pathId];
    if (existing) return existing;

    // Mark as loading
    set((s) => ({
      loadingPaths: new Set([...s.loadingPaths, pathId]),
    }));

    try {
      const pathData = await pathService.getPath(pathId);

      set((s) => ({
        paths: { ...s.paths, [pathId]: pathData },
        loadingPaths: new Set([...s.loadingPaths].filter((p) => p !== pathId)),
        error: null,
      }));

      return pathData;
    } catch (error) {
      handleError(error, `loadPath(${pathId})`);

      set((s) => ({
        loadingPaths: new Set([...s.loadingPaths].filter((p) => p !== pathId)),
        error: `Failed to load path: ${pathId}`,
      }));

      throw error;
    }
  },

  // Get cached path (must be loaded first)
  getPath: (pathId: string) => {
    return get().paths[pathId] || null;
  },

  // Get specific level
  getPathLevel: (pathId: string, level: number) => {
    const path = get().paths[pathId];
    if (!path) return null;

    return (
      path.path_levels.find((l) => l.level === level) || null
    );
  },

  // Get gates for a level
  getGates: (pathId: string, level: number) => {
    const pathLevel = get().getPathLevel(pathId, level);
    return pathLevel?.gates || [];
  },

  // Get trial for a level
  getTrial: (pathId: string, level: number) => {
    const pathLevel = get().getPathLevel(pathId, level);
    return pathLevel?.trials?.[0] || null;
  },

  // Check if path is loading
  isLoadingPath: (pathId: string) => {
    return get().loadingPaths.has(pathId);
  },

  // Clear all cached paths
  clearCache: () => {
    set({
      paths: {},
      loadingPaths: new Set(),
      error: null,
    });
    pathService.clearPathCache();
  },
}));

/**
 * Path Sync Service - Sync constants to database
 * Treats client-side constants as source of truth
 * Automatically updates database when constants change
 * 
 * @usage
 * // On app initialization (main.tsx or App.tsx)
 * await syncPathsToDatabase();
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { TEMPERING_LEVELS, TEMPERING_TEMPLATE_ID } from '@/constants/temperingPath';
import { PRESENCE_LEVELS, PRESENCE_TEMPLATE_ID } from '@/constants/presencePath';
import { handleError } from './errorHandler';
import { logger } from '@/utils/logger';

const SYNC_VERSION_KEY = 'path-sync-version';
const CURRENT_SYNC_VERSION = '1.1.0'; // Increment this when you make changes (1.1.0 adds Presence path)

/**
 * Check if sync is needed by comparing versions
 */
const needsSync = (): boolean => {
  try {
    const lastSync = localStorage.getItem(SYNC_VERSION_KEY);
    return lastSync !== CURRENT_SYNC_VERSION;
  } catch {
    return true;
  }
};

/**
 * Mark sync as complete
 */
const markSyncComplete = () => {
  try {
    localStorage.setItem(SYNC_VERSION_KEY, CURRENT_SYNC_VERSION);
  } catch (error) {
    handleError(error, 'markSyncComplete');
  }
};

/**
 * Sync path metadata (main path entry) - Tempering
 */
const syncTemperingMetadata = async () => {
  const { error } = await supabase
    .from('paths')
    .upsert({
      id: TEMPERING_TEMPLATE_ID,
      name: 'Tempering',
      description: 'Warrior Trainee path focusing on body cultivation through the Five-Gate System',
      primary_stat: 'BODY',
      tier: 'D',
      max_level: 10,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (error) throw error;
};

/**
 * Sync path metadata (main path entry) - Presence
 */
const syncPresenceMetadata = async () => {
  const { error } = await supabase
    .from('paths')
    .upsert({
      id: PRESENCE_TEMPLATE_ID,
      name: 'Presence',
      description: 'Mystic Training path focusing on soul cultivation through the Five-Gate System',
      primary_stat: 'SOUL',
      tier: 'D',
      max_level: 10,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (error) throw error;
};

/**
 * Sync a single Tempering level with all gates, subtasks, and trial
 */
const syncTemperingLevel = async (level: number) => {
  const config = TEMPERING_LEVELS.find(l => l.level === level);
  if (!config) throw new Error(`Tempering Level ${level} not found`);

  // 1. Upsert path_level
  const { data: levelData, error: levelError } = await supabase
    .from('path_levels')
    .upsert({
      path_id: TEMPERING_TEMPLATE_ID,
      level: config.level,
      subtitle: config.subtitle,
      xp_to_level_up: config.xpToLevelUp,
      days_required: config.daysRequired,
      main_stat_limit: config.mainStatLimit,
      gate_stat_cap: config.gateStatCap,
      base_coins: config.baseCoins,
      base_stat_points: config.baseBodyPoints,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'path_id,level',
    })
    .select('id')
    .single();

  if (levelError) throw levelError;
  const pathLevelId = levelData.id;

  // 2. Delete existing gates (cascade deletes subtasks)
  await supabase
    .from('gates')
    .delete()
    .eq('path_level_id', pathLevelId);

  // 3. Insert gates with subtasks
  for (const [index, task] of config.tasks.entries()) {
    const { data: gateData, error: gateError } = await supabase
      .from('gates')
      .insert({
        path_level_id: pathLevelId,
        gate_name: task.gate,
        task_name: task.name,
        focus_description: task.focus,
        task_order: index + 1,
      })
      .select('id')
      .single();

    if (gateError) throw gateError;

    // Insert subtasks into gate_subtasks table
    const subtasks = task.subtasks.map((st, stIndex) => ({
      gate_id: gateData.id,
      name: st.name,
      focus_description: st.focus,
      subtask_order: stIndex + 1,
    }));

    const { error: subtaskError } = await supabase
      .from('gate_subtasks')
      .insert(subtasks);

    if (subtaskError) throw subtaskError;
  }

  // 4. Upsert trial
  await supabase
    .from('trials')
    .delete()
    .eq('path_level_id', pathLevelId);

  const { error: trialError } = await supabase
    .from('trials')
    .insert({
      path_level_id: pathLevelId,
      name: config.trial.name,
      description: config.trial.name,
      tasks_description: config.trial.tasks,
      focus_description: config.trial.focus,
      reward_coins: config.trial.rewards.coins,
      reward_stars: config.trial.rewards.stars,
      reward_stat_points: config.trial.rewards.bodyPoints,
      reward_item: config.trial.rewards.item,
    });

  if (trialError) throw trialError;

  logger.debug(`Synced Tempering level ${level}`, { pathLevelId });
};

/**
 * Sync a single Presence level with all gates, subtasks, and trial
 */
const syncPresenceLevel = async (level: number) => {
  const config = PRESENCE_LEVELS.find(l => l.level === level);
  if (!config) throw new Error(`Presence Level ${level} not found`);

  // 1. Upsert path_level
  const { data: levelData, error: levelError } = await supabase
    .from('path_levels')
    .upsert({
      path_id: PRESENCE_TEMPLATE_ID,
      level: config.level,
      subtitle: config.subtitle,
      xp_to_level_up: config.xpToLevelUp,
      days_required: config.daysRequired,
      main_stat_limit: config.mainStatLimit,
      gate_stat_cap: config.gateStatCap,
      base_coins: config.baseCoins,
      base_stat_points: config.baseSoulPoints,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'path_id,level',
    })
    .select('id')
    .single();

  if (levelError) throw levelError;
  const pathLevelId = levelData.id;

  // 2. Delete existing gates (cascade deletes subtasks)
  await supabase
    .from('gates')
    .delete()
    .eq('path_level_id', pathLevelId);

  // 3. Insert gates with subtasks
  for (const [index, task] of config.tasks.entries()) {
    const { data: gateData, error: gateError } = await supabase
      .from('gates')
      .insert({
        path_level_id: pathLevelId,
        gate_name: task.gate,
        task_name: task.name,
        focus_description: task.focus,
        task_order: index + 1,
      })
      .select('id')
      .single();

    if (gateError) throw gateError;

    // Insert subtasks into gate_subtasks table
    const subtasks = task.subtasks.map((st, stIndex) => ({
      gate_id: gateData.id,
      name: st.name,
      focus_description: st.focus,
      subtask_order: stIndex + 1,
    }));

    const { error: subtaskError } = await supabase
      .from('gate_subtasks')
      .insert(subtasks);

    if (subtaskError) throw subtaskError;
  }

  // 4. Upsert trial
  await supabase
    .from('trials')
    .delete()
    .eq('path_level_id', pathLevelId);

  const { error: trialError } = await supabase
    .from('trials')
    .insert({
      path_level_id: pathLevelId,
      name: config.trial.name,
      description: config.trial.name,
      tasks_description: config.trial.tasks,
      focus_description: config.trial.focus,
      reward_coins: config.trial.rewards.coins,
      reward_stars: config.trial.rewards.stars,
      reward_stat_points: config.trial.rewards.soulPoints,
      reward_item: config.trial.rewards.item,
    });

  if (trialError) throw trialError;

  logger.debug(`Synced Presence level ${level}`, { pathLevelId });
};

/**
 * Main sync function - syncs all path data to database
 */
export const syncPathsToDatabase = async (): Promise<boolean> => {
  try {
    // Skip if Supabase not configured (local development)
    if (!isSupabaseConfigured()) {
      logger.info('Supabase not configured, skipping path sync');
      return true;
    }

    // Skip if already synced this version
    if (!needsSync()) {
      logger.info('Paths already synced, skipping');
      return true;
    }

    logger.info('Starting path sync to database...');

    // 1. Sync Tempering path metadata
    await syncTemperingMetadata();

    // 2. Sync all 10 Tempering levels
    for (let level = 1; level <= 10; level++) {
      await syncTemperingLevel(level);
    }

    // 3. Sync Presence path metadata
    await syncPresenceMetadata();

    // 4. Sync all 10 Presence levels
    for (let level = 1; level <= 10; level++) {
      await syncPresenceLevel(level);
    }

    // 5. Mark sync as complete
    markSyncComplete();

    logger.info('Path sync completed successfully');
    return true;
  } catch (error) {
    handleError(error, 'syncPathsToDatabase');
    logger.warn('Path sync failed, falling back to constants');
    return false;
  }
};

/**
 * Force sync (ignores version check)
 */
export const forceSyncPaths = async (): Promise<boolean> => {
  try {
    localStorage.removeItem(SYNC_VERSION_KEY);
    return await syncPathsToDatabase();
  } catch (error) {
    handleError(error, 'forceSyncPaths');
    return false;
  }
};

/**
 * Check sync status
 */
export const getSyncStatus = () => {
  const lastVersion = localStorage.getItem(SYNC_VERSION_KEY);
  return {
    isSynced: lastVersion === CURRENT_SYNC_VERSION,
    lastVersion,
    currentVersion: CURRENT_SYNC_VERSION,
    needsSync: needsSync(),
  };
};

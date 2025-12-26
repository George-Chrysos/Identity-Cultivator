/**
 * Path Alignment Service - Manual sync of path constants to database
 * Constants are the source of truth - this service ensures DB matches constants
 * 
 * @usage
 * // Triggered manually via "Align Paths" button in Player Menu
 * const result = await alignPaths();
 * // Returns: { aligned: true, changes: [...] } or { aligned: false, error: '...' }
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { TEMPERING_LEVELS, TEMPERING_TEMPLATE_ID } from '@/constants/temperingPath';
import { PRESENCE_LEVELS, PRESENCE_TEMPLATE_ID } from '@/constants/presencePath';
import { handleError } from './errorHandler';
import { logger } from '@/utils/logger';

interface AlignmentChange {
  path: string;
  level: number;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

interface AlignmentResult {
  aligned: boolean;
  changes: AlignmentChange[];
  error?: string;
}

/**
 * Align Tempering path metadata
 */
const alignTemperingMetadata = async (): Promise<AlignmentChange[]> => {
  const changes: AlignmentChange[] = [];
  
  // Check existing metadata
  const { data: existing } = await supabase
    .from('paths')
    .select('*')
    .eq('id', TEMPERING_TEMPLATE_ID)
    .single();

  const expected = {
    id: TEMPERING_TEMPLATE_ID,
    name: 'Tempering',
    description: 'Warrior Trainee path focusing on body cultivation through the Five-Gate System',
    primary_stat: 'BODY',
    tier: 'D',
    max_level: 10,
  };

  // Check for differences
  if (!existing || 
      existing.name !== expected.name ||
      existing.description !== expected.description ||
      existing.primary_stat !== expected.primary_stat ||
      existing.tier !== expected.tier ||
      existing.max_level !== expected.max_level) {
    
    const { error } = await supabase
      .from('paths')
      .upsert({
        ...expected,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) throw error;
    
    changes.push({
      path: 'Tempering',
      level: 0,
      field: 'metadata',
      oldValue: existing || 'missing',
      newValue: expected,
    });
  }

  return changes;
};

/**
 * Align Presence path metadata
 */
const alignPresenceMetadata = async (): Promise<AlignmentChange[]> => {
  const changes: AlignmentChange[] = [];
  
  const { data: existing } = await supabase
    .from('paths')
    .select('*')
    .eq('id', PRESENCE_TEMPLATE_ID)
    .single();

  const expected = {
    id: PRESENCE_TEMPLATE_ID,
    name: 'Presence',
    description: 'Mystic Training path focusing on soul cultivation through the Five-Gate System',
    primary_stat: 'SOUL',
    tier: 'D',
    max_level: 10,
  };

  if (!existing || 
      existing.name !== expected.name ||
      existing.description !== expected.description ||
      existing.primary_stat !== expected.primary_stat ||
      existing.tier !== expected.tier ||
      existing.max_level !== expected.max_level) {
    
    const { error } = await supabase
      .from('paths')
      .upsert({
        ...expected,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) throw error;
    
    changes.push({
      path: 'Presence',
      level: 0,
      field: 'metadata',
      oldValue: existing || 'missing',
      newValue: expected,
    });
  }

  return changes;
};

/**
 * Align a single Tempering level
 */
const alignTemperingLevel = async (level: number): Promise<AlignmentChange[]> => {
  const changes: AlignmentChange[] = [];
  const config = TEMPERING_LEVELS.find(l => l.level === level);
  if (!config) throw new Error(`Tempering Level ${level} not found in constants`);

  // Check existing level
  const { data: existingLevel } = await supabase
    .from('path_levels')
    .select('*')
    .eq('path_id', TEMPERING_TEMPLATE_ID)
    .eq('level', level)
    .single();

  const expectedLevel = {
    path_id: TEMPERING_TEMPLATE_ID,
    level: config.level,
    subtitle: config.subtitle,
    xp_to_level_up: config.xpToLevelUp,
    days_required: config.daysRequired,
    main_stat_limit: config.mainStatLimit,
    gate_stat_cap: config.gateStatCap,
    base_coins: config.baseCoins,
    base_stat_points: config.baseBodyPoints,
  };

  // Check for differences in level data
  const needsUpdate = !existingLevel ||
    existingLevel.subtitle !== expectedLevel.subtitle ||
    existingLevel.xp_to_level_up !== expectedLevel.xp_to_level_up ||
    existingLevel.days_required !== expectedLevel.days_required ||
    existingLevel.main_stat_limit !== expectedLevel.main_stat_limit ||
    existingLevel.gate_stat_cap !== expectedLevel.gate_stat_cap ||
    existingLevel.base_coins !== expectedLevel.base_coins ||
    existingLevel.base_stat_points !== expectedLevel.base_stat_points;

  if (needsUpdate) {
    const { data: levelData, error: levelError } = await supabase
      .from('path_levels')
      .upsert({
        ...expectedLevel,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'path_id,level',
      })
      .select('id')
      .single();

    if (levelError) throw levelError;

    changes.push({
      path: 'Tempering',
      level,
      field: 'level_config',
      oldValue: existingLevel || 'missing',
      newValue: expectedLevel,
    });

    const pathLevelId = levelData.id;

    // Delete existing gates and rebuild
    await supabase.from('gates').delete().eq('path_level_id', pathLevelId);

    // Insert gates with subtasks
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

    // Update trial
    await supabase.from('trials').delete().eq('path_level_id', pathLevelId);

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
  }

  return changes;
};

/**
 * Align a single Presence level
 */
const alignPresenceLevel = async (level: number): Promise<AlignmentChange[]> => {
  const changes: AlignmentChange[] = [];
  const config = PRESENCE_LEVELS.find(l => l.level === level);
  if (!config) throw new Error(`Presence Level ${level} not found in constants`);

  const { data: existingLevel } = await supabase
    .from('path_levels')
    .select('*')
    .eq('path_id', PRESENCE_TEMPLATE_ID)
    .eq('level', level)
    .single();

  const expectedLevel = {
    path_id: PRESENCE_TEMPLATE_ID,
    level: config.level,
    subtitle: config.subtitle,
    xp_to_level_up: config.xpToLevelUp,
    days_required: config.daysRequired,
    main_stat_limit: config.mainStatLimit,
    gate_stat_cap: config.gateStatCap,
    base_coins: config.baseCoins,
    base_stat_points: config.baseSoulPoints,
  };

  const needsUpdate = !existingLevel ||
    existingLevel.subtitle !== expectedLevel.subtitle ||
    existingLevel.xp_to_level_up !== expectedLevel.xp_to_level_up ||
    existingLevel.days_required !== expectedLevel.days_required ||
    existingLevel.main_stat_limit !== expectedLevel.main_stat_limit ||
    existingLevel.gate_stat_cap !== expectedLevel.gate_stat_cap ||
    existingLevel.base_coins !== expectedLevel.base_coins ||
    existingLevel.base_stat_points !== expectedLevel.base_stat_points;

  if (needsUpdate) {
    const { data: levelData, error: levelError } = await supabase
      .from('path_levels')
      .upsert({
        ...expectedLevel,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'path_id,level',
      })
      .select('id')
      .single();

    if (levelError) throw levelError;

    changes.push({
      path: 'Presence',
      level,
      field: 'level_config',
      oldValue: existingLevel || 'missing',
      newValue: expectedLevel,
    });

    const pathLevelId = levelData.id;

    // Delete existing gates and rebuild
    await supabase.from('gates').delete().eq('path_level_id', pathLevelId);

    // Insert gates with subtasks
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

    // Update trial
    await supabase.from('trials').delete().eq('path_level_id', pathLevelId);

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
  }

  return changes;
};

/**
 * Main alignment function - compares DB against constants and updates DB
 * Called manually via "Align Paths" button
 */
export const alignPaths = async (): Promise<AlignmentResult> => {
  try {
    if (!isSupabaseConfigured()) {
      logger.info('Supabase not configured, skipping path alignment');
      return { aligned: true, changes: [], error: 'Supabase not configured - offline mode' };
    }

    logger.info('🔄 Starting path alignment...');
    const allChanges: AlignmentChange[] = [];

    // Align Tempering path
    const temperingMetaChanges = await alignTemperingMetadata();
    allChanges.push(...temperingMetaChanges);

    for (let level = 1; level <= 10; level++) {
      const levelChanges = await alignTemperingLevel(level);
      allChanges.push(...levelChanges);
    }

    // Align Presence path
    const presenceMetaChanges = await alignPresenceMetadata();
    allChanges.push(...presenceMetaChanges);

    for (let level = 1; level <= 10; level++) {
      const levelChanges = await alignPresenceLevel(level);
      allChanges.push(...levelChanges);
    }

    if (allChanges.length === 0) {
      logger.info('✅ Paths Aligned - no changes needed');
    } else {
      logger.info('✅ Path alignment complete', { changesCount: allChanges.length });
      allChanges.forEach(change => {
        logger.debug('Change applied', {
          path: change.path,
          level: change.level,
          field: change.field,
        });
      });
    }

    return { aligned: true, changes: allChanges };
  } catch (error) {
    handleError(error, 'alignPaths');
    return { 
      aligned: false, 
      changes: [], 
      error: error instanceof Error ? error.message : 'Unknown error during path alignment' 
    };
  }
};

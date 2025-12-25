import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { calculateOverallRank } from '@/utils/overallRank';
import {
  UserProfile,
  PlayerIdentity,
  PlayerIdentityWithDetails,
  IdentityTemplate,
  TaskTemplate,
  TaskLog,
  CompleteTaskRequest,
  CompleteTaskResponse,
  ActivateIdentityRequest,
  SUPABASE_TABLES,
  STAT_COLUMN_MAPPING,
  DEFAULT_PROFILE_VALUES,
  ItemTemplate,
  PlayerInventoryItem,
  PurchaseItemRequest,
  MarketState,
} from '@/types/database';

// Lazy import mockDB to avoid circular dependency at module initialization
// Only loaded when Supabase is not configured
let _mockDB: typeof import('./mockDatabase').mockDB | null = null;
const getMockDB = async () => {
  if (!_mockDB) {
    const module = await import('./mockDatabase');
    _mockDB = module.mockDB;
  }
  return _mockDB;
};

/**
 * New Supabase service using refactored schema
 * Falls back to mockDB when Supabase is not configured
 */
export const gameDB = {
  // ==================== PROFILES ====================
  
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.getProfile(userId);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get profile', error);
      throw error;
    }
  },

  /**
   * Create a new user profile
   */
  async createProfile(userId: string, displayName: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.createProfile(userId, displayName);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .insert({
          id: userId,
          display_name: displayName,
          ...DEFAULT_PROFILE_VALUES,
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Profile created', { userId });
      return data;
    } catch (error) {
      logger.error('Failed to create profile', error);
      throw error;
    }
  },

  /**
   * Update user profile stats
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.updateProfile(userId, updates);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Failed to update profile', error);
      throw error;
    }
  },

  /**
   * Calculate and update overall rank based on current dimensions
   */
  async updateOverallRank(userId: string): Promise<UserProfile> {
    try {
      // Get current profile
      const profile = await this.getProfile(userId);
      if (!profile) throw new Error('Profile not found');

      // Calculate overall rank
      const { finalScore, rankTier } = calculateOverallRank({
        body: profile.body_points,
        mind: profile.mind_points,
        soul: profile.soul_points,
        will: profile.will_points || 0,
      });

      // Update profile with new rank
      const updatedProfile = await this.updateProfile(userId, {
        final_score: finalScore,
        rank_tier: rankTier,
      });

      logger.info('Overall rank updated', { 
        userId, 
        finalScore, 
        rankTier,
        dimensions: {
          body: profile.body_points,
          mind: profile.mind_points,
          soul: profile.soul_points,
          will: profile.will_points || 0,
        }
      });

      return updatedProfile;
    } catch (error) {
      logger.error('Failed to update overall rank', error);
      throw error;
    }
  },

  // ==================== IDENTITY TEMPLATES ====================

  /**
   * Get all identity templates
   */
  async getIdentityTemplates(): Promise<IdentityTemplate[]> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.getIdentityTemplates();
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.IDENTITY_TEMPLATES)
        .select('*')
        .order('tier', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to get identity templates', error);
      throw error;
    }
  },

  /**
   * Get identity template by ID
   */
  async getIdentityTemplate(templateId: string): Promise<IdentityTemplate | null> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.getIdentityTemplate(templateId);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.IDENTITY_TEMPLATES)
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get identity template', error);
      throw error;
    }
  },

  // ==================== TASK TEMPLATES ====================

  /**
   * Get all task templates for an identity
   */
  async getTaskTemplates(identityTemplateId: string): Promise<TaskTemplate[]> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.getTaskTemplates(identityTemplateId);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.TASK_TEMPLATES)
        .select('*')
        .eq('identity_template_id', identityTemplateId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to get task templates', error);
      throw error;
    }
  },

  // ==================== PLAYER IDENTITIES ====================

  /**
   * Get all active player identities for a user
   */
  async getActiveIdentities(userId: string): Promise<PlayerIdentityWithDetails[]> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.getActiveIdentities(userId);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PLAYER_IDENTITIES)
        .select(`
          *,
          template:identity_templates(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch tasks and completion status for each identity
      const identitiesWithDetails = await Promise.all(
        (data || []).map(async (identity) => {
          const tasks = await this.getTaskTemplates(identity.template_id);
          const completedToday = await this.checkCompletedToday(identity.id);

          return {
            ...identity,
            template: identity.template,
            available_tasks: tasks,
            completed_today: completedToday,
          };
        })
      );

      return identitiesWithDetails;
    } catch (error) {
      logger.error('Failed to get active identities', error);
      throw error;
    }
  },

  /**
   * Activate a new identity for a user
   */
  async activateIdentity(request: ActivateIdentityRequest): Promise<PlayerIdentity> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.activateIdentity(request);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PLAYER_IDENTITIES)
        .insert({
          user_id: request.user_id,
          template_id: request.template_id,
          is_active: true,
          current_level: 1,
          current_xp: 0,
          current_streak: 0,
          will_contribution: 0,
          status: 'ACTIVE',
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Identity activated', request);
      return data;
    } catch (error) {
      logger.error('Failed to activate identity', error);
      throw error;
    }
  },

  /**
   * Deactivate an identity
   */
  async deactivateIdentity(identityId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.deactivateIdentity(identityId);
    }

    try {
      const { error } = await supabase
        .from(SUPABASE_TABLES.PLAYER_IDENTITIES)
        .update({ is_active: false, status: 'PAUSED' })
        .eq('id', identityId);

      if (error) throw error;

      logger.info('Identity deactivated', { identityId });
    } catch (error) {
      logger.error('Failed to deactivate identity', error);
      throw error;
    }
  },

  /**
   * Update an identity's properties (e.g., streak, XP)
   */
  async updateIdentity(identityId: string, updates: Partial<PlayerIdentity>): Promise<PlayerIdentity> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.updateIdentity(identityId, updates);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PLAYER_IDENTITIES)
        .update(updates)
        .eq('id', identityId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Identity updated', { identityId, updates });
      return data;
    } catch (error) {
      logger.error('Failed to update identity', error);
      throw error;
    }
  },

  // ==================== TASK COMPLETION ====================

  /**
   * Complete a task
   */
  async completeTask(request: CompleteTaskRequest): Promise<CompleteTaskResponse> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.completeTask(request);
    }

    try {
      // Get the task template
      const { data: taskTemplate, error: taskError } = await supabase
        .from(SUPABASE_TABLES.TASK_TEMPLATES)
        .select('*')
        .eq('id', request.task_template_id)
        .single();

      if (taskError) throw taskError;

      // Get the player identity
      const { data: identity, error: identityError } = await supabase
        .from(SUPABASE_TABLES.PLAYER_IDENTITIES)
        .select('*')
        .eq('id', request.identity_instance_id)
        .single();

      if (identityError) throw identityError;

      // Insert task log
      const { data: taskLog, error: logError } = await supabase
        .from(SUPABASE_TABLES.TASK_LOGS)
        .insert({
          user_id: request.user_id,
          identity_instance_id: request.identity_instance_id,
          task_template_id: request.task_template_id,
          stat_points_earned: taskTemplate.base_points_reward,
          coins_earned: taskTemplate.coin_reward,
          xp_earned: taskTemplate.xp_reward,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Update profile stats
      const statColumn = STAT_COLUMN_MAPPING[taskTemplate.target_stat as keyof typeof STAT_COLUMN_MAPPING];
      const { error: profileError } = await supabase.rpc('update_profile_stats', {
        p_user_id: request.user_id,
        p_stat_column: statColumn,
        p_stat_points: taskTemplate.base_points_reward,
        p_coins: taskTemplate.coin_reward,
      });

      if (profileError) {
        // Fallback to manual update if RPC doesn't exist
        const { data: currentProfile } = await supabase
          .from(SUPABASE_TABLES.PROFILES)
          .select('*')
          .eq('id', request.user_id)
          .single();

        if (currentProfile) {
          await supabase
            .from(SUPABASE_TABLES.PROFILES)
            .update({
              [statColumn]: currentProfile[statColumn] + taskTemplate.base_points_reward,
              coins: currentProfile.coins + taskTemplate.coin_reward,
            })
            .eq('id', request.user_id);
        }
      }

      // Update identity XP and streak
      // Use PathRegistry for XP calculation if path_id is available, otherwise use legacy formula
      const { getPathLevelConfig } = await import('@/constants/pathRegistry');
      const pathLevelConfig = taskTemplate.path_id 
        ? getPathLevelConfig(taskTemplate.path_id, identity.current_level)
        : null;
      
      const newXp = identity.current_xp + taskTemplate.xp_reward;
      const xpForNextLevel = pathLevelConfig?.xpToLevelUp ?? (identity.current_level * 100);
      const leveledUp = newXp >= xpForNextLevel;
      const newLevel = leveledUp ? identity.current_level + 1 : identity.current_level;

      // ❌ BUG FIX: DO NOT increment streak here! 
      // Streak should only increment once per day when ALL tasks are completed.
      // This is managed by PathCard.tsx and gameStore.updateIdentityStreak()
      const { data: updatedIdentity, error: updateError } = await supabase
        .from(SUPABASE_TABLES.PLAYER_IDENTITIES)
        .update({
          current_xp: leveledUp ? newXp - xpForNextLevel : newXp,
          current_level: newLevel,
          // REMOVED: current_streak increment - handled by PathCard only
        })
        .eq('id', request.identity_instance_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update overall rank after stat changes
      await this.updateOverallRank(request.user_id);

      // Re-fetch profile with updated rank
      const { data: finalProfile } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .select('*')
        .eq('id', request.user_id)
        .single();

      logger.info('Task completed', { taskLog });

      return {
        task_log: taskLog,
        updated_profile: finalProfile!,
        updated_identity: updatedIdentity,
        leveled_up: leveledUp,
        stat_increased: taskTemplate.base_points_reward > 0,
        rewards: {
          [taskTemplate.target_stat.toLowerCase() + '_points']: taskTemplate.base_points_reward,
          coins: taskTemplate.coin_reward,
          xp: taskTemplate.xp_reward,
        },
      };
    } catch (error) {
      logger.error('Failed to complete task', error);
      throw error;
    }
  },

  /**
   * Check if identity has been completed today
   */
  async checkCompletedToday(identityId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.checkCompletedToday(identityId);
    }

    try {
      // Use getTodayDate which respects testing mode
      const today = (() => {
        const testingStore = (window as any).__testingStore;
        if (testingStore) {
          const state = testingStore.getState();
          if (state.isTestingMode) {
            return new Date(state.testingDate).toISOString().split('T')[0];
          }
        }
        return new Date().toISOString().split('T')[0];
      })();
      
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.TASK_LOGS)
        .select('id')
        .eq('identity_instance_id', identityId)
        .gte('completed_at', `${today}T00:00:00`)
        .limit(1);

      if (error) throw error;

      return (data?.length || 0) > 0;
    } catch (error) {
      logger.error('Failed to check completion status', error);
      return false;
    }
  },

  /**
   * Get recent task completions
   */
  async getRecentCompletions(userId: string, limit: number = 10): Promise<TaskLog[]> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.getRecentCompletions(userId, limit);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.TASK_LOGS)
        .select(`
          *,
          task_template:task_templates(*),
          player_identity:player_identities(*)
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to get recent completions', error);
      throw error;
    }
  },

  // ==================== TASK LOGS (HISTORY) ====================

  /**
   * Get completion history for an identity
   */
  async getCompletionHistory(
    userId: string,
    identityId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TaskLog[]> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.getCompletionHistory(userId, identityId, startDate, endDate);
    }

    try {
      let query = supabase
        .from(SUPABASE_TABLES.TASK_LOGS)
        .select('*')
        .eq('user_id', userId)
        .eq('identity_instance_id', identityId)
        .order('completed_at', { ascending: false });

      if (startDate) {
        query = query.gte('completed_at', startDate);
      }

      if (endDate) {
        query = query.lte('completed_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to get completion history', error);
      throw error;
    }
  },

  // ==================== SHOP ====================

  /**
   * Get available shop items
   */
  async getShopItems(): Promise<ItemTemplate[]> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.getShopItems();
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.ITEM_TEMPLATES)
        .select('*')
        .eq('is_available', true)
        .order('cost_coins', { ascending: true });

      if (error) throw error;

      logger.info('Loaded shop items', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Failed to get shop items', error);
      throw error;
    }
  },

  /**
   * Purchase an item
   */
  async purchaseItem(request: PurchaseItemRequest): Promise<PlayerInventoryItem> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.purchaseItem(request);
    }

    try {
      // Call the purchase_item RPC function
      const { data, error } = await supabase.rpc('purchase_item', {
        p_user_id: request.user_id,
        p_item_template_id: request.item_template_id,
        p_quantity: request.quantity || 1,
      });

      if (error) throw error;

      logger.info('Item purchased', { userId: request.user_id, itemId: request.item_template_id });
      return data;
    } catch (error) {
      logger.error('Failed to purchase item', error);
      throw error;
    }
  },

  /**
   * Get player's inventory
   */
  async getPlayerInventory(userId: string): Promise<PlayerInventoryItem[]> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.getPlayerInventory(userId);
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PLAYER_INVENTORY)
        .select(`
          *,
          item_template:item_templates(*)
        `)
        .eq('user_id', userId)
        .order('acquired_at', { ascending: false });

      if (error) throw error;

      logger.info('Loaded player inventory', { userId, count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Failed to get player inventory', error);
      throw error;
    }
  },

  /**
   * Use an inventory item
   */
  async useInventoryItem(userId: string, inventoryItemId: string): Promise<PlayerInventoryItem> {
    if (!isSupabaseConfigured()) {
      const mockDB = await getMockDB();
      return mockDB.useInventoryItem(userId, inventoryItemId);
    }

    try {
      // Call the use_inventory_item RPC function
      const { data, error } = await supabase.rpc('use_inventory_item', {
        p_user_id: userId,
        p_inventory_item_id: inventoryItemId,
      });

      if (error) throw error;

      logger.info('Item used', { userId, inventoryItemId });
      return data;
    } catch (error) {
      logger.error('Failed to use inventory item', error);
      throw error;
    }
  },

  // ==================== MARKET STATES ====================

  /**
   * Get all market states for a user
   */
  async getMarketStates(userId: string): Promise<MarketState[]> {
    if (!isSupabaseConfigured()) {
      // No mock support needed - return empty for local dev
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.MARKET_STATES)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      logger.info('Loaded market states', { userId, count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Failed to get market states', error);
      throw error;
    }
  },

  /**
   * Upsert a market state (insert or update if exists)
   */
  async upsertMarketState(marketState: Omit<MarketState, 'id' | 'created_at' | 'updated_at'>): Promise<MarketState> {
    if (!isSupabaseConfigured()) {
      // Return mock state for local dev
      return {
        ...marketState,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.MARKET_STATES)
        .upsert({
          user_id: marketState.user_id,
          ticket_id: marketState.ticket_id,
          last_purchased_at: marketState.last_purchased_at,
          cooldown_duration: marketState.cooldown_duration,
          base_inflation: marketState.base_inflation,
        }, {
          onConflict: 'user_id,ticket_id',
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Market state upserted', { 
        userId: marketState.user_id, 
        ticketId: marketState.ticket_id 
      });
      return data;
    } catch (error) {
      logger.error('Failed to upsert market state', error);
      throw error;
    }
  },

  /**
   * Delete expired market states (for cleanup)
   */
  async cleanExpiredMarketStates(userId: string): Promise<number> {
    if (!isSupabaseConfigured()) {
      return 0;
    }

    try {
      // Get all states for user
      const states = await this.getMarketStates(userId);
      const now = Date.now();
      const expiredIds: string[] = [];

      states.forEach(state => {
        const lastPurchased = new Date(state.last_purchased_at).getTime();
        const cooldownMs = state.cooldown_duration * 60 * 60 * 1000;
        const isExpired = now > lastPurchased + cooldownMs;
        if (isExpired && state.id) {
          expiredIds.push(state.id);
        }
      });

      if (expiredIds.length === 0) return 0;

      const { error } = await supabase
        .from(SUPABASE_TABLES.MARKET_STATES)
        .delete()
        .in('id', expiredIds);

      if (error) throw error;

      logger.info('Cleaned expired market states', { userId, count: expiredIds.length });
      return expiredIds.length;
    } catch (error) {
      logger.error('Failed to clean expired market states', error);
      throw error;
    }
  },

  // ==================== DAILY RECORDS ====================

  /**
   * Save daily record snapshot
   * Called before daily reset to preserve yesterday's progress
   */
  async saveDailyRecord(record: Omit<import('@/types/database').DailyRecord, 'id' | 'created_at'>): Promise<void> {
    if (!isSupabaseConfigured()) {
      // Mock DB can store in memory or skip
      logger.info('Mock DB: Daily record saved to memory', { date: record.date });
      return;
    }

    try {
      const { error } = await supabase
        .from(SUPABASE_TABLES.DAILY_RECORDS)
        .insert({
          user_id: record.user_id,
          date: record.date,
          path_stats: record.path_stats,
          quests_completed: record.quests_completed,
          total_coins_earned: record.total_coins_earned,
        });

      if (error) throw error;

      logger.info('Daily record saved', { userId: record.user_id, date: record.date });
    } catch (error) {
      logger.error('Failed to save daily record', error);
      throw error;
    }
  },

  /**
   * Get recent daily records for a user
   */
  async getDailyRecords(userId: string, limit: number = 30): Promise<import('@/types/database').DailyRecord[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.DAILY_RECORDS)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to get daily records', error);
      throw error;
    }
  },

  // ==================== DAILY PATH PROGRESS ====================

  /**
   * Upsert daily path progress (Rule 8)
   * Called when a task is toggled to track real-time completion percentage
   */
  async upsertDailyPathProgress(progress: {
    user_id: string;
    path_id: string;
    date: string;
    tasks_total: number;
    tasks_completed: number;
    status: 'PENDING' | 'COMPLETED';
  }): Promise<import('@/types/database').DailyPathProgress> {
    if (!isSupabaseConfigured()) {
      // Return mock data for local dev
      const percentage = progress.tasks_total > 0 
        ? Math.round((progress.tasks_completed / progress.tasks_total) * 100) 
        : 0;
      
      return {
        id: `mock-progress-${Date.now()}`,
        user_id: progress.user_id,
        path_id: progress.path_id,
        date: progress.date,
        tasks_total: progress.tasks_total,
        tasks_completed: progress.tasks_completed,
        percentage,
        status: progress.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.DAILY_PATH_PROGRESS)
        .upsert({
          user_id: progress.user_id,
          path_id: progress.path_id,
          date: progress.date,
          tasks_total: progress.tasks_total,
          tasks_completed: progress.tasks_completed,
          status: progress.status,
        }, {
          onConflict: 'user_id,path_id,date',
        })
        .select()
        .single();

      if (error) throw error;

      logger.debug('Daily path progress upserted', { 
        pathId: progress.path_id, 
        date: progress.date,
        percentage: data.percentage,
      });
      return data;
    } catch (error) {
      logger.error('Failed to upsert daily path progress', error);
      throw error;
    }
  },

  /**
   * Get daily path progress for a specific date (Rule 8)
   * Used to check yesterday's completion for streak verification
   */
  async getDailyPathProgress(
    userId: string, 
    pathId: string, 
    date: string
  ): Promise<import('@/types/database').DailyPathProgress | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.DAILY_PATH_PROGRESS)
        .select('*')
        .eq('user_id', userId)
        .eq('path_id', pathId)
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get daily path progress', error);
      throw error;
    }
  },

  /**
   * Get all daily path progress for a user on a date
   * Used for calendar view and daily summary
   */
  async getAllDailyPathProgress(
    userId: string, 
    date: string
  ): Promise<import('@/types/database').DailyPathProgress[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.DAILY_PATH_PROGRESS)
        .select('*')
        .eq('user_id', userId)
        .eq('date', date);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to get all daily path progress', error);
      throw error;
    }
  },

  /**
   * Get daily path progress history for calendar view
   * Returns progress records for a date range
   */
  async getDailyPathProgressHistory(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<import('@/types/database').DailyPathProgress[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.DAILY_PATH_PROGRESS)
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to get daily path progress history', error);
      throw error;
    }
  },
};

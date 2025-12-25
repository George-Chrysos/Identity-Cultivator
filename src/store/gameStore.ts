import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/utils/logger';
import { storage } from '@/services/storageService';
import { STORE_KEYS } from '@/constants/storage';
import { gameDB } from '@/api/gameDatabase';
import {
  UserProfile,
  PlayerIdentityWithDetails,
  IdentityTemplate,
  TaskTemplate,
  TaskLog,
  CompleteTaskResponse,
  ItemTemplate,
  PlayerInventoryItem,
  PurchaseItemRequest,
  DailyRecord,
} from '@/types/database';
import { 
  UserSealLog, 
  UserSealStats, 
  shouldResetSeals, 
  getTodayDate,
  getMaxDailySealActivations,
  getSubPillarLevel,
  calculateSealAverageLevel,
  SEALS,
} from '@/constants/seals';

// Helper to get yesterday's date as ISO string
const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Tracked task/subtask state per identity for today
interface DailyTaskState {
  completedTasks: string[];
  completedSubtasks: string[];
  date: string; // ISO date string to reset on new day
}

interface GameState {
  // User data
  userProfile: UserProfile | null;
  
  // Daily task tracking per identity (persisted but reset on new day)
  dailyTaskStates: Record<string, DailyTaskState>;
  
  // Active player identities
  activeIdentities: PlayerIdentityWithDetails[];
  
  // Available templates (cached)
  identityTemplates: IdentityTemplate[];
  taskTemplates: TaskTemplate[];
  
  // Recent activity
  recentCompletions: TaskLog[];
  
  // Shop data
  availableItems: ItemTemplate[];
  
  // Inventory data
  playerInventory: PlayerInventoryItem[];
  
  // Seals System
  sealLogs: UserSealLog[]; // Historical seal selections
  sealStats: UserSealStats[]; // Per-seal progression stats
  todaySealLog: UserSealLog | null; // Today's active seals
  
  // Chronos Reset System
  showDawnSummary: boolean; // Show "New Day" summary modal
  lastDailyRecord: DailyRecord | null; // Most recent daily snapshot
  
  // UI state
  isLoading: boolean;
  isInitialized: boolean;
  currentPage: 'home' | 'tavern';
  
  // Actions
  initializeUser: (userId: string) => Promise<void>;
  loadUserProfile: (userId: string) => Promise<void>;
  loadActiveIdentities: (userId: string) => Promise<void>;
  loadPlayerInventory: (userId: string) => Promise<void>;
  purchaseItem: (itemTemplateId: string) => Promise<void>;
  useItem: (inventoryItemId: string) => Promise<void>;
  removeExpiredTickets: () => void;
  loadIdentityTemplates: () => Promise<void>;
  loadTaskTemplates: () => Promise<void>;
  loadShopItems: () => Promise<void>;
  completeTask: (identityId: string, taskTemplateId: string) => Promise<CompleteTaskResponse>;
  updateOverallRank: () => Promise<void>;
  
  // Seals actions
  loadSealData: (userId: string) => Promise<void>;
  setActiveSealIds: (sealIds: string[]) => void;
  completeTodaySeals: () => void;
  getSealStats: (sealId: string) => UserSealStats | null;
  
  // Chronos Reset actions
  setShowDawnSummary: (show: boolean) => void;
  setLastDailyRecord: (record: DailyRecord | null) => void;
  updateLastResetDate: (date: string) => Promise<void>;
  resetDailyProgress: (previousDayTaskStates?: Record<string, DailyTaskState>) => Promise<void>;
  
  // Daily task state actions
  getCompletedTasks: (identityId: string) => Set<string>;
  getCompletedSubtasks: (identityId: string) => Set<string>;
  setCompletedTask: (identityId: string, taskId: string, completed: boolean) => void;
  setCompletedSubtask: (identityId: string, subtaskId: string, completed: boolean) => void;
  clearDailyTasks: (identityId: string) => void;
  
  activateIdentity: (templateId: string) => Promise<void>;
  deactivateIdentity: (identityId: string) => Promise<void>;
  getIdentityById: (identityId: string) => PlayerIdentityWithDetails | null;
  updateIdentityStreak: (identityId: string, streak: number) => Promise<void>;
  updateRewards: (coins: number, statType: string, statPoints: number, stars?: number) => Promise<void>;
  setCurrentPage: (page: 'home' | 'tavern') => void;
  clearGameData: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      userProfile: null,
      activeIdentities: [],
      identityTemplates: [],
      playerInventory: [],
      taskTemplates: [],
      recentCompletions: [],
      availableItems: [],
      sealLogs: [],
      sealStats: [],
      todaySealLog: null,
      showDawnSummary: false,
      lastDailyRecord: null,
      dailyTaskStates: {},
      isLoading: false,
      isInitialized: false,
      currentPage: 'home',

      initializeUser: async (userId: string) => {
        set({ isLoading: true });
        try {
          // Load user profile first
          await get().loadUserProfile(userId);
          
          // Load templates (static data)
          await Promise.all([
            get().loadIdentityTemplates(),
            get().loadTaskTemplates(),
            get().loadShopItems(),
            get().loadSealData(userId), // Load seal data
            get().loadPlayerInventory(userId), // Load inventory
          ]);
          
          // Load user's active identities
          await get().loadActiveIdentities(userId);
          
          set({ isInitialized: true, isLoading: false });
          logger.info('Game data initialized successfully');
        } catch (error) {
          logger.error('Failed to initialize game data', error);
          set({ isLoading: false });
          throw error;
        }
      },

      loadUserProfile: async (userId: string) => {
        try {
          // ALWAYS fetch from database (not from Zustand cache)
          let profile = await gameDB.getProfile(userId);
          
          if (!profile) {
            // Create profile if doesn't exist
            profile = await gameDB.createProfile(userId, 'Cultivator');
            logger.info('Created new user profile');
          } else {
            logger.info('Loaded user profile', { 
              userId, 
              stats: { 
                body: profile.body_points, 
                mind: profile.mind_points,
                soul: profile.soul_points,
                will: profile.will_points 
              }
            });
          }

          // Calculate overall rank if not set or outdated
          if (!profile.rank_tier || !profile.final_score) {
            profile = await gameDB.updateOverallRank(userId);
            logger.info('Initialized overall rank for profile');
          }

          set({ userProfile: profile });
        } catch (error) {
          logger.error('Failed to load user profile', error);
          throw error;
        }
      },

      loadActiveIdentities: async (userId: string) => {
        try {
          const identitiesWithDetails = await gameDB.getActiveIdentities(userId);
          set({ activeIdentities: identitiesWithDetails });
          logger.info('Loaded active identities', { count: identitiesWithDetails.length });
        } catch (error) {
          logger.error('Failed to load active identities', error);
          throw error;
        }
      },

      loadIdentityTemplates: async () => {
        try {
          const data = await gameDB.getIdentityTemplates();
          set({ identityTemplates: data });
          logger.info('Loaded identity templates', { count: data.length });
        } catch (error) {
          logger.error('Failed to load identity templates', error);
          throw error;
        }
      },

      loadTaskTemplates: async () => {
        try {
          // Note: This loads ALL task templates. Consider filtering by identity if needed.
          const templates = get().identityTemplates;
          const allTasks: TaskTemplate[] = [];
          
          for (const template of templates) {
            const tasks = await gameDB.getTaskTemplates(template.id);
            allTasks.push(...tasks);
          }
          
          set({ taskTemplates: allTasks });
          logger.info('Loaded task templates', { count: allTasks.length });
        } catch (error) {
          logger.error('Failed to load task templates', error);
          throw error;
        }
      },

      loadShopItems: async () => {
        try {
          const items = await gameDB.getShopItems();
          set({ availableItems: items });
          logger.info('Loaded shop items', { count: items.length });
        } catch (error) {
          logger.error('Failed to load shop items', error);
          throw error;
        }
      },

      loadPlayerInventory: async (userId: string) => {
        try {
          const inventory = await gameDB.getPlayerInventory(userId);
          set({ playerInventory: inventory });
          logger.info('Loaded player inventory', { count: inventory.length });
        } catch (error) {
          logger.error('Failed to load player inventory', error);
          throw error;
        }
      },

      purchaseItem: async (itemTemplateId: string) => {
        const { userProfile, availableItems } = get();
        if (!userProfile) throw new Error('No user profile');

        try {
          const request: PurchaseItemRequest = {
            user_id: userProfile.id,
            item_template_id: itemTemplateId,
            quantity: 1,
          };

          await gameDB.purchaseItem(request);

          // Update shop market state for tickets (inflation/cooldown tracking)
          const item = availableItems.find(i => i.id === itemTemplateId);
          if (item?.category === 'tickets') {
            const { useShopStore } = await import('./shopStore');
            const cooldownDuration = item.cooldown_time || 24;
            const baseInflation = item.base_inflation || 0;
            await useShopStore.getState().recordPurchase(itemTemplateId, cooldownDuration, baseInflation);
          }

          // Reload profile to get updated coins
          await get().loadUserProfile(userProfile.id);
          
          // Reload inventory to get new item
          await get().loadPlayerInventory(userProfile.id);

          logger.info('Item purchased successfully', { itemTemplateId });
        } catch (error) {
          logger.error('Failed to purchase item', error);
          throw error;
        }
      },

      useItem: async (inventoryItemId: string) => {
        const { userProfile, playerInventory } = get();
        if (!userProfile) throw new Error('No user profile');

        // Find the item in inventory
        const item = playerInventory.find(i => i.id === inventoryItemId);
        if (!item) throw new Error('Item not found in inventory');

        const isTicket = item.item_template?.category === 'tickets';

        try {
          if (isTicket) {
            // For tickets: Set ghost state (is_used, used_at, cooldown_duration)
            const cooldownDuration = item.item_template?.cooldown_time || 24;
            
            // Optimistic update for tickets - mark as used (ghost state)
            set((state) => ({
              playerInventory: state.playerInventory.map(inv =>
                inv.id === inventoryItemId
                  ? {
                      ...inv,
                      is_used: true,
                      used_at: new Date().toISOString(),
                      cooldown_duration: cooldownDuration,
                      quantity: Math.max(0, inv.quantity - 1),
                    }
                  : inv
              ),
            }));

            // Call DB to persist the change
            await gameDB.useInventoryItem(userProfile.id, inventoryItemId);
            
            logger.info('Ticket activated (ghost state)', { inventoryItemId, cooldownDuration });
          } else {
            // For regular items: Just use the item
            await gameDB.useInventoryItem(userProfile.id, inventoryItemId);
            
            // Reload inventory to reflect updated quantity
            await get().loadPlayerInventory(userProfile.id);
            
            logger.info('Item used successfully', { inventoryItemId });
          }
        } catch (error) {
          // Rollback on error
          await get().loadPlayerInventory(userProfile.id);
          logger.error('Failed to use item', error);
          throw error;
        }
      },

      removeExpiredTickets: () => {
        const { playerInventory } = get();
        
        // Filter out expired tickets
        const now = Date.now();
        const updatedInventory = playerInventory.filter(item => {
          // Keep non-tickets
          if (item.item_template?.category !== 'tickets') return true;
          
          // Keep unused tickets
          if (!item.is_used) return true;
          
          // Check if ticket has expired
          if (item.used_at && item.cooldown_duration) {
            const usedTime = new Date(item.used_at).getTime();
            const cooldownMs = item.cooldown_duration * 60 * 60 * 1000;
            const isExpired = now > usedTime + cooldownMs;
            
            if (isExpired) {
              logger.info('Removing expired ticket', { itemId: item.id, name: item.item_template?.name });
              return false; // Remove expired ticket
            }
          }
          
          return true; // Keep non-expired used tickets (ghost state)
        });

        if (updatedInventory.length !== playerInventory.length) {
          set({ playerInventory: updatedInventory });
          logger.info('Expired tickets cleaned up', { 
            removed: playerInventory.length - updatedInventory.length 
          });
        }
      },

      completeTask: async (identityId: string, taskTemplateId: string) => {
        const { userProfile, activeIdentities } = get();
        if (!userProfile) throw new Error('No user profile');

        const identity = activeIdentities.find((i) => i.id === identityId);
        if (!identity) throw new Error('Identity not found');

        try {
          // Optimistic update - DO NOT increment streak here!
          // Streak is managed by PathCard and only increments when ALL tasks are completed
          // Incrementing here causes duplicate streak gains when navigating away and back
          set({
            activeIdentities: activeIdentities.map((i) =>
              i.id === identityId ? { ...i } : i
            ),
          });

          // Complete task via gameDB
          const result = await gameDB.completeTask({
            user_id: userProfile.id,
            identity_instance_id: identityId,
            task_template_id: taskTemplateId,
          });

          // Update store with new data - use original streak, not database-incremented one
          // Database also wrongly increments per task, so preserve the current streak
          set({
            userProfile: result.updated_profile,
            activeIdentities: activeIdentities.map((i) =>
              i.id === identityId ? { 
                ...i, 
                ...result.updated_identity,
                // Preserve original streak - PathCard manages streak separately
                current_streak: identity.current_streak,
              } : i
            ),
          });

          logger.info('Task completed successfully', { identityId, taskTemplateId, rewards: result.rewards });
          return result;
        } catch (error) {
          // Rollback optimistic update
          await get().loadActiveIdentities(userProfile!.id);
          logger.error('Failed to complete task', error);
          throw error;
        }
      },

      activateIdentity: async (templateId: string) => {
        const { userProfile } = get();
        if (!userProfile) throw new Error('No user profile');

        try {
          await gameDB.activateIdentity({
            user_id: userProfile.id,
            template_id: templateId,
          });

          await get().loadActiveIdentities(userProfile.id);
          logger.info('Identity activated', { templateId });
        } catch (error) {
          logger.error('Failed to activate identity', error);
          throw error;
        }
      },

      deactivateIdentity: async (identityId: string) => {
        try {
          await gameDB.deactivateIdentity(identityId);

          const { userProfile } = get();
          if (userProfile) {
            await get().loadActiveIdentities(userProfile.id);
          }
          logger.info('Identity deactivated', { identityId });
        } catch (error) {
          logger.error('Failed to deactivate identity', error);
          throw error;
        }
      },

      getIdentityById: (identityId: string) => {
        return get().activeIdentities.find((i) => i.id === identityId) || null;
      },

      updateIdentityStreak: async (identityId: string, streak: number) => {
        const { activeIdentities } = get();
        const identity = activeIdentities.find((i) => i.id === identityId);
        if (!identity) {
          logger.error('Identity not found for streak update', { identityId });
          return;
        }

        // Optimistic update - apply immediately
        set({
          activeIdentities: activeIdentities.map((i) =>
            i.id === identityId ? { ...i, current_streak: streak, completed_today: true } : i
          ),
        });

        try {
          // Persist to database
          await gameDB.updateIdentity(identityId, { 
            current_streak: streak,
          });
          logger.info('✅ Streak updated successfully', { identityId, streak });
        } catch (error) {
          // In test mode without database, log but don't rollback
          logger.warn('Database unavailable - streak persisted in memory only', { identityId, streak });
          // Keep the optimistic update even if DB fails (for test mode)
        }
      },

      updateRewards: async (coins: number, statType: string, statPoints: number, stars: number = 0) => {
        const { userProfile } = get();
        if (!userProfile) return;

        const statField = statType.toLowerCase() + '_points';
        const updates: Partial<UserProfile> = { 
          coins: userProfile.coins + coins 
        };

        // Update stars if provided
        if (stars !== 0) {
          updates.stars = (userProfile.stars || 0) + stars;
        }

        if (statField === 'body_points') {
          updates.body_points = userProfile.body_points + statPoints;
        } else if (statField === 'mind_points') {
          updates.mind_points = userProfile.mind_points + statPoints;
        } else if (statField === 'soul_points') {
          updates.soul_points = userProfile.soul_points + statPoints;
        } else if (statField === 'will_points') {
          updates.will_points = (userProfile.will_points || 0) + statPoints;
        }

        // Update in database
        try {
          const updatedProfile = await gameDB.updateProfile(userProfile.id, updates);
          set({ userProfile: updatedProfile });
          logger.info('Rewards updated', { coins, statType, statPoints, stars, newCoins: updatedProfile.coins, newStars: updatedProfile.stars });
        } catch (error) {
          logger.error('Failed to update rewards', error);
          throw error;
        }
      },

      setCurrentPage: (page: 'home' | 'tavern') => {
        set({ currentPage: page });
        logger.info('Page navigation', { page });
      },

      // ========== CHRONOS RESET SYSTEM ==========

      setShowDawnSummary: (show: boolean) => {
        set({ showDawnSummary: show });
      },

      setLastDailyRecord: (record: DailyRecord | null) => {
        set({ lastDailyRecord: record });
      },

      updateLastResetDate: async (date: string) => {
        const { userProfile } = get();
        if (!userProfile) return;

        try {
          const updatedProfile = await gameDB.updateProfile(userProfile.id, { 
            last_reset_date: date 
          });
          set({ userProfile: updatedProfile });
          logger.info('Last reset date updated', { date });
        } catch (error) {
          logger.error('Failed to update last reset date', { error });
          throw error;
        }
      },

      resetDailyProgress: async (previousDayTaskStates?: Record<string, DailyTaskState>) => {
        const { userProfile, activeIdentities, dailyTaskStates } = get();
        if (!userProfile) return;

        // Use provided previous day states or current states
        const taskStatesToEvaluate = previousDayTaskStates || dailyTaskStates;

        try {
          // Evaluate each path and update streaks
          const updatedIdentities = activeIdentities.map((identity) => {
            // Check if ALL tasks were completed by comparing completed task count with total task count
            const state = taskStatesToEvaluate[identity.id];
            const completedTaskIds = state ? new Set(state.completedTasks) : new Set<string>();
            const totalTasks = identity.available_tasks?.length || 0;
            const allTasksCompleted = totalTasks > 0 && completedTaskIds.size === totalTasks;
            
            // Simple logic: if all tasks were completed yesterday, KEEP streak as-is (don't increment)
            // If tasks were NOT all completed, reset streak to 0
            // The streak will increment when today's tasks are completed via PathCard
            const newStreak = allTasksCompleted ? identity.current_streak : 0;

            logger.debug('Daily reset: Evaluating streak', {
              identityId: identity.id,
              identityName: identity.template?.name,
              completedTasks: completedTaskIds.size,
              totalTasks,
              allTasksCompleted,
              currentStreak: identity.current_streak,
              newStreak,
              action: allTasksCompleted ? 'KEEP STREAK' : 'RESET TO 0',
            });

            return {
              ...identity,
              completed_today: false, // Reset for new day
              current_streak: newStreak,
            };
          });

          set({ activeIdentities: updatedIdentities });

          // Persist streak changes to database for each identity
          for (const identity of updatedIdentities) {
            try {
              await gameDB.updateIdentity(identity.id, {
                current_streak: identity.current_streak,
                // completed_today is typically not stored in DB, it's derived
              });
            } catch (error) {
              logger.error('Failed to update identity streak', { identityId: identity.id, error });
            }
          }

          logger.info('Daily progress reset completed', { 
            identitiesUpdated: updatedIdentities.length 
          });

          // Clear daily task states to reset task completion tracking
          set({ dailyTaskStates: {} });
        } catch (error) {
          logger.error('Failed to reset daily progress', { error });
          throw error;
        }
      },

      // ========== DAILY TASK STATE (per identity) ==========
      
      getCompletedTasks: (identityId: string) => {
        const today = getTodayDate();
        const state = get().dailyTaskStates[identityId];
        // Return empty set if no state or if state is from a previous day
        if (!state || state.date !== today) {
          return new Set<string>();
        }
        return new Set(state.completedTasks);
      },
      
      getCompletedSubtasks: (identityId: string) => {
        const today = getTodayDate();
        const state = get().dailyTaskStates[identityId];
        // Return empty set if no state or if state is from a previous day
        if (!state || state.date !== today) {
          return new Set<string>();
        }
        return new Set(state.completedSubtasks);
      },
      
      setCompletedTask: (identityId: string, taskId: string, completed: boolean) => {
        const today = getTodayDate();
        const { dailyTaskStates } = get();
        const currentState = dailyTaskStates[identityId];
        
        // If state is from a previous day, start fresh
        const baseState: DailyTaskState = currentState?.date === today 
          ? currentState 
          : { completedTasks: [], completedSubtasks: [], date: today };
        
        const updatedTasks = new Set(baseState.completedTasks);
        if (completed) {
          updatedTasks.add(taskId);
        } else {
          updatedTasks.delete(taskId);
        }
        
        set({
          dailyTaskStates: {
            ...dailyTaskStates,
            [identityId]: {
              ...baseState,
              completedTasks: Array.from(updatedTasks),
            },
          },
        });
      },
      
      setCompletedSubtask: (identityId: string, subtaskId: string, completed: boolean) => {
        const today = getTodayDate();
        const { dailyTaskStates } = get();
        const currentState = dailyTaskStates[identityId];
        
        // If state is from a previous day, start fresh
        const baseState: DailyTaskState = currentState?.date === today 
          ? currentState 
          : { completedTasks: [], completedSubtasks: [], date: today };
        
        const updatedSubtasks = new Set(baseState.completedSubtasks);
        if (completed) {
          updatedSubtasks.add(subtaskId);
        } else {
          updatedSubtasks.delete(subtaskId);
        }
        
        set({
          dailyTaskStates: {
            ...dailyTaskStates,
            [identityId]: {
              ...baseState,
              completedSubtasks: Array.from(updatedSubtasks),
            },
          },
        });
      },
      
      clearDailyTasks: (identityId: string) => {
        const today = getTodayDate();
        const { dailyTaskStates } = get();
        
        set({
          dailyTaskStates: {
            ...dailyTaskStates,
            [identityId]: {
              completedTasks: [],
              completedSubtasks: [],
              date: today,
            },
          },
        });
      },

      // ========== SEALS SYSTEM ==========
      
      loadSealData: async (userId: string) => {
        void userId; // TODO: Use in production to fetch from database
        try {
          const today = getTodayDate();
          const { sealStats: existingStats, todaySealLog: existingLog } = get();
          
          // Check if seals need daily reset
          const needsReset = existingLog ? shouldResetSeals(existingLog.date) : true;
          
          if (needsReset) {
            // Reset today's log for new day
            const freshTodayLog: UserSealLog = {
              date: today,
              activeSealIds: [], // Start fresh each day
              status: 'pending',
            };
            
            set({ 
              todaySealLog: freshTodayLog,
            });
            
            logger.info('Seals reset for new day', { date: today });
          }
          
          // Initialize seal stats if empty (mock data for demo)
          if (existingStats.length === 0) {
            const initialSealStats: UserSealStats[] = SEALS.map(seal => ({
              seal_id: seal.id,
              total_days_active: 0,
              current_streak: 0,
              current_level: 1,
              last_active_date: undefined,
              subpillar_stats: seal.subPillars.map(sp => ({
                subpillar_id: sp.id,
                days_activated: 0,
                current_level: 1,
                current_streak: 0,
                last_activated_date: undefined,
              })),
            }));
            
            set({ sealStats: initialSealStats });
            logger.info('Seal stats initialized');
          }
          
          logger.info('Seal data loaded', { needsReset, date: today });
        } catch (error) {
          logger.error('Failed to load seal data', error);
        }
      },
      
      setActiveSealIds: (sealIds: string[]) => {
        const { userProfile, sealStats } = get();
        const today = getTodayDate();
        
        // Get Will rank for activation limit
        const willRank = userProfile?.rank_tier || 'E';
        const maxActivations = getMaxDailySealActivations(willRank);
        
        // Enforce activation limit
        const limitedSealIds = sealIds.slice(0, maxActivations);
        
        if (sealIds.length > maxActivations) {
          logger.warn('Seal activation limit reached', { 
            attempted: sealIds.length, 
            max: maxActivations,
            willRank 
          });
        }
        
        const updatedLog: UserSealLog = {
          date: today,
          activeSealIds: limitedSealIds,
          status: 'pending',
        };
        
        // Update subpillar stats for newly activated seals
        const updatedStats = sealStats.map(sealStat => {
          const updatedSubpillarStats = sealStat.subpillar_stats.map(spStat => {
            const isActive = limitedSealIds.includes(spStat.subpillar_id);
            const wasActive = spStat.last_activated_date === today;
            
            // Only increment if newly activated today (not already counted)
            if (isActive && !wasActive) {
              const newDaysActivated = spStat.days_activated + 1;
              return {
                ...spStat,
                days_activated: newDaysActivated,
                current_level: getSubPillarLevel(newDaysActivated),
                last_activated_date: today,
                current_streak: spStat.last_activated_date === getYesterday() 
                  ? spStat.current_streak + 1 
                  : 1,
              };
            }
            return spStat;
          });
          
          // Recalculate seal's average level
          const avgLevel = calculateSealAverageLevel(updatedSubpillarStats);
          
          return {
            ...sealStat,
            subpillar_stats: updatedSubpillarStats,
            current_level: avgLevel,
          };
        });
        
        set({ todaySealLog: updatedLog, sealStats: updatedStats });
        logger.info('Active seals updated', { 
          sealIds: limitedSealIds, 
          maxActivations,
          willRank 
        });
      },
      
      completeTodaySeals: () => {
        const { todaySealLog } = get();
        if (!todaySealLog) return;
        
        const completedLog: UserSealLog = {
          ...todaySealLog,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
        
        set({ todaySealLog: completedLog });
        logger.info('Today seals marked complete');
      },
      
      getSealStats: (sealId: string) => {
        const { sealStats } = get();
        return sealStats.find((stat) => stat.seal_id === sealId) || null;
      },

      updateOverallRank: async () => {
        const { userProfile } = get();
        if (!userProfile) throw new Error('No user profile');

        try {
          const updatedProfile = await gameDB.updateOverallRank(userProfile.id);
          set({ userProfile: updatedProfile });
          logger.info('Overall rank updated in store', {
            finalScore: updatedProfile.final_score,
            rankTier: updatedProfile.rank_tier,
          });
        } catch (error) {
          logger.error('Failed to update overall rank', error);
          throw error;
        }
      },

      clearGameData: () => {
        set({
          userProfile: null,
          activeIdentities: [],
          identityTemplates: [],
          taskTemplates: [],
          recentCompletions: [],
          availableItems: [],
          sealLogs: [],
          sealStats: [],
          todaySealLog: null,
          isInitialized: false,
        });
        storage.remove(STORE_KEYS.GAME);
        logger.info('Game data cleared');
      },
    }),
    {
      name: STORE_KEYS.GAME,
      partialize: (state) => ({
        // DO NOT persist userProfile - always fetch fresh from database
        // This ensures stat updates from mockDB are reflected immediately
        identityTemplates: state.identityTemplates,
        taskTemplates: state.taskTemplates,
      }),
    }
  )
);

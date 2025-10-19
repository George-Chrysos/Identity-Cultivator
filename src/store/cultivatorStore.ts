import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  Identity,
  UserProgress,
  IdentityType,
  IdentityTier,
  AnimationEvent,
  CULTIVATOR_DEFINITION,
  BODYSMITH_DEFINITION,
  JOURNALIST_DEFINITION,
  STRATEGIST_DEFINITION,
  DetailedIdentityDefinition,
  TIER_CONFIGS,
} from '@/models/cultivatorTypes';
import { CultivatorDatabase } from '@/api/cultivatorDatabase';
import { supabaseDB } from '@/api/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { TIER_ORDER, getOldTier as getOldTierUtil } from '@/constants/tiers';
import { IDENTITY_LIMITS } from '@/constants/limits';
import { getIdentityHistoryKey, STORE_KEYS } from '@/constants/storage';

const MAX_ACTIVE_IDENTITIES = IDENTITY_LIMITS.MAX_ACTIVE;

// Helper functions
const getBestIdentity = (identities: Identity[]): Identity | null => {
  return identities.reduce((best, current) => {
    if (!best) return current;
    const bestScore = TIER_ORDER[best.tier] * 100 + best.level;
    const currentScore = TIER_ORDER[current.tier] * 100 + current.level;
    return currentScore > bestScore ? current : best;
  }, null as Identity | null);
};

const getOldTier = (currentTier: IdentityTier): IdentityTier => {
  return getOldTierUtil(currentTier);
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const getLocalDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const calculateSortOrderMap = (identities: Identity[]): Record<string, number> => {
  const sorted = identities
    .filter(identity => identity.isActive)
    .sort((a, b) => {
      const tierDiff = TIER_ORDER[b.tier] - TIER_ORDER[a.tier];
      if (tierDiff !== 0) return tierDiff;
      return b.level - a.level;
    });
  
  const sortOrderMap: Record<string, number> = {};
  sorted.forEach((identity, index) => {
    sortOrderMap[identity.identityID] = index;
  });
  
  return sortOrderMap;
};

interface CultivatorState {
  // Current user data
  currentUser: User | null;
  identities: Identity[];
  userProgress: UserProgress[];
  
  // UI state
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  animationEvents: AnimationEvent[];
  progressUpdating: string[]; // identityIDs currently updating
  sortOrderMap: Record<string, number>; // Tracks stable sort order (identityID -> position)
  
  // Actions
  initializeUser: (name: string, userId?: string) => Promise<void>;
  loadUserData: (userID: string) => Promise<void>;
  createNewIdentity: (identityType: IdentityType, customTitle?: string) => Promise<void>;
  toggleTaskCompletion: (identityID: string) => Promise<void>;
  
  // UI actions
  clearAnimationEvent: (eventIndex: number) => void;
  clearError: () => void;
  resetStore: () => void;
  
  // Getters
  getActiveIdentities: () => Identity[];
  getSortedIdentities: () => Identity[];
  getProgressForIdentity: (identityID: string) => UserProgress | null;
  getIdentityTitle: (identity: Identity) => string;
  getIdentityTasks: (identity: Identity) => string[];
  canCompleteTaskToday: (identityID: string) => boolean;
  canReverseTaskToday: (identityID: string) => boolean;
  getHistory: (identityID: string) => { date: string; completed: boolean }[];
  setHistoryEntry: (identityID: string, date: string, completed: boolean) => void;
  // Added for calendar-driven recompute
  historyVersion: number; // increments to force UI re-render when history changes
  recomputeProgressFromHistory: (identityID: string) => void;

  // Testing utilities (non-production)
  testAddDays: (identityID: string, days: number) => void;
  testRemoveDay: (identityID: string) => void;
  testResetProgress: (identityID: string) => void;
}

// Dynamic user ID - will be set based on authenticated user

export const useCultivatorStore = create<CultivatorState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      identities: [],
      userProgress: [],
      isLoading: false,
      isInitialized: false,
      error: null,
      animationEvents: [],
      progressUpdating: [],
      sortOrderMap: {},
      historyVersion: 0,

      // Initialize or load user
      initializeUser: async (name: string, userId?: string) => {
        logger.debug('initializeUser called', { name, userId });
        set({ isLoading: true, isInitialized: false });

        try {
          // Use provided userId or create a default one (deterministic)
          let desiredUserID = userId || `user-${name.toLowerCase().replace(/\s+/g, '-')}`;
          logger.debug('Using userID', { userID: desiredUserID });
          
          // Check if user already exists
          let user = await CultivatorDatabase.getUser(desiredUserID).catch((err) => {
            logger.warn('getUser failed, continuing with null', err);
            return null;
          });
          logger.debug('Existing user found', { found: !!user });
          
          if (!user) {
            logger.info('Creating new user');
            // Create user using CultivatorDatabase which will handle Supabase properly
            user = await CultivatorDatabase.createUser(name, desiredUserID).catch((err) => {
              logger.error('createUser failed', err);
              return null;
            });
            if (!user) {
              // Fallback to a minimal local user to avoid blocking UI
              user = {
                userID: desiredUserID,
                name,
                tier: 'D',
                totalDaysActive: 0,
                createdAt: new Date(),
                lastActiveDate: new Date(),
              } as User;
            }
            
            // Create 4 default identities for new users
            logger.info('Creating 4 default identities for new user');
            const defaultTypes: IdentityType[] = ['CULTIVATOR', 'BODYSMITH', 'JOURNALIST', 'STRATEGIST'];
            for (const identityType of defaultTypes) {
              try {
                await CultivatorDatabase.createIdentity({ userID: desiredUserID, identityType });
              } catch (err) {
                logger.error(`Failed to create identity ${identityType}`, err);
              }
            }
            logger.info('Default identities created');
          }

          logger.debug('Loading user data');
          await get().loadUserData(desiredUserID);
          logger.info('User initialization complete');
          
          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          logger.error('Failed to initialize user', error);
          // Do not block the UI; mark initialized to let user proceed, but show error toast
          set({ isLoading: false, isInitialized: true });
          
          // Show error toast
          const { toast } = await import('@/store/toastStore');
          toast.error(`Failed to initialize user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },

      loadUserData: async (userID: string) => {
        logger.debug('loadUserData called', { userID });
        set({ isLoading: true });

        try {
          // First, cleanup any duplicate identities
          const duplicatesRemoved = await CultivatorDatabase.cleanupDuplicateIdentities(userID);
          if (duplicatesRemoved > 0) {
            logger.info(`Removed ${duplicatesRemoved} duplicate identities`);
          }
          
          let userData = await CultivatorDatabase.getUserData(userID).catch((err) => {
            logger.warn('getUserData failed, using empty dataset', err);
            return null;
          });
          logger.debug('User data retrieved', { 
            hasData: !!userData, 
            identityCount: userData?.identities?.length || 0 
          });
          if (userData) {
            // Migration: ensure all four core identities exist
            const requiredTypes: IdentityType[] = ['CULTIVATOR','BODYSMITH','JOURNALIST','STRATEGIST'];
            const existingTypes = new Set(userData.identities.map(i => i.identityType));
            let created = false;
            for (const t of requiredTypes) {
              if (!existingTypes.has(t)) {
                logger.info(`Creating missing identity type: ${t}`);
                try {
                  await CultivatorDatabase.createIdentity({ userID, identityType: t });
                  created = true;
                } catch (e: any) {
                  // Ignore duplicate error and continue; any other error should be logged but not block
                  const msg = e?.message || String(e);
                  if (msg.includes('Only one of each type')) {
                    logger.warn(`Duplicate identity type detected during migration: ${t}`);
                  } else {
                    logger.error(`Failed creating missing identity type: ${t}`, e);
                  }
                }
              }
            }
            if (created) {
              // reload after creating missing identities
              userData = await CultivatorDatabase.getUserData(userID) as typeof userData;
            }

            // Determine best identity for user tier
            const bestIdentity = getBestIdentity(userData.identities);
            const updatedUser: User = {
              ...userData.user,
              tier: bestIdentity?.tier || 'D',
              lastActiveDate: new Date(),
            };
            await CultivatorDatabase.updateUser(updatedUser);
            logger.info('User data loaded successfully', { 
              identityCount: userData.identities.length 
            });

            set({
              currentUser: updatedUser,
              identities: userData.identities,
              userProgress: userData.progress,
              isLoading: false,
              sortOrderMap: calculateSortOrderMap(userData.identities), // Calculate initial sort order
            });
          } else {
            logger.warn('No user data found');
            // proceed with empty state but not loading
            set({ isLoading: false });
          }
        } catch (error) {
          logger.error('Failed to load user data', error);
          // Do not block the UI. Show toast, but ensure initialized stays true.
          set({ isLoading: false });
          
          // Show error toast
          const { toast } = await import('@/store/toastStore');
          toast.error('Failed to load user data');
        }
      },

      createNewIdentity: async (identityType: IdentityType, customTitle?: string) => {
        const { currentUser } = get();
        if (!currentUser) return;

        // Check if user already has this identity type
        const hasType = get().identities.some(i => i.identityType === identityType);
        if (hasType) {
          const { toast } = await import('@/store/toastStore');
          toast.error(`You already have a ${identityType} identity. Only one of each type is allowed.`);
          return;
        }

        // Enforce max active identities before creation
        const activeCount = get().identities.filter(i => i.isActive).length;
        if (activeCount >= MAX_ACTIVE_IDENTITIES) {
          const { toast } = await import('@/store/toastStore');
          toast.error(`Maximum of ${MAX_ACTIVE_IDENTITIES} active identities reached. Deactivate one to create a new path.`);
          return;
        }

        // Create optimistic placeholder identity
        const optimisticIdentity: Identity = {
          identityID: `temp-${Date.now()}`,
          userID: currentUser.userID,
          title: customTitle || `${identityType} 1`,
          imageUrl: `/images/${identityType.toLowerCase()}-base.png`,
          tier: 'D',
          level: 1,
          daysCompleted: 0,
          requiredDaysPerLevel: 10,
          isActive: true,
          createdAt: new Date(),
          identityType,
        };

        // OPTIMISTIC UPDATE: Add immediately to UI
        set((state) => ({
          identities: [...state.identities, optimisticIdentity],
          isLoading: true,
        }));

        try {
          const newIdentity = await CultivatorDatabase.createIdentity({
            userID: currentUser.userID,
            identityType,
            customTitle,
          });

          // Replace optimistic identity with real one
          set((state) => ({
            identities: state.identities.map(i => 
              i.identityID === optimisticIdentity.identityID ? newIdentity : i
            ),
            isLoading: false,
          }));

          // Reload to get updated progress
          await get().loadUserData(currentUser.userID);
          
          // Show success toast
          const { toast } = await import('@/store/toastStore');
          toast.success(`${identityType} identity created successfully!`);
        } catch (error) {
          logger.error('Failed to create identity', error);
          
          // ROLLBACK: Remove optimistic identity
          set((state) => ({
            identities: state.identities.filter(i => i.identityID !== optimisticIdentity.identityID),
            isLoading: false,
          }));
          
          // Show error toast
          const { toast } = await import('@/store/toastStore');
          toast.error(error instanceof Error ? error.message : 'Failed to create new identity');
        }
      },

      toggleTaskCompletion: async (identityID: string) => {
        const { currentUser, identities } = get();
        if (!currentUser) return;

        // Concurrency guard: if this identity is already updating, ignore
        if (get().progressUpdating.includes(identityID)) {
          return;
        }

        const progress = get().getProgressForIdentity(identityID);
        const identity = identities.find(i => i.identityID === identityID);
        if (!progress || !identity) return;

        // Capture original state for rollback
        const originalProgress = { ...progress };
        const originalIdentity = { ...identity };
        const action = progress.completedToday ? 'REVERSE' : 'COMPLETE';

        // OPTIMISTIC UPDATE: Update UI immediately
        const today = new Date();
        const todayISO = getLocalDateKey(today);
        const optimisticProgress = {
          ...progress,
          completedToday: action === 'COMPLETE',
          lastUpdatedDate: today,
        };

        // Update state optimistically
        set((state) => ({
          userProgress: state.userProgress.map(p => 
            p.identityID === identityID ? optimisticProgress : p
          ),
          progressUpdating: [...state.progressUpdating, identityID],
        }));

        // Update local history optimistically
        const historyKey = getIdentityHistoryKey(identityID);
        const existingRaw = localStorage.getItem(historyKey);
        const history = existingRaw ? JSON.parse(existingRaw) : [];
        const idx = history.findIndex((h: any) => h.date === todayISO);
        if (idx >= 0) {
          history[idx].completed = action === 'COMPLETE';
        } else {
          history.push({ date: todayISO, completed: action === 'COMPLETE' });
        }
        localStorage.setItem(historyKey, JSON.stringify(history));
        set(state => ({ historyVersion: state.historyVersion + 1 }));

        try {
          // Make the actual database call
          const result = await CultivatorDatabase.updateProgress({
            userID: currentUser.userID,
            identityID,
            action,
          });

          if (result.success) {
            const events: AnimationEvent[] = [];
            if (result.leveledUp) {
              events.push({
                type: 'LEVEL_UP',
                identityID,
                oldLevel: Math.max(1, result.identity!.level - 1),
                newLevel: result.identity!.level,
                message: `Level up to ${result.identity!.level}!`,
              });
            }
            if (result.evolved) {
              events.push({
                type: 'EVOLUTION',
                identityID,
                oldTier: getOldTier(result.identity!.tier),
                newTier: result.identity!.tier,
                message: `Evolved to ${result.identity!.tier} tier!`,
              });
            }

            // Update with actual server data
            set((state) => ({
              identities: state.identities.map(i => i.identityID === result.identity!.identityID ? result.identity! : i),
              userProgress: state.userProgress.map(p => p.identityID === result.progress!.identityID ? result.progress! : p),
              animationEvents: [...state.animationEvents, ...events],
              progressUpdating: state.progressUpdating.filter(id => id !== identityID),
            }));

            // Recompute streak/day grid from local history for consistency in LOCAL mode
            try {
              if (!isSupabaseConfigured()) {
                get().recomputeProgressFromHistory(identityID);
              }
            } catch {}
          } else {
            // ROLLBACK on failure
            set((state) => ({
              identities: state.identities.map(i => i.identityID === identityID ? originalIdentity : i),
              userProgress: state.userProgress.map(p => p.identityID === identityID ? originalProgress : p),
              progressUpdating: state.progressUpdating.filter(id => id !== identityID),
            }));
            
            // Restore history
            const historyKey = getIdentityHistoryKey(identityID);
            const revertedHistory = existingRaw ? JSON.parse(existingRaw) : [];
            localStorage.setItem(historyKey, JSON.stringify(revertedHistory));
            set(state => ({ historyVersion: state.historyVersion + 1 }));
            
            // Show error toast
            const { toast } = await import('@/store/toastStore');
            toast.error(result.message || 'Failed to update task');
          }
        } catch (error) {
          logger.error('Failed to update progress', error);
          
          // ROLLBACK on error
          set((state) => ({
            identities: state.identities.map(i => i.identityID === identityID ? originalIdentity : i),
            userProgress: state.userProgress.map(p => p.identityID === identityID ? originalProgress : p),
            progressUpdating: state.progressUpdating.filter(id => id !== identityID),
          }));
          
          // Restore history
          const historyKey = getIdentityHistoryKey(identityID);
          const revertedHistory = existingRaw ? JSON.parse(existingRaw) : [];
          localStorage.setItem(historyKey, JSON.stringify(revertedHistory));
          set(state => ({ historyVersion: state.historyVersion + 1 }));
          
          // Show error toast
          const { toast } = await import('@/store/toastStore');
          toast.error('Failed to update task progress');
        }
      },

      clearAnimationEvent: (eventIndex: number) => {
        set((state) => ({
          animationEvents: state.animationEvents.filter((_, index) => index !== eventIndex),
        }));
      },

      clearError: () => {
        set({ error: null });
      },

      getActiveIdentities: () => {
        return get().identities.filter(identity => identity.isActive).slice(0, MAX_ACTIVE_IDENTITIES);
      },

      getSortedIdentities: () => {
        const { identities, sortOrderMap } = get();
        
        // If we have a sort order map, use it for stable sorting
        if (Object.keys(sortOrderMap).length > 0) {
          return identities
            .filter(identity => identity.isActive)
            .sort((a, b) => {
              const orderA = sortOrderMap[a.identityID] ?? 999;
              const orderB = sortOrderMap[b.identityID] ?? 999;
              return orderA - orderB;
            })
            .slice(0, MAX_ACTIVE_IDENTITIES);
        }
        
        // Fallback: sort by tier and level (but don't save to avoid infinite loop)
        const tierOrder: Record<IdentityTier, number> = { 
          'SSS': 13, 'SS+': 12, 'SS': 11, 'S+': 10, 'S': 9, 
          'A+': 8, 'A': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D+': 2, 'D': 1 
        };
        return identities
          .filter(identity => identity.isActive)
          .sort((a, b) => {
            const tierDiff = tierOrder[b.tier] - tierOrder[a.tier];
            if (tierDiff !== 0) return tierDiff;
            return b.level - a.level;
          })
          .slice(0, MAX_ACTIVE_IDENTITIES);
      },

      getProgressForIdentity: (identityID: string) => {
        return get().userProgress.find(p => p.identityID === identityID) || null;
      },

      getIdentityTitle: (identity: Identity) => {
        // Get the appropriate detailed definition based on identity type
        let definition: DetailedIdentityDefinition;
        switch (identity.identityType) {
          case 'CULTIVATOR':
            definition = CULTIVATOR_DEFINITION;
            break;
          case 'BODYSMITH':
            definition = BODYSMITH_DEFINITION;
            break;
          case 'JOURNALIST':
            definition = JOURNALIST_DEFINITION;
            break;
          case 'STRATEGIST':
            definition = STRATEGIST_DEFINITION;
            break;
          case 'PATHWEAVER': // legacy alias
            definition = STRATEGIST_DEFINITION;
            break;
          default:
            return identity.title; // Fallback to stored title
        }
        
        // Find the tier detail
        const tierDetail = definition.tiers.find(t => t.tier === identity.tier);
        if (!tierDetail) return identity.title;
        
        // Return tier title + level (e.g., "Seed Initiate 3")
        return `${tierDetail.title} ${identity.level}`;
      },

      getIdentityTasks: (identity: Identity) => {
        // Get the appropriate detailed definition based on identity type
        let definition: DetailedIdentityDefinition;
        switch (identity.identityType) {
          case 'CULTIVATOR':
            definition = CULTIVATOR_DEFINITION;
            break;
          case 'BODYSMITH':
            definition = BODYSMITH_DEFINITION;
            break;
          case 'JOURNALIST':
            definition = JOURNALIST_DEFINITION;
            break;
          case 'STRATEGIST':
            definition = STRATEGIST_DEFINITION;
            break;
          case 'PATHWEAVER': // legacy alias
            definition = STRATEGIST_DEFINITION;
            break;
          default:
            return []; // Unknown type, no tasks
        }
        
        // Find the tier detail
        const tierDetail = definition.tiers.find(t => t.tier === identity.tier);
        if (!tierDetail) return []; // No tier detail, no tasks
        
        // Find the sublevel for the current level
        const subLevel = tierDetail.subLevels[identity.level - 1];
        if (!subLevel) return []; // No sublevel, no tasks
        
        // Return the tasks for the current tier and level
        return subLevel.tasks || [];
      },

      canCompleteTaskToday: (identityID: string) => {
        const progress = get().getProgressForIdentity(identityID);
        if (!progress) return false;
        const today = new Date();
        const lastUpdate = new Date(progress.lastUpdatedDate);
        const doneToday = isSameDay(today, lastUpdate) && progress.completedToday;
        return !doneToday;
      },

      canReverseTaskToday: (identityID: string) => {
        const progress = get().getProgressForIdentity(identityID);
        if (!progress) return false;
        const today = new Date();
        const lastUpdate = new Date(progress.lastUpdatedDate);
        const isToday = isSameDay(today, lastUpdate);
        return progress.completedToday && isToday;
      },

      getHistory: (identityID: string) => {
        if (isSupabaseConfigured()) {
          // For Supabase, we'll rely on the calendar component to fetch
          // For now, return empty and let it fetch async
          // This is a temporary solution - ideally we'd cache this
          return [];
        }
        
        const historyKey = getIdentityHistoryKey(identityID);
        const raw = localStorage.getItem(historyKey);
        if (!raw) return [];
        try { return JSON.parse(raw); } catch { return []; }
      },

      setHistoryEntry: (identityID: string, date: string, completed: boolean) => {
        const { currentUser } = get();
        
        if (isSupabaseConfigured() && currentUser) {
          // Capture old state before update
          const oldIdentity = get().identities.find(i => i.identityID === identityID);
          const oldProgress = get().userProgress.find(p => p.identityID === identityID);
          const oldSortOrderMap = { ...get().sortOrderMap };
          
          if (!oldProgress) return;
          
          // OPTIMISTIC UPDATE: Update completedToday if it's today's date
          const todayISO = getLocalDateKey(new Date());
          const isToday = date === todayISO;
          
          if (isToday) {
            // Calculate optimistic daysCompleted
            let optimisticDaysCompleted = oldProgress.daysCompleted;
            if (completed) {
              // Completing today - increment if not already done
              if (!oldProgress.completedToday) {
                optimisticDaysCompleted = oldProgress.daysCompleted + 1;
              }
            } else {
              // Uncompleting today - decrement if it was done
              if (oldProgress.completedToday) {
                optimisticDaysCompleted = Math.max(0, oldProgress.daysCompleted - 1);
              }
            }
            
            const optimisticProgress = {
              ...oldProgress,
              completedToday: completed,
              daysCompleted: optimisticDaysCompleted,
              lastUpdatedDate: new Date(),
            };
            
            set(state => ({
              userProgress: state.userProgress.map(p =>
                p.identityID === identityID ? optimisticProgress : p
              ),
              historyVersion: state.historyVersion + 1,
            }));
          } else {
            // Just update history version for non-today dates
            set(state => ({ historyVersion: state.historyVersion + 1 }));
          }
          
          // Use Supabase for history management
          supabaseDB.setDateCompletion(currentUser.userID, identityID, date, completed)
            .then(() => {
              // Reload identity and progress after recalculation
              return supabaseDB.fetchUserIdentities(currentUser.userID);
            })
            .then(({ identities, progress }) => {
              // Find the updated identity and progress
              const newIdentity = identities.find(i => i.identityID === identityID);
              const newProgress = progress.find(p => p.identityID === identityID);

              // Detect level-up or evolution
              const events: AnimationEvent[] = [];
              if (oldIdentity && newIdentity && oldProgress && newProgress) {
                const tierChanged = oldIdentity.tier !== newIdentity.tier;
                const levelIncreased = newProgress.level > oldProgress.level;

                if (tierChanged) {
                  events.push({
                    type: 'EVOLUTION',
                    identityID,
                    oldTier: oldIdentity.tier,
                    newTier: newIdentity.tier,
                    message: `Evolved to ${newIdentity.tier} tier!`,
                  });
                }
                if (levelIncreased) {
                  events.push({
                    type: 'LEVEL_UP',
                    identityID,
                    oldLevel: oldProgress.level,
                    newLevel: newProgress.level,
                    message: `Level up to ${newProgress.level}!`,
                  });
                }
              }

              // PRESERVE SORT ORDER: Recalculate only if level/tier changed
              let newSortOrderMap = oldSortOrderMap;
              if (events.length > 0) {
                newSortOrderMap = calculateSortOrderMap(identities);
              }

              // Merge only the affected identity/progress to avoid list reorder flicker
              set(state => ({
                identities: state.identities.map(i => i.identityID === identityID && newIdentity ? newIdentity : i),
                userProgress: state.userProgress.map(p => p.identityID === identityID && newProgress ? newProgress : p),
                historyVersion: state.historyVersion + 1,
                animationEvents: [...state.animationEvents, ...events],
                sortOrderMap: newSortOrderMap,
              }));
            })
            .catch(async err => {
              logger.error('Failed to set history entry', err);
              
              // ROLLBACK: Restore original state
              if (isToday && oldProgress) {
                set(state => ({
                  userProgress: state.userProgress.map(p =>
                    p.identityID === identityID ? oldProgress : p
                  ),
                  historyVersion: state.historyVersion + 1,
                }));
              } else {
                set(state => ({ historyVersion: state.historyVersion + 1 }));
              }
              
              // Show error toast
              const { toast } = await import('@/store/toastStore');
              toast.error('Failed to update calendar entry');
            });
          return;
        }

        // Local mode fallback
        const historyKey = getIdentityHistoryKey(identityID);
        const raw = localStorage.getItem(historyKey);
        const oldHistory = raw ? (()=>{try{return JSON.parse(raw);}catch{return[]}})() : [];
        const oldProgress = get().userProgress.find(p => p.identityID === identityID);
        const oldIdentity = get().identities.find(i => i.identityID === identityID);
        const oldSortOrderMap = { ...get().sortOrderMap };
        
        const history = [...oldHistory];
        const idx = history.findIndex((h: any)=>h.date===date);
        
        if (idx>=0) {
          history[idx].completed = completed;
        } else {
          history.push({ date, completed });
        }
        
        // OPTIMISTIC UPDATE: Apply immediately to localStorage and state
        localStorage.setItem(historyKey, JSON.stringify(history));
        
        // If it's today, optimistically update completedToday and daysCompleted
        const todayISO = getLocalDateKey(new Date());
        const isToday = date === todayISO;
        
        if (isToday && oldProgress) {
          // Calculate optimistic daysCompleted
          let optimisticDaysCompleted = oldProgress.daysCompleted;
          if (completed) {
            // Completing today - increment if not already done
            if (!oldProgress.completedToday) {
              optimisticDaysCompleted = oldProgress.daysCompleted + 1;
            }
          } else {
            // Uncompleting today - decrement if it was done
            if (oldProgress.completedToday) {
              optimisticDaysCompleted = Math.max(0, oldProgress.daysCompleted - 1);
            }
          }
          
          const optimisticProgress = {
            ...oldProgress,
            completedToday: completed,
            daysCompleted: optimisticDaysCompleted,
            lastUpdatedDate: new Date(),
          };
          
          set(state => ({
            userProgress: state.userProgress.map(p =>
              p.identityID === identityID ? optimisticProgress : p
            ),
            historyVersion: state.historyVersion + 1,
          }));
        }
        
        try {
          // Recompute progress from history (this updates level/tier/daysCompleted)
          get().recomputeProgressFromHistory(identityID);
          
          // Preserve sort order unless there was a level-up/evolution
          const newIdentity = get().identities.find(i => i.identityID === identityID);
          
          // Check if level or tier changed (indicates level-up/evolution)
          const levelChanged = oldIdentity && newIdentity && oldIdentity.level !== newIdentity.level;
          const tierChanged = oldIdentity && newIdentity && oldIdentity.tier !== newIdentity.tier;
          
          if (levelChanged || tierChanged) {
            // Recalculate sort order on level-up/evolution
            const newSortOrderMap = calculateSortOrderMap(get().identities);
            set(state => ({ 
              sortOrderMap: newSortOrderMap,
              historyVersion: state.historyVersion + 1,
            }));
          } else {
            // Preserve existing sort order
            set(state => ({ 
              sortOrderMap: oldSortOrderMap,
              historyVersion: state.historyVersion + 1,
            }));
          }
        } catch (error) {
          logger.error('Failed to recompute progress', error);
          
          // ROLLBACK: Restore old history and state
          localStorage.setItem(historyKey, JSON.stringify(oldHistory));
          
          if (isToday && oldProgress) {
            set(state => ({
              userProgress: state.userProgress.map(p =>
                p.identityID === identityID ? oldProgress : p
              ),
              historyVersion: state.historyVersion + 1,
              sortOrderMap: oldSortOrderMap,
            }));
          } else {
            set(state => ({ 
              historyVersion: state.historyVersion + 1,
              sortOrderMap: oldSortOrderMap,
            }));
          }
          
          // Show error toast
          (async () => {
            const { toast } = await import('@/store/toastStore');
            toast.error('Failed to update calendar entry');
          })();
        }
      },

      recomputeProgressFromHistory: (identityID: string) => {
        const { identities, userProgress, currentUser } = get();
        const identity = identities.find(i => i.identityID === identityID);
        const progress = userProgress.find(p => p.identityID === identityID);
        if (!identity || !progress) return;

        const historyKey = getIdentityHistoryKey(identityID);
        const historyRaw = localStorage.getItem(historyKey);
        const history: { date: string; completed: boolean }[] = historyRaw ? (()=>{try{return JSON.parse(historyRaw);}catch{return[]}})() : [];
        const totalCompleted = history.filter(h => h.completed).length;

        // Calculate streak: consecutive days from today backwards
        const today = new Date();
        let streakDays = 0;
        let checkDate = new Date(today);
        
        while (true) {
          const dateKey = getLocalDateKey(checkDate);
          const entry = history.find(h => h.date === dateKey);
          
          if (entry && entry.completed) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1); // Go back one day
          } else {
            break; // Streak is broken
          }
        }

  // Derive tier/level from total completed days (13-tier system)
  const tierOrder: IdentityTier[] = ['D','D+','C','C+','B','B+','A','A+','S','S+','SS','SS+','SSS'];
        let tier: IdentityTier = 'D';
        let level = 1;
        let remaining = totalCompleted; // remaining days to distribute
        let required = TIER_CONFIGS[tier].requiredDaysPerLevel;

        while (remaining >= required) {
          remaining -= required;
          level += 1;
          if (level > 10) {
            if (tier !== 'S') {
              const nextIndex: number = tierOrder.indexOf(tier) + 1;
              tier = tierOrder[Math.min(nextIndex, tierOrder.length - 1)];
              required = TIER_CONFIGS[tier].requiredDaysPerLevel;
              level = 1;
            } else {
              // Cap at S10 (stop further progression)
              level = 10;
              remaining = 0;
              break;
            }
          }
        }

        // Update identity & progress objects
        identity.tier = tier;
        identity.level = level;
        identity.daysCompleted = remaining; // days accumulated towards next level
        identity.requiredDaysPerLevel = TIER_CONFIGS[tier].requiredDaysPerLevel;

        progress.tier = tier;
        progress.level = level;
        progress.daysCompleted = remaining;
        progress.streakDays = streakDays; // Update streak
        const todayISO = getLocalDateKey(new Date());
        progress.completedToday = !!history.find(h => h.date === todayISO && h.completed);
        progress.lastUpdatedDate = new Date();

        // Update user tier (best identity) after recompute
        const bestIdentity = getBestIdentity(identities);
        const updatedUser = currentUser && bestIdentity ? { ...currentUser, tier: bestIdentity.tier as IdentityTier } : currentUser || null;

        // Persist minimal updates
        CultivatorDatabase.updateIdentity(identity);
        CultivatorDatabase.updateUserProgress(progress);
        if (updatedUser) {
          // Avoid hammering remote DB; this path is derived from local calendar tweaks.
          // Best-effort; ignore failure.
          try { CultivatorDatabase.updateUser(updatedUser); } catch (e) { /* non-blocking */ }
        }

        set(state => ({
          identities: state.identities.map(i => i.identityID === identity.identityID ? { ...identity } : i),
          userProgress: state.userProgress.map(p => p.identityID === progress.identityID ? { ...progress } : p),
          currentUser: updatedUser,
        }));
      },

      // ---- Testing Utilities (not for production) ----
      testAddDays: (identityID: string, days: number) => {
        const { identities, userProgress, currentUser } = get();
        if (!currentUser) return;
        const identity = identities.find(i => i.identityID === identityID);
        const progress = userProgress.find(p => p.identityID === identityID);
        if (!identity || !progress || days <= 0) return;

        let remaining = days;
        let leveledUp = false;
        let evolved = false;
        while (remaining > 0) {
          progress.daysCompleted += 1;
          identity.daysCompleted = progress.daysCompleted;
          if (progress.daysCompleted >= identity.requiredDaysPerLevel) {
            // Level up
            progress.daysCompleted = progress.daysCompleted - identity.requiredDaysPerLevel;
            identity.daysCompleted = progress.daysCompleted;
            identity.level += 1;
            progress.level = identity.level;
            leveledUp = true;
            if (identity.level > 10) {
              // Evolution
              identity.level = 1;
              progress.level = 1;
              switch (identity.tier) {
                case 'D': identity.tier = 'C'; break;
                case 'C': identity.tier = 'B'; break;
                case 'B': identity.tier = 'A'; break;
                case 'A': identity.tier = 'S'; break;
                case 'S': identity.tier = 'S'; break;
              }
              progress.tier = identity.tier;
              identity.requiredDaysPerLevel = TIER_CONFIGS[identity.tier].requiredDaysPerLevel;
              evolved = true;
            }
          }
          remaining--;
        }

        // Update user tier if needed
        const bestIdentity = getBestIdentity(identities);
        const updatedUser = bestIdentity ? { ...currentUser, tier: bestIdentity.tier as IdentityTier } : currentUser;

        const events: AnimationEvent[] = [];
        if (leveledUp) {
          events.push({
            type: 'LEVEL_UP',
            identityID,
            oldLevel: identity.level - 1 < 1 ? (identity.tier === 'D' ? 1 : 10) : identity.level - 1,
            newLevel: identity.level,
            message: `Level up to ${identity.level}!`,
          });
        }
        if (evolved) {
          events.push({
            type: 'EVOLUTION',
            identityID,
            oldTier: getOldTier(identity.tier),
            newTier: identity.tier,
            message: `Evolved to ${identity.tier} tier!`,
          });
        }

        // Persist minimal changes via database (fire and forget)
        CultivatorDatabase.updateIdentity(identity);
        const progCopy: UserProgress = { ...progress, tier: identity.tier, level: identity.level, daysCompleted: identity.daysCompleted };
        CultivatorDatabase.updateUserProgress(progCopy);
        CultivatorDatabase.updateUser(updatedUser);

        set(state => ({
          identities: state.identities.map(i => i.identityID === identity.identityID ? { ...identity } : i),
          userProgress: state.userProgress.map(p => p.identityID === identity.identityID ? { ...progCopy } : p),
          currentUser: updatedUser,
          animationEvents: [...state.animationEvents, ...events],
        }));
      },

      testRemoveDay: (identityID: string) => {
        const { identities, userProgress, currentUser } = get();
        if (!currentUser) return;
        const identity = identities.find(i => i.identityID === identityID);
        const progress = userProgress.find(p => p.identityID === identityID);
        if (!identity || !progress) return;

        if (progress.daysCompleted > 0) {
            progress.daysCompleted -= 1;
            identity.daysCompleted = progress.daysCompleted;
        } else if (identity.level > 1) {
            identity.level -= 1;
            progress.level = identity.level;
            // Set daysCompleted to near completion of previous level for visual effect
            const req = identity.requiredDaysPerLevel;
            progress.daysCompleted = Math.max(0, req - 1);
            identity.daysCompleted = progress.daysCompleted;
        } else if (identity.tier !== 'D') {
            // Demote tier
            switch (identity.tier) {
              case 'C': identity.tier = 'D'; break;
              case 'B': identity.tier = 'C'; break;
              case 'A': identity.tier = 'B'; break;
              case 'S': identity.tier = 'A'; break;
            }
            identity.requiredDaysPerLevel = TIER_CONFIGS[identity.tier].requiredDaysPerLevel;
            identity.level = 10; // show near end of previous tier
            progress.level = identity.level;
            progress.tier = identity.tier;
            progress.daysCompleted = identity.requiredDaysPerLevel - 1;
            identity.daysCompleted = progress.daysCompleted;
        }

        // Update best tier
        const bestIdentity = getBestIdentity(identities);
        const updatedUser = bestIdentity ? { ...currentUser, tier: bestIdentity.tier as IdentityTier } : currentUser;
        CultivatorDatabase.updateIdentity(identity);
        CultivatorDatabase.updateUserProgress(progress);
        CultivatorDatabase.updateUser(updatedUser);

        set(state => ({
          identities: state.identities.map(i => i.identityID === identity.identityID ? { ...identity } : i),
          userProgress: state.userProgress.map(p => p.identityID === identity.identityID ? { ...progress } : p),
          currentUser: updatedUser,
        }));
      },

      testResetProgress: (identityID: string) => {
        const { identities, userProgress, currentUser } = get();
        if (!currentUser) return;
        const identity = identities.find(i => i.identityID === identityID);
        const progress = userProgress.find(p => p.identityID === identityID);
        if (!identity || !progress) return;

        identity.tier = 'D';
        identity.level = 1;
        identity.daysCompleted = 0;
        identity.requiredDaysPerLevel = TIER_CONFIGS['D'].requiredDaysPerLevel;
        progress.tier = 'D';
        progress.level = 1;
        progress.daysCompleted = 0;
        progress.completedToday = false;

        const updatedUser = { ...currentUser, tier: 'D' as IdentityTier };
        CultivatorDatabase.updateIdentity(identity);
        CultivatorDatabase.updateUserProgress(progress);
        CultivatorDatabase.updateUser(updatedUser);

        set(state => ({
          identities: state.identities.map(i => i.identityID === identity.identityID ? { ...identity } : i),
          userProgress: state.userProgress.map(p => p.identityID === identity.identityID ? { ...progress } : p),
          currentUser: updatedUser,
        }));
      },
      // ---- End Testing Utilities ----

      resetStore: () => {
        logger.debug('Resetting cultivator store');
        set({
          currentUser: null,
          identities: [],
          userProgress: [],
          isLoading: false,
          isInitialized: false,
          error: null,
          animationEvents: [],
          progressUpdating: [],
          historyVersion: 0,
        });
      },

    }),
    {
      name: STORE_KEYS.CULTIVATOR,
      partialize: (state) => ({
        currentUser: state.currentUser,
        identities: state.identities,
        userProgress: state.userProgress,
        // historyVersion intentionally not persisted
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.currentUser) {
          queueMicrotask(() => {
            const api = useCultivatorStore.getState();
            if (!api.isInitialized) {
              useCultivatorStore.setState({ isInitialized: true });
            }
          });
        }
      }
    }
  )
);

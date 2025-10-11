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
  PATHWEAVER_DEFINITION,
  DetailedIdentityDefinition,
  TIER_CONFIGS,
} from '@/models/cultivatorTypes';
import { CultivatorDatabase } from '@/api/cultivatorDatabase';

const MAX_ACTIVE_IDENTITIES = 5;

// Helper functions
const getBestIdentity = (identities: Identity[]): Identity | null => {
  const tierOrder: Record<IdentityTier, number> = { 
    'SSS': 13, 'SS+': 12, 'SS': 11, 'S+': 10, 'S': 9, 
    'A+': 8, 'A': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D+': 2, 'D': 1 
  };
  return identities.reduce((best, current) => {
    if (!best) return current;
    const bestScore = tierOrder[best.tier] * 100 + best.level;
    const currentScore = tierOrder[current.tier] * 100 + current.level;
    return currentScore > bestScore ? current : best;
  }, null as Identity | null);
};

const getOldTier = (currentTier: IdentityTier): IdentityTier => {
  switch (currentTier) {
    case 'C': return 'D';
    case 'B': return 'C';
    case 'A': return 'B';
    case 'S': return 'A';
    default: return 'D';
  }
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const getLocalDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

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
      historyVersion: 0,

      // Initialize or load user
      initializeUser: async (name: string, userId?: string) => {
        console.log('🔄 initializeUser called with:', { name, userId });
        set({ isLoading: true, error: null, isInitialized: false });

        try {
          // Use provided userId or create a default one (deterministic)
          let desiredUserID = userId || `user-${name.toLowerCase().replace(/\s+/g, '-')}`;
          console.log('📝 Using userID:', desiredUserID);
          
          // Check if user already exists
          let user = await CultivatorDatabase.getUser(desiredUserID).catch((err) => {
            console.warn('getUser failed, continuing with null:', err);
            return null;
          });
          console.log('👤 Existing user found:', !!user);
          
          if (!user) {
            console.log('🆕 Creating new user...');
            // Create user using CultivatorDatabase which will handle Supabase properly
            user = await CultivatorDatabase.createUser(name, desiredUserID).catch((err) => {
              console.error('createUser failed:', err);
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
            
            // Create 3 default identities for new users
            console.log('✨ Creating 3 default identities for new user...');
            const defaultTypes: IdentityType[] = ['CULTIVATOR', 'BODYSMITH', 'PATHWEAVER'];
            for (const identityType of defaultTypes) {
              try {
                await CultivatorDatabase.createIdentity({ userID: desiredUserID, identityType });
              } catch (err) {
                console.error('Failed to create identity', identityType, err);
              }
            }
            console.log('✅ Default identities created');
          }

          console.log('📖 Loading user data...');
          await get().loadUserData(desiredUserID);
          console.log('✅ User initialization complete');
          
          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          console.error('❌ Failed to initialize user:', error);
          // Do not block the UI; mark initialized to let user proceed, but surface error
          set({ error: `Failed to initialize user: ${error}`, isLoading: false, isInitialized: true });
        }
      },

      loadUserData: async (userID: string) => {
        console.log('📖 loadUserData called for userID:', userID);
        set({ isLoading: true, error: null });

        try {
          // First, cleanup any duplicate identities
          const duplicatesRemoved = await CultivatorDatabase.cleanupDuplicateIdentities(userID);
          if (duplicatesRemoved > 0) {
            console.log(`🧹 Removed ${duplicatesRemoved} duplicate identities`);
          }
          
          let userData = await CultivatorDatabase.getUserData(userID).catch((err) => {
            console.warn('getUserData failed, using empty dataset:', err);
            return null;
          });
          console.log('📊 User data retrieved:', !!userData, userData?.identities?.length || 0, 'identities');
          if (userData) {
            // Migration: ensure all three core identities exist
            const requiredTypes: IdentityType[] = ['CULTIVATOR','BODYSMITH','PATHWEAVER'];
            const existingTypes = new Set(userData.identities.map(i => i.identityType));
            let created = false;
            for (const t of requiredTypes) {
              if (!existingTypes.has(t)) {
                console.log(`✨ Creating missing identity type: ${t}`);
                await CultivatorDatabase.createIdentity({ userID, identityType: t });
                created = true;
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
            console.log('✅ User data loaded successfully with', userData.identities.length, 'identities');

            set({
              currentUser: updatedUser,
              identities: userData.identities,
              userProgress: userData.progress,
              isLoading: false,
            });
          } else {
            console.log('⚠️ No user data found');
            // proceed with empty state but not loading
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('❌ Failed to load user data:', error);
          set({ error: 'Failed to load user data', isLoading: false });
        }
      },

      createNewIdentity: async (identityType: IdentityType, customTitle?: string) => {
        const { currentUser } = get();
        if (!currentUser) return;

        // Check if user already has this identity type
        const hasType = get().identities.some(i => i.identityType === identityType);
        if (hasType) {
          set({ error: `You already have a ${identityType} identity. Only one of each type is allowed.` });
          return;
        }

        // Enforce max active identities before creation
        const activeCount = get().identities.filter(i => i.isActive).length;
        if (activeCount >= MAX_ACTIVE_IDENTITIES) {
          set({ error: `Maximum of ${MAX_ACTIVE_IDENTITIES} active identities reached. Deactivate one to create a new path.` });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const newIdentity = await CultivatorDatabase.createIdentity({
            userID: currentUser.userID,
            identityType,
            customTitle,
          });

          set((state) => ({
            identities: [...state.identities, newIdentity],
            isLoading: false,
          }));

          // Reload to get updated progress
          await get().loadUserData(currentUser.userID);
        } catch (error) {
          console.error('Failed to create identity:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create new identity', 
            isLoading: false 
          });
        }
      },

      toggleTaskCompletion: async (identityID: string) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const progress = get().getProgressForIdentity(identityID);
        if (!progress) return;

        // Add to updating list (no global isLoading to prevent page re-render)
        set((state) => ({ progressUpdating: [...state.progressUpdating, identityID], error: null }));

        try {
          const action = progress.completedToday ? 'REVERSE' : 'COMPLETE';
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
                oldLevel: result.identity!.level - 1,
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

            // Update identity & progress locally without full reload
            set((state) => ({
              identities: state.identities.map(i => i.identityID === result.identity!.identityID ? result.identity! : i),
              userProgress: state.userProgress.map(p => p.identityID === result.progress!.identityID ? result.progress! : p),
              animationEvents: [...state.animationEvents, ...events],
              progressUpdating: state.progressUpdating.filter(id => id !== identityID),
            }));
            // Record history for today (local date key)
            const today = new Date();
            const todayISO = getLocalDateKey(today);
            const existingRaw = localStorage.getItem(`identity-history-${identityID}`);
            const history = existingRaw ? JSON.parse(existingRaw) : [];
            const idx = history.findIndex((h: any) => h.date === todayISO);
            if (idx >= 0) history[idx].completed = result.progress!.completedToday; else history.push({ date: todayISO, completed: result.progress!.completedToday });
            localStorage.setItem(`identity-history-${identityID}`, JSON.stringify(history));
            set(state => ({ historyVersion: state.historyVersion + 1 }));
          } else {
            set((state) => ({
              error: result.message,
              progressUpdating: state.progressUpdating.filter(id => id !== identityID),
            }));
          }
        } catch (error) {
          console.error('Failed to update progress:', error);
          set((state) => ({
            error: 'Failed to update task progress',
            progressUpdating: state.progressUpdating.filter(id => id !== identityID),
          }));
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
        const tierOrder: Record<IdentityTier, number> = { 
          'SSS': 13, 'SS+': 12, 'SS': 11, 'S+': 10, 'S': 9, 
          'A+': 8, 'A': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D+': 2, 'D': 1 
        };
        return get().identities
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
          case 'PATHWEAVER':
            definition = PATHWEAVER_DEFINITION;
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
          case 'PATHWEAVER':
            definition = PATHWEAVER_DEFINITION;
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
        return progress ? !progress.completedToday : false;
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
        const raw = localStorage.getItem(`identity-history-${identityID}`);
        if (!raw) return [];
        try { return JSON.parse(raw); } catch { return []; }
      },

      setHistoryEntry: (identityID: string, date: string, completed: boolean) => {
        const raw = localStorage.getItem(`identity-history-${identityID}`);
        const history = raw ? (()=>{try{return JSON.parse(raw);}catch{return[]}})() : [];
        const idx = history.findIndex((h: any)=>h.date===date);
        if (idx>=0) {
          history[idx].completed = completed;
        } else {
          history.push({ date, completed });
        }
        localStorage.setItem(`identity-history-${identityID}`, JSON.stringify(history));
        // Recompute + re-render
        get().recomputeProgressFromHistory(identityID);
        set(state => ({ historyVersion: state.historyVersion + 1 }));
      },

      recomputeProgressFromHistory: (identityID: string) => {
        const { identities, userProgress, currentUser } = get();
        const identity = identities.find(i => i.identityID === identityID);
        const progress = userProgress.find(p => p.identityID === identityID);
        if (!identity || !progress) return;

        const historyRaw = localStorage.getItem(`identity-history-${identityID}`);
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
        console.log('🔄 Resetting cultivator store');
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
      name: 'cultivator-store',
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

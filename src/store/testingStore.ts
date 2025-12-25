import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/utils/logger';

interface TestingSnapshot {
  questsSnapshot: string | null;
  profileSnapshot: string | null;
  sealLogsSnapshot: string | null;
  sealStatsSnapshot: string | null;
  todaySealLogSnapshot: string | null;
  originalDate: string;
  originalCoins: number;
  originalStars: number;
}

interface TestingState {
  isTestingMode: boolean;
  testingDate: Date;
  snapshot: TestingSnapshot | null;
  
  // Actions
  enableTestingMode: () => void;
  disableTestingMode: () => Promise<void>;
  advanceToNextDay: () => void;
  getTestingDateFormatted: () => string;
  getCurrentDate: () => Date;
  addTestCoins: (amount: number) => Promise<void>;
  addTestStars: (amount: number) => Promise<void>;
}

export const useTestingStore = create<TestingState>()(
  persist(
    (set, get) => ({
      isTestingMode: false,
      testingDate: new Date(),
      snapshot: null,

      enableTestingMode: () => {
        const now = new Date();
        
        // Get current coins/stars from game store
        const gameStoreData = localStorage.getItem('game-store');
        let originalCoins = 0;
        let originalStars = 0;
        
        if (gameStoreData) {
          try {
            const parsed = JSON.parse(gameStoreData);
            originalCoins = parsed.state?.userProfile?.coins || 0;
            originalStars = parsed.state?.userProfile?.stars || 0;
          } catch (e) {
            logger.error('Failed to parse game store for snapshot', { error: e });
          }
        }
        
        // Take snapshot of current state from localStorage
        const snapshot: TestingSnapshot = {
          questsSnapshot: localStorage.getItem('quest-store'),
          profileSnapshot: gameStoreData,
          sealLogsSnapshot: localStorage.getItem('seal-logs'),
          sealStatsSnapshot: localStorage.getItem('seal-stats'),
          todaySealLogSnapshot: localStorage.getItem('today-seal-log'),
          originalDate: now.toISOString(),
          originalCoins,
          originalStars,
        };

        set({
          isTestingMode: true,
          testingDate: now,
          snapshot,
        });

        logger.info('Testing mode enabled', { date: now.toISOString(), originalCoins, originalStars });
      },

      disableTestingMode: async () => {
        const { snapshot } = get();
        
        if (snapshot) {
          // First restore original coins/stars to database before restoring localStorage
          try {
            const { useGameStore } = await import('./gameStore');
            const { gameDB } = await import('@/api/gameDatabase');
            const { userProfile } = useGameStore.getState();
            
            if (userProfile) {
              // Restore original coins and stars to database
              await gameDB.updateProfile(userProfile.id, {
                coins: snapshot.originalCoins,
                stars: snapshot.originalStars,
              });
              logger.info('Restored original coins/stars to database', {
                originalCoins: snapshot.originalCoins,
                originalStars: snapshot.originalStars,
              });
            }
          } catch (error) {
            logger.error('Failed to restore coins/stars to database', { error });
          }
          
          // Restore snapshots
          if (snapshot.questsSnapshot) {
            localStorage.setItem('quest-store', snapshot.questsSnapshot);
          } else {
            localStorage.removeItem('quest-store');
          }
          
          if (snapshot.profileSnapshot) {
            localStorage.setItem('game-store', snapshot.profileSnapshot);
          }
          
          if (snapshot.sealLogsSnapshot) {
            localStorage.setItem('seal-logs', snapshot.sealLogsSnapshot);
          }
          
          if (snapshot.sealStatsSnapshot) {
            localStorage.setItem('seal-stats', snapshot.sealStatsSnapshot);
          }
          
          if (snapshot.todaySealLogSnapshot) {
            localStorage.setItem('today-seal-log', snapshot.todaySealLogSnapshot);
          }

          logger.info('Testing mode disabled, state restored');
        }

        set({
          isTestingMode: false,
          testingDate: new Date(),
          snapshot: null,
        });

        // Force page reload to restore state
        window.location.reload();
      },

      advanceToNextDay: async () => {
        const { testingDate, isTestingMode } = get();
        
        if (!isTestingMode) {
          logger.warn('Cannot advance day when not in testing mode');
          return;
        }

        // Calculate next day OUTSIDE try block so it's accessible in dispatch
        const currentDate = new Date(testingDate);
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);

        // Import stores dynamically to avoid circular dependency
        try {
          const { useGameStore } = await import('./gameStore');
          
          // IMPORTANT: Capture task states BEFORE changing the date
          const { dailyTaskStates } = useGameStore.getState();
          const previousDayTaskStates = { ...dailyTaskStates };

          // Now advance the date
          set({ testingDate: nextDay });

          logger.info('Advanced to next day in testing mode', { 
            newDate: nextDay.toISOString() 
          });

          // 1. Trigger daily reset with previous day's task states
          const { resetDailyProgress } = useGameStore.getState();
          await resetDailyProgress(previousDayTaskStates);

          // 2. Move/reset quests for the new date
          const { useQuestStore } = await import('./questStore');
          const { moveIncompleteQuestsToDate, resetRecurringQuests } = useQuestStore.getState();
          
          // Reset recurring quests (move to new date and uncheck)
          resetRecurringQuests(nextDay);
          
          // Move incomplete non-recurring quests to new date
          moveIncompleteQuestsToDate(nextDay);

          // 3. Force refresh active identities to reflect new day state
          const { loadActiveIdentities, userProfile } = useGameStore.getState();
          if (userProfile) {
            await loadActiveIdentities(userProfile.id);
          }

          logger.info('Daily reset completed for testing mode', { date: nextDay });
        } catch (error) {
          logger.error('Failed to complete daily reset', { error });
        }

        // Dispatch custom event so other parts of the app can react
        window.dispatchEvent(new CustomEvent('testing-day-advanced', { 
          detail: { newDate: nextDay } 
        }));
      },

      getTestingDateFormatted: () => {
        const { testingDate, isTestingMode } = get();
        // Handle case where testingDate might be a string from localStorage
        const date = isTestingMode ? new Date(testingDate) : new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
      },

      getCurrentDate: () => {
        const { testingDate, isTestingMode } = get();
        // Handle case where testingDate might be a string from localStorage
        return isTestingMode ? new Date(testingDate) : new Date();
      },

      addTestCoins: async (amount: number) => {
        const { isTestingMode } = get();
        if (!isTestingMode) {
          logger.warn('Cannot add test coins when not in testing mode');
          return;
        }

        try {
          const { useGameStore } = await import('./gameStore');
          const { gameDB } = await import('@/api/gameDatabase');
          const { userProfile } = useGameStore.getState();
          
          if (!userProfile) {
            logger.error('No user profile found');
            return;
          }

          const newCoins = userProfile.coins + amount;
          const updatedProfile = await gameDB.updateProfile(userProfile.id, { coins: newCoins });
          useGameStore.setState({ userProfile: updatedProfile });
          
          logger.info('Test coins added', { amount, newTotal: newCoins });
        } catch (error) {
          logger.error('Failed to add test coins', { error });
        }
      },

      addTestStars: async (amount: number) => {
        const { isTestingMode } = get();
        if (!isTestingMode) {
          logger.warn('Cannot add test stars when not in testing mode');
          return;
        }

        try {
          const { useGameStore } = await import('./gameStore');
          const { gameDB } = await import('@/api/gameDatabase');
          const { userProfile } = useGameStore.getState();
          
          if (!userProfile) {
            logger.error('No user profile found');
            return;
          }

          const newStars = (userProfile.stars || 0) + amount;
          const updatedProfile = await gameDB.updateProfile(userProfile.id, { stars: newStars });
          useGameStore.setState({ userProfile: updatedProfile });
          
          logger.info('Test stars added', { amount, newTotal: newStars });
        } catch (error) {
          logger.error('Failed to add test stars', { error });
        }
      },
    }),
    {
      name: 'testing-store',
      partialize: (state) => ({
        isTestingMode: state.isTestingMode,
        testingDate: state.testingDate,
        snapshot: state.snapshot,
      }),
    }
  )
);

// Expose store globally for cross-store access without circular imports
(window as unknown as { __testingStore?: typeof useTestingStore }).__testingStore = useTestingStore;

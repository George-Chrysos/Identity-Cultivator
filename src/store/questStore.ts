import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/utils/logger';
import { Quest, SubQuest, QuestDifficulty } from '@/components/quest/QuestCard';

// Coin rewards based on quest difficulty - exported for UI display
export const QUEST_COIN_REWARDS: Record<QuestDifficulty, number> = {
  'Easy': 10,
  'Moderate': 20,
  'Difficult': 30,
  'Hard': 40,
  'Hell': 50,
};

// Helper to get today's date formatted
const getTodayFormatted = (): string => {
  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[today.getMonth()]} ${today.getDate()}`;
};

interface QuestState {
  quests: Quest[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadQuests: () => Promise<void>;
  addQuest: (quest: Omit<Quest, 'id'>) => Promise<Quest>;
  updateQuest: (questId: string, updates: Partial<Quest>) => Promise<void>;
  deleteQuest: (questId: string) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  addSubQuest: (questId: string, subQuest: Omit<SubQuest, 'id'>) => Promise<void>;
  getQuestById: (questId: string) => Quest | undefined;
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      quests: [],
      isLoading: false,
      error: null,

      loadQuests: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Check if we already have quests in state (from persistence)
          const currentQuests = get().quests;
          
          if (currentQuests.length === 0) {
            // No mock data - start with empty quests
            set({ quests: [], isLoading: false });
            logger.info('Initialized with empty quests');
          } else {
            // Update today's quests dates to reflect actual today
            const todayDate = getTodayFormatted();
            const updatedQuests = currentQuests.map(quest => {
              // Only update quests that were marked as 'today' status
              if (quest.status === 'today' && quest.date !== todayDate) {
                return { ...quest, date: todayDate };
              }
              return quest;
            });
            set({ quests: updatedQuests, isLoading: false });
            logger.debug('Quests loaded from persistence', { count: updatedQuests.length });
          }
        } catch (error) {
          logger.error('Failed to load quests', { error });
          set({ error: 'Failed to load quests', isLoading: false });
        }
      },

      addQuest: async (questData) => {
        const newQuest: Quest = {
          ...questData,
          id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        // Optimistic update
        set((state) => ({
          quests: [...state.quests, newQuest],
        }));

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 200));
          logger.info('Quest added', { questId: newQuest.id });
          return newQuest;
        } catch (error) {
          // Rollback on error
          set((state) => ({
            quests: state.quests.filter(q => q.id !== newQuest.id),
          }));
          logger.error('Failed to add quest', { error });
          throw error;
        }
      },

      updateQuest: async (questId, updates) => {
        const prevQuests = get().quests;
        const questIndex = prevQuests.findIndex(q => q.id === questId);
        
        if (questIndex === -1) {
          logger.error('Quest not found', { questId });
          return;
        }

        // Optimistic update
        set((state) => ({
          quests: state.quests.map(q =>
            q.id === questId ? { ...q, ...updates } : q
          ),
        }));

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 200));
          logger.debug('Quest updated', { questId, updates });
        } catch (error) {
          // Rollback on error
          set({ quests: prevQuests });
          logger.error('Failed to update quest', { error });
          throw error;
        }
      },

      deleteQuest: async (questId) => {
        const prevQuests = get().quests;
        
        // Optimistic update
        set((state) => ({
          quests: state.quests.filter(q => q.id !== questId),
        }));

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 200));
          logger.info('Quest deleted', { questId });
        } catch (error) {
          // Rollback on error
          set({ quests: prevQuests });
          logger.error('Failed to delete quest', { error });
          throw error;
        }
      },

      completeQuest: async (questId) => {
        const prevQuests = get().quests;
        const quest = prevQuests.find(q => q.id === questId);
        
        if (!quest) {
          logger.error('Quest not found', { questId });
          return;
        }

        const isCompleted = quest.status === 'completed';
        const newStatus = isCompleted ? 'today' : 'completed';
        const completedAt = isCompleted ? undefined : new Date().toISOString();

        // Calculate coin reward based on difficulty
        const difficulty = quest.difficulty || 'Easy';
        const coinReward = QUEST_COIN_REWARDS[difficulty];

        // Optimistic update for quest status
        set((state) => ({
          quests: state.quests.map(q =>
            q.id === questId 
              ? { ...q, status: newStatus, completedAt } 
              : q
          ),
        }));

        try {
          // Import stores synchronously to avoid timing issues
          const gameStoreModule = await import('@/store/gameStore');
          
          const gameStore = gameStoreModule.useGameStore.getState();
          const { userProfile } = gameStore;
          
          logger.debug('Quest completion - checking userProfile', { 
            hasUserProfile: !!userProfile,
            userId: userProfile?.id,
            currentCoins: userProfile?.coins,
            questId,
            isCompleted,
            coinReward
          });
          
          if (userProfile) {
            const coinDelta = isCompleted ? -coinReward : coinReward;
            const newCoins = Math.max(0, userProfile.coins + coinDelta);
            
            // Update coins in database
            const gameDBModule = await import('@/api/gameDatabase');
            const updatedProfile = await gameDBModule.gameDB.updateProfile(userProfile.id, { coins: newCoins });
            
            // Update game store state
            gameStoreModule.useGameStore.setState({ userProfile: updatedProfile });
            
            logger.info('Quest completion toggled', { 
              questId, 
              newStatus, 
              difficulty, 
              coinDelta,
              previousCoins: userProfile.coins,
              newCoins 
            });
          } else {
            logger.warn('No user profile found, coins not updated', { questId });
          }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          // Rollback on error
          set({ quests: prevQuests });
          logger.error('Failed to complete quest', { error });
          throw error;
        }
      },

      addSubQuest: async (questId, subQuestData) => {
        const prevQuests = get().quests;
        const newSubQuest: SubQuest = {
          ...subQuestData,
          id: `sq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        // Optimistic update
        set((state) => ({
          quests: state.quests.map(q =>
            q.id === questId
              ? { ...q, subtasks: [...(q.subtasks || []), newSubQuest] }
              : q
          ),
        }));

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 200));
          logger.debug('SubQuest added', { questId, subQuestId: newSubQuest.id });
        } catch (error) {
          // Rollback on error
          set({ quests: prevQuests });
          logger.error('Failed to add subquest', { error });
          throw error;
        }
      },

      getQuestById: (questId) => {
        return get().quests.find(q => q.id === questId);
      },
    }),
    {
      name: 'quest-store',
      partialize: (state) => ({
        quests: state.quests,
      }),
    }
  )
);

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

// Helper to get a random past date
const getRandomPastDate = (): string => {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 14) + 1; // 1-14 days ago
  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - daysAgo);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[pastDate.getMonth()]} ${pastDate.getDate()}`;
};

// Helper to get a random future date
const getRandomFutureDate = (): string => {
  const today = new Date();
  const daysAhead = Math.floor(Math.random() * 14) + 1; // 1-14 days ahead
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[futureDate.getMonth()]} ${futureDate.getDate()}`;
};

// Mock quests data - dynamically generated with today's date
const generateMockQuests = (): Quest[] => {
  const todayDate = getTodayFormatted();
  
  return [
    // Today's quests (2)
    {
      id: 'quest-today-1',
      title: 'Complete project documentation',
      project: 'System',
      date: todayDate,
      hour: '14:00',
      status: 'today',
      subtasks: [
        { id: 'sq-t1-1', title: 'Write README' },
        { id: 'sq-t1-2', title: 'Add API documentation' },
        { id: 'sq-t1-3', title: 'Create examples' }
      ]
    },
    {
      id: 'quest-today-2',
      title: 'Review and merge PR #123',
      project: 'Identity-Cultivator',
      date: todayDate,
      hour: '10:30',
      status: 'today',
      subtasks: [
        { id: 'sq-t2-1', title: 'Check code changes' },
        { id: 'sq-t2-2', title: 'Test functionality' },
        { id: 'sq-t2-3', title: 'Approve and merge' }
      ]
    },
    // Backlog quests (2) - random future dates
    {
      id: 'quest-backlog-1',
      title: 'Setup CI/CD pipeline',
      project: 'System',
      date: getRandomFutureDate(),
      hour: '09:00',
      status: 'backlog',
      subtasks: [
        { id: 'sq-b1-1', title: 'Configure GitHub Actions' },
        { id: 'sq-b1-2', title: 'Setup deployment scripts' },
        { id: 'sq-b1-3', title: 'Add environment variables' }
      ]
    },
    {
      id: 'quest-backlog-2',
      title: 'Implement user analytics',
      project: 'Identity-Cultivator',
      date: getRandomFutureDate(),
      status: 'backlog',
      subtasks: [
        { id: 'sq-b2-1', title: 'Add tracking events' },
        { id: 'sq-b2-2', title: 'Create analytics dashboard' }
      ]
    },
    // Completed quests (2) - random past dates
    {
      id: 'quest-completed-1',
      title: 'Refactor auth logic',
      project: 'Identity-Cultivator',
      date: getRandomPastDate(),
      hour: '09:00',
      status: 'completed',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      subtasks: [
        { id: 'sq-c1-1', title: 'Extract auth service' },
        { id: 'sq-c1-2', title: 'Add unit tests' }
      ]
    },
    {
      id: 'quest-completed-2',
      title: 'Design system components',
      project: 'System',
      date: getRandomPastDate(),
      hour: '16:00',
      status: 'completed',
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      subtasks: [
        { id: 'sq-c2-1', title: 'Create button variants' },
        { id: 'sq-c2-2', title: 'Build input components' },
        { id: 'sq-c2-3', title: 'Design card layouts' }
      ]
    }
  ];
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
            // Initialize with mock data if no quests exist
            const mockQuests = generateMockQuests();
            set({ quests: mockQuests, isLoading: false });
            logger.info('Loaded mock quests', { count: mockQuests.length });
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

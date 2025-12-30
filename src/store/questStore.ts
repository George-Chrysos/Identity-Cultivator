import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/utils/logger';
import { Quest, SubQuest, QuestDifficulty } from '@/components/quest/QuestCard';
import { useGameStore } from '@/store/gameStore';
import { gameDB } from '@/api/gameDatabase';

// Coin rewards based on quest difficulty - exported for UI display
export const QUEST_COIN_REWARDS: Record<QuestDifficulty, number> = {
  'Easy': 10,
  'Moderate': 20,
  'Difficult': 30,
  'Hard': 40,
  'Hell': 50,
};

// Difficulty escalation thresholds
export const DIFFICULTY_ESCALATION = {
  MODERATE: 3,  // 3 days -> Moderate
  DIFFICULT: 10, // 10 days -> Difficult
  HARD: 20,      // 20 days -> Hard (then Hell at next)
} as const;

// Get next difficulty level based on days not completed
export const getEscalatedDifficulty = (currentDifficulty: QuestDifficulty | undefined, daysNotCompleted: number): QuestDifficulty => {
  if (daysNotCompleted >= DIFFICULTY_ESCALATION.HARD) return 'Hell';
  if (daysNotCompleted >= DIFFICULTY_ESCALATION.DIFFICULT) return 'Hard';
  if (daysNotCompleted >= DIFFICULTY_ESCALATION.MODERATE) return 'Difficult';
  return currentDifficulty || 'Easy';
};

// Helper to get today's date formatted (uses testing store if available)
const getTodayFormatted = (): string => {
  // Dynamic import to avoid circular dependency
  const testingStore = (window as unknown as { __testingStore?: { getState: () => { isTestingMode: boolean; getCurrentDate: () => Date } } }).__testingStore;
  
  let today: Date;
  if (testingStore) {
    const state = testingStore.getState();
    today = state.isTestingMode ? state.getCurrentDate() : new Date();
  } else {
    today = new Date();
  }
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[today.getMonth()]} ${today.getDate()}`;
};

// Helper to get any date formatted
const getDateFormatted = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

// Helper to parse formatted date back to Date object
const parseFormattedDate = (formatted: string): Date | null => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = formatted.split(' ');
  if (parts.length !== 2) return null;
  
  const monthIndex = months.indexOf(parts[0]);
  const day = parseInt(parts[1], 10);
  
  if (monthIndex === -1 || isNaN(day)) return null;
  
  const now = new Date();
  return new Date(now.getFullYear(), monthIndex, day);
};

// Helper to check if a date is in the past (before today)
const isDateInPast = (dateStr: string): boolean => {
  const date = parseFormattedDate(dateStr);
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
};

interface QuestState {
  quests: Quest[];
  isLoading: boolean;
  error: string | null;
  userId: string | null; // Track current user for DB operations

  // Actions
  loadQuests: (userId: string) => Promise<void>;
  addQuest: (quest: Omit<Quest, 'id'>) => Promise<Quest>;
  updateQuest: (questId: string, updates: Partial<Quest>) => Promise<void>;
  deleteQuest: (questId: string) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  updateSubtaskCompletion: (questId: string, subtaskId: string, isCompleted: boolean) => Promise<void>;
  addSubQuest: (questId: string, subQuest: Omit<SubQuest, 'id'>) => Promise<void>;
  getQuestById: (questId: string) => Quest | undefined;
  moveIncompleteQuestsToDate: (newDate: Date) => Promise<void>;
  resetRecurringQuests: (newDate: Date) => Promise<void>;
  clearQuests: () => void;
}

// Helper to convert DB quest to frontend Quest format
const dbQuestToQuest = (dbQuest: import('@/types/database').DBQuest): Quest => ({
  id: dbQuest.id,
  title: dbQuest.title,
  project: dbQuest.project,
  date: dbQuest.date,
  hour: dbQuest.hour,
  status: dbQuest.status,
  difficulty: dbQuest.difficulty,
  completedAt: dbQuest.completed_at,
  isRecurring: dbQuest.is_recurring,
  daysNotCompleted: dbQuest.days_not_completed,
  subtasks: dbQuest.subtasks?.map(st => ({
    id: st.id,
    title: st.title,
  })),
  customRewards: dbQuest.custom_rewards?.map(r => ({
    id: r.id,
    description: r.description,
  })),
});

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      quests: [],
      isLoading: false,
      error: null,
      userId: null,

      loadQuests: async (userId: string) => {
        set({ isLoading: true, error: null, userId });
        
        try {
          // Try to load from database first
          const dbQuests = await gameDB.getQuests(userId);
          
          if (dbQuests.length > 0) {
            // Convert DB quests to frontend format
            const quests = dbQuests.map(dbQuestToQuest);
            
            // Auto-move incomplete quests from past dates to today
            const todayDate = getTodayFormatted();
            const updatedQuests = quests.map(quest => {
              if (quest.status === 'completed') return quest;
              
              if (isDateInPast(quest.date)) {
                logger.info('Auto-moved incomplete quest to today', { 
                  questId: quest.id, 
                  questTitle: quest.title,
                  oldDate: quest.date, 
                  newDate: todayDate 
                });
                return { ...quest, date: todayDate, status: 'today' as const };
              }
              
              if (quest.date === todayDate && quest.status !== 'today') {
                return { ...quest, status: 'today' as const };
              }
              
              return quest;
            });
            
            set({ quests: updatedQuests, isLoading: false });
            logger.info('Quests loaded from database', { count: updatedQuests.length });
          } else {
            // Check localStorage persistence as fallback
            const currentQuests = get().quests;
            
            if (currentQuests.length > 0) {
              // Migrate localStorage quests to database
              logger.info('Migrating localStorage quests to database', { count: currentQuests.length });
              
              for (const quest of currentQuests) {
                try {
                  await gameDB.createQuest(userId, {
                    title: quest.title,
                    project: quest.project,
                    date: quest.date,
                    hour: quest.hour,
                    difficulty: quest.difficulty,
                    is_recurring: quest.isRecurring,
                    subtasks: quest.subtasks?.map(st => ({ title: st.title })),
                    custom_rewards: quest.customRewards?.map(r => ({ description: r.description })),
                  });
                } catch (err) {
                  logger.warn('Failed to migrate quest to DB', { questId: quest.id, err });
                }
              }
              
              // Reload from database after migration
              const migratedQuests = await gameDB.getQuests(userId);
              set({ quests: migratedQuests.map(dbQuestToQuest), isLoading: false });
            } else {
              set({ quests: [], isLoading: false });
              logger.info('Initialized with empty quests');
            }
          }
        } catch (error) {
          logger.error('Failed to load quests', { error });
          // Fallback to localStorage quests if DB fails
          set({ error: 'Failed to load quests from database', isLoading: false });
        }
      },

      addQuest: async (questData) => {
        const { userId } = get();
        
        // Create temporary ID for optimistic update
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newQuest: Quest = {
          ...questData,
          id: tempId,
        };

        // Optimistic update
        set((state) => ({
          quests: [...state.quests, newQuest],
        }));

        try {
          if (userId) {
            // Persist to database
            const dbQuest = await gameDB.createQuest(userId, {
              title: questData.title,
              project: questData.project,
              date: questData.date,
              hour: questData.hour,
              difficulty: questData.difficulty,
              is_recurring: questData.isRecurring,
              subtasks: questData.subtasks?.map(st => ({ title: st.title })),
              custom_rewards: questData.customRewards?.map(r => ({ description: r.description })),
            });
            
            // Update with real ID from database
            const realQuest = dbQuestToQuest(dbQuest);
            set((state) => ({
              quests: state.quests.map(q => q.id === tempId ? realQuest : q),
            }));
            
            logger.info('Quest added to database', { questId: realQuest.id });
            return realQuest;
          }
          
          logger.info('Quest added (local only - no user)', { questId: newQuest.id });
          return newQuest;
        } catch (error) {
          // Rollback on error
          set((state) => ({
            quests: state.quests.filter(q => q.id !== tempId),
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
          // Persist to database
          await gameDB.updateQuest(questId, {
            title: updates.title,
            project: updates.project,
            date: updates.date,
            hour: updates.hour,
            status: updates.status,
            difficulty: updates.difficulty,
            completed_at: updates.completedAt || null,
            is_recurring: updates.isRecurring,
            days_not_completed: updates.daysNotCompleted,
          });
          
          logger.debug('Quest updated in database', { questId, updates });
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
          // Delete from database
          await gameDB.deleteQuest(questId);
          logger.info('Quest deleted from database', { questId });
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
          // Use static imports (already imported at top) to avoid memory issues
          const { userProfile } = useGameStore.getState();
          
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
            
            // Update coins in database using static import
            const updatedProfile = await gameDB.updateProfile(userProfile.id, { coins: newCoins });
            
            // Update game store state
            useGameStore.setState({ userProfile: updatedProfile });
            
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
          
          // Persist quest status to database
          await gameDB.updateQuest(questId, {
            status: newStatus,
            completed_at: completedAt || null,
          });
          
          logger.info('Quest completion persisted to database', { questId, newStatus });
        } catch (error) {
          // Rollback on error
          set({ quests: prevQuests });
          logger.error('Failed to complete quest', { error });
          throw error;
        }
      },

      updateSubtaskCompletion: async (questId, subtaskId, isCompleted) => {
        const prevQuests = get().quests;
        
        // Optimistic update
        set((state) => ({
          quests: state.quests.map(q => {
            if (q.id !== questId) return q;
            return {
              ...q,
              subtasks: q.subtasks?.map(st =>
                st.id === subtaskId ? { ...st, isCompleted } : st
              ),
            };
          }),
        }));

        try {
          // Persist to database
          await gameDB.updateSubtaskCompletion(subtaskId, isCompleted);
          logger.debug('Subtask completion updated in database', { questId, subtaskId, isCompleted });
        } catch (error) {
          // Rollback on error
          set({ quests: prevQuests });
          logger.error('Failed to update subtask completion', { error });
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
          // Note: Subtasks are created via quest creation or separate API
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

      moveIncompleteQuestsToDate: async (newDate: Date) => {
        const { userId } = get();
        const newDateFormatted = getDateFormatted(newDate);
        
        // Optimistic update
        set((state) => ({
          quests: state.quests.map(quest => {
            if (quest.status === 'completed') return quest;
            if (quest.isRecurring) return quest;
            
            if (quest.date !== newDateFormatted) {
              logger.info('Moving incomplete non-recurring quest to new date', {
                questId: quest.id,
                questTitle: quest.title,
                oldDate: quest.date,
                newDate: newDateFormatted,
              });
              return { 
                ...quest, 
                date: newDateFormatted, 
                status: 'today' as const,
                daysNotCompleted: (quest.daysNotCompleted || 0) + 1,
              };
            }
            
            return quest;
          }),
        }));

        // Persist to database
        if (userId) {
          try {
            await gameDB.batchUpdateQuestsForNewDay(userId, newDateFormatted);
            logger.info('Quests moved to new date in database', { newDate: newDateFormatted });
          } catch (error) {
            logger.error('Failed to persist quest date move to database', { error });
          }
        }
      },

      resetRecurringQuests: async (newDate: Date) => {
        const { userId } = get();
        const newDateFormatted = getDateFormatted(newDate);
        
        // Optimistic update
        set((state) => ({
          quests: state.quests.map(quest => {
            if (!quest.isRecurring) return quest;
            
            logger.info('Resetting recurring quest for new day', {
              questId: quest.id,
              questTitle: quest.title,
              oldDate: quest.date,
              newDate: newDateFormatted,
              wasCompleted: quest.status === 'completed',
            });
            
            return {
              ...quest,
              date: newDateFormatted,
              status: 'today' as const,
              completedAt: undefined,
            };
          }),
        }));

        // Note: DB update handled by batchUpdateQuestsForNewDay
        if (userId) {
          logger.info('Recurring quests reset persisted via batch update');
        }
      },
      
      clearQuests: () => {
        set({ quests: [], isLoading: false, error: null, userId: null });
        logger.info('Quests cleared');
      },
    }),
    {
      name: 'quest-store',
      partialize: (state) => ({
        quests: state.quests,
        userId: state.userId,
      }),
    }
  )
);

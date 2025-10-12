import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Identity, Character, TaskCompletion, GameStats, EvolutionStage } from '@/models/types';
import { 
  addXP, 
  checkLevelUp, 
  checkEvolutionChange, 
  calculateCharacterEvolution,
  MAX_ACTIVE_IDENTITIES,
  XP_PER_TASK 
} from '@/utils/leveling';
import { IdentityService } from '@/api/identityService';

interface IdentityState {
  // Data
  identities: Identity[];
  taskCompletions: TaskCompletion[];
  character: Character;
  gameStats: GameStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createIdentity: (name: string, description: string, dailyTask: string) => Promise<{ success: boolean; message: string; identity?: Identity }>;
  updateIdentity: (id: string, updates: Partial<Identity>) => Promise<{ success: boolean; message: string }>;
  deleteIdentity: (id: string) => Promise<{ success: boolean; message: string }>;
  activateIdentity: (id: string) => Promise<{ success: boolean; message: string }>;
  deactivateIdentity: (id: string) => Promise<{ success: boolean; message: string }>;
  completeDailyTask: (identityId: string) => Promise<{ success: boolean; message: string; levelUp?: boolean; evolution?: boolean }>;
  uncompleteDailyTask: (identityId: string) => Promise<{ success: boolean; message: string }>;
  
  // Internal actions
  loadData: () => Promise<void>;
  recalculateCharacter: () => void;
  
  // Getters
  getActiveIdentities: () => Identity[];
  getInactiveIdentities: () => Identity[];
  getIdentityById: (id: string) => Identity | undefined;
  canActivateMoreIdentities: () => boolean;
  getTodayCompletions: () => TaskCompletion[];
  getIdentityStreak: (identityId: string) => number;
}

// Initial data
const createInitialCharacter = (): Character => ({
  totalLevel: 0,
  totalXp: 0,
  evolutionStage: 'novice' as EvolutionStage,
  activeIdentities: 0,
  totalIdentities: 0,
});

const createInitialGameStats = (): GameStats => ({
  totalTasksCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalDaysActive: 0,
});

// Create some initial dummy data if none exists
const createDummyData = (): { identities: Identity[]; taskCompletions: TaskCompletion[] } => {
  const dummyIdentities: Identity[] = [
    {
      id: '1',
      name: 'Fitness Enthusiast',
      description: 'Building strength and endurance through consistent exercise',
      level: 3,
      xp: 25,
      xpToNextLevel: 125, // 150 - 25
      evolutionStage: 'novice' as EvolutionStage,
      dailyTask: 'Complete a 30-minute workout',
      isActive: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2', 
      name: 'Mindful Reader',
      description: 'Expanding knowledge and perspective through daily reading',
      level: 6,
      xp: 80,
      xpToNextLevel: 270, // 350 - 80
      evolutionStage: 'apprentice' as EvolutionStage,
      dailyTask: 'Read for 20 minutes',
      isActive: true,
      createdAt: new Date('2024-01-01'),
    },
  ];

  const dummyCompletions: TaskCompletion[] = [];

  return { identities: dummyIdentities, taskCompletions: dummyCompletions };
};

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set, get) => ({
      // Initial state
      identities: [],
      taskCompletions: [],
      character: createInitialCharacter(),
      gameStats: createInitialGameStats(),
      isLoading: false,
      error: null,

      // Load data from API service
      loadData: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const [identitiesResponse, completionsResponse] = await Promise.all([
            IdentityService.getIdentities(),
            IdentityService.getTaskCompletions(),
          ]);

          if (identitiesResponse.success && completionsResponse.success) {
            // If no data exists, create some dummy data
            let identities = identitiesResponse.data;
            let taskCompletions = completionsResponse.data;
            
            if (identities.length === 0) {
              const dummyData = createDummyData();
              identities = dummyData.identities;
              taskCompletions = dummyData.taskCompletions;
              
              // Save dummy data to localStorage
              for (const identity of identities) {
                await IdentityService.saveIdentity({
                  name: identity.name,
                  description: identity.description,
                  dailyTask: identity.dailyTask,
                  isActive: identity.isActive,
                });
              }
            }
            
            set({
              identities,
              taskCompletions,
              isLoading: false,
            });
            get().recalculateCharacter();
          } else {
            set({
              error: 'Failed to load data',
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Load data error:', error);
          set({
            error: 'Failed to load data',
            isLoading: false,
          });
        }
      },

      // Create a new identity
      createIdentity: async (name, description, dailyTask) => {
        set({ isLoading: true, error: null });

        try {
          const response = await IdentityService.saveIdentity({
            name,
            description,
            dailyTask,
            isActive: false, // New identities start inactive
          });

          if (response.success) {
            set((state) => ({
              identities: [...state.identities, response.data],
              isLoading: false,
            }));
            get().recalculateCharacter();
            
            return {
              success: true,
              message: 'Identity created successfully!',
              identity: response.data,
            };
          } else {
            set({ isLoading: false, error: response.message });
            return {
              success: false,
              message: response.message || 'Failed to create identity',
            };
          }
        } catch (error) {
          console.error('Create identity error:', error);
          set({ isLoading: false, error: 'Failed to create identity' });
          return {
            success: false,
            message: 'Failed to create identity',
          };
        }
      },

      // Update an identity
      updateIdentity: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
          const response = await IdentityService.updateIdentity({ id, updates });

          if (response.success) {
            set((state) => ({
              identities: state.identities.map((identity) =>
                identity.id === id ? response.data : identity
              ),
              isLoading: false,
            }));
            get().recalculateCharacter();
            
            return {
              success: true,
              message: 'Identity updated successfully!',
            };
          } else {
            set({ isLoading: false, error: response.message });
            return {
              success: false,
              message: response.message || 'Failed to update identity',
            };
          }
        } catch (error) {
          console.error('Update identity error:', error);
          set({ isLoading: false, error: 'Failed to update identity' });
          return {
            success: false,
            message: 'Failed to update identity',
          };
        }
      },

      // Delete an identity
      deleteIdentity: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const response = await IdentityService.deleteIdentity(id);

          if (response.success) {
            set((state) => ({
              identities: state.identities.filter((identity) => identity.id !== id),
              taskCompletions: state.taskCompletions.filter(
                (completion) => completion.identityId !== id
              ),
              isLoading: false,
            }));
            get().recalculateCharacter();
            
            return {
              success: true,
              message: 'Identity deleted successfully!',
            };
          } else {
            set({ isLoading: false, error: response.message });
            return {
              success: false,
              message: response.message || 'Failed to delete identity',
            };
          }
        } catch (error) {
          console.error('Delete identity error:', error);
          set({ isLoading: false, error: 'Failed to delete identity' });
          return {
            success: false,
            message: 'Failed to delete identity',
          };
        }
      },

      // Activate an identity
      activateIdentity: async (id) => {
        const activeCount = get().getActiveIdentities().length;
        
        if (activeCount >= MAX_ACTIVE_IDENTITIES) {
          return {
            success: false,
            message: `Maximum ${MAX_ACTIVE_IDENTITIES} active identities allowed`,
          };
        }

        const result = await get().updateIdentity(id, { isActive: true });
        
        if (result.success) {
          return {
            success: true,
            message: 'Identity activated!',
          };
        }
        
        return result;
      },

      // Deactivate an identity
      deactivateIdentity: async (id) => {
        const result = await get().updateIdentity(id, { isActive: false });
        
        if (result.success) {
          return {
            success: true,
            message: 'Identity deactivated',
          };
        }
        
        return result;
      },

      // Complete daily task
      completeDailyTask: async (identityId) => {
        const identity = get().getIdentityById(identityId);
        
        if (!identity) {
          return {
            success: false,
            message: 'Identity not found',
          };
        }

        if (!identity.isActive) {
          return {
            success: false,
            message: 'Identity must be active to complete tasks',
          };
        }

        // Check if already completed today
        const completedToday = await IdentityService.wasTaskCompletedToday(identityId);
        if (completedToday.success && completedToday.data) {
          return {
            success: false,
            message: 'Task already completed today',
          };
        }

        set({ isLoading: true, error: null });

        try {
          // Calculate XP gain (could include streak bonuses here)
          const streak = get().getIdentityStreak(identityId);
          const baseXP = XP_PER_TASK;
          const streakBonus = Math.floor(streak / 7) * 5; // 5 extra XP per week of streak
          const totalXP = baseXP + streakBonus;

          // Store old values for comparison
          const oldLevel = identity.level;
          const oldStage = identity.evolutionStage;

          // Apply XP gain and level up
          const updatedIdentity = addXP(identity, totalXP);
          
          // Check for level up and evolution
          const levelUp = checkLevelUp(oldLevel, updatedIdentity.level);
          const evolution = checkEvolutionChange(oldStage, updatedIdentity.evolutionStage);

          // Log task completion
          const completionResponse = await IdentityService.logTaskCompletion({
            identityId,
            date: new Date(),
            xpGained: totalXP,
          });

          if (!completionResponse.success) {
            throw new Error('Failed to log task completion');
          }

          // Update identity with new stats
          const updateResponse = await IdentityService.updateIdentity({
            id: identityId,
            updates: {
              xp: updatedIdentity.xp,
              level: updatedIdentity.level,
              xpToNextLevel: updatedIdentity.xpToNextLevel,
              evolutionStage: updatedIdentity.evolutionStage,
              lastCompletedTask: new Date(),
            },
          });

          if (!updateResponse.success) {
            throw new Error('Failed to update identity');
          }

          // Update store state
          set((state) => ({
            identities: state.identities.map((i) =>
              i.id === identityId ? updateResponse.data : i
            ),
            taskCompletions: [...state.taskCompletions, completionResponse.data],
            gameStats: {
              ...state.gameStats,
              totalTasksCompleted: state.gameStats.totalTasksCompleted + 1,
              currentStreak: streak + 1,
              longestStreak: Math.max(state.gameStats.longestStreak, streak + 1),
            },
            isLoading: false,
          }));

          get().recalculateCharacter();

          let message = `Task completed! +${totalXP} XP`;
          if (levelUp) message += ` • Level up! (Level ${updatedIdentity.level})`;
          if (evolution) message += ` • Evolution! (${updatedIdentity.evolutionStage})`;

          return {
            success: true,
            message,
            levelUp,
            evolution,
          };

        } catch (error) {
          console.error('Complete task error:', error);
          set({ isLoading: false, error: 'Failed to complete task' });
          return {
            success: false,
            message: 'Failed to complete task',
          };
        }
      },

      // Uncomplete daily task (remove today's completion)
      uncompleteDailyTask: async (identityId) => {
        const identity = get().getIdentityById(identityId);
        
        if (!identity) {
          return {
            success: false,
            message: 'Identity not found',
          };
        }

        if (!identity.isActive) {
          return {
            success: false,
            message: 'Identity must be active to uncomplete tasks',
          };
        }

        // Check if completed today
        const completedToday = await IdentityService.wasTaskCompletedToday(identityId);
        if (!completedToday.success || !completedToday.data) {
          return {
            success: false,
            message: 'Task not completed today',
          };
        }

        set({ isLoading: true, error: null });

        try {
          // Remove today's completion
          const removeResponse = await IdentityService.removeTodayTaskCompletion(identityId);

          if (!removeResponse.success || !removeResponse.data) {
            throw new Error('Failed to remove task completion');
          }

          const removedCompletion = removeResponse.data;

          // Calculate XP to remove (reverse of what was gained)
          const xpToRemove = removedCompletion.xpGained;

          // Calculate new XP (but don't go below 0)
          const newXP = Math.max(0, identity.xp - xpToRemove);
          
          // We need to recalculate level based on new XP
          // This is a simplified version - might need to handle level-downs properly
          let newLevel = identity.level;
          let currentLevelXP = newXP;
          
          // Simple recalculation: keep subtracting level thresholds until we find the right level
          while (newLevel > 1 && currentLevelXP < 0) {
            newLevel--;
            const prevLevelThreshold = 50 * newLevel;
            currentLevelXP += prevLevelThreshold;
          }

          // Calculate XP to next level
          const xpToNextLevel = (50 * newLevel) - currentLevelXP;

          // Update identity stats
          const updateResponse = await IdentityService.updateIdentity({
            id: identityId,
            updates: {
              xp: newXP,
              level: newLevel,
              xpToNextLevel: xpToNextLevel,
            },
          });

          if (!updateResponse.success) {
            throw new Error('Failed to update identity');
          }

          // Update store state
          set((state) => ({
            identities: state.identities.map((i) =>
              i.id === identityId ? updateResponse.data : i
            ),
            taskCompletions: state.taskCompletions.filter(
              (c) => c.id !== removedCompletion.id
            ),
            gameStats: {
              ...state.gameStats,
              totalTasksCompleted: Math.max(0, state.gameStats.totalTasksCompleted - 1),
            },
            isLoading: false,
          }));

          get().recalculateCharacter();

          return {
            success: true,
            message: `Task uncompleted! -${xpToRemove} XP`,
          };

        } catch (error) {
          console.error('Uncomplete task error:', error);
          set({ isLoading: false, error: 'Failed to uncomplete task' });
          return {
            success: false,
            message: 'Failed to uncomplete task',
          };
        }
      },

      // Recalculate character stats
      recalculateCharacter: () => {
        const { identities } = get();
        const activeIdentities = identities.filter((i) => i.isActive);
        
        const totalLevel = activeIdentities.reduce((sum, identity) => sum + identity.level, 0);
        const totalXp = activeIdentities.reduce((sum, identity) => sum + identity.xp, 0);
        const evolutionStage = calculateCharacterEvolution(totalLevel);

        set({
          character: {
            totalLevel,
            totalXp,
            evolutionStage,
            activeIdentities: activeIdentities.length,
            totalIdentities: identities.length,
          },
        });
      },

      // Getters
      getActiveIdentities: () => {
        return get().identities.filter((identity) => identity.isActive);
      },

      getInactiveIdentities: () => {
        return get().identities.filter((identity) => !identity.isActive);
      },

      getIdentityById: (id) => {
        return get().identities.find((identity) => identity.id === id);
      },

      canActivateMoreIdentities: () => {
        return get().getActiveIdentities().length < MAX_ACTIVE_IDENTITIES;
      },

      getTodayCompletions: () => {
        const today = new Date();
        return get().taskCompletions.filter((completion) => {
          const completionDate = new Date(completion.date);
          return (
            completionDate.getDate() === today.getDate() &&
            completionDate.getMonth() === today.getMonth() &&
            completionDate.getFullYear() === today.getFullYear()
          );
        });
      },

      getIdentityStreak: (identityId) => {
        const completions = get().taskCompletions
          .filter((c) => c.identityId === identityId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Start of today

        for (const completion of completions) {
          const completionDate = new Date(completion.date);
          completionDate.setHours(0, 0, 0, 0);

          // Check if completion is for current date
          if (completionDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
          } else if (completionDate.getTime() < currentDate.getTime()) {
            // Gap in streak
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: 'identity-evolution-store',
      // Only persist the data, not the methods
      partialize: (state) => ({
        identities: state.identities,
        taskCompletions: state.taskCompletions,
        character: state.character,
        gameStats: state.gameStats,
      }),
    }
  )
);

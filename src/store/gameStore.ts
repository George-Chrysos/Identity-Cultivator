import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Identity, Character, TaskCompletion, GameStats, EvolutionStage } from '@/models/types';
import {
  getLevelFromXP,
  getXPToNextLevel,
  getEvolutionStage,
  calculateXPGain,
  getStreakBonus,
  isNewDay,
} from '@/utils/gameLogic';

interface GameState {
  // Data
  identities: Identity[];
  taskCompletions: TaskCompletion[];
  character: Character;
  gameStats: GameStats;
  
  // Actions
  addIdentity: (identity: Omit<Identity, 'id' | 'createdAt'>) => void;
  updateIdentity: (id: string, updates: Partial<Identity>) => void;
  deleteIdentity: (id: string) => void;
  toggleIdentityActive: (id: string) => void;
  completeTask: (identityId: string) => void;
  updateCharacter: () => void;
  resetDailyTasks: () => void;
  
  // Getters
  getActiveIdentities: () => Identity[];
  getIdentityById: (id: string) => Identity | undefined;
  getTodayCompletions: () => TaskCompletion[];
  getCompletionsByIdentity: (identityId: string) => TaskCompletion[];
}

// Initial dummy data
const createInitialIdentities = (): Identity[] => [
  {
    id: '1',
    name: 'Fitness Enthusiast',
    description: 'Building strength and endurance through consistent exercise',
    level: 3,
    xp: 275,
    xpToNextLevel: 175,
    evolutionStage: 'novice' as EvolutionStage,
    dailyTask: 'Complete a 30-minute workout',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2', 
    name: 'Mindful Reader',
    description: 'Expanding knowledge and perspective through daily reading',
    level: 5,
    xp: 650,
    xpToNextLevel: 100,
    evolutionStage: 'apprentice' as EvolutionStage,
    dailyTask: 'Read for 20 minutes',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

const createInitialCharacter = (): Character => ({
  totalLevel: 8,
  totalXp: 925,
  evolutionStage: 'apprentice' as EvolutionStage,
  activeIdentities: 2,
  totalIdentities: 2,
});

const createInitialGameStats = (): GameStats => ({
  totalTasksCompleted: 15,
  currentStreak: 3,
  longestStreak: 7,
  totalDaysActive: 12,
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      identities: createInitialIdentities(),
      taskCompletions: [],
      character: createInitialCharacter(),
      gameStats: createInitialGameStats(),

      // Actions
      addIdentity: (identityData) => {
        const newIdentity: Identity = {
          ...identityData,
          id: Date.now().toString(),
          createdAt: new Date(),
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          evolutionStage: 'novice',
        };

        set((state) => ({
          identities: [...state.identities, newIdentity],
        }));
        
        get().updateCharacter();
      },

      updateIdentity: (id, updates) => {
        set((state) => ({
          identities: state.identities.map((identity) =>
            identity.id === id ? { ...identity, ...updates } : identity
          ),
        }));
        
        get().updateCharacter();
      },

      deleteIdentity: (id) => {
        set((state) => ({
          identities: state.identities.filter((identity) => identity.id !== id),
          taskCompletions: state.taskCompletions.filter(
            (completion) => completion.identityId !== id
          ),
        }));
        
        get().updateCharacter();
      },

      toggleIdentityActive: (id) => {
        set((state) => ({
          identities: state.identities.map((identity) =>
            identity.id === id ? { ...identity, isActive: !identity.isActive } : identity
          ),
        }));
        
        get().updateCharacter();
      },

      completeTask: (identityId) => {
        const identity = get().getIdentityById(identityId);
        if (!identity) return;

        // Check if task was already completed today
        const todayCompletions = get().getTodayCompletions();
        const alreadyCompleted = todayCompletions.some(
          (completion) => completion.identityId === identityId
        );
        
        if (alreadyCompleted) return;

        // Calculate XP gain with streak bonus
        const currentStreak = get().gameStats.currentStreak;
        const streakBonus = getStreakBonus(currentStreak);
        const xpCalc = calculateXPGain(50, streakBonus, 0);

        // Update identity XP and level
        const newXP = identity.xp + xpCalc.totalXP;
        const newLevel = getLevelFromXP(newXP);
        const newEvolutionStage = getEvolutionStage(newLevel);
        const xpToNextLevel = getXPToNextLevel(newXP, newLevel);

        // Create task completion record
        const completion: TaskCompletion = {
          id: Date.now().toString(),
          identityId,
          date: new Date(),
          completed: true,
          xpGained: xpCalc.totalXP,
        };

        // Update identity
        get().updateIdentity(identityId, {
          xp: newXP,
          level: newLevel,
          evolutionStage: newEvolutionStage,
          xpToNextLevel,
          lastCompletedTask: new Date(),
        });

        // Add completion record
        set((state) => ({
          taskCompletions: [...state.taskCompletions, completion],
        }));

        // Update game stats
        const isNewDayCompletion = isNewDay(identity.lastCompletedTask);
        const newCurrentStreak = isNewDayCompletion ? currentStreak + 1 : currentStreak;
        
        set((state) => ({
          gameStats: {
            ...state.gameStats,
            totalTasksCompleted: state.gameStats.totalTasksCompleted + 1,
            currentStreak: newCurrentStreak,
            longestStreak: Math.max(state.gameStats.longestStreak, newCurrentStreak),
            totalDaysActive: isNewDayCompletion 
              ? state.gameStats.totalDaysActive + 1 
              : state.gameStats.totalDaysActive,
          },
        }));
      },

      updateCharacter: () => {
        const { identities } = get();
        const activeIdentities = identities.filter((i) => i.isActive);
        
        const totalLevel = activeIdentities.reduce((sum, identity) => sum + identity.level, 0);
        const totalXp = activeIdentities.reduce((sum, identity) => sum + identity.xp, 0);
        const evolutionStage = getEvolutionStage(Math.floor(totalLevel / Math.max(activeIdentities.length, 1)));

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

      resetDailyTasks: () => {
        // This could be called daily to reset task completion status
        // For now, we'll keep the completion history
      },

      // Getters
      getActiveIdentities: () => {
        return get().identities.filter((identity) => identity.isActive);
      },

      getIdentityById: (id) => {
        return get().identities.find((identity) => identity.id === id);
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

      getCompletionsByIdentity: (identityId) => {
        return get().taskCompletions.filter(
          (completion) => completion.identityId === identityId
        );
      },
    }),
    {
      name: 'identity-evolution-storage',
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

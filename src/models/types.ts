export type EvolutionStage = 'novice' | 'apprentice' | 'expert' | 'master' | 'legend';

export interface Identity {
  id: string;
  name: string;
  description: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  evolutionStage: EvolutionStage;
  dailyTask: string;
  isActive: boolean;
  createdAt: Date;
  lastCompletedTask?: Date;
}

export interface Character {
  totalLevel: number;
  totalXp: number;
  evolutionStage: EvolutionStage;
  activeIdentities: number;
  totalIdentities: number;
}

export interface TaskCompletion {
  id: string;
  identityId: string;
  date: Date;
  completed: boolean;
  xpGained: number;
}

export interface GameStats {
  totalTasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
}

// Helper type for XP calculations
export interface XPCalculation {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  levelUp: boolean;
  newLevel?: number;
}

import { Identity, EvolutionStage } from '@/models/types';

export const XP_PER_TASK = 10;
export const MAX_ACTIVE_IDENTITIES = 5;

// Evolution stages with their milestone levels
export const EVOLUTION_STAGES: EvolutionStage[] = ['novice', 'apprentice', 'expert', 'master', 'legend'];

export const EVOLUTION_MILESTONES = {
  novice: 0,
  apprentice: 5,
  expert: 15,
  master: 30,
  legend: 50,
};

// Character evolution based on total level
export const CHARACTER_EVOLUTION_MILESTONES = {
  novice: 0,
  apprentice: 25,
  expert: 75,
  master: 150,
  legend: 250,
};

/**
 * Calculate XP required to reach the next level
 */
export const calculateXPToNextLevel = (level: number): number => {
  return 50 * level;
};

/**
 * Add XP to an identity and handle level ups
 */
export const addXP = (identity: Identity, xpGained: number): Identity => {
  let newXP = identity.xp + xpGained;
  let newLevel = identity.level;
  let xpToNextLevel = identity.xpToNextLevel;

  // Check for level ups
  while (newXP >= xpToNextLevel) {
    newXP -= xpToNextLevel;
    newLevel += 1;
    xpToNextLevel = calculateXPToNextLevel(newLevel);
  }

  const updatedIdentity = {
    ...identity,
    xp: newXP,
    level: newLevel,
    xpToNextLevel: xpToNextLevel - newXP,
  };

  // Check for evolution
  return checkEvolution(updatedIdentity);
};

/**
 * Check if identity should evolve to next stage
 */
export const checkEvolution = (identity: Identity): Identity => {
  const currentStageIndex = EVOLUTION_STAGES.indexOf(identity.evolutionStage);
  
  // Check if we can evolve to the next stage
  for (let i = currentStageIndex + 1; i < EVOLUTION_STAGES.length; i++) {
    const nextStage = EVOLUTION_STAGES[i];
    const requiredLevel = EVOLUTION_MILESTONES[nextStage];
    
    if (identity.level >= requiredLevel) {
      return {
        ...identity,
        evolutionStage: nextStage,
      };
    } else {
      break; // Can't evolve further
    }
  }
  
  return identity;
};

/**
 * Check if identity leveled up (for UI notifications)
 */
export const checkLevelUp = (oldLevel: number, newLevel: number): boolean => {
  return newLevel > oldLevel;
};

/**
 * Check if identity evolved (for UI notifications)
 */
export const checkEvolutionChange = (oldStage: EvolutionStage, newStage: EvolutionStage): boolean => {
  return oldStage !== newStage;
};

/**
 * Calculate character evolution stage based on total level
 */
export const calculateCharacterEvolution = (totalLevel: number): EvolutionStage => {
  if (totalLevel >= CHARACTER_EVOLUTION_MILESTONES.legend) return 'legend';
  if (totalLevel >= CHARACTER_EVOLUTION_MILESTONES.master) return 'master';
  if (totalLevel >= CHARACTER_EVOLUTION_MILESTONES.expert) return 'expert';
  if (totalLevel >= CHARACTER_EVOLUTION_MILESTONES.apprentice) return 'apprentice';
  return 'novice';
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Get next evolution milestone for an identity
 */
export const getNextEvolutionMilestone = (currentStage: EvolutionStage): { stage: EvolutionStage; level: number } | null => {
  const currentIndex = EVOLUTION_STAGES.indexOf(currentStage);
  
  if (currentIndex < EVOLUTION_STAGES.length - 1) {
    const nextStage = EVOLUTION_STAGES[currentIndex + 1];
    return {
      stage: nextStage,
      level: EVOLUTION_MILESTONES[nextStage],
    };
  }
  
  return null; // Already at maximum stage
};

/**
 * Calculate progress to next evolution (0-100%)
 */
export const getEvolutionProgress = (identity: Identity): number => {
  const nextMilestone = getNextEvolutionMilestone(identity.evolutionStage);
  
  if (!nextMilestone) return 100; // Already at max
  
  const currentMilestone = EVOLUTION_MILESTONES[identity.evolutionStage];
  const progress = (identity.level - currentMilestone) / (nextMilestone.level - currentMilestone);
  
  return Math.max(0, Math.min(100, progress * 100));
};

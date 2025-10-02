import { EvolutionStage, XPCalculation } from '@/models/types';

// XP required for each level (exponential growth)
export const getXPRequiredForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calculate total XP needed to reach a specific level
export const getTotalXPForLevel = (level: number): number => {
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += getXPRequiredForLevel(i);
  }
  return totalXP;
};

// Calculate current level based on total XP
export const getLevelFromXP = (totalXP: number): number => {
  let level = 1;
  let xpForCurrentLevel = 0;
  
  while (xpForCurrentLevel <= totalXP) {
    xpForCurrentLevel += getXPRequiredForLevel(level);
    if (xpForCurrentLevel <= totalXP) {
      level++;
    }
  }
  
  return level;
};

// Calculate XP needed for next level
export const getXPToNextLevel = (currentXP: number, currentLevel: number): number => {
  const xpForNextLevel = getXPRequiredForLevel(currentLevel);
  const xpInCurrentLevel = currentXP - getTotalXPForLevel(currentLevel);
  return xpForNextLevel - xpInCurrentLevel;
};

// Calculate XP progress as percentage for current level
export const getXPProgress = (currentXP: number, currentLevel: number): number => {
  const xpForCurrentLevel = getXPRequiredForLevel(currentLevel);
  const xpInCurrentLevel = currentXP - getTotalXPForLevel(currentLevel);
  return (xpInCurrentLevel / xpForCurrentLevel) * 100;
};

// Determine evolution stage based on level
export const getEvolutionStage = (level: number): EvolutionStage => {
  if (level >= 50) return 'legend';
  if (level >= 25) return 'master';
  if (level >= 15) return 'expert';
  if (level >= 5) return 'apprentice';
  return 'novice';
};

// Calculate XP gain with bonuses
export const calculateXPGain = (
  baseXP: number = 50,
  streakBonus: number = 0,
  completionBonus: number = 0
): XPCalculation => {
  const bonusXP = streakBonus + completionBonus;
  const totalXP = baseXP + bonusXP;
  
  return {
    baseXP,
    bonusXP,
    totalXP,
    levelUp: false, // This will be determined in the store
  };
};

// Generate streak bonus based on consecutive days
export const getStreakBonus = (streak: number): number => {
  if (streak >= 30) return 50;
  if (streak >= 14) return 30;
  if (streak >= 7) return 20;
  if (streak >= 3) return 10;
  return 0;
};

// Check if it's a new day since last completion
export const isNewDay = (lastDate: Date | undefined): boolean => {
  if (!lastDate) return true;
  
  const today = new Date();
  const last = new Date(lastDate);
  
  return (
    today.getDate() !== last.getDate() ||
    today.getMonth() !== last.getMonth() ||
    today.getFullYear() !== last.getFullYear()
  );
};

// Format XP numbers for display
export const formatXP = (xp: number): string => {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
};

// Get color for evolution stage
export const getEvolutionColor = (stage: EvolutionStage): string => {
  const colors = {
    novice: 'text-evolution-novice',
    apprentice: 'text-evolution-apprentice', 
    expert: 'text-evolution-expert',
    master: 'text-evolution-master',
    legend: 'text-evolution-legend',
  };
  return colors[stage];
};

// Get background color for evolution stage
export const getEvolutionBgColor = (stage: EvolutionStage): string => {
  const colors = {
    novice: 'bg-evolution-novice',
    apprentice: 'bg-evolution-apprentice',
    expert: 'bg-evolution-expert', 
    master: 'bg-evolution-master',
    legend: 'bg-evolution-legend',
  };
  return colors[stage];
};

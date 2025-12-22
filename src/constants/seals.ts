/**
 * Seals System
 * Static data for the 4 core seals and their sub-pillars
 */

export interface SubPillar {
  id: string;
  name: string;
  description?: string;
}

export interface Seal {
  id: string;
  name: string;
  icon: 'Eye' | 'Shield' | 'Flame' | 'Heart';
  subPillars: SubPillar[];
  statBonus?: 'mind' | 'body' | 'soul' | 'will';
}

export const SEALS: Seal[] = [
  {
    id: 'seal-shen',
    name: 'The Shen Seal',
    icon: 'Eye',
    statBonus: 'mind',
    subPillars: [
      { id: 'shen-1', name: 'Soft Eyes' },
      { id: 'shen-2', name: 'The Cockpit' },
      { id: 'shen-3', name: 'Silent Blade' },
      { id: 'shen-4', name: 'One Cut' },
    ],
  },
  {
    id: 'seal-body',
    name: 'The Body Seal',
    icon: 'Shield',
    statBonus: 'body',
    subPillars: [
      { id: 'body-1', name: '11 PM Gate' },
      { id: 'body-2', name: 'Tortoise Warmth' },
      { id: 'body-3', name: 'Drop the Armor' },
      { id: 'body-4', name: 'Guard the Essence' },
    ],
  },
  {
    id: 'seal-fuel',
    name: 'The Fuel Seal',
    icon: 'Flame',
    statBonus: 'soul',
    subPillars: [
      { id: 'fuel-1', name: 'Warm Fire' },
      { id: 'fuel-2', name: 'Steady Flame' },
    ],
  },
  {
    id: 'seal-heart',
    name: 'The Heart Seal',
    icon: 'Heart',
    statBonus: 'will',
    subPillars: [
      { id: 'heart-1', name: 'The Iron Circle' },
      { id: 'heart-2', name: 'The Glass Wall' },
    ],
  },
];

/**
 * User Seal Log Entry - Tracks daily seal selections
 * Critical for Calendar view and historical tracking
 */
export interface UserSealLog {
  date: string; // ISO String (YYYY-MM-DD)
  activeSealIds: string[]; // Array of subpillar IDs selected for that day
  status: 'pending' | 'completed' | 'failed'; // Evening check-in status
  completedAt?: string; // ISO timestamp when marked complete
}

/**
 * Sub-pillar Stats - Tracks individual sub-pillar progression
 * Each sub-pillar levels up independently based on days activated
 */
export interface SubPillarStats {
  subpillar_id: string; // Reference to SubPillar id
  days_activated: number; // Total days this sub-pillar was activated
  current_level: number; // Calculated from days_activated using SEAL_LEVEL_THRESHOLDS
  last_activated_date?: string; // ISO String of last active date (for streak tracking)
  current_streak: number; // Consecutive days activated
}

/**
 * User Seal Stats - For "Blind Leveling" system
 * Tracks progress without showing XP/levels directly
 */
export interface UserSealStats {
  seal_id: string; // Reference to Seal (using snake_case for DB consistency)
  total_days_active: number; // Total count of days this seal was selected
  current_streak: number; // Consecutive days selected
  current_level: number; // Average level of sub-pillars (for main seal display)
  last_active_date?: string; // ISO String of last active date
  subpillar_stats: SubPillarStats[]; // Individual sub-pillar progression
}

// ==================== SEAL LEVELING SYSTEM ====================

/**
 * Level thresholds for sub-pillar progression
 * Level up at: 5, 15, 30, 45, 90, 180, 360, 720, 1000 days
 * At 1000 days, show Lv.Max
 */
export const SEAL_LEVEL_THRESHOLDS = [
  { level: 1, minDays: 0 },
  { level: 2, minDays: 5 },
  { level: 3, minDays: 15 },
  { level: 4, minDays: 30 },
  { level: 5, minDays: 45 },
  { level: 6, minDays: 90 },
  { level: 7, minDays: 180 },
  { level: 8, minDays: 360 },
  { level: 9, minDays: 720 },
  { level: 10, minDays: 1000 }, // Max level
] as const;

export const MAX_SEAL_LEVEL = 10;
export const MAX_SEAL_DAYS = 1000;

/**
 * Calculate sub-pillar level from days activated
 */
export const getSubPillarLevel = (daysActivated: number): number => {
  for (let i = SEAL_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (daysActivated >= SEAL_LEVEL_THRESHOLDS[i].minDays) {
      return SEAL_LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
};

/**
 * Format sub-pillar level for display
 * At level 10 (1000 days), show "Lv.Max"
 */
export const formatSubPillarLevel = (level: number): string => {
  if (level >= MAX_SEAL_LEVEL) {
    return 'Lv.Max';
  }
  return `Lv.${level}`;
};

/**
 * Calculate days until next level
 */
export const getDaysUntilNextLevel = (daysActivated: number): number | null => {
  const currentLevel = getSubPillarLevel(daysActivated);
  if (currentLevel >= MAX_SEAL_LEVEL) return null;
  
  const nextThreshold = SEAL_LEVEL_THRESHOLDS.find(t => t.level === currentLevel + 1);
  if (!nextThreshold) return null;
  
  return nextThreshold.minDays - daysActivated;
};

// ==================== WILL RANK ACTIVATION LIMITS ====================

/**
 * Will rank to max daily seal activations mapping
 * E-E+: 4, D-D+: 6, C-C+: 8, B-B+: 10, A-A+: 12, S-S+: 16
 */
export const WILL_RANK_SEAL_LIMITS: Record<string, number> = {
  'F': 2,
  'F+': 3,
  'E': 4,
  'E+': 4,
  'D': 6,
  'D+': 6,
  'C': 8,
  'C+': 8,
  'B': 10,
  'B+': 10,
  'A': 12,
  'A+': 12,
  'S': 16,
  'S+': 16,
} as const;

/**
 * Get maximum daily seal activations based on Will rank
 */
export const getMaxDailySealActivations = (willRank: string): number => {
  return WILL_RANK_SEAL_LIMITS[willRank] || 4; // Default to 4 (E rank)
};

/**
 * Check if user can activate more seals today
 */
export const canActivateMoreSeals = (
  currentActiveCount: number,
  willRank: string
): boolean => {
  const maxActivations = getMaxDailySealActivations(willRank);
  return currentActiveCount < maxActivations;
};

// ==================== DAILY RESET LOGIC ====================

/**
 * Check if seals should be reset (new day)
 * @param lastActivatedDate - ISO date string of last activation
 * @returns true if it's a new day and seals should be deactivated
 */
export const shouldResetSeals = (lastActivatedDate?: string): boolean => {
  if (!lastActivatedDate) return true;
  
  const today = new Date().toISOString().split('T')[0];
  return lastActivatedDate !== today;
};

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check if a seal is active for today
 */
export const isSealActiveToday = (
  sealId: string,
  todayLog?: UserSealLog
): boolean => {
  if (!todayLog) return false;
  return todayLog.activeSealIds.includes(sealId);
};

/**
 * Calculate average level for a seal based on its sub-pillars
 */
export const calculateSealAverageLevel = (subpillarStats: SubPillarStats[]): number => {
  if (subpillarStats.length === 0) return 1;
  const totalLevel = subpillarStats.reduce((sum, sp) => sum + sp.current_level, 0);
  return Math.round(totalLevel / subpillarStats.length);
};

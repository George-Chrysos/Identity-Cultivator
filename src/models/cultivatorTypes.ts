// Database Models
export interface User {
  userID: string;
  name: string;
  tier: IdentityTier;
  totalDaysActive: number;
  createdAt: Date;
  lastActiveDate: Date;
}

export interface Identity {
  identityID: string;
  userID: string;
  title: string;
  imageUrl: string;
  tier: IdentityTier;
  level: number;
  daysCompleted: number;
  requiredDaysPerLevel: number;
  isActive: boolean;
  lastCompletedDate?: Date;
  createdAt: Date;
  identityType: IdentityType;
}

export interface UserProgress {
  userProgressID: string;
  userID: string;
  identityID: string;
  daysCompleted: number;
  level: number;
  tier: IdentityTier;
  completedToday: boolean;
  lastUpdatedDate: Date;
  streakDays: number;
  missedDays: number; // For decay tracking
}

// Enums and Types
export type IdentityTier = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS'; // Extended with SS & SSS
export type IdentityType = 'CULTIVATOR' | 'BODYSMITH' | 'PATHWEAVER' | 'FITNESS' | 'LEARNING' | 'CREATIVE' | 'SOCIAL';

// Tier Configuration (legacy simple model)
export interface TierConfig {
  tier: IdentityTier;
  requiredDaysPerLevel: number; // Deprecated in new model (variable per sub-level)
  maxLevels: number;
}

export const TIER_CONFIGS: Record<IdentityTier, TierConfig> = {
  'D': { tier: 'D', requiredDaysPerLevel: 5, maxLevels: 10 },
  'C': { tier: 'C', requiredDaysPerLevel: 10, maxLevels: 10 },
  'B': { tier: 'B', requiredDaysPerLevel: 15, maxLevels: 10 },
  'A': { tier: 'A', requiredDaysPerLevel: 20, maxLevels: 10 },
  'S': { tier: 'S', requiredDaysPerLevel: 13, maxLevels: 10 }, // Adjusted to 10 levels & avg days
  'SS': { tier: 'SS', requiredDaysPerLevel: 16, maxLevels: 10 },
  'SSS': { tier: 'SSS', requiredDaysPerLevel: 19, maxLevels: 10 },
};

// Identity Templates (legacy)
export interface IdentityTemplate {
  type: IdentityType;
  name: string;
  description: string;
  imageUrl: string;
  levelNames: Record<Exclude<IdentityTier, 'SS' | 'SSS'>, string[]>; // Legacy excludes new tiers
}

// Cultivator Identity Template (legacy) - kept for backward compatibility
export const CULTIVATOR_TEMPLATE: IdentityTemplate = {
  type: 'CULTIVATOR',
  name: 'Cultivator Path',
  description: 'The path of internal cultivation and martial arts mastery',
  imageUrl: '/images/cultivator-base.png',
  levelNames: {
    'D': [
      'Core Awakener',
      'Awakening Seeker',
      'Breath Disciple',
      'Mortal Foundation',
      'Qi Sensing',
      'Energy Novice',
      'Basic Cultivator',
      'Mortal Peak',
      'Threshold Walker',
      'Qi Awakening',
    ],
    'C': [
      'Qi Initiate',
      'Qi Gatherer',
      'Qi Adept',
      'Energy Collector',
      'Dantian Former',
      'Qi Condenser',
      'Energy Stabilizer',
      'Qi Master',
      'Foundation Complete',
      'Qi Perfection',
    ],
    'B': [
      'Energy Walker',
      'Energy Guardian',
      'Energy Warrior',
      'Channel Opener',
      'Meridian Master',
      'Flow Controller',
      'Energy Shaper',
      'Internal Fighter',
      'Qi Weaponizer',
      'Channel Perfection',
    ],
    'A': [
      'Core Disciple',
      'Core Practitioner',
      'Core Martialist',
      'Dantian Crystallizer',
      'Inner Diamond',
      'Core Radiator',
      'True Martial Artist',
      'Internal Grandmaster',
      'Core Perfection',
      'Nascent Formation',
    ],
    'S': [
      'Flowing Stream Peak',
      'Iron Root Peak',
      'Silent Thunder Peak',
      'Burning Heart Peak',
      'Shifting Wind Peak',
      'Unbroken Jade Peak',
      'Hidden Dragon Peak',
      'Supreme Radiant Peak',
    ],
  },
};

// ---------------- New Detailed Identity Structures ----------------
export interface IdentitySubLevel {
  level: number;
  daysToComplete: number;
  tasks: string[];
}

export interface IdentityTierDetail {
  tier: IdentityTier;
  title: string;
  subLevels: IdentitySubLevel[]; // Always 10 levels per tier in new model
}

export interface DetailedIdentityDefinition {
  id: number;
  name: string;
  description: string;
  tiers: IdentityTierDetail[];
}

// New Cultivator definition (partial JSON provided by user). TODO: Complete SSS tier levels 7-10 once provided.
export const CULTIVATOR_DEFINITION: DetailedIdentityDefinition = {
  id: 1,
  name: 'Cultivator',
  description: 'Path to energy cultivation, body awareness, mental focus, and subtle power through daily energy practices.',
  tiers: [
    {
      tier: 'D',
      title: 'Seed Initiate',
      subLevels: [
        { level: 1, daysToComplete: 2, tasks: ['5 min breathing & posture','Dantian visualization','Body scan 1 min'] },
        { level: 2, daysToComplete: 2, tasks: ['5–6 min breathing','Dantian visualization','Body scan 1 min'] },
        { level: 3, daysToComplete: 3, tasks: ['6 min breathing','Dantian visualization','Body scan 2 min'] },
        { level: 4, daysToComplete: 3, tasks: ['6–7 min breathing','Dantian visualization','Body scan 2 min'] },
        { level: 5, daysToComplete: 3, tasks: ['7 min breathing','Dantian visualization','Body scan 3 min'] },
        { level: 6, daysToComplete: 4, tasks: ['7–8 min breathing','Dantian awareness','Gentle stretching 3 min'] },
        { level: 7, daysToComplete: 4, tasks: ['8 min breathing & posture','Dantian awareness','Stretch + body scan 3–4 min'] },
        { level: 8, daysToComplete: 4, tasks: ['8–9 min breathing','Dantian visualization with gentle movement','Stretch 4 min'] },
        { level: 9, daysToComplete: 5, tasks: ['9 min breathing','Dynamic Dantian flow 2 min','Stretch 4–5 min'] },
        { level: 10, daysToComplete: 5, tasks: ['10 min breathing','Dantian flow integration','Stretch 5 min','Journal 1 reflection, 1 gratitude'] },
      ],
    },
    {
      tier: 'C',
      title: 'Sapling Adept',
      subLevels: [
        { level: 1, daysToComplete: 4, tasks: ['10 min energy cultivation','Dantian flow with movement','Stretch 5–6 min','Journal 1 reflection'] },
        { level: 2, daysToComplete: 4, tasks: ['11 min cultivation','Dantian + light visualization','Stretch 6 min','Journal 1 reflection'] },
        { level: 3, daysToComplete: 5, tasks: ['12 min cultivation','Dantian + movement','Stretch 6 min','Journal 2 reflections'] },
        { level: 4, daysToComplete: 5, tasks: ['13 min cultivation','Dantian + light visualization','Stretch 7 min','Journal 2 reflections'] },
        { level: 5, daysToComplete: 5, tasks: ['14 min cultivation','Dantian flow with movement','Stretch 7–8 min','Journal 2 reflections, 1 gratitude'] },
        { level: 6, daysToComplete: 6, tasks: ['15 min cultivation','Dantian + micro-movement','Stretch 8 min','Journal 2 reflections, 1 gratitude'] },
        { level: 7, daysToComplete: 6, tasks: ['16 min cultivation','Dantian + light flow','Stretch 8–9 min','Journal 3 reflections, 1 gratitude'] },
        { level: 8, daysToComplete: 6, tasks: ['17 min cultivation','Dantian integration with posture','Stretch 9 min','Journal 3 reflections, 2 gratitudes'] },
        { level: 9, daysToComplete: 7, tasks: ['18 min cultivation','Full Dantian flow','Stretch 10 min','Journal 3–4 reflections, 2 gratitudes'] },
        { level: 10, daysToComplete: 7, tasks: ['20 min cultivation','Dantian + movement + breath flow','Stretch 10 min','Journal 4 reflections, 2 gratitudes'] },
      ],
    },
    {
      tier: 'B',
      title: 'Rooted Practitioner',
      subLevels: [
        { level: 1, daysToComplete: 5, tasks: ['20–22 min cultivation','Dantian + slow movement','Stretch 10–12 min','Journal 2–3 reflections, 2 gratitudes'] },
        { level: 2, daysToComplete: 5, tasks: ['22 min cultivation','Dantian integration','Stretch 12 min','Journal 3 reflections, 2 gratitudes'] },
        { level: 3, daysToComplete: 6, tasks: ['23 min cultivation','Flow movements 2–3 min','Stretch 12 min','Journal 3 reflections, 2–3 gratitudes'] },
        { level: 4, daysToComplete: 6, tasks: ['24 min cultivation','Flow movements 3 min','Stretch 12–13 min','Journal 3 reflections, 3 gratitudes'] },
        { level: 5, daysToComplete: 6, tasks: ['25 min cultivation','Dynamic Dantian + slow stance','Stretch 13 min','Journal 4 reflections, 3 gratitudes'] },
        { level: 6, daysToComplete: 7, tasks: ['26 min cultivation','Dantian + flow with posture alignment','Stretch 13–14 min','Journal 4 reflections, 3 gratitudes'] },
        { level: 7, daysToComplete: 7, tasks: ['27 min cultivation','Flow integration 5 min','Stretch 14 min','Journal 4 reflections, 4 gratitudes'] },
        { level: 8, daysToComplete: 7, tasks: ['28 min cultivation','Dynamic full-body flow','Stretch 14–15 min','Journal 4–5 reflections, 4 gratitudes'] },
        { level: 9, daysToComplete: 8, tasks: ['29 min cultivation','Energy + movement + breath','Stretch 15 min','Journal 5 reflections, 4 gratitudes'] },
        { level: 10, daysToComplete: 8, tasks: ['30 min cultivation','Full Dantian + flow + posture','Stretch 15 min','Journal 5 reflections, 5 gratitudes'] },
      ],
    },
    {
      tier: 'A',
      title: 'Flow Adept',
      subLevels: [
        { level: 1, daysToComplete: 8, tasks: ['30–32 min cultivation','Full Dantian + slow movement','Stretch 15–16 min','Journal 5 reflections, 5 gratitudes'] },
        { level: 2, daysToComplete: 8, tasks: ['32 min cultivation','Flow integration 5–6 min','Stretch 16 min','Journal 5 reflections, 5 gratitudes'] },
        { level: 3, daysToComplete: 9, tasks: ['33 min cultivation','Dynamic full-body flow','Stretch 16–17 min','Journal 5–6 reflections, 5 gratitudes'] },
        { level: 4, daysToComplete: 9, tasks: ['34 min cultivation','Dantian + breath + slow stance','Stretch 17 min','Journal 6 reflections, 5 gratitudes'] },
        { level: 5, daysToComplete: 10, tasks: ['35 min cultivation','Dynamic body + energy flow','Stretch 17–18 min','Journal 6 reflections, 6 gratitudes'] },
        { level: 6, daysToComplete: 10, tasks: ['36 min cultivation','Micro-meditation bursts 2–3 min','Stretch 18 min','Journal 6 reflections, 6 gratitudes'] },
        { level: 7, daysToComplete: 10, tasks: ['37 min cultivation','Energy + posture + breath flow','Stretch 18–19 min','Journal 6–7 reflections, 6 gratitudes'] },
        { level: 8, daysToComplete: 11, tasks: ['38 min cultivation','Dynamic integrated flow 5–6 min','Stretch 19 min','Journal 7 reflections, 6 gratitudes'] },
        { level: 9, daysToComplete: 11, tasks: ['39 min cultivation','Full body + energy integration','Stretch 19–20 min','Journal 7 reflections, 7 gratitudes'] },
        { level: 10, daysToComplete: 12, tasks: ['40 min cultivation','Integrated energy, posture, breath','Stretch 20 min','Journal 7–8 reflections, 7 gratitudes'] },
      ],
    },
    {
      tier: 'S',
      title: 'Energy Weaver',
      subLevels: [
        { level: 1, daysToComplete: 12, tasks: ['40–42 min cultivation','Full flow integration','Stretch 20–21 min','Journal 8 reflections, 7 gratitudes'] },
        { level: 2, daysToComplete: 12, tasks: ['42 min cultivation','Energy + movement integration','Stretch 21 min','Journal 8 reflections, 8 gratitudes'] },
        { level: 3, daysToComplete: 13, tasks: ['43 min cultivation','Dynamic full-body energy flow','Stretch 21–22 min','Journal 8–9 reflections, 8 gratitudes'] },
        { level: 4, daysToComplete: 13, tasks: ['44 min cultivation','Integrated posture + energy + micro-meditation','Stretch 22 min','Journal 9 reflections, 8 gratitudes'] },
        { level: 5, daysToComplete: 14, tasks: ['45 min cultivation','Energy + movement + breath integration','Stretch 22–23 min','Journal 9 reflections, 9 gratitudes'] },
        { level: 6, daysToComplete: 14, tasks: ['46 min cultivation','Full flow + micro-meditation bursts','Stretch 23 min','Journal 9 reflections, 9 gratitudes'] },
        { level: 7, daysToComplete: 15, tasks: ['47 min cultivation','Integrated energy & posture flow','Stretch 23–24 min','Journal 10 reflections, 9 gratitudes'] },
        { level: 8, daysToComplete: 15, tasks: ['48 min cultivation','Full-body dynamic energy flow','Stretch 24 min','Journal 10 reflections, 10 gratitudes'] },
        { level: 9, daysToComplete: 15, tasks: ['49 min cultivation','Integrated micro-meditation + energy + flow','Stretch 24–25 min','Journal 10 reflections, 10 gratitudes'] },
        { level: 10, daysToComplete: 15, tasks: ['50 min cultivation','Full mastery integration: breath, posture, energy','Stretch 25 min','Journal 10 reflections, 10 gratitudes'] },
      ],
    },
    {
      tier: 'SS',
      title: 'Master of Flow',
      subLevels: [
        { level: 1, daysToComplete: 15, tasks: ['50–52 min cultivation','Full energy flow + posture','Stretch 25–26 min','Journal 10 reflections, 10 gratitudes, 2 action plans'] },
        { level: 2, daysToComplete: 15, tasks: ['52 min cultivation','Dynamic integrated flow','Stretch 26 min','Journal 10 reflections, 10 gratitudes, 2 action plans'] },
        { level: 3, daysToComplete: 16, tasks: ['53 min cultivation','Full-body energy + micro-meditation','Stretch 26–27 min','Journal 11 reflections, 10 gratitudes, 2 action plans'] },
        { level: 4, daysToComplete: 16, tasks: ['54 min cultivation','Integrated energy + posture + slow movements','Stretch 27 min','Journal 11 reflections, 11 gratitudes, 2 action plans'] },
        { level: 5, daysToComplete: 16, tasks: ['55 min cultivation','Full flow integration 5–6 min','Stretch 27–28 min','Journal 11 reflections, 11 gratitudes, 2–3 action plans'] },
        { level: 6, daysToComplete: 17, tasks: ['56 min cultivation','Dynamic full-body energy integration','Stretch 28 min','Journal 12 reflections, 11 gratitudes, 3 action plans'] },
        { level: 7, daysToComplete: 17, tasks: ['57 min cultivation','Energy + posture + micro-meditation bursts','Stretch 28–29 min','Journal 12 reflections, 12 gratitudes, 3 action plans'] },
        { level: 8, daysToComplete: 17, tasks: ['58 min cultivation','Full mastery flow','Stretch 29 min','Journal 12 reflections, 12 gratitudes, 3 action plans'] },
        { level: 9, daysToComplete: 18, tasks: ['59 min cultivation','Integrated energy + posture + breath','Stretch 29–30 min','Journal 13 reflections, 12 gratitudes, 3 action plans'] },
        { level: 10, daysToComplete: 18, tasks: ['60 min cultivation','Ultimate full-body energy integration','Stretch 30 min','Journal 13–14 reflections, 13 gratitudes, 3–4 action plans'] },
      ],
    },
    {
      tier: 'SSS',
      title: 'Ascendant Cultivator',
      subLevels: [
        { level: 1, daysToComplete: 18, tasks: ['60–62 min cultivation','Integrated energy, movement, posture, micro-meditation','Stretch 30–31 min','Journal 14 reflections, 13 gratitudes, 4 action plans, weekly review'] },
        { level: 2, daysToComplete: 18, tasks: ['65 min cultivation','Full flow + visualization + breath','Stretch 31 min','Journal 14 reflections, 14 gratitudes, 4 action plans, weekly review'] },
        { level: 3, daysToComplete: 19, tasks: ['70 min cultivation','Full-body integration','Stretch 31–32 min','Journal 15 reflections, 14 gratitudes, 4 action plans, weekly review'] },
        { level: 4, daysToComplete: 19, tasks: ['75 min cultivation','Advanced energy + posture + flow','Stretch 32 min','Journal 15 reflections, 15 gratitudes, 4 action plans, weekly review'] },
        { level: 5, daysToComplete: 19, tasks: ['80 min cultivation','Micro-meditation + dynamic flow','Stretch 32–33 min','Journal 15 reflections, 15 gratitudes, 4–5 action plans, weekly review'] },
        { level: 6, daysToComplete: 20, tasks: ['85 min cultivation','Integrated energy, posture, breath, movement','Stretch 33 min','Journal 16 reflections, 15 gratitudes, 5 action plans, weekly review'] },
        { level: 7, daysToComplete: 20, tasks: ['90 min cultivation','Integrated energy, posture, breath, movement','Stretch 33 min','Journal 16 reflections, 15 gratitudes, 5 action plans, weekly review'] },
        { level: 8, daysToComplete: 20, tasks: ['90 min cultivation','Integrated energy, posture, breath, movement','Stretch 33 min','Journal 16 reflections, 15 gratitudes, 5 action plans, weekly review'] },
        { level: 9, daysToComplete: 20, tasks: ['90 min cultivation','Integrated energy, posture, breath, movement','Stretch 33 min','Journal 16 reflections, 15 gratitudes, 5 action plans, weekly review'] },
        { level: 10, daysToComplete: 20, tasks: ['90 min cultivation','Integrated energy, posture, breath, movement','Stretch 33 min','Journal 16 reflections, 15 gratitudes, 5 action plans, weekly review'] },
      ],
    },
  ],
};

// New Bodysmith definition (based on provided structure)
export const BODYSMITH_DEFINITION: DetailedIdentityDefinition = {
  id: 2,
  name: 'Bodysmith',
  description: 'Path to maximum body control, rootedness, lightness, and strength.',
  tiers: [
    {
      tier: 'D',
      title: 'Novice Forger',
      subLevels: [
        { level: 1, daysToComplete: 3, tasks: ['Horse Stance 30s','Jump Rope 10 skips'] },
        { level: 2, daysToComplete: 3, tasks: ['Horse Stance 40s','Jump Rope 15 skips'] },
        { level: 3, daysToComplete: 4, tasks: ['Horse Stance 50s','Jump Rope 20 skips'] },
        { level: 4, daysToComplete: 4, tasks: ['Horse Stance 1min','Jump Rope 25 skips'] },
        { level: 5, daysToComplete: 4, tasks: ['Horse Stance 1min','Jump Rope 30 skips','Deep Squats 5 reps'] },
        { level: 6, daysToComplete: 5, tasks: ['Horse Stance 1:10','Jump Rope 35 skips','Deep Squats 5 reps'] },
        { level: 7, daysToComplete: 5, tasks: ['Horse Stance 1:20','Jump Rope 40 skips','Deep Squats 6 reps'] },
        { level: 8, daysToComplete: 6, tasks: ['Horse Stance 1:30','Jump Rope 45 skips','Deep Squats 6 reps'] },
        { level: 9, daysToComplete: 6, tasks: ['Horse Stance 1:40','Jump Rope 50 skips','Deep Squats 7 reps'] },
        { level: 10, daysToComplete: 7, tasks: ['Horse Stance 2 min','Jump Rope 60 skips','Deep Squats 8 reps'] },
      ],
    },
    {
      tier: 'C',
      title: 'Iron Apprentice',
      subLevels: [
        { level: 1, daysToComplete: 4, tasks: ['Horse Stance 2:10','Jump Rope 70 skips','Calf Raises 10'] },
        { level: 2, daysToComplete: 4, tasks: ['Horse Stance 2:20','Jump Rope 80 skips','Calf Raises 10'] },
        { level: 3, daysToComplete: 5, tasks: ['Horse Stance 2:30','Jump Rope 90 skips','Calf Raises 12','Light Stretch ankles/toes'] },
        { level: 4, daysToComplete: 5, tasks: ['Horse Stance 2:40','Jump Rope 100 skips','Calf Raises 12','Light Stretch'] },
        { level: 5, daysToComplete: 6, tasks: ['Horse Stance 2:50','Jump Rope 110 skips','Calf Raises 15','Light Stretch'] },
        { level: 6, daysToComplete: 6, tasks: ['Horse Stance 3 min','Jump Rope 120 skips','Calf Raises 15','Balance Drill 30s'] },
        { level: 7, daysToComplete: 7, tasks: ['Horse Stance 3:10','Jump Rope 130 skips','Calf Raises 15','Balance Drill 40s'] },
        { level: 8, daysToComplete: 7, tasks: ['Horse Stance 3:20','Jump Rope 140 skips','Calf Raises 15','Balance Drill 50s'] },
        { level: 9, daysToComplete: 8, tasks: ['Horse Stance 3:30','Jump Rope 150 skips','Calf Raises 20','Balance Drill 1 min'] },
        { level: 10, daysToComplete: 8, tasks: ['Horse Stance 3:40','Jump Rope 160 skips','Calf Raises 20','Balance Drill 1 min','Hollow Body Hold 20s'] },
      ],
    },
    {
      tier: 'B',
      title: 'Steel Adept',
      subLevels: [
        { level: 1, daysToComplete: 5, tasks: ['Horse Stance 4 min','Jump Rope 3 min','Balance Drill 1 min','Hollow Body Hold 25s'] },
        { level: 2, daysToComplete: 5, tasks: ['Horse Stance 4:15','Jump Rope 3:15 min','Balance Drill 1:10 min','Hollow Body Hold 30s'] },
        { level: 3, daysToComplete: 6, tasks: ['Horse Stance 4:30','Jump Rope 3:30 min','Balance Drill 1:20 min','Hollow Body Hold 35s'] },
        { level: 4, daysToComplete: 6, tasks: ['Horse Stance 4:45','Jump Rope 3:45 min','Balance Drill 1:30 min','Hollow Body Hold 40s'] },
        { level: 5, daysToComplete: 7, tasks: ['Horse Stance 5 min','Jump Rope 4 min','Balance Drill 1:40','Hollow Hold 45s'] },
        { level: 6, daysToComplete: 7, tasks: ['Horse Stance 5:15','Jump Rope 4:15','Balance Drill 1:50','Hollow Hold 50s'] },
        { level: 7, daysToComplete: 8, tasks: ['Horse Stance 5:30','Jump Rope 4:30','Balance Drill 2 min','Hollow Hold 55s'] },
        { level: 8, daysToComplete: 8, tasks: ['Horse Stance 5:45','Jump Rope 4:45','Balance Drill 2:10','Hollow Hold 60s'] },
        { level: 9, daysToComplete: 9, tasks: ['Horse Stance 6 min','Jump Rope 5 min','Balance Drill 2:20','Hollow Hold 65s'] },
        { level: 10, daysToComplete: 9, tasks: ['Horse Stance 6:15','Jump Rope 5:15','Balance Drill 2:30','Hollow Hold 70s'] },
      ],
    },
    {
      tier: 'A',
      title: 'Alloy Shaper',
      subLevels: [
        { level: 1, daysToComplete: 8, tasks: ['Horse Stance 6:30','Jump Rope 5:30 min','Balance Drill 2:40','Hollow Hold 70s','Core Flow 1 round'] },
        { level: 2, daysToComplete: 8, tasks: ['Horse Stance 6:45','Jump Rope 5:45 min','Balance Drill 2:50','Hollow Hold 75s','Core Flow 1 round'] },
        { level: 3, daysToComplete: 9, tasks: ['Horse Stance 7 min','Jump Rope 6 min','Balance Drill 3 min','Hollow Hold 80s','Core Flow 1 round'] },
        { level: 4, daysToComplete: 9, tasks: ['Horse Stance 7:15','Jump Rope 6:15 min','Balance Drill 3:10','Hollow Hold 85s','Core Flow 1 round'] },
        { level: 5, daysToComplete: 10, tasks: ['Horse Stance 7:30','Jump Rope 6:30 min','Balance Drill 3:20','Hollow Hold 90s','Core Flow 1 round'] },
        { level: 6, daysToComplete: 10, tasks: ['Horse Stance 7:45','Jump Rope 6:45 min','Balance Drill 3:30','Hollow Hold 95s','Core Flow 1 round'] },
        { level: 7, daysToComplete: 11, tasks: ['Horse Stance 8 min','Jump Rope 7 min','Balance Drill 3:40','Hollow Hold 100s','Core Flow 2 rounds'] },
        { level: 8, daysToComplete: 11, tasks: ['Horse Stance 8:15','Jump Rope 7:15 min','Balance Drill 3:50','Hollow Hold 105s','Core Flow 2 rounds'] },
        { level: 9, daysToComplete: 12, tasks: ['Horse Stance 8:30','Jump Rope 7:30 min','Balance Drill 4 min','Hollow Hold 110s','Core Flow 2 rounds'] },
        { level: 10, daysToComplete: 12, tasks: ['Horse Stance 8:45','Jump Rope 7:45 min','Balance Drill 4:10','Hollow Hold 120s','Core Flow 2 rounds'] },
      ],
    },
    {
      tier: 'S',
      title: 'Vital Forgemaster',
      subLevels: [
        { level: 1, daysToComplete: 12, tasks: ['Horse Stance 9 min','Jump Rope 8 min','Single-Leg Squats 5 each','Core Flow 2 rounds','Mobility & Flexibility Circuit'] },
        { level: 2, daysToComplete: 12, tasks: ['Horse Stance 9:15','Jump Rope 8:15 min','Single-Leg Squats 6 each','Core Flow 2 rounds','Mobility & Flexibility Circuit'] },
        { level: 3, daysToComplete: 13, tasks: ['Horse Stance 9:30','Jump Rope 8:30 min','Single-Leg Squats 7 each','Core Flow 2 rounds','Mobility & Flexibility Circuit'] },
        { level: 4, daysToComplete: 13, tasks: ['Horse Stance 9:45','Jump Rope 8:45 min','Single-Leg Squats 8 each','Core Flow 2 rounds','Mobility & Flexibility Circuit'] },
        { level: 5, daysToComplete: 14, tasks: ['Horse Stance 10 min','Jump Rope 9 min','Single-Leg Squats 8–10 each','Core Flow 3 rounds','Mobility & Flexibility Circuit'] },
        { level: 6, daysToComplete: 14, tasks: ['Horse Stance 10:15','Jump Rope 9:15 min','Single-Leg Squats 10 each','Core Flow 3 rounds','Mobility & Flexibility Circuit'] },
        { level: 7, daysToComplete: 15, tasks: ['Horse Stance 10:30','Jump Rope 9:30 min','Single-Leg Squats 10–12 each','Core Flow 3 rounds','Mobility & Flexibility Circuit'] },
        { level: 8, daysToComplete: 15, tasks: ['Horse Stance 10:45','Jump Rope 9:45 min','Single-Leg Squats 12 each','Core Flow 3 rounds','Mobility & Flexibility Circuit'] },
        { level: 9, daysToComplete: 15, tasks: ['Horse Stance 11 min','Jump Rope 10 min','Single-Leg Squats 12–14 each','Core Flow 3 rounds','Mobility & Flexibility Circuit'] },
        { level: 10, daysToComplete: 15, tasks: ['Horse Stance 11:15','Jump Rope 10:15 min','Single-Leg Squats 14 each','Core Flow 4 rounds','Mobility & Flexibility Circuit'] },
      ],
    },
    {
      tier: 'SS',
      title: 'Living Anvil',
      subLevels: [
        { level: 1, daysToComplete: 15, tasks: ['Horse Stance 11:30','Jump Rope 10:30 min','One-Leg Squats 5–6 each','Core Flow 4 rounds','Dynamic Strength & Control Drills'] },
        { level: 2, daysToComplete: 15, tasks: ['Horse Stance 11:45','Jump Rope 10:45 min','One-Leg Squats 6–7 each','Core Flow 4 rounds','Dynamic Strength & Control Drills'] },
        { level: 3, daysToComplete: 16, tasks: ['Horse Stance 12 min','Jump Rope 11 min','One-Leg Squats 7–8 each','Core Flow 4 rounds','Dynamic Strength & Control Drills'] },
        { level: 4, daysToComplete: 16, tasks: ['Horse Stance 12:15','Jump Rope 11:15 min','One-Leg Squats 8 each','Core Flow 4 rounds','Dynamic Strength & Control Drills'] },
        { level: 5, daysToComplete: 16, tasks: ['Horse Stance 12:30','Jump Rope 11:30 min','One-Leg Squats 8–10 each','Core Flow 4 rounds','Dynamic Strength & Control Drills'] },
        { level: 6, daysToComplete: 17, tasks: ['Horse Stance 12:45','Jump Rope 11:45 min','One-Leg Squats 10 each','Core Flow 4 rounds','Dynamic Strength & Control Drills'] },
        { level: 7, daysToComplete: 17, tasks: ['Horse Stance 13 min','Jump Rope 12 min','One-Leg Squats 10–12 each','Core Flow 4–5 rounds','Dynamic Strength & Control Drills'] },
        { level: 8, daysToComplete: 17, tasks: ['Horse Stance 13:15','Jump Rope 12:15 min','One-Leg Squats 12 each','Core Flow 5 rounds','Dynamic Strength & Control Drills'] },
        { level: 9, daysToComplete: 18, tasks: ['Horse Stance 13:30','Jump Rope 12:30 min','One-Leg Squats 12–14 each','Core Flow 5 rounds','Dynamic Strength & Control Drills'] },
        { level: 10, daysToComplete: 18, tasks: ['Horse Stance 13:45','Jump Rope 12:45 min','One-Leg Squats 14 each','Core Flow 5 rounds','Dynamic Strength & Control Drills'] },
      ],
    },
    {
      tier: 'SSS',
      title: 'Fleshforged Titan',
      subLevels: [
        { level: 1, daysToComplete: 18, tasks: ['Horse Stance 14 min','Jump Rope 13 min','Balance + Mobility Flow 5 min','Core Flow 5 rounds','Advanced Full-Body Control Flow'] },
        { level: 2, daysToComplete: 18, tasks: ['Horse Stance 14:15','Jump Rope 13:15 min','Balance + Mobility Flow 6 min','Core Flow 5 rounds','Advanced Full-Body Control Flow'] },
        { level: 3, daysToComplete: 19, tasks: ['Horse Stance 14:30','Jump Rope 13:30 min','Balance + Mobility Flow 6 min','Core Flow 5 rounds','Advanced Full-Body Control Flow'] },
        { level: 4, daysToComplete: 19, tasks: ['Horse Stance 14:45','Jump Rope 13:45 min','Balance + Mobility Flow 7 min','Core Flow 5 rounds','Advanced Full-Body Control Flow'] },
        { level: 5, daysToComplete: 19, tasks: ['Horse Stance 15 min','Jump Rope 14 min','Balance + Mobility Flow 7 min','Core Flow 6 rounds','Advanced Full-Body Control Flow'] },
        { level: 6, daysToComplete: 20, tasks: ['Horse Stance 15:15','Jump Rope 14:15 min','Balance + Mobility Flow 8 min','Core Flow 6 rounds','Advanced Full-Body Control Flow'] },
        { level: 7, daysToComplete: 20, tasks: ['Horse Stance 15:30','Jump Rope 14:30 min','Balance + Mobility Flow 8 min','Core Flow 7 rounds','Advanced Full-Body Control Flow'] },
        { level: 8, daysToComplete: 20, tasks: ['Horse Stance 15:45','Jump Rope 14:45 min','Balance + Mobility Flow 9 min','Core Flow 7 rounds','Advanced Full-Body Control Flow'] },
        { level: 9, daysToComplete: 20, tasks: ['Horse Stance 16:00','Jump Rope 15:00 min','Balance + Mobility Flow 9 min','Core Flow 8 rounds','Advanced Full-Body Control Flow'] },
        { level: 10, daysToComplete: 20, tasks: ['Horse Stance 16:15','Jump Rope 15:15 min','Balance + Mobility Flow 10 min','Core Flow 8 rounds','Mastery Full-Body Control Flow'] },
      ],
    },
  ],
};

// New Pathweaver definition
export const PATHWEAVER_DEFINITION: DetailedIdentityDefinition = {
  id: 3,
  name: 'Pathweaver',
  description: 'Path to awareness, planning, reflection, gratitude, foresight, and life mastery.',
  tiers: [
    {
      tier: 'D',
      title: 'Dawn Planner',
      subLevels: [
        { level: 1, daysToComplete: 2, tasks: ['Plan top 3 tasks','Journal: 1 gratitude,1 win,1 lesson'] },
        { level: 2, daysToComplete: 2, tasks: ['Plan top 3 tasks','Journal: 1 gratitude,1 win,1 lesson'] },
        { level: 3, daysToComplete: 3, tasks: ['Plan top 3 tasks with time blocks','Journal: 1 gratitude,1 win,1 lesson'] },
        { level: 4, daysToComplete: 3, tasks: ['Plan top 3 tasks with time blocks','Journal: 2 gratitudes,1 win,1 lesson'] },
        { level: 5, daysToComplete: 3, tasks: ['Plan top 3 tasks with priorities','Journal: 2 gratitudes,1 win,1 lesson'] },
        { level: 6, daysToComplete: 4, tasks: ['Plan top 3 tasks with priorities','Journal: 2 gratitudes,1 win,1 lesson','Track 1 metric'] },
        { level: 7, daysToComplete: 4, tasks: ['Plan top 3 tasks with priorities','Journal: 3 gratitudes,2 wins,1 lesson','Track 1 metric'] },
        { level: 8, daysToComplete: 4, tasks: ['Plan tomorrow with priorities & blocks','Journal: 3 gratitudes,2 wins,1 lesson','Track 1 metric'] },
        { level: 9, daysToComplete: 5, tasks: ['Plan tomorrow with priorities & blocks','Journal: 3 gratitudes,2 wins,1 lesson','Track 2 metrics'] },
        { level: 10, daysToComplete: 5, tasks: ['Plan tomorrow with priorities & blocks','Journal: 3–4 gratitudes,2 wins,1 lesson','Track 2 metrics','Weekly reflection'] },
      ],
    },
    {
      tier: 'C',
      title: 'Adept Planner',
      subLevels: [
        { level: 1, daysToComplete: 4, tasks: ['Plan top 3 tasks','Journal: 2 gratitudes,1 win,1 lesson','Track 1 metric'] },
        { level: 2, daysToComplete: 5, tasks: ['+1 gratitude'] },
        { level: 3, daysToComplete: 6, tasks: ['+1 win'] },
        { level: 4, daysToComplete: 7, tasks: ['+1 metric'] },
        { level: 5, daysToComplete: 8, tasks: ['+1 gratitude'] },
        { level: 6, daysToComplete: 9, tasks: ['+1 reflection'] },
        { level: 7, daysToComplete: 10, tasks: ['+1 metric'] },
        { level: 8, daysToComplete: 11, tasks: ['+1 gratitude'] },
        { level: 9, daysToComplete: 12, tasks: ['+1 reflection'] },
        { level: 10, daysToComplete: 13, tasks: ['+1 weekly review'] },
      ],
    },
    {
      tier: 'B',
      title: 'Strategic Weaver',
      subLevels: [
        { level: 1, daysToComplete: 5, tasks: ['Plan top 3 tasks with priorities & blocks','Journal: 3 gratitudes,2 wins,1 lesson','Track 2 metrics'] },
        { level: 2, daysToComplete: 6, tasks: ['+1 gratitude'] },
        { level: 3, daysToComplete: 7, tasks: ['+1 reflection'] },
        { level: 4, daysToComplete: 8, tasks: ['+1 metric'] },
        { level: 5, daysToComplete: 9, tasks: ['+1 gratitude'] },
        { level: 6, daysToComplete: 10, tasks: ['+1 reflection'] },
        { level: 7, daysToComplete: 11, tasks: ['+1 weekly review'] },
        { level: 8, daysToComplete: 12, tasks: ['+1 metric'] },
        { level: 9, daysToComplete: 13, tasks: ['+1 reflection'] },
        { level: 10, daysToComplete: 14, tasks: ['+1 gratitude'] },
      ],
    },
    {
      tier: 'A',
      title: 'Master Planner',
      subLevels: [
        { level: 1, daysToComplete: 8, tasks: ['Plan day/week, time blocks, priorities','Journal: 5 reflections, 5 gratitudes','Track 3 metrics'] },
        { level: 2, daysToComplete: 9, tasks: ['+1 reflection'] },
        { level: 3, daysToComplete: 10, tasks: ['+1 gratitude'] },
        { level: 4, daysToComplete: 11, tasks: ['+1 metric'] },
        { level: 5, daysToComplete: 12, tasks: ['+1 weekly review'] },
        { level: 6, daysToComplete: 13, tasks: ['+1 reflection'] },
        { level: 7, daysToComplete: 14, tasks: ['+1 gratitude'] },
        { level: 8, daysToComplete: 15, tasks: ['+1 metric'] },
        { level: 9, daysToComplete: 16, tasks: ['+1 weekly review'] },
        { level: 10, daysToComplete: 17, tasks: ['+1 reflection', '+1 gratitude'] },
      ],
    },
    {
      tier: 'S',
      title: 'Fate Weaver',
      subLevels: [
        { level: 1, daysToComplete: 12, tasks: ['Plan month & day, prioritize, track key metrics','Journal: 7 reflections, 6 gratitudes','Budgeting & Investments'] },
        { level: 2, daysToComplete: 13, tasks: ['+1 reflection'] },
        { level: 3, daysToComplete: 14, tasks: ['+1 gratitude'] },
        { level: 4, daysToComplete: 15, tasks: ['+1 metric or budget review'] },
        { level: 5, daysToComplete: 16, tasks: ['+1 reflection'] },
        { level: 6, daysToComplete: 17, tasks: ['+1 gratitude'] },
        { level: 7, daysToComplete: 18, tasks: ['+1 investment planning'] },
        { level: 8, daysToComplete: 19, tasks: ['+1 reflection'] },
        { level: 9, daysToComplete: 20, tasks: ['+1 gratitude'] },
        { level: 10, daysToComplete: 21, tasks: ['+1 yearly/quarterly plan'] },
      ],
    },
    {
      tier: 'SS',
      title: 'Life Architect',
      subLevels: [
        { level: 1, daysToComplete: 14, tasks: ['Integrated yearly, monthly, weekly planning','Journal: 8 reflections, 8 gratitudes','Track all key metrics, review budget'] },
        { level: 2, daysToComplete: 15, tasks: ['+1 reflection'] },
        { level: 3, daysToComplete: 16, tasks: ['+1 gratitude'] },
        { level: 4, daysToComplete: 17, tasks: ['+1 metric or budget check'] },
        { level: 5, daysToComplete: 18, tasks: ['+1 reflection'] },
        { level: 6, daysToComplete: 19, tasks: ['+1 gratitude'] },
        { level: 7, daysToComplete: 20, tasks: ['+1 investment planning'] },
        { level: 8, daysToComplete: 21, tasks: ['+1 reflection'] },
        { level: 9, daysToComplete: 22, tasks: ['+1 gratitude'] },
        { level: 10, daysToComplete: 23, tasks: ['+1 comprehensive yearly review'] },
      ],
    },
    {
      tier: 'SSS',
      title: 'Legendary Fate Weaver',
      subLevels: [
        { level: 1, daysToComplete: 15, tasks: ['Complete mastery of daily, weekly, monthly, yearly planning','Journal: 10 reflections, 10 gratitudes','Track all life metrics, budget, investments'] },
        { level: 2, daysToComplete: 16, tasks: ['+1 reflection'] },
        { level: 3, daysToComplete: 17, tasks: ['+1 gratitude'] },
        { level: 4, daysToComplete: 18, tasks: ['+1 metric review'] },
        { level: 5, daysToComplete: 19, tasks: ['+1 reflection'] },
        { level: 6, daysToComplete: 20, tasks: ['+1 gratitude'] },
        { level: 7, daysToComplete: 21, tasks: ['+1 investment planning'] },
        { level: 8, daysToComplete: 22, tasks: ['+1 reflection'] },
        { level: 9, daysToComplete: 23, tasks: ['+1 gratitude'] },
        { level: 10, daysToComplete: 24, tasks: ['+1 ultimate life plan review & vision'] },
      ],
    },
  ],
};

// Progress Calculation
export interface ProgressResult {
  canComplete: boolean;
  canReverse: boolean;
  newDaysCompleted: number;
  newLevel: number;
  newTier: IdentityTier;
  leveledUp: boolean;
  evolved: boolean;
  decayApplied: number; // Days lost to decay
}

// Animation Events
export interface AnimationEvent {
  type: 'LEVEL_UP' | 'EVOLUTION' | 'DECAY';
  identityID: string;
  oldLevel?: number;
  newLevel?: number;
  oldTier?: IdentityTier;
  newTier?: IdentityTier;
  message: string;
}

// Database Query Interfaces
export interface CreateIdentityRequest {
  userID: string;
  identityType: IdentityType;
  customTitle?: string;
  customImageUrl?: string;
}

export interface UpdateProgressRequest {
  userID: string;
  identityID: string;
  action: 'COMPLETE' | 'REVERSE';
}

export interface GetUserDataResponse {
  user: User;
  identities: Identity[];
  progress: UserProgress[];
}

// Utility Functions Types
export interface DaysDifference {
  days: number;
  isToday: boolean;
  isYesterday: boolean;
  missedDays: number;
}

export interface LevelUpResult {
  leveledUp: boolean;
  evolved: boolean;
  newLevel: number;
  newTier: IdentityTier;
  newRequiredDaysPerLevel: number;
}

// Legacy Templates
export const BODYSMITH_TEMPLATE: IdentityTemplate = {
  type: 'BODYSMITH' as IdentityType,
  name: 'Bodysmith',
  description: 'Body forging and physical mastery path',
  imageUrl: '/images/bodysmith-base.png',
  levelNames: {
    'D': ['Novice Forger 1','Novice Forger 2','Novice Forger 3','Novice Forger 4','Novice Forger 5','Novice Forger 6','Novice Forger 7','Novice Forger 8','Novice Forger 9','Novice Forger 10'],
    'C': ['Iron Apprentice 1','Iron Apprentice 2','Iron Apprentice 3','Iron Apprentice 4','Iron Apprentice 5','Iron Apprentice 6','Iron Apprentice 7','Iron Apprentice 8','Iron Apprentice 9','Iron Apprentice 10'],
    'B': ['Steel Adept 1','Steel Adept 2','Steel Adept 3','Steel Adept 4','Steel Adept 5','Steel Adept 6','Steel Adept 7','Steel Adept 8','Steel Adept 9','Steel Adept 10'],
    'A': ['Alloy Shaper 1','Alloy Shaper 2','Alloy Shaper 3','Alloy Shaper 4','Alloy Shaper 5','Alloy Shaper 6','Alloy Shaper 7','Alloy Shaper 8','Alloy Shaper 9','Alloy Shaper 10'],
    'S': ['Vital Forgemaster 1','Vital Forgemaster 2','Vital Forgemaster 3','Vital Forgemaster 4','Vital Forgemaster 5','Vital Forgemaster 6','Vital Forgemaster 7','Vital Forgemaster 8'],
  }
};

export const PATHWEAVER_TEMPLATE: IdentityTemplate = {
  type: 'PATHWEAVER' as IdentityType,
  name: 'Pathweaver',
  description: 'Planning, reflection and life architecture path',
  imageUrl: '/images/pathweaver-base.png',
  levelNames: {
    'D': ['Dawn Planner 1','Dawn Planner 2','Dawn Planner 3','Dawn Planner 4','Dawn Planner 5','Dawn Planner 6','Dawn Planner 7','Dawn Planner 8','Dawn Planner 9','Dawn Planner 10'],
    'C': ['Adept Planner 1','Adept Planner 2','Adept Planner 3','Adept Planner 4','Adept Planner 5','Adept Planner 6','Adept Planner 7','Adept Planner 8','Adept Planner 9','Adept Planner 10'],
    'B': ['Strategic Weaver 1','Strategic Weaver 2','Strategic Weaver 3','Strategic Weaver 4','Strategic Weaver 5','Strategic Weaver 6','Strategic Weaver 7','Strategic Weaver 8','Strategic Weaver 9','Strategic Weaver 10'],
    'A': ['Master Planner 1','Master Planner 2','Master Planner 3','Master Planner 4','Master Planner 5','Master Planner 6','Master Planner 7','Master Planner 8','Master Planner 9','Master Planner 10'],
    'S': ['Fate Weaver 1','Fate Weaver 2','Fate Weaver 3','Fate Weaver 4','Fate Weaver 5','Fate Weaver 6','Fate Weaver 7','Fate Weaver 8'],
  }
};

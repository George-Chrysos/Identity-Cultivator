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
export type IdentityTier = 'D' | 'D+' | 'C' | 'C+' | 'B' | 'B+' | 'A' | 'A+' | 'S' | 'S+' | 'SS' | 'SS+' | 'SSS';
export type IdentityType =
  | 'CULTIVATOR'
  | 'BODYSMITH'
  | 'JOURNALIST'
  | 'STRATEGIST'
  | 'FITNESS'
  | 'LEARNING'
  | 'CREATIVE'
  | 'SOCIAL';

// Tier Configuration (legacy simple model)
export interface TierConfig {
  tier: IdentityTier;
  requiredDaysPerLevel: number; // Deprecated in new model (variable per sub-level)
  maxLevels: number;
}

export const TIER_CONFIGS: Record<IdentityTier, TierConfig> = {
  'D': { tier: 'D', requiredDaysPerLevel: 5, maxLevels: 10 },
  'D+': { tier: 'D+', requiredDaysPerLevel: 6, maxLevels: 10 },
  'C': { tier: 'C', requiredDaysPerLevel: 8, maxLevels: 10 },
  'C+': { tier: 'C+', requiredDaysPerLevel: 10, maxLevels: 10 },
  'B': { tier: 'B', requiredDaysPerLevel: 12, maxLevels: 10 },
  'B+': { tier: 'B+', requiredDaysPerLevel: 14, maxLevels: 10 },
  'A': { tier: 'A', requiredDaysPerLevel: 16, maxLevels: 10 },
  'A+': { tier: 'A+', requiredDaysPerLevel: 18, maxLevels: 10 },
  'S': { tier: 'S', requiredDaysPerLevel: 20, maxLevels: 10 },
  'S+': { tier: 'S+', requiredDaysPerLevel: 22, maxLevels: 10 },
  'SS': { tier: 'SS', requiredDaysPerLevel: 24, maxLevels: 10 },
  'SS+': { tier: 'SS+', requiredDaysPerLevel: 26, maxLevels: 10 },
  'SSS': { tier: 'SSS', requiredDaysPerLevel: 30, maxLevels: 10 },
};

// Identity Templates (legacy)
export interface IdentityTemplate {
  type: IdentityType;
  name: string;
  description: string;
  imageUrl: string;
  levelNames: Partial<Record<IdentityTier, string[]>>; // Made partial for legacy support
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
  lore: string; // Short description or lore for the tier
  subLevels: IdentitySubLevel[]; // Always 10 levels per tier in new model
}

export interface DetailedIdentityDefinition {
  id: number;
  name: string;
  description: string;
  tiers: IdentityTierDetail[];
}

export const CULTIVATOR_DEFINITION: DetailedIdentityDefinition = {
  id: 1,
  name: 'Cultivator',
  description: 'Path to energy cultivation, body awareness, mental focus, and subtle power through daily energy practices.',
  tiers: [
    {
      tier: 'D',
      title: 'Seed Initiate',
      lore: '🌱 You plant the seed of awareness through breath and patience.',
      subLevels: [
        { level: 1, daysToComplete: 3, tasks: ['Breathing: 5 min deep belly breathing', 'Dantian focus: Feel warmth in lower belly 1 min', 'Gratitude: Note 1 thing you are grateful for'] },
        { level: 2, daysToComplete: 4, tasks: ['Breathing: 6 min deep breathing', 'Body scan: Notice tension, relax it', 'Dantian focus: Gentle warmth awareness'] },
        { level: 3, daysToComplete: 4, tasks: ['Breathing: 6 min slow rhythmic', 'Dantian: Visualize a dim light expanding', 'Stretch: Neck & shoulders 2 min'] },
        { level: 4, daysToComplete: 5, tasks: ['Breathing: 7 min', 'Dantian: Light glowing steadily', 'Stretch: Gentle back twist 2 min'] },
        { level: 5, daysToComplete: 5, tasks: ['Breathing: 8 min slow and steady', 'Dantian: Feel expansion with inhale', 'Gratitude: 1 reflection'] },
        { level: 6, daysToComplete: 6, tasks: ['Breathing: 8 min rhythmic', 'Dantian: Steady awareness', 'Stretch: Legs 2 min'] },
        { level: 7, daysToComplete: 6, tasks: ['Breathing: 9 min deep rhythm', 'Dantian: Feel subtle energy movement', 'Stretch: Gentle flow 3 min'] },
        { level: 8, daysToComplete: 6, tasks: ['Breathing: 9 min box style (4-4-4-4)', 'Dantian: Warm pulse awareness', 'Stretch: Spine mobility 3 min'] },
        { level: 9, daysToComplete: 7, tasks: ['Breathing: 10 min', 'Dantian: Constant focus on warmth', 'Stretch: Full body 4 min'] },
        { level: 10, daysToComplete: 7, tasks: ['Breathing: 10 min sustained', 'Dantian: Harmonize with breath', 'Body scan: Relax entire body'] },
      ],
    },
    {
      tier: 'D+',
      title: 'Awakening Seeker',
      lore: '🔥 The inner fire stirs as energy begins to move with intention.',
      subLevels: [
        { level: 1, daysToComplete: 5, tasks: ['Breathing: 10 min continuous focus', 'Dantian: Feel warmth expand outward', 'Movement: 5 min gentle standing sways', 'Journal: 1 win from practice'] },
        { level: 2, daysToComplete: 5, tasks: ['Breathing: 11 min', 'Dantian: Visualize expansion & contraction', 'Stretch: 5 min flow'] },
        { level: 3, daysToComplete: 6, tasks: ['Breathing: 11 min controlled rhythm', 'Dantian: Energy expansion visualization', 'Flow: 5 min tai chi-like movement'] },
        { level: 4, daysToComplete: 6, tasks: ['Breathing: 12 min smooth', 'Dantian: Pulsing awareness', 'Stretch: 6 min spinal flow'] },
        { level: 5, daysToComplete: 6, tasks: ['Breathing: 12-13 min', 'Dantian: Link breath and energy consciously', 'Movement: 6 min flow'] },
        { level: 6, daysToComplete: 7, tasks: ['Breathing: 13 min steady', 'Dantian: Awareness of subtle pressure', 'Stretch: 7 min legs & hips'] },
        { level: 7, daysToComplete: 7, tasks: ['Breathing: 14 min long exhale', 'Dantian: Gentle orbit visualization', 'Flow: 7 min slow breathing movement'] },
        { level: 8, daysToComplete: 7, tasks: ['Breathing: 14 min rhythmic', 'Dantian: Spiral movement sensing', 'Stretch: 7 min full body'] },
        { level: 9, daysToComplete: 8, tasks: ['Breathing: 15 min', 'Dantian: Energy rotation awareness', 'Movement: 8 min steady flow'] },
        { level: 10, daysToComplete: 8, tasks: ['Breathing: 15 min mastery', 'Dantian: Controlled pulse & expansion', 'Stretch: 8 min relaxation'] },
      ],
    },
    {
      tier: 'C',
      title: 'Flow Initiate',
      lore: '💨 Energy begins to circulate freely through your breath and motion.',
      subLevels: [
        { level: 1, daysToComplete: 6, tasks: ['Standing meditation: 8 min', 'Dantian breathing: 6 min', 'Flow: 5 min mindful movement'] },
        { level: 2, daysToComplete: 6, tasks: ['Standing meditation: 9 min', 'Dantian: Energy pooling at core', 'Stretch: 5 min'] },
        { level: 3, daysToComplete: 7, tasks: ['Standing meditation: 9 min', 'Flow: 6 min wave motion', 'Gratitude: 2 notes'] },
        { level: 4, daysToComplete: 7, tasks: ['Breathing: 10 min slow rhythm', 'Dantian: Pulsing with inhale/exhale', 'Flow: 6 min breath-led motion'] },
        { level: 5, daysToComplete: 7, tasks: ['Standing meditation: 10 min', 'Flow: 7 min tai chi or qigong motion'] },
        { level: 6, daysToComplete: 8, tasks: ['Breathing: 11 min deep', 'Dantian: Visualize orbit', 'Stretch: 6 min flexibility work'] },
        { level: 7, daysToComplete: 8, tasks: ['Standing meditation: 11 min', 'Dantian: Subtle energy sensing', 'Movement: 7 min free flow'] },
        { level: 8, daysToComplete: 8, tasks: ['Breathing: 12 min full body', 'Flow: 7 min moving meditation'] },
        { level: 9, daysToComplete: 9, tasks: ['Breathing: 12 min rhythmic', 'Flow: 8 min', 'Dantian: Deep connection'] },
        { level: 10, daysToComplete: 9, tasks: ['Breathing: 12-13 min', 'Flow: 8 min', 'Stretch: 8 min cooldown'] },
      ],
    },
    {
      tier: 'C+',
      title: 'Inner Current Adept',
      lore: '🌊 You guide your internal currents like rivers flowing through still mountains.',
      subLevels: [
        { level: 1, daysToComplete: 7, tasks: ['Breathing: 12 min slow', 'Orbit visualization: 3 min', 'Flow: 8 min movement'] },
        { level: 2, daysToComplete: 7, tasks: ['Standing meditation: 12 min', 'Flow: 8 min', 'Stretch: 8 min hips'] },
        { level: 3, daysToComplete: 8, tasks: ['Breathing: 13 min deep calm', 'Dantian: Energy orbit 4 min', 'Movement: 8 min'] },
        { level: 4, daysToComplete: 8, tasks: ['Standing meditation: 13 min aligned', 'Flow: 9 min breath sync'] },
        { level: 5, daysToComplete: 8, tasks: ['Breathing: 14 min controlled', 'Orbit: 4 min focused path'] },
        { level: 6, daysToComplete: 9, tasks: ['Breathing: 14 min smooth', 'Movement: 9 min grounded flow'] },
        { level: 7, daysToComplete: 9, tasks: ['Breathing: 14-15 min', 'Orbit: 5 min strong flow'] },
        { level: 8, daysToComplete: 9, tasks: ['Standing meditation: 15 min calm', 'Flow: 9 min spiral motion'] },
        { level: 9, daysToComplete: 10, tasks: ['Breathing: 15 min deep', 'Orbit: 5 min awareness', 'Stretch: 9 min release'] },
        { level: 10, daysToComplete: 10, tasks: ['Breathing: 15 min mastery', 'Flow: 10 min', 'Orbit: Full energy loop'] },
      ],
    },
    {
      tier: 'B',
      title: 'Energy Conductor',
      lore: '⚡ You command the breath and energy as one current — power in calm motion.',
      subLevels: [
        { level: 1, daysToComplete: 8, tasks: ['Microcosmic orbit: 5 min', 'Standing meditation: 10 min', 'Flow: 8 min'] },
        { level: 2, daysToComplete: 8, tasks: ['Orbit: 6 min', 'Breathing: 12 min', 'Flow: 8 min'] },
        { level: 3, daysToComplete: 9, tasks: ['Orbit: 6 min', 'Flow: 9 min dynamic', 'Stretch: 8 min'] },
        { level: 4, daysToComplete: 9, tasks: ['Breathing: 13 min smooth', 'Orbit: 7 min', 'Flow: 9 min'] },
        { level: 5, daysToComplete: 9, tasks: ['Standing meditation: 13 min', 'Orbit: 7 min', 'Flow: 10 min'] },
        { level: 6, daysToComplete: 10, tasks: ['Breathing: 14 min steady', 'Orbit: 8 min full loop'] },
        { level: 7, daysToComplete: 10, tasks: ['Breathing: 14 min', 'Flow: 10 min smooth transitions'] },
        { level: 8, daysToComplete: 10, tasks: ['Orbit: 8 min full cycle', 'Flow: 10 min deep movement'] },
        { level: 9, daysToComplete: 11, tasks: ['Breathing: 15 min continuous', 'Orbit: 9 min mastery'] },
        { level: 10, daysToComplete: 11, tasks: ['Microcosmic orbit: 10 min', 'Flow: 10 min integration'] },
      ],
    },
    {
      tier: 'A',
      title: 'Qi Sage',
      lore: '💎 Breath, movement, and energy have become one continuous thread of life.',
      subLevels: [
        { level: 1, daysToComplete: 10, tasks: ['Orbit: 10 min mastery', 'Standing meditation: 15 min stillness'] },
        { level: 2, daysToComplete: 10, tasks: ['Orbit: 10 min deep control', 'Flow: 10 min grace'] },
        { level: 3, daysToComplete: 11, tasks: ['Orbit: 11 min', 'Breathing: 15 min perfection'] },
        { level: 4, daysToComplete: 11, tasks: ['Orbit: 11 min full loop', 'Standing meditation: 15 min silence'] },
        { level: 5, daysToComplete: 11, tasks: ['Orbit: 12 min integration', 'Flow: 10 min deep relaxation'] },
        { level: 6, daysToComplete: 12, tasks: ['Orbit: 12 min', 'Breathing: 15 min focused'] },
        { level: 7, daysToComplete: 12, tasks: ['Orbit: 13 min subtle awareness'] },
        { level: 8, daysToComplete: 12, tasks: ['Orbit: 13 min deep calm', 'Meditation: 15 min'] },
        { level: 9, daysToComplete: 13, tasks: ['Orbit: 14 min inner silence'] },
        { level: 10, daysToComplete: 13, tasks: ['Orbit: 15 min full-body energy harmonization'] },
      ],
    },
    {
      tier: 'S',
      title: 'True Cultivator',
      lore: '🌕 Your energy flows like nature itself — effortless, radiant, alive.',
      subLevels: [
        { level: 1, daysToComplete: 12, tasks: ['Full orbit: 15 min', 'Meditation: 15 min stillness'] },
        { level: 2, daysToComplete: 12, tasks: ['Orbit: 15 min mastery', 'Flow: 10 min living breath'] },
        { level: 3, daysToComplete: 13, tasks: ['Orbit: 15 min continuous', 'Breathing: 15 min seamless'] },
        { level: 4, daysToComplete: 13, tasks: ['Orbit: 16 min flow', 'Meditation: 15 min deep silence'] },
        { level: 5, daysToComplete: 13, tasks: ['Orbit: 16 min', 'Flow: 10 min dynamic stillness'] },
        { level: 6, daysToComplete: 14, tasks: ['Orbit: 17 min', 'Breathing: 15 min perfect rhythm'] },
        { level: 7, daysToComplete: 14, tasks: ['Orbit: 17 min smooth', 'Flow: 10 min freedom'] },
        { level: 8, daysToComplete: 14, tasks: ['Orbit: 18 min seamless'] },
        { level: 9, daysToComplete: 15, tasks: ['Orbit: 18 min', 'Meditation: 15 min silence'] },
        { level: 10, daysToComplete: 15, tasks: ['Orbit: 20 min mastery', 'Flow: 10 min grace'] },
      ],
    },
    {
      tier: 'SS',
      title: 'Heaven-Earth Bridge',
      lore: '☯️ You become the channel between Heaven and Earth — balanced, whole, radiant.',
      subLevels: [
        { level: 1, daysToComplete: 15, tasks: ['Orbit: 20 min mastery', 'Still meditation: 20 min unity awareness'] },
        { level: 2, daysToComplete: 15, tasks: ['Orbit: 20 min full loop', 'Flow: 10 min effortless motion'] },
        { level: 3, daysToComplete: 16, tasks: ['Orbit: 21 min natural rhythm', 'Meditation: 20 min'] },
        { level: 4, daysToComplete: 16, tasks: ['Orbit: 22 min seamless', 'Breathing: 20 min'] },
        { level: 5, daysToComplete: 16, tasks: ['Orbit: 22 min perfection', 'Meditation: 20 min'] },
        { level: 6, daysToComplete: 17, tasks: ['Orbit: 23 min silence', 'Flow: 10 min grace'] },
        { level: 7, daysToComplete: 17, tasks: ['Orbit: 23 min unity', 'Meditation: 20 min stillness'] },
        { level: 8, daysToComplete: 17, tasks: ['Orbit: 24 min harmony'] },
        { level: 9, daysToComplete: 18, tasks: ['Orbit: 24 min luminous calm'] },
        { level: 10, daysToComplete: 18, tasks: ['Orbit: 25 min, total integration of mind-body-energy'] },
      ],
    },
  ],
};


export const BODYSMITH_DEFINITION: DetailedIdentityDefinition = {
  id: 2,
  name: 'Bodysmith',
  description:
    'Forge strength, mobility, and control through progressive movement that restores the body and refines physical mastery.',
  tiers: [
    {
      tier: 'D',
      title: 'Reawakening Body',
      lore:
        '🏁 You awaken the sleeping body — each step and stretch re-ignites forgotten vitality.',
      subLevels: [
        { level: 1, daysToComplete: 3, tasks: ['Walk 5000 steps', '5-min posture check (spine tall, shoulders relaxed)', 'Ankle circles 2×10 each side'] },
        { level: 2, daysToComplete: 3, tasks: ['Walk 5000 steps', '10-min light stretching', 'Calf raises 2×15'] },
        { level: 3, daysToComplete: 4, tasks: ['Walk 5500 steps', 'Knee stability: wall sits 2×30 s', 'Hip mobility 3 min'] },
        { level: 4, daysToComplete: 4, tasks: ['Walk 5500 steps', 'Horse stance 2×20 s', 'Torso rotations 2×15'] },
        { level: 5, daysToComplete: 5, tasks: ['Walk 6000 steps', 'Posture reset every 2 h', 'Ankle mobility 3 min'] },
        { level: 6, daysToComplete: 5, tasks: ['Walk 6000 steps', 'Horse stance 2×30 s', 'Light squats 2×10'] },
        { level: 7, daysToComplete: 5, tasks: ['Walk 6500 steps', 'Knee control: slow squats 2×8', 'Shoulder rolls 2×15'] },
        { level: 8, daysToComplete: 5, tasks: ['Walk 6500 steps', 'Horse stance 3×30 s', 'Plank hold 20 s×2'] },
        { level: 9, daysToComplete: 6, tasks: ['Walk 7000 steps', 'Mobility flow (hips/shoulders) 8 min', 'Horse stance 3×40 s'] },
        { level: 10, daysToComplete: 6, tasks: ['Walk 7000 steps', 'Stretch full body 10 min', 'Breathing 5 min'] }
      ]
    },
    {
      tier: 'D+',
      title: 'Foundation Builder',
      lore:
        '🧱 You start laying down real foundations — balance, posture, and stamina combine into discipline.',
      subLevels: [
        { level: 1, daysToComplete: 5, tasks: ['Walk 7000 steps', 'Horse stance 3×40 s', 'Core: dead bug 2×10'] },
        { level: 2, daysToComplete: 5, tasks: ['Walk 7500 steps', 'Light jog 5 min', 'Plank 30 s×2'] },
        { level: 3, daysToComplete: 6, tasks: ['Walk 7500 steps', 'Horse stance 3×45 s', 'Side planks 20 s×2'] },
        { level: 4, daysToComplete: 6, tasks: ['Walk 8000 steps', 'Balance single leg 30 s each', 'Core twists 2×15'] },
        { level: 5, daysToComplete: 6, tasks: ['Walk 8000 steps', 'Jog 6 min', 'Stretch calves & hips 5 min'] },
        { level: 6, daysToComplete: 6, tasks: ['Walk 8500 steps', 'Horse stance 3×50 s', 'Wall sits 2×45 s'] },
        { level: 7, daysToComplete: 7, tasks: ['Walk 8500 steps', 'Jog 7 min', 'Mobility flow 10 min'] },
        { level: 8, daysToComplete: 7, tasks: ['Walk 9000 steps', 'Plank 40 s×2', 'Shoulder stability 2×15'] },
        { level: 9, daysToComplete: 7, tasks: ['Walk 9000 steps', 'Jog 8 min', 'Core: hollow hold 20 s×2'] },
        { level: 10, daysToComplete: 7, tasks: ['Walk 9500 steps', 'Stretch 10 min', 'Breathing reset 5 min'] }
      ]
    },
    {
      tier: 'C',
      title: 'Foundation in Motion',
      lore:
        '🏃 You transition from walking to running — stamina rises, joints align, and the heart strengthens.',
      subLevels: [
        { level: 1, daysToComplete: 6, tasks: ['Walk 10000 steps', 'Light jog 10 min', 'Horse stance 3×50 s'] },
        { level: 2, daysToComplete: 6, tasks: ['Walk 10000 steps', 'Jog 12 min', 'Mobility 10 min'] },
        { level: 3, daysToComplete: 7, tasks: ['Jog 12 min', 'Squats 3×10', 'Stretch 10 min'] },
        { level: 4, daysToComplete: 7, tasks: ['Jog 13 min', 'Horse stance 3×60 s', 'Core 3×12'] },
        { level: 5, daysToComplete: 7, tasks: ['Jog 15 min', 'Mobility + breath 10 min'] },
        { level: 6, daysToComplete: 8, tasks: ['Jog 15 min', 'Rope skipping 2×1 min', 'Squats 3×12'] },
        { level: 7, daysToComplete: 8, tasks: ['Jog 18 min', 'Plank 40 s×2', 'Stretch 10 min'] },
        { level: 8, daysToComplete: 8, tasks: ['Jog 18 min', 'Rope skipping 3×1 min', 'Horse stance 3×60 s'] },
        { level: 9, daysToComplete: 8, tasks: ['Jog 20 min', 'Mobility flow 10 min'] },
        { level: 10, daysToComplete: 8, tasks: ['Jog 20 min', 'Stretch 12 min', 'Breath 5 min'] }
      ]
    },
    {
      tier: 'C+',
      title: 'Moving Furnace',
      lore:
        '🔥 Endurance ignites inner fire — your body becomes responsive, stable, and ready for transformation.',
      subLevels: [
        { level: 1, daysToComplete: 7, tasks: ['Jog 20 min', 'Rope skip 3×1 min', 'Squats 3×12'] },
        { level: 2, daysToComplete: 7, tasks: ['Jog 22 min', 'Horse stance 3×60 s', 'Plank 40 s×2'] },
        { level: 3, daysToComplete: 8, tasks: ['Jog 22 min', 'Rope skip 3×2 min', 'Core 3×12'] },
        { level: 4, daysToComplete: 8, tasks: ['Jog 23 min', 'Balance drill 5 min', 'Stretch 10 min'] },
        { level: 5, daysToComplete: 8, tasks: ['Jog 25 min', 'Squats 3×15', 'Mobility 10 min'] },
        { level: 6, daysToComplete: 9, tasks: ['Jog 25 min', 'Rope skip 4×1 min', 'Core 3×15'] },
        { level: 7, daysToComplete: 9, tasks: ['Jog 25 min', 'Horse stance 3×70 s', 'Stretch 10 min'] },
        { level: 8, daysToComplete: 9, tasks: ['Jog 27 min', 'Rope skip 4×1 min', 'Mobility 10 min'] },
        { level: 9, daysToComplete: 9, tasks: ['Jog 27 min', 'Core 3×15', 'Stretch 12 min'] },
        { level: 10, daysToComplete: 9, tasks: ['Jog 30 min', 'Full flow 15 min'] }
      ]
    },
    {
      tier: 'B',
      title: 'Iron Foundation',
      lore:
        '🦵 Strength replaces fragility — stability and coordination fuse, forming a base of iron.',
      subLevels: [
        { level: 1, daysToComplete: 8, tasks: ['Jog 30 min', 'Rope skip 4×1 min', 'Squats 3×15'] },
        { level: 2, daysToComplete: 8, tasks: ['Jog 30 min', 'Lunges 2×10 each leg', 'Core 3×15'] },
        { level: 3, daysToComplete: 8, tasks: ['Jog 30 min', 'Rope skip 5×1 min', 'Stretch 10 min'] },
        { level: 4, daysToComplete: 9, tasks: ['Jog 30 min', 'Squats 3×20', 'Plank 45 s×2'] },
        { level: 5, daysToComplete: 9, tasks: ['Jog 30 min', 'Horse stance 3×80 s', 'Mobility 10 min'] },
        { level: 6, daysToComplete: 9, tasks: ['Jog 30 min', 'Rope skip 5×1 min', 'Core 3×15'] },
        { level: 7, daysToComplete: 10, tasks: ['Jog 30 min', 'Lunges 2×12 each', 'Stretch 10 min'] },
        { level: 8, daysToComplete: 10, tasks: ['Jog 30 min', 'Squats 3×20', 'Mobility 12 min'] },
        { level: 9, daysToComplete: 10, tasks: ['Jog 30 min', 'Balance 5 min', 'Stretch 10 min'] },
        { level: 10, daysToComplete: 10, tasks: ['Jog 30 min', 'Full body flow 15 min'] }
      ]
    },
    {
      tier: 'B+',
      title: 'Forged Frame',
      lore:
        '⚙️ The body moves as a single machine — strength, control, and fluidity merge.',
      subLevels: [
        { level: 1, daysToComplete: 9, tasks: ['Jog 30 min', 'Rope skip 5×1 min', 'Squats 3×20'] },
        { level: 2, daysToComplete: 9, tasks: ['Jog 30 min', 'Core circuit 10 min', 'Stretch 10 min'] },
        { level: 3, daysToComplete: 9, tasks: ['Jog 30 min', 'Balance & posture 5 min', 'Mobility 10 min'] },
        { level: 4, daysToComplete: 10, tasks: ['Jog 30 min', 'Squats 3×20', 'Rope skip 5×1 min'] },
        { level: 5, daysToComplete: 10, tasks: ['Jog 30 min', 'Plank 50 s×2', 'Mobility 10 min'] },
        { level: 6, daysToComplete: 10, tasks: ['Jog 30 min', 'Rope skip 6×1 min', 'Stretch 12 min'] },
        { level: 7, daysToComplete: 10, tasks: ['Jog 30 min', 'Horse stance 3×90 s', 'Core 3×20'] },
        { level: 8, daysToComplete: 11, tasks: ['Jog 30 min', 'Balance 5 min', 'Mobility 12 min'] },
        { level: 9, daysToComplete: 11, tasks: ['Jog 30 min', 'Rope skip 6×1 min', 'Stretch 12 min'] },
        { level: 10, daysToComplete: 11, tasks: ['Jog 30 min', 'Flow 15 min', 'Breathing 5 min'] }
      ]
    },
    {
      tier: 'A',
      title: 'Body of Power',
      lore:
        '⚡ Explosive control and mind-body unity emerge — each motion radiates intent and mastery.',
      subLevels: [
        { level: 1, daysToComplete: 10, tasks: ['Jog 30 min', 'Pistol squat practice 2×3 each', 'Rope skip 6×1 min'] },
        { level: 2, daysToComplete: 10, tasks: ['Jog 30 min', 'Core 3×20', 'Mobility 12 min'] },
        { level: 3, daysToComplete: 10, tasks: ['Jog 30 min', 'Balance 5 min', 'Plank 60 s×2'] },
        { level: 4, daysToComplete: 11, tasks: ['Jog 30 min', 'Rope skip 6×1 min', 'Horse stance 3×100 s'] },
        { level: 5, daysToComplete: 11, tasks: ['Jog 30 min', 'Squats 3×25', 'Stretch 12 min'] },
        { level: 6, daysToComplete: 11, tasks: ['Jog 30 min', 'Pistol squat practice 3×3 each', 'Mobility 12 min'] },
        { level: 7, daysToComplete: 12, tasks: ['Jog 30 min', 'Rope skip 7×1 min', 'Core circuit 10 min'] },
        { level: 8, daysToComplete: 12, tasks: ['Jog 30 min', 'Balance & posture 5 min', 'Stretch 12 min'] },
        { level: 9, daysToComplete: 12, tasks: ['Jog 30 min', 'Rope skip 7×1 min', 'Mobility 12 min'] },
        { level: 10, daysToComplete: 12, tasks: ['Jog 30 min', 'Integrated flow 15 min', 'Breathing 5 min'] }
      ]
    },
    {
      tier: 'S',
      title: 'Living Engine',
      lore:
        '💨 Movement and stillness merge — energy flows freely through the perfected frame.',
      subLevels: [
        { level: 1, daysToComplete: 12, tasks: ['Jog 30 min', 'Rope skip 7×1 min', 'Flow 15 min'] },
        { level: 2, daysToComplete: 12, tasks: ['Jog 30 min', 'Balance 5 min', 'Stretch 12 min'] },
        { level: 3, daysToComplete: 13, tasks: ['Jog 30 min', 'Rope skip 8×1 min', 'Mobility 12 min'] },
        { level: 4, daysToComplete: 13, tasks: ['Jog 30 min', 'Pistol squat 3×3 each', 'Flow 15 min'] },
        { level: 5, daysToComplete: 13, tasks: ['Jog 30 min', 'Core circuit 12 min', 'Stretch 12 min'] },
        { level: 6, daysToComplete: 13, tasks: ['Jog 30 min', 'Rope skip 8×1 min', 'Breathing 6 min'] },
        { level: 7, daysToComplete: 14, tasks: ['Jog 30 min', 'Flow 15 min', 'Mobility 12 min'] },
        { level: 8, daysToComplete: 14, tasks: ['Jog 30 min', 'Rope skip 8×1 min', 'Balance 5 min'] },
        { level: 9, daysToComplete: 14, tasks: ['Jog 30 min', 'Core 3×20', 'Stretch 12 min'] },
        { level: 10, daysToComplete: 14, tasks: ['Jog 30 min', 'Full flow 20 min', 'Breathing 6 min'] }
      ]
    },
    {
      tier: 'S+',
      title: 'Living Engine+',
      lore: '💨 Energy flows effortlessly — body and mind operate as one refined machine.',
      subLevels: [
        { level: 1, daysToComplete: 12, tasks: ['Jog 30 min', 'Rope skip 8×1 min', 'Flow 15 min'] },
        { level: 2, daysToComplete: 12, tasks: ['Jog 30 min', 'Balance 5 min', 'Stretch 12 min'] },
        { level: 3, daysToComplete: 13, tasks: ['Jog 30 min', 'Rope skip 9×1 min', 'Mobility 12 min'] },
        { level: 4, daysToComplete: 13, tasks: ['Jog 30 min', 'Pistol squat 3×4 each', 'Flow 15 min'] },
        { level: 5, daysToComplete: 13, tasks: ['Jog 30 min', 'Core circuit 12 min', 'Stretch 12 min'] },
        { level: 6, daysToComplete: 13, tasks: ['Jog 30 min', 'Rope skip 9×1 min', 'Breathing 6 min'] },
        { level: 7, daysToComplete: 14, tasks: ['Jog 30 min', 'Flow 15 min', 'Mobility 12 min'] },
        { level: 8, daysToComplete: 14, tasks: ['Jog 30 min', 'Rope skip 9×1 min', 'Balance 5 min'] },
        { level: 9, daysToComplete: 14, tasks: ['Jog 30 min', 'Core 3×25', 'Stretch 12 min'] },
        { level: 10, daysToComplete: 14, tasks: ['Jog 30 min', 'Full flow 20 min', 'Breathing 6 min'] }
      ]
    },
    {
      tier: 'SS',
      title: 'Titan Frame',
      lore: '🏛️ Your body is a fortress — power, balance, and grace coexist seamlessly.',
      subLevels: [
        { level: 1, daysToComplete: 13, tasks: ['Jog 30 min', 'Rope skip 9×1 min', 'Flow 20 min'] },
        { level: 2, daysToComplete: 13, tasks: ['Jog 30 min', 'Pistol squat 3×4 each', 'Mobility 12 min'] },
        { level: 3, daysToComplete: 13, tasks: ['Jog 30 min', 'Rope skip 9×1 min', 'Stretch 12 min'] },
        { level: 4, daysToComplete: 14, tasks: ['Jog 30 min', 'Core circuit 15 min', 'Balance 5 min'] },
        { level: 5, daysToComplete: 14, tasks: ['Jog 30 min', 'Flow 20 min', 'Horse stance 3×100 s'] },
        { level: 6, daysToComplete: 14, tasks: ['Jog 30 min', 'Rope skip 10×1 min', 'Core 3×25'] },
        { level: 7, daysToComplete: 14, tasks: ['Jog 30 min', 'Pistol squat 3×4 each', 'Stretch 12 min'] },
        { level: 8, daysToComplete: 15, tasks: ['Jog 30 min', 'Full flow 20 min', 'Breathing 6 min'] },
        { level: 9, daysToComplete: 15, tasks: ['Jog 30 min', 'Rope skip 10×1 min', 'Balance 5 min'] },
        { level: 10, daysToComplete: 15, tasks: ['Jog 30 min', 'Integrated flow 25 min', 'Core 3×25'] }
      ]
    },
    {
      tier: 'SS+',
      title: 'Colossus Form',
      lore: '🌋 Unstoppable and fluid — the body adapts instantly, powerful yet effortless.',
      subLevels: [
        { level: 1, daysToComplete: 14, tasks: ['Jog 30 min', 'Rope skip 10×1 min', 'Flow 20 min'] },
        { level: 2, daysToComplete: 14, tasks: ['Jog 30 min', 'Pistol squat 4×4 each', 'Core circuit 15 min'] },
        { level: 3, daysToComplete: 14, tasks: ['Jog 30 min', 'Balance 5 min', 'Stretch 12 min'] },
        { level: 4, daysToComplete: 15, tasks: ['Jog 30 min', 'Full flow 25 min', 'Breathing 6 min'] },
        { level: 5, daysToComplete: 15, tasks: ['Jog 30 min', 'Rope skip 10×1 min', 'Horse stance 3×110 s'] },
        { level: 6, daysToComplete: 15, tasks: ['Jog 30 min', 'Core 3×30', 'Stretch 12 min'] },
        { level: 7, daysToComplete: 15, tasks: ['Jog 30 min', 'Pistol squat 4×4 each', 'Flow 20 min'] },
        { level: 8, daysToComplete: 16, tasks: ['Jog 30 min', 'Rope skip 10×1 min', 'Mobility 12 min'] },
        { level: 9, daysToComplete: 16, tasks: ['Jog 30 min', 'Integrated flow 25 min', 'Balance 5 min'] },
        { level: 10, daysToComplete: 16, tasks: ['Jog 30 min', 'Full flow 30 min', 'Breathing 6 min'] }
      ]
    },
    {
      tier: 'SSS',
      title: 'Ascendant Body',
      lore: '🌌 Transcendent mastery — every motion is precise, effortless, and perfect.',
      subLevels: [
        { level: 1, daysToComplete: 15, tasks: ['Jog 30 min', 'Rope skip 10×1 min', 'Full flow 30 min'] },
        { level: 2, daysToComplete: 15, tasks: ['Jog 30 min', 'Pistol squat 4×5 each', 'Core circuit 15 min'] },
        { level: 3, daysToComplete: 15, tasks: ['Jog 30 min', 'Balance 5 min', 'Stretch 12 min'] },
        { level: 4, daysToComplete: 16, tasks: ['Jog 30 min', 'Integrated flow 30 min', 'Breathing 6 min'] },
        { level: 5, daysToComplete: 16, tasks: ['Jog 30 min', 'Rope skip 10×1 min', 'Horse stance 3×120 s'] },
        { level: 6, daysToComplete: 16, tasks: ['Jog 30 min', 'Core 3×30', 'Stretch 12 min'] },
        { level: 7, daysToComplete: 16, tasks: ['Jog 30 min', 'Pistol squat 4×5 each', 'Flow 25 min'] },
        { level: 8, daysToComplete: 17, tasks: ['Jog 30 min', 'Rope skip 10×1 min', 'Mobility 12 min'] },
        { level: 9, daysToComplete: 17, tasks: ['Jog 30 min', 'Full flow 30 min', 'Balance 5 min'] },
        { level: 10, daysToComplete: 17, tasks: ['Jog 30 min', 'Integrated flow 35 min', 'Breathing 6 min'] }
      ]
    },
  ],
};



// Complete 13-tier Journalist definition
export const JOURNALIST_DEFINITION: DetailedIdentityDefinition = {
  id: 3,
  name: 'Journalist',
  description: 'Path to awareness, planning, reflection, gratitude, foresight, and life mastery through daily intentional practice.',
  tiers: [
      {
        "tier": "D",
        "title": "Inner Seeker",
        "lore": "🪞 Begin noticing your inner world and simple daily patterns.",
        "subLevels": [
          { "level": 1, "daysToComplete": 5, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 1 sentence", "Journal 1 free thought", "List 1 thing grateful for"] },
          { "level": 2, "daysToComplete": 5, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 1 sentence", "Journal 2 free thoughts", "List 1 thing grateful for"] },
          { "level": 3, "daysToComplete": 6, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 1 sentence", "Journal 2 thoughts focusing on how you feel", "List 1 thing grateful for", "Add 1 item to log lists"] },
          { "level": 4, "daysToComplete": 6, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 1 sentence", "Journal 3 thoughts focusing on emotions", "List 1 thing grateful for", "Add 1 item to log lists"] },
          { "level": 5, "daysToComplete": 6, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 1 sentence", "Journal 3 thoughts noticing patterns in feelings", "List 1 thing grateful for", "Add 1 item to log lists"] },
          { "level": 6, "daysToComplete": 6, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 1 sentence", "Journal 3-4 thoughts about intentions for the day", "List 2 things grateful for", "Add 1 item to log lists"] },
          { "level": 7, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 1 sentence", "Journal 4 thoughts focusing on reactions and emotions", "List 2 things grateful for", "Add 1 item to log lists"] },
          { "level": 8, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 2 sentence reflection", "Journal 4 thoughts noticing triggers or patterns", "List 2 things grateful for", "Add 1 item to log lists"] },
          { "level": 9, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 2 sentence reflection", "Journal 4-5 thoughts focusing on lessons learned", "List 3 things grateful for", "Add 1 item to log lists"] },
          { "level": 10, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 2 sentence reflection", "Journal 5 thoughts on emotions, intentions, and insights", "List 3 things grateful for", "Add 1 item to log lists"] }
        ]
      },
      {
        "tier": "D+",
        "title": "Reflective Tracker",
        "lore": "📝 Deepen awareness and begin connecting patterns over days.",
        "subLevels": [
          { "level": 1, "daysToComplete": 6, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 2 sentence reflection", "Journal 5 thoughts on feelings and intentions", "List 3 things grateful for", "Add 1 item to log lists"] },
          { "level": 2, "daysToComplete": 6, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 2 sentence reflection", "Journal 5 thoughts identifying patterns in behavior", "List 3 things grateful for", "Add 1 item to log lists"] },
          { "level": 3, "daysToComplete": 6, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 2 sentence reflection", "Journal 5-6 thoughts focusing on emotional triggers", "List 3 things grateful for", "Add 1 item to log lists"] },
          { "level": 4, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 2 sentence reflection", "Journal 6 thoughts exploring responses to events", "List 4 things grateful for", "Add 1 item to log lists"] },
          { "level": 5, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 2 sentence reflection", "Journal 6 thoughts identifying patterns and insights", "List 4 things grateful for", "Add 1 item to log lists"] },
          { "level": 6, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 3 sentence reflection", "Journal 6-7 thoughts on lessons and intentions", "List 4 things grateful for", "Add 1 item to log lists"] },
          { "level": 7, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 3 sentence reflection", "Journal 7 thoughts connecting multiple insights", "List 4 things grateful for", "Add 1 item to log lists"] },
          { "level": 8, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 3 sentence reflection", "Journal 7 thoughts exploring decisions and emotions", "List 4-5 things grateful for", "Add 1 item to log lists"] },
          { "level": 9, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 3 sentence reflection", "Journal 8 thoughts analyzing daily actions and patterns", "List 5 things grateful for", "Add 1 item to log lists"] },
          { "level": 10, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 3 sentence reflection", "Journal 8 thoughts focusing on emotions, insights, and patterns", "List 5 things grateful for", "Add 1 item to log lists"] }
        ]
      },
      {
        "tier": "C",
        "title": "Consistent Observer",
        "lore": "🔍 Strengthen reflection and start noticing deeper connections in daily life.",
        "subLevels": [
          { "level": 1, "daysToComplete": 6, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 3 sentence reflection", "Journal 8 thoughts focusing on emotions and events", "List 5 things grateful for", "Add 1 item to log lists"] },
          { "level": 2, "daysToComplete": 6, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 3 sentence reflection", "Journal 8 thoughts exploring intentions and reactions", "List 5 things grateful for", "Add 1 item to log lists"] },
          { "level": 3, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 3 sentence reflection", "Journal 9 thoughts analyzing patterns in emotions", "List 5 things grateful for", "Add 1 item to log lists"] },
          { "level": 4, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 3 sentence reflection", "Journal 9 thoughts exploring lessons from the day", "List 5-6 things grateful for", "Add 1 item to log lists"] },
          { "level": 5, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 4 sentence reflection", "Journal 10 thoughts connecting emotions, intentions, and events", "List 6 things grateful for", "Add 1 item to log lists"] },
          { "level": 6, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 4 sentence reflection", "Journal 10 thoughts with guiding questions about growth", "List 6 things grateful for", "Add 1 item to log lists"] },
          { "level": 7, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 4 sentence reflection", "Journal 11 thoughts on insights and patterns", "List 6 things grateful for", "Add 1 item to log lists"] },
          { "level": 8, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 4 sentence reflection", "Journal 11 thoughts connecting patterns and intentions", "List 6-7 things grateful for", "Add 1 item to log lists"] },
          { "level": 9, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 4 sentence reflection", "Journal 12 thoughts with guided questions on actions and feelings", "List 7 things grateful for", "Add 1 item to log lists"] },
          { "level": 10, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 5 sentence reflection", "Journal 12 thoughts focusing on lessons, emotions, and intentions", "List 7 things grateful for", "Add 1 item to log lists"] }
        ]
      },
      {
      "tier": "C+",
      "title": "Deep Observer",
      "lore": "🔎 Begin noticing subtle patterns and your inner world with clarity.",
      "subLevels": [
        { "level": 1, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 1 sentence reflection", "Journal 1 paragraph on any thought or feeling", "Add 1 item to log lists"] },
        { "level": 2, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 1 word, evening 1 sentence reflection", "Journal 1 paragraph exploring causes of feelings", "Add 1 item to log lists"] },
        { "level": 3, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 2 words, evening 2 sentence reflection", "Journal 1 paragraph analyzing a recurring theme", "Add 1 item to log lists"] },
        { "level": 4, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 2 words, evening 2 sentence reflection", "Journal 1-2 paragraphs reflecting on behavior and reactions", "Add 1 item to log lists"] },
        { "level": 5, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 3 words, evening 3 sentence reflection", "Journal 2 paragraphs on personal insights and lessons", "Add 1 item to log lists"] },
        { "level": 6, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 3 words, evening 1 paragraph reflection", "Journal 2 paragraphs freely exploring emotions and thoughts", "Add 1 item to log lists"] },
        { "level": 7, "daysToComplete": 7, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal 2-3 paragraphs connecting patterns and feelings", "Add 1 item to log lists"] },
        { "level": 8, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal 3 paragraphs expanding on insights and lessons", "Add 1 item to log lists"] },
        { "level": 9, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form, 3+ paragraphs on experiences and reflections", "Add 1 item to log lists"] },
        { "level": 10, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form, entire page(s) exploring growth and insights", "Add 1 item to log lists"] }
      ]
    },
    {
      "tier": "B",
      "title": "Pattern Analyst",
      "lore": "🧠 Observe connections, deepen understanding of inner and outer patterns.",
      "subLevels": [
        { "level": 1, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 1 paragraph focusing on emerging patterns", "Add 1 item to log lists"] },
        { "level": 2, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 2 paragraphs exploring emotional responses", "Add 1 item to log lists"] },
        { "level": 3, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 2-3 paragraphs noticing recurring themes", "Add 1 item to log lists"] },
        { "level": 4, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 3 paragraphs connecting actions, emotions, patterns", "Add 1 item to log lists"] },
        { "level": 5, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 3 paragraphs reflecting on lessons and growth", "Add 1 item to log lists"] },
        { "level": 6, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 3-4 paragraphs analyzing causes, triggers, patterns", "Add 1 item to log lists"] },
        { "level": 7, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 4 paragraphs linking insights and experiences", "Add 1 item to log lists"] },
        { "level": 8, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 4+ paragraphs exploring personal growth deeply", "Add 1 item to log lists"] },
        { "level": 9, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form multiple paragraphs reflecting on patterns, lessons, emotions", "Add 1 item to log lists"] },
        { "level": 10, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form multiple pages on insights, patterns, and personal evolution", "Add 1 item to log lists"] }
      ]
    },
    {
      "tier": "B+",
      "title": "Life Pattern Master",
      "lore": "🌌 Notice subtle connections shaping your life and awareness.",
      "subLevels": [
        { "level": 1, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 1 paragraph observing daily life patterns", "Add 1 item to log lists"] },
        { "level": 2, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 2 paragraphs connecting experiences and emotions", "Add 1 item to log lists"] },
        { "level": 3, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 2-3 paragraphs exploring recurring patterns", "Add 1 item to log lists"] },
        { "level": 4, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 3 paragraphs analyzing personal growth trends", "Add 1 item to log lists"] },
        { "level": 5, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 3-4 paragraphs reflecting on lessons and insights", "Add 1 item to log lists"] },
        { "level": 6, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 4 paragraphs connecting insights, emotions, and patterns", "Add 1 item to log lists"] },
        { "level": 7, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 4 paragraphs reflecting on long-term patterns", "Add 1 item to log lists"] },
        { "level": 8, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form 4-5 paragraphs synthesizing insights", "Add 1 item to log lists"] },
        { "level": 9, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form multiple paragraphs integrating all patterns and insights", "Add 1 item to log lists"] },
        { "level": 10, "daysToComplete": 8, "tasks": ["Draw 1 Tarot card - morning 4 words, evening 1 paragraph reflection", "Journal free-form multiple pages synthesizing experiences, patterns, and growth", "Add 1 item to log lists"] }
      ]
    }
  ]
};

export const STRATEGIST_DEFINITION: DetailedIdentityDefinition = {
  id: 4,
  name: 'Strategist',
  description: 'Path to strategic planning, taking action and life flow mastery.',
  tiers: [
      {
        "tier": "D",
        "title": "First Steps Planner",
        "lore": "🗺️ Begin planning your days with small intentional tasks.",
        "subLevels": [
          { "level": 1, "daysToComplete": 5, "tasks": ["Plan 1 task for tomorrow", "Review plan in morning adjusting for energy"] },
          { "level": 2, "daysToComplete": 5, "tasks": ["Plan 2 tasks for tomorrow", "Review plan in morning adjusting for energy"] },
          { "level": 3, "daysToComplete": 6, "tasks": ["Plan 2-3 tasks for tomorrow", "Review plan in morning adjusting for energy"] },
          { "level": 4, "daysToComplete": 6, "tasks": ["Plan 3 tasks for tomorrow", "Prioritize tasks", "Review plan in morning adjusting for energy"] },
          { "level": 5, "daysToComplete": 6, "tasks": ["Plan 3 tasks for tomorrow", "Set task priority", "Review plan in morning adjusting for energy"] },
          { "level": 6, "daysToComplete": 6, "tasks": ["Plan 3-4 tasks for tomorrow", "Set task priority", "Include at least 1 rest/recovery block", "Review plan in morning adjusting for energy"] },
          { "level": 7, "daysToComplete": 7, "tasks": ["Plan 4 tasks for tomorrow", "Set task priority", "Include rest/recovery block", "Review plan in morning adjusting for energy"] },
          { "level": 8, "daysToComplete": 7, "tasks": ["Plan 4 tasks for tomorrow", "Set priority and estimated time per task", "Include rest/recovery block", "Review plan in morning adjusting for energy"] },
          { "level": 9, "daysToComplete": 7, "tasks": ["Plan 4-5 tasks for tomorrow", "Set priority and estimated time", "Include rest/recovery block", "Review plan in morning adjusting for energy"] },
          { "level": 10, "daysToComplete": 7, "tasks": ["Plan 5 tasks for tomorrow", "Set priority and estimated time", "Include rest/recovery block", "Review plan in morning adjusting for energy"] }
        ]
      },
      {
        "tier": "D+",
        "title": "Daily Architect",
        "lore": "🛠️ Expand daily planning with priority and sequencing.",
        "subLevels": [
          { "level": 1, "daysToComplete": 5, "tasks": ["Plan 3 tasks for tomorrow", "Assign priority", "Review plan in morning adjusting for energy"] },
          { "level": 2, "daysToComplete": 5, "tasks": ["Plan 3-4 tasks for tomorrow", "Assign priority", "Review plan in morning adjusting for energy"] },
          { "level": 3, "daysToComplete": 6, "tasks": ["Plan 4 tasks for tomorrow", "Assign priority and estimated time", "Review plan in morning adjusting for energy"] },
          { "level": 4, "daysToComplete": 6, "tasks": ["Plan 4 tasks for tomorrow", "Sequence tasks logically", "Include rest/recovery block", "Review plan in morning adjusting for energy"] },
          { "level": 5, "daysToComplete": 6, "tasks": ["Plan 4-5 tasks for tomorrow", "Sequence tasks logically", "Include rest/recovery block", "Review plan in morning adjusting for energy"] },
          { "level": 6, "daysToComplete": 6, "tasks": ["Plan 5 tasks for tomorrow", "Sequence tasks logically", "Include rest/recovery block", "Review plan in morning adjusting for energy"] },
          { "level": 7, "daysToComplete": 7, "tasks": ["Plan 5 tasks for tomorrow", "Sequence tasks logically", "Include at least 1 weekly milestone check", "Review plan in morning adjusting for energy"] },
          { "level": 8, "daysToComplete": 7, "tasks": ["Plan 5-6 tasks for tomorrow", "Sequence tasks and allocate time", "Include weekly milestone check", "Review plan in morning adjusting for energy"] },
          { "level": 9, "daysToComplete": 7, "tasks": ["Plan 6 tasks for tomorrow", "Sequence tasks and allocate time", "Include weekly milestone check", "Review plan in morning adjusting for energy"] },
          { "level": 10, "daysToComplete": 7, "tasks": ["Plan 6 tasks for tomorrow", "Sequence tasks and allocate time", "Include weekly milestone check", "Review plan in morning adjusting for energy"] }
        ]
      },
      {
        "tier": "C",
        "title": "Action Architect",
        "lore": "📊 Combine daily planning into multi-day strategies and small projects.",
        "subLevels": [
          { "level": 1, "daysToComplete": 6, "tasks": ["Plan 4-5 tasks for tomorrow", "Assign priority and estimated time", "Review plan in morning adjusting for energy"] },
          { "level": 2, "daysToComplete": 6, "tasks": ["Plan 5 tasks for tomorrow", "Sequence tasks logically", "Review plan in morning adjusting for energy"] },
          { "level": 3, "daysToComplete": 6, "tasks": ["Plan 5-6 tasks for tomorrow", "Sequence tasks logically", "Start weekly project planning", "Review plan in morning adjusting for energy"] },
          { "level": 4, "daysToComplete": 6, "tasks": ["Plan 6 tasks for tomorrow", "Sequence tasks logically", "Continue weekly project planning", "Include 1 small budget allocation", "Review plan in morning adjusting for energy"] },
          { "level": 5, "daysToComplete": 6, "tasks": ["Plan 6 tasks for tomorrow", "Sequence tasks logically", "Plan small projects", "Include budget allocation", "Review plan in morning adjusting for energy"] },
          { "level": 6, "daysToComplete": 7, "tasks": ["Plan 6-7 tasks for tomorrow", "Sequence tasks logically", "Plan weekly projects with milestones", "Include budget allocation", "Review plan in morning adjusting for energy"] },
          { "level": 7, "daysToComplete": 7, "tasks": ["Plan 7 tasks for tomorrow", "Sequence tasks logically", "Plan weekly projects with milestones", "Allocate resources", "Review plan in morning adjusting for energy"] },
          { "level": 8, "daysToComplete": 7, "tasks": ["Plan 7 tasks for tomorrow", "Sequence tasks logically", "Plan weekly projects with milestones", "Allocate resources and budget", "Review plan in morning adjusting for energy"] },
          { "level": 9, "daysToComplete": 7, "tasks": ["Plan 7-8 tasks for tomorrow", "Sequence tasks logically", "Plan small monthly projects", "Allocate resources and budget", "Review plan in morning adjusting for energy"] },
          { "level": 10, "daysToComplete": 7, "tasks": ["Plan 8 tasks for tomorrow", "Sequence tasks logically", "Plan small monthly projects", "Allocate resources and budget", "Review plan in morning adjusting for energy"] }
        ]
      },
      {
      "tier": "C+",
      "title": "Strategic Planner",
      "lore": "📈 Expand planning across multiple days and projects with clarity and foresight.",
      "subLevels": [
        { "level": 1, "daysToComplete": 7, "tasks": ["Plan 7 tasks for tomorrow", "Sequence tasks and allocate time", "Plan weekly project milestones", "Review plan in morning adjusting for energy"] },
        { "level": 2, "daysToComplete": 7, "tasks": ["Plan 7-8 tasks for tomorrow", "Sequence tasks and allocate time", "Plan weekly project milestones", "Include budget considerations", "Review plan in morning adjusting for energy"] },
        { "level": 3, "daysToComplete": 7, "tasks": ["Plan 8 tasks for tomorrow", "Sequence tasks and allocate time", "Plan weekly and bi-weekly projects", "Include budget and resource allocation", "Review plan in morning adjusting for energy"] },
        { "level": 4, "daysToComplete": 7, "tasks": ["Plan 8 tasks for tomorrow", "Sequence tasks and allocate time", "Plan multiple small projects", "Include budget and resource allocation", "Review plan in morning adjusting for energy"] },
        { "level": 5, "daysToComplete": 7, "tasks": ["Plan 8-9 tasks for tomorrow", "Sequence tasks and allocate time", "Plan multiple small projects with milestones", "Include budget and resource allocation", "Review plan in morning adjusting for energy"] },
        { "level": 6, "daysToComplete": 7, "tasks": ["Plan 9 tasks for tomorrow", "Sequence tasks and allocate time", "Plan weekly and monthly projects with milestones", "Include budget and resource allocation", "Review plan in morning adjusting for energy"] },
        { "level": 7, "daysToComplete": 7, "tasks": ["Plan 9 tasks for tomorrow", "Sequence tasks and allocate time", "Plan monthly projects with milestones", "Include budget and resource allocation", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 8, "daysToComplete": 7, "tasks": ["Plan 9-10 tasks for tomorrow", "Sequence tasks and allocate time", "Plan monthly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 9, "daysToComplete": 7, "tasks": ["Plan 10 tasks for tomorrow", "Sequence tasks and allocate time", "Plan monthly and quarterly projects", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 10, "daysToComplete": 7, "tasks": ["Plan 10 tasks for tomorrow", "Sequence tasks and allocate time", "Plan quarterly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] }
      ]
    },
    {
      "tier": "B",
      "title": "Master Scheduler",
      "lore": "🧩 Coordinate multiple projects, tasks, and priorities seamlessly across weeks.",
      "subLevels": [
        { "level": 1, "daysToComplete": 7, "tasks": ["Plan 10 tasks for tomorrow", "Sequence tasks across the week", "Plan weekly projects with milestones", "Allocate budget and resources", "Review plan in morning adjusting for energy"] },
        { "level": 2, "daysToComplete": 7, "tasks": ["Plan 10-11 tasks for tomorrow", "Sequence tasks across the week", "Plan weekly projects with milestones", "Allocate budget and resources", "Set daily priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 3, "daysToComplete": 7, "tasks": ["Plan 11 tasks for tomorrow", "Sequence tasks across the week", "Plan weekly and monthly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 4, "daysToComplete": 7, "tasks": ["Plan 11-12 tasks for tomorrow", "Sequence tasks across the week", "Plan monthly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 5, "daysToComplete": 7, "tasks": ["Plan 12 tasks for tomorrow", "Sequence tasks across the week", "Plan monthly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 6, "daysToComplete": 7, "tasks": ["Plan 12 tasks for tomorrow", "Sequence tasks across multiple weeks", "Plan monthly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 7, "daysToComplete": 7, "tasks": ["Plan 12-13 tasks for tomorrow", "Sequence tasks across multiple weeks", "Plan monthly and quarterly projects", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 8, "daysToComplete": 7, "tasks": ["Plan 13 tasks for tomorrow", "Sequence tasks across multiple weeks", "Plan quarterly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 9, "daysToComplete": 7, "tasks": ["Plan 13 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan quarterly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 10, "daysToComplete": 7, "tasks": ["Plan 14 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan quarterly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] }
      ]
    },
    {
      "tier": "B+",
      "title": "Strategic Orchestrator",
      "lore": "🌌 Integrate all planning layers to navigate weeks and months with precision and adaptability.",
      "subLevels": [
        { "level": 1, "daysToComplete": 7, "tasks": ["Plan 14 tasks for tomorrow", "Sequence tasks across weeks", "Plan monthly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 2, "daysToComplete": 7, "tasks": ["Plan 14-15 tasks for tomorrow", "Sequence tasks across weeks", "Plan monthly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 3, "daysToComplete": 7, "tasks": ["Plan 15 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan monthly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 4, "daysToComplete": 7, "tasks": ["Plan 15 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan quarterly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 5, "daysToComplete": 7, "tasks": ["Plan 15-16 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan quarterly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 6, "daysToComplete": 7, "tasks": ["Plan 16 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan quarterly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 7, "daysToComplete": 7, "tasks": ["Plan 16 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan quarterly and yearly projects", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 8, "daysToComplete": 7, "tasks": ["Plan 16-17 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan quarterly and yearly projects", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 9, "daysToComplete": 7, "tasks": ["Plan 17 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan quarterly and yearly projects", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] },
        { "level": 10, "daysToComplete": 7, "tasks": ["Plan 17-18 tasks for tomorrow", "Sequence tasks across weeks and months", "Plan yearly projects with milestones", "Allocate budget and resources", "Set priorities based on energy", "Review plan in morning adjusting for energy"] }
      ]
    }
  ]
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
    'D': ['Novice Forger 1', 'Novice Forger 2', 'Novice Forger 3', 'Novice Forger 4', 'Novice Forger 5', 'Novice Forger 6', 'Novice Forger 7', 'Novice Forger 8', 'Novice Forger 9', 'Novice Forger 10'],
    'C': ['Iron Apprentice 1', 'Iron Apprentice 2', 'Iron Apprentice 3', 'Iron Apprentice 4', 'Iron Apprentice 5', 'Iron Apprentice 6', 'Iron Apprentice 7', 'Iron Apprentice 8', 'Iron Apprentice 9', 'Iron Apprentice 10'],
    'B': ['Steel Adept 1', 'Steel Adept 2', 'Steel Adept 3', 'Steel Adept 4', 'Steel Adept 5', 'Steel Adept 6', 'Steel Adept 7', 'Steel Adept 8', 'Steel Adept 9', 'Steel Adept 10'],
    'A': ['Alloy Shaper 1', 'Alloy Shaper 2', 'Alloy Shaper 3', 'Alloy Shaper 4', 'Alloy Shaper 5', 'Alloy Shaper 6', 'Alloy Shaper 7', 'Alloy Shaper 8', 'Alloy Shaper 9', 'Alloy Shaper 10'],
    'S': ['Vital Forgemaster 1', 'Vital Forgemaster 2', 'Vital Forgemaster 3', 'Vital Forgemaster 4', 'Vital Forgemaster 5', 'Vital Forgemaster 6', 'Vital Forgemaster 7', 'Vital Forgemaster 8'],
  }
};

// Removed legacy PATHWEAVER template (will be reintroduced in a future version)

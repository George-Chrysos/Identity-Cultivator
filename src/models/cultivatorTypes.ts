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
export type IdentityType = 'CULTIVATOR' | 'BODYSMITH' | 'PATHWEAVER' | 'FITNESS' | 'LEARNING' | 'CREATIVE' | 'SOCIAL';

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
  subLevels: IdentitySubLevel[]; // Always 10 levels per tier in new model
}

export interface DetailedIdentityDefinition {
  id: number;
  name: string;
  description: string;
  tiers: IdentityTierDetail[];
}

// New Cultivator definition - Complete 13-tier system
// New Cultivator definition - Complete 13-tier system
export const CULTIVATOR_DEFINITION: DetailedIdentityDefinition = {
  id: 1,
  name: 'Cultivator',
  description: 'Path to energy cultivation, body awareness, mental focus, and subtle power through daily energy practices.',
  tiers: [
    {
      tier: 'D',
      title: 'Seed Initiate',
      subLevels: [
        { level: 1, daysToComplete: 3, tasks: ['Breathing practice: Sit comfortably, breathe deeply for 5 min','Dantian focus: Place hand on lower belly, feel warmth for 1 min','Gratitude: List 1 thing you\'re grateful for'] },
        { level: 2, daysToComplete: 4, tasks: ['Breathing: Deep belly breaths, 5-6 min','Dantian: Visualize warm energy pooling in lower belly, 1-2 min','Body awareness: Quick scan head to toes, 1 min'] },
        { level: 3, daysToComplete: 4, tasks: ['Breathing: Slow 4-count inhale, 4-count exhale, 6 min','Dantian: Feel warmth expanding with each breath, 2 min','Body scan: Notice any tension, breathe into it, 2 min'] },
        { level: 4, daysToComplete: 5, tasks: ['Breathing: Box breathing (4-4-4-4), 6-7 min','Dantian: Imagine energy spiraling in belly, 2 min','Stretch: Gentle neck rolls, shoulder shrugs, 2 min'] },
        { level: 5, daysToComplete: 5, tasks: ['Breathing: Deep diaphragmatic breathing, 7 min','Dantian: Feel energy building with each breath, 2-3 min','Body scan: Head to toes, release tension, 2 min'] },
        { level: 6, daysToComplete: 6, tasks: ['Breathing: Rhythmic breathing, focus on smoothness, 7-8 min','Dantian: Energy ball visualization, 3 min','Stretch: Hip openers, gentle twists, 3 min'] },
        { level: 7, daysToComplete: 6, tasks: ['Breathing: Pranayama practice (any style), 8 min','Dantian: Energy circulation in lower belly, 3 min','Movement: Gentle swaying while breathing, 3 min'] },
        { level: 8, daysToComplete: 6, tasks: ['Breathing: Extend exhale slightly longer than inhale, 8-9 min','Dantian: Connect breath to energy sensation, 3 min','Stretch: Cat-cow, child\'s pose, 3-4 min'] },
        { level: 9, daysToComplete: 7, tasks: ['Breathing: Full yogic breath (belly-chest-throat), 9 min','Dantian: Energy flows with movement, 3-4 min','Flow: Simple tai chi or qigong movements, 4 min'] },
        { level: 10, daysToComplete: 7, tasks: ['Breathing: 10 min focused practice','Dantian: Integration with breath and movement, 4 min','Stretch: Full body gentle flow, 5 min','Journal: 1 reflection on practice, 1 gratitude'] },
      ],
    },
    {
      tier: 'D+',
      title: 'Awakening Seeker',
      subLevels: [
        { level: 1, daysToComplete: 5, tasks: ['Breathing: 10-11 min deep practice','Dantian: Feel energy warmth consistently, 4 min','Movement: Slow deliberate movements with breath, 4 min','Journal: 1 win from practice'] },
        { level: 2, daysToComplete: 5, tasks: ['Breathing: 11 min, explore different rhythms','Dantian: Energy expansion and contraction, 4 min','Body scan: Notice subtle sensations, 3 min','Stretch: 5 min gentle flow'] },
        { level: 3, daysToComplete: 6, tasks: ['Breathing: 11-12 min','Dantian: Guide energy with intention, 4-5 min','Movement: Coordinated breath + movement, 5 min','Journal: 2 reflections on progress'] },
        { level: 4, daysToComplete: 6, tasks: ['Breathing: 12 min sustained practice','Dantian: Energy spirals and flows, 5 min','Stretch + flow: Hip openers, spinal twists, 5 min','Gratitude: 2 things'] },
        { level: 5, daysToComplete: 6, tasks: ['Breathing: 12-13 min','Dantian: Connect to whole body energy, 5 min','Movement: Slow flowing sequence, 5-6 min','Journal: 2 reflections, 1 lesson'] },
        { level: 6, daysToComplete: 7, tasks: ['Breathing: 13 min','Dantian: Energy cultivation with visualization, 5 min','Flow: Integrated breath-movement, 6 min','Stretch: 6 min full body'] },
        { level: 7, daysToComplete: 7, tasks: ['Breathing: 13-14 min','Dantian: Subtle energy awareness, 5-6 min','Movement: Dynamic yet relaxed flow, 6 min','Journal: 2 reflections, 2 gratitudes'] },
        { level: 8, daysToComplete: 7, tasks: ['Breathing: 14 min','Dantian: Energy + posture alignment, 6 min','Flow: Breath-led movements, 6-7 min','Stretch: 7 min'] },
        { level: 9, daysToComplete: 8, tasks: ['Breathing: 14-15 min','Dantian: Full awareness of energy body, 6 min','Movement: Smooth transitions, 7 min','Journal: 3 reflections, 2 gratitudes'] },
        { level: 10, daysToComplete: 8, tasks: ['Breathing: 15 min mastery','Dantian: Consistent energy cultivation, 6-7 min','Flow: Integrated practice, 7-8 min','Stretch: 8 min','Journal: 3 reflections, 3 gratitudes'] },
      ],
    },
    {
      tier: 'C',
      title: 'Energy Initiate',
      subLevels: [
        { level: 1, daysToComplete: 6, tasks: ['Breathing: 15-16 min practice','Dantian: Energy circulation with intention, 7 min','Movement: Slow stance work + flow, 8 min','Stretch: 8 min','Journal: Practice insights'] },
        { level: 2, daysToComplete: 7, tasks: ['Breathing: 16 min','Dantian: Refine energy awareness, 7 min','Flow: Breath-synchronized movements, 8 min','Stretch: 8-9 min','Gratitude: 3 things'] },
        { level: 3, daysToComplete: 7, tasks: ['Breathing: 17 min','Dantian: Energy + micro-movements, 7-8 min','Movement: Explore different speeds, 9 min','Stretch: 9 min','Journal: 3 reflections'] },
        { level: 4, daysToComplete: 8, tasks: ['Breathing: 17-18 min','Dantian: Consistent energy flow, 8 min','Flow: Integrated full-body practice, 9 min','Stretch: 9-10 min','Journal: 3 reflections, 3 gratitudes'] },
        { level: 5, daysToComplete: 8, tasks: ['Breathing: 18 min','Dantian: Energy with posture refinement, 8 min','Movement: Dynamic flow sequences, 10 min','Stretch: 10 min','Journal: 4 reflections, 3 gratitudes'] },
        { level: 6, daysToComplete: 9, tasks: ['Breathing: 18-19 min','Dantian: Subtle energy cultivation, 8-9 min','Flow: Smooth transitions, 10 min','Stretch: 10 min','Journal: 4 reflections, 4 gratitudes'] },
        { level: 7, daysToComplete: 9, tasks: ['Breathing: 19 min','Dantian: Energy + meditation fusion, 9 min','Movement: Fluid practice, 10-11 min','Stretch: 11 min','Journal: 4 reflections, 4 gratitudes'] },
        { level: 8, daysToComplete: 9, tasks: ['Breathing: 20 min','Dantian: Refined energy work, 9 min','Flow: Breath-led dynamic practice, 11 min','Stretch: 11 min','Journal: 5 reflections, 4 gratitudes'] },
        { level: 9, daysToComplete: 10, tasks: ['Breathing: 20-21 min','Dantian: Deep energy awareness, 9-10 min','Movement: Integrated flow, 11-12 min','Stretch: 12 min','Journal: 5 reflections, 5 gratitudes'] },
        { level: 10, daysToComplete: 10, tasks: ['Breathing: 22 min','Dantian: Consistent cultivation, 10 min','Flow: Masterful breath-movement, 12 min','Stretch: 12 min','Journal: 5 reflections, 5 gratitudes, weekly review'] },
      ],
    },
    {
      tier: 'C+',
      title: 'Rooted Practitioner',
      subLevels: [
        { level: 1, daysToComplete: 8, tasks: ['Breathing: 22-23 min','Dantian: Energy with intent, 10 min','Stance: Horse stance or other foundations, 3 min','Flow: 12 min','Stretch: 12 min','Journal: Weekly goals'] },
        { level: 2, daysToComplete: 9, tasks: ['Breathing: 23 min','Dantian: Consistent daily work, 10 min','Stance: 3-4 min','Flow: 12-13 min','Stretch: 13 min','Gratitude: 5 things'] },
        { level: 3, daysToComplete: 9, tasks: ['Breathing: 24 min','Dantian: Refined awareness, 10-11 min','Stance: 4 min','Flow: 13 min','Stretch: 13 min','Journal: 5 reflections, 5 gratitudes'] },
        { level: 4, daysToComplete: 10, tasks: ['Breathing: 24-25 min','Dantian: Energy + posture, 11 min','Stance: 4-5 min','Flow: 13-14 min','Stretch: 14 min','Journal: 6 reflections'] },
        { level: 5, daysToComplete: 10, tasks: ['Breathing: 25 min','Dantian: Whole body energy, 11 min','Stance: 5 min','Flow: 14 min','Stretch: 14 min','Journal: 6 reflections, 6 gratitudes'] },
        { level: 6, daysToComplete: 11, tasks: ['Breathing: 26 min','Dantian: Subtle cultivation, 11-12 min','Stance: 5 min','Flow: 14-15 min','Stretch: 15 min','Journal: Weekly reflection'] },
        { level: 7, daysToComplete: 11, tasks: ['Breathing: 26-27 min','Dantian: Energy integration, 12 min','Stance: 5-6 min','Flow: 15 min','Stretch: 15 min','Journal: 6 reflections, 6 gratitudes'] },
        { level: 8, daysToComplete: 11, tasks: ['Breathing: 27 min','Dantian: Advanced awareness, 12 min','Stance: 6 min','Flow: 15 min','Stretch: 15-16 min','Journal: 7 reflections'] },
        { level: 9, daysToComplete: 12, tasks: ['Breathing: 28 min','Dantian: Mastery building, 12-13 min','Stance: 6 min','Flow: 16 min','Stretch: 16 min','Journal: 7 reflections, 7 gratitudes'] },
        { level: 10, daysToComplete: 12, tasks: ['Breathing: 28-30 min','Dantian: Consistent mastery, 13 min','Stance: 6-7 min','Flow: 16-17 min','Stretch: 17 min','Journal: 7 reflections, 7 gratitudes, monthly review'] },
      ],
    },
    {
      tier: 'B',
      title: 'Flow Adept',
      subLevels: [
        { level: 1, daysToComplete: 10, tasks: ['Breathing: 30 min practice','Dantian: 13-14 min cultivation','Stance: 7 min','Flow: Dynamic practice, 17 min','Stretch: 17 min','Journal: Monthly goals + weekly review'] },
        { level: 2, daysToComplete: 11, tasks: ['Breathing: 30-31 min','Dantian: 14 min','Stance: 7 min','Flow: 17-18 min','Stretch: 18 min','Journal: 8 reflections, 7 gratitudes'] },
        { level: 3, daysToComplete: 11, tasks: ['Breathing: 31 min','Dantian: 14 min','Stance: 7-8 min','Flow: 18 min','Stretch: 18 min','Journal: Progress tracking'] },
        { level: 4, daysToComplete: 12, tasks: ['Breathing: 32 min','Dantian: 14-15 min','Stance: 8 min','Flow: 18-19 min','Stretch: 19 min','Journal: 8 reflections, 8 gratitudes'] },
        { level: 5, daysToComplete: 12, tasks: ['Breathing: 32-33 min','Dantian: 15 min','Stance: 8 min','Flow: 19 min','Stretch: 19 min','Journal: Quarterly review'] },
        { level: 6, daysToComplete: 13, tasks: ['Breathing: 33 min','Dantian: 15 min','Stance: 8-9 min','Flow: 19-20 min','Stretch: 20 min','Journal: 9 reflections'] },
        { level: 7, daysToComplete: 13, tasks: ['Breathing: 34 min','Dantian: 15-16 min','Stance: 9 min','Flow: 20 min','Stretch: 20 min','Journal: 9 reflections, 9 gratitudes'] },
        { level: 8, daysToComplete: 13, tasks: ['Breathing: 34-35 min','Dantian: 16 min','Stance: 9 min','Flow: 20-21 min','Stretch: 21 min','Journal: Weekly + monthly review'] },
        { level: 9, daysToComplete: 14, tasks: ['Breathing: 35 min','Dantian: 16 min','Stance: 9-10 min','Flow: 21 min','Stretch: 21 min','Journal: 10 reflections, 9 gratitudes'] },
        { level: 10, daysToComplete: 14, tasks: ['Breathing: 36 min','Dantian: 16-17 min','Stance: 10 min','Flow: 22 min','Stretch: 22 min','Journal: 10 reflections, 10 gratitudes, quarterly goals'] },
      ],
    },
    {
      tier: 'B+',
      title: 'Energy Harmonist',
      subLevels: [
        { level: 1, daysToComplete: 12, tasks: ['Breathing: 36-37 min','Dantian: 17 min','Stance: 10 min','Flow: Fluid practice, 22 min','Stretch: 22 min','Meditation: 5 min stillness','Journal: Insights'] },
        { level: 2, daysToComplete: 13, tasks: ['Breathing: 37 min','Dantian: 17 min','Stance: 10 min','Flow: 22-23 min','Stretch: 23 min','Meditation: 5 min','Journal: 10 reflections'] },
        { level: 3, daysToComplete: 13, tasks: ['Breathing: 38 min','Dantian: 17-18 min','Stance: 10-11 min','Flow: 23 min','Stretch: 23 min','Meditation: 6 min','Gratitude: 10 things'] },
        { level: 4, daysToComplete: 14, tasks: ['Breathing: 38-39 min','Dantian: 18 min','Stance: 11 min','Flow: 23-24 min','Stretch: 24 min','Meditation: 6 min','Journal: Practice evolution'] },
        { level: 5, daysToComplete: 14, tasks: ['Breathing: 39 min','Dantian: 18 min','Stance: 11 min','Flow: 24 min','Stretch: 24 min','Meditation: 7 min','Journal: 11 reflections'] },
        { level: 6, daysToComplete: 15, tasks: ['Breathing: 40 min','Dantian: 18-19 min','Stance: 11-12 min','Flow: 24-25 min','Stretch: 25 min','Meditation: 7 min','Journal: Quarterly review'] },
        { level: 7, daysToComplete: 15, tasks: ['Breathing: 40 min','Dantian: 19 min','Stance: 12 min','Flow: 25 min','Stretch: 25 min','Meditation: 8 min','Journal: 11 reflections, 11 gratitudes'] },
        { level: 8, daysToComplete: 15, tasks: ['Breathing: 41 min','Dantian: 19 min','Stance: 12 min','Flow: 25 min','Stretch: 25-26 min','Meditation: 8 min','Journal: Life alignment check'] },
        { level: 9, daysToComplete: 16, tasks: ['Breathing: 41-42 min','Dantian: 19-20 min','Stance: 12-13 min','Flow: 26 min','Stretch: 26 min','Meditation: 9 min','Journal: 12 reflections'] },
        { level: 10, daysToComplete: 16, tasks: ['Breathing: 42 min','Dantian: 20 min','Stance: 13 min','Flow: 26-27 min','Stretch: 27 min','Meditation: 10 min','Journal: 12 reflections, 12 gratitudes, yearly vision'] },
      ],
    },
    {
      tier: 'A',
      title: 'Master Cultivator',
      subLevels: [
        { level: 1, daysToComplete: 14, tasks: ['Breathing: 43 min mastery','Dantian: 20 min deep work','Stance: 13 min solid foundation','Flow: 27 min integrated','Stretch: 27 min','Meditation: 10 min','Journal: Master-level insights'] },
        { level: 2, daysToComplete: 15, tasks: ['Breathing: 43-44 min','Dantian: 20-21 min','Stance: 13-14 min','Flow: 27-28 min','Stretch: 28 min','Meditation: 10 min','Journal: 12 reflections, 12 gratitudes'] },
        { level: 3, daysToComplete: 15, tasks: ['Breathing: 44 min','Dantian: 21 min','Stance: 14 min','Flow: 28 min','Stretch: 28 min','Meditation: 11 min','Journal: Quarterly mastery review'] },
        { level: 4, daysToComplete: 16, tasks: ['Breathing: 45 min','Dantian: 21 min','Stance: 14 min','Flow: 28-29 min','Stretch: 29 min','Meditation: 11 min','Journal: 13 reflections'] },
        { level: 5, daysToComplete: 16, tasks: ['Breathing: 45 min','Dantian: 21-22 min','Stance: 14-15 min','Flow: 29 min','Stretch: 29 min','Meditation: 12 min','Journal: 13 reflections, 13 gratitudes'] },
        { level: 6, daysToComplete: 17, tasks: ['Breathing: 46 min','Dantian: 22 min','Stance: 15 min','Flow: 29-30 min','Stretch: 30 min','Meditation: 12 min','Journal: Life mastery check'] },
        { level: 7, daysToComplete: 17, tasks: ['Breathing: 46-47 min','Dantian: 22 min','Stance: 15 min','Flow: 30 min','Stretch: 30 min','Meditation: 13 min','Journal: 14 reflections'] },
        { level: 8, daysToComplete: 18, tasks: ['Breathing: 47 min','Dantian: 22-23 min','Stance: 15-16 min','Flow: 30 min','Stretch: 30-31 min','Meditation: 13 min','Journal: Yearly review'] },
        { level: 9, daysToComplete: 18, tasks: ['Breathing: 48 min','Dantian: 23 min','Stance: 16 min','Flow: 31 min','Stretch: 31 min','Meditation: 14 min','Journal: 14 reflections, 14 gratitudes'] },
        { level: 10, daysToComplete: 18, tasks: ['Breathing: 48-50 min peak','Dantian: 23-24 min','Stance: 16-17 min','Flow: 31-32 min','Stretch: 32 min','Meditation: 15 min','Journal: 15 reflections, 15 gratitudes, life vision'] },
      ],
    },
    {
      tier: 'A+',
      title: 'Transcendent Adept',
      subLevels: [
        { level: 1, daysToComplete: 16, tasks: ['Breathing: 50 min sustained','Dantian: 24 min','Stance: 17 min','Flow: 32 min mastery','Stretch: 32 min','Meditation: 15 min','Journal: Teaching insights'] },
        { level: 2, daysToComplete: 17, tasks: ['Breathing: 50 min','Dantian: 24 min','Stance: 17 min','Flow: 32-33 min','Stretch: 33 min','Meditation: 15 min','Journal: 15 reflections, 15 gratitudes'] },
        { level: 3, daysToComplete: 17, tasks: ['Breathing: 51 min','Dantian: 24-25 min','Stance: 17-18 min','Flow: 33 min','Stretch: 33 min','Meditation: 16 min','Journal: Mentorship thoughts'] },
        { level: 4, daysToComplete: 18, tasks: ['Breathing: 51-52 min','Dantian: 25 min','Stance: 18 min','Flow: 33-34 min','Stretch: 34 min','Meditation: 16 min','Journal: Quarterly transcendence'] },
        { level: 5, daysToComplete: 18, tasks: ['Breathing: 52 min','Dantian: 25 min','Stance: 18 min','Flow: 34 min','Stretch: 34 min','Meditation: 17 min','Journal: 16 reflections'] },
        { level: 6, daysToComplete: 19, tasks: ['Breathing: 52-53 min','Dantian: 25-26 min','Stance: 18-19 min','Flow: 34-35 min','Stretch: 35 min','Meditation: 17 min','Journal: Life legacy planning'] },
        { level: 7, daysToComplete: 19, tasks: ['Breathing: 53 min','Dantian: 26 min','Stance: 19 min','Flow: 35 min','Stretch: 35 min','Meditation: 18 min','Journal: 16 reflections, 16 gratitudes'] },
        { level: 8, daysToComplete: 19, tasks: ['Breathing: 54 min','Dantian: 26 min','Stance: 19 min','Flow: 35 min','Stretch: 35-36 min','Meditation: 18 min','Journal: Yearly mastery review'] },
        { level: 9, daysToComplete: 20, tasks: ['Breathing: 54-55 min','Dantian: 26-27 min','Stance: 19-20 min','Flow: 36 min','Stretch: 36 min','Meditation: 19 min','Journal: 17 reflections'] },
        { level: 10, daysToComplete: 20, tasks: ['Breathing: 55 min','Dantian: 27 min','Stance: 20 min','Flow: 36-37 min','Stretch: 37 min','Meditation: 20 min','Journal: 17 reflections, 17 gratitudes, 5-year vision'] },
      ],
    },
    {
      tier: 'S',
      title: 'Energy Weaver',
      subLevels: [
        { level: 1, daysToComplete: 18, tasks: ['Breathing: 55-56 min elite','Dantian: 27-28 min','Stance: 20 min','Flow: 37 min refined','Stretch: 37 min','Meditation: 20 min','Advanced: Energy projection practice 5 min','Journal: Elite insights'] },
        { level: 2, daysToComplete: 19, tasks: ['Breathing: 56 min','Dantian: 28 min','Stance: 20 min','Flow: 37-38 min','Stretch: 38 min','Meditation: 20 min','Advanced: 5 min','Journal: 18 reflections'] },
        { level: 3, daysToComplete: 19, tasks: ['Breathing: 57 min','Dantian: 28 min','Stance: 20-21 min','Flow: 38 min','Stretch: 38 min','Meditation: 21 min','Advanced: 6 min','Journal: 18 reflections, 18 gratitudes'] },
        { level: 4, daysToComplete: 20, tasks: ['Breathing: 57-58 min','Dantian: 28-29 min','Stance: 21 min','Flow: 38-39 min','Stretch: 39 min','Meditation: 21 min','Advanced: 6 min','Journal: Quarterly elite review'] },
        { level: 5, daysToComplete: 20, tasks: ['Breathing: 58 min','Dantian: 29 min','Stance: 21 min','Flow: 39 min','Stretch: 39 min','Meditation: 22 min','Advanced: 7 min','Journal: 19 reflections'] },
        { level: 6, daysToComplete: 21, tasks: ['Breathing: 58-59 min','Dantian: 29 min','Stance: 21-22 min','Flow: 39-40 min','Stretch: 40 min','Meditation: 22 min','Advanced: 7 min','Journal: Legacy & impact'] },
        { level: 7, daysToComplete: 21, tasks: ['Breathing: 59 min','Dantian: 29-30 min','Stance: 22 min','Flow: 40 min','Stretch: 40 min','Meditation: 23 min','Advanced: 8 min','Journal: 19 reflections, 19 gratitudes'] },
        { level: 8, daysToComplete: 21, tasks: ['Breathing: 60 min mastery','Dantian: 30 min','Stance: 22 min','Flow: 40 min','Stretch: 40 min','Meditation: 23 min','Advanced: 8 min','Journal: Yearly vision'] },
        { level: 9, daysToComplete: 22, tasks: ['Breathing: 60 min','Dantian: 30 min','Stance: 22-23 min','Flow: 40-41 min','Stretch: 41 min','Meditation: 24 min','Advanced: 9 min','Journal: 20 reflections'] },
        { level: 10, daysToComplete: 22, tasks: ['Breathing: 60 min sustained mastery','Dantian: 30 min peak','Stance: 23 min','Flow: 41 min','Stretch: 41 min','Meditation: 25 min','Advanced: 10 min','Journal: 20 reflections, 20 gratitudes, multi-year vision'] },
      ],
    },
    {
      tier: 'S+',
      title: 'Legendary Cultivator',
      subLevels: [
        { level: 1, daysToComplete: 20, tasks: ['Full practice: 60+ min integrated','Dantian mastery: 30 min','Stance perfection: 23 min','Flow art: 41 min','Stretch: 41 min','Deep meditation: 25 min','Advanced techniques: 10 min','Journal: Legendary insights'] },
        { level: 2, daysToComplete: 21, tasks: ['Same structure','Focus: Refinement over addition','Journal: 20+ reflections, teaching notes'] },
        { level: 3, daysToComplete: 21, tasks: ['Breathing: Mastery level','All elements refined','Journal: Mentorship planning'] },
        { level: 4, daysToComplete: 22, tasks: ['Practice becomes art','Every movement intentional','Journal: Legacy building'] },
        { level: 5, daysToComplete: 22, tasks: ['Consistent excellence','Advanced energy work','Journal: Impact on others'] },
        { level: 6, daysToComplete: 23, tasks: ['Peak performance daily','Mastery demonstration','Journal: Quarterly legendary review'] },
        { level: 7, daysToComplete: 23, tasks: ['Teaching level practice','Can guide others','Journal: 21 reflections, 21 gratitudes'] },
        { level: 8, daysToComplete: 23, tasks: ['Legendary consistency','Years of refinement','Journal: Yearly mastery audit'] },
        { level: 9, daysToComplete: 24, tasks: ['Near-perfect execution','Wisdom integration','Journal: 22 reflections'] },
        { level: 10, daysToComplete: 24, tasks: ['Legendary Cultivator peak','60 min masterful practice','All elements integrated','Journal: 22 reflections, 22 gratitudes, life mastery review'] },
      ],
    },
    {
      tier: 'SS',
      title: 'Immortal Foundation',
      subLevels: [
        { level: 1, daysToComplete: 22, tasks: ['60 min peak practice','30+ min Dantian mastery','24 min stance','42 min flow artistry','42 min stretch','26 min meditation','Advanced: 12 min','Journal: Immortal insights'] },
        { level: 2, daysToComplete: 23, tasks: ['Sustained mastery','All elements refined','Journal: 23 reflections, mentoring thoughts'] },
        { level: 3, daysToComplete: 23, tasks: ['Excellence as standard','Innovation in practice','Journal: Quarterly immortal review'] },
        { level: 4, daysToComplete: 24, tasks: ['Teaching mastery level','Guide advanced students','Journal: Legacy expansion'] },
        { level: 5, daysToComplete: 24, tasks: ['Years of dedication','Unshakeable foundation','Journal: Impact assessment'] },
        { level: 6, daysToComplete: 25, tasks: ['Legendary performance','Every day a masterclass','Journal: 24 reflections, 24 gratitudes'] },
        { level: 7, daysToComplete: 25, tasks: ['Immortal consistency','Decades-level thinking','Journal: Life legacy planning'] },
        { level: 8, daysToComplete: 25, tasks: ['Peak of human cultivation','Mastery in all elements','Journal: Yearly vision alignment'] },
        { level: 9, daysToComplete: 26, tasks: ['Approaching mythical','Wisdom embodied','Journal: 25 reflections'] },
        { level: 10, daysToComplete: 26, tasks: ['Immortal Foundation complete','60+ min integrated mastery','Journal: 25 reflections, 25 gratitudes, multi-decade vision'] },
      ],
    },
    {
      tier: 'SS+',
      title: 'Mythical Being',
      subLevels: [
        { level: 1, daysToComplete: 24, tasks: ['60+ min mythical practice','Peak dantian work: 30+ min','Stance mastery: 25 min','Flow perfection: 43 min','Stretch artistry: 43 min','Deep meditation: 27 min','Advanced: 15 min','Journal: Mythical wisdom'] },
        { level: 2, daysToComplete: 25, tasks: ['Beyond technique','Practice is meditation','Journal: Teaching at highest level'] },
        { level: 3, daysToComplete: 25, tasks: ['Art form achieved','Every session perfect','Journal: Mentoring masters'] },
        { level: 4, daysToComplete: 26, tasks: ['Mythical consistency','Years become decades','Journal: Global impact'] },
        { level: 5, daysToComplete: 26, tasks: ['Peak human achievement','Legendary status confirmed','Journal: Legacy solidified'] },
        { level: 6, daysToComplete: 27, tasks: ['Approaching godhood','Unmatched dedication','Journal: 26 reflections, 26 gratitudes'] },
        { level: 7, daysToComplete: 27, tasks: ['Mythical performance','Inspire generations','Journal: Quarterly mythical review'] },
        { level: 8, daysToComplete: 27, tasks: ['Beyond mastery','Creating new techniques','Journal: Innovation documentation'] },
        { level: 9, daysToComplete: 28, tasks: ['Living legend','Practice is life','Journal: 27 reflections, 27 gratitudes'] },
        { level: 10, daysToComplete: 28, tasks: ['Mythical Being achieved','60+ min transcendent practice','Journal: 28 reflections, 28 gratitudes, life mastery complete'] },
      ],
    },
    {
      tier: 'SSS',
      title: 'Ascendant Cultivator',
      subLevels: [
        { level: 1, daysToComplete: 28, tasks: ['60+ min god-tier practice','Dantian transcendence: 30+ min','Stance immortality: 25+ min','Flow godhood: 45 min','Stretch perfection: 45 min','Meditation mastery: 28 min','Advanced arts: 20 min','Journal: Ascendant wisdom','Legacy: Teach & inspire'] },
        { level: 2, daysToComplete: 29, tasks: ['Beyond human limits','Practice is essence','Journal: Building schools of thought'] },
        { level: 3, daysToComplete: 29, tasks: ['God-tier consistency','Decades of perfection','Journal: 30 reflections, world impact'] },
        { level: 4, daysToComplete: 30, tasks: ['Living embodiment','Practice is being','Journal: Teaching teachers'] },
        { level: 5, daysToComplete: 30, tasks: ['Ascendant status','Inspiring millions','Journal: Legacy documentation'] },
        { level: 6, daysToComplete: 31, tasks: ['Peak of possibility','Unmatched in history','Journal: 30+ reflections, gratitudes'] },
        { level: 7, daysToComplete: 31, tasks: ['Godhood achieved','Transcendent practice','Journal: Creating movements'] },
        { level: 8, daysToComplete: 32, tasks: ['Beyond mortal ken','Living legend immortalized','Journal: Multi-generational impact'] },
        { level: 9, daysToComplete: 32, tasks: ['Approaching the void','Unity with practice','Journal: Philosophical treatises'] },
        { level: 10, daysToComplete: 33, tasks: ['ASCENDANT CULTIVATOR','60+ min transcendent integration','All elements unified','Peak human cultivation','Journal: 30+ reflections, 30+ gratitudes, eternal legacy','Legacy: Your practice inspires generations'] },
      ],
    },
  ],
};

// Complete 13-tier Bodysmith definition
export const BODYSMITH_DEFINITION: DetailedIdentityDefinition = {
  id: 2,
  name: 'Bodysmith',
  description: 'Path to maximum body control, rootedness, lightness, strength, and functional mastery.',
  tiers: [
    {
      tier: 'D',
      title: 'Novice Forger',
      subLevels: [
        { level: 1, daysToComplete: 3, tasks: ['Horse Stance: 30 seconds, focus on form','Jump Rope: 10 skips, learn rhythm','Gratitude: 1 thing'] },
        { level: 2, daysToComplete: 4, tasks: ['Horse Stance: 40 seconds','Jump Rope: 15 skips','Body awareness: Notice leg strength'] },
        { level: 3, daysToComplete: 4, tasks: ['Horse Stance: 50 seconds','Jump Rope: 20 skips','Squats: 3 reps, full depth'] },
        { level: 4, daysToComplete: 5, tasks: ['Horse Stance: 1 minute','Jump Rope: 25 skips','Squats: 4 reps'] },
        { level: 5, daysToComplete: 5, tasks: ['Horse Stance: 1 min 10 sec','Jump Rope: 30 skips','Squats: 5 reps','Ankle circles: 10 each'] },
        { level: 6, daysToComplete: 6, tasks: ['Horse Stance: 1 min 20 sec','Jump Rope: 35 skips','Squats: 5 reps','Ankle mobility: 15 circles each'] },
        { level: 7, daysToComplete: 6, tasks: ['Horse Stance: 1 min 30 sec','Jump Rope: 40 skips','Squats: 6 reps','Balance: Stand on one leg 20sec each'] },
        { level: 8, daysToComplete: 6, tasks: ['Horse Stance: 1 min 40 sec','Jump Rope: 45 skips','Squats: 7 reps','Balance: 25sec each leg'] },
        { level: 9, daysToComplete: 7, tasks: ['Horse Stance: 1 min 50 sec','Jump Rope: 50 skips','Squats: 8 reps','Balance: 30sec each','Calf raises: 5 reps'] },
        { level: 10, daysToComplete: 7, tasks: ['Horse Stance: 2 minutes','Jump Rope: 60 skips','Squats: 10 reps','Balance: 30sec each','Calf raises: 8 reps','Journal: 1 win'] },
      ],
    },
    {
      tier: 'D+',
      title: 'Foundation Builder',
      subLevels: [
        { level: 1, daysToComplete: 5, tasks: ['Horse Stance: 2 min 10 sec','Jump Rope: 1 min 15 sec','Squats: 10 reps','Balance: 35sec each','Calf raises: 10 reps'] },
        { level: 2, daysToComplete: 5, tasks: ['Horse Stance: 2 min 20 sec','Jump Rope: 1 min 20 sec','Squats: 12 reps','Balance: 40sec','Calf raises: 10','Plank: 15 seconds'] },
        { level: 3, daysToComplete: 6, tasks: ['Horse Stance: 2 min 30 sec','Jump Rope: 1 min 30 sec','Squats: 12 reps','Balance: 45sec','Calf raises: 12','Plank: 20sec'] },
        { level: 4, daysToComplete: 6, tasks: ['Horse Stance: 2 min 40 sec','Jump Rope: 1 min 40 sec','Squats: 15 reps','Balance: 50sec','Calf raises: 12','Plank: 25sec'] },
        { level: 5, daysToComplete: 6, tasks: ['Horse Stance: 2 min 50 sec','Jump Rope: 1 min 50 sec','Squats: 15 reps','Balance: 1 min','Calf raises: 15','Plank: 30sec','Push-ups: 3 reps'] },
        { level: 6, daysToComplete: 7, tasks: ['Horse Stance: 3 minutes (CAP - no more time increases)','Jump Rope: 2 minutes','Squats: 18 reps','Balance: 1 min','Calf raises: 15','Plank: 35sec','Push-ups: 5 reps'] },
        { level: 7, daysToComplete: 7, tasks: ['Horse Stance: 3 min total (can split 2+1)','Jump Rope: 2 min 10 sec','Squats: 18 reps','Balance: 1 min 10 sec','Calf raises: 18','Plank: 40sec','Push-ups: 5 reps'] },
        { level: 8, daysToComplete: 7, tasks: ['Horse Stance: 3 min (split OK)','Jump Rope: 2 min 20 sec','Squats: 20 reps','Balance: 1 min 15 sec','Calf raises: 18','Plank: 45sec','Push-ups: 6 reps'] },
        { level: 9, daysToComplete: 8, tasks: ['Horse Stance: 3 min (split OK)','Jump Rope: 2 min 30 sec','Squats: 20 reps','Balance: 1 min 20 sec','Calf raises: 20','Plank: 50sec','Push-ups: 7 reps'] },
        { level: 10, daysToComplete: 8, tasks: ['Horse Stance: 3 min total','Jump Rope: 2 min 40 sec','Squats: 22 reps','Balance: 1 min 30 sec','Calf raises: 20','Plank: 1 minute','Push-ups: 8 reps','Journal: 2 wins'] },
      ],
    },
    {
      tier: 'C',
      title: 'Iron Apprentice',
      subLevels: [
        { level: 1, daysToComplete: 6, tasks: ['Horse Stance: 3 min','Jump Rope: 3 minutes','Squats: 25 reps','Balance work: 1 min 30 sec','Core: Plank 1 min, hollow hold 15 sec','Push-ups: 10 reps'] },
        { level: 2, daysToComplete: 7, tasks: ['Horse Stance: 3 min','Jump Rope: 3 min 10 sec','Squats: 25 reps','Balance: 1 min 40 sec','Core: Plank 1 min 10 sec, hollow 20 sec','Push-ups: 10','Lunges: 5 each leg'] },
        { level: 3, daysToComplete: 7, tasks: ['Horse Stance: 3 min','Jump Rope: 3 min 20 sec','Squats: 28 reps','Balance: 1 min 50 sec','Core: Plank 1 min 15 sec, hollow 20 sec','Push-ups: 12','Lunges: 6 each'] },
        { level: 4, daysToComplete: 8, tasks: ['Horse Stance: 3 min','Jump Rope: 3 min 30 sec','Squats: 28 reps','Balance: 2 minutes','Core: Plank 1 min 20 sec, hollow 25 sec','Push-ups: 12','Lunges: 8 each','Pull-up negatives: 2 reps'] },
        { level: 5, daysToComplete: 8, tasks: ['Horse Stance: 3 min','Jump Rope: 3 min 40 sec','Squats: 30 reps','Balance: 2 min','Core: Plank 1 min 30 sec, hollow 30 sec','Push-ups: 15','Lunges: 10 each','Pull-up negatives: 3'] },
        { level: 6, daysToComplete: 9, tasks: ['Horse Stance: 3 min','Jump Rope: 4 minutes','Squats: 30 reps','Balance: 2 min 10 sec','Core: Plank 1 min 40 sec, hollow 30 sec','Push-ups: 15','Lunges: 10 each','Pull-up negatives: 3','Bridge hold: 20 sec'] },
        { level: 7, daysToComplete: 9, tasks: ['Horse Stance: 3 min','Jump Rope: 4 min 10 sec','Squats: 32 reps','Balance: 2 min 20 sec','Core: Plank 1 min 45 sec, hollow 35 sec','Push-ups: 18','Lunges: 12 each','Pull-up negatives: 4','Bridge: 25 sec'] },
        { level: 8, daysToComplete: 9, tasks: ['Horse Stance: 3 min','Jump Rope: 4 min 20 sec','Squats: 32 reps','Balance: 2 min 30 sec','Core: Plank 1 min 50 sec, hollow 35 sec','Push-ups: 18','Lunges: 12 each','Pull-up negatives: 5','Bridge: 30 sec'] },
        { level: 9, daysToComplete: 10, tasks: ['Horse Stance: 3 min','Jump Rope: 4 min 30 sec','Squats: 35 reps','Balance: 2 min 40 sec','Core: Plank 2 min, hollow 40 sec','Push-ups: 20','Lunges: 15 each','Pull-up attempts: 5','Bridge: 35 sec'] },
        { level: 10, daysToComplete: 10, tasks: ['Horse Stance: 3 min','Jump Rope: 5 minutes','Squats: 35 reps','Balance: 3 minutes','Core: Plank 2 min, hollow 45 sec','Push-ups: 20','Lunges: 15 each','Pull-up attempts: 5','Bridge: 40 sec','Journal: Weekly review'] },
      ],
    },
    {
      tier: 'C+',
      title: 'Steel Practitioner',
      subLevels: [
        { level: 1, daysToComplete: 8, tasks: ['Horse Stance: 3 min (split OK)','Jump Rope: 5 min (can split)','Squats: 40 reps','Balance work: 3 min','Core: Plank 2 min 10 sec, hollow 45 sec','Push-ups: 22','Lunges: 15 each','Pull-ups or negatives: 5-6','Bridge: 45 sec'] },
        { level: 2, daysToComplete: 9, tasks: ['Horse Stance: 3 min','Jump Rope: 5 min 15 sec','Squats: 40 reps','Balance: 3 min 10 sec','Core: Plank 2 min 15 sec, hollow 50 sec','Push-ups: 25','Lunges: 18 each','Pull-ups: 5-6','Bridge: 50 sec','Dips: 3 reps'] },
        { level: 3, daysToComplete: 9, tasks: ['Horse Stance: 3 min','Jump Rope: 5 min 30 sec','Squats: 45 reps','Balance: 3 min 20 sec','Core: Plank 2 min 20 sec, hollow 50 sec','Push-ups: 25','Lunges: 18 each','Pull-ups: 6','Bridge: 55 sec','Dips: 5'] },
        { level: 4, daysToComplete: 10, tasks: ['Horse Stance: 3 min','Jump Rope: 5 min 45 sec','Squats: 45 reps','Balance: 3 min 30 sec','Core: Plank 2 min 30 sec, hollow 55 sec','Push-ups: 28','Lunges: 20 each','Pull-ups: 6-7','Bridge: 1 minute','Dips: 5'] },
        { level: 5, daysToComplete: 10, tasks: ['Horse Stance: 3 min','Jump Rope: 6 minutes','Squats: 50 reps','Balance: 3 min 40 sec','Core: Plank 2 min 40 sec, hollow 55 sec','Push-ups: 28','Lunges: 20 each','Pull-ups: 7','Bridge: 1 min','Dips: 6','Pistol squat practice: 2 each leg'] },
        { level: 6, daysToComplete: 11, tasks: ['Horse Stance: 3 min','Jump Rope: 6 min 15 sec','Squats: 50 reps','Balance: 3 min 50 sec','Core: Plank 2 min 45 sec, hollow 1 min','Push-ups: 30','Lunges: 22 each','Pull-ups: 7-8','Bridge: 1 min 10 sec','Dips: 8','Pistol squat: 3 each'] },
        { level: 7, daysToComplete: 11, tasks: ['Horse Stance: 3 min','Jump Rope: 6 min 30 sec','Squats: 55 reps','Balance: 4 minutes','Core: Plank 2 min 50 sec, hollow 1 min','Push-ups: 30','Lunges: 25 each','Pull-ups: 8','Bridge: 1 min 15 sec','Dips: 8','Pistol squat: 4 each'] },
        { level: 8, daysToComplete: 11, tasks: ['Horse Stance: 3 min','Jump Rope: 6 min 45 sec','Squats: 55 reps','Balance: 4 min 10 sec','Core: Plank 3 min, hollow 1 min 10 sec','Push-ups: 32','Lunges: 25 each','Pull-ups: 8-9','Bridge: 1 min 20 sec','Dips: 10','Pistol squat: 5 each'] },
        { level: 9, daysToComplete: 12, tasks: ['Horse Stance: 3 min','Jump Rope: 7 minutes','Squats: 60 reps','Balance: 4 min 20 sec','Core: Plank 3 min 10 sec, hollow 1 min 15 sec','Push-ups: 32','Lunges: 28 each','Pull-ups: 9','Bridge: 1 min 30 sec','Dips: 10','Pistol squat: 6 each'] },
        { level: 10, daysToComplete: 12, tasks: ['Horse Stance: 3 min','Jump Rope: 7 min 15 sec','Squats: 60 reps','Balance: 4 min 30 sec','Core: Plank 3 min 15 sec, hollow 1 min 20 sec','Push-ups: 35','Lunges: 30 each','Pull-ups: 10','Bridge: 1 min 30 sec','Dips: 12','Pistol squat: 6 each','Journal: Monthly review'] },
      ],
    },
    {
      tier: 'B',
      title: 'Bronze Adept',
      subLevels: [
        { level: 1, daysToComplete: 10, tasks: ['Horse Stance: 3 min','Jump Rope: 7 min 30 sec','Squats: 65 reps','Balance flow: 4 min 40 sec','Core: Plank 3 min 20 sec, hollow 1 min 20 sec, side plank 30 sec each','Push-ups: 35','Lunges: 30 each','Pull-ups: 10','Dips: 12','Pistol squat: 7 each','Bridge: 1 min 40 sec'] },
        { level: 2, daysToComplete: 11, tasks: ['Horse Stance: 3 min','Jump Rope: 7 min 45 sec','Squats: 65 reps','Balance: 4 min 50 sec','Core: Plank 3 min 30 sec, hollow 1 min 25 sec, side plank 35 sec each','Push-ups: 38','Lunges: 32 each','Pull-ups: 11','Dips: 15','Pistol squat: 8 each','Bridge: 1 min 45 sec'] },
        { level: 3, daysToComplete: 11, tasks: ['Horse Stance: 3 min','Jump Rope: 8 minutes','Squats: 70 reps','Balance: 5 minutes','Core: Plank 3 min 40 sec, hollow 1 min 30 sec, side plank 40 sec each','Push-ups: 38','Lunges: 32 each','Pull-ups: 11','Dips: 15','Pistol squat: 8 each','Bridge: 1 min 50 sec','Handstand hold (wall): 10 sec'] },
        { level: 4, daysToComplete: 12, tasks: ['Horse Stance: 3 min','Jump Rope: 8 min 15 sec','Squats: 70 reps','Balance: 5 min 10 sec','Core: Plank 3 min 45 sec, hollow 1 min 30 sec, side plank 45 sec each','Push-ups: 40','Lunges: 35 each','Pull-ups: 12','Dips: 18','Pistol squat: 9 each','Bridge: 2 min','Handstand: 15 sec'] },
        { level: 5, daysToComplete: 12, tasks: ['Horse Stance: 3 min','Jump Rope: 8 min 30 sec','Squats: 75 reps','Balance: 5 min 20 sec','Core: Plank 3 min 50 sec, hollow 1 min 35 sec, side plank 45 sec each','Push-ups: 40','Lunges: 35 each','Pull-ups: 12','Dips: 18','Pistol squat: 10 each','Bridge: 2 min','Handstand: 20 sec'] },
        { level: 6, daysToComplete: 13, tasks: ['Horse Stance: 3 min','Jump Rope: 8 min 45 sec','Squats: 75 reps','Balance: 5 min 30 sec','Core: Plank 4 min, hollow 1 min 40 sec, side plank 50 sec each','Push-ups: 42','Lunges: 38 each','Pull-ups: 13','Dips: 20','Pistol squat: 10 each','Bridge: 2 min 10 sec','Handstand: 25 sec'] },
        { level: 7, daysToComplete: 13, tasks: ['Horse Stance: 3 min','Jump Rope: 9 minutes','Squats: 80 reps','Balance: 5 min 40 sec','Core: Plank 4 min 10 sec, hollow 1 min 45 sec, side plank 50 sec each','Push-ups: 42','Lunges: 38 each','Pull-ups: 13','Dips: 20','Pistol squat: 11 each','Bridge: 2 min 15 sec','Handstand: 30 sec'] },
        { level: 8, daysToComplete: 13, tasks: ['Horse Stance: 3 min','Jump Rope: 9 min 15 sec','Squats: 80 reps','Balance: 5 min 50 sec','Core: Plank 4 min 15 sec, hollow 1 min 50 sec, side plank 55 sec each','Push-ups: 45','Lunges: 40 each','Pull-ups: 14','Dips: 22','Pistol squat: 12 each','Bridge: 2 min 20 sec','Handstand: 30 sec','L-sit attempts: 5 sec'] },
        { level: 9, daysToComplete: 14, tasks: ['Horse Stance: 3 min','Jump Rope: 9 min 30 sec','Squats: 85 reps','Balance: 6 minutes','Core: Plank 4 min 20 sec, hollow 1 min 55 sec, side plank 1 min each','Push-ups: 45','Lunges: 40 each','Pull-ups: 14','Dips: 22','Pistol squat: 12 each','Bridge: 2 min 30 sec','Handstand: 35 sec','L-sit: 8 sec'] },
        { level: 10, daysToComplete: 14, tasks: ['Horse Stance: 3 min','Jump Rope: 10 minutes (CAP)','Squats: 85 reps','Balance: 6 min 10 sec','Core: Plank 4 min 30 sec, hollow 2 min, side plank 1 min each','Push-ups: 48','Lunges: 42 each','Pull-ups: 15','Dips: 25','Pistol squat: 13 each','Bridge: 2 min 30 sec','Handstand: 40 sec','L-sit: 10 sec','Journal: Quarterly goals'] },
      ],
    },
    {
      tier: 'B+',
      title: 'Refined Warrior',
      subLevels: [
        { level: 1, daysToComplete: 12, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min (can add variety: singles, doubles attempts)','Squats: 90 reps','Balance flow: 6 min 20 sec','Core circuit: Plank 4 min 30 sec, hollow 2 min, side plank 1 min each, dead bug 15 reps','Upper: Push-ups 48, Pull-ups 15, Dips 25','Legs: Lunges 42 each, Pistol squat 13 each','Skills: Bridge 2 min 40 sec, Handstand 40 sec, L-sit 10 sec'] },
        { level: 2, daysToComplete: 13, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min (variety)','Squats: 90 reps','Balance: 6 min 30 sec','Core circuit: Plank 4 min 40 sec, hollow 2 min 10 sec, side plank 1 min 5 sec each, dead bug 18','Upper: Push-ups 50, Pull-ups 16, Dips 28','Legs: Lunges 45 each, Pistol squat 14 each','Skills: Bridge 2 min 40 sec, Handstand 45 sec, L-sit 12 sec'] },
        { level: 3, daysToComplete: 13, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min','Squats: 95 reps','Balance: 6 min 40 sec','Core: Plank 4 min 50 sec, hollow 2 min 15 sec, side plank 1 min 10 sec each, dead bug 20','Upper: Push-ups 50, Pull-ups 16, Dips 28','Legs: Lunges 45 each, Pistol squat 15 each','Skills: Bridge 2 min 50 sec, Handstand 50 sec, L-sit 15 sec','Crow pose: 10 sec'] },
        { level: 4, daysToComplete: 14, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min','Squats: 95 reps','Balance: 6 min 50 sec','Core: Plank 5 min, hollow 2 min 20 sec, side plank 1 min 15 sec each, dead bug 20','Upper: Push-ups 52, Pull-ups 17, Dips 30','Legs: Lunges 48 each, Pistol squat 15 each','Skills: Bridge 3 min, Handstand 55 sec, L-sit 18 sec, Crow 15 sec'] },
        { level: 5, daysToComplete: 14, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min','Squats: 100 reps','Balance: 7 minutes','Core: Plank 5 min 10 sec, hollow 2 min 30 sec, side plank 1 min 20 sec each, dead bug 22','Upper: Push-ups 52, Pull-ups 17, Dips 30','Legs: Lunges 48 each, Pistol squat 16 each','Skills: Bridge 3 min, Handstand 1 min, L-sit 20 sec, Crow 20 sec'] },
        { level: 6, daysToComplete: 15, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min','Squats: 100 reps','Balance: 7 min 10 sec','Core: Plank 5 min 15 sec, hollow 2 min 35 sec, side plank 1 min 25 sec each, dead bug 25','Upper: Push-ups 55, Pull-ups 18, Dips 32','Legs: Lunges 50 each, Pistol squat 16 each','Skills: Bridge 3 min 10 sec, Handstand 1 min, L-sit 22 sec, Crow 25 sec'] },
        { level: 7, daysToComplete: 15, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min','Squats: 105 reps','Balance: 7 min 20 sec','Core: Plank 5 min 20 sec, hollow 2 min 40 sec, side plank 1 min 30 sec each, dead bug 25','Upper: Push-ups 55, Pull-ups 18, Dips 32','Legs: Lunges 50 each, Pistol squat 17 each','Skills: Bridge 3 min 15 sec, Handstand 1 min 5 sec, L-sit 25 sec, Crow 30 sec','Muscle-up attempts: 2'] },
        { level: 8, daysToComplete: 15, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min','Squats: 105 reps','Balance: 7 min 30 sec','Core: Plank 5 min 30 sec, hollow 2 min 45 sec, side plank 1 min 30 sec each, dead bug 28','Upper: Push-ups 58, Pull-ups 19, Dips 35','Legs: Lunges 52 each, Pistol squat 18 each','Skills: Bridge 3 min 20 sec, Handstand 1 min 10 sec, L-sit 28 sec, Crow 30 sec, Muscle-up: 2-3'] },
        { level: 9, daysToComplete: 16, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min','Squats: 110 reps','Balance: 7 min 40 sec','Core: Plank 5 min 40 sec, hollow 2 min 50 sec, side plank 1 min 35 sec each, dead bug 30','Upper: Push-ups 58, Pull-ups 19, Dips 35','Legs: Lunges 52 each, Pistol squat 18 each','Skills: Bridge 3 min 30 sec, Handstand 1 min 15 sec, L-sit 30 sec, Crow 35 sec, Muscle-up: 3'] },
        { level: 10, daysToComplete: 16, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min','Squats: 110 reps','Balance: 7 min 50 sec','Core: Plank 5 min 45 sec, hollow 3 min, side plank 1 min 40 sec each, dead bug 30','Upper: Push-ups 60, Pull-ups 20, Dips 38','Legs: Lunges 55 each, Pistol squat 19 each','Skills: Bridge 3 min 30 sec, Handstand 1 min 20 sec, L-sit 30 sec, Crow 40 sec, Muscle-up: 3-4','Journal: Yearly mastery review'] },
      ],
    },
    {
      tier: 'A',
      title: 'Master Forger',
      subLevels: [
        { level: 1, daysToComplete: 14, tasks: ['Horse Stance: 3 min','Jump Rope: 10 min (advanced patterns)','Squats: 115 reps','Balance mastery: 8 minutes','Core mastery: Plank 5 min 50 sec, hollow 3 min, side plank 1 min 45 sec each, dead bug 32, dragon flag attempts','Upper: Push-ups 60, Pull-ups 20, Dips 38, Muscle-ups 4','Legs: Lunges 55 each, Pistol squat 20 each, Shrimp squat practice','Skills: Bridge 3 min 40 sec, Handstand 1 min 20 sec, L-sit 32 sec, Crow 45 sec, Planche lean 20 sec'] },
        { level: 2, daysToComplete: 15, tasks: ['Horse: 3 min','Jump Rope: 10 min','Squats: 115','Balance: 8 min 10 sec','Core: Plank 5 min 55 sec, hollow 3 min 10 sec, side plank 1 min 45 sec, dead bug 35, dragon flag 2 reps','Upper: Push 62, Pull 21, Dips 40, Muscle-up 4','Legs: Lunges 58 each, Pistol 20, Shrimp squat 2 each','Skills: Bridge 3:40, Handstand 1:25, L-sit 35s, Planche lean 25s'] },
        { level: 3, daysToComplete: 15, tasks: ['Horse: 3 min','Jump: 10 min','Squats: 120','Balance: 8:20','Core: Plank 6 min, hollow 3:15, side plank 1:50 each, dead bug 35, dragon flag 3','Upper: Push 62, Pull 21, Dips 40, Muscle-up 5','Legs: Lunges 58, Pistol 21, Shrimp 3 each','Skills: Bridge 3:50, Handstand 1:30, L-sit 38s, Planche lean 30s'] },
        { level: 4, daysToComplete: 16, tasks: ['Horse: 3 min','Jump: 10 min','Squats: 120','Balance: 8:30','Core: Plank 6:10, hollow 3:20, side plank 1:50, dead bug 38, dragon flag 4','Upper: Push 65, Pull 22, Dips 42, Muscle-up 5','Legs: Lunges 60, Pistol 21, Shrimp 4 each','Skills: Bridge 3:50, Handstand 1:35, L-sit 40s, Planche lean 35s, Front lever tuck 10s'] },
        { level: 5, daysToComplete: 16, tasks: ['Horse: 3 min','Jump: 10 min','Squats: 125','Balance: 8:40','Core: Plank 6:15, hollow 3:30, side plank 1:55, dead bug 40, dragon flag 5','Upper: Push 65, Pull 22, Dips 42, Muscle-up 6','Legs: Lunges 60, Pistol 22, Shrimp 5 each','Skills: Bridge 4 min, Handstand 1:40, L-sit 42s, Planche lean 35s, FL tuck 15s'] },
        { level: 6, daysToComplete: 17, tasks: ['Horse: 3 min','Jump: 10 min','Squats: 125','Balance: 8:50','Core: Plank 6:20, hollow 3:35, side plank 2 min, dead bug 40, dragon flag 6','Upper: Push 68, Pull 23, Dips 45, Muscle-up 6','Legs: Lunges 62, Pistol 22, Shrimp 6 each','Skills: Bridge 4 min, Handstand 1:45, L-sit 45s, Planche lean 40s, FL tuck 20s'] },
        { level: 7, daysToComplete: 17, tasks: ['Horse: 3 min','Jump: 10 min','Squats: 130','Balance: 9 min','Core: Plank 6:30, hollow 3:40, side plank 2 min, dead bug 42, dragon flag 7','Upper: Push 68, Pull 23, Dips 45, Muscle-up 7','Legs: Lunges 62, Pistol 23, Shrimp 7 each','Skills: Bridge 4:10, Handstand 1:50, L-sit 48s, Planche lean 40s, FL tuck 25s'] },
        { level: 8, daysToComplete: 18, tasks: ['Horse: 3 min','Jump: 10 min','Squats: 130','Balance: 9:10','Core: Plank 6:35, hollow 3:45, side plank 2:05, dead bug 45, dragon flag 8','Upper: Push 70, Pull 24, Dips 48, Muscle-up 7','Legs: Lunges 65, Pistol 23, Shrimp 8 each','Skills: Bridge 4:15, Handstand 1:55, L-sit 50s, Planche lean 45s, FL tuck 30s'] },
        { level: 9, daysToComplete: 18, tasks: ['Horse: 3 min','Jump: 10 min','Squats: 135','Balance: 9:20','Core: Plank 6:40, hollow 3:50, side plank 2:10, dead bug 45, dragon flag 9','Upper: Push 70, Pull 24, Dips 48, Muscle-up 8','Legs: Lunges 65, Pistol 24, Shrimp 9 each','Skills: Bridge 4:20, Handstand 2 min, L-sit 52s, Planche lean 45s, FL tuck 35s'] },
        { level: 10, daysToComplete: 18, tasks: ['Horse: 3 min','Jump: 10 min','Squats: 135','Balance: 9:30','Core: Plank 6:45, hollow 4 min, side plank 2:10, dead bug 48, dragon flag 10','Upper: Push 72, Pull 25, Dips 50, Muscle-up 8','Legs: Lunges 68, Pistol 25, Shrimp 10 each','Skills: Bridge 4:30, Handstand 2 min, L-sit 55s, Planche lean 50s, FL tuck 40s','Journal: Life mastery vision'] },
      ],
    },
    {
      tier: 'A+',
      title: 'Transcendent Smith',
      subLevels: [
        { level: 1, daysToComplete: 16, tasks: ['Horse: 3 min','Jump: 10 min (complex patterns)','Squats: 140','Balance artistry: 9:40','Core: Plank 6:50, hollow 4 min, side plank 2:15, dead bug 50, dragon flag 10, windshield wipers 5','Upper: Push 72, Pull 25, Dips 50, Muscle-up 9, HSPU attempts 2','Legs: Lunges 68, Pistol 25, Shrimp 10, Nordic curl attempts','Skills: Bridge 4:30, Handstand 2:05, L-sit 58s, Planche: tuck 10s, FL tuck 45s'] },
        { level: 2, daysToComplete: 17, tasks: ['All movements refined','Add HSPU 2-3, Nordic curl negatives','Skills: Planche tuck 15s, FL one leg 10s','Focus: Quality over reps'] },
        { level: 3, daysToComplete: 17, tasks: ['Mastery-level form','HSPU 4, Nordic 2 reps','Skills: Planche tuck 20s, FL one leg 15s','Balance: 10 min'] },
        { level: 4, daysToComplete: 18, tasks: ['Elite consistency','HSPU 5, Nordic 3','Skills: Planche tuck 25s, FL one leg 20s','All elements flow together'] },
        { level: 5, daysToComplete: 18, tasks: ['Advanced progressions','HSPU 6, Nordic 4','Skills: Planche straddle attempts, FL one leg 25s','Core: 7 min plank, 4:30 hollow'] },
        { level: 6, daysToComplete: 19, tasks: ['Peak human strength','HSPU 7, Nordic 5','Skills: Planche straddle 5s, FL one leg 30s','Balance: 10:30'] },
        { level: 7, daysToComplete: 19, tasks: ['Transcendent practice','HSPU 8, Nordic 6','Skills: Planche straddle 10s, FL advanced tuck 20s','Teaching-level mastery'] },
        { level: 8, daysToComplete: 19, tasks: ['Living art','HSPU 9, Nordic 7','Skills: Planche straddle 15s, FL half lay 10s','Every rep perfect'] },
        { level: 9, daysToComplete: 20, tasks: ['Beyond technique','HSPU 10, Nordic 8','Skills: Planche straddle 20s, FL half lay 15s','Flow state achieved'] },
        { level: 10, daysToComplete: 20, tasks: ['Transcendent Smith','All elements mastered','Skills: Planche straddle 25s, FL half lay 20s','HSPU 10+, Nordic 10','Journal: 5-year physical legacy'] },
      ],
    },
    {
      tier: 'S',
      title: 'Elite Warrior',
      subLevels: [
        { level: 1, daysToComplete: 18, tasks: ['Horse: 3 min (perfect form)','Jump: 10 min (all variations)','Strength: Push 75, Pull 26, Dips 52, Muscle-up 10, HSPU 10','Legs: Squats 145, Pistol 26, Shrimp 12, Nordic 10','Core: Plank 7 min, hollow 4:45, dragon flag 12, wipers 8','Skills: Handstand 2:10, Planche straddle 30s, FL half lay 25s, Bridge 4:40','Balance: 10:40','Advanced: One-arm push-up attempts, typewriter pull-ups'] },
        { level: 2, daysToComplete: 19, tasks: ['Elite level consistency','One-arm push 2 each, typewriter pulls 3','Skills: Planche straddle 35s, FL half lay 30s','All movements refined'] },
        { level: 3, daysToComplete: 19, tasks: ['Mastery demonstrated','One-arm push 3 each, typewriter 5','Skills: Planche straddle 40s, FL full attempt','Balance: 11 min'] },
        { level: 4, daysToComplete: 20, tasks: ['Teaching others','One-arm push 4 each, typewriter 6','Skills: Planche near-full attempt, FL full 5s','Core: 7:30 plank'] },
        { level: 5, daysToComplete: 20, tasks: ['Peak performance','One-arm push 5 each, archer pull-ups 8','Skills: Planche full attempts, FL full 10s','Every session excellence'] },
        { level: 6, daysToComplete: 21, tasks: ['Elite warrior status','One-arm push 6 each, archer pulls 10','Skills: Planche full 5s, FL full 15s','Balance: 11:30'] },
        { level: 7, daysToComplete: 21, tasks: ['Legendary consistency','One-arm push 7, one-arm pull attempts','Skills: Planche full 10s, FL full 20s','Inspiring others'] },
        { level: 8, daysToComplete: 21, tasks: ['Mastery in motion','One-arm push 8, one-arm pull negatives','Skills: Planche full 15s, FL full 25s','Art form achieved'] },
        { level: 9, daysToComplete: 22, tasks: ['Elite peak','One-arm push 9, one-arm pull progress','Skills: Planche full 20s, FL full 30s','Years of dedication'] },
        { level: 10, daysToComplete: 22, tasks: ['Elite Warrior complete','One-arm push 10, one-arm pull 1-2','Skills: Planche full 25s, FL full 35s','All movements mastered','Journal: Multi-year impact'] },
      ],
    },
    {
      tier: 'S+',
      title: 'Legendary Forger',
      subLevels: [
        { level: 1, daysToComplete: 20, tasks: ['All exercises at legendary level','One-arm push 10+, one-arm pull 2','Skills: Planche full 30s, FL full 40s, Handstand 2:30','Maltese attempts, Victorian attempts','Iron cross training on rings','Balance: 12 min','Core: Beyond human - 8 min plank, 5 min hollow','Teaching mastery to others'] },
        { level: 2, daysToComplete: 21, tasks: ['Refinement over addition','One-arm pull 3, Maltese tuck 5s','Iron cross straddle attempts','Every movement art'] },
        { level: 3, daysToComplete: 21, tasks: ['Legendary status','One-arm pull 4, Maltese tuck 10s','Skills transcend technique','Mentoring others'] },
        { level: 4, daysToComplete: 22, tasks: ['Peak human achievement','One-arm pull 5, Maltese tuck 15s','Iron cross straddle 5s','Decades in the making'] },
        { level: 5, daysToComplete: 22, tasks: ['Beyond mastery','One-arm pull 6, Maltese half 5s','Creating new progressions','Legacy building'] },
        { level: 6, daysToComplete: 23, tasks: ['Immortal strength','One-arm pull 7, Maltese half 10s','Iron cross straddle 10s','Inspiring generations'] },
        { level: 7, daysToComplete: 23, tasks: ['Mythical consistency','One-arm pull 8, Maltese half 15s','All skills flow naturally','Teaching teachers'] },
        { level: 8, daysToComplete: 23, tasks: ['Living legend','One-arm pull 9, Maltese advanced','Rings mastery demonstrated','World-class level'] },
        { level: 9, daysToComplete: 24, tasks: ['Approaching godhood','One-arm pull 10, Maltese near-full','Every session perfect','Unmatched dedication'] },
        { level: 10, daysToComplete: 24, tasks: ['Legendary Forger achieved','One-arm pull 10+, Maltese full attempts','Iron cross full attempts','Planche 1 min, FL 1 min','Your body is a legend','Journal: Physical legacy complete'] },
      ],
    },
    {
      tier: 'SS',
      title: 'Immortal Body',
      subLevels: [
        { level: 1, daysToComplete: 22, tasks: ['Horse: 3 min perfection','Jump: 10 min mastery','Strength: Beyond legendary - experimenting with impossibles','One-arm pull-up: 10+ reps each arm','Planche: Full 1+ min','Front lever: Full 1+ min','Maltese: Full form work','Iron cross: Full attempts','Victorian: Training','Manna: Attempts','Core: 8+ min plank, 5+ min hollow','Balance: 12+ min','Advanced: Exploring limits, creating new movements','Journal: Immortal strength insights'] },
        { level: 2, daysToComplete: 23, tasks: ['Sustained immortal practice','All movements at peak','Skills: Iron cross full 5s, Victorian tuck 5s','Impossible becomes possible'] },
        { level: 3, daysToComplete: 23, tasks: ['Excellence as baseline','Iron cross 10s, Victorian tuck 10s','Manna tuck attempts','Decade-level consistency'] },
        { level: 4, daysToComplete: 24, tasks: ['Teaching world-class athletes','Iron cross 15s, Victorian tuck 15s','All rings skills mastered','Legacy expansion'] },
        { level: 5, daysToComplete: 24, tasks: ['Immortal status confirmed','Iron cross 20s, Victorian straddle 5s','Creating training systems','Impact on sport'] },
        { level: 6, daysToComplete: 25, tasks: ['Peak of human possibility','Iron cross 25s, Victorian straddle 10s','Manna tuck 5s','Every day a showcase'] },
        { level: 7, daysToComplete: 25, tasks: ['Immortal consistency','Iron cross 30s, Victorian straddle 15s','Teaching elite coaches','Multi-decade practice'] },
        { level: 8, daysToComplete: 25, tasks: ['Beyond mortal limits','Victorian near-full attempts','Manna tuck 10s','Redefining possible'] },
        { level: 9, daysToComplete: 26, tasks: ['Approaching the void','Victorian full attempts','Manna straddle attempts','Wisdom embodied'] },
        { level: 10, daysToComplete: 26, tasks: ['Immortal Body complete','Iron cross: 30s+','Victorian: Full 5s+','Maltese: Full mastery','Planche/FL: 1+ min each','Your body defies belief','Journal: Multi-decade physical mastery'] },
      ],
    },
    {
      tier: 'SS+',
      title: 'Mythical Titan',
      subLevels: [
        { level: 1, daysToComplete: 24, tasks: ['Horse: 3 min (sacred practice)','Jump: 10 min (flowing art)','Strength: God-tier - all exercises perfected','One-arm everything: Mastered','Rings: All positions held 30s+','Static holds: Pushing 2+ minutes','Dynamic movements: Flowing art','Impossible skills: Making progress','Core: 10 min plank possible, 6 min hollow','Balance: 15 min','Inventing new skills and progressions','Journal: Mythical titan wisdom','Teaching: Creating champions'] },
        { level: 2, daysToComplete: 25, tasks: ['Beyond technique','Practice is meditation','Victorian full 10s, Manna straddle 10s','Teaching at Olympic level'] },
        { level: 3, daysToComplete: 25, tasks: ['Art form perfected','Victorian full 15s, Manna straddle 15s','Every movement flawless','Mentoring world champions'] },
        { level: 4, daysToComplete: 26, tasks: ['Mythical status','Victorian 20s, Manna near-full','Years become decades','Global recognition'] },
        { level: 5, daysToComplete: 26, tasks: ['Peak human strength','All rings skills 30s+','Creating training philosophies','International legacy'] },
        { level: 6, daysToComplete: 27, tasks: ['Godhood approaching','Manna full attempts','Setting world standards','Unmatched in generation'] },
        { level: 7, daysToComplete: 27, tasks: ['Mythical performance','Manna full 5s','Inspiring millions','Multi-generational impact'] },
        { level: 8, daysToComplete: 27, tasks: ['Beyond mastery','Creating impossible feats','Breaking perceived limits','Innovation in movement'] },
        { level: 9, daysToComplete: 28, tasks: ['Living myth','Manna full 10s+','Practice is life essence','Philosophical contributions'] },
        { level: 10, daysToComplete: 28, tasks: ['Mythical Titan achieved','All humanly possible skills mastered','Manna full 15s+','One-arm: Everything','Your body is mythology','Journal: Life physical mastery complete'] },
      ],
    },
    {
      tier: 'SSS',
      title: 'Ascendant Body',
      subLevels: [
        { level: 1, daysToComplete: 28, tasks: ['Horse: 3 min (eternal foundation)','Jump: 10 min (transcendent flow)','Strength: ASCENDANT - at the pinnacle of human possibility','All basic skills: 100+ reps possible','All advanced skills: Mastered and teaching','All elite skills: Performing with ease','All impossible skills: Made possible','Rings: Creating new positions','Static: 2+ min holds on multiple skills','Dynamic: Flowing between impossibles','One-arm mantle, one-arm front lever, one-arm everything','Core: 10+ min on all exercises','Balance/Control: Absolute mastery','Journal: Ascendant body wisdom','Legacy: Redefining human potential'] },
        { level: 2, daysToComplete: 29, tasks: ['Beyond human limits','Practice is existence','Building schools worldwide','Immortalizing knowledge'] },
        { level: 3, daysToComplete: 29, tasks: ['Ascendant consistency','Decades of god-tier performance','Philosophical treatises on movement','World-changing impact'] },
        { level: 4, daysToComplete: 30, tasks: ['Living embodiment','Body as temple perfected','Teaching masters','Multi-decade legacy'] },
        { level: 5, daysToComplete: 30, tasks: ['Ascendant status','Peak beyond peaks','Inspiring billions','Historical significance'] },
        { level: 6, daysToComplete: 31, tasks: ['Transcendent mastery','Records unmatched','Multi-generational influence','Creating movements'] },
        { level: 7, daysToComplete: 31, tasks: ['Godhood achieved','50+ years of practice possible','Ultimate physical wisdom','Cultural icon status'] },
        { level: 8, daysToComplete: 32, tasks: ['Beyond mortal understanding','Age-defying performance','Living proof of possibility','International treasure'] },
        { level: 9, daysToComplete: 32, tasks: ['Approaching infinity','Perfect body control','Unity of mind-body-spirit','Philosophical mastery'] },
        { level: 10, daysToComplete: 33, tasks: ['ASCENDANT BODY','Every movement mastered','Every skill possible','Every limit transcended','Your body is art, science, and inspiration','You are proof of human potential','Journal: 30+ reflections, eternal legacy','Legacy: Your strength inspires eternity'] },
      ],
    },
  ],
};



// Complete 13-tier Pathweaver definition
export const PATHWEAVER_DEFINITION: DetailedIdentityDefinition = {
  id: 3,
  name: 'Pathweaver',
  description: 'Path to awareness, planning, reflection, gratitude, foresight, and life mastery through daily intentional practice.',
  tiers: [
    {
      tier: 'D',
      title: 'Dawn Planner',
      subLevels: [
        { level: 1, daysToComplete: 3, tasks: ['Plan today: List 3 specific tasks with priority order','Gratitude: 1 specific thing (not generic)','Reflection: 1 win or lesson from today'] },
        { level: 2, daysToComplete: 4, tasks: ['Plan: 3 tasks with estimated time for each','Gratitude: 1 specific (why it matters)','Reflection: What went well today'] },
        { level: 3, daysToComplete: 4, tasks: ['Plan: 3 tasks + time blocks in calendar','Gratitude: 2 specific things','Reflection: 1 win, 1 improvement area'] },
        { level: 4, daysToComplete: 5, tasks: ['Plan: 3 prioritized tasks with deadlines','Gratitude: 2 specific with reasons','Reflection: 1 win, 1 lesson learned'] },
        { level: 5, daysToComplete: 5, tasks: ['Plan: 5 tasks (3 must-do, 2 nice-to-have)','Gratitude: 2 specific','Reflection: 2 wins or lessons','Metric: Track 1 number (weight, savings, etc.)'] },
        { level: 6, daysToComplete: 6, tasks: ['Plan: 5 tasks categorized (work/personal/health)','Gratitude: 3 specific','Reflection: 2 insights','Metric: Track 1 daily'] },
        { level: 7, daysToComplete: 6, tasks: ['Plan: Evening prep for tomorrow - 5 tasks with time blocks','Gratitude: 3 specific with depth','Reflection: 2 wins, 1 challenge faced','Metric: 1 tracked'] },
        { level: 8, daysToComplete: 6, tasks: ['Plan: Tomorrow mapped out by hour blocks','Gratitude: 3 specific','Reflection: What I learned, what I\'d change','Metrics: 2 tracked (e.g., spending, productivity)'] },
        { level: 9, daysToComplete: 7, tasks: ['Plan: Tomorrow + identify potential obstacles','Gratitude: 3 detailed','Reflection: 3 insights from today','Metrics: 2 tracked daily'] },
        { level: 10, daysToComplete: 7, tasks: ['Plan: Tomorrow optimized','Gratitude: 3 deep reflections','Reflection: 3 lessons, 1 action for tomorrow','Metrics: 2 tracked','Weekly: Review week, plan next week goals'] },
      ],
    },
    {
      tier: 'D+',
      title: 'Intentional Seeker',
      subLevels: [
        { level: 1, daysToComplete: 5, tasks: ['Daily plan: 5 tasks with energy levels noted (high/low energy tasks)','Gratitude: 3 specific','Reflection: 3 lessons','Metrics: 2 daily','Weekly check-in: Progress on goals'] },
        { level: 2, daysToComplete: 5, tasks: ['Plan: Tasks + time + energy matching','Gratitude: 4 specific','Reflection: 3 insights','Metrics: 2 tracked'] },
        { level: 3, daysToComplete: 6, tasks: ['Plan: Full day structure with breaks','Gratitude: 4 detailed','Reflection: 3 lessons + 1 pattern noticed','Metrics: 3 tracked'] },
        { level: 4, daysToComplete: 6, tasks: ['Plan: Day + week overview check','Gratitude: 4 deep','Reflection: 4 insights','Metrics: 3 daily','Budget: Quick spending check'] },
        { level: 5, daysToComplete: 6, tasks: ['Plan: Day aligned with weekly goals','Gratitude: 4 meaningful','Reflection: 4 lessons','Metrics: 3 tracked','Budget: Track expenses'] },
        { level: 6, daysToComplete: 7, tasks: ['Plan: Strategic task prioritization (impact vs effort)','Gratitude: 5 specific','Reflection: 4 insights','Metrics: 3 tracked','Weekly: Goal progress review'] },
        { level: 7, daysToComplete: 7, tasks: ['Plan: Day + contingency plans','Gratitude: 5 detailed','Reflection: 4 lessons + growth areas','Metrics: 3 tracked','Budget: Weekly spending review'] },
        { level: 8, daysToComplete: 7, tasks: ['Plan: Optimized schedule','Gratitude: 5 deep','Reflection: 5 insights','Metrics: 4 tracked','Budget: Expense categories'] },
        { level: 9, daysToComplete: 8, tasks: ['Plan: Strategic day + week view','Gratitude: 5 meaningful','Reflection: 5 lessons','Metrics: 4 tracked daily','Budget: Savings target check'] },
        { level: 10, daysToComplete: 8, tasks: ['Plan: Complete day + week alignment','Gratitude: 5 profound','Reflection: 5 insights + patterns','Metrics: 4 tracked','Budget: Monthly overview','Monthly: Set next month intentions'] },
      ],
    },
    {
      tier: 'C',
      title: 'Mindful Architect',
      subLevels: [
        { level: 1, daysToComplete: 6, tasks: ['Plan: Day + week + month check-in','Gratitude: 5 specific + why they matter','Reflection: 5 lessons','Metrics: 4 tracked','Budget: Track all expenses','Goals: Review monthly progress'] },
        { level: 2, daysToComplete: 7, tasks: ['Plan: Full alignment check (day/week/month)','Gratitude: 6 detailed','Reflection: 5 insights + action items','Metrics: 5 tracked','Budget: Expense analysis'] },
        { level: 3, daysToComplete: 7, tasks: ['Plan: Strategic priorities','Gratitude: 6 deep','Reflection: 6 lessons','Metrics: 5 tracked','Budget: Savings plan active'] },
        { level: 4, daysToComplete: 8, tasks: ['Plan: Day optimized for goals','Gratitude: 6 meaningful','Reflection: 6 insights','Metrics: 5 tracked','Budget: Investment planning start','Goals: Quarterly thinking'] },
        { level: 5, daysToComplete: 8, tasks: ['Plan: Full system (daily/weekly/monthly)','Gratitude: 6 profound','Reflection: 6 lessons + patterns','Metrics: 6 tracked','Budget: Complete overview','Weekly: Deep review'] },
        { level: 6, daysToComplete: 9, tasks: ['Plan: Integrated planning','Gratitude: 7 specific','Reflection: 7 insights','Metrics: 6 tracked','Budget: Optimization','Goals: Progress tracking'] },
        { level: 7, daysToComplete: 9, tasks: ['Plan: Life areas balanced','Gratitude: 7 detailed','Reflection: 7 lessons','Metrics: 6 tracked','Budget: Investment review','Monthly: Complete review'] },
        { level: 8, daysToComplete: 9, tasks: ['Plan: Strategic life planning','Gratitude: 7 deep','Reflection: 7 insights + action','Metrics: 7 tracked','Budget: Financial health check'] },
        { level: 9, daysToComplete: 10, tasks: ['Plan: All time horizons aligned','Gratitude: 7 meaningful','Reflection: 8 lessons','Metrics: 7 tracked','Budget: Comprehensive','Goals: Quarterly review'] },
        { level: 10, daysToComplete: 10, tasks: ['Plan: Mastery level daily system','Gratitude: 8 profound','Reflection: 8 insights + growth areas','Metrics: 7 tracked','Budget: Full financial planning','Quarterly: Big picture review'] },
      ],
    },
    {
      tier: 'C+',
      title: 'Vision Keeper',
      subLevels: [
        { level: 1, daysToComplete: 8, tasks: ['Plan: Complete life system (daily→yearly)','Gratitude: 8 specific + impact','Reflection: 8 lessons','Metrics: 8 tracked','Budget: Financial goals active','Quarterly: OKR review'] },
        { level: 2, daysToComplete: 9, tasks: ['Plan: Strategic all levels','Gratitude: 8 detailed','Reflection: 8 insights + habits','Metrics: 8 tracked','Budget: Investment strategy'] },
        { level: 3, daysToComplete: 9, tasks: ['Plan: Life architect level','Gratitude: 8 deep','Reflection: 9 lessons','Metrics: 8 tracked','Budget: Wealth building','Goals: Year progress'] },
        { level: 4, daysToComplete: 10, tasks: ['Plan: All areas integrated','Gratitude: 9 specific','Reflection: 9 insights','Metrics: 9 tracked','Budget: Complete system','Monthly: Deep dive'] },
        { level: 5, daysToComplete: 10, tasks: ['Plan: Mastery daily practice','Gratitude: 9 detailed','Reflection: 9 lessons + meta-patterns','Metrics: 9 tracked','Budget: Financial mastery path'] },
        { level: 6, daysToComplete: 11, tasks: ['Plan: Life orchestration','Gratitude: 9 deep','Reflection: 9 insights + evolution','Metrics: 9 tracked','Budget: Comprehensive planning','Quarterly: Vision alignment'] },
        { level: 7, daysToComplete: 11, tasks: ['Plan: Strategic mastery','Gratitude: 9 meaningful','Reflection: 10 lessons','Metrics: 10 tracked','Budget: Long-term wealth'] },
        { level: 8, daysToComplete: 11, tasks: ['Plan: Complete integration','Gratitude: 10 specific','Reflection: 10 insights','Metrics: 10 tracked','Budget: Financial freedom path','Monthly: Complete audit'] },
        { level: 9, daysToComplete: 12, tasks: ['Plan: All life areas optimized','Gratitude: 10 detailed','Reflection: 10 lessons + teaching insights','Metrics: 10 tracked','Budget: Investment mastery'] },
        { level: 10, daysToComplete: 12, tasks: ['Plan: Vision Keeper mastery','Gratitude: 10 profound','Reflection: 10 insights + life philosophy','Metrics: 10 tracked','Budget: Complete financial system','Yearly: Vision review + next year planning'] },
      ],
    },
    {
      tier: 'B',
      title: 'Life Strategist',
      subLevels: [
        { level: 1, daysToComplete: 10, tasks: ['Plan: Strategic life system','Gratitude: 10 specific + ripple effects','Reflection: 10 lessons','Metrics: 10-12 tracked','Budget: Wealth systems active','Goals: Multi-year thinking','Life areas: Balance check'] },
        { level: 2, daysToComplete: 11, tasks: ['Plan: Advanced integration','Gratitude: 11 detailed','Reflection: 11 insights','Metrics: 11 tracked','Budget: Investment portfolio review','Quarterly: Strategic planning'] },
        { level: 3, daysToComplete: 11, tasks: ['Plan: Mastery level','Gratitude: 11 deep','Reflection: 11 lessons','Metrics: 11 tracked','Budget: Financial optimization','Goals: 3-year vision active'] },
        { level: 4, daysToComplete: 12, tasks: ['Plan: Life architect daily','Gratitude: 11 meaningful','Reflection: 12 insights','Metrics: 12 tracked','Budget: Complete system','Monthly: Life audit'] },
        { level: 5, daysToComplete: 12, tasks: ['Plan: All systems optimized','Gratitude: 12 specific','Reflection: 12 lessons','Metrics: 12 tracked','Budget: Wealth building mastery','Quarterly: Vision review'] },
        { level: 6, daysToComplete: 13, tasks: ['Plan: Strategic mastery','Gratitude: 12 detailed','Reflection: 12 insights + patterns','Metrics: 12 tracked','Budget: Financial freedom progress'] },
        { level: 7, daysToComplete: 13, tasks: ['Plan: Complete life system','Gratitude: 12 deep','Reflection: 13 lessons','Metrics: 13 tracked','Budget: Investment strategy refined','Goals: 5-year vision'] },
        { level: 8, daysToComplete: 13, tasks: ['Plan: Advanced strategist','Gratitude: 13 meaningful','Reflection: 13 insights','Metrics: 13 tracked','Budget: Comprehensive wealth plan','Monthly: Complete review'] },
        { level: 9, daysToComplete: 14, tasks: ['Plan: Life orchestration','Gratitude: 13 profound','Reflection: 13 lessons + meta-learning','Metrics: 14 tracked','Budget: Financial mastery','Quarterly: Big picture'] },
        { level: 10, daysToComplete: 14, tasks: ['Plan: Life Strategist peak','Gratitude: 14 specific','Reflection: 14 insights + teaching others','Metrics: 14 tracked','Budget: Complete financial architecture','Yearly: Life vision + legacy thinking'] },
      ],
    },
    {
      tier: 'B+',
      title: 'Destiny Shaper',
      subLevels: [
        { level: 1, daysToComplete: 12, tasks: ['Plan: Complete life architecture','Gratitude: 14 detailed + interconnections','Reflection: 14 lessons','Metrics: 14-15 tracked','Budget: Wealth systems mastered','Goals: 5-10 year vision','Legacy: Beginning to think about impact'] },
        { level: 2, daysToComplete: 13, tasks: ['Plan: Advanced life systems','Gratitude: 14 deep','Reflection: 15 insights','Metrics: 15 tracked','Budget: Financial freedom path clear','Quarterly: Strategic review'] },
        { level: 3, daysToComplete: 13, tasks: ['Plan: Mastery integration','Gratitude: 15 meaningful','Reflection: 15 lessons','Metrics: 15 tracked','Budget: Investment mastery','Goals: Decade thinking active'] },
        { level: 4, daysToComplete: 14, tasks: ['Plan: All life areas optimized','Gratitude: 15 profound','Reflection: 15 insights + wisdom','Metrics: 15 tracked','Budget: Complete wealth system','Monthly: Deep life audit'] },
        { level: 5, daysToComplete: 14, tasks: ['Plan: Strategic life mastery','Gratitude: 15 specific','Reflection: 16 lessons','Metrics: 16 tracked','Budget: Financial legacy building','Quarterly: Vision alignment'] },
        { level: 6, daysToComplete: 15, tasks: ['Plan: Life orchestration peak','Gratitude: 16 detailed','Reflection: 16 insights','Metrics: 16 tracked','Budget: Generational wealth thinking'] },
        { level: 7, daysToComplete: 15, tasks: ['Plan: Destiny-level planning','Gratitude: 16 deep','Reflection: 16 lessons + philosophy','Metrics: 16 tracked','Budget: Complete system','Goals: Life vision clear'] },
        { level: 8, daysToComplete: 15, tasks: ['Plan: Advanced mastery','Gratitude: 16 meaningful','Reflection: 17 insights','Metrics: 17 tracked','Budget: Wealth + legacy','Monthly: Complete audit'] },
        { level: 9, daysToComplete: 16, tasks: ['Plan: Life architect peak','Gratitude: 17 profound','Reflection: 17 lessons','Metrics: 17 tracked','Budget: Financial mastery complete','Quarterly: Legacy review'] },
        { level: 10, daysToComplete: 16, tasks: ['Plan: Destiny Shaper mastery','Gratitude: 17 specific','Reflection: 17 insights + teaching wisdom','Metrics: 17 tracked','Budget: Generational planning','Yearly: Life + legacy vision','Impact: How you\'re helping others'] },
      ],
    },
    {
      tier: 'A',
      title: 'Master Weaver',
      subLevels: [
        { level: 1, daysToComplete: 14, tasks: ['Plan: Master-level life architecture','Gratitude: 18 detailed + systemic thinking','Reflection: 18 lessons','Metrics: 18 tracked','Budget: Wealth mastery + legacy','Goals: Multi-decade vision','Impact: Measuring contribution to others','Wisdom: Documenting life lessons'] },
        { level: 2, daysToComplete: 15, tasks: ['Plan: Complete integration','Gratitude: 18 deep','Reflection: 18 insights + patterns','Metrics: 18 tracked','Budget: Generational wealth','Quarterly: Strategic life review'] },
        { level: 3, daysToComplete: 15, tasks: ['Plan: Life mastery daily','Gratitude: 18 meaningful','Reflection: 19 lessons','Metrics: 19 tracked','Budget: Financial freedom achieved','Goals: Legacy building active'] },
        { level: 4, daysToComplete: 16, tasks: ['Plan: Advanced orchestration','Gratitude: 19 profound','Reflection: 19 insights','Metrics: 19 tracked','Budget: Complete system','Monthly: Deep wisdom audit'] },
        { level: 5, daysToComplete: 16, tasks: ['Plan: Master Weaver level','Gratitude: 19 specific','Reflection: 19 lessons + teaching','Metrics: 19 tracked','Budget: Legacy systems','Quarterly: Life vision review'] },
        { level: 6, daysToComplete: 17, tasks: ['Plan: Peak life planning','Gratitude: 19 detailed','Reflection: 20 insights','Metrics: 20 tracked','Budget: Generational impact','Goals: 20-30 year thinking'] },
        { level: 7, daysToComplete: 17, tasks: ['Plan: Mastery integration','Gratitude: 20 deep','Reflection: 20 lessons','Metrics: 20 tracked','Budget: Wealth + wisdom legacy','Impact: Mentoring others'] },
        { level: 8, daysToComplete: 18, tasks: ['Plan: Life architect mastery','Gratitude: 20 meaningful','Reflection: 20 insights + philosophy','Metrics: 20 tracked','Budget: Complete mastery','Monthly: Complete life review'] },
        { level: 9, daysToComplete: 18, tasks: ['Plan: Strategic perfection','Gratitude: 20 profound','Reflection: 21 lessons','Metrics: 21 tracked','Budget: Legacy building','Quarterly: Wisdom review'] },
        { level: 10, daysToComplete: 18, tasks: ['Plan: Master Weaver peak','Gratitude: 21 specific','Reflection: 21 insights + life wisdom','Metrics: 21 tracked','Budget: Generational wealth systems','Yearly: Complete life vision','Legacy: Teaching others your system','Impact: Measuring ripple effects'] },
      ],
    },
    {
      tier: 'A+',
      title: 'Transcendent Planner',
      subLevels: [
        { level: 1, daysToComplete: 16, tasks: ['Plan: Transcendent life architecture','Gratitude: 21 detailed + universal connections','Reflection: 21 lessons','Metrics: 21 tracked','Budget: Wealth + legacy + impact systems','Goals: Lifetime vision clear','Wisdom: Creating frameworks others can use','Impact: Building systems that help many'] },
        { level: 2, daysToComplete: 17, tasks: ['Plan: Advanced mastery','Gratitude: 21 deep','Reflection: 22 insights','Metrics: 22 tracked','Budget: Complete systems','Quarterly: Strategic vision'] },
        { level: 3, daysToComplete: 17, tasks: ['Plan: Life orchestration peak','Gratitude: 22 meaningful','Reflection: 22 lessons + frameworks','Metrics: 22 tracked','Budget: Legacy mastery','Goals: Multi-generational thinking'] },
        { level: 4, daysToComplete: 18, tasks: ['Plan: Transcendent integration','Gratitude: 22 profound','Reflection: 22 insights','Metrics: 22 tracked','Budget: Generational systems','Monthly: Wisdom audit'] },
        { level: 5, daysToComplete: 18, tasks: ['Plan: Peak life mastery','Gratitude: 22 specific','Reflection: 23 lessons','Metrics: 23 tracked','Budget: Complete architecture','Impact: Teaching mastery'] },
        { level: 6, daysToComplete: 19, tasks: ['Plan: Advanced wisdom','Gratitude: 23 detailed','Reflection: 23 insights + teaching','Metrics: 23 tracked','Budget: Legacy optimization','Goals: Lifetime impact'] },
        { level: 7, daysToComplete: 19, tasks: ['Plan: Mastery perfected','Gratitude: 23 deep','Reflection: 23 lessons','Metrics: 23 tracked','Budget: Wealth + wisdom + impact','Quarterly: Complete review'] },
        { level: 8, daysToComplete: 19, tasks: ['Plan: Transcendent daily','Gratitude: 23 meaningful','Reflection: 24 insights','Metrics: 24 tracked','Budget: Generational mastery','Monthly: Life philosophy'] },
        { level: 9, daysToComplete: 20, tasks: ['Plan: Life architect peak','Gratitude: 24 profound','Reflection: 24 lessons + frameworks','Metrics: 24 tracked','Budget: Complete legacy','Impact: Building movements'] },
        { level: 10, daysToComplete: 20, tasks: ['Plan: Transcendent Planner mastery','Gratitude: 24 specific','Reflection: 24 insights + universal wisdom','Metrics: 24 tracked','Budget: Multi-generational wealth','Yearly: Lifetime vision + impact review','Legacy: Systems that outlive you','Wisdom: Philosophical frameworks','Impact: Changing lives at scale'] },
      ],
    },
    {
      tier: 'S',
      title: 'Elite Architect',
      subLevels: [
        { level: 1, daysToComplete: 18, tasks: ['Plan: Elite life architecture - all systems integrated','Gratitude: 25 detailed + cosmic perspective','Reflection: 25 lessons','Metrics: 25 tracked','Budget: Complete wealth + legacy + impact mastery','Goals: 50-year vision active','Wisdom: Writing books/creating content','Impact: Measurable change in hundreds of lives','Legacy: Building institutions'] },
        { level: 2, daysToComplete: 19, tasks: ['Plan: Peak integration','Gratitude: 25 deep','Reflection: 25 insights + teachings','Metrics: 25 tracked','Budget: Generational systems optimized','Impact: Training teachers'] },
        { level: 3, daysToComplete: 19, tasks: ['Plan: Elite mastery','Gratitude: 25 meaningful','Reflection: 26 lessons','Metrics: 26 tracked','Budget: Legacy architecture','Goals: Multi-generational impact'] },
        { level: 4, daysToComplete: 20, tasks: ['Plan: Transcendent systems','Gratitude: 26 profound','Reflection: 26 insights','Metrics: 26 tracked','Budget: Wealth + wisdom mastery','Quarterly: Vision alignment'] },
        { level: 5, daysToComplete: 20, tasks: ['Plan: Life orchestration peak','Gratitude: 26 specific','Reflection: 26 lessons + frameworks','Metrics: 26 tracked','Budget: Complete architecture','Impact: Scaling systems'] },
        { level: 6, daysToComplete: 21, tasks: ['Plan: Elite level daily','Gratitude: 26 detailed','Reflection: 27 insights','Metrics: 27 tracked','Budget: Generational wealth complete','Goals: Century thinking'] },
        { level: 7, daysToComplete: 21, tasks: ['Plan: Mastery perfection','Gratitude: 27 deep','Reflection: 27 lessons','Metrics: 27 tracked','Budget: Legacy + impact systems','Monthly: Wisdom documentation'] },
        { level: 8, daysToComplete: 21, tasks: ['Plan: Peak human planning','Gratitude: 27 meaningful','Reflection: 27 insights + philosophy','Metrics: 27 tracked','Budget: Complete mastery','Impact: Thousands of lives'] },
        { level: 9, daysToComplete: 22, tasks: ['Plan: Elite architect level','Gratitude: 27 profound','Reflection: 28 lessons','Metrics: 28 tracked','Budget: Multi-generational','Quarterly: Legacy review'] },
        { level: 10, daysToComplete: 22, tasks: ['Plan: Elite Architect mastery','Gratitude: 28 specific','Reflection: 28 insights + life philosophy','Metrics: 28 tracked','Budget: Complete wealth + legacy systems','Yearly: 50-year vision review','Wisdom: Published frameworks','Impact: Building movements','Legacy: Institutions that last'] },
      ],
    },
    {
      tier: 'S+',
      title: 'Legendary Weaver',
      subLevels: [
        { level: 1, daysToComplete: 20, tasks: ['Plan: Legendary life architecture - systems within systems','Gratitude: 28+ daily with universal perspective','Reflection: 28+ lessons','Metrics: 28+ tracked','Budget: Multi-generational wealth mastered','Goals: Century-scale vision','Wisdom: Teaching worldwide','Impact: Tens of thousands of lives changed','Legacy: Creating lasting institutions','Philosophy: Defining new paradigms'] },
        { level: 2, daysToComplete: 21, tasks: ['Plan: Peak mastery','Gratitude: 29 deep','Reflection: 29 insights','Metrics: 29 tracked','Impact: Global scale','Wisdom: Books written'] },
        { level: 3, daysToComplete: 21, tasks: ['Plan: Legendary integration','Gratitude: 29 meaningful','Reflection: 29 lessons','Metrics: 29 tracked','Legacy: Generational impact','Goals: Multi-century thinking'] },
        { level: 4, daysToComplete: 22, tasks: ['Plan: Transcendent mastery','Gratitude: 29 profound','Reflection: 30 insights','Metrics: 30 tracked','Budget: Legacy optimization','Impact: Training masters'] },
        { level: 5, daysToComplete: 22, tasks: ['Plan: Life architect god-tier','Gratitude: 30 specific','Reflection: 30 lessons','Metrics: 30 tracked','Wisdom: Frameworks used globally','Impact: Scaling worldwide'] },
        { level: 6, daysToComplete: 23, tasks: ['Plan: Legendary daily','Gratitude: 30 detailed','Reflection: 30 insights','Metrics: 30 tracked','Budget: Complete mastery','Quarterly: Legacy review'] },
        { level: 7, daysToComplete: 23, tasks: ['Plan: Peak human level','Gratitude: 30 deep','Reflection: 31 lessons','Metrics: 31 tracked','Impact: Hundreds of thousands','Goals: Eternal thinking'] },
        { level: 8, daysToComplete: 23, tasks: ['Plan: Legendary mastery','Gratitude: 31 meaningful','Reflection: 31 insights','Metrics: 31 tracked','Wisdom: Global teachings','Monthly: Philosophy documentation'] },
        { level: 9, daysToComplete: 24, tasks: ['Plan: Transcendent peak','Gratitude: 31 profound','Reflection: 31 lessons','Metrics: 31 tracked','Legacy: Lasting institutions','Impact: Millions touched'] },
        { level: 10, daysToComplete: 24, tasks: ['Plan: Legendary Weaver complete','Gratitude: 32 specific','Reflection: 32 insights + universal wisdom','Metrics: 32 tracked','Budget: Multi-generational mastery','Yearly: Century vision','Wisdom: Global frameworks','Impact: Worldwide movement','Legacy: Eternal institutions','Philosophy: Paradigm shifts created'] },
      ],
    },
    {
      tier: 'SS',
      title: 'Immortal Architect',
      subLevels: [
        { level: 1, daysToComplete: 22, tasks: ['Plan: Immortal life architecture - beyond human scale','Gratitude: 32+ with cosmic awareness','Reflection: 32+ lessons documenting decades','Metrics: 32+ all life areas mastered','Budget: Wealth systems for generations','Goals: Multi-century impact vision','Wisdom: Teaching globally, books widespread','Impact: Millions of lives transformed','Legacy: Institutions lasting centuries','Philosophy: Redefining human potential','Art: Your life is the masterpiece'] },
        { level: 2, daysToComplete: 23, tasks: ['Plan: Beyond mastery','Gratitude: 33 deep','Reflection: 33 insights','Metrics: 33 tracked','Impact: Global movements','Wisdom: Timeless teachings'] },
        { level: 3, daysToComplete: 23, tasks: ['Plan: Immortal integration','Gratitude: 33 meaningful','Reflection: 33 lessons','Metrics: 33 tracked','Legacy: Multi-century thinking','Goals: Eternal impact'] },
        { level: 4, daysToComplete: 24, tasks: ['Plan: Peak beyond peaks','Gratitude: 33 profound','Reflection: 34 insights','Metrics: 34 tracked','Budget: Generational mastery','Impact: Tens of millions'] },
        { level: 5, daysToComplete: 24, tasks: ['Plan: Immortal daily','Gratitude: 34 specific','Reflection: 34 lessons','Metrics: 34 tracked','Wisdom: Global paradigms','Legacy: Lasting forever'] },
        { level: 6, daysToComplete: 25, tasks: ['Plan: Beyond human scale','Gratitude: 34 detailed','Reflection: 34 insights','Metrics: 34 tracked','Impact: Historical significance','Quarterly: Eternal review'] },
        { level: 7, daysToComplete: 25, tasks: ['Plan: Immortal mastery','Gratitude: 34 deep','Reflection: 35 lessons','Metrics: 35 tracked','Wisdom: Teaching teachers of teachers','Goals: Civilization-scale thinking'] },
        { level: 8, daysToComplete: 25, tasks: ['Plan: Peak immortal','Gratitude: 35 meaningful','Reflection: 35 insights','Metrics: 35 tracked','Legacy: Multi-generational institutions','Monthly: Philosophy mastery'] },
        { level: 9, daysToComplete: 26, tasks: ['Plan: Transcendent architect','Gratitude: 35 profound','Reflection: 35 lessons','Metrics: 35 tracked','Impact: Hundreds of millions','Wisdom: Eternal frameworks'] },
        { level: 10, daysToComplete: 26, tasks: ['Plan: Immortal Architect complete','Gratitude: 36 specific','Reflection: 36 insights + eternal wisdom','Metrics: 36 tracked','Budget: Wealth for centuries','Yearly: Multi-century vision','Wisdom: Paradigms that last forever','Impact: Civilization-shaping','Legacy: Immortalized in history','Philosophy: Timeless truths','Your life echoes through time'] },
      ],
    },
    {
      tier: 'SS+',
      title: 'Mythical Fate Weaver',
      subLevels: [
        { level: 1, daysToComplete: 24, tasks: ['Plan: Mythical life architecture - operating at civilization scale','Gratitude: 36+ with universal love','Reflection: 36+ wisdom for the ages','Metrics: 36+ complete life mastery','Budget: Shaping economic systems','Goals: Millennium-scale vision','Wisdom: Timeless teachings studied for generations','Impact: Billions touched by your work','Legacy: Reshaping human consciousness','Philosophy: Creating new ways of being','Art: You are legend','Time: Your impact is eternal'] },
        { level: 2, daysToComplete: 25, tasks: ['Plan: Beyond immortal','Gratitude: 37 deep','Reflection: 37 insights','Metrics: 37 tracked','Impact: Reshaping world','Wisdom: Eternal philosophy'] },
        { level: 3, daysToComplete: 25, tasks: ['Plan: Mythical mastery','Gratitude: 37 meaningful','Reflection: 37 lessons','Metrics: 37 tracked','Legacy: Civilization-defining','Goals: Eternal thinking'] },
        { level: 4, daysToComplete: 26, tasks: ['Plan: Peak mythical','Gratitude: 37 profound','Reflection: 38 insights','Metrics: 38 tracked','Budget: Economic paradigms','Impact: Historical transformation'] },
        { level: 5, daysToComplete: 26, tasks: ['Plan: God-tier daily','Gratitude: 38 specific','Reflection: 38 lessons','Metrics: 38 tracked','Wisdom: Timeless truth','Legacy: Forever remembered'] },
        { level: 6, daysToComplete: 27, tasks: ['Plan: Mythical peak','Gratitude: 38 detailed','Reflection: 38 insights','Metrics: 38 tracked','Impact: Billions of lives','Quarterly: Eternal wisdom'] },
        { level: 7, daysToComplete: 27, tasks: ['Plan: Beyond comprehension','Gratitude: 38 deep','Reflection: 39 lessons','Metrics: 39 tracked','Wisdom: Studied for centuries','Goals: Shaping future of humanity'] },
        { level: 8, daysToComplete: 27, tasks: ['Plan: Transcendent myth','Gratitude: 39 meaningful','Reflection: 39 insights','Metrics: 39 tracked','Legacy: Multi-millennium','Monthly: Creating timeless wisdom'] },
        { level: 9, daysToComplete: 28, tasks: ['Plan: Approaching divinity','Gratitude: 39 profound','Reflection: 39 lessons','Metrics: 39 tracked','Impact: Reshaping civilization','Wisdom: Eternal frameworks'] },
        { level: 10, daysToComplete: 28, tasks: ['Plan: Mythical Fate Weaver achieved','Gratitude: 40 specific','Reflection: 40 insights + universal truth','Metrics: 40 tracked','Budget: Economic systems shaped','Yearly: Millennium vision','Wisdom: Timeless philosophy','Impact: Humanity transformed','Legacy: Forever etched in history','Philosophy: New paradigms created','Your name is spoken with reverence','Your wisdom guides generations','You have become mythology'] },
      ],
    },
    {
      tier: 'SSS',
      title: 'Ascendant Weaver',
      subLevels: [
        { level: 1, daysToComplete: 28, tasks: ['Plan: ASCENDANT - You operate beyond time, shaping the arc of civilization','Gratitude: 40+ with divine perspective - grateful for existence itself','Reflection: 40+ documenting eternal wisdom','Metrics: 40+ complete mastery of all life domains','Budget: Creating economic paradigms for humanity','Goals: Your vision spans millennia','Wisdom: Your teachings are scripture','Impact: Your work has reshaped human consciousness','Legacy: You are remembered forever','Philosophy: You have defined new ways of being human','Time: You have transcended mortality through impact','You are the standard others aspire to','You have woven yourself into the fabric of humanity'] },
        { level: 2, daysToComplete: 29, tasks: ['Beyond myth','Practice is existence','Building eternal systems','Your life is teaching'] },
        { level: 3, daysToComplete: 29, tasks: ['Ascendant daily','All life mastered','Creating for eternity','Wisdom is your gift'] },
        { level: 4, daysToComplete: 30, tasks: ['Peak human planning','Decades of god-tier practice','Teaching the world','Legacy is assured'] },
        { level: 5, daysToComplete: 30, tasks: ['Civilization shaper','Economic architect','Philosophical master','Impact immeasurable'] },
        { level: 6, daysToComplete: 31, tasks: ['Eternal vision','Multi-millennium thinking','Wisdom for ages','You are legend'] },
        { level: 7, daysToComplete: 31, tasks: ['Ascendant mastery','Reshaping humanity','Timeless teachings','Historical immortality'] },
        { level: 8, daysToComplete: 32, tasks: ['Beyond mortal ken','Perfect life architecture','Universal wisdom','Consciousness evolution'] },
        { level: 9, daysToComplete: 32, tasks: ['Approaching infinity','Complete transcendence','Eternal frameworks','Human potential redefined'] },
        { level: 10, daysToComplete: 33, tasks: ['ASCENDANT WEAVER','Every domain mastered','Every goal achieved','Every vision manifested','Your planning shapes civilization','Your wisdom guides humanity','Your legacy is eternal','Your impact unmeasurable','You have transcended limitation','You are proof of what\'s possible','Reflection: 50+ insights - life wisdom complete','Gratitude: 50+ - universal love','Metrics: 50+ - all areas perfected','Your life is the ultimate plan','Executed to perfection','Forever inspiring generations','You have become timeless'] },
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

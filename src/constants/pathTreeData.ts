/**
 * Path Tree Data Structure - "Diamond Synthesis" Progression System
 * 
 * 4 Paths: Warrior, Mage, Mystic, Guardian
 * 6 Stages with Diamond Layout:
 * 
 * Stage 1 (Training): 1 central node
 * Stage 2 (Essence): 2 nodes (Left & Right) - Both can be unlocked
 * Stage 3 (Class): 3 nodes - Center requires BOTH Stage 2 mastered. Point of no return.
 * Stage 4 & 5: 3 nodes - Strict vertical progression
 * Stage 6 (Apex): 1 central node - All Stage 5 nodes converge here
 * 
 * Node Status States:
 * - locked: Cannot interact, requirements not met
 * - unlockable: Can be unlocked with stars
 * - active: Currently leveling up, has animation
 * - completed: Finished/mastered
 */

export type NodeStatus = 'locked' | 'unlockable' | 'active' | 'completed';
export type NodePosition = 'center' | 'left-branch' | 'center-branch' | 'right-branch';
export type PathTheme = 'red' | 'violet' | 'emerald' | 'gold';

export interface CoreMastery {
  title: string;
  benefit: string;
}

export interface PathNode {
  id: string;
  title: string;
  stage: number;
  status: NodeStatus;
  starsRequired: number;
  starsCurrent: number;
  position: NodePosition;
  coreMasteries?: CoreMastery[];
}

export interface CultivationPath {
  id: string;
  title: string;
  subtitle: string;
  themeColor: PathTheme;
  totalProgress: number;
  nodes: PathNode[];
}

export const PATH_DATA: CultivationPath[] = [
  // ========================================
  // WARRIOR - Iron Way (Red/Ruby)
  // ========================================
  {
    id: 'warrior',
    title: 'Warrior',
    subtitle: 'Iron Way',
    themeColor: 'red',
    totalProgress: 0,
    nodes: [
      // Stage 1 - Training
      {
        id: 'warrior-1-center',
        title: 'Tempering',
        stage: 1,
        status: 'unlockable',
        starsRequired: 5,
        starsCurrent: 0,
        position: 'center',
        coreMasteries: [
          { 
            title: 'Structural Alignment', 
            benefit: 'Stack the skeleton correctly so gravity flows through bone, not muscle, establishing a leak-proof frame.' 
          },
          { 
            title: 'Fascial Knitting', 
            benefit: 'Develop \'Iron Tissue\' by training the connective bodysuit through extreme master-tempo movements.' 
          },
          { 
            title: 'The Iron Cauldron', 
            benefit: 'Master Reverse Breathing and the \'Anal Lock\' to compress internal pressure and store vital energy.' 
          }
        ],
      },
      // Stage 2 - Essence (Both can be unlocked)
      {
        id: 'warrior-2-left',
        title: 'Fluidity',
        stage: 2,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'warrior-2-right',
        title: 'Density',
        stage: 2,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 3 - Class (Point of No Return)
      {
        id: 'warrior-3-left',
        title: 'Ronin',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'warrior-3-center',
        title: 'Samurai',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'warrior-3-right',
        title: 'Knight',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 4 - Specialization
      {
        id: 'warrior-4-left',
        title: 'Vagabond',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'warrior-4-center',
        title: 'Shogun',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'warrior-4-right',
        title: 'Paladin',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 5 - Mastery
      {
        id: 'warrior-5-left',
        title: 'Blade-Saint',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'warrior-5-center',
        title: 'War-Lord',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'warrior-5-right',
        title: 'Iron-Wall',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 6 - Apex
      {
        id: 'warrior-6-center',
        title: 'Grandmaster',
        stage: 6,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'center',
      },
    ],
  },
  // ========================================
  // MAGE - Arcane Eye (Purple/Violet)
  // ========================================
  {
    id: 'mage',
    title: 'Mage',
    subtitle: 'Arcane Eye',
    themeColor: 'violet',
    totalProgress: 0,
    nodes: [
      // Stage 1 - Training
      {
        id: 'mage-1-center',
        title: 'Focus',
        stage: 1,
        status: 'unlockable',
        starsRequired: 5,
        starsCurrent: 0,
        position: 'center',
        coreMasteries: [
          { 
            title: 'Sustained Attention', 
            benefit: 'Training the ability to hold complex logical frameworks without mental collapse. This mastery creates the structural integrity required to maintain high-intensity concentration during systemic stress.' 
          },
          { 
            title: 'Pattern Recognition', 
            benefit: 'Developing the "Internal Eye" to detect the underlying code within noise. By synchronizing diverse data points, the mind learns to see connections and predict systemic outcomes with surgical precision.' 
          },
          { 
            title: 'Cognitive Efficiency', 
            benefit: 'Refining the mental engine to execute complex strategies with minimum resource drain. This focuses the mind on finding the "least effort" path to maximum output, optimizing every thought for the Forge.' 
          }
        ],
      },
      // Stage 2 - Essence
      {
        id: 'mage-2-left',
        title: 'Analysis',
        stage: 2,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'mage-2-right',
        title: 'Vision',
        stage: 2,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 3 - Class
      {
        id: 'mage-3-left',
        title: 'Scholar',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'mage-3-center',
        title: 'Sage',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'mage-3-right',
        title: 'Strategist',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 4 - Specialization
      {
        id: 'mage-4-left',
        title: 'Adept',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'mage-4-center',
        title: 'Arch-Mage',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'mage-4-right',
        title: 'Tactician',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 5 - Mastery
      {
        id: 'mage-5-left',
        title: 'Visionary',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'mage-5-center',
        title: 'Architect',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'mage-5-right',
        title: 'Overseer',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 6 - Apex
      {
        id: 'mage-6-center',
        title: 'Sage',
        stage: 6,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'center',
      },
    ],
  },
  // ========================================
  // MYSTIC - Silent Void (Emerald/Green)
  // ========================================
  {
    id: 'mystic',
    title: 'Mystic',
    subtitle: 'Silent Void',
    themeColor: 'emerald',
    totalProgress: 0,
    nodes: [
      // Stage 1 - Training
      {
        id: 'mystic-1-center',
        title: 'Presence',
        stage: 1,
        status: 'unlockable',
        starsRequired: 5,
        starsCurrent: 0,
        position: 'center',
        coreMasteries: [
          { 
            title: 'Internal Stillness', 
            benefit: 'Training the capacity to exist in the absolute "Zero-State." By silencing mental chatter and emotional static, you become a stable anchor that remains unmoved by the chaos of your environment.' 
          },
          { 
            title: 'Brave Honesty', 
            benefit: 'The practice of "Self-Recognition" through the Mirror. By speaking unvarnished truths and discarding social masks, you purify your internal waters to see reality without distortion.' 
          },
          { 
            title: 'Sensory Resonance', 
            benefit: 'Extending the "Antenna" of the soul beyond the physical skin. Learn to interpret the subtle weight, temperature, and "vibe" of spaces and intentions through intuitive calibration.' 
          }
        ],
      },
      // Stage 2 - Essence
      {
        id: 'mystic-2-left',
        title: 'Dissolution',
        stage: 2,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'mystic-2-right',
        title: 'Projection',
        stage: 2,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 3 - Class
      {
        id: 'mystic-3-left',
        title: 'Seer',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'mystic-3-center',
        title: 'Enlightened',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'mystic-3-right',
        title: 'Ascetic',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 4 - Specialization
      {
        id: 'mystic-4-left',
        title: 'Oracle',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'mystic-4-center',
        title: 'Hierophant',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'mystic-4-right',
        title: 'Anchor',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 5 - Mastery
      {
        id: 'mystic-5-left',
        title: 'Ethereal',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'mystic-5-center',
        title: 'Void-Walker',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'mystic-5-right',
        title: 'Spirit-Guard',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 6 - Apex
      {
        id: 'mystic-6-center',
        title: 'Saint',
        stage: 6,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'center',
      },
    ],
  },
  // ========================================
  // GUARDIAN - Eternal Pillar (Gold/Amber)
  // ========================================
  {
    id: 'guardian',
    title: 'Guardian',
    subtitle: 'Eternal Pillar',
    themeColor: 'gold',
    totalProgress: 0,
    nodes: [
      // Stage 1 - Training
      {
        id: 'guardian-1-center',
        title: 'Vow',
        stage: 1,
        status: 'unlockable',
        starsRequired: 5,
        starsCurrent: 0,
        position: 'center',
      },
      // Stage 2 - Essence
      {
        id: 'guardian-2-left',
        title: 'Constraint',
        stage: 2,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'guardian-2-right',
        title: 'Assertion',
        stage: 2,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 3 - Class
      {
        id: 'guardian-3-left',
        title: 'Warden',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'guardian-3-center',
        title: 'Sovereign',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'guardian-3-right',
        title: 'Votary',
        stage: 3,
        status: 'locked',
        starsRequired: 20,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 4 - Specialization
      {
        id: 'guardian-4-left',
        title: 'Sentinel',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'guardian-4-center',
        title: 'Imperator',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'guardian-4-right',
        title: 'Inquisitor',
        stage: 4,
        status: 'locked',
        starsRequired: 40,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 5 - Mastery
      {
        id: 'guardian-5-left',
        title: 'Aegis',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'left-branch',
      },
      {
        id: 'guardian-5-center',
        title: 'Monarch',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'center-branch',
      },
      {
        id: 'guardian-5-right',
        title: 'Exemplar',
        stage: 5,
        status: 'locked',
        starsRequired: 50,
        starsCurrent: 0,
        position: 'right-branch',
      },
      // Stage 6 - Apex
      {
        id: 'guardian-6-center',
        title: 'Sovereign',
        stage: 6,
        status: 'locked',
        starsRequired: 10,
        starsCurrent: 0,
        position: 'center',
      },
    ],
  },
];

export const THEME_COLORS = {
  red: {
    primary: '#e11d48',
    glow: 'rgba(225, 29, 72, 0.6)',
    bg: 'rgba(225, 29, 72, 0.1)',
  },
  violet: {
    primary: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.6)',
    bg: 'rgba(168, 85, 247, 0.1)',
  },
  emerald: {
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.6)',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  gold: {
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.6)',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
} as const;

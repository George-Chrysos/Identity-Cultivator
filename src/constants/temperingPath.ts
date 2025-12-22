/**
 * Tempering Path - Warrior Trainee Level Data (Levels 1-10)
 * Five-Gate System: Rooting, Foundation, Core, Flow, Breath
 * Goal: Transition from normal body to Rank C: Iron Tissue
 */

import { IdentityTemplate, TaskTemplate, SubtaskTemplate } from '@/types/database';
import { 
  registerPath, 
  PathConfig, 
  BaseLevelConfig,
} from './pathRegistry';

// ==================== CONSTANTS ====================

export const TEMPERING_TEMPLATE_ID = 'tempering-warrior-trainee';
export const TEMPERING_XP_PER_DAY = 40;

// ==================== LEVEL CONFIGURATIONS ====================

export interface TemperingLevelConfig {
  level: number;
  subtitle: string;
  xpToLevelUp: number;
  daysRequired: number;
  mainStatLimit: number; // Total Body points attainable in this level
  gateStatCap: number; // mainStatLimit / 5 gates
  baseCoins: number;      // Coins awarded per task completion
  baseBodyPoints: number; // Body stat points awarded per task completion
  tasks: {
    gate: 'rooting' | 'foundation' | 'core' | 'flow' | 'breath' | 'sealing';
    name: string;
    subtasks: { name: string; focus: string }[];
    focus: string;
  }[];
  trial: {
    name: string;
    rewards: { coins: number; stars: number; bodyPoints: number; item: string };
    tasks: string;
    focus: string;
  };
}

export const TEMPERING_LEVELS: TemperingLevelConfig[] = [
  // ⚔️ Level 1: The Awakening
  {
    level: 1,
    subtitle: 'The Awakening of the Vessel',
    xpToLevelUp: 120,
    daysRequired: 3,
    mainStatLimit: 1.0,
    gateStatCap: 1.0 / 5,
    baseCoins: 30,
    baseBodyPoints: 2,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting',
        subtasks: [{ name: 'Zhan Zhuang: 3 Minutes', focus: 'Crown pulling up, chest sinking, back rounding. Do not move.' }],
        focus: 'Crown pulling up, chest sinking, back rounding. Do not move.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation',
        subtasks: [{ name: 'Wall Sit: 1 Set × 30 Seconds', focus: 'Crush the lower back against the wall. Tuck the pelvis.' }],
        focus: 'Crush the lower back against the wall. Tuck the pelvis.',
      },
      {
        gate: 'core',
        name: 'The Core Link',
        subtasks: [{ name: 'Dead Bug: 1 Set × 5 Reps (Slow)', focus: 'Spinal glue. If the back arches, the connection is lost.' }],
        focus: 'Spinal glue. If the back arches, the connection is lost.',
      },
      {
        gate: 'flow',
        name: 'The Flow',
        subtasks: [{ name: '90/90 Hip Switch: 1 Set × 10 Reps', focus: 'Open the Kua (Hips) without using hands for support.' }],
        focus: 'Open the Kua (Hips) without using hands for support.',
      },
      {
        gate: 'breath',
        name: 'The Breath',
        subtasks: [{ name: 'Reverse Breathing: 5 Cycles', focus: 'Inhale (Belly in) / Exhale (Belly out). Find the rhythm.' }],
        focus: 'Inhale (Belly in) / Exhale (Belly out). Find the rhythm.',
      },
    ],
    trial: {
      name: 'The Bronze Statue',
      rewards: { coins: 200, stars: 1, bodyPoints: 1, item: 'Kaskol of Darkness' },
      tasks: 'Zhan Zhuang: 8 Minutes (Continuous)',
      focus: 'Total stillness. Observe the urge to itch or move, but do not react.',
    },
  },

  // ⚔️ Level 2: The Silent Accumulation
  {
    level: 2,
    subtitle: 'The Silent Accumulation',
    xpToLevelUp: 200,
    daysRequired: 5,
    mainStatLimit: 1.25,
    gateStatCap: 1.25 / 5,
    baseCoins: 35,
    baseBodyPoints: 3,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting',
        subtasks: [{ name: 'Zhan Zhuang: 5 Minutes', focus: 'Release the jaw and shoulders. Let the flesh hang off the bone.' }],
        focus: 'Release the jaw and shoulders. Let the flesh hang off the bone.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation',
        subtasks: [{ name: 'Wall Sit: 2 Sets × 30 Seconds', focus: 'Deepen the breath into the lower belly while under stress.' }],
        focus: 'Deepen the breath into the lower belly while under stress.',
      },
      {
        gate: 'core',
        name: 'The Core Link',
        subtasks: [{ name: 'Dead Bug: 2 Sets × 5 Reps', focus: 'Slower movement equals deeper fascial recruitment.' }],
        focus: 'Slower movement equals deeper fascial recruitment.',
      },
      {
        gate: 'flow',
        name: 'The Flow',
        subtasks: [{ name: '90/90 Hip Switch: 2 Sets × 10 Reps', focus: 'Visualize the hip joints becoming oiled and fluid.' }],
        focus: 'Visualize the hip joints becoming oiled and fluid.',
      },
      {
        gate: 'breath',
        name: 'The Breath',
        subtasks: [{ name: 'Reverse Breathing: 7 Cycles', focus: 'Condense the air into a "Pearl" 3 inches below the navel.' }],
        focus: 'Condense the air into a "Pearl" 3 inches below the navel.',
      },
    ],
    trial: {
      name: 'The Stone Roots',
      rewards: { coins: 300, stars: 1, bodyPoints: 1, item: 'Gentleman Gloves' },
      tasks: 'Zhan Zhuang: 10 Minutes + Wall Sit: 1 Set × 60 Seconds',
      focus: 'Transition without rest. Use leg fatigue to test the mind.',
    },
  },

  // ⚔️ Level 3: The Severing
  {
    level: 3,
    subtitle: 'The Severing of Support',
    xpToLevelUp: 280,
    daysRequired: 7,
    mainStatLimit: 1.5,
    gateStatCap: 1.5 / 5,
    baseCoins: 40,
    baseBodyPoints: 3,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting',
        subtasks: [{ name: 'Zhan Zhuang: 7 Minutes', focus: 'Connect to the "Bubbling Well" point on the soles of the feet.' }],
        focus: 'Connect to the "Bubbling Well" point on the soles of the feet.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation (Evolution)',
        subtasks: [{ name: 'Horse Stance (Ma Bu): 1 Set × 30 Seconds', focus: '2x Shoulder width. No wall. You are the only support.' }],
        focus: '2x Shoulder width. No wall. You are the only support.',
      },
      {
        gate: 'core',
        name: 'The Core Link',
        subtasks: [{ name: 'Dead Bug: 2 Sets × 8 Reps', focus: 'Eliminate the "click" in the hips through core engagement.' }],
        focus: 'Eliminate the "click" in the hips through core engagement.',
      },
      {
        gate: 'flow',
        name: 'The Flow',
        subtasks: [{ name: '90/90 Hip Switch: 2 Sets × 12 Reps', focus: 'Torso stays upright; do not lean back.' }],
        focus: 'Torso stays upright; do not lean back.',
      },
      {
        gate: 'breath',
        name: 'The Breath',
        subtasks: [{ name: 'Reverse Breathing: 9 Cycles', focus: 'Feel the rise of internal pressure (Intra-abdominal pressure).' }],
        focus: 'Feel the rise of internal pressure (Intra-abdominal pressure).',
      },
    ],
    trial: {
      name: 'The Unshakable Pillar',
      rewards: { coins: 500, stars: 2, bodyPoints: 1, item: 'Long Coat of Elegance' },
      tasks: 'Zhan Zhuang: 15 Minutes + Horse Stance: 3 Sets × 30 Seconds',
      focus: "Ronin's Indifference. Let the legs burn; the face remains calm.",
    },
  },

  // ⚔️ Level 4: The Kinetic Chain
  {
    level: 4,
    subtitle: 'The Kinetic Chain',
    xpToLevelUp: 360,
    daysRequired: 9,
    mainStatLimit: 1.75,
    gateStatCap: 1.75 / 5,
    baseCoins: 45,
    baseBodyPoints: 4,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting',
        subtasks: [{ name: 'Zhan Zhuang: 9 Minutes', focus: 'Drop the center of gravity. Sink into the earth.' }],
        focus: 'Drop the center of gravity. Sink into the earth.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation',
        subtasks: [
          { name: 'Horse Stance: 2 Sets × 30 Seconds', focus: 'Maintain posture.' },
          { name: 'Glute Bridge Hold: 1 Set × 30 Seconds', focus: 'Squeeze the glutes to seal the "Lower Gate."' },
        ],
        focus: 'Squeeze the glutes to seal the "Lower Gate."',
      },
      {
        gate: 'core',
        name: 'The Core Link',
        subtasks: [
          { name: 'Cat-Cow: 1 Set × 10 Reps (Slow)', focus: 'Spinal articulation. Wake up every vertebrae.' },
          { name: 'Dead Bug: 3 Sets × 8 Reps', focus: 'Maintain core engagement.' },
        ],
        focus: 'Spinal articulation. Wake up every vertebrae.',
      },
      {
        gate: 'flow',
        name: 'The Flow',
        subtasks: [{ name: '90/90 Hip Switch: 3 Sets × 12 Reps', focus: 'Imagine the hips are the engine of all movement.' }],
        focus: 'Imagine the hips are the engine of all movement.',
      },
      {
        gate: 'breath',
        name: 'The Breath',
        subtasks: [{ name: 'Reverse Breathing: 11 Cycles + Perineum Lock', focus: 'Seal the bottom of the cauldron on the inhale.' }],
        focus: 'Seal the bottom of the cauldron on the inhale.',
      },
    ],
    trial: {
      name: "The Serpent's Breath",
      rewards: { coins: 600, stars: 2, bodyPoints: 1, item: 'Bamboo Scroll' },
      tasks: 'Cat-Cow: 3 Minutes Continuous + Reverse Breathing: 25 Cycles (Seiza)',
      focus: 'The movement is a slave to the breath. Synchronize perfectly.',
    },
  },

  // ⚔️ Level 5: The Iron Cauldron
  {
    level: 5,
    subtitle: 'The Iron Cauldron',
    xpToLevelUp: 440,
    daysRequired: 11,
    mainStatLimit: 2.0,
    gateStatCap: 2.0 / 5,
    baseCoins: 50,
    baseBodyPoints: 4,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting',
        subtasks: [{ name: 'Zhan Zhuang: 11 Minutes', focus: 'Clear the mind. Thoughts are clouds; you are the sky.' }],
        focus: 'Clear the mind. Thoughts are clouds; you are the sky.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation',
        subtasks: [
          { name: 'Horse Stance: 2 Sets × 45 Seconds', focus: 'Bone Density. Imagine your skeleton is turning to iron.' },
          { name: 'Glute Bridge Hold: 2 Sets × 30 Seconds', focus: 'Maintain glute engagement.' },
        ],
        focus: 'Bone Density. Imagine your skeleton is turning to iron.',
      },
      {
        gate: 'core',
        name: 'The Core Link',
        subtasks: [
          { name: 'Hard-Style Plank: 1 Set × 30 Seconds', focus: 'Pull elbows to toes in plank. High-tension compression.' },
          { name: 'Cat-Cow: 2 Sets × 10 Reps', focus: 'Maintain spinal articulation.' },
        ],
        focus: 'Pull elbows to toes in plank. High-tension compression.',
      },
      {
        gate: 'flow',
        name: 'The Flow',
        subtasks: [{ name: 'Bird Dog: 2 Sets × 10 Reps (Slow)', focus: 'Reach for length, not height. Stretch the fascia.' }],
        focus: 'Reach for length, not height. Stretch the fascia.',
      },
      {
        gate: 'breath',
        name: 'The Breath',
        subtasks: [{ name: 'Reverse Breathing: 13 Cycles', focus: 'The chest must be a dead zone. Only the abdomen moves.' }],
        focus: 'The chest must be a dead zone. Only the abdomen moves.',
      },
    ],
    trial: {
      name: 'The Five-Minute Fire',
      rewards: { coins: 800, stars: 3, bodyPoints: 1, item: 'Copper Wrist Weights' },
      tasks: 'Horse Stance: 5 Minutes (Cumulative) + Plank: 2 Minutes (Cumulative)',
      focus: 'Embrace the shaking. It is the nervous system upgrading.',
    },
  },

  // ⚔️ Level 6: The Resonant Vessel
  {
    level: 6,
    subtitle: 'The Resonant Vessel',
    xpToLevelUp: 520,
    daysRequired: 13,
    mainStatLimit: 2.5,
    gateStatCap: 2.5 / 5,
    baseCoins: 55,
    baseBodyPoints: 5,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting',
        subtasks: [{ name: 'Zhan Zhuang: 13 Minutes + Low Frequency Hum', focus: 'Vibrate the internal organs to loosen deep tension.' }],
        focus: 'Vibrate the internal organs to loosen deep tension.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation',
        subtasks: [
          { name: 'Standard Push-ups: 3 Sets × 10 Reps', focus: 'Perfect form. Chest to floor.' },
          { name: 'Standard Squats: 3 Sets × 15 Reps', focus: 'Thighs to parallel.' },
        ],
        focus: 'Perfect form. Chest to floor. Thighs to parallel.',
      },
      {
        gate: 'core',
        name: 'The Core Link',
        subtasks: [
          { name: 'Plank: 3 Sets × 30 Seconds', focus: 'The "Body Suit." Connect the back to the front.' },
          { name: 'Superman Hold: 3 Sets × 30 Seconds', focus: 'Posterior chain engagement.' },
        ],
        focus: 'The "Body Suit." Connect the back to the front.',
      },
      {
        gate: 'flow',
        name: 'The Flow',
        subtasks: [{ name: 'Bear Mobility (Crawl): 3 Sets × 30 Seconds', focus: 'Keep hips low. Shoulders and core must work as one.' }],
        focus: 'Keep hips low. Shoulders and core must work as one.',
      },
      {
        gate: 'breath',
        name: 'The Breath',
        subtasks: [{ name: 'AAAAH Mantra (Sound): 15 Cycles', focus: 'Compress energy into the Dantian on the exhale sound.' }],
        focus: 'Compress energy into the Dantian on the exhale sound.',
      },
    ],
    trial: {
      name: 'The Thunderous Silence',
      rewards: { coins: 1200, stars: 3, bodyPoints: 1, item: 'Tiger Balm' },
      tasks: 'Zhan Zhuang: 20 Minutes + Bear Crawl: 2 Minutes (Continuous)',
      focus: 'Use the sound vibration to stay calm during the crawl.',
    },
  },

  // ⚔️ Level 7: The Rising Heat
  {
    level: 7,
    subtitle: 'The Rising Heat',
    xpToLevelUp: 600,
    daysRequired: 15,
    mainStatLimit: 2.5,
    gateStatCap: 2.5 / 5,
    baseCoins: 60,
    baseBodyPoints: 5,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting',
        subtasks: [{ name: 'Zhan Zhuang: 15 Minutes', focus: 'Feel the heat rising from the Bubbling Well to the Dantian.' }],
        focus: 'Feel the heat rising from the Bubbling Well to the Dantian.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation',
        subtasks: [
          { name: 'Tempo Push-ups (3s/3s): 3 Sets × 8 Reps', focus: 'Fascial recruitment. The slow speed forces the "Bodysuit" to knit.' },
          { name: 'Tempo Squats (3s/3s): 3 Sets × 12 Reps', focus: 'Maintain tempo control.' },
        ],
        focus: 'Fascial recruitment. The slow speed forces the "Bodysuit" to knit.',
      },
      {
        gate: 'core',
        name: 'The Core Link',
        subtasks: [
          { name: 'Side Planks: 3 Sets × 30 Seconds (Per Side)', focus: 'No drooping. The side of the vessel must be a solid shield.' },
          { name: 'Hollow Body Hold: 3 Sets × 20 Seconds', focus: 'Core compression.' },
        ],
        focus: 'No drooping. The side of the vessel must be a solid shield.',
      },
      {
        gate: 'flow',
        name: 'The Flow',
        subtasks: [
          { name: 'Bear Crawl: 45 Seconds', focus: 'Forward movement.' },
          { name: 'Monkey Mobility (Lateral): 3 Sets × 30 Seconds', focus: 'Open the hips laterally. Stay low and light.' },
        ],
        focus: 'Open the hips laterally. Stay low and light.',
      },
      {
        gate: 'breath',
        name: 'The Breath',
        subtasks: [{ name: 'AAAAH Mantra: 20 Cycles + Heat Circulation Visualization', focus: 'Direct the heat from the core to the fingertips.' }],
        focus: 'Direct the heat from the core to the fingertips.',
      },
    ],
    trial: {
      name: 'The Lateral Gate',
      rewards: { coins: 2000, stars: 3, bodyPoints: 1, item: 'Weighted Vest' },
      tasks: 'Monkey Flow: 3 Minutes + Horse Stance: 5 Minutes (Cumulative)',
      focus: 'Total control over the lateral lines of the body.',
    },
  },

  // ⚔️ Level 8: The Iron Shell
  {
    level: 8,
    subtitle: 'The Iron Shell',
    xpToLevelUp: 680,
    daysRequired: 17,
    mainStatLimit: 2.5,
    gateStatCap: 2.5 / 5,
    baseCoins: 65,
    baseBodyPoints: 6,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting',
        subtasks: [{ name: 'Zhan Zhuang: 20 Minutes', focus: 'Discomfort is information. Do not judge it.' }],
        focus: 'Discomfort is information. Do not judge it.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation',
        subtasks: [
          { name: 'Tempo Push-ups (5s/5s): 3 Sets × 6 Reps', focus: 'Depth and control.' },
          { name: 'Horse Stance: 2 Sets × 90 Seconds', focus: 'You should be lower now than at Level 3.' },
          { name: 'Cossack Squat: 3 Sets × 8 Reps/Side', focus: 'Lateral leg strength.' },
        ],
        focus: 'Depth. You should be lower now than at Level 3.',
      },
      {
        gate: 'core',
        name: 'The Core Link (Full Body)',
        subtasks: [
          { name: 'The Iron Shell (Isometrics): 5 Sets × 10 Seconds Max Tension', focus: 'Inhale → Exhale + Squeeze EVERY muscle at 100%. Vibrate.' },
          { name: 'Hollow Body Hold: 3 Sets × 35 Seconds', focus: 'Extended hold.' },
          { name: 'Lunge Hold (L/R): 3 Sets × 45 Seconds', focus: 'Static strength.' },
        ],
        focus: 'Iron Shell: Inhale → Exhale + Squeeze EVERY muscle at 100%. Vibrate.',
      },
      {
        gate: 'flow',
        name: 'The Flow',
        subtasks: [{ name: 'Bear (45s) + Monkey (45s) + Crab Mobility (30s)', focus: 'Crab: Open the chest and strengthen the posterior chain.' }],
        focus: 'Crab: Open the chest and strengthen the posterior chain.',
      },
      {
        gate: 'breath',
        name: 'The Breath',
        subtasks: [{ name: 'AAAAH Mantra: 25 Cycles + Jing Sealing', focus: 'Sync the "Iron Shell" squeeze with the "AAAAH" exhale.' }],
        focus: 'Sync the "Iron Shell" squeeze with the "AAAAH" exhale.',
      },
    ],
    trial: {
      name: 'The Diamond Body',
      rewards: { coins: 2500, stars: 4, bodyPoints: 1, item: 'Iron Wrist Beads' },
      tasks: 'Iron Shell: 20 Sets × 10s + Zhan Zhuang: 10 Minutes (Immediately after)',
      focus: 'Total exhaustion of the nervous system. The standing will feel light.',
    },
  },

  // ⚔️ Level 9: The Unbreaking Will
  {
    level: 9,
    subtitle: 'The Unbreaking Will',
    xpToLevelUp: 760,
    daysRequired: 19,
    mainStatLimit: 2.5,
    gateStatCap: 2.5 / 5,
    baseCoins: 70,
    baseBodyPoints: 6,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting',
        subtasks: [{ name: 'Zhan Zhuang: 25 Minutes', focus: 'There is no self. There is only the posture.' }],
        focus: 'There is no self. There is only the posture.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation',
        subtasks: [
          { name: 'Master Tempo Push-ups (10s/10s): 3 Sets × 5 Reps', focus: 'The muscles are dead; the fascia is alive. Push through honey.' },
          { name: 'Master Tempo Squats (10s/10s): 3 Sets × 8 Reps', focus: 'Ultra-slow control.' },
          { name: 'Archer Push-ups: 2 Sets × 5 Reps/Side', focus: 'Unilateral strength.' },
        ],
        focus: 'The muscles are dead; the fascia is alive. Push through honey.',
      },
      {
        gate: 'core',
        name: 'The Core Link (The Gauntlet)',
        subtasks: [
          { name: 'The 7 Pillar Gauntlet: Plank, Side L/R, Lunge L/R, Superman, Hollow Body (45s each)', focus: 'No rest between the 7 pillars. One unified cycle.' },
          { name: 'Iron Shell: 8 Sets × 15 Seconds', focus: 'Maximum tension.' },
        ],
        focus: 'No rest between the 7 pillars. One unified cycle.',
      },
      {
        gate: 'flow',
        name: 'The Flow',
        subtasks: [{ name: 'Animal Synthesis: 5 Minutes continuous Bear/Monkey/Crab', focus: 'Fluid transitions. Move like a predator.' }],
        focus: 'Fluid transitions. Move like a predator.',
      },
      {
        gate: 'breath',
        name: 'The Breath',
        subtasks: [{ name: 'AAAAH Mantra: 30 Cycles', focus: 'Advanced Jing Sealing. The "Fire" stays in the "Furnace."' }],
        focus: 'Advanced Jing Sealing. The "Fire" stays in the "Furnace."',
      },
    ],
    trial: {
      name: 'The Red Furnace',
      rewards: { coins: 3000, stars: 5, bodyPoints: 1, item: "Ronin's Bokken" },
      tasks: 'Master Tempo Gauntlet (10/10 Pushups + Squats) + 5m Animal Flow',
      focus: 'Maintain perfect tension and heat throughout the entire flow.',
    },
  },

  // ⚔️ Level 10: The Evolution Threshold
  {
    level: 10,
    subtitle: 'The Lighting of the Forge',
    xpToLevelUp: 840,
    daysRequired: 21,
    mainStatLimit: 2.5,
    gateStatCap: 2.5 / 5,
    baseCoins: 75,
    baseBodyPoints: 7,
    tasks: [
      {
        gate: 'rooting',
        name: 'The Rooting (Mastery)',
        subtasks: [{ name: 'Zhan Zhuang: 35 Minutes', focus: 'Mastery. The vessel can now contain any amount of pressure.' }],
        focus: 'Mastery. The vessel can now contain any amount of pressure.',
      },
      {
        gate: 'foundation',
        name: 'The Foundation (Mastery)',
        subtasks: [
          { name: 'Master Tempo (10s/10s) Push-ups: 5 Sets × 5 Reps', focus: 'You have become the Iron Way.' },
          { name: 'Archer Push-ups: 4 Sets × 8 Reps/Side', focus: 'Advanced unilateral strength.' },
          { name: 'Low Horse Stance (Thighs Parallel): 5 Sets × 2 Minutes', focus: 'Ultimate leg endurance.' },
        ],
        focus: 'You have become the Iron Way.',
      },
      {
        gate: 'core',
        name: 'The Core Link (The Iron Gauntlet)',
        subtasks: [
          { name: 'The 7 Pillar Gauntlet (90s each) + 10 Sets × 15s Iron Shell', focus: 'Absolute density. The body is a single, impenetrable unit.' },
        ],
        focus: 'Absolute density. The body is a single, impenetrable unit.',
      },
      {
        gate: 'flow',
        name: 'The Flow (The Chimera)',
        subtasks: [{ name: 'The Chimera Flow: 30 Minutes non-stop mobility (Bear/Monkey/Crab)', focus: 'Mastery of space. Moving with the weight of the world.' }],
        focus: 'Mastery of space. Moving with the weight of the world.',
      },
      {
        gate: 'breath',
        name: 'The Breath (Sealing)',
        subtasks: [{ name: 'Unified Vibration: 50 Cycles', focus: 'The spark becomes a constant fire. You are ready to Evolve.' }],
        focus: 'The spark becomes a constant fire. You are ready to Evolve.',
      },
    ],
    trial: {
      name: 'The Gate of Fire',
      rewards: { coins: 3000, stars: 1, bodyPoints: 50, item: 'Crown | Unlock: Stage 2' },
      tasks: 'Zhan Zhuang (30m) + Iron Shell (10 sets) + Recite the Vow',
      focus: 'This is the point of no return. You are no longer a trainee. You are a Warrior.',
    },
  },
];


// ==================== HELPER FUNCTIONS ====================

/**
 * Get level configuration by level number
 */
export const getTemperingLevel = (level: number): TemperingLevelConfig | undefined => {
  return TEMPERING_LEVELS.find(l => l.level === level);
};

/**
 * Generate identity template for a specific level
 */
export const generateTemperingIdentityTemplate = (level: number): IdentityTemplate => {
  const config = getTemperingLevel(level);
  if (!config) throw new Error(`Invalid tempering level: ${level}`);

  return {
    id: `${TEMPERING_TEMPLATE_ID}-lvl${level}`,
    name: `Tempering Lv.${level}`,
    primary_stat: 'BODY',
    tier: 'D',
    unlock_cost_stars: 0,
    description: `⚔️ Level ${level}: ${config.subtitle}`,
    parent_path_id: 'warrior-1-center', // Links to Tempering node in Path Tree
    created_at: new Date().toISOString(),
  };
};

/**
 * Generate task templates for a specific level
 * Tasks include path_id and path_level for dynamic reward lookup
 */
export const generateTemperingTaskTemplates = (level: number): TaskTemplate[] => {
  const config = getTemperingLevel(level);
  if (!config) throw new Error(`Invalid tempering level: ${level}`);

  const baseXpPerTask = Math.round(TEMPERING_XP_PER_DAY / config.tasks.length);

  return config.tasks.map((task) => {
    const taskId = `tempering-lvl${level}-task-${task.gate}`;
    
    const subtasks: SubtaskTemplate[] = task.subtasks.map((st, stIndex) => ({
      id: `${taskId}-subtask-${stIndex + 1}`,
      task_template_id: taskId,
      name: st.name,
      description: st.focus,
    }));

    return {
      id: taskId,
      identity_template_id: `${TEMPERING_TEMPLATE_ID}-lvl${level}`,
      name: task.name,
      target_stat: 'BODY',
      base_points_reward: config.baseBodyPoints,
      coin_reward: config.baseCoins,
      xp_reward: baseXpPerTask,
      description: task.focus,
      created_at: new Date().toISOString(),
      subtasks,
      // Path integration - enables dynamic reward lookup
      path_id: TEMPERING_TEMPLATE_ID,
      path_level: level,
    };
  });
};

/**
 * Generate trial info for a specific level
 */
export const getTemperingTrialInfo = (level: number) => {
  const config = getTemperingLevel(level);
  if (!config) return null;

  return {
    name: config.trial.name,
    description: config.trial.focus,
    tasks: config.trial.tasks,
    rewards: config.trial.rewards,
  };
};

/**
 * Get all tempering templates and tasks for mockDatabase initialization
 */
export const getAllTemperingData = () => {
  const templates: IdentityTemplate[] = [];
  const tasks: TaskTemplate[] = [];

  for (let level = 1; level <= 10; level++) {
    templates.push(generateTemperingIdentityTemplate(level));
    tasks.push(...generateTemperingTaskTemplates(level));
  }

  return { templates, tasks };
};

// ==================== PATH REGISTRY INTEGRATION ====================

/**
 * Convert TemperingLevelConfig to BaseLevelConfig for registry
 */
const convertToBaseLevelConfig = (config: TemperingLevelConfig): BaseLevelConfig => ({
  level: config.level,
  subtitle: config.subtitle,
  xpToLevelUp: config.xpToLevelUp,
  daysRequired: config.daysRequired,
  baseCoins: config.baseCoins,
  baseStatPoints: config.baseBodyPoints,
  primaryStat: 'BODY',
  tasks: config.tasks.map(t => ({
    gate: t.gate,
    name: t.name,
    subtasks: t.subtasks,
    focus: t.focus,
  })),
  trial: {
    name: config.trial.name,
    tasks: config.trial.tasks,
    focus: config.trial.focus,
    rewards: {
      coins: config.trial.rewards.coins,
      stars: config.trial.rewards.stars,
      bodyPoints: config.trial.rewards.bodyPoints,
      item: config.trial.rewards.item,
    },
  },
});

/**
 * Build and register the Tempering path configuration
 */
const TEMPERING_PATH_CONFIG: PathConfig = {
  metadata: {
    id: TEMPERING_TEMPLATE_ID,
    name: 'Tempering',
    description: 'Warrior Trainee path focusing on body cultivation through the Five-Gate System',
    primaryStat: 'BODY',
    tier: 'D',
    maxLevel: 10,
  },
  levels: TEMPERING_LEVELS.map(convertToBaseLevelConfig),
};

// Register this path with the central registry
registerPath(TEMPERING_PATH_CONFIG);

// Export for direct access if needed
export { TEMPERING_PATH_CONFIG };

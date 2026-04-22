/**
 * Mage Path - Scholar Training Level Data (Levels 1-10)
 * Two-Gate L1 System: Focus, Inquiry
 * Goal: Transition from dormant mind to Rank C: The Lucid Edge
 *
 * NOTE: Only Level 1 is currently authored for onboarding. Levels 2-10
 * are intentional placeholders (pending a full content pass) — their
 * rewards and XP curves are scaled sensibly but their task copy is
 * derived from L1 so the path is still playable end-to-end.
 */

import { IdentityTemplate, TaskTemplate, SubtaskTemplate } from '@/types/database';
import {
  registerPath,
  PathConfig,
  BaseLevelConfig,
} from './pathRegistry';

// ==================== CONSTANTS ====================

export const MAGE_TEMPLATE_ID = 'mage-scholar-training';
// Daily XP quota for the starter Level 1 onboarding pace (2 tasks × 8 XP = 16 / day,
// 48 XP over 3 days = level up). Higher levels have their own derived per-task XP.
export const MAGE_XP_PER_DAY = 16;

// ==================== LEVEL CONFIGURATIONS ====================

export interface MageLevelConfig {
  level: number;
  subtitle: string;
  xpToLevelUp: number;
  daysRequired: number;
  mainStatLimit: number; // Total Mind points attainable in this level
  gateStatCap: number;
  baseCoins: number;
  baseMindPoints: number;
  tasks: {
    gate: 'focus' | 'inquiry' | 'synthesis' | 'pattern' | 'clarity';
    name: string;
    subtasks: { name: string; focus: string }[];
    focus: string;
  }[];
  trial: {
    name: string;
    rewards: { coins: number; stars: number; mindPoints: number; item: string };
    tasks: string;
    focus: string;
  };
}

export const MAGE_LEVELS: MageLevelConfig[] = [
  // 🔮 Level 1: The Kindling Mind (Starter - 2 tasks, 3 days to level up)
  // L1 is intentionally gentle onboarding: the two foundational gates
  // (Focus + Inquiry). Levels 2-10 will expand into the full Five-Gate system.
  {
    level: 1,
    subtitle: 'The Kindling Mind',
    xpToLevelUp: 48,
    daysRequired: 3,
    mainStatLimit: 1.0,
    gateStatCap: 0.5,
    baseCoins: 30,
    baseMindPoints: 2,
    tasks: [
      {
        gate: 'focus',
        name: 'The Lens (Focus)',
        subtasks: [
          {
            name: 'Single-Point Attention: 5 Minutes',
            focus: 'Pick one object. Stare. When attention drifts, return without judgment. Start the inner engine.',
          },
        ],
        focus: 'Pick one object. Stare. When attention drifts, return without judgment.',
      },
      {
        gate: 'inquiry',
        name: 'The Question (Inquiry)',
        subtasks: [
          {
            name: 'One Honest Question: Write + Sit',
            focus: "Write one sincere 'Why?' question about your life. Sit with it for 3 minutes. Do not force an answer.",
          },
        ],
        focus: "Write one sincere 'Why?' question. Sit with it for 3 minutes.",
      },
    ],
    trial: {
      name: 'The Clear Page',
      rewards: { coins: 200, stars: 1, mindPoints: 1, item: 'Ink Vial' },
      tasks: 'Single-Point Attention: 10 Minutes + write the insight the question produced.',
      focus: 'Let the mind settle like silt in water. Write only what remains true after the stillness.',
    },
  },

  // TODO: author Levels 2-10 content. Placeholders below re-use L1 task shape
  // but scale xpToLevelUp / days / rewards so the formula stays consistent.
  ...generateMageLevelPlaceholders(),
];

function generateMageLevelPlaceholders(): MageLevelConfig[] {
  // Same curve as Tempering/Presence L2-L10 for consistency.
  const curve = [
    { level: 2, subtitle: 'The Widening Gaze', xpToLevelUp: 200, daysRequired: 5, coins: 35, mind: 3, trial: { coins: 300, stars: 1, item: 'Scribe Feather' } },
    { level: 3, subtitle: 'The Threading Thought', xpToLevelUp: 280, daysRequired: 7, coins: 40, mind: 3, trial: { coins: 500, stars: 2, item: 'Pocket Codex' } },
    { level: 4, subtitle: 'The Mapping Mind', xpToLevelUp: 360, daysRequired: 9, coins: 45, mind: 4, trial: { coins: 600, stars: 2, item: 'Runic Ink' } },
    { level: 5, subtitle: 'The Lucid Arc', xpToLevelUp: 440, daysRequired: 11, coins: 50, mind: 4, trial: { coins: 800, stars: 3, item: 'Oracle Lens' } },
    { level: 6, subtitle: 'The Prism of Reason', xpToLevelUp: 520, daysRequired: 13, coins: 55, mind: 5, trial: { coins: 1200, stars: 3, item: 'Crystal Quill' } },
    { level: 7, subtitle: 'The Weight of Insight', xpToLevelUp: 600, daysRequired: 15, coins: 60, mind: 5, trial: { coins: 2000, stars: 3, item: 'Mindforge Stone' } },
    { level: 8, subtitle: 'The Converging Axes', xpToLevelUp: 680, daysRequired: 17, coins: 65, mind: 6, trial: { coins: 2500, stars: 4, item: 'Lattice Prism' } },
    { level: 9, subtitle: 'The Unbroken Thread', xpToLevelUp: 760, daysRequired: 19, coins: 70, mind: 6, trial: { coins: 3000, stars: 5, item: 'Mage Bokken' } },
    { level: 10, subtitle: 'The Lucid Edge', xpToLevelUp: 840, daysRequired: 21, coins: 75, mind: 7, trial: { coins: 3000, stars: 1, item: 'The Lucid Edge | Unlock: Stage 2' } },
  ];

  return curve.map(({ level, subtitle, xpToLevelUp, daysRequired, coins, mind, trial }) => ({
    level,
    subtitle,
    xpToLevelUp,
    daysRequired,
    mainStatLimit: 1.0 + 0.25 * (level - 1),
    gateStatCap: 0.5,
    baseCoins: coins,
    baseMindPoints: mind,
    // Placeholder: reuse L1 task shape. Content pass pending.
    tasks: [
      {
        gate: 'focus' as const,
        name: 'The Lens (Focus)',
        subtasks: [
          { name: `Single-Point Attention: ${5 + level} Minutes`, focus: 'Deepen focus. Let distractions pass through you.' },
        ],
        focus: 'Deepen focus. Let distractions pass through you.',
      },
      {
        gate: 'inquiry' as const,
        name: 'The Question (Inquiry)',
        subtasks: [
          { name: 'Honest Question: Write + Sit', focus: 'Write. Sit. Listen. Refine the question before seeking the answer.' },
        ],
        focus: 'Write. Sit. Listen.',
      },
      {
        gate: 'synthesis' as const,
        name: 'The Weaving (Synthesis)',
        subtasks: [
          { name: 'Two Ideas, One Sentence', focus: 'Take two disparate ideas you encountered today. Bridge them in one sentence.' },
        ],
        focus: 'Take two disparate ideas you encountered today. Bridge them in one sentence.',
      },
      {
        gate: 'pattern' as const,
        name: 'The Lattice (Pattern)',
        subtasks: [
          { name: 'Find the Third', focus: 'Observe two patterns. Predict a third.' },
        ],
        focus: 'Observe two patterns. Predict a third.',
      },
      {
        gate: 'clarity' as const,
        name: 'The Edge (Clarity)',
        subtasks: [
          { name: 'One Paragraph, Unambiguous', focus: 'Write one paragraph stating something true. Remove every hedge.' },
        ],
        focus: 'Write one paragraph stating something true. Remove every hedge.',
      },
    ],
    trial: {
      name: `The Trial of ${subtitle}`,
      rewards: { coins: trial.coins, stars: trial.stars, mindPoints: 1, item: trial.item },
      tasks: 'Sustained Focus + Honest Inquiry (extended).',
      focus: 'Hold the thread for the full ritual without breaking.',
    },
  }));
}

// ==================== UTILITY FUNCTIONS ====================

export const getMageLevel = (level: number): MageLevelConfig | undefined => {
  return MAGE_LEVELS.find((l) => l.level === level);
};

export const generateMageIdentityTemplate = (level: number): IdentityTemplate => {
  const config = getMageLevel(level);
  if (!config) throw new Error(`Invalid mage level: ${level}`);

  return {
    id: `${MAGE_TEMPLATE_ID}-lvl${level}`,
    name: `Mage Lv.${level}`,
    primary_stat: 'MIND',
    tier: 'D',
    unlock_cost_stars: 0,
    description: `🔮 Level ${level}: ${config.subtitle}`,
    parent_path_id: 'mage-1-center', // Links to Focus node in Path Tree
    created_at: new Date().toISOString(),
  };
};

export const generateMageTaskTemplates = (level: number): TaskTemplate[] => {
  const config = getMageLevel(level);
  if (!config) throw new Error(`Invalid mage level: ${level}`);

  // Derive per-task XP from the level's own shape so that levels with a
  // different task count (e.g. L1 uses 2 tasks) still land on exactly
  // `xpToLevelUp` after `daysRequired` days of full completion.
  const baseXpPerTask = Math.max(
    1,
    Math.round(config.xpToLevelUp / (config.daysRequired * config.tasks.length))
  );

  return config.tasks.map((task) => {
    const taskId = `mage-lvl${level}-task-${task.gate}`;

    const subtasks: SubtaskTemplate[] = task.subtasks.map((st, stIndex) => ({
      id: `${taskId}-subtask-${stIndex + 1}`,
      task_template_id: taskId,
      name: st.name,
      description: st.focus,
    }));

    return {
      id: taskId,
      identity_template_id: `${MAGE_TEMPLATE_ID}-lvl${level}`,
      name: task.name,
      target_stat: 'MIND',
      base_points_reward: config.baseMindPoints,
      coin_reward: config.baseCoins,
      xp_reward: baseXpPerTask,
      description: task.focus,
      created_at: new Date().toISOString(),
      subtasks,
      path_id: MAGE_TEMPLATE_ID,
      path_level: level,
    };
  });
};

export const getMageTrialInfo = (level: number) => {
  const config = getMageLevel(level);
  if (!config) return null;

  return {
    name: config.trial.name,
    description: config.trial.focus,
    tasks: config.trial.tasks,
    rewards: config.trial.rewards,
  };
};

export const getAllMageData = () => {
  const templates: IdentityTemplate[] = [];
  const tasks: TaskTemplate[] = [];

  for (let level = 1; level <= 10; level++) {
    templates.push(generateMageIdentityTemplate(level));
    tasks.push(...generateMageTaskTemplates(level));
  }

  return { templates, tasks };
};

// ==================== PATH REGISTRY INTEGRATION ====================

const convertToBaseLevelConfig = (config: MageLevelConfig): BaseLevelConfig => ({
  level: config.level,
  subtitle: config.subtitle,
  xpToLevelUp: config.xpToLevelUp,
  daysRequired: config.daysRequired,
  baseCoins: config.baseCoins,
  baseStatPoints: config.baseMindPoints,
  primaryStat: 'MIND',
  tasks: config.tasks.map((t) => ({
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
      mindPoints: config.trial.rewards.mindPoints,
      item: config.trial.rewards.item,
    },
  },
});

const MAGE_PATH_CONFIG: PathConfig = {
  metadata: {
    id: MAGE_TEMPLATE_ID,
    name: 'Mage',
    description: 'Scholar Training path focusing on mind cultivation through focused inquiry',
    primaryStat: 'MIND',
    tier: 'D',
    maxLevel: 10,
  },
  levels: MAGE_LEVELS.map(convertToBaseLevelConfig),
};

registerPath(MAGE_PATH_CONFIG);

export { MAGE_PATH_CONFIG };

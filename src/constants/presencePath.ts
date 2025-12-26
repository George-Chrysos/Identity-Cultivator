/**
 * Presence Path - Mystic Training Level Data (Levels 1-10)
 * Five-Gate System: Stillness, Reflection, Insight, Sensing, Disclosure
 * Goal: Transition from dormant spirit to Rank C: The Resonant Cord
 */

import { IdentityTemplate, TaskTemplate, SubtaskTemplate } from '@/types/database';
import { 
  registerPath, 
  PathConfig, 
  BaseLevelConfig,
} from './pathRegistry';

// ==================== CONSTANTS ====================

export const PRESENCE_TEMPLATE_ID = 'presence-mystic-training';
export const PRESENCE_XP_PER_DAY = 40;

// ==================== LEVEL CONFIGURATIONS ====================

export interface PresenceLevelConfig {
  level: number;
  subtitle: string;
  xpToLevelUp: number;
  daysRequired: number;
  mainStatLimit: number; // Total Soul points attainable in this level
  gateStatCap: number; // mainStatLimit / 5 gates
  baseCoins: number;      // Coins awarded per task completion
  baseSoulPoints: number; // Soul stat points awarded per task completion
  tasks: {
    gate: 'stillness' | 'reflection' | 'insight' | 'sensing' | 'disclosure' ;
    name: string;
    subtasks: { name: string; focus: string }[];
    focus: string;
  }[];
  trial: {
    name: string;
    rewards: { coins: number; stars: number; soulPoints: number; item: string };
    tasks: string;
    focus: string;
  };
}

export const PRESENCE_LEVELS: PresenceLevelConfig[] = [
  {
    "level": 1,
    "subtitle": "The First Ripple",
    "xpToLevelUp": 120,
    "daysRequired": 3,
    "mainStatLimit": 1.0,
    "gateStatCap": 0.2,
    "baseCoins": 30,
    "baseSoulPoints": 2,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void (Stillness)",
        "subtasks": [
          { "name": "The Drop: Set 2 Timers", "focus": "When timer rings: Stop. Drop shoulders. Unclench jaw. Reset to zero." }
        ],
        "focus": "When timer rings: Stop. Drop shoulders. Unclench jaw. Reset to zero."
      },
      {
        "gate": "reflection",
        "name": "The Mirror (Self-Knowing)",
        "subtasks": [
          { "name": "The Gaze: 2 Minutes", "focus": "Look at your reflection. Do not fix your hair. Just say 'I am here.'" }
        ],
        "focus": "Look at your reflection. Do not fix your hair. Just say 'I am here.'"
      },
      {
        "gate": "insight",
        "name": "The Sight (Symbolism)",
        "subtasks": [
          { "name": "Card Draw: Single Card", "focus": "Look at the image. What is the very first emotion you feel? Trust it." }
        ],
        "focus": "Look at the image. What is the very first emotion you feel? Trust it."
      },
      {
        "gate": "sensing",
        "name": "The Sonar (Sensation)",
        "subtasks": [
          { "name": "Gravity Check: Basic Weight", "focus": "Feel the physical weight of your body pressing into the chair/floor. Let gravity hold you." }
        ],
        "focus": "Feel the physical weight of your body pressing into the chair/floor. Let gravity hold you."
      },
      {
        "gate": "disclosure",
        "name": "The Altar (Truth)",
        "subtasks": [
          { "name": "Ritual of Truth: 1 Sentence", "focus": "Say aloud one feeling you have right now. No editing. Speak it to the empty room." }
        ],
        "focus": "Say aloud one feeling you have right now. No editing. Speak it to the empty room."
      }
    ],
    "trial": {
      "name": "The Quiet Room",
      "rewards": { "coins": 200, "stars": 1, "soulPoints": 1, "item": "Rough Quartz" },
      "tasks": "The Drop (Continuous Awareness) + 10 Minutes Silence",
      "focus": "When the urge to move comes, treat it like a passing cloud. Watch it float by."
    }
  },
  {
    "level": 2,
    "subtitle": "The Settling Dust",
    "xpToLevelUp": 200,
    "daysRequired": 5,
    "mainStatLimit": 1.25,
    "gateStatCap": 0.25,
    "baseCoins": 35,
    "baseSoulPoints": 3,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void",
        "subtasks": [
          { "name": "The Drop: Set 3 Timers", "focus": "Increase frequency. Catch the tension before it settles." }
        ],
        "focus": "Increase frequency. Catch the tension before it settles."
      },
      {
        "gate": "reflection",
        "name": "The Mirror",
        "subtasks": [
          { "name": "Eye Contact: 3 Minutes", "focus": "Look into your own pupils. Breathe as if the reflection is breathing with you." }
        ],
        "focus": "Look into your own pupils. Breathe as if the reflection is breathing with you."
      },
      {
        "gate": "insight",
        "name": "The Sight",
        "subtasks": [
          { "name": "Card Draw: Single Card", "focus": "Observe the colors. Do they feel warm or cold? Connect color to emotion." }
        ],
        "focus": "Observe the colors. Do they feel warm or cold? Connect color to emotion."
      },
      {
        "gate": "sensing",
        "name": "The Sonar",
        "subtasks": [
          { "name": "Gravity Check: Heavy Limbs", "focus": "Feel the weight specifically in your arms and legs. Imagine they are made of lead." }
        ],
        "focus": "Feel the weight specifically in your arms and legs. Imagine they are made of lead."
      },
      {
        "gate": "disclosure",
        "name": "The Altar",
        "subtasks": [
          { "name": "Ritual of Truth: The Annoyance", "focus": "Say aloud one thing that annoyed you today. Do not justify it. Just state it." }
        ],
        "focus": "Say aloud one thing that annoyed you today. Do not justify it. Just state it."
      }
    ],
    "trial": {
      "name": "The Soft Gaze",
      "rewards": { "coins": 300, "stars": 1, "soulPoints": 1, "item": "Candle of Focus" },
      "tasks": "Mirror Gaze: 5 Minutes + Gravity Check: 5 Minutes",
      "focus": "Stare until the face softens. Feel the body sink into the earth."
    }
  },
  {
    "level": 3,
    "subtitle": "The Deepening Waters",
    "xpToLevelUp": 280,
    "daysRequired": 7,
    "mainStatLimit": 1.5,
    "gateStatCap": 0.3,
    "baseCoins": 40,
    "baseSoulPoints": 3,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void",
        "subtasks": [
          { "name": "The Drop: Set 4 Timers", "focus": "Upon dropping, hold the stillness for 10 seconds before moving." },
          { "name": "Breath Counting: 5 Minutes", "focus": "Count exhalations 1 to 10." }
        ],
        "focus": "Upon dropping, hold the stillness for 10 seconds before moving."
      },
      {
        "gate": "reflection",
        "name": "The Mirror",
        "subtasks": [
          { "name": "The Stranger: 5 Minutes", "focus": "Look at your face until it feels unfamiliar. Separate 'You' from the 'Form'." }
        ],
        "focus": "Look at your face until it feels unfamiliar. Separate 'You' from the 'Form'."
      },
      {
        "gate": "insight",
        "name": "The Sight",
        "subtasks": [
          { "name": "Card Draw: Single Card", "focus": "Ask a question before drawing. Does the card answer 'Yes' or 'No' based on vibe?" }
        ],
        "focus": "Ask a question before drawing. Does the card answer 'Yes' or 'No' based on vibe?"
      },
      {
        "gate": "sensing",
        "name": "The Sonar",
        "subtasks": [
          { "name": "Gravity Check: Tension Mapping", "focus": "Feel the weight, then scan for resistance. Where is the body fighting gravity?" }
        ],
        "focus": "Feel the weight, then scan for resistance. Where is the body fighting gravity?"
      },
      {
        "gate": "disclosure",
        "name": "The Altar",
        "subtasks": [
          { "name": "Ritual of Truth: The Secret", "focus": "Say aloud a secret you are keeping. Let the room hear it." }
        ],
        "focus": "Say aloud a secret you are keeping. Let the room hear it."
      }
    ],
    "trial": {
      "name": "The Silent Hour",
      "rewards": { "coins": 500, "stars": 2, "soulPoints": 1, "item": "Silk Blindfold" },
      "tasks": "Digital Fast: 60 Minutes + 4x Drop Triggers",
      "focus": "Withdraw the senses. Let the boredom wash over you until it becomes peace."
    }
  },
  {
    "level": 4,
    "subtitle": "The Anchor in Chaos",
    "xpToLevelUp": 360,
    "daysRequired": 9,
    "mainStatLimit": 1.75,
    "gateStatCap": 0.35,
    "baseCoins": 45,
    "baseSoulPoints": 4,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void",
        "subtasks": [
          { "name": "The Drop: Set 5 Timers", "focus": "Drop instantly. No hesitation. The body should react like a puppet cutting strings." },
          { "name": "The Pause: 10 Minutes", "focus": "Imagine you are a stone at the bottom of a lake. Water moves; you do not." }
        ],
        "focus": "Drop instantly. No hesitation. The body should react like a puppet cutting strings."
      },
      {
        "gate": "reflection",
        "name": "The Mirror",
        "subtasks": [
          { "name": "The Judge: 7 Minutes", "focus": "Notice every judgment that arises about your face. Let them go." }
        ],
        "focus": "Notice every judgment that arises about your face. Let them go."
      },
      {
        "gate": "insight",
        "name": "The Sight",
        "subtasks": [
          { "name": "Card Draw: Single Card", "focus": "Draw. Close eyes. Visualize the card. What detail stands out in memory?" },
          { "name": "Symbol Hunt", "focus": "Find a shape in the clouds/pavement. Assign it a meaning." }
        ],
        "focus": "Draw. Close eyes. Visualize the card. What detail stands out in memory?"
      },
      {
        "gate": "sensing",
        "name": "The Sonar",
        "subtasks": [
          { "name": "Gravity Check: The Center", "focus": "Feel the weight. Locate the exact center of your gravity in the belly." }
        ],
        "focus": "Feel the weight. Locate the exact center of your gravity in the belly."
      },
      {
        "gate": "disclosure",
        "name": "The Altar",
        "subtasks": [
          { "name": "Ritual of Truth: The Failure", "focus": "Say aloud one thing you failed at recently. Own it completely." }
        ],
        "focus": "Say aloud one thing you failed at recently. Own it completely."
      }
    ],
    "trial": {
      "name": "The Rooted Mind",
      "rewards": { "coins": 600, "stars": 2, "soulPoints": 1, "item": "Incense of Memory" },
      "tasks": "The Pause: 20 Minutes (Continuous) + Ritual of Truth",
      "focus": "Your legs may numb. Relax into the discomfort. Speak the truth to clear the vessel."
    }
  },
  {
    "level": 5,
    "subtitle": "The First Awakening",
    "xpToLevelUp": 440,
    "daysRequired": 11,
    "mainStatLimit": 2.0,
    "gateStatCap": 0.4,
    "baseCoins": 50,
    "baseSoulPoints": 4,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void",
        "subtasks": [
          { "name": "The Drop: Set 6 Timers", "focus": "Integrate 'The Drop' into conversation or work without stopping." },
          { "name": "Zazen (Just Sitting): 15 Minutes", "focus": "Eyes open, facing a wall. Merge with the wall." }
        ],
        "focus": "Integrate 'The Drop' into conversation or work without stopping."
      },
      {
        "gate": "reflection",
        "name": "The Mirror",
        "subtasks": [
          { "name": "The Trance: 10 Minutes", "focus": "The reflection is no longer you. You are the observer of the reflection." }
        ],
        "focus": "The reflection is no longer you. You are the observer of the reflection."
      },
      {
        "gate": "insight",
        "name": "The Sight",
        "subtasks": [
          { "name": "Card Draw: Three Card Spread", "focus": "Past / Present / Future. Trust your first narrative string." }
        ],
        "focus": "Past / Present / Future. Trust your first narrative string."
      },
      {
        "gate": "sensing",
        "name": "The Sonar",
        "subtasks": [
          { "name": "Gravity Check: The Flow", "focus": "Feel the weight. Now feel the blood moving through the heavy limbs." }
        ],
        "focus": "Feel the weight. Now feel the blood moving through the heavy limbs."
      },
      {
        "gate": "disclosure",
        "name": "The Altar",
        "subtasks": [
          { "name": "Ritual of Truth: The Burning", "focus": "Write down a mask you wear. Read it aloud. Safely burn the paper." }
        ],
        "focus": "Write down a mask you wear. Read it aloud. Safely burn the paper."
      }
    ],
    "trial": {
      "name": "The Ritual of Truth",
      "rewards": { "coins": 800, "stars": 3, "soulPoints": 1, "item": "Amulet of the Seer" },
      "tasks": "The Burning Ritual + Zazen: 20 Minutes",
      "focus": "Empty the vessel. Then purify it with fire. You are ready to receive."
    }
  },
  {
    "level": 6,
    "subtitle": "The Prismatic Weight",
    "xpToLevelUp": 520,
    "daysRequired": 13,
    "mainStatLimit": 2.5,
    "gateStatCap": 0.45,
    "baseCoins": 55,
    "baseSoulPoints": 5,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void",
        "subtasks": [
          { "name": "The Drop: Set 7 Timers", "focus": "Drop deeper. Relax internal organs, not just muscles." },
          { "name": "Zazen: 20 Minutes", "focus": "When you want to stop, that is when the real sitting begins." }
        ],
        "focus": "Drop deeper. Relax internal organs, not just muscles."
      },
      {
        "gate": "reflection",
        "name": "The Mirror",
        "subtasks": [
          { "name": "Soft Focus Gaze: 10 Minutes", "focus": "Let the face blur. See the energy field, not the skin." }
        ],
        "focus": "Let the face blur. See the energy field, not the skin."
      },
      {
        "gate": "insight",
        "name": "The Sight",
        "subtasks": [
          { "name": "Card Draw: 3 Cards", "focus": "Link the cards to a physical sensation in the body." },
          { "name": "Color Sensing", "focus": "Stare at Red. Does it feel heavy? Stare at Blue. Is it cool?" }
        ],
        "focus": "Link the cards to a physical sensation in the body."
      },
      {
        "gate": "sensing",
        "name": "The Sonar",
        "subtasks": [
          { "name": "Gravity Check: Expansion", "focus": "Feel the weight. Now feel your presence expanding 1 inch beyond the skin." }
        ],
        "focus": "Feel the weight. Now feel your presence expanding 1 inch beyond the skin."
      },
      {
        "gate": "disclosure",
        "name": "The Altar",
        "subtasks": [
          { "name": "Ritual of Truth: The Hard Truth", "focus": "Admit a flaw to yourself aloud. Do not promise to fix it. Just accept it exists." }
        ],
        "focus": "Admit a flaw to yourself aloud. Do not promise to fix it. Just accept it exists."
      }
    ],
    "trial": {
      "name": "The Weight of Light",
      "rewards": { "coins": 1200, "stars": 3, "soulPoints": 1, "item": "Prism Shard" },
      "tasks": "Color Sensing (Red/Blue/Green) + Zazen: 25 Minutes",
      "focus": "Feel the frequency of the light entering your eyes."
    }
  },
  {
    "level": 7,
    "subtitle": "The Invisible Touch",
    "xpToLevelUp": 600,
    "daysRequired": 15,
    "mainStatLimit": 2.5,
    "gateStatCap": 0.5,
    "baseCoins": 60,
    "baseSoulPoints": 5,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void",
        "subtasks": [
          { "name": "The Drop: Set 8 Timers", "focus": "Instant dissolve. Drop the mental chatter along with the shoulders." },
          { "name": "Space Between Thoughts: 20 Minutes", "focus": "Hunt for the silence between mental chatter. Widen the gap." }
        ],
        "focus": "Instant dissolve. Drop the mental chatter along with the shoulders."
      },
      {
        "gate": "reflection",
        "name": "The Mirror",
        "subtasks": [
          { "name": "The Dissociation: 12 Minutes", "focus": "Dissociate from the name. You are just consciousness looking at a form." }
        ],
        "focus": "Dissociate from the name. You are just consciousness looking at a form."
      },
      {
        "gate": "insight",
        "name": "The Sight",
        "subtasks": [
          { "name": "Card Draw: 3 Cards", "focus": "Read the story of the cards aloud as if reciting a history." },
          { "name": "Lucidity Check", "focus": "Ask yourself 5x today: 'Am I dreaming?' Look at your hands." }
        ],
        "focus": "Read the story of the cards aloud as if reciting a history."
      },
      {
        "gate": "sensing",
        "name": "The Sonar",
        "subtasks": [
          { "name": "Gravity Check: The Room", "focus": "Feel your weight. Now feel the 'weight' of the empty space in the room." },
          { "name": "Heat Mapping", "focus": "Eyes closed. Find the sun or lamp by heat alone." }
        ],
        "focus": "Feel your weight. Now feel the 'weight' of the empty space in the room."
      },
      {
        "gate": "disclosure",
        "name": "The Altar",
        "subtasks": [
          { "name": "Ritual of Truth: The Vow", "focus": "Speak a vow to your future self aloud. What will you never tolerate again?" }
        ],
        "focus": "Speak a vow to your future self aloud. What will you never tolerate again?"
      }
    ],
    "trial": {
      "name": "The Blind Navigator",
      "rewards": { "coins": 2000, "stars": 3, "soulPoints": 1, "item": "Velvet Hood" },
      "tasks": "Gravity Check (Room) + Heat Mapping",
      "focus": "Move through your space without sight. If you feel fear, stop and breathe."
    }
  },
  {
    "level": 8,
    "subtitle": "The Resonance",
    "xpToLevelUp": 680,
    "daysRequired": 17,
    "mainStatLimit": 2.5,
    "gateStatCap": 0.5,
    "baseCoins": 65,
    "baseSoulPoints": 6,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void",
        "subtasks": [
          { "name": "The Drop: Set 9 Timers", "focus": "Drop is now subconscious. You are checking for tension constantly." },
          { "name": "White Noise Meditation: 25 Minutes", "focus": "Listen to static. Find the pattern within the chaos." }
        ],
        "focus": "Drop is now subconscious. You are checking for tension constantly."
      },
      {
        "gate": "reflection",
        "name": "The Mirror",
        "subtasks": [
          { "name": "Scrying: 15 Minutes", "focus": "Low light. Stare until the face disappears and becomes shadow." }
        ],
        "focus": "Low light. Stare until the face disappears and becomes shadow."
      },
      {
        "gate": "insight",
        "name": "The Sight",
        "subtasks": [
          { "name": "Card Draw: 3 Cards", "focus": "Do not look at meanings. Trust purely the visual intuition." },
          { "name": "Pattern Hunt", "focus": "Find 3 synchronicities (numbers, words) today." }
        ],
        "focus": "Do not look at meanings. Trust purely the visual intuition."
      },
      {
        "gate": "sensing",
        "name": "The Sonar",
        "subtasks": [
          { "name": "Gravity Check: Object Vibe", "focus": "Feel your weight. Then pick up an object. Feel the 'weight' of its history." }
        ],
        "focus": "Feel your weight. Then pick up an object. Feel the 'weight' of its history."
      },
      {
        "gate": "disclosure",
        "name": "The Altar",
        "subtasks": [
          { "name": "Ritual of Truth: The Release", "focus": "Identify a grudge. Say aloud: 'I release this weight.' Feel the body lighten." }
        ],
        "focus": "Identify a grudge. Say aloud: 'I release this weight.' Feel the body lighten."
      }
    ],
    "trial": {
      "name": "The Static Field",
      "rewards": { "coins": 2500, "stars": 4, "soulPoints": 1, "item": "Tuning Fork" },
      "tasks": "White Noise: 30 Minutes + Ritual of Release",
      "focus": "Maintain absolute internal silence while chaos plays in your ears."
    }
  },
  {
    "level": 9,
    "subtitle": "The Open Channel",
    "xpToLevelUp": 760,
    "daysRequired": 19,
    "mainStatLimit": 2.5,
    "gateStatCap": 0.5,
    "baseCoins": 70,
    "baseSoulPoints": 6,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void",
        "subtasks": [
          { "name": "The Drop: Set 10 Timers", "focus": "You are living in a state of dropped tension." },
          { "name": "The Great Silence: 30 Minutes", "focus": "No specific focus. Just floating in the empty space." }
        ],
        "focus": "You are living in a state of dropped tension."
      },
      {
        "gate": "reflection",
        "name": "The Mirror",
        "subtasks": [
          { "name": "The Unified Gaze: 15 Minutes", "focus": "There is no mirror. There is no you. There is only seeing." }
        ],
        "focus": "There is no mirror. There is no you. There is only seeing."
      },
      {
        "gate": "insight",
        "name": "The Sight",
        "subtasks": [
          { "name": "Card Draw: Full Spread", "focus": "Read the entire situation of your life through the cards." },
          { "name": "Prediction Game", "focus": "Guess who messaged you before looking. Tune the radio." }
        ],
        "focus": "Read the entire situation of your life through the cards."
      },
      {
        "gate": "sensing",
        "name": "The Sonar",
        "subtasks": [
          { "name": "Gravity Check: The Aura", "focus": "Feel weight. Feel tension. Feel the energy field extending 1 foot out." },
          { "name": "Room Read", "focus": "Enter a space. Identify the most stressed person without looking." }
        ],
        "focus": "Feel weight. Feel tension. Feel the energy field extending 1 foot out."
      },
      {
        "gate": "disclosure",
        "name": "The Altar",
        "subtasks": [
          { "name": "Ritual of Truth: Absolute Honesty", "focus": "Say aloud the one thing you are most afraid is true. Accept it." }
        ],
        "focus": "Say aloud the one thing you are most afraid is true. Accept it."
      }
    ],
    "trial": {
      "name": "The Clear Vessel",
      "rewards": { "coins": 3000, "stars": 5, "soulPoints": 1, "item": "Crystal Sphere" },
      "tasks": "Ritual of Absolute Honesty + Great Silence (40m)",
      "focus": "You are now a conduit. Let reality flow through you without sticking."
    }
  },
  {
    "level": 10,
    "subtitle": "The Resonant Cord",
    "xpToLevelUp": 840,
    "daysRequired": 21,
    "mainStatLimit": 2.5,
    "gateStatCap": 0.5,
    "baseCoins": 75,
    "baseSoulPoints": 7,
    "tasks": [
      {
        "gate": "stillness",
        "name": "The Void (Mastery)",
        "subtasks": [
          { "name": "The Drop: Every Hour", "focus": "Perpetual stillness in motion." },
          { "name": "The Long Sit: 45 Minutes", "focus": "Mastery. Time dissolves. Pain dissolves. You are the Void." }
        ],
        "focus": "Mastery. Time dissolves. Pain dissolves. You are the Void."
      },
      {
        "gate": "reflection",
        "name": "The Mirror (Mastery)",
        "subtasks": [
          { "name": "The Soul Gaze: 20 Minutes", "focus": "Look until the physical form is irrelevant. See the 'Ghost' inside." }
        ],
        "focus": "Look until the physical form is irrelevant. See the 'Ghost' inside."
      },
      {
        "gate": "insight",
        "name": "The Sight (Mastery)",
        "subtasks": [
          { "name": "Card Draw: The Life Read", "focus": "Draw cards for a stranger (or imagine one). Write their story. Trust details." }
        ],
        "focus": "Draw cards for a stranger (or imagine one). Write their story. Trust details."
      },
      {
        "gate": "sensing",
        "name": "The Sonar (Mastery)",
        "subtasks": [
          { "name": "Gravity Check: Atmosphere Control", "focus": "Feel the weight. Relax so deeply that you feel the room relax with you." }
        ],
        "focus": "Feel the weight. Relax so deeply that you feel the room relax with you."
      },
      {
        "gate": "disclosure",
        "name": "The Altar (Mastery)",
        "subtasks": [
          { "name": "Ritual of Truth: The Final Disclosure", "focus": "Say aloud who you WERE. Say aloud who you ARE. Burn the past." }
        ],
        "focus": "Say aloud who you WERE. Say aloud who you ARE. Burn the past."
      }
    ],
    "trial": {
      "name": "The Rite of the Void",
      "rewards": { "coins": 3000, "stars": 1, "soulPoints": 50, "item": "The Third Eye | Unlock: Stage 2" },
      "tasks": "The Long Sit (60m) + The Final Disclosure",
      "focus": "You are no longer looking for the signal. You ARE the signal."
    }
  }
];

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get presence level configuration by level number
 */
export const getPresenceLevel = (level: number): PresenceLevelConfig | undefined => {
  return PRESENCE_LEVELS.find(l => l.level === level);
};

/**
 * Generate identity template for a specific level
 */
export const generatePresenceIdentityTemplate = (level: number): IdentityTemplate => {
  const config = getPresenceLevel(level);
  if (!config) throw new Error(`Invalid presence level: ${level}`);

  return {
    id: `${PRESENCE_TEMPLATE_ID}-lvl${level}`,
    name: `Presence Lv.${level}`,
    primary_stat: 'SOUL',
    tier: 'D',
    unlock_cost_stars: 0,
    description: `🔮 Level ${level}: ${config.subtitle}`,
    parent_path_id: 'mystic-1-center', // Links to Presence node in Path Tree
    created_at: new Date().toISOString(),
  };
};

/**
 * Generate task templates for a specific level
 * Tasks include path_id and path_level for dynamic reward lookup
 */
export const generatePresenceTaskTemplates = (level: number): TaskTemplate[] => {
  const config = getPresenceLevel(level);
  if (!config) throw new Error(`Invalid presence level: ${level}`);

  const baseXpPerTask = Math.round(PRESENCE_XP_PER_DAY / config.tasks.length);

  return config.tasks.map((task) => {
    const taskId = `presence-lvl${level}-task-${task.gate}`;
    
    const subtasks: SubtaskTemplate[] = task.subtasks.map((st, stIndex) => ({
      id: `${taskId}-subtask-${stIndex + 1}`,
      task_template_id: taskId,
      name: st.name,
      description: st.focus,
    }));

    return {
      id: taskId,
      identity_template_id: `${PRESENCE_TEMPLATE_ID}-lvl${level}`,
      name: task.name,
      target_stat: 'SOUL',
      base_points_reward: config.baseSoulPoints,
      coin_reward: config.baseCoins,
      xp_reward: baseXpPerTask,
      description: task.focus,
      created_at: new Date().toISOString(),
      subtasks,
      // Path integration - enables dynamic reward lookup
      path_id: PRESENCE_TEMPLATE_ID,
      path_level: level,
    };
  });
};

/**
 * Generate trial info for a specific level
 */
export const getPresenceTrialInfo = (level: number) => {
  const config = getPresenceLevel(level);
  if (!config) return null;

  return {
    name: config.trial.name,
    description: config.trial.focus,
    tasks: config.trial.tasks,
    rewards: config.trial.rewards,
  };
};

/**
 * Get all presence templates and tasks for mockDatabase initialization
 */
export const getAllPresenceData = () => {
  const templates: IdentityTemplate[] = [];
  const tasks: TaskTemplate[] = [];

  for (let level = 1; level <= 10; level++) {
    templates.push(generatePresenceIdentityTemplate(level));
    tasks.push(...generatePresenceTaskTemplates(level));
  }

  return { templates, tasks };
};

// ==================== PATH REGISTRY INTEGRATION ====================

/**
 * Convert PresenceLevelConfig to BaseLevelConfig for registry
 */
const convertToBaseLevelConfig = (config: PresenceLevelConfig): BaseLevelConfig => ({
  level: config.level,
  subtitle: config.subtitle,
  xpToLevelUp: config.xpToLevelUp,
  daysRequired: config.daysRequired,
  baseCoins: config.baseCoins,
  baseStatPoints: config.baseSoulPoints,
  primaryStat: 'SOUL',
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
      soulPoints: config.trial.rewards.soulPoints,
      item: config.trial.rewards.item,
    },
  },
});

/**
 * Build and register the Presence path configuration
 */
const PRESENCE_PATH_CONFIG: PathConfig = {
  metadata: {
    id: PRESENCE_TEMPLATE_ID,
    name: 'Presence',
    description: 'Mystic Training path focusing on soul cultivation through the Five-Gate System',
    primaryStat: 'SOUL',
    tier: 'D',
    maxLevel: 10,
  },
  levels: PRESENCE_LEVELS.map(convertToBaseLevelConfig),
};

// Register this path with the central registry
registerPath(PRESENCE_PATH_CONFIG);

// Export for direct access if needed
export { PRESENCE_PATH_CONFIG };

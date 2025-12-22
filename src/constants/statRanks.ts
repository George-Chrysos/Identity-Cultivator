/**
 * Stat Ranking System for Initial User Setup
 * Based on Internal Arts Cultivation
 */

export type StatRank = 'E' | 'D' | 'C' | 'B' | 'A';
export type StatType = 'body' | 'mind' | 'soul' | 'will';

export interface StatRankDefinition {
  rank: StatRank;
  title: string;
  description: string;
  reality: string;
  pointValue: number; // Starting point value for this rank
}

export interface StatRankingData {
  stat: StatType;
  title: string;
  attribute: string;
  ranks: StatRankDefinition[];
}

/**
 * Point mapping for ranks (start of range)
 * E: 10-14, D: 20-24, C: 30-34, B: 40-44, A: 50-54
 */
const RANK_POINT_MAP: Record<StatRank, number> = {
  'E': 10,
  'D': 20,
  'C': 30,
  'B': 40,
  'A': 50,
};

export const STAT_RANKING_DATA: Record<StatType, StatRankingData> = {
  body: {
    stat: 'body',
    title: 'BODY (The Warrior Path)',
    attribute: 'Structural Density & Kinetic Force',
    ranks: [
      {
        rank: 'E',
        title: 'The Leaking Vessel',
        description: 'The average modern human. Disconnected kinetic chain. Posture collapses under gravity. Movements are jerky and rely on isolated muscle groups. Energy "leaks" through tension and poor alignment.',
        reality: 'Can\'t touch toes, back hurts after standing for 10 mins.',
        pointValue: RANK_POINT_MAP.E,
      },
      {
        rank: 'D',
        title: 'The Aligned Structure',
        description: 'The "Warrior Trainee." The skeleton is stacked correctly (gravity flows through bones, not muscles). The "Cockpit" is established. Leaks are sealed, and the body can withstand static stress (Zhan Zhuang) without shaking.',
        reality: 'Can hold Horse Stance for 2+ minutes. Posture is effortlessly straight.',
        pointValue: RANK_POINT_MAP.D,
      },
      {
        rank: 'C',
        title: 'The Iron Tissue',
        description: 'Fascia and tendons have knit together into a "bodysuit." The body feels heavy to others but light to the self. Strikes begin to carry the weight of the whole body, not just the arm.',
        reality: '"Old Man Strength." Hard to push over. Muscles feel like dense rubber, not pumped balloons.',
        pointValue: RANK_POINT_MAP.C,
      },
      {
        rank: 'B',
        title: 'The Flowing Mercury',
        description: 'The Qi (bio-electricity) flows without resistance. Reflexes surpass conscious thought (Mushin). The body heals rapidly from injury. Movement is silent and fluid like water.',
        reality: 'Peak athletic performance. Can generate heat in the palms at will.',
        pointValue: RANK_POINT_MAP.B,
      },
      {
        rank: 'A',
        title: 'The Uncarved Block (Peak Human)',
        description: 'Bone Marrow Washing is complete. The skeleton is dense as lead. The body can endure impacts that would break normal bones. The "Inner Fire" is fully ignited and pressurizing the skin.',
        reality: 'Can break a baseball bat with a shin. Can stand in snow without shivering. Ready to manifest Fa Jing (S Rank).',
        pointValue: RANK_POINT_MAP.A,
      },
    ],
  },
  mind: {
    stat: 'mind',
    title: 'MIND (The Mage Path)',
    attribute: 'Yi (Intent) & Visualization Capacity',
    ranks: [
      {
        rank: 'E',
        title: 'The Monkey Mind',
        description: 'Attention span is fragmented (<8 seconds). Thoughts are reactive to the environment. Unable to visualize clearly. "Third-Person" daydreaming dominates; cannot ground in reality.',
        reality: 'Doomsurfing, brain fog, anxiety loops.',
        pointValue: RANK_POINT_MAP.E,
      },
      {
        rank: 'D',
        title: 'The Focused Lens',
        description: 'Can maintain "Mono-Tasking." The Yi can stay on one object (e.g., a candle or breath) for 5+ minutes without drifting. The "Observer" is active.',
        reality: 'Can read a book for an hour without checking the phone.',
        pointValue: RANK_POINT_MAP.D,
      },
      {
        rank: 'C',
        title: 'The Architect',
        description: 'Visualization becomes stable. Can construct complex 3D mental images and rotate them. The mind can direct the body\'s nervous system (e.g., "warm the hands" actually raises temp).',
        reality: 'Photographic memory improves. Emotional regulation is high.',
        pointValue: RANK_POINT_MAP.C,
      },
      {
        rank: 'B',
        title: 'The Laser Point',
        description: 'Yi becomes heavy. When you focus on a body part, blood flows there instantly. You can perform complex calculations while under physical stress. The "Seals" are unbreakable.',
        reality: 'You can lower your heart rate at will. People feel "pressure" when you look at them.',
        pointValue: RANK_POINT_MAP.B,
      },
      {
        rank: 'A',
        title: 'The Reality Interface',
        description: 'The boundary between "Imagination" and "Sensation" dissolves. If you imagine fire, your cells react as if burned. The mind processes information in parallel streams.',
        reality: 'Time dilation (time seems to slow down during crises). Ready to manifest Elemental Projection (S Rank).',
        pointValue: RANK_POINT_MAP.A,
      },
    ],
  },
  soul: {
    stat: 'soul',
    title: 'SOUL (The Mystic Path)',
    attribute: 'Shen (Spirit) & Perception',
    ranks: [
      {
        rank: 'E',
        title: 'The Dormant Ghost',
        description: 'Spirit is trapped in the head. Numb to the environment. High potential (if talented) but ungrounded, leading to exhaustion. Cannot distinguish between "my emotions" and "others\' emotions."',
        reality: 'Drained by crowds. "Vibe" blind.',
        pointValue: RANK_POINT_MAP.E,
      },
      {
        rank: 'D',
        title: 'The Awakened Eye',
        description: 'The "Antenna" extends. Gut feelings (intuition) become consistently accurate 70% of the time. Can sense tension in a room immediately upon entering.',
        reality: 'You know who is calling before looking at the phone.',
        pointValue: RANK_POINT_MAP.D,
      },
      {
        rank: 'C',
        title: 'The Resonant Cord',
        description: 'Empathy becomes a controlled tool, not a burden. Can "scan" a person and detect their basic emotional state (Fear, Anger, Joy) without them speaking. Synchronicities occur daily.',
        reality: 'Animals and children are strangely drawn to you.',
        pointValue: RANK_POINT_MAP.C,
      },
      {
        rank: 'B',
        title: 'The Lucid Traveler',
        description: 'The veil between conscious and subconscious thins. Lucid dreaming is frequent. You can access "Flow State" on command. You can feel the Qi field of plants and trees.',
        reality: 'You can navigate pitch-black rooms by "feeling" obstacles.',
        pointValue: RANK_POINT_MAP.B,
      },
      {
        rank: 'A',
        title: 'The Gnostic Vessel',
        description: 'Direct knowing (Gnosis). You don\'t "guess"; you "download" information. You can see the static/light (Aura) around living things. The Shen is anchored in the Dantian but expanded infinite outwards.',
        reality: 'You can feel someone staring at you from 100 meters away. Ready for Astral Projection (S Rank).',
        pointValue: RANK_POINT_MAP.A,
      },
    ],
  },
  will: {
    stat: 'will',
    title: 'WILL (The Protector Path)',
    attribute: 'Wei Qi (Defense) & Endurance',
    ranks: [
      {
        rank: 'E',
        title: 'The Paper Shield',
        description: 'Willpower is dependent on mood or motivation. Gives up at the first sign of discomfort. External validation is the only fuel. Boundaries are porous; you say "yes" when you want to say "no."',
        reality: 'Quits a workout because "it\'s raining."',
        pointValue: RANK_POINT_MAP.E,
      },
      {
        rank: 'D',
        title: 'The Wooden Gate',
        description: 'Discipline overrides motivation. Can stick to a routine for 21 days. Can say "No" to distractions. The "Morning Seals" are respected.',
        reality: 'Does the workout even when tired.',
        pointValue: RANK_POINT_MAP.D,
      },
      {
        rank: 'C',
        title: 'The Stone Wall',
        description: 'Pain Tolerance increases. Discomfort is viewed as data, not suffering. Emotional attacks from others bounce off. The "Glass Wall" visualization is effective.',
        reality: 'Can take a cold shower without flinching. Unbothered by insults.',
        pointValue: RANK_POINT_MAP.C,
      },
      {
        rank: 'B',
        title: 'The Iron Bunker',
        description: 'The Wei Qi (defensive energy) begins to thicken effectively. You don\'t get sick easily. You can endure extreme environments (heat/cold) by stabilizing internal temperature. Fear is suppressed by duty.',
        reality: 'Can hold a plank until muscles fail without the mind quitting.',
        pointValue: RANK_POINT_MAP.B,
      },
      {
        rank: 'A',
        title: 'The Diamond Core',
        description: 'Indomitable. The reality of the mind overrides the reality of the body. If the body says "collapse," the Will says "stand," and the body obeys. The aura is dense enough to make others step back physically.',
        reality: 'Presence alone de-escalates conflicts. Ready to manifest Physical Invulnerability (S Rank).',
        pointValue: RANK_POINT_MAP.A,
      },
    ],
  },
};

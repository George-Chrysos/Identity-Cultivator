/**
 * Archetype templates — the static catalogue the scroll wheel draws from.
 *
 * Each archetype has a 100-rung level ladder with placeholder task text.
 * The rhythm is deliberately simple so content can be tuned per archetype
 * later: a single primary task at L1 that grows in intensity, with a
 * secondary task joining around L10 and a tertiary flourish around L25.
 * Numbers and wording are stubs the user will refine.
 */

import type { ArchetypeTemplate, LevelEntry } from '@/types/identity';

// Band label for a given level — shown as the "intensity" tag on cards.
const bandFor = (level: number): string => {
  if (level <= 5) return 'Kindling';
  if (level <= 15) return 'Warming';
  if (level <= 30) return 'Forging';
  if (level <= 50) return 'Tempering';
  if (level <= 75) return 'Ascending';
  if (level <= 99) return 'Embodiment';
  return 'Apotheosis';
};

/**
 * Shared scaler: returns a multiplier that grows gradually with level.
 * Minutes, reps, pages, etc. are computed off this to keep the feel
 * predictable across archetypes.
 */
const scale = (level: number, base: number, growthPerLevel: number): number => {
  return Math.round(base + growthPerLevel * (level - 1));
};

// ----- Hermes: the Messenger / Trickster ---------------------------------

const hermesLevels: LevelEntry[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const walkMin = scale(level, 10, 0.5); // 10min -> ~60min by L100
  const tasks: { title: string; detail?: string }[] = [
    {
      title: `Move on your feet for ${walkMin} minutes`,
      detail: 'Walk, jog or run — any pace that keeps breath just beyond comfortable.',
    },
  ];
  if (level >= 10) {
    tasks.push({
      title: 'Send a message that matters',
      detail: 'One sincere check-in, small favour, or clear ask. Two lines is enough.',
    });
  }
  if (level >= 25) {
    const stretchMin = scale(level, 3, 0.1);
    tasks.push({
      title: `Close with ${stretchMin} minutes of mobility`,
      detail: 'Ankles, hips, shoulders — unlock the body you just moved.',
    });
  }
  return { level, tasks, intensity: bandFor(level) };
});

// ----- Musashi: the Wanderer / Warrior -----------------------------------

const musashiLevels: LevelEntry[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const breathMin = scale(level, 2, 0.15);
  const practiceMin = scale(level, 5, 0.6);
  const tasks: { title: string; detail?: string }[] = [
    {
      title: `${breathMin} minutes of seated breathing`,
      detail: 'Box breathing or slow nasal 4-4-4-4. Eyes softly closed.',
    },
    {
      title: `${practiceMin} minutes of deliberate practice`,
      detail: 'One chosen craft — striking, writing, coding, carving. No multitask.',
    },
  ];
  if (level >= 15) {
    tasks.push({
      title: 'Write one line in your book of five rings',
      detail: 'A single observation, lesson, or resolve from today.',
    });
  }
  if (level >= 40) {
    tasks.push({
      title: 'Refuse one small comfort',
      detail: 'Cold finish to a shower, skip the sweetener, take the stairs.',
    });
  }
  return { level, tasks, intensity: bandFor(level) };
});

// ----- Wukong: the Rebel / Trickster-Sovereign ---------------------------

const wukongLevels: LevelEntry[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const playMin = scale(level, 8, 0.4);
  const strengthReps = scale(level, 10, 1);
  const tasks: { title: string; detail?: string }[] = [
    {
      title: `${playMin} minutes of playful movement`,
      detail: 'Dance, climb, parkour, shadowbox, skip — irreverent and light.',
    },
    {
      title: `${strengthReps} push-ups (or incline equivalent)`,
      detail: 'Split across the day is fine. Full range; honest tempo.',
    },
  ];
  if (level >= 10) {
    tasks.push({
      title: 'Break one self-imposed rule',
      detail: 'A harmless, daft one. Wear the wrong socks. Take the long way home.',
    });
  }
  if (level >= 30) {
    tasks.push({
      title: 'Laugh out loud once, on purpose',
      detail: 'Find the absurd in today and let it land.',
    });
  }
  return { level, tasks, intensity: bandFor(level) };
});

// ----- Sovereign: the Steady King ----------------------------------------

const sovereignLevels: LevelEntry[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const planMin = scale(level, 3, 0.1);
  const tasks: { title: string; detail?: string }[] = [
    {
      title: `${planMin} minutes of daily triage`,
      detail: 'Name the ONE thing that will make today a win if it ships.',
    },
    {
      title: 'Tidy one square metre of your realm',
      detail: 'Desk, shelf, corner of the kitchen. Leave it noticeably better.',
    },
  ];
  if (level >= 10) {
    tasks.push({
      title: 'Make one clean decision before noon',
      detail: 'A yes, a no, a when. Write it down so future-you can see it.',
    });
  }
  if (level >= 35) {
    tasks.push({
      title: 'End the day by closing an open loop',
      detail: 'Reply, cancel, confirm, or explicitly defer with a date.',
    });
  }
  return { level, tasks, intensity: bandFor(level) };
});

// ----- Sage: the Quiet Scholar -------------------------------------------

const sageLevels: LevelEntry[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const readMin = scale(level, 10, 0.5);
  const tasks: { title: string; detail?: string }[] = [
    {
      title: `Read for ${readMin} minutes`,
      detail: 'Slow, marginalia welcome. A book, essay, or paper — not a feed.',
    },
    {
      title: 'Write one sentence you understood',
      detail: 'In your own words. If you cannot, read slower, not more.',
    },
  ];
  if (level >= 15) {
    const thinkMin = scale(level, 5, 0.2);
    tasks.push({
      title: `${thinkMin} minutes of untethered thought`,
      detail: 'No input. Walk or sit. Let the question surface on its own.',
    });
  }
  if (level >= 40) {
    tasks.push({
      title: 'Teach one idea to someone (or to a page)',
      detail: 'If you cannot explain it plainly, you do not yet own it.',
    });
  }
  return { level, tasks, intensity: bandFor(level) };
});

// ----- Artisan: the Hand that Makes --------------------------------------

const artisanLevels: LevelEntry[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const makeMin = scale(level, 15, 0.75);
  const tasks: { title: string; detail?: string }[] = [
    {
      title: `${makeMin} minutes at the bench`,
      detail: 'Produce something small. Ugly drafts count; zero lines do not.',
    },
    {
      title: 'Name the next concrete move',
      detail: 'When you stop, leave a single breadcrumb so tomorrow-you starts fast.',
    },
  ];
  if (level >= 10) {
    tasks.push({
      title: 'Show the work to one set of eyes',
      detail: 'A friend, a mirror, a reference. Silence is a slow poison for craft.',
    });
  }
  if (level >= 35) {
    tasks.push({
      title: 'Ship one small thing today',
      detail: 'Post it, send it, print it. Done is a muscle.',
    });
  }
  return { level, tasks, intensity: bandFor(level) };
});

// -----------------------------------------------------------------------

export const ARCHETYPES: ArchetypeTemplate[] = [
  {
    id: 'hermes',
    name: 'Hermes',
    archetype: 'Trickster / Messenger',
    tagline: 'The one who moves, and makes others move.',
    description:
      'Quick feet, quick words, quick thresholds. Hermes crosses between worlds; his cultivation is kinetic and communicative.',
    lore:
      'Winged at the ankles, crowned with the caduceus. Patron of travellers, traders, and tricksters alike. Bind Hermes when you want momentum in your legs and your correspondence.',
    accent: 'cyan',
    glyph: '\u269A', // staff of Hermes
    levels: hermesLevels,
  },
  {
    id: 'musashi',
    name: 'Musashi',
    archetype: 'Wanderer / Warrior',
    tagline: 'Two swords, one mind.',
    description:
      'Quiet, deliberate, lethal in a single discipline. Musashi is the archetype of craft plus composure.',
    lore:
      'Author of the Book of Five Rings; undefeated swordsman of Edo-era Japan. He cultivated in solitude: one thousand days to forge the spirit, ten thousand to polish it. Bind Musashi when you want depth and equanimity.',
    accent: 'violet',
    glyph: '\u2694', // crossed swords
    levels: musashiLevels,
  },
  {
    id: 'wukong',
    name: 'Wukong',
    archetype: 'Rebel / Trickster-Sovereign',
    tagline: 'Laugh first, then lift the mountain.',
    description:
      'The Monkey King. Boisterous, defiant, absurdly strong, absurdly loyal. Wukong is cultivation as play.',
    lore:
      'Born of stone, schooled by sages, chained by heaven, freed by pilgrimage. His rod shrinks to fit behind his ear and stretches to prop up the sky. Bind Wukong when you want strength without solemnity.',
    accent: 'gold',
    glyph: '\u2600', // sun / rod
    levels: wukongLevels,
  },
  {
    id: 'sovereign',
    name: 'Sovereign',
    archetype: 'Sovereign / Steward',
    tagline: 'You do not wear the crown; you answer to it.',
    description:
      'The archetype of benevolent authority over your own domain: decisions, environment, word kept.',
    lore:
      'The sovereign is not the loudest in the room; they are the one who can close an open loop, make a call, and set the weather of the day. Bind the Sovereign when your realm needs a king.',
    accent: 'magenta',
    glyph: '\u265A', // chess king
    levels: sovereignLevels,
  },
  {
    id: 'sage',
    name: 'Sage',
    archetype: 'Sage / Hermit',
    tagline: 'The patient mind is a quiet blade.',
    description:
      'Unhurried study, clear thought, generous synthesis. The Sage cultivates understanding, not opinions.',
    lore:
      'From the hermit on the mountain to the scholar at the window, this archetype trusts slow inputs and longer silences. Bind the Sage when you want to think in years, not hours.',
    accent: 'emerald',
    glyph: '\u25B2', // mountain / triangle
    levels: sageLevels,
  },
  {
    id: 'artisan',
    name: 'Artisan',
    archetype: 'Artisan / Maker',
    tagline: 'Make. Show. Refine. Repeat.',
    description:
      'Hands-on, iterative, productive. The Artisan measures days in drafts shipped, not ideas hoarded.',
    lore:
      'From the forge to the IDE, the Artisan treats craft as devotion. A daily practice of small, honest output stacks into mastery. Bind the Artisan when you need to stop planning and start making.',
    accent: 'rose',
    glyph: '\u2692', // hammer
    levels: artisanLevels,
  },
];

export const ARCHETYPES_BY_ID: Record<string, ArchetypeTemplate> = ARCHETYPES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, ArchetypeTemplate>
);

export const getArchetype = (id: string): ArchetypeTemplate | undefined =>
  ARCHETYPES_BY_ID[id];

/**
 * Return the level entry for a given archetype + level, clamped to the
 * ladder length (so L >= max returns the final tier).
 */
export const getLevelEntry = (
  templateId: string,
  level: number
): LevelEntry | undefined => {
  const template = getArchetype(templateId);
  if (!template) return undefined;
  const clamped = Math.max(1, Math.min(template.levels.length, level));
  return template.levels[clamped - 1];
};

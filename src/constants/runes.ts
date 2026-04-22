/**
 * Runes — atomic tags of the Grimoire.
 *
 * Runes replace text-heavy forms for daily logging. The canonical set stays
 * small (~12) so the RuneGrid remains a 3x4 constellation — cognitively
 * trivial. Category colors are assigned via CSS variables in index.css so
 * they stay theme-consistent.
 *
 * Convention: rune ids are kebab-case with a `rune-` prefix. iconName values
 * are Lucide React icon names (imported dynamically in RuneGrid).
 */
import type { Rune } from '@/types/database';

export const RUNES: readonly Rune[] = [
  // ==================== ACTION RUNES ====================
  {
    id: 'rune-trained',
    label: 'Trained',
    category: 'action',
    iconName: 'Dumbbell',
    auraDelta: 0.1,
    statHint: 'body',
  },
  {
    id: 'rune-studied',
    label: 'Studied',
    category: 'action',
    iconName: 'BookOpen',
    auraDelta: 0.1,
    statHint: 'mind',
  },
  {
    id: 'rune-meditated',
    label: 'Meditated',
    category: 'action',
    iconName: 'Infinity',
    auraDelta: 0.12,
    statHint: 'soul',
  },
  {
    id: 'rune-created',
    label: 'Created',
    category: 'action',
    iconName: 'Sparkles',
    auraDelta: 0.1,
    statHint: 'mind',
  },
  {
    id: 'rune-connected',
    label: 'Connected',
    category: 'action',
    iconName: 'HeartHandshake',
    auraDelta: 0.08,
    statHint: 'soul',
  },

  // ==================== STATE RUNES ====================
  {
    id: 'rune-energized',
    label: 'Energized',
    category: 'state',
    iconName: 'Zap',
    auraDelta: 0.08,
  },
  {
    id: 'rune-drained',
    label: 'Drained',
    category: 'state',
    iconName: 'BatteryLow',
    auraDelta: -0.06,
  },
  {
    id: 'rune-focused',
    label: 'Focused',
    category: 'state',
    iconName: 'Crosshair',
    auraDelta: 0.08,
  },
  {
    id: 'rune-scattered',
    label: 'Scattered',
    category: 'state',
    iconName: 'Wind',
    auraDelta: -0.04,
  },

  // ==================== MERCY RUNES ====================
  // Mercy runes are NEVER negative in their framing. They soften the aura
  // rather than penalizing it. This is the anti-shame surface.
  {
    id: 'rune-rest',
    label: 'Rested',
    category: 'mercy',
    iconName: 'Moon',
    auraDelta: 0,
  },
  {
    id: 'rune-reset',
    label: 'Reset',
    category: 'mercy',
    iconName: 'RotateCcw',
    auraDelta: 0,
  },
  {
    id: 'rune-slipped',
    label: 'Slipped',
    category: 'mercy',
    iconName: 'Waves',
    auraDelta: 0,
  },
] as const;

/** Map for O(1) lookup by rune id. */
export const RUNE_BY_ID: Record<string, Rune> = Object.fromEntries(
  RUNES.map((rune) => [rune.id, rune])
);

/** Grouped by category for grid layout (3x4 default: 5 action / 4 state / 3 mercy). */
export const RUNES_BY_CATEGORY = {
  action: RUNES.filter((r) => r.category === 'action'),
  state: RUNES.filter((r) => r.category === 'state'),
  mercy: RUNES.filter((r) => r.category === 'mercy'),
} as const;

/** Well-known mercy rune IDs used by auto-entries in ChronosManager / StreakManager. */
export const MERCY_RUNE_IDS = {
  REST: 'rune-rest',
  RESET: 'rune-reset',
  SLIPPED: 'rune-slipped',
} as const;

/**
 * Sum the aura delta contribution of a set of runes logged today.
 * Clamped to [-1, 1] so extreme rune-spam can't saturate the aura in either
 * direction. Consumed by useVitalityAura.
 */
export const sumAuraDelta = (runeIds: readonly string[]): number => {
  if (runeIds.length === 0) return 0;
  let total = 0;
  for (const id of runeIds) {
    total += RUNE_BY_ID[id]?.auraDelta ?? 0;
  }
  return Math.max(-1, Math.min(1, total));
};

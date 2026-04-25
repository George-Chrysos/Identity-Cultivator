/**
 * Visual accent tokens for archetype cards.
 *
 * Each accent ties to a consistent set of Tailwind-friendly classes and raw
 * rgb values so components can compose borders, glows, gradients and text
 * colour without re-defining the palette in every file.
 */

import type { ArchetypeTemplate } from '@/types/identity';

export interface AccentPalette {
  border: string;
  borderStrong: string;
  glow: string; // hex/rgba for inline box-shadow
  textSoft: string;
  textStrong: string;
  gradientFrom: string;
  gradientTo: string;
  chipBg: string;
}

type AccentKey = ArchetypeTemplate['accent'];

export const ACCENT_PALETTES: Record<AccentKey, AccentPalette> = {
  cyan: {
    border: 'border-cyan-400/40',
    borderStrong: 'border-cyan-300/80',
    glow: 'rgba(34,211,238,0.55)',
    textSoft: 'text-cyan-200/80',
    textStrong: 'text-cyan-200',
    gradientFrom: 'from-cyan-500/25',
    gradientTo: 'to-violet-700/25',
    chipBg: 'bg-cyan-500/15',
  },
  violet: {
    border: 'border-violet-400/40',
    borderStrong: 'border-violet-300/80',
    glow: 'rgba(168,85,247,0.55)',
    textSoft: 'text-violet-200/80',
    textStrong: 'text-violet-200',
    gradientFrom: 'from-violet-600/25',
    gradientTo: 'to-cyan-500/25',
    chipBg: 'bg-violet-500/15',
  },
  magenta: {
    border: 'border-fuchsia-400/40',
    borderStrong: 'border-fuchsia-300/80',
    glow: 'rgba(217,70,239,0.55)',
    textSoft: 'text-fuchsia-200/80',
    textStrong: 'text-fuchsia-200',
    gradientFrom: 'from-fuchsia-600/25',
    gradientTo: 'to-violet-700/25',
    chipBg: 'bg-fuchsia-500/15',
  },
  gold: {
    border: 'border-amber-400/40',
    borderStrong: 'border-amber-300/80',
    glow: 'rgba(251,191,36,0.55)',
    textSoft: 'text-amber-200/80',
    textStrong: 'text-amber-200',
    gradientFrom: 'from-amber-500/25',
    gradientTo: 'to-fuchsia-700/20',
    chipBg: 'bg-amber-500/15',
  },
  emerald: {
    border: 'border-emerald-400/40',
    borderStrong: 'border-emerald-300/80',
    glow: 'rgba(52,211,153,0.55)',
    textSoft: 'text-emerald-200/80',
    textStrong: 'text-emerald-200',
    gradientFrom: 'from-emerald-500/25',
    gradientTo: 'to-cyan-600/25',
    chipBg: 'bg-emerald-500/15',
  },
  rose: {
    border: 'border-rose-400/40',
    borderStrong: 'border-rose-300/80',
    glow: 'rgba(244,114,182,0.55)',
    textSoft: 'text-rose-200/80',
    textStrong: 'text-rose-200',
    gradientFrom: 'from-rose-500/25',
    gradientTo: 'to-violet-700/25',
    chipBg: 'bg-rose-500/15',
  },
};

export const getAccent = (accent: AccentKey): AccentPalette =>
  ACCENT_PALETTES[accent] ?? ACCENT_PALETTES.cyan;

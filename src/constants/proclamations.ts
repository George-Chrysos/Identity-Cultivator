/**
 * Identity Proclamations — mantras surfaced during the Aha! initialization.
 *
 * Each Seed axis has its own bank of 6-8 first-person or imperative mantras.
 * The `useIdentityProclamation` hook selects one deterministically per
 * (userId + YYYY-MM-DD) so it is stable across refreshes on the same day
 * but varies across days.
 *
 * Tone: Cyber-Mage. First-person claims of identity, not generic
 * motivation. Kept under ~10 words each so they fit on one line.
 */
import type { SeedAxis } from '@/types/database';

export const PROCLAMATIONS: Record<SeedAxis, readonly string[]> = {
  body: [
    'The flame does not ask permission to burn.',
    'I am the forge. The strike is mine.',
    'Iron remembers every blow it survives.',
    'This body is an altar, not a cage.',
    'Tempered by what was meant to break me.',
    'The edge is earned, not inherited.',
    'I am the weight I choose to carry.',
  ],
  mind: [
    'The signal is clear. I am not the noise.',
    'Attention is my only true currency.',
    'I am the architect of what I notice.',
    'The mirror does not flinch.',
    'I think in edges, not in fog.',
    'What I study, I become.',
    'Clarity is a practice, not a gift.',
  ],
  soul: [
    'I am the silence beneath the storm.',
    'The witness and the witnessed are one.',
    'I am older than this moment, and lighter than it.',
    'What is eternal in me recognizes itself.',
    'I am the anchor. I am the current.',
    'Presence is the only sacred tense.',
    'The void and I share the same breath.',
  ],
} as const;

/**
 * Fallback mantras for the pre-Trinity state (user has no active Seeds yet).
 * These frame the empty-state moment so it still functions as a "mirror".
 */
export const PROCLAMATIONS_UNSEEDED: readonly string[] = [
  'Three seeds await. One vessel: you.',
  'Who you are is a choice you have not yet made.',
  'The Grimoire is blank. That is the gift.',
  'Plant the Trinity. Become the garden.',
];

/**
 * Deterministic string hash (djb2 xor variant). Keeps bundle size minimal
 * — no crypto import. We only need stable per-(user,date) selection.
 */
const hashString = (input: string): number => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
};

/**
 * Select today's proclamation for a given Seed axis.
 *
 * @param axis       The active Seed axis to draw from. When null / no active
 *                   Seed, we fall back to PROCLAMATIONS_UNSEEDED.
 * @param userId     Stable user identifier. Ensures two users on the same
 *                   day don't see the same mantra unless the dice align.
 * @param isoDate    YYYY-MM-DD string (typically from getTodayDate()).
 */
export const selectProclamation = (
  axis: SeedAxis | null,
  userId: string,
  isoDate: string
): string => {
  const bank = axis ? PROCLAMATIONS[axis] : PROCLAMATIONS_UNSEEDED;
  if (bank.length === 0) return '';
  const idx = hashString(`${userId}::${isoDate}::${axis ?? 'unseeded'}`) % bank.length;
  return bank[idx];
};

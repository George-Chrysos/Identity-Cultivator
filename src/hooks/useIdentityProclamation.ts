/**
 * useIdentityProclamation — returns today's mantra for the active Seed.
 *
 * Stable across refreshes on the same day (deterministic by userId + date),
 * rotates daily. Falls back to the unseeded mantras when no Seed is bound.
 *
 * Consumed by:
 *  - IdentityInitializer (the Aha! sequence)
 *  - IdentityProclamation (the docked mantra ribbon on the Homepage)
 */
import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { selectProclamation } from '@/constants/proclamations';
import { getTodayDate } from '@/constants/seals';
import type { SeedAxis } from '@/types/database';

export interface IdentityProclamation {
  mantra: string;
  axis: SeedAxis;
  userId: string;
  date: string;
}

export const useIdentityProclamation = (): IdentityProclamation => {
  const userProfile = useGameStore((s) => s.userProfile);
  const activeSeed = useGameStore((s) => s.activeSeed);
  const trinity = useGameStore((s) => s.trinity);

  // Anonymous users still get a proclamation — seed the hash with a stable
  // fallback so the first-ever app launch has copy to display.
  const userId = userProfile?.id ?? 'anon';
  const date = getTodayDate();

  // If the active Seed slot is empty, we treat the user as "unseeded" so the
  // empty-state mantras fire instead of an identity-typed one.
  const axis = trinity[activeSeed] ? activeSeed : null;

  const mantra = useMemo(
    () => selectProclamation(axis, userId, date),
    [axis, userId, date]
  );

  return { mantra, axis: activeSeed, userId, date };
};

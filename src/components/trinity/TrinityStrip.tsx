/**
 * TrinityStrip — the 3-Seed constellation at the top of the Homepage.
 *
 * This is the "Mirror" — the UI element most responsible for solving the
 * Object Impermanence regarding Identity. It shows the user their three
 * anchored Seeds at a glance, always on first paint.
 *
 * Layout: Body — diamond — Mind — diamond — Soul.
 * Selecting a medallion updates gameStore.activeSeed (focuses the
 * DailyIdentityPanel below on that Seed).
 */
import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { shallow } from 'zustand/shallow';
import { useGameStore } from '@/store/gameStore';
import SeedMedallion from './SeedMedallion';
import { SEED_AXES, type SeedAxis } from '@/types/database';
import {
  getTemperingLevel,
  TEMPERING_TEMPLATE_ID,
} from '@/constants/temperingPath';
import {
  getPresenceLevel,
  PRESENCE_TEMPLATE_ID,
} from '@/constants/presencePath';
import {
  getMageLevel,
  MAGE_TEMPLATE_ID,
} from '@/constants/magePath';

/**
 * Looks up the canonical XP-to-level-up for the identity bound to a slot.
 * Handles the three registered starter paths (Tempering/Body, Mage/Mind,
 * Presence/Soul); falls back to a sensible curve for any future path whose
 * constants we haven't wired yet.
 */
const resolveXpToNextLevel = (
  templateId: string | undefined,
  level: number
): number => {
  if (!templateId) return Math.max(1, 100 * (level + 1));
  if (templateId.startsWith(TEMPERING_TEMPLATE_ID)) {
    return getTemperingLevel(level)?.xpToLevelUp ?? 100;
  }
  if (templateId.startsWith(PRESENCE_TEMPLATE_ID)) {
    return getPresenceLevel(level)?.xpToLevelUp ?? 100;
  }
  if (templateId.startsWith(MAGE_TEMPLATE_ID)) {
    return getMageLevel(level)?.xpToLevelUp ?? 100;
  }
  return Math.max(1, 100 * (level + 1));
};

const DiamondDivider = memo(() => (
  <div className="hidden sm:flex items-center gap-1.5 opacity-60" aria-hidden="true">
    <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-violet-400/70" />
    <div className="w-2 h-2 rotate-45 bg-gradient-to-br from-violet-400 to-cyan-400 shadow-[0_0_6px_1px_rgba(168,85,247,0.5)]" />
    <div className="w-6 h-[1px] bg-gradient-to-l from-transparent to-cyan-400/70" />
  </div>
));
DiamondDivider.displayName = 'DiamondDivider';

const TrinityStrip = memo(() => {
  const { trinity, activeSeed, activeIdentities, setActiveSeed } = useGameStore(
    (state) => ({
      trinity: state.trinity,
      activeSeed: state.activeSeed,
      activeIdentities: state.activeIdentities,
      setActiveSeed: state.setActiveSeed,
    }),
    shallow
  );

  const handleSelect = useCallback(
    (axis: SeedAxis) => setActiveSeed(axis),
    [setActiveSeed]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between sm:justify-center w-full max-w-xs sm:max-w-md mx-auto px-2 sm:px-0 sm:gap-4 py-4"
      role="tablist"
      aria-label="Trinity Seeds"
    >
      {SEED_AXES.map((axis, idx) => {
        const boundId = trinity[axis];
        const identity = boundId
          ? activeIdentities.find((i) => i.id === boundId) ?? null
          : null;
        const isEmpty = !identity;
        const level = identity?.current_level ?? 0;
        const currentXP = identity?.current_xp ?? 0;
        const xpToNextLevel = resolveXpToNextLevel(
          identity?.template?.id,
          level
        );

        return (
          <div key={axis} className="flex items-center sm:gap-4">
            <SeedMedallion
              axis={axis}
              level={level}
              currentXP={currentXP}
              xpToNextLevel={xpToNextLevel}
              isActive={activeSeed === axis}
              isEmpty={isEmpty}
              onSelect={handleSelect}
            />
            {idx < SEED_AXES.length - 1 && <DiamondDivider />}
          </div>
        );
      })}
    </motion.div>
  );
});

TrinityStrip.displayName = 'TrinityStrip';

export default TrinityStrip;

/**
 * useVitalityAura — derives the Aura state and writes it to <html data-aura>.
 *
 * The Aura is a PASSIVE indicator. This hook is the ONLY place that writes
 * the data-aura attribute. It runs once per state change and never inside a
 * render-only path. AuraFrame itself is a pure CSS consumer.
 *
 * Inputs considered (today):
 * - Hydration gate (isInitialized) — keeps us in 'initializing' until ready
 * - Will budget (userProfile.will_points / MAX_TOTAL_WILL)
 * - Active Seed completion progress (dailyTaskStates for the bound identity)
 * - Grimoire daily aura delta (softens/sharpens based on rune entries)
 *
 * Inputs planned (wired in Phase 4):
 * - Main Quest status (complete / pending / demotion_count >= 3 → respawn)
 * - Yesterday's Chronos result (shrouded if failed)
 *
 * Design note: we intentionally DON'T re-derive on every keystroke. The
 * inputs above only change on explicit game events, so this recomputes
 * O(event), not O(frame). The hook returns the state for debug/HUD usage.
 */
import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import { useGameStore } from '@/store/gameStore';
import { useGrimoireStore } from '@/store/grimoireStore';
import { useQuestStore } from '@/store/questStore';
import { MAX_TOTAL_WILL } from '@/services/StreakManager';
import type { AuraState } from '@/types/database';
import { logger } from '@/utils/logger';

/** Thresholds tuned to feel responsive without flapping between states. */
const WILL_ASCENDANT_RATIO = 0.75;
const WILL_SHROUDED_RATIO = 0.2;

const writeAuraAttribute = (state: AuraState): void => {
  if (typeof document === 'undefined') return;
  const current = document.documentElement.getAttribute('data-aura');
  if (current === state) return;
  document.documentElement.setAttribute('data-aura', state);
};

/**
 * Compute the aura state from the inputs. Kept pure so it can be unit-tested
 * in isolation and reasoned about without the React tree.
 */
export const deriveAuraState = (params: {
  isInitialized: boolean;
  willPoints: number;
  activeSeedTasksTotal: number;
  activeSeedTasksCompleted: number;
  mainQuestCompleted: boolean;
  mainQuestAwaitingRecycle: boolean;
  grimoireAuraDelta: number;
}): AuraState => {
  const {
    isInitialized,
    willPoints,
    activeSeedTasksTotal,
    activeSeedTasksCompleted,
    mainQuestCompleted,
    mainQuestAwaitingRecycle,
    grimoireAuraDelta,
  } = params;

  if (!isInitialized) return 'initializing';

  // Respawn beats everything else — mercy takes narrative priority so the
  // user is immediately informed something needs their attention in a
  // non-threatening way.
  if (mainQuestAwaitingRecycle) return 'respawn';

  const willRatio = Math.max(0, Math.min(1, willPoints / MAX_TOTAL_WILL));
  const seedComplete =
    activeSeedTasksTotal > 0 && activeSeedTasksCompleted >= activeSeedTasksTotal;

  // Ascendant requires ALL of: healthy Will, active Seed 100%, Main Quest done.
  if (willRatio >= WILL_ASCENDANT_RATIO && seedComplete && mainQuestCompleted) {
    return 'neon-ascendant';
  }

  // Shrouded when Will is depleted and no grimoire entries have brightened
  // today's state. Drained rune stacks can also nudge into shrouded.
  if (willRatio < WILL_SHROUDED_RATIO && grimoireAuraDelta <= 0) {
    return 'shrouded';
  }

  return 'neon-steady';
};

export const useVitalityAura = (): AuraState => {
  const { isInitialized, userProfile, trinity, activeSeed, dailyTaskStates, activeIdentities } =
    useGameStore(
      (state) => ({
        isInitialized: state.isInitialized,
        userProfile: state.userProfile,
        trinity: state.trinity,
        activeSeed: state.activeSeed,
        dailyTaskStates: state.dailyTaskStates,
        activeIdentities: state.activeIdentities,
      }),
      shallow
    );

  const { mainQuestId, quests } = useQuestStore(
    (state) => ({
      mainQuestId: state.mainQuestId ?? null,
      quests: state.quests,
    }),
    shallow
  );

  // Note: grimoire store is keyed by entries array; we subscribe to its length
  // and today's entries to avoid re-running on unrelated entry edits.
  const grimoireAuraDelta = useGrimoireStore((state) => state.getTodayAuraDelta());

  const willPoints = userProfile?.will_points ?? 0;

  // Resolve active-seed identity and its today-completion.
  const activeIdentityId = trinity[activeSeed];
  const activeIdentity = activeIdentityId
    ? activeIdentities.find((i) => i.id === activeIdentityId)
    : null;
  const activeSeedTasksTotal = activeIdentity?.available_tasks?.length ?? 0;
  const activeSeedTasksCompleted =
    activeIdentityId && dailyTaskStates[activeIdentityId]
      ? dailyTaskStates[activeIdentityId].completedTasks.length
      : 0;

  // Main Quest status — read defensively. Field shapes evolve in Phase 4.
  const mainQuest = mainQuestId
    ? quests.find((q) => q.id === mainQuestId)
    : null;
  const mainQuestCompleted = mainQuest?.status === 'completed';
  const mainQuestAwaitingRecycle =
    !!mainQuest && typeof mainQuest.demotionCount === 'number' && mainQuest.demotionCount >= 3;

  const nextState = deriveAuraState({
    isInitialized,
    willPoints,
    activeSeedTasksTotal,
    activeSeedTasksCompleted,
    mainQuestCompleted,
    mainQuestAwaitingRecycle,
    grimoireAuraDelta,
  });

  useEffect(() => {
    writeAuraAttribute(nextState);
    logger.debug('Aura state written', { aura: nextState });
  }, [nextState]);

  return nextState;
};

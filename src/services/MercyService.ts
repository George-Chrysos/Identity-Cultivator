/**
 * MercyService — the heart of the Cyber-Grimoire's "no shame" contract.
 *
 * The legacy behavior of piling-up-past-quests is reframed so that:
 *
 *  1. EXPIRE, don't pile. Once a quest has been dragged forward too many
 *     days (EXPIRE_THRESHOLD_DAYS) without being completed, we flag it as
 *     `expired` and stop bumping `daysNotCompleted`. An expired quest is
 *     invisible in the Arsenal until the user *chooses* to respawn it.
 *
 *  2. DEMOTE, don't fail. Missing a Main Quest doesn't mark it failed —
 *     it increments `demotionCount` and releases the pin. The quest is
 *     still there; it just no longer wears the Crown today.
 *
 *  3. ALCHEMICAL RECYCLE. When `demotionCount >= RECYCLE_THRESHOLD`, the
 *     quest is a shame-magnet. We tell the UI to open `RuneReRollSheet`
 *     instead of demoting again — the user picks new Runes (intent) and
 *     optionally rewrites the title. `recycled_at` is stamped; the quest
 *     is persisted as a *new shape of the same intent*.
 *
 *  4. STREAK REFRAME. Lost a streak? The Grimoire records it as a
 *     `streak_rest` entry — neutral, not negative. No red UI, no penalty
 *     spike.
 *
 * This service is deliberately pure — consumers (questStore, UI components)
 * call these functions and decide what to do with the result. No side
 * effects from this module.
 */
import type { Quest } from '@/components/quest/QuestCard';

/** Days a quest can linger on today's list before becoming 'expired'. */
export const EXPIRE_THRESHOLD_DAYS = 7;

/** Demotion count at which the next miss opens RuneReRollSheet instead of another demote. */
export const RECYCLE_THRESHOLD = 3;

export interface MercyDecision {
  /** Whether the UI should open the Alchemical Recycle (RuneReRollSheet). */
  shouldRecycle: boolean;
  /** Whether the quest should be marked expired (stop piling). */
  shouldExpire: boolean;
  /** Whether the quest should be demoted (unpin, increment count). */
  shouldDemote: boolean;
  /** Recommended next demotion count (quest.demotionCount + 1, or unchanged). */
  nextDemotionCount: number;
  /** Whether this action should be shame-free messaged (no red UI). */
  isMercy: true;
}

/**
 * Given a quest that the user just "missed" as Main Quest (day rolled, or
 * explicit demote), return the recommended mercy decision.
 *
 * The caller is responsible for applying the decision (updating DB fields,
 * opening the ReRoll sheet, etc.). This keeps MercyService free of I/O and
 * trivially testable.
 */
export const decideMercyOnDemote = (quest: Quest): MercyDecision => {
  const currentDemotions = quest.demotionCount ?? 0;
  const nextCount = currentDemotions + 1;

  if (nextCount >= RECYCLE_THRESHOLD) {
    // Escape hatch: open the Alchemical Recycle instead of piling shame.
    return {
      shouldRecycle: true,
      shouldExpire: false,
      shouldDemote: false,
      nextDemotionCount: nextCount,
      isMercy: true,
    };
  }

  return {
    shouldRecycle: false,
    shouldExpire: false,
    shouldDemote: true,
    nextDemotionCount: nextCount,
    isMercy: true,
  };
};

/**
 * Called when the Chronos day rolls. For each incomplete quest, decide
 * whether it should expire. A quest expires when `daysNotCompleted >=
 * EXPIRE_THRESHOLD_DAYS` and it is not recurring. Recurring quests never
 * expire — they reset each day by design.
 */
export const decideMercyOnChronosRoll = (quest: Quest): MercyDecision => {
  const days = quest.daysNotCompleted ?? 0;
  const shouldExpire =
    !quest.isRecurring && quest.status !== 'completed' && days >= EXPIRE_THRESHOLD_DAYS;

  return {
    shouldRecycle: false,
    shouldExpire,
    shouldDemote: false,
    nextDemotionCount: quest.demotionCount ?? 0,
    isMercy: true,
  };
};

/**
 * Compose a "mercy label" for the UI. Used by ArsenalEcho, QuestCard, and
 * the ReRollSheet to surface a non-shaming microcopy without leaking mercy
 * internals to every component.
 */
export const mercyLabelFor = (quest: Quest): string | null => {
  if (quest.status === 'expired') return 'Dormant — awaiting respawn';
  if ((quest.demotionCount ?? 0) >= RECYCLE_THRESHOLD) return 'Ready for recycle';
  if ((quest.demotionCount ?? 0) > 0) return `Demoted ${quest.demotionCount}x`;
  if ((quest.daysNotCompleted ?? 0) >= EXPIRE_THRESHOLD_DAYS - 2) return 'Nearing dormancy';
  return null;
};

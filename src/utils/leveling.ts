/**
 * Hybrid-forgiving leveling math.
 *
 * To progress from level L to L+1 the user must complete L days of tasks.
 * Missed days incur no penalty — progress simply pauses.
 *
 * So total completions required to reach level L (starting from level 1) is
 * the triangular number T(L-1) = (L-1) * L / 2.
 */

export const xpNeededForNext = (currentLevel: number): number => {
  return Math.max(1, currentLevel);
};

export const totalCompletionsForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return ((level - 1) * level) / 2;
};

/**
 * Pure reducer: given the current level/xp and today's completion, return
 * the new level/xp. Does not mutate input.
 */
export const applyCompletion = (
  level: number,
  xpIntoLevel: number
): { level: number; xpIntoLevel: number; leveledUp: boolean } => {
  const threshold = xpNeededForNext(level);
  const nextXp = xpIntoLevel + 1;

  if (nextXp >= threshold) {
    return {
      level: level + 1,
      xpIntoLevel: 0,
      leveledUp: true,
    };
  }

  return {
    level,
    xpIntoLevel: nextXp,
    leveledUp: false,
  };
};

/**
 * Fractional progress toward the next level, in [0, 1].
 */
export const levelProgressRatio = (level: number, xpIntoLevel: number): number => {
  const threshold = xpNeededForNext(level);
  if (threshold <= 0) return 0;
  return Math.max(0, Math.min(1, xpIntoLevel / threshold));
};

/**
 * Returns today's date as a YYYY-MM-DD string in the user's local timezone.
 */
export const todayKey = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

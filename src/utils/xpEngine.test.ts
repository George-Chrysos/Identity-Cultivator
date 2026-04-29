import { describe, expect, it } from 'vitest';
import {
  applyDailyDiminishingReturns,
  computeMainQuestStreak,
  computeVisitStreak,
  streakMultiplier,
} from './xpEngine';

describe('xpEngine', () => {
  it('applies diminishing returns tiers', () => {
    expect(applyDailyDiminishingReturns(10, 1)).toBe(10);
    expect(applyDailyDiminishingReturns(10, 3)).toBe(8);
    expect(applyDailyDiminishingReturns(10, 8)).toBe(6);
    expect(applyDailyDiminishingReturns(10, 12)).toBe(4);
  });

  it('caps streak multiplier', () => {
    expect(streakMultiplier(0, 0.05, 1.2)).toBe(1);
    expect(streakMultiplier(3, 0.05, 1.2)).toBe(1.15);
    expect(streakMultiplier(10, 0.05, 1.2)).toBe(1.2);
  });

  it('advances and resets main quest streak', () => {
    const day1 = computeMainQuestStreak({ current: 0, best: 0, lastDate: null }, '2026-04-01');
    const day2 = computeMainQuestStreak(day1, '2026-04-02');
    const reset = computeMainQuestStreak(day2, '2026-04-05');
    expect(day1.current).toBe(1);
    expect(day2.current).toBe(2);
    expect(reset.current).toBe(1);
    expect(reset.best).toBe(2);
  });

  it('tracks sector visit streak and daily idempotency', () => {
    const base = {
      lastVisitedDate: null,
      streak: { current: 0, best: 0, lastDate: null },
    };
    const first = computeVisitStreak(base, '2026-04-01');
    const sameDay = computeVisitStreak(first.next, '2026-04-01');
    const nextDay = computeVisitStreak(first.next, '2026-04-02');
    const afterGap = computeVisitStreak(nextDay.next, '2026-04-07');
    expect(first.next.streak.current).toBe(1);
    expect(sameDay.revisitedToday).toBe(true);
    expect(nextDay.next.streak.current).toBe(2);
    expect(afterGap.decayApplied).toBe(true);
    expect(afterGap.next.streak.current).toBe(1);
  });
});

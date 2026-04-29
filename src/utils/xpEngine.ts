import type { SectorVisitState, StreakState, XpPolicy } from '@/types/dashboard';

export const XP_POLICY: XpPolicy = {
  mainQuest: 40,
  sideQuest: 18,
  sectorQuest: 24,
  firstSectorVisit: 5,
  logReward: 8,
  sectorVisitStreakStep: 0.03,
  mainQuestStreakStep: 0.05,
  maxStreakBonus: 1.35,
};

const toIsoDay = (date: Date) => date.toISOString().slice(0, 10);

export const daysBetween = (from: string, to: string): number => {
  const fromMs = Date.parse(`${from}T00:00:00.000Z`);
  const toMs = Date.parse(`${to}T00:00:00.000Z`);
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return 0;
  return Math.floor((toMs - fromMs) / (24 * 60 * 60 * 1000));
};

export const applyDailyDiminishingReturns = (base: number, familyCountToday: number): number => {
  if (familyCountToday <= 1) return base;
  if (familyCountToday <= 5) return Math.round(base * 0.8);
  if (familyCountToday <= 10) return Math.round(base * 0.6);
  return Math.round(base * 0.4);
};

export const streakMultiplier = (streak: number, step: number, max: number): number => {
  const raw = 1 + Math.max(0, streak) * step;
  return Math.min(max, raw);
};

export const computeVisitStreak = (
  state: SectorVisitState,
  today: string
): { next: SectorVisitState; revisitedToday: boolean; decayApplied: boolean } => {
  if (state.lastVisitedDate === today) {
    return { next: state, revisitedToday: true, decayApplied: false };
  }

  const prevDate = state.lastVisitedDate;
  const diff = prevDate ? daysBetween(prevDate, today) : 0;
  const isConsecutive = diff === 1;
  const decayApplied = diff > 3;

  const nextCurrent = isConsecutive ? state.streak.current + 1 : 1;
  const nextStreak: StreakState = {
    current: nextCurrent,
    best: Math.max(state.streak.best, nextCurrent),
    lastDate: today,
  };

  return {
    revisitedToday: false,
    decayApplied,
    next: {
      streak: nextStreak,
      lastVisitedDate: today,
    },
  };
};

export const computeMainQuestStreak = (state: StreakState, today: string): StreakState => {
  if (state.lastDate === today) return state;
  const diff = state.lastDate ? daysBetween(state.lastDate, today) : 0;
  const nextCurrent = diff === 1 ? state.current + 1 : 1;
  return {
    current: nextCurrent,
    best: Math.max(state.best, nextCurrent),
    lastDate: today,
  };
};

export const todayIsoDay = (): string => toIsoDay(new Date());

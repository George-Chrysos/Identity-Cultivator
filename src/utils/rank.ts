import { lastNDates } from '@/utils/date';
import { RANK_WINDOW } from '@/constants/storage';
import type { DashboardStateShape, RankLetter, RankSnapshot } from '@/types/dashboard';

export const RANK_TITLES: Record<RankLetter, string> = {
  D: 'The Grounded Initiate',
  C: 'The Steady Practitioner',
  B: 'The Conscious Operator',
  A: 'The Sovereign Adept',
  S: 'The Lucid Architect',
};

export const isoWeekKey = (date = new Date()): string => {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

export const letterFromAverage = (avg: number | null): RankLetter => {
  if (avg === null || avg < 2) return 'D';
  if (avg < 2.75) return 'C';
  if (avg < 3.5) return 'B';
  if (avg < 4.25) return 'A';
  return 'S';
};

export const rankAverage30 = (dashboard: DashboardStateShape): number | null => {
  const values: number[] = [];
  for (const date of lastNDates(RANK_WINDOW)) {
    const entry = dashboard.entries[date];
    if (!entry) continue;
    for (const key of ['body', 'mind', 'soul'] as const) {
      const v = entry[key];
      if (typeof v === 'number') values.push(v);
    }
  }
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

export const nextRankSnapshot = (
  dashboard: DashboardStateShape,
  current: RankSnapshot | null,
  week = isoWeekKey()
): RankSnapshot => {
  if (current && current.weekKey === week) return current;
  const letter = letterFromAverage(rankAverage30(dashboard));
  return { letter, weekKey: week };
};

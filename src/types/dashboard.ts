export type MetricKey = 'body' | 'mind' | 'soul';

export type DailyKey = 'morningActivation' | 'ritual' | 'nightProtocol';

export type MomentumKey = 'mainTask' | DailyKey;

export interface DailyEntry {
  date: string;
  body: number | null;
  mind: number | null;
  soul: number | null;
  mainTaskText: string;
  mainTaskDone: boolean;
  carriedOver: boolean;
  morningActivation: boolean;
  ritual: boolean;
  nightProtocol: boolean;
  updatedAt: number;
}

export type RankLetter = 'D' | 'C' | 'B' | 'A' | 'S';

export interface RankSnapshot {
  letter: RankLetter;
  weekKey: string;
}

export interface DashboardStateShape {
  entries: Record<string, DailyEntry>;
  dirtyDates: string[];
  rank: RankSnapshot | null;
}

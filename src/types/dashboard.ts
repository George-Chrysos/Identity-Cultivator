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
  morningActivation: boolean;
  ritual: boolean;
  nightProtocol: boolean;
  updatedAt: number;
}

export interface DashboardStateShape {
  entries: Record<string, DailyEntry>;
  dirtyDates: string[];
}

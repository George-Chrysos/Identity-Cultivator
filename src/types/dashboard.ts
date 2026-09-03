export type MetricKey = 'body' | 'mind' | 'soul';

export type DailyKey = 'morningActivation' | 'ritual' | 'nightProtocol';

export interface DashboardMetrics {
  body: number;
  mind: number;
  soul: number;
}

export interface MainTask {
  text: string;
  completedDate: string | null;
}

export interface DailiesState {
  date: string;
  morningActivation: boolean;
  ritual: boolean;
  nightProtocol: boolean;
}

export interface DashboardStateShape {
  metrics: DashboardMetrics;
  mainTask: MainTask;
  dailies: DailiesState;
  updatedAt: number;
}

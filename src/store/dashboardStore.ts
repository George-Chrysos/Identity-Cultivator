import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORE_KEYS } from '@/constants/storage';
import { todayKey } from '@/utils/date';
import type { DailyKey, DashboardStateShape, MetricKey } from '@/types/dashboard';

const now = () => Date.now();

const clampMetric = (value: number) => {
  const n = Number.isFinite(value) ? Math.round(value) : 0;
  return Math.min(100, Math.max(0, n));
};

const emptyDailies = (date = todayKey()): DashboardStateShape['dailies'] => ({
  date,
  morningActivation: false,
  ritual: false,
  nightProtocol: false,
});

export const DEFAULT_DASHBOARD_STATE: DashboardStateShape = {
  metrics: { body: 0, mind: 0, soul: 0 },
  mainTask: { text: '', completedDate: null },
  dailies: emptyDailies(),
  updatedAt: now(),
};

const isDailyKey = (value: unknown): value is DailyKey =>
  value === 'morningActivation' || value === 'ritual' || value === 'nightProtocol';

/** Merge persisted / remote blobs into the slim v2 shape. */
export function normalizeDashboard(partial: Partial<DashboardStateShape> | Record<string, unknown>): DashboardStateShape {
  const raw = partial as Partial<DashboardStateShape>;
  const metricsSource = raw.metrics ?? DEFAULT_DASHBOARD_STATE.metrics;
  const dailiesSource = raw.dailies ?? DEFAULT_DASHBOARD_STATE.dailies;

  return {
    metrics: {
      body: clampMetric(metricsSource.body ?? 0),
      mind: clampMetric(metricsSource.mind ?? 0),
      soul: clampMetric(metricsSource.soul ?? 0),
    },
    mainTask: {
      text: typeof raw.mainTask?.text === 'string' ? raw.mainTask.text : '',
      completedDate:
        typeof raw.mainTask?.completedDate === 'string' ? raw.mainTask.completedDate : null,
    },
    dailies: {
      date: typeof dailiesSource.date === 'string' ? dailiesSource.date : todayKey(),
      morningActivation: Boolean(dailiesSource.morningActivation),
      ritual: Boolean(dailiesSource.ritual),
      nightProtocol: Boolean(dailiesSource.nightProtocol),
    },
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now(),
  };
}

const applyRollover = (dashboard: DashboardStateShape): DashboardStateShape => {
  const today = todayKey();
  if (dashboard.dailies.date === today) return dashboard;
  return {
    ...dashboard,
    dailies: emptyDailies(today),
    updatedAt: now(),
  };
};

interface DashboardStoreState {
  dashboard: DashboardStateShape;
  setDashboard: (next: DashboardStateShape) => void;
  resetDashboard: () => void;
  ensureDailyRollover: () => void;
  setMetric: (key: MetricKey, value: number) => void;
  setMainTaskText: (text: string) => void;
  toggleMainTaskComplete: () => void;
  toggleDaily: (key: DailyKey) => void;
}

const touch = (dashboard: DashboardStateShape): DashboardStateShape => ({
  ...dashboard,
  updatedAt: now(),
});

export const useDashboardStore = create<DashboardStoreState>()(
  persist(
    (set, get) => ({
      dashboard: DEFAULT_DASHBOARD_STATE,

      setDashboard: (next) => set({ dashboard: applyRollover(normalizeDashboard(next)) }),
      resetDashboard: () => set({ dashboard: { ...DEFAULT_DASHBOARD_STATE, updatedAt: now(), dailies: emptyDailies() } }),

      ensureDailyRollover: () => {
        const { dashboard } = get();
        const next = applyRollover(dashboard);
        if (next !== dashboard) set({ dashboard: next });
      },

      setMetric: (key, value) => {
        const { dashboard } = get();
        set({
          dashboard: touch({
            ...dashboard,
            metrics: { ...dashboard.metrics, [key]: clampMetric(value) },
          }),
        });
      },

      setMainTaskText: (text) => {
        const { dashboard } = get();
        set({
          dashboard: touch({
            ...dashboard,
            mainTask: { ...dashboard.mainTask, text },
          }),
        });
      },

      toggleMainTaskComplete: () => {
        const { dashboard } = get();
        const today = todayKey();
        const isDoneToday = dashboard.mainTask.completedDate === today;
        set({
          dashboard: touch({
            ...dashboard,
            mainTask: {
              ...dashboard.mainTask,
              completedDate: isDoneToday ? null : today,
            },
          }),
        });
      },

      toggleDaily: (key) => {
        if (!isDailyKey(key)) return;
        const { dashboard } = get();
        const rolled = applyRollover(dashboard);
        set({
          dashboard: touch({
            ...rolled,
            dailies: {
              ...rolled.dailies,
              [key]: !rolled.dailies[key],
            },
          }),
        });
      },
    }),
    {
      name: STORE_KEYS.DASHBOARD,
      partialize: (state) => ({ dashboard: state.dashboard }),
      merge: (persisted, current) => {
        const p = persisted as { dashboard?: Partial<DashboardStateShape> } | undefined;
        const cur = current as DashboardStoreState;
        if (!p?.dashboard) return cur;
        return {
          ...cur,
          dashboard: applyRollover(normalizeDashboard({ ...DEFAULT_DASHBOARD_STATE, ...p.dashboard })),
        };
      },
    }
  )
);

export const selectDashboard = (s: DashboardStoreState) => s.dashboard;

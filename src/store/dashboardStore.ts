import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AVERAGE_WINDOW, HISTORY_DAYS, MOMENTUM_WINDOW, STORE_KEYS } from '@/constants/storage';
import { lastNDates, todayKey, isEditableDate } from '@/utils/date';
import { emptyEntry } from '@/api/dashboardDatabase';
import type { DailyEntry, DailyKey, DashboardStateShape, MetricKey, MomentumKey } from '@/types/dashboard';

const now = () => Date.now();

const clampMetric = (value: number | null): number | null => {
  if (value === null) return null;
  const n = Number.isFinite(value) ? Math.round(value) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.min(100, Math.max(0, n));
};

export const normalizeEntry = (partial: Partial<DailyEntry> & { date: string }): DailyEntry => ({
  ...emptyEntry(partial.date),
  ...partial,
  body: clampMetric(partial.body ?? null),
  mind: clampMetric(partial.mind ?? null),
  soul: clampMetric(partial.soul ?? null),
  mainTaskText: typeof partial.mainTaskText === 'string' ? partial.mainTaskText : '',
  mainTaskDone: Boolean(partial.mainTaskDone),
  morningActivation: Boolean(partial.morningActivation),
  ritual: Boolean(partial.ritual),
  nightProtocol: Boolean(partial.nightProtocol),
  updatedAt: typeof partial.updatedAt === 'number' ? partial.updatedAt : now(),
});

const unique = (dates: string[]) => Array.from(new Set(dates));

export const DEFAULT_DASHBOARD_STATE: DashboardStateShape = {
  entries: {},
  dirtyDates: [],
};

interface DashboardStoreState {
  dashboard: DashboardStateShape;
  hydrateEntries: (incoming: DailyEntry[], opts?: { markClean?: boolean }) => void;
  resetDashboard: () => void;
  clearDirty: (dates?: string[]) => void;
  patchEntry: (date: string, patch: Partial<DailyEntry>) => void;
  setMetrics: (date: string, metrics: Pick<DailyEntry, 'body' | 'mind' | 'soul'>) => void;
  setMainTaskText: (date: string, text: string) => void;
  toggleMainTask: (date: string) => void;
  toggleDaily: (date: string, key: DailyKey) => void;
}

export const useDashboardStore = create<DashboardStoreState>()(
  persist(
    (set, get) => ({
      dashboard: DEFAULT_DASHBOARD_STATE,

      hydrateEntries: (incoming, opts) => {
        const { dashboard } = get();
        const next = { ...dashboard.entries };
        let dirty = [...dashboard.dirtyDates];
        for (const raw of incoming) {
          const entry = normalizeEntry(raw);
          const local = next[entry.date];
          if (!local || entry.updatedAt >= local.updatedAt) {
            next[entry.date] = entry;
            if (opts?.markClean) {
              dirty = dirty.filter((d) => d !== entry.date);
            }
          }
        }
        set({ dashboard: { entries: next, dirtyDates: unique(dirty) } });
      },

      resetDashboard: () => set({ dashboard: { entries: {}, dirtyDates: [] } }),

      clearDirty: (dates) => {
        const { dashboard } = get();
        if (!dates) {
          set({ dashboard: { ...dashboard, dirtyDates: [] } });
          return;
        }
        const drop = new Set(dates);
        set({
          dashboard: {
            ...dashboard,
            dirtyDates: dashboard.dirtyDates.filter((d) => !drop.has(d)),
          },
        });
      },

      patchEntry: (date, patch) => {
        if (!isEditableDate(date)) return;
        const { dashboard } = get();
        const current = dashboard.entries[date] ?? emptyEntry(date);
        const nextEntry = normalizeEntry({ ...current, ...patch, date, updatedAt: now() });
        set({
          dashboard: {
            entries: { ...dashboard.entries, [date]: nextEntry },
            dirtyDates: unique([...dashboard.dirtyDates, date]),
          },
        });
      },

      setMetrics: (date, metrics) => {
        get().patchEntry(date, {
          body: clampMetric(metrics.body),
          mind: clampMetric(metrics.mind),
          soul: clampMetric(metrics.soul),
        });
      },

      setMainTaskText: (date, text) => {
        get().patchEntry(date, { mainTaskText: text });
      },

      toggleMainTask: (date) => {
        const current = get().dashboard.entries[date] ?? emptyEntry(date);
        get().patchEntry(date, { mainTaskDone: !current.mainTaskDone });
      },

      toggleDaily: (date, key) => {
        const current = get().dashboard.entries[date] ?? emptyEntry(date);
        get().patchEntry(date, { [key]: !current[key] });
      },
    }),
    {
      name: STORE_KEYS.DASHBOARD,
      partialize: (state) => ({ dashboard: state.dashboard }),
      merge: (persisted, current) => {
        const p = persisted as { dashboard?: Partial<DashboardStateShape> } | undefined;
        const cur = current as DashboardStoreState;
        if (!p?.dashboard) return cur;
        const entries: Record<string, DailyEntry> = {};
        for (const [date, entry] of Object.entries(p.dashboard.entries ?? {})) {
          entries[date] = normalizeEntry({ ...entry, date });
        }
        return {
          ...cur,
          dashboard: {
            entries,
            dirtyDates: unique(p.dashboard.dirtyDates ?? []),
          },
        };
      },
    }
  )
);

export const getEntry = (dashboard: DashboardStateShape, date: string): DailyEntry =>
  dashboard.entries[date] ?? emptyEntry(date);

export const metricAverage = (
  dashboard: DashboardStateShape,
  key: MetricKey,
  window = AVERAGE_WINDOW
): number | null => {
  const values = lastNDates(window)
    .map((date) => dashboard.entries[date]?.[key])
    .filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
};

export const metricAverages7 = (dashboard: DashboardStateShape) => ({
  body: metricAverage(dashboard, 'body'),
  mind: metricAverage(dashboard, 'mind'),
  soul: metricAverage(dashboard, 'soul'),
});

export const momentumBits = (
  dashboard: DashboardStateShape,
  key: MomentumKey,
  window = MOMENTUM_WINDOW
): boolean[] =>
  lastNDates(window).map((date) => {
    const entry = dashboard.entries[date];
    if (!entry) return false;
    if (key === 'mainTask') return entry.mainTaskDone;
    return entry[key];
  });

export const syncFrom = (end = todayKey()): string => lastNDates(HISTORY_DAYS, end)[0];

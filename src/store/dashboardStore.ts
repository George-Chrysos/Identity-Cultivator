import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORE_KEYS } from '@/constants/storage';
import type {
  CenterKey,
  DashboardStateShape,
  MysticSectorId,
  MysticSlice,
  MysticTarotPair,
  MysticWeekDay,
  QuadrantKey,
  SectorId,
  TricksterSlice,
} from '@/types/dashboard';

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const clampInt = (value: number, min: number, max: number) => {
  const n = Number.isFinite(value) ? Math.round(value) : min;
  return Math.min(max, Math.max(min, n));
};

const now = () => Date.now();

const emptyWeek = (): MysticWeekDay[] =>
  Array.from({ length: 7 }, () => ({ name: '', meaning: '' }));

const emptyTarotPair = (): MysticTarotPair => ({ cardA: '', cardB: '' });

const DEFAULT_MYSTIC: MysticSlice = {
  themeOfMonth: emptyTarotPair(),
  dangerOfMonth: emptyTarotPair(),
  weeksJourney: emptyWeek(),
  notesOfTheDay: '',
};

const DEFAULT_TRICKSTER: TricksterSlice = {
  absurdMission: 'Do one thing backwards on purpose (metaphorically).',
  dailyQuirk: 'Every time you stand up, narrate it like a quest log.',
  foolsFootnote: '',
};

export const DEFAULT_DASHBOARD_STATE: DashboardStateShape = {
  identity: {
    name: 'Jester',
    title: 'Systems Architect',
    motto: 'Clarity over chaos.',
    level: 1,
    currentXp: 0,
    xpToNext: 100,
  },
  scores: {
    finance: 50,
    health: 50,
    career: 50,
    romantic: 50,
    growth: 50,
    environment: 50,
  },
  mainQuest: 'Define the one action that moves everything forward.',
  tasks: [],
  upgrades: [],
  updatedAt: now(),

  activeCenter: 'sovereign',
  mysticScores: {
    energySense: 50,
    grounding: 50,
    alignment: 50,
    synchronicities: 50,
  },
  mystic: DEFAULT_MYSTIC,
  trickster: DEFAULT_TRICKSTER,
};

/** Merge persisted slices forward when new fields are added. */
export function normalizeDashboard(partial: Partial<DashboardStateShape>): DashboardStateShape {
  const base = { ...DEFAULT_DASHBOARD_STATE, ...partial };
  const journey = [...(partial.mystic?.weeksJourney ?? base.mystic.weeksJourney)];
  while (journey.length < 7) journey.push({ name: '', meaning: '' });
  const trimmedJourney = journey.slice(0, 7).map((d) => ({
    name: typeof d?.name === 'string' ? d.name : '',
    meaning: typeof d?.meaning === 'string' ? d.meaning : '',
  }));

  const mystic: MysticSlice = {
    themeOfMonth: {
      cardA: partial.mystic?.themeOfMonth?.cardA ?? base.mystic.themeOfMonth.cardA,
      cardB: partial.mystic?.themeOfMonth?.cardB ?? base.mystic.themeOfMonth.cardB,
    },
    dangerOfMonth: {
      cardA: partial.mystic?.dangerOfMonth?.cardA ?? base.mystic.dangerOfMonth.cardA,
      cardB: partial.mystic?.dangerOfMonth?.cardB ?? base.mystic.dangerOfMonth.cardB,
    },
    weeksJourney: trimmedJourney,
    notesOfTheDay: partial.mystic?.notesOfTheDay ?? base.mystic.notesOfTheDay,
  };

  const mysticScores: Record<MysticSectorId, number> = {
    energySense: clampInt(partial.mysticScores?.energySense ?? base.mysticScores.energySense, 0, 100),
    grounding: clampInt(partial.mysticScores?.grounding ?? base.mysticScores.grounding, 0, 100),
    alignment: clampInt(partial.mysticScores?.alignment ?? base.mysticScores.alignment, 0, 100),
    synchronicities: clampInt(
      partial.mysticScores?.synchronicities ?? base.mysticScores.synchronicities,
      0,
      100
    ),
  };

  const trickster: TricksterSlice = {
    absurdMission: partial.trickster?.absurdMission ?? base.trickster.absurdMission,
    dailyQuirk: partial.trickster?.dailyQuirk ?? base.trickster.dailyQuirk,
    foolsFootnote: partial.trickster?.foolsFootnote ?? base.trickster.foolsFootnote,
  };

  let name = base.identity.name;
  if (name === 'Operator') name = 'Jester';

  return {
    ...base,
    identity: { ...base.identity, name },
    mystic,
    mysticScores,
    trickster,
    activeCenter: partial.activeCenter ?? base.activeCenter,
    updatedAt: partial.updatedAt ?? base.updatedAt,
  };
}

interface DashboardStoreState {
  dashboard: DashboardStateShape;

  setDashboard: (next: DashboardStateShape) => void;
  resetDashboard: () => void;

  setActiveCenter: (center: CenterKey) => void;

  updateIdentity: (patch: Partial<DashboardStateShape['identity']>) => void;
  setMainQuest: (text: string) => void;
  setSectorScore: (sector: SectorId, score: number) => void;

  addTask: (quadrant: QuadrantKey, text: string) => void;
  toggleTaskDone: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, quadrant: QuadrantKey) => void;

  addUpgrade: (upgrade: Omit<DashboardStateShape['upgrades'][number], 'id'>) => void;
  deleteUpgrade: (upgradeId: string) => void;

  setMysticSectorScore: (sector: MysticSectorId, score: number) => void;
  setMysticTarot: (which: 'themeOfMonth' | 'dangerOfMonth', pair: MysticTarotPair) => void;
  setMysticWeekDay: (index: number, patch: Partial<MysticWeekDay>) => void;
  setMysticNotesOfTheDay: (text: string) => void;

  setTrickster: (patch: Partial<TricksterSlice>) => void;
}

const touch = (dashboard: DashboardStateShape): DashboardStateShape => ({
  ...dashboard,
  updatedAt: now(),
});

export const useDashboardStore = create<DashboardStoreState>()(
  persist(
    (set, get) => ({
      dashboard: DEFAULT_DASHBOARD_STATE,

      setDashboard: (next) => set({ dashboard: normalizeDashboard(next) }),
      resetDashboard: () => set({ dashboard: DEFAULT_DASHBOARD_STATE }),

      setActiveCenter: (center) => {
        const { dashboard } = get();
        set({ dashboard: touch({ ...dashboard, activeCenter: center }) });
      },

      updateIdentity: (patch) => {
        const { dashboard } = get();
        const next = {
          ...dashboard,
          identity: {
            ...dashboard.identity,
            ...patch,
            level: patch.level !== undefined ? clampInt(patch.level, 1, 9999) : dashboard.identity.level,
            currentXp:
              patch.currentXp !== undefined
                ? clampInt(patch.currentXp, 0, 9_999_999)
                : dashboard.identity.currentXp,
            xpToNext:
              patch.xpToNext !== undefined
                ? clampInt(patch.xpToNext, 1, 9_999_999)
                : dashboard.identity.xpToNext,
          },
        };
        set({ dashboard: touch(next) });
      },

      setMainQuest: (text) => {
        const { dashboard } = get();
        set({ dashboard: touch({ ...dashboard, mainQuest: text }) });
      },

      setSectorScore: (sector, score) => {
        const { dashboard } = get();
        const next = {
          ...dashboard,
          scores: { ...dashboard.scores, [sector]: clampInt(score, 0, 100) },
        };
        set({ dashboard: touch(next) });
      },

      addTask: (quadrant, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const { dashboard } = get();
        const next = {
          ...dashboard,
          tasks: [{ id: genId(), quadrant, text: trimmed, done: false }, ...dashboard.tasks],
        };
        set({ dashboard: touch(next) });
      },

      toggleTaskDone: (taskId) => {
        const { dashboard } = get();
        const next = {
          ...dashboard,
          tasks: dashboard.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
        };
        set({ dashboard: touch(next) });
      },

      deleteTask: (taskId) => {
        const { dashboard } = get();
        const next = { ...dashboard, tasks: dashboard.tasks.filter((t) => t.id !== taskId) };
        set({ dashboard: touch(next) });
      },

      moveTask: (taskId, quadrant) => {
        const { dashboard } = get();
        const next = {
          ...dashboard,
          tasks: dashboard.tasks.map((t) => (t.id === taskId ? { ...t, quadrant } : t)),
        };
        set({ dashboard: touch(next) });
      },

      addUpgrade: (upgrade) => {
        const { dashboard } = get();
        const next = {
          ...dashboard,
          upgrades: [
            {
              id: genId(),
              name: upgrade.name.trim(),
              effort: clampInt(upgrade.effort, 1, 5),
              value: clampInt(upgrade.value, 1, 5),
              sector: upgrade.sector,
            },
            ...dashboard.upgrades,
          ].filter((u) => u.name.length > 0),
        };
        set({ dashboard: touch(next) });
      },

      deleteUpgrade: (upgradeId) => {
        const { dashboard } = get();
        const next = { ...dashboard, upgrades: dashboard.upgrades.filter((u) => u.id !== upgradeId) };
        set({ dashboard: touch(next) });
      },

      setMysticSectorScore: (sector, score) => {
        const { dashboard } = get();
        const next = {
          ...dashboard,
          mysticScores: { ...dashboard.mysticScores, [sector]: clampInt(score, 0, 100) },
        };
        set({ dashboard: touch(next) });
      },

      setMysticTarot: (which, pair) => {
        const { dashboard } = get();
        const next = {
          ...dashboard,
          mystic: {
            ...dashboard.mystic,
            [which]: {
              cardA: pair.cardA,
              cardB: pair.cardB,
            },
          },
        };
        set({ dashboard: touch(next) });
      },

      setMysticWeekDay: (index, patch) => {
        const { dashboard } = get();
        const journey = dashboard.mystic.weeksJourney.map((d, i) =>
          i === index ? { ...d, ...patch } : d
        );
        set({ dashboard: touch({ ...dashboard, mystic: { ...dashboard.mystic, weeksJourney: journey } }) });
      },

      setMysticNotesOfTheDay: (text) => {
        const { dashboard } = get();
        set({
          dashboard: touch({
            ...dashboard,
            mystic: { ...dashboard.mystic, notesOfTheDay: text },
          }),
        });
      },

      setTrickster: (patch) => {
        const { dashboard } = get();
        set({
          dashboard: touch({
            ...dashboard,
            trickster: { ...dashboard.trickster, ...patch },
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
          dashboard: normalizeDashboard({ ...DEFAULT_DASHBOARD_STATE, ...p.dashboard }),
        };
      },
    }
  )
);

export const selectDashboard = (s: DashboardStoreState) => s.dashboard;

export const computeLifeScore = (scores: Record<SectorId, number>) => {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

export const computeMysticLifeScore = (scores: Record<MysticSectorId, number>) => {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

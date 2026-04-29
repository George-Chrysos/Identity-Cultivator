import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORE_KEYS } from '@/constants/storage';
import { gamificationDB } from '@/api/gamificationDatabase';
import { useAuthStore } from './authStore';
import { toast } from './toastStore';
import type {
  CenterKey,
  DashboardStateShape,
  EnergyLayer,
  EnergyRadius,
  GratitudeCategory,
  GratitudeItem,
  MysticDailyLog,
  MysticSectorId,
  MysticSlice,
  MysticTarotPair,
  MysticWeekDay,
  QuadrantKey,
  MainQuestItem,
  SectorTag,
  StreakState,
  SectorId,
  TricksterSlice,
  XpEventType,
} from '@/types/dashboard';
import { todayKey } from '@/utils/leveling';
import {
  XP_POLICY,
  applyDailyDiminishingReturns,
  computeMainQuestStreak,
  computeVisitStreak,
  streakMultiplier,
} from '@/utils/xpEngine';

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const clampInt = (value: number, min: number, max: number) => {
  const n = Number.isFinite(value) ? Math.round(value) : min;
  return Math.min(max, Math.max(min, n));
};

const now = () => Date.now();

const LEDGER_LIMIT = 120;

const ALL_SECTOR_TAGS: SectorTag[] = [
  'finance',
  'selfCare',
  'home',
  'motorcycle',
  'energySense',
  'grounding',
  'logos',
  'gratitude',
  'focus',
  'chaos',
  'play',
  'social',
];

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

const makeDailyLog = (date = todayKey()): MysticDailyLog => ({
  date,
  energySense: 0,
  energyLayer: 'muscle',
  energyRadius: 'self',
  groundingPhysical: 0,
  groundingPsychological: 0,
  weightDropped: false,
  logosSet: 0,
  logosDone: 0,
  logosIntegrity: 0,
  gratitudeItems: [],
  focusDurationMin: 0,
  focusImageScore: 0,
  focusCountScore: 0,
  focusContextNote: '',
});

export const DEFAULT_DASHBOARD_STATE: DashboardStateShape = {
  identity: {
    name: 'Jester',
    title: 'Systems Architect',
    motto: 'Clarity over chaos.',
    level: 1,
    currentXp: 0,
    xpToNext: 100,
    totalXp: 0,
  },
  scores: {
    finance: 0,
    selfCare: 0,
    home: 0,
    motorcycle: 0,
  },
  mainQuests: [],
  tasks: [],
  upgrades: [],
  updatedAt: now(),

  activeCenter: 'sovereign',
  mysticScores: {
    energySense: 0,
    grounding: 0,
    logos: 0,
    gratitude: 0,
    focus: 0,
  },
  tricksterScores: {
    chaos: 0,
    play: 0,
    social: 0,
  },
  mysticDailyLogs: [makeDailyLog()],
  mystic: DEFAULT_MYSTIC,
  trickster: DEFAULT_TRICKSTER,
  xpLedger: [],
  mainQuestStreak: { current: 0, best: 0, lastDate: null },
  sectorVisits: Object.fromEntries(
    ALL_SECTOR_TAGS.map((tag) => [
      tag,
      { streak: { current: 0, best: 0, lastDate: null }, lastVisitedDate: null },
    ])
  ) as DashboardStateShape['sectorVisits'],
  lastDailyDecayCheck: null,
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

  const sourceScores = (partial as any).mysticScores ?? base.mysticScores;
  const mysticScores: Record<MysticSectorId, number> = {
    energySense: clampInt(sourceScores.energySense ?? 0, 0, 100),
    grounding: clampInt(sourceScores.grounding ?? 0, 0, 100),
    logos: clampInt(sourceScores.logos ?? sourceScores.alignment ?? 0, 0, 100),
    gratitude: clampInt(sourceScores.gratitude ?? sourceScores.synchronicities ?? 0, 0, 100),
    focus: clampInt(sourceScores.focus ?? 0, 0, 100),
  };

  const rawLogs = ((partial as any).mysticDailyLogs ?? []) as any[];
  const logsFromPersist: MysticDailyLog[] = rawLogs
    .filter(Boolean)
    .map((log) => ({
      date: typeof log.date === 'string' ? log.date : todayKey(),
      energySense: clampInt(log.energySense ?? 0, 0, 100),
      energyLayer: (log.energyLayer ?? 'muscle') as EnergyLayer,
      energyRadius: (log.energyRadius ?? 'self') as EnergyRadius,
      groundingPhysical: clampInt(log.groundingPhysical ?? 0, 0, 100),
      groundingPsychological: clampInt(log.groundingPsychological ?? 0, 0, 100),
      weightDropped: Boolean(log.weightDropped),
      logosSet: clampInt(log.logosSet ?? 0, 0, 20),
      logosDone: clampInt(log.logosDone ?? 0, 0, 20),
      logosIntegrity: clampInt(log.logosIntegrity ?? 0, 0, 100),
      gratitudeItems: Array.isArray(log.gratitudeItems)
        ? log.gratitudeItems.map((g: any) => ({
            id: String(g.id ?? genId()),
            text: String(g.text ?? ''),
            category: (g.category ?? 'other') as GratitudeCategory,
          }))
        : [],
      focusDurationMin: clampInt(log.focusDurationMin ?? 0, 0, 24 * 60),
      focusImageScore: clampInt(log.focusImageScore ?? 0, 0, 100),
      focusCountScore: clampInt(log.focusCountScore ?? 0, 0, 100),
      focusContextNote: String(log.focusContextNote ?? ''),
    }));
  const mysticDailyLogs = logsFromPersist.length > 0 ? logsFromPersist : [makeDailyLog()];

  const trickster: TricksterSlice = {
    absurdMission: partial.trickster?.absurdMission ?? base.trickster.absurdMission,
    dailyQuirk: partial.trickster?.dailyQuirk ?? base.trickster.dailyQuirk,
    foolsFootnote: partial.trickster?.foolsFootnote ?? base.trickster.foolsFootnote,
  };

  const mainQuestStreak: StreakState = {
    current: clampInt((partial as any).mainQuestStreak?.current ?? 0, 0, 10000),
    best: clampInt((partial as any).mainQuestStreak?.best ?? 0, 0, 10000),
    lastDate: (partial as any).mainQuestStreak?.lastDate ?? null,
  };

  const incomingSectorVisits = ((partial as any).sectorVisits ?? {}) as DashboardStateShape['sectorVisits'];
  const sectorVisits = Object.fromEntries(
    ALL_SECTOR_TAGS.map((tag) => {
      const source = incomingSectorVisits?.[tag] ?? DEFAULT_DASHBOARD_STATE.sectorVisits[tag];
      return [
        tag,
        {
          lastVisitedDate: source?.lastVisitedDate ?? null,
          streak: {
            current: clampInt(source?.streak?.current ?? 0, 0, 10000),
            best: clampInt(source?.streak?.best ?? 0, 0, 10000),
            lastDate: source?.streak?.lastDate ?? null,
          },
        },
      ];
    })
  ) as DashboardStateShape['sectorVisits'];

  const xpLedger = Array.isArray((partial as any).xpLedger)
    ? (partial as any).xpLedger
        .filter(Boolean)
        .slice(0, LEDGER_LIMIT)
        .map((entry: any) => ({
          id: String(entry.id ?? genId()),
          at: clampInt(entry.at ?? now(), 0, 9_999_999_999_999),
          type: (entry.type ?? 'log') as XpEventType,
          sectorTag: entry.sectorTag,
          delta: clampInt(entry.delta ?? 0, -9999, 9999),
          note: typeof entry.note === 'string' ? entry.note : undefined,
        }))
    : [];

  let name = base.identity.name;
  if (name === 'Operator') name = 'Jester';

  return {
    ...base,
    identity: { ...base.identity, name, totalXp: clampInt((base.identity as any).totalXp ?? 0, 0, 9_999_999) },
    tasks: (base.tasks ?? []).map((t) => ({
      ...t,
      sectorTag: t.sectorTag as SectorTag | undefined,
      completedAt: t.completedAt ?? null,
    })),
    mainQuests: Array.isArray((partial as any).mainQuests)
      ? (partial as any).mainQuests.slice(0, 3).map((q: any) => ({
          id: String(q.id ?? genId()),
          sectorTag: q.sectorTag as SectorTag,
          text: String(q.text ?? ''),
          completedDate: q.completedDate ?? null,
        }))
      : [],
    mystic,
    mysticScores,
    tricksterScores: {
      chaos: clampInt((partial as any).tricksterScores?.chaos ?? 0, 0, 100),
      play: clampInt((partial as any).tricksterScores?.play ?? 0, 0, 100),
      social: clampInt((partial as any).tricksterScores?.social ?? 0, 0, 100),
    },
    mysticDailyLogs,
    trickster,
    xpLedger,
    mainQuestStreak,
    sectorVisits,
    lastDailyDecayCheck: (partial as any).lastDailyDecayCheck ?? null,
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
  addMainQuest: (sectorTag: SectorTag, text: string) => void;
  updateMainQuestText: (questId: string, text: string) => void;
  completeMainQuest: (questId: string) => void;
  undoMainQuestCompletion: (questId: string) => void;
  recordSectorVisit: (sector: SectorTag) => void;
  rewardLog: (note?: string, sectorTag?: SectorTag) => void;
  setSectorScore: (sector: SectorId, score: number) => void;

  addTask: (quadrant: QuadrantKey, text: string) => void;
  toggleTaskDone: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, quadrant: QuadrantKey) => void;
  setTaskSector: (taskId: string, sectorTag: SectorTag) => void;
  completeDashboardTask: (taskId: string, sectorTag: SectorTag) => void;
  recordExternalQuestCompletion: (
    questId: string,
    sectorTag: SectorTag,
    questType: 'side' | 'sectorSpecialized'
  ) => void;

  addUpgrade: (upgrade: Omit<DashboardStateShape['upgrades'][number], 'id'>) => void;
  deleteUpgrade: (upgradeId: string) => void;

  setMysticSectorScore: (sector: MysticSectorId, score: number) => void;
  setTricksterSectorScore: (sector: 'chaos' | 'play' | 'social', score: number) => void;
  setMysticTarot: (which: 'themeOfMonth' | 'dangerOfMonth', pair: MysticTarotPair) => void;
  setMysticWeekDay: (index: number, patch: Partial<MysticWeekDay>) => void;
  setMysticNotesOfTheDay: (text: string) => void;
  upsertMysticDailyLog: (patch: Partial<MysticDailyLog>, date?: string) => void;
  addMysticGratitudeItem: (text: string, category?: GratitudeCategory, date?: string) => void;
  removeMysticGratitudeItem: (id: string, date?: string) => void;
  getMysticDailyLog: (date?: string) => MysticDailyLog;

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

      addMainQuest: (sectorTag, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const { dashboard } = get();
        const unlockedSlots = 1 + ((dashboard.identity.totalXp ?? 0) >= 10 ? 1 : 0) + ((dashboard.identity.totalXp ?? 0) >= 20 ? 1 : 0);
        if (dashboard.mainQuests.length >= unlockedSlots) return;
        if (dashboard.mainQuests.some((q) => q.sectorTag === sectorTag)) return;
        const nextQuest: MainQuestItem = {
          id: genId(),
          sectorTag,
          text: trimmed,
          completedDate: null,
        };
        set({ dashboard: touch({ ...dashboard, mainQuests: [...dashboard.mainQuests, nextQuest] }) });
      },

      updateMainQuestText: (questId, text) => {
        const { dashboard } = get();
        set({
          dashboard: touch({
            ...dashboard,
            mainQuests: dashboard.mainQuests.map((q) => (q.id === questId ? { ...q, text } : q)),
          }),
        });
      },

      completeMainQuest: (questId) => {
        const { dashboard } = get();
        const today = todayKey();
        const quest = dashboard.mainQuests.find((q) => q.id === questId);
        if (!quest) return;
        if (quest.completedDate === today) return;
        if (dashboard.mainQuests.some((q) => q.completedDate === today)) return;
        const sectorTag = quest.sectorTag;
        const nextStreak = computeMainQuestStreak(dashboard.mainQuestStreak, today);
        const streakBonus = streakMultiplier(
          Math.max(0, nextStreak.current - 1),
          XP_POLICY.mainQuestStreakStep,
          XP_POLICY.maxStreakBonus
        );
        const sameFamilyToday = dashboard.xpLedger.filter((e) => e.type === 'mainQuest').length + 1;
        const base = applyDailyDiminishingReturns(XP_POLICY.mainQuest, sameFamilyToday);
        const delta = Math.max(1, Math.round(base * streakBonus));
        const nextXp = dashboard.identity.currentXp + delta;
        const xpToNext = dashboard.identity.xpToNext;
        const leveledUp = nextXp >= xpToNext;
        const carried = leveledUp ? nextXp - xpToNext : nextXp;
        const nextIdentity = {
          ...dashboard.identity,
          level: leveledUp ? dashboard.identity.level + 1 : dashboard.identity.level,
          currentXp: carried,
          xpToNext: leveledUp ? Math.round(xpToNext * 1.2) : xpToNext,
          totalXp: (dashboard.identity.totalXp ?? 0) + delta,
        };
        const next = touch({
          ...dashboard,
          mainQuests: dashboard.mainQuests.map((q) => (q.id === questId ? { ...q, completedDate: today } : q)),
          identity: nextIdentity,
          mainQuestStreak: nextStreak,
          xpLedger: [
            {
              id: genId(),
              at: now(),
              type: 'mainQuest' as XpEventType,
              sectorTag,
              delta,
              note: `main:${questId}:${quest.text}`,
            },
            ...dashboard.xpLedger,
          ].slice(0, LEDGER_LIMIT),
        });
        set({ dashboard: next });
        toast.success(`+${delta} XP main quest`);
        const userId = useAuthStore.getState().currentUser?.id;
        if (userId) {
          void gamificationDB.recordQuestCompletion({
            userId,
            questId: questId,
            sectorId: sectorTag,
            questType: 'main',
            completionDate: today,
          });
          void gamificationDB.recordXpEvent({
            userId,
            deltaXp: delta,
            reason: 'main_quest',
            sectorId: sectorTag,
            questId: questId,
            occurredOn: today,
          });
          void gamificationDB.upsertMainQuestStreak(userId, nextStreak.current, nextStreak.best, today);
        }
      },

      undoMainQuestCompletion: (questId) => {
        const { dashboard } = get();
        const today = todayKey();
        const quest = dashboard.mainQuests.find((q) => q.id === questId);
        if (!quest || quest.completedDate !== today) return;

        const mainEntries = dashboard.xpLedger.filter((e) => e.type === 'mainQuest');
        const targetEntry = mainEntries.find((e) => (e.note ?? '').startsWith(`main:${questId}:`));
        const delta = targetEntry?.delta ?? 0;
        const nextTotalXp = Math.max(0, (dashboard.identity.totalXp ?? 0) - delta);

        // Recompute level curve from total XP so rollback is consistent.
        let level = 1;
        let xpToNext = 100;
        let remaining = nextTotalXp;
        while (remaining >= xpToNext) {
          remaining -= xpToNext;
          level += 1;
          xpToNext = Math.round(xpToNext * 1.2);
        }

        const nextStreakCurrent = Math.max(0, dashboard.mainQuestStreak.current - 1);
        const nextStreak = {
          ...dashboard.mainQuestStreak,
          current: nextStreakCurrent,
          lastDate: nextStreakCurrent === 0 ? null : dashboard.mainQuestStreak.lastDate,
        };

        set({
          dashboard: touch({
            ...dashboard,
            identity: {
              ...dashboard.identity,
              totalXp: nextTotalXp,
              level,
              currentXp: remaining,
              xpToNext,
            },
            mainQuestStreak: nextStreak,
            mainQuests: dashboard.mainQuests.map((q) => (q.id === questId ? { ...q, completedDate: null } : q)),
            xpLedger: targetEntry
              ? dashboard.xpLedger.filter((e) => e.id !== targetEntry.id)
              : dashboard.xpLedger,
          }),
        });
        toast.info(`Main quest undone${delta > 0 ? ` (-${delta} XP)` : ''}`);
      },

      recordSectorVisit: (sector) => {
        const { dashboard } = get();
        const today = todayKey();
        const current = dashboard.sectorVisits[sector] ?? DEFAULT_DASHBOARD_STATE.sectorVisits[sector];
        const computed = computeVisitStreak(current, today);
        if (computed.revisitedToday) return;
        const next = touch({
          ...dashboard,
          sectorVisits: { ...dashboard.sectorVisits, [sector]: computed.next },
          lastDailyDecayCheck: today,
        });
        set({ dashboard: next });
        const userId = useAuthStore.getState().currentUser?.id;
        if (userId) {
          void gamificationDB.recordSectorVisit(
            userId,
            sector,
            today,
            computed.next.streak.current,
            computed.next.streak.best
          );
          void gamificationDB.recordXpEvent({
            userId,
            deltaXp: 0,
            reason: 'sector_visit',
            sectorId: sector,
            occurredOn: today,
            metadata: { decayApplied: computed.decayApplied },
          });
        }
      },

      rewardLog: (note, sectorTag = 'focus') => {
        const { dashboard } = get();
        const today = todayKey();
        set({ dashboard: touch({ ...dashboard }) });
        const userId = useAuthStore.getState().currentUser?.id;
        if (userId) {
          void gamificationDB.recordXpEvent({
            userId,
            deltaXp: 0,
            reason: 'log',
            sectorId: sectorTag,
            occurredOn: today,
            metadata: note ? { note } : undefined,
          });
        }
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
          tasks: dashboard.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done, completedAt: !t.done ? todayKey() : null } : t
          ),
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

      setTaskSector: (taskId, sectorTag) => {
        const { dashboard } = get();
        set({
          dashboard: touch({
            ...dashboard,
            tasks: dashboard.tasks.map((t) => (t.id === taskId ? { ...t, sectorTag } : t)),
          }),
        });
      },

      completeDashboardTask: (taskId, sectorTag) => {
        const { dashboard } = get();
        const today = todayKey();
        const task = dashboard.tasks.find((t) => t.id === taskId);
        if (!task || task.done) return;
        set({
          dashboard: touch({
            ...dashboard,
            tasks: dashboard.tasks.map((t) =>
              t.id === taskId ? { ...t, done: true, completedAt: today, sectorTag } : t
            ),
          }),
        });
        const userId = useAuthStore.getState().currentUser?.id;
        if (userId) {
          void gamificationDB.recordQuestCompletion({
            userId,
            questId: task.id,
            sectorId: sectorTag,
            questType: task.quadrant === 'doNow' ? 'sector_specialized' : 'side',
            completionDate: today,
          });
          void gamificationDB.recordXpEvent({
            userId,
            deltaXp: 0,
            reason: task.quadrant === 'doNow' ? 'sector_quest' : 'side_quest',
            sectorId: sectorTag,
            questId: task.id,
            occurredOn: today,
          });
        }
      },

      recordExternalQuestCompletion: (questId, sectorTag, questType) => {
        const { dashboard } = get();
        const today = todayKey();
        set({ dashboard: touch({ ...dashboard }) });
        const userId = useAuthStore.getState().currentUser?.id;
        if (userId) {
          void gamificationDB.recordQuestCompletion({
            userId,
            questId,
            sectorId: sectorTag,
            questType: questType === 'side' ? 'side' : 'sector_specialized',
            completionDate: today,
          });
          void gamificationDB.recordXpEvent({
            userId,
            deltaXp: 0,
            reason: questType === 'side' ? 'side_quest' : 'sector_quest',
            sectorId: sectorTag,
            questId,
            occurredOn: today,
          });
        }
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

      setTricksterSectorScore: (sector, score) => {
        const { dashboard } = get();
        set({
          dashboard: touch({
            ...dashboard,
            tricksterScores: { ...dashboard.tricksterScores, [sector]: clampInt(score, 0, 100) },
          }),
        });
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

      getMysticDailyLog: (date = todayKey()) => {
        const { dashboard } = get();
        return dashboard.mysticDailyLogs.find((l) => l.date === date) ?? makeDailyLog(date);
      },

      upsertMysticDailyLog: (patch, date = todayKey()) => {
        const { dashboard } = get();
        const existing = dashboard.mysticDailyLogs.find((l) => l.date === date) ?? makeDailyLog(date);
        const nextLog: MysticDailyLog = {
          ...existing,
          ...patch,
          date,
          energySense: clampInt((patch.energySense ?? existing.energySense) as number, 0, 100),
          groundingPhysical: clampInt((patch.groundingPhysical ?? existing.groundingPhysical) as number, 0, 100),
          groundingPsychological: clampInt(
            (patch.groundingPsychological ?? existing.groundingPsychological) as number,
            0,
            100
          ),
          logosSet: clampInt((patch.logosSet ?? existing.logosSet) as number, 0, 20),
          logosDone: clampInt((patch.logosDone ?? existing.logosDone) as number, 0, 20),
          logosIntegrity: clampInt((patch.logosIntegrity ?? existing.logosIntegrity) as number, 0, 100),
          focusDurationMin: clampInt((patch.focusDurationMin ?? existing.focusDurationMin) as number, 0, 24 * 60),
          focusImageScore: clampInt((patch.focusImageScore ?? existing.focusImageScore) as number, 0, 100),
          focusCountScore: clampInt((patch.focusCountScore ?? existing.focusCountScore) as number, 0, 100),
          gratitudeItems: (patch.gratitudeItems ?? existing.gratitudeItems) as GratitudeItem[],
        };

        const logs = [
          nextLog,
          ...dashboard.mysticDailyLogs.filter((l) => l.date !== date),
        ].sort((a, b) => (a.date < b.date ? 1 : -1));

        const latest = logs[0] ?? nextLog;
        const logosAuto =
          latest.logosSet > 0
            ? clampInt(Math.round((latest.logosDone / latest.logosSet) * 100), 0, 100)
            : latest.logosIntegrity;
        const gratitudeScore = clampInt(latest.gratitudeItems.length * 20, 0, 100);
        const focusScore = clampInt(
          Math.round((latest.focusImageScore + latest.focusCountScore + Math.min(100, latest.focusDurationMin)) / 3),
          0,
          100
        );
        const groundingScore = clampInt(
          Math.round((latest.groundingPhysical + latest.groundingPsychological) / 2),
          0,
          100
        );

        set({
          dashboard: touch({
            ...dashboard,
            mysticDailyLogs: logs,
            mysticScores: {
              ...dashboard.mysticScores,
              energySense: latest.energySense,
              grounding: groundingScore,
              logos: logosAuto,
              gratitude: gratitudeScore,
              focus: focusScore,
            },
          }),
        });
      },

      addMysticGratitudeItem: (text, category = 'other', date = todayKey()) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const log = get().getMysticDailyLog(date);
        get().upsertMysticDailyLog({
          gratitudeItems: [{ id: genId(), text: trimmed, category }, ...log.gratitudeItems],
        }, date);
      },

      removeMysticGratitudeItem: (id, date = todayKey()) => {
        const log = get().getMysticDailyLog(date);
        get().upsertMysticDailyLog({
          gratitudeItems: log.gratitudeItems.filter((g) => g.id !== id),
        }, date);
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

export const computeUnifiedLifeScore = (dashboard: DashboardStateShape) => {
  const values = [
    ...Object.values(dashboard.scores),
    ...Object.values(dashboard.mysticScores),
    ...Object.values(dashboard.tricksterScores),
  ];
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORE_KEYS } from '@/constants/storage';
import { monthKeyFromDate, todayKey } from '@/utils/date';
import { CATEGORY_KEYS } from '@/components/finance/financeConfig';
import type {
  CategoryKey,
  Expense,
  FinanceCaps,
  FinanceStateShape,
  IncomeBase,
  IncomeExtra,
  NetWorthAsset,
  NetWorthSnapshot,
} from '@/types/finance';

const now = () => Date.now();
const unique = (ids: string[]) => Array.from(new Set(ids));

const isCategory = (value: unknown): value is CategoryKey =>
  typeof value === 'string' && (CATEGORY_KEYS as string[]).includes(value);

export const normalizeExpense = (partial: Partial<Expense> & Pick<Expense, 'id'>): Expense | null => {
  const amount = typeof partial.amount === 'number' ? Math.round(partial.amount * 100) / 100 : NaN;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!isCategory(partial.category)) return null;
  const date = typeof partial.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(partial.date) ? partial.date : todayKey();
  return {
    id: partial.id,
    date,
    timestamp: typeof partial.timestamp === 'number' ? partial.timestamp : now(),
    amount,
    category: partial.category,
    updatedAt: typeof partial.updatedAt === 'number' ? partial.updatedAt : now(),
  };
};

export const normalizeIncomeBase = (partial?: Partial<IncomeBase>): IncomeBase => ({
  amount: Math.max(0, Math.round((partial?.amount ?? 0) * 100) / 100),
  cadence: 'monthly',
  updatedAt: typeof partial?.updatedAt === 'number' ? partial.updatedAt : now(),
});

export const normalizeExtra = (partial: Partial<IncomeExtra> & Pick<IncomeExtra, 'id'>): IncomeExtra | null => {
  const amount = typeof partial.amount === 'number' ? Math.round(partial.amount * 100) / 100 : NaN;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const date = typeof partial.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(partial.date) ? partial.date : todayKey();
  return {
    id: partial.id,
    date,
    amount,
    label: typeof partial.label === 'string' && partial.label.trim() ? partial.label.trim() : undefined,
    month: partial.month && /^\d{4}-\d{2}$/.test(partial.month) ? partial.month : monthKeyFromDate(date),
    updatedAt: typeof partial.updatedAt === 'number' ? partial.updatedAt : now(),
  };
};

const sanitizeCaps = (raw: unknown): FinanceCaps => {
  const next: FinanceCaps = {};
  if (!raw || typeof raw !== 'object') return next;
  for (const key of CATEGORY_KEYS) {
    const value = (raw as FinanceCaps)[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      next[key] = Math.round(value * 100) / 100;
    }
  }
  return next;
};

const moneyOrZero = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100) / 100;
};

export const normalizeAsset = (partial: Partial<NetWorthAsset> & Pick<NetWorthAsset, 'id'>): NetWorthAsset | null => {
  const label = typeof partial.label === 'string' ? partial.label.trim() : '';
  const value = moneyOrZero(partial.value);
  if (!label && value <= 0) return null;
  return { id: partial.id, label: label || 'Asset', value };
};

export const normalizeSnapshot = (
  partial: Partial<NetWorthSnapshot> & Pick<NetWorthSnapshot, 'id'>
): NetWorthSnapshot | null => {
  const date =
    typeof partial.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(partial.date) ? partial.date : todayKey();
  const assets = Array.isArray(partial.assets)
    ? partial.assets
        .map((row) =>
          row && typeof row === 'object' && typeof (row as NetWorthAsset).id === 'string'
            ? normalizeAsset(row as NetWorthAsset)
            : null
        )
        .filter((a): a is NetWorthAsset => Boolean(a))
    : [];
  return {
    id: partial.id,
    date,
    savings: moneyOrZero(partial.savings),
    debt: moneyOrZero(partial.debt),
    assets,
    updatedAt: typeof partial.updatedAt === 'number' ? partial.updatedAt : now(),
  };
};

export const DEFAULT_FINANCE_STATE: FinanceStateShape = {
  expenses: {},
  incomeBase: { amount: 0, cadence: 'monthly', updatedAt: 0 },
  extras: {},
  caps: {},
  snapshots: {},
  dirtyExpenseIds: [],
  deletedExpenseIds: [],
  dirtyExtraIds: [],
  deletedExtraIds: [],
  dirtySnapshotIds: [],
  deletedSnapshotIds: [],
  incomeBaseDirty: false,
  capsDirty: false,
};

const migrateV1Incomes = (raw: unknown): IncomeBase | null => {
  if (!raw || typeof raw !== 'object') return null;
  const values = Object.values(raw as Record<string, { amount?: number; updatedAt?: number }>);
  if (values.length === 0) return null;
  const latest = values.reduce((best, row) =>
    (row.updatedAt ?? 0) >= (best.updatedAt ?? 0) ? row : best
  );
  if (typeof latest.amount !== 'number' || latest.amount <= 0) return null;
  return normalizeIncomeBase({ amount: latest.amount, updatedAt: latest.updatedAt });
};

interface FinanceStoreState {
  finance: FinanceStateShape;
  addExpense: (input: { amount: number; category: CategoryKey; date?: string; timestamp?: number }) => void;
  updateExpense: (id: string, patch: Partial<Pick<Expense, 'amount' | 'category' | 'date'>>) => void;
  deleteExpense: (id: string) => void;
  setIncomeBase: (amount: number) => void;
  addExtra: (input: { amount: number; label?: string; date?: string }) => void;
  deleteExtra: (id: string) => void;
  setCaps: (caps: FinanceCaps) => void;
  addSnapshot: (input: { savings: number; debt: number; assets: NetWorthAsset[]; date?: string }) => void;
  hydrateFinance: (incoming: {
    expenses?: Expense[];
    incomeBase?: IncomeBase;
    extras?: IncomeExtra[];
    caps?: FinanceCaps;
    snapshots?: NetWorthSnapshot[];
    markClean?: boolean;
  }) => void;
  resetFinance: () => void;
  clearDirty: (opts?: {
    expenseIds?: string[];
    extraIds?: string[];
    snapshotIds?: string[];
    deletedIds?: string[];
    deletedExtraIds?: string[];
    deletedSnapshotIds?: string[];
    incomeBase?: boolean;
    caps?: boolean;
  }) => void;
}

export const useFinanceStore = create<FinanceStoreState>()(
  persist(
    (set, get) => ({
      finance: DEFAULT_FINANCE_STATE,

      addExpense: ({ amount, category, date, timestamp }) => {
        const expense = normalizeExpense({
          id: crypto.randomUUID(),
          amount,
          category,
          date: date ?? todayKey(),
          timestamp: timestamp ?? now(),
          updatedAt: now(),
        });
        if (!expense) return;
        const { finance } = get();
        set({
          finance: {
            ...finance,
            expenses: { ...finance.expenses, [expense.id]: expense },
            dirtyExpenseIds: unique([...finance.dirtyExpenseIds, expense.id]),
          },
        });
      },

      updateExpense: (id, patch) => {
        const { finance } = get();
        const current = finance.expenses[id];
        if (!current) return;
        const next = normalizeExpense({ ...current, ...patch, id, updatedAt: now() });
        if (!next) return;
        set({
          finance: {
            ...finance,
            expenses: { ...finance.expenses, [id]: next },
            dirtyExpenseIds: unique([...finance.dirtyExpenseIds, id]),
          },
        });
      },

      deleteExpense: (id) => {
        const { finance } = get();
        if (!finance.expenses[id] && !finance.deletedExpenseIds.includes(id)) return;
        const { [id]: _removed, ...rest } = finance.expenses;
        set({
          finance: {
            ...finance,
            expenses: rest,
            dirtyExpenseIds: finance.dirtyExpenseIds.filter((d) => d !== id),
            deletedExpenseIds: unique([...finance.deletedExpenseIds, id]),
          },
        });
      },

      setIncomeBase: (amount) => {
        const { finance } = get();
        set({
          finance: {
            ...finance,
            incomeBase: normalizeIncomeBase({ amount, updatedAt: now() }),
            incomeBaseDirty: true,
          },
        });
      },

      addExtra: ({ amount, label, date }) => {
        const extra = normalizeExtra({
          id: crypto.randomUUID(),
          amount,
          label,
          date: date ?? todayKey(),
          updatedAt: now(),
        });
        if (!extra) return;
        const { finance } = get();
        set({
          finance: {
            ...finance,
            extras: { ...finance.extras, [extra.id]: extra },
            dirtyExtraIds: unique([...finance.dirtyExtraIds, extra.id]),
          },
        });
      },

      deleteExtra: (id) => {
        const { finance } = get();
        const { [id]: _removed, ...rest } = finance.extras;
        set({
          finance: {
            ...finance,
            extras: rest,
            dirtyExtraIds: finance.dirtyExtraIds.filter((d) => d !== id),
            deletedExtraIds: unique([...finance.deletedExtraIds, id]),
          },
        });
      },

      setCaps: (caps) => {
        const { finance } = get();
        set({ finance: { ...finance, caps: sanitizeCaps(caps), capsDirty: true } });
      },

      addSnapshot: ({ savings, debt, assets, date }) => {
        const snapshot = normalizeSnapshot({
          id: crypto.randomUUID(),
          savings,
          debt,
          assets,
          date: date ?? todayKey(),
          updatedAt: now(),
        });
        if (!snapshot) return;
        const { finance } = get();
        set({
          finance: {
            ...finance,
            snapshots: { ...finance.snapshots, [snapshot.id]: snapshot },
            dirtySnapshotIds: unique([...finance.dirtySnapshotIds, snapshot.id]),
          },
        });
      },

      hydrateFinance: (incoming) => {
        const { finance } = get();
        const expenses = { ...finance.expenses };
        let dirtyExpenseIds = [...finance.dirtyExpenseIds];
        const deleted = new Set(finance.deletedExpenseIds);

        for (const raw of incoming.expenses ?? []) {
          const expense = normalizeExpense(raw);
          if (!expense || deleted.has(expense.id)) continue;
          const local = expenses[expense.id];
          if (!local || expense.updatedAt >= local.updatedAt) {
            expenses[expense.id] = expense;
            if (incoming.markClean) dirtyExpenseIds = dirtyExpenseIds.filter((d) => d !== expense.id);
          }
        }

        let incomeBase = finance.incomeBase;
        let incomeBaseDirty = finance.incomeBaseDirty;
        if (incoming.incomeBase && (incoming.markClean || !incomeBaseDirty)) {
          if (!incomeBaseDirty || incoming.incomeBase.updatedAt >= incomeBase.updatedAt) {
            incomeBase = normalizeIncomeBase(incoming.incomeBase);
            if (incoming.markClean) incomeBaseDirty = false;
          }
        }

        const extras = { ...finance.extras };
        let dirtyExtraIds = [...finance.dirtyExtraIds];
        const deletedExtras = new Set(finance.deletedExtraIds);
        for (const raw of incoming.extras ?? []) {
          const extra = normalizeExtra(raw);
          if (!extra || deletedExtras.has(extra.id)) continue;
          const local = extras[extra.id];
          if (!local || extra.updatedAt >= local.updatedAt) {
            extras[extra.id] = extra;
            if (incoming.markClean) dirtyExtraIds = dirtyExtraIds.filter((d) => d !== extra.id);
          }
        }

        let caps = finance.caps;
        let capsDirty = finance.capsDirty;
        if (incoming.caps && (incoming.markClean || !capsDirty)) {
          caps = sanitizeCaps(incoming.caps);
          if (incoming.markClean) capsDirty = false;
        }

        const snapshots = { ...finance.snapshots };
        let dirtySnapshotIds = [...finance.dirtySnapshotIds];
        const deletedSnapshots = new Set(finance.deletedSnapshotIds);
        for (const raw of incoming.snapshots ?? []) {
          const snapshot = normalizeSnapshot(raw);
          if (!snapshot || deletedSnapshots.has(snapshot.id)) continue;
          const local = snapshots[snapshot.id];
          if (!local || snapshot.updatedAt >= local.updatedAt) {
            snapshots[snapshot.id] = snapshot;
            if (incoming.markClean) dirtySnapshotIds = dirtySnapshotIds.filter((d) => d !== snapshot.id);
          }
        }

        set({
          finance: {
            ...finance,
            expenses,
            incomeBase,
            extras,
            caps,
            snapshots,
            dirtyExpenseIds: unique(dirtyExpenseIds),
            dirtyExtraIds: unique(dirtyExtraIds),
            dirtySnapshotIds: unique(dirtySnapshotIds),
            incomeBaseDirty,
            capsDirty,
          },
        });
      },

      resetFinance: () => set({ finance: DEFAULT_FINANCE_STATE }),

      clearDirty: (opts) => {
        const { finance } = get();
        if (!opts) {
          set({
            finance: {
              ...finance,
              dirtyExpenseIds: [],
              deletedExpenseIds: [],
              dirtyExtraIds: [],
              deletedExtraIds: [],
              dirtySnapshotIds: [],
              deletedSnapshotIds: [],
              incomeBaseDirty: false,
              capsDirty: false,
            },
          });
          return;
        }
        const dropExp = new Set(opts.expenseIds ?? []);
        const dropEx = new Set(opts.extraIds ?? []);
        const dropSnap = new Set(opts.snapshotIds ?? []);
        const dropDel = new Set(opts.deletedIds ?? []);
        const dropDelEx = new Set(opts.deletedExtraIds ?? []);
        const dropDelSnap = new Set(opts.deletedSnapshotIds ?? []);
        set({
          finance: {
            ...finance,
            dirtyExpenseIds: finance.dirtyExpenseIds.filter((d) => !dropExp.has(d)),
            deletedExpenseIds: finance.deletedExpenseIds.filter((d) => !dropDel.has(d)),
            dirtyExtraIds: finance.dirtyExtraIds.filter((d) => !dropEx.has(d)),
            deletedExtraIds: finance.deletedExtraIds.filter((d) => !dropDelEx.has(d)),
            dirtySnapshotIds: finance.dirtySnapshotIds.filter((d) => !dropSnap.has(d)),
            deletedSnapshotIds: finance.deletedSnapshotIds.filter((d) => !dropDelSnap.has(d)),
            incomeBaseDirty: opts.incomeBase ? false : finance.incomeBaseDirty,
            capsDirty: opts.caps ? false : finance.capsDirty,
          },
        });
      },
    }),
    {
      name: STORE_KEYS.FINANCE,
      partialize: (state) => ({ finance: state.finance }),
      merge: (persisted, current) => {
        const cur = current as FinanceStoreState;
        let raw = persisted as { finance?: Record<string, unknown> } | undefined;
        if (!raw?.finance && typeof localStorage !== 'undefined') {
          try {
            const legacy = localStorage.getItem('anima-finance-v1');
            if (legacy) raw = JSON.parse(legacy).state;
          } catch {
            /* ignore */
          }
        }
        if (!raw?.finance) return cur;
        const p = raw.finance;
        const expenses: Record<string, Expense> = {};
        for (const [id, row] of Object.entries((p.expenses as Record<string, Expense>) ?? {})) {
          const expense = normalizeExpense({ ...row, id });
          if (expense) expenses[id] = expense;
        }
        const extras: Record<string, IncomeExtra> = {};
        for (const [id, row] of Object.entries((p.extras as Record<string, IncomeExtra>) ?? {})) {
          const extra = normalizeExtra({ ...row, id });
          if (extra) extras[id] = extra;
        }
        const snapshots: Record<string, NetWorthSnapshot> = {};
        for (const [id, row] of Object.entries((p.snapshots as Record<string, NetWorthSnapshot>) ?? {})) {
          const snapshot = normalizeSnapshot({ ...row, id });
          if (snapshot) snapshots[id] = snapshot;
        }
        const fromV1 = migrateV1Incomes(p.incomes);
        const incomeBase = normalizeIncomeBase(
          fromV1 && !(p.incomeBase as IncomeBase | undefined)?.amount
            ? fromV1
            : (p.incomeBase as IncomeBase | undefined)
        );
        return {
          ...cur,
          finance: {
            expenses,
            extras,
            incomeBase,
            caps: sanitizeCaps(p.caps),
            snapshots,
            dirtyExpenseIds: unique((p.dirtyExpenseIds as string[]) ?? []),
            deletedExpenseIds: unique((p.deletedExpenseIds as string[]) ?? []),
            dirtyExtraIds: unique((p.dirtyExtraIds as string[]) ?? []),
            deletedExtraIds: unique((p.deletedExtraIds as string[]) ?? []),
            dirtySnapshotIds: unique((p.dirtySnapshotIds as string[]) ?? []),
            deletedSnapshotIds: unique((p.deletedSnapshotIds as string[]) ?? []),
            incomeBaseDirty: Boolean(p.incomeBaseDirty),
            capsDirty: Boolean(p.capsDirty),
          },
        };
      },
    }
  )
);

export const financeExpenseList = (finance: FinanceStateShape): Expense[] =>
  Object.values(finance.expenses).sort((a, b) => b.timestamp - a.timestamp);

export const financeExtraList = (finance: FinanceStateShape): IncomeExtra[] =>
  Object.values(finance.extras).sort((a, b) => b.updatedAt - a.updatedAt);

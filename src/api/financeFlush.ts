import { financeDB } from '@/api/financeDatabase';
import { financeDirtyCount, useFinanceStore } from '@/store/financeStore';
import { logger } from '@/utils/logger';

export type FlushResult = { ok: boolean; failed: number };

const tryOne = async (label: string, run: () => Promise<void>): Promise<boolean> => {
  try {
    await run();
    return true;
  } catch (error) {
    logger.error(`finance flush ${label} failed`, error);
    return false;
  }
};

let inFlight: Promise<FlushResult> | null = null;

const flushOnce = async (userId: string): Promise<FlushResult> => {
  const { finance, clearDirty } = useFinanceStore.getState();
  const pending = financeDirtyCount(finance);
  if (pending === 0) return { ok: true, failed: 0 };

  if (!financeDB.isReady()) {
    logger.error('finance flush skipped: supabase not configured');
    return { ok: false, failed: pending };
  }

  const okExpenses: string[] = [];
  const okDeleted: string[] = [];
  const okExtras: string[] = [];
  const okDeletedExtras: string[] = [];
  const okSnapshots: string[] = [];
  const okDeletedSnapshots: string[] = [];
  let incomeBaseOk = false;
  let capsOk = false;

  await Promise.all([
    ...finance.dirtyExpenseIds.map(async (id) => {
      const expense = finance.expenses[id];
      if (!expense) {
        okExpenses.push(id);
        return;
      }
      if (await tryOne(`expense ${id}`, () => financeDB.upsertExpense(userId, expense))) {
        okExpenses.push(id);
      }
    }),
    ...finance.deletedExpenseIds.map(async (id) => {
      if (await tryOne(`delete expense ${id}`, () => financeDB.deleteExpense(userId, id))) {
        okDeleted.push(id);
      }
    }),
    ...finance.dirtyExtraIds.map(async (id) => {
      const extra = finance.extras[id];
      if (!extra) {
        okExtras.push(id);
        return;
      }
      if (await tryOne(`extra ${id}`, () => financeDB.upsertExtra(userId, extra))) {
        okExtras.push(id);
      }
    }),
    ...finance.deletedExtraIds.map(async (id) => {
      if (await tryOne(`delete extra ${id}`, () => financeDB.deleteExtra(userId, id))) {
        okDeletedExtras.push(id);
      }
    }),
    ...finance.dirtySnapshotIds.map(async (id) => {
      const snapshot = finance.snapshots[id];
      if (!snapshot) {
        okSnapshots.push(id);
        return;
      }
      if (await tryOne(`snapshot ${id}`, () => financeDB.upsertSnapshot(userId, snapshot))) {
        okSnapshots.push(id);
      }
    }),
    ...finance.deletedSnapshotIds.map(async (id) => {
      if (await tryOne(`delete snapshot ${id}`, () => financeDB.deleteSnapshot(userId, id))) {
        okDeletedSnapshots.push(id);
      }
    }),
    (async () => {
      if (!finance.incomeBaseDirty) return;
      if (await tryOne('income base', () => financeDB.upsertIncomeBase(userId, finance.incomeBase))) {
        incomeBaseOk = true;
      }
    })(),
    (async () => {
      if (!finance.capsDirty) return;
      if (await tryOne('caps', () => financeDB.upsertCaps(userId, finance.caps))) {
        capsOk = true;
      }
    })(),
  ]);

  clearDirty({
    expenseIds: okExpenses,
    deletedIds: okDeleted,
    extraIds: okExtras,
    deletedExtraIds: okDeletedExtras,
    snapshotIds: okSnapshots,
    deletedSnapshotIds: okDeletedSnapshots,
    incomeBase: incomeBaseOk,
    caps: capsOk,
  });

  const failed = financeDirtyCount(useFinanceStore.getState().finance);
  return { ok: failed === 0, failed };
};

export const flushFinanceToCloud = (userId: string): Promise<FlushResult> => {
  if (inFlight) return inFlight;
  inFlight = flushOnce(userId).finally(() => {
    inFlight = null;
  });
  return inFlight;
};

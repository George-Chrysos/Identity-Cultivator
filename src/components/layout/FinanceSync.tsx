import { useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { financeDB } from '@/api/financeDatabase';
import { logger } from '@/utils/logger';
import { shiftDate, todayKey } from '@/utils/date';

const FinanceSync = () => {
  const userId = useAuthStore((s) => s.currentUser?.id ?? null);
  const dirtyExpenseIds = useFinanceStore((s) => s.finance.dirtyExpenseIds);
  const deletedExpenseIds = useFinanceStore((s) => s.finance.deletedExpenseIds);
  const dirtyExtraIds = useFinanceStore((s) => s.finance.dirtyExtraIds);
  const deletedExtraIds = useFinanceStore((s) => s.finance.deletedExtraIds);
  const dirtySnapshotIds = useFinanceStore((s) => s.finance.dirtySnapshotIds);
  const deletedSnapshotIds = useFinanceStore((s) => s.finance.deletedSnapshotIds);
  const incomeBaseDirty = useFinanceStore((s) => s.finance.incomeBaseDirty);
  const capsDirty = useFinanceStore((s) => s.finance.capsDirty);
  const hydrateFinance = useFinanceStore((s) => s.hydrateFinance);
  const resetFinance = useFinanceStore((s) => s.resetFinance);
  const clearDirty = useFinanceStore((s) => s.clearDirty);

  const debounceTimerRef = useRef<number | null>(null);
  const hasHydratedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const canSync = useMemo(() => Boolean(userId) && financeDB.isReady(), [userId]);
  const dirty =
    dirtyExpenseIds.length +
    deletedExpenseIds.length +
    dirtyExtraIds.length +
    deletedExtraIds.length +
    dirtySnapshotIds.length +
    deletedSnapshotIds.length +
    (incomeBaseDirty ? 1 : 0) +
    (capsDirty ? 1 : 0);

  useEffect(() => {
    if (!userId || !financeDB.isReady()) return;

    hasHydratedRef.current = false;

    if (lastUserIdRef.current !== userId) {
      lastUserIdRef.current = userId;
      resetFinance();
    }

    void (async () => {
      try {
        const from = shiftDate(todayKey(), -400);
        const remote = await financeDB.fetchAll(userId, from);
        hydrateFinance({ ...remote, markClean: true });
      } catch (error) {
        logger.error('FinanceSync hydrate failed', error);
      } finally {
        hasHydratedRef.current = true;
      }
    })();
  }, [userId, hydrateFinance, resetFinance]);

  useEffect(() => {
    if (userId !== null) return;
    if (lastUserIdRef.current === null) return;
    lastUserIdRef.current = null;
    hasHydratedRef.current = false;
    resetFinance();
  }, [userId, resetFinance]);

  useEffect(() => {
    if (!canSync || !userId) return;
    if (!hasHydratedRef.current) return;
    if (dirty === 0) return;

    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = window.setTimeout(() => {
      void (async () => {
        const state = useFinanceStore.getState().finance;
        try {
          await Promise.all([
            ...state.dirtyExpenseIds.map((id) => {
              const expense = state.expenses[id];
              return expense ? financeDB.upsertExpense(userId, expense) : Promise.resolve();
            }),
            ...state.deletedExpenseIds.map((id) => financeDB.deleteExpense(userId, id)),
            ...state.dirtyExtraIds.map((id) => {
              const extra = state.extras[id];
              return extra ? financeDB.upsertExtra(userId, extra) : Promise.resolve();
            }),
            ...state.deletedExtraIds.map((id) => financeDB.deleteExtra(userId, id)),
            ...state.dirtySnapshotIds.map((id) => {
              const snapshot = state.snapshots[id];
              return snapshot ? financeDB.upsertSnapshot(userId, snapshot) : Promise.resolve();
            }),
            ...state.deletedSnapshotIds.map((id) => financeDB.deleteSnapshot(userId, id)),
            state.incomeBaseDirty ? financeDB.upsertIncomeBase(userId, state.incomeBase) : Promise.resolve(),
            state.capsDirty ? financeDB.upsertCaps(userId, state.caps) : Promise.resolve(),
          ]);
          clearDirty({
            expenseIds: state.dirtyExpenseIds,
            deletedIds: state.deletedExpenseIds,
            extraIds: state.dirtyExtraIds,
            deletedExtraIds: state.deletedExtraIds,
            snapshotIds: state.dirtySnapshotIds,
            deletedSnapshotIds: state.deletedSnapshotIds,
            incomeBase: state.incomeBaseDirty,
            caps: state.capsDirty,
          });
        } catch (error) {
          logger.error('FinanceSync upsert failed', error);
        }
      })();
    }, 750);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [
    canSync,
    userId,
    dirty,
    dirtyExpenseIds,
    deletedExpenseIds,
    dirtyExtraIds,
    deletedExtraIds,
    dirtySnapshotIds,
    deletedSnapshotIds,
    incomeBaseDirty,
    capsDirty,
    clearDirty,
  ]);

  return null;
};

export default FinanceSync;

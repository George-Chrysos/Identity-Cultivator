import { useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { financeDirtyCount, useFinanceStore } from '@/store/financeStore';
import { financeDB } from '@/api/financeDatabase';
import { flushFinanceToCloud } from '@/api/financeFlush';
import { toast } from '@/store/toastStore';
import { logger } from '@/utils/logger';
import { shiftDate, todayKey } from '@/utils/date';

const SAVE_ERROR = 'Could not save finance to the cloud';
const LOAD_ERROR = 'Could not load finance from the cloud';

const FinanceSync = () => {
  const userId = useAuthStore((s) => s.currentUser?.id ?? null);
  const finance = useFinanceStore((s) => s.finance);
  const hydrateFinance = useFinanceStore((s) => s.hydrateFinance);
  const resetFinance = useFinanceStore((s) => s.resetFinance);

  const debounceTimerRef = useRef<number | null>(null);
  const hasHydratedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const canSync = useMemo(() => Boolean(userId) && financeDB.isReady(), [userId]);
  const dirty = financeDirtyCount(finance);

  useEffect(() => {
    if (!userId || !financeDB.isReady()) return;

    const prev = lastUserIdRef.current;
    const switchedUser = prev !== null && prev !== userId;
    lastUserIdRef.current = userId;
    hasHydratedRef.current = false;

    if (switchedUser) resetFinance();

    void (async () => {
      try {
        const from = shiftDate(todayKey(), -400);
        const remote = await financeDB.fetchAll(userId, from);
        const { incomplete, ...payload } = remote;
        hydrateFinance({ ...payload, markClean: true });
        if (incomplete) toast.error(LOAD_ERROR);
      } catch (error) {
        logger.error('FinanceSync hydrate failed', error);
        toast.error(LOAD_ERROR);
      } finally {
        hasHydratedRef.current = true;
        const result = await flushFinanceToCloud(userId);
        if (!result.ok) toast.error(SAVE_ERROR);
      }
    })();
  }, [userId, hydrateFinance, resetFinance]);

  useEffect(() => {
    if (userId !== null) return;
    if (lastUserIdRef.current === null) return;

    const previousUserId = lastUserIdRef.current;

    void (async () => {
      if (financeDirtyCount(useFinanceStore.getState().finance) > 0) {
        if (!financeDB.isReady()) {
          toast.error(SAVE_ERROR);
          hasHydratedRef.current = false;
          return;
        }
        const result = await flushFinanceToCloud(previousUserId);
        if (!result.ok) {
          toast.error(SAVE_ERROR);
          hasHydratedRef.current = false;
          return;
        }
      }

      lastUserIdRef.current = null;
      hasHydratedRef.current = false;
      resetFinance();
    })();
  }, [userId, resetFinance]);

  useEffect(() => {
    if (!canSync || !userId) return;
    if (!hasHydratedRef.current) return;
    if (dirty === 0) return;

    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = window.setTimeout(() => {
      void (async () => {
        const result = await flushFinanceToCloud(userId);
        if (!result.ok) toast.error(SAVE_ERROR);
      })();
    }, 750);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [canSync, userId, dirty, finance.dirtyExpenseIds, finance.deletedExpenseIds, finance.dirtyExtraIds, finance.deletedExtraIds, finance.dirtySnapshotIds, finance.deletedSnapshotIds, finance.incomeBaseDirty, finance.capsDirty]);

  return null;
};

export default FinanceSync;

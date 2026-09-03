import { useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { syncFrom, useDashboardStore } from '@/store/dashboardStore';
import { dashboardDB } from '@/api/dashboardDatabase';
import { logger } from '@/utils/logger';
import { todayKey } from '@/utils/date';

/**
 * Hydrates the last ~45 days of daily_entries when authenticated,
 * then debounce-upserts dirty dates.
 */
const DashboardSync = () => {
  const userId = useAuthStore((s) => s.currentUser?.id ?? null);
  const displayName = useAuthStore((s) => s.currentUser?.name ?? s.currentUser?.email ?? null);
  const dirtyDates = useDashboardStore((s) => s.dashboard.dirtyDates);
  const entries = useDashboardStore((s) => s.dashboard.entries);
  const hydrateEntries = useDashboardStore((s) => s.hydrateEntries);
  const resetDashboard = useDashboardStore((s) => s.resetDashboard);
  const clearDirty = useDashboardStore((s) => s.clearDirty);

  const debounceTimerRef = useRef<number | null>(null);
  const hasHydratedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const canSync = useMemo(() => Boolean(userId) && dashboardDB.isReady(), [userId]);

  useEffect(() => {
    if (!userId || !dashboardDB.isReady()) return;

    hasHydratedRef.current = false;

    if (lastUserIdRef.current !== userId) {
      lastUserIdRef.current = userId;
      resetDashboard();
    }

    void (async () => {
      try {
        await dashboardDB.ensureProfile(userId, displayName);
        const to = todayKey();
        const from = syncFrom(to);
        const remote = await dashboardDB.fetchRange(userId, from, to);
        hydrateEntries(remote, { markClean: true });
        useDashboardStore.getState().applyQuestCarryover();
        useDashboardStore.getState().refreshRank();
      } catch (error) {
        logger.error('DashboardSync hydrate failed', error);
      } finally {
        hasHydratedRef.current = true;
      }
    })();
  }, [userId, displayName, hydrateEntries, resetDashboard]);

  useEffect(() => {
    if (userId !== null) return;
    if (lastUserIdRef.current === null) return;
    lastUserIdRef.current = null;
    hasHydratedRef.current = false;
    resetDashboard();
  }, [userId, resetDashboard]);

  useEffect(() => {
    if (!canSync || !userId) return;
    if (!hasHydratedRef.current) return;
    if (dirtyDates.length === 0) return;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    const pending = [...dirtyDates];

    debounceTimerRef.current = window.setTimeout(() => {
      void (async () => {
        try {
          await Promise.all(
            pending.map((date) => {
              const entry = useDashboardStore.getState().dashboard.entries[date];
              if (!entry) return Promise.resolve();
              return dashboardDB.upsertEntry(userId, entry);
            })
          );
          clearDirty(pending);
        } catch (error) {
          logger.error('DashboardSync upsert failed', error);
        }
      })();
    }, 750);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [canSync, userId, dirtyDates, entries, clearDirty]);

  return null;
};

export default DashboardSync;

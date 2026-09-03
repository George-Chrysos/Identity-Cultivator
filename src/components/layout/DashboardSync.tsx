import { useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { DEFAULT_DASHBOARD_STATE, useDashboardStore } from '@/store/dashboardStore';
import { dashboardDB } from '@/api/dashboardDatabase';
import { logger } from '@/utils/logger';

const parseIsoMs = (iso: string | null) => {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
};

/**
 * Keeps the dashboard store synced to Supabase when authenticated.
 * Local persisted state is the source of truth when unauthenticated.
 */
const DashboardSync = () => {
  const userId = useAuthStore((s) => s.currentUser?.id ?? null);
  const dashboard = useDashboardStore((s) => s.dashboard);
  const setDashboard = useDashboardStore((s) => s.setDashboard);
  const resetDashboard = useDashboardStore((s) => s.resetDashboard);

  const lastPushedAtRef = useRef<number>(0);
  const debounceTimerRef = useRef<number | null>(null);
  const hasHydratedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const canSync = useMemo(() => Boolean(userId) && dashboardDB.isReady(), [userId]);

  useEffect(() => {
    if (!userId || !dashboardDB.isReady()) return;

    hasHydratedRef.current = false;
    lastPushedAtRef.current = 0;

    if (lastUserIdRef.current !== userId) {
      lastUserIdRef.current = userId;
      resetDashboard();
    }

    void (async () => {
      try {
        const remote = await dashboardDB.fetchDashboard(userId);
        const remoteMs = parseIsoMs(remote.updatedAt) ?? 0;
        const localMs = useDashboardStore.getState().dashboard.updatedAt ?? 0;

        if (remote.state && remoteMs > localMs) {
          setDashboard({ ...remote.state, updatedAt: remote.state.updatedAt ?? remoteMs });
        } else if (!remote.state) {
          await dashboardDB.upsertDashboard(userId, DEFAULT_DASHBOARD_STATE);
        }
      } catch (error) {
        logger.error('DashboardSync hydrate failed', error);
      } finally {
        hasHydratedRef.current = true;
      }
    })();
  }, [userId, resetDashboard, setDashboard]);

  useEffect(() => {
    if (userId !== null) return;
    // Stay on local persist when the session starts logged out.
    // Only clear after a real logout (previous user id present).
    if (lastUserIdRef.current === null) return;
    lastUserIdRef.current = null;
    lastPushedAtRef.current = 0;
    hasHydratedRef.current = false;
    resetDashboard();
  }, [userId, resetDashboard]);

  useEffect(() => {
    if (!canSync || !userId) return;
    if (!hasHydratedRef.current) return;

    const updatedAt = dashboard.updatedAt ?? 0;
    if (updatedAt <= lastPushedAtRef.current) return;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      void (async () => {
        try {
          await dashboardDB.upsertDashboard(userId, dashboard);
          lastPushedAtRef.current = updatedAt;
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
  }, [canSync, userId, dashboard]);

  return null;
};

export default DashboardSync;

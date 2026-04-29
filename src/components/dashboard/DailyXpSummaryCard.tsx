import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { todayIsoDay } from '@/utils/xpEngine';

export const DailyXpSummaryCard = () => {
  const ledger = useDashboardStore((s) => s.dashboard.xpLedger);
  const mainStreak = useDashboardStore((s) => s.dashboard.mainQuestStreak.current);

  const today = todayIsoDay();
  const todayEntries = useMemo(
    () => ledger.filter((entry) => new Date(entry.at).toISOString().slice(0, 10) === today),
    [ledger, today]
  );

  const totalXp = todayEntries.reduce((sum, e) => sum + e.delta, 0);
  const byType = todayEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + e.delta;
    return acc;
  }, {});

  const topSector = useMemo(() => {
    const sectorMap = todayEntries.reduce<Record<string, number>>((acc, e) => {
      if (!e.sectorTag) return acc;
      acc[e.sectorTag] = (acc[e.sectorTag] ?? 0) + e.delta;
      return acc;
    }, {});
    return Object.entries(sectorMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';
  }, [todayEntries]);

  return (
    <section className="hud-card p-4">
      <div className="text-[11px] uppercase tracking-[0.28em] text-slate-300 font-title mb-2">Daily Debrief</div>
      <div className="text-sm text-slate-200">XP today: {totalXp}</div>
      <div className="mt-2 text-xs text-slate-400">Main streak: {mainStreak}</div>
      <div className="text-xs text-slate-400">Top sector: {topSector}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
        <span>Main {byType.mainQuest ?? 0}</span>
        <span>Side {byType.sideQuest ?? 0}</span>
        <span>Sector {byType.sectorQuest ?? 0}</span>
        <span>Logs {byType.log ?? 0}</span>
      </div>
    </section>
  );
};

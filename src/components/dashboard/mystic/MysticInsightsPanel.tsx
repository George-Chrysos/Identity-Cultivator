import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

const RECENT_DAYS = 7;

export const MysticInsightsPanel = () => {
  const logs = useDashboardStore((s) => s.dashboard.mysticDailyLogs);
  const recent = useMemo(() => [...logs].slice(0, RECENT_DAYS).reverse(), [logs]);

  const gratitudeCount = useMemo(
    () => recent.reduce((sum, l) => sum + l.gratitudeItems.length, 0),
    [recent]
  );
  const gratitudeStreak = useMemo(() => {
    let streak = 0;
    for (const l of logs) {
      if (l.gratitudeItems.length > 0) streak += 1;
      else break;
    }
    return streak;
  }, [logs]);

  const avgFocus = useMemo(() => {
    if (recent.length === 0) return 0;
    return Math.round(
      recent.reduce((sum, l) => sum + (l.focusImageScore + l.focusCountScore) / 2, 0) / recent.length
    );
  }, [recent]);

  return (
    <section className="hud-card p-4 border-purple-500/15">
      <div className="text-[11px] uppercase tracking-[0.28em] text-purple-200/80 font-title mb-3">
        Mystic insights
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="7d gratitude entries" value={gratitudeCount} />
        <Stat label="Gratitude streak" value={gratitudeStreak} />
        <Stat label="Avg focus score" value={avgFocus} suffix="%" />
        <Stat label="Logs tracked" value={logs.length} />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <MiniTrend
          title="Focus duration (7d)"
          values={recent.map((l) => Math.min(100, l.focusDurationMin))}
        />
        <MiniTrend
          title="Energy sense (7d)"
          values={recent.map((l) => l.energySense)}
        />
      </div>
    </section>
  );
};

const Stat = ({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) => (
  <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
    <div className="mt-1 font-data text-lg text-slate-100">
      {value}
      {suffix}
    </div>
  </div>
);

const MiniTrend = ({ title, values }: { title: string; values: number[] }) => (
  <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-2">{title}</div>
    <div className="flex items-end gap-1 h-14">
      {values.length === 0 && <div className="text-xs text-slate-400">No data yet</div>}
      {values.map((v, i) => (
        <div
          key={`${title}-${i}`}
          className="flex-1 rounded-t bg-gradient-to-t from-purple-500/60 to-cyan-400/70"
          style={{ height: `${Math.max(8, Math.min(100, v))}%` }}
          title={`${v}`}
        />
      ))}
    </div>
  </div>
);


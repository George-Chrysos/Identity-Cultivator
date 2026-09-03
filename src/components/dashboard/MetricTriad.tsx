import { HeartPulse, Brain, Sparkles, type LucideIcon } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { STAT_COLORS } from '@/constants/theme';
import type { MetricKey } from '@/types/dashboard';

const METRICS: {
  key: MetricKey;
  label: string;
  Icon: LucideIcon;
  text: string;
  bg: string;
  border: string;
  glow: string;
  ring: string;
}[] = [
  {
    key: 'body',
    label: 'Body',
    Icon: HeartPulse,
    text: STAT_COLORS.BODY.text,
    bg: STAT_COLORS.BODY.bg,
    border: STAT_COLORS.BODY.border,
    glow: 'shadow-[0_0_18px_rgba(236,72,153,0.35)]',
    ring: 'focus:border-pink-400/80 focus:ring-pink-500/30',
  },
  {
    key: 'mind',
    label: 'Mind',
    Icon: Brain,
    text: STAT_COLORS.MIND.text,
    bg: STAT_COLORS.MIND.bg,
    border: STAT_COLORS.MIND.border,
    glow: 'shadow-[0_0_18px_rgba(6,182,212,0.35)]',
    ring: 'focus:border-cyan-400/80 focus:ring-cyan-500/30',
  },
  {
    key: 'soul',
    label: 'Soul',
    Icon: Sparkles,
    text: STAT_COLORS.SOUL.text,
    bg: STAT_COLORS.SOUL.bg,
    border: STAT_COLORS.SOUL.border,
    glow: 'shadow-[0_0_18px_rgba(168,85,247,0.35)]',
    ring: 'focus:border-purple-400/80 focus:ring-purple-500/30',
  },
];

export const MetricTriad = () => {
  const metrics = useDashboardStore((s) => s.dashboard.metrics);
  const setMetric = useDashboardStore((s) => s.setMetric);

  return (
    <section className="grid grid-cols-3 gap-3 sm:gap-4" aria-label="Metrics">
      {METRICS.map(({ key, label, Icon, text, bg, border, glow, ring }) => (
        <div
          key={key}
          className={`hud-card hud-pulse p-4 sm:p-5 flex flex-col items-center gap-3 ${glow}`}
        >
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${bg} border ${border} flex items-center justify-center`}
          >
            <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${text}`} aria-hidden />
          </div>
          <span className={`text-[10px] sm:text-xs uppercase tracking-widest font-section ${text}`}>
            {label}
          </span>
          <label className="sr-only" htmlFor={`metric-${key}`}>
            {label} metric 0 to 100
          </label>
          <input
            id={`metric-${key}`}
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={metrics[key]}
            onChange={(e) => setMetric(key, Number(e.target.value))}
            aria-label={`${label} metric`}
            className={`w-full max-w-[5.5rem] text-center font-data text-lg sm:text-xl bg-slate-950/60 border ${border} rounded-xl px-2 py-1.5 text-white outline-none focus:ring-2 ${ring}`}
          />
        </div>
      ))}
    </section>
  );
};

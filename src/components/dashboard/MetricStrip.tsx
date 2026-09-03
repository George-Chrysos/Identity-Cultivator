import { METRIC_CONFIG } from './metricConfig';
import { metricAverages7, useDashboardStore } from '@/store/dashboardStore';

interface MetricStripProps {
  onOpenLog: () => void;
}

const formatAvg = (value: number | null) => (value === null ? '—' : String(value));

export const MetricStrip = ({ onOpenLog }: MetricStripProps) => {
  const averages = useDashboardStore((s) => metricAverages7(s.dashboard));

  return (
    <section className="grid grid-cols-3 gap-3" aria-label="Seven day metric averages">
      {METRIC_CONFIG.map(({ key, label, Icon, text, bg, border, glow }) => (
        <button
          key={key}
          type="button"
          onClick={onOpenLog}
          aria-label={`${label} seven day average ${formatAvg(averages[key])}. Log metrics.`}
          className={`hud-card hud-pulse p-3 sm:p-4 flex items-center gap-3 text-left ${glow}`}
        >
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${bg} border ${border} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${text}`} aria-hidden />
          </div>
          <div className="min-w-0">
            <span className={`block text-[10px] uppercase tracking-widest font-section ${text}`}>{label}</span>
            <span className="font-data text-xl sm:text-2xl text-white">{formatAvg(averages[key])}</span>
          </div>
        </button>
      ))}
    </section>
  );
};

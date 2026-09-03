import { CalendarDays } from 'lucide-react';
import { METRIC_CONFIG } from './metricConfig';
import { StatRing } from './StatRing';
import { metricAverages7, useDashboardStore } from '@/store/dashboardStore';
import { formatMetricAvg } from '@/utils/metrics';

interface MetricStripProps {
  onOpenLog: () => void;
  onOpenHistory: () => void;
}

export const MetricStrip = ({ onOpenLog, onOpenHistory }: MetricStripProps) => {
  const averages = useDashboardStore((s) => metricAverages7(s.dashboard));

  return (
    <section className="flex flex-col gap-1" aria-label="Seven day metric averages">
      <div className="flex justify-end pr-1">
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="History"
          className="stats-util-btn"
        >
          <CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex items-stretch justify-center">
        {METRIC_CONFIG.map(({ key, label, Icon, text, stroke }) => (
          <button
            key={key}
            type="button"
            onClick={onOpenLog}
            aria-label={`${label} seven day average ${formatMetricAvg(averages[key])}. Log metrics.`}
            className="stat-orb flex-1 flex justify-center py-1"
          >
            <StatRing
              label={label}
              Icon={Icon}
              value={averages[key]}
              stroke={stroke}
              textClass={text}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

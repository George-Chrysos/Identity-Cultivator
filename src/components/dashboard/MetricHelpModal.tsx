import { BaseModal } from '@/components/common';
import { METRIC_CONFIG } from './metricConfig';

interface MetricHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetricHelpModal = ({ isOpen, onClose }: MetricHelpModalProps) => (
  <BaseModal isOpen={isOpen} onClose={onClose} title="Scoring anchors" maxWidth="lg" overlayClassName="!z-[60]">
    <div className="p-6 space-y-6">
      <p className="text-sm text-slate-300 font-body m-0">
        Score 1–5 so it stays fast, not philosophical. Tap a number that matches the day.
      </p>
      {METRIC_CONFIG.map(({ label, Icon, text, anchors }) => (
        <section key={label} className="space-y-2">
          <h3 className={`flex items-center gap-2 text-sm uppercase tracking-widest font-section m-0 ${text}`}>
            <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {label}
          </h3>
          <ol className="space-y-1.5 m-0 pl-0 list-none">
            {anchors.map((line, i) => (
              <li key={line} className="flex gap-3 text-sm font-body text-slate-200">
                <span className={`font-data w-4 shrink-0 ${text}`}>{i + 1}</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  </BaseModal>
);

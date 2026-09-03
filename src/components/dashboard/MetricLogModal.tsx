import { useEffect, useState } from 'react';
import { BaseModal } from '@/components/common';
import { METRIC_CONFIG } from './metricConfig';
import { getEntry, useDashboardStore } from '@/store/dashboardStore';
import { todayKey, yesterdayKey } from '@/utils/date';
import { toast } from '@/store/toastStore';

interface MetricLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DayChoice = 'today' | 'yesterday';

const toField = (value: number | null) => (value === null ? '' : String(value));

export const MetricLogModal = ({ isOpen, onClose }: MetricLogModalProps) => {
  const setMetrics = useDashboardStore((s) => s.setMetrics);
  const [day, setDay] = useState<DayChoice>('today');
  const [fields, setFields] = useState({ body: '', mind: '', soul: '' });

  const date = day === 'today' ? todayKey() : yesterdayKey();

  useEffect(() => {
    if (!isOpen) return;
    const entry = getEntry(useDashboardStore.getState().dashboard, date);
    setFields({
      body: toField(entry.body),
      mind: toField(entry.mind),
      soul: toField(entry.soul),
    });
  }, [isOpen, date]);

  const parse = (raw: string): number | null => {
    if (raw.trim() === '') return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.min(100, Math.max(0, Math.round(n)));
  };

  const save = () => {
    setMetrics(date, {
      body: parse(fields.body),
      mind: parse(fields.mind),
      soul: parse(fields.soul),
    });
    toast.success(day === 'today' ? 'Today logged' : 'Yesterday logged');
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Log metrics" maxWidth="md">
      <div className="p-6 space-y-5">
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {(['today', 'yesterday'] as const).map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setDay(choice)}
              className={`flex-1 py-2 text-xs uppercase tracking-widest font-section ${
                day === choice
                  ? 'bg-violet-500/30 text-white'
                  : 'bg-slate-950/40 text-slate-400 hover:text-white'
              }`}
            >
              {choice}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {METRIC_CONFIG.map(({ key, label, Icon, text, border, ring }) => (
            <label key={key} className="flex flex-col items-center gap-2">
              <Icon className={`w-5 h-5 ${text}`} aria-hidden />
              <span className={`text-[10px] uppercase tracking-widest font-section ${text}`}>{label}</span>
              <input
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                value={fields[key]}
                onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                aria-label={`${label} for ${day}`}
                className={`w-full text-center font-data text-lg bg-slate-950/60 border ${border} rounded-xl px-2 py-1.5 text-white outline-none focus:ring-2 ${ring}`}
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={save}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold shadow-lg"
        >
          Save
        </button>
      </div>
    </BaseModal>
  );
};

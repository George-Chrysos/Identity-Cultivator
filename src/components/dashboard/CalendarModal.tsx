import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BaseModal } from '@/components/common';
import { METRIC_CONFIG } from './metricConfig';
import { getEntry, useDashboardStore } from '@/store/dashboardStore';
import { isEditableDate, monthGrid, monthLabel, todayKey } from '@/utils/date';
import type { DailyEntry, DailyKey } from '@/types/dashboard';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAILY_LABELS: { key: DailyKey; label: string }[] = [
  { key: 'morningActivation', label: 'Morning Activation' },
  { key: 'ritual', label: 'Ritual' },
  { key: 'nightProtocol', label: 'Night Protocol' },
];

const hasAny = (date: string, entries: Record<string, DailyEntry>) => {
  const e = entries[date];
  if (!e) return false;
  return (
    e.body !== null ||
    e.mind !== null ||
    e.soul !== null ||
    e.mainTaskDone ||
    e.mainTaskText.trim().length > 0 ||
    e.morningActivation ||
    e.ritual ||
    e.nightProtocol
  );
};

export const CalendarModal = ({ isOpen, onClose }: CalendarModalProps) => {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(todayKey());
  const dashboard = useDashboardStore((s) => s.dashboard);
  const toggleDaily = useDashboardStore((s) => s.toggleDaily);
  const toggleMainTask = useDashboardStore((s) => s.toggleMainTask);
  const setMainTaskText = useDashboardStore((s) => s.setMainTaskText);
  const setMetrics = useDashboardStore((s) => s.setMetrics);

  const cells = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const entry = getEntry(dashboard, selected);
  const editable = isEditableDate(selected);
  const today = todayKey();

  const shiftMonth = (delta: number) => {
    const date = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  };

  const parseMetric = (raw: string): number | null => {
    if (raw.trim() === '') return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.min(100, Math.max(0, Math.round(n)));
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="History" maxWidth="2xl">
      <div className="p-5 sm:p-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => shiftMonth(-1)} className="p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm uppercase tracking-widest font-section m-0">{monthLabel(cursor.year, cursor.month)}</h3>
            <button type="button" onClick={() => shiftMonth(1)} className="p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] uppercase tracking-widest text-slate-400 font-section py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={`pad-${i}`} />;
              const marked = hasAny(date, dashboard.entries);
              const isSelected = date === selected;
              const isToday = date === today;
              const future = date > today;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={future}
                  onClick={() => setSelected(date)}
                  className={`aspect-square rounded-lg text-xs font-data border ${
                    isSelected
                      ? 'border-cyan-400/70 bg-cyan-500/20 text-white'
                      : isToday
                        ? 'border-violet-400/50 bg-violet-500/10 text-white'
                        : marked
                          ? 'border-white/15 bg-slate-900/70 text-slate-100'
                          : 'border-white/5 bg-slate-950/30 text-slate-400'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {Number(date.slice(8))}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest font-section text-slate-300 m-0">
            {selected}
            {!editable && <span className="ml-2 text-slate-500">read only</span>}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {METRIC_CONFIG.map(({ key, label, text, border, ring }) => (
              <label key={key} className="flex flex-col gap-1">
                <span className={`text-[10px] uppercase tracking-widest font-section ${text}`}>{label}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  disabled={!editable}
                  value={entry[key] ?? ''}
                  onChange={(e) =>
                    setMetrics(selected, {
                      body: key === 'body' ? parseMetric(e.target.value) : entry.body,
                      mind: key === 'mind' ? parseMetric(e.target.value) : entry.mind,
                      soul: key === 'soul' ? parseMetric(e.target.value) : entry.soul,
                    })
                  }
                  className={`w-full text-center font-data bg-slate-950/60 border ${border} rounded-xl px-2 py-1.5 text-white outline-none focus:ring-2 ${ring} disabled:opacity-60`}
                />
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-section text-violet-200">Main task</span>
            <input
              type="text"
              disabled={!editable}
              value={entry.mainTaskText}
              onChange={(e) => setMainTaskText(selected, e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-white font-body outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-60"
            />
            <button
              type="button"
              disabled={!editable}
              onClick={() => toggleMainTask(selected)}
              className={`w-full py-2 rounded-xl text-xs uppercase tracking-widest font-section border ${
                entry.mainTaskDone
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
                  : 'bg-slate-800/50 border-white/10 text-slate-300'
              } disabled:opacity-60`}
            >
              {entry.mainTaskDone ? 'Task done' : 'Mark task done'}
            </button>
          </div>

          <div className="space-y-2">
            {DAILY_LABELS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                disabled={!editable}
                onClick={() => toggleDaily(selected, key)}
                className={`w-full py-2 rounded-xl text-xs uppercase tracking-widest font-section border ${
                  entry[key]
                    ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
                    : 'bg-slate-800/50 border-white/10 text-slate-300'
                } disabled:opacity-60`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

import { useEffect, useState } from 'react';
import { Check, Flame, Moon, RotateCcw, Sunrise } from 'lucide-react';
import { getEntry, useDashboardStore } from '@/store/dashboardStore';
import { isEditableDate, todayKey, yesterdayKey } from '@/utils/date';
import type { DailyEntry, DailyKey, MetricKey } from '@/types/dashboard';
import { METRIC_CONFIG } from './metricConfig';
import { MiniStatRing } from './MiniStatRing';
import { ScorePicker } from './ScorePicker';

type DayChoice = 'today' | 'yesterday';

interface DayEditorProps {
  variant: 'log' | 'history';
  date?: string;
  onOpenHelp: () => void;
  onSaved?: () => void;
}

const DAILY_ROWS: {
  key: DailyKey;
  label: string;
  Icon: typeof Sunrise;
  on: string;
  off: string;
}[] = [
  {
    key: 'morningActivation',
    label: 'Morning Activation',
    Icon: Sunrise,
    on: 'bg-pink-500/20 border-pink-400/50 text-pink-100 shadow-[0_0_10px_rgba(244,114,182,0.25)]',
    off: 'bg-slate-950/40 border-white/10 text-white',
  },
  {
    key: 'ritual',
    label: 'Ritual',
    Icon: Flame,
    on: 'bg-violet-500/20 border-violet-400/50 text-violet-100 shadow-[0_0_10px_rgba(192,132,252,0.25)]',
    off: 'bg-slate-950/40 border-white/10 text-white',
  },
  {
    key: 'nightProtocol',
    label: 'Night Protocol',
    Icon: Moon,
    on: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.25)]',
    off: 'bg-slate-950/40 border-white/10 text-white',
  },
];

const draftFromStore = (date: string): DailyEntry => ({
  ...getEntry(useDashboardStore.getState().dashboard, date),
});

const formatDateLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const relationLabel = (date: string) => {
  const today = todayKey();
  if (date === today) return 'Today';
  if (date === yesterdayKey(today)) return 'Yesterday';
  return 'Past';
};

export const DayEditor = ({ variant, date: dateProp, onOpenHelp, onSaved }: DayEditorProps) => {
  const [day, setDay] = useState<DayChoice>('today');
  const date = variant === 'log' ? (day === 'today' ? todayKey() : yesterdayKey()) : (dateProp ?? todayKey());
  const [draft, setDraft] = useState<DailyEntry>(() => draftFromStore(date));
  const [saved, setSaved] = useState(false);
  const patchEntry = useDashboardStore((s) => s.patchEntry);
  const editable = isEditableDate(date);

  useEffect(() => {
    setDraft(draftFromStore(date));
    setSaved(false);
  }, [date]);

  const setMetric = (key: MetricKey, value: number | null) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    if (!editable || saved) return;
    const original = draftFromStore(date);
    const textChanged = draft.mainTaskText !== original.mainTaskText;
    patchEntry(date, {
      body: draft.body,
      mind: draft.mind,
      soul: draft.soul,
      mainTaskText: draft.mainTaskText,
      mainTaskDone: draft.mainTaskDone,
      morningActivation: draft.morningActivation,
      ritual: draft.ritual,
      nightProtocol: draft.nightProtocol,
      carriedOver: textChanged ? false : draft.carriedOver,
    });
    setSaved(true);
    window.setTimeout(() => onSaved?.(), 200);
  };

  return (
    <div className="p-[var(--space-md)] flex flex-col gap-[var(--space-md)]">
      <header className="flex items-baseline justify-between gap-[var(--space-sm)] pr-8">
        <h3 className="font-section text-sm uppercase tracking-widest text-white m-0">
          {formatDateLabel(date)}
        </h3>
        <span className="font-section text-[10px] uppercase tracking-widest text-white/50">
          {relationLabel(date)}
        </span>
      </header>

      {variant === 'log' && (
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {(['today', 'yesterday'] as const).map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setDay(choice)}
              className={`flex-1 py-2 text-xs uppercase tracking-widest font-section ${
                day === choice ? 'bg-white/10 text-white' : 'bg-transparent text-white/45 hover:text-white'
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenHelp}
        className="flex items-center gap-[var(--space-xs)] self-start text-amber-200/90 hover:text-amber-100"
      >
        <span className="font-section text-[10px] uppercase tracking-widest">How to score</span>
        <span
          aria-hidden
          className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/50 font-title text-sm"
        >
          !
        </span>
      </button>

      <div className="flex flex-col gap-[var(--space-sm)]">
        {METRIC_CONFIG.map(({ key, label, Icon, text, stroke }) => (
          <div key={key} className="flex flex-col gap-[var(--space-xs)]">
            <div className="flex items-center gap-[var(--space-xs)]">
              <Icon className={`h-4 w-4 ${text}`} strokeWidth={1.5} aria-hidden />
              <span className={`font-section text-[10px] uppercase tracking-widest flex-1 ${text}`}>
                {label}
              </span>
              <MiniStatRing value={draft[key]} stroke={stroke} />
            </div>
            <ScorePicker
              stat={key}
              label={label}
              value={draft[key]}
              disabled={!editable}
              onChange={(value) => setMetric(key, value)}
            />
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-[var(--space-xs)]" aria-label="Main task">
        <div className="flex items-center gap-[var(--space-xs)]">
          <span className="font-section text-[10px] uppercase tracking-widest text-amber-200/90">
            Main task
          </span>
          {draft.carriedOver && (
            <RotateCcw className="h-3 w-3 text-white/40" aria-label="Carried over from yesterday" />
          )}
        </div>
        {editable ? (
          <>
            <input
              type="text"
              value={draft.mainTaskText}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, mainTaskText: e.target.value, carriedOver: false }))
              }
              placeholder="Name the one task"
              aria-label="Main task"
              className={`w-full bg-slate-950/60 border border-amber-400/20 rounded-xl px-3 py-2 text-white font-body outline-none focus:ring-2 focus:ring-amber-500/40 quest-strike ${
                draft.mainTaskDone ? 'quest-strike-on text-white/55' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, mainTaskDone: !prev.mainTaskDone }))}
              aria-pressed={draft.mainTaskDone}
              className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs uppercase tracking-widest font-section border ${
                draft.mainTaskDone
                  ? 'bg-amber-400 border-amber-400 text-slate-950'
                  : 'bg-slate-800/50 border-amber-400/35 text-amber-100'
              }`}
            >
              {draft.mainTaskDone ? <Check className="h-4 w-4" strokeWidth={2.5} /> : (
                <span className="h-4 w-4 rounded-full border border-current" />
              )}
              {draft.mainTaskDone ? 'Complete' : 'Check'}
            </button>
          </>
        ) : (
          <div className="flex items-start gap-[var(--space-xs)] rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
            {draft.mainTaskDone && <Check className="h-4 w-4 shrink-0 mt-0.5 text-amber-300" strokeWidth={2.5} />}
            <p className={`m-0 font-body text-sm ${draft.mainTaskDone ? 'line-through text-white/55' : 'text-white'}`}>
              {draft.mainTaskText.trim() || 'No task logged'}
            </p>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-[var(--space-xs)]">
        {DAILY_ROWS.map(({ key, label, Icon, on, off }) => (
          <button
            key={key}
            type="button"
            disabled={!editable}
            onClick={() => setDraft((prev) => ({ ...prev, [key]: !prev[key] }))}
            aria-pressed={draft[key]}
            className={`flex items-center gap-[var(--space-xs)] w-full py-2 px-3 rounded-xl text-left text-xs uppercase tracking-widest font-section border disabled:opacity-70 ${
              draft[key] ? on : off
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {draft[key] && <Check className="h-3.5 w-3.5" />}
          </button>
        ))}
      </div>

      {editable && (
        <button
          type="button"
          onClick={save}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              Saved
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </>
          ) : (
            'Save'
          )}
        </button>
      )}
    </div>
  );
};

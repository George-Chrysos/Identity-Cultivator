import type { MetricKey } from '@/types/dashboard';

interface ScorePickerProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  label: string;
  stat?: MetricKey;
}

const SCORES = [1, 2, 3, 4, 5] as const;

const SELECTED: Record<MetricKey, string> = {
  body: 'bg-pink-500 border-pink-300 text-white shadow-[0_0_10px_rgba(244,114,182,0.65)]',
  soul: 'bg-violet-500 border-violet-300 text-white shadow-[0_0_10px_rgba(192,132,252,0.65)]',
  mind: 'bg-cyan-500 border-cyan-300 text-white shadow-[0_0_10px_rgba(34,211,238,0.65)]',
};

const FOCUS: Record<MetricKey, string> = {
  body: 'focus-visible:ring-pink-400',
  soul: 'focus-visible:ring-violet-400',
  mind: 'focus-visible:ring-cyan-400',
};

export const ScorePicker = ({ value, onChange, disabled, label, stat = 'soul' }: ScorePickerProps) => (
  <div className="flex gap-[var(--space-xs)]" role="group" aria-label={`${label} score 1 to 5`}>
    {SCORES.map((n) => {
      const active = value === n;
      return (
        <button
          key={n}
          type="button"
          disabled={disabled}
          aria-pressed={active}
          data-stat={stat}
          onClick={() => onChange(active ? null : n)}
          className={`metric-pill flex-1 min-w-[1.75rem] py-1.5 rounded-lg font-data text-sm border outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent disabled:opacity-50 ${FOCUS[stat]} ${
            active
              ? SELECTED[stat]
              : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/30'
          }`}
        >
          {n}
        </button>
      );
    })}
  </div>
);

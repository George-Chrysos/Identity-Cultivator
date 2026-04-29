import { useDashboardStore } from '@/store/dashboardStore';
import { InlineEditableTextarea } from '../InlineEditableTextarea';

export const FocusWidget = () => {
  const log = useDashboardStore((s) => s.getMysticDailyLog());
  const upsert = useDashboardStore((s) => s.upsertMysticDailyLog);
  const rewardLog = useDashboardStore((s) => s.rewardLog);

  return (
    <section className="hud-card p-4 border-fuchsia-500/20">
      <div className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/80 font-title mb-2">
        Focus
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field
          label="Duration (min)"
          value={log.focusDurationMin}
          onChange={(v) => {
            upsert({ focusDurationMin: Number(v) });
            rewardLog('Focus duration update', 'focus');
          }}
        />
        <Field
          label="Image score"
          value={log.focusImageScore}
          onChange={(v) => {
            upsert({ focusImageScore: Number(v) });
            rewardLog('Focus image score update', 'focus');
          }}
        />
        <Field
          label="Count score"
          value={log.focusCountScore}
          onChange={(v) => {
            upsert({ focusCountScore: Number(v) });
            rewardLog('Focus count score update', 'focus');
          }}
        />
      </div>
      <div className="mt-3">
        <div className="text-[10px] text-slate-400 mb-1">Context note</div>
        <InlineEditableTextarea
          value={log.focusContextNote ?? ''}
          rows={3}
          className="min-h-[72px] rounded-lg border border-white/10 bg-black/15 p-2 text-sm text-slate-200"
          inputClassName="w-full min-h-[88px] rounded-lg border border-fuchsia-400/30 bg-black/25 p-2 text-sm text-slate-100 focus:outline-none"
          onCommit={(text) => {
            upsert({ focusContextNote: text });
            rewardLog('Focus context note', 'focus');
          }}
        />
      </div>
    </section>
  );
};

const Field = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
}) => (
  <div>
    <div className="text-[10px] text-slate-400 mb-1">{label}</div>
    <input
      type="number"
      min={0}
      max={1440}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg bg-transparent border border-white/10 px-2 py-1 font-data"
    />
  </div>
);


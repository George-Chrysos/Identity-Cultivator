import { useDashboardStore } from '@/store/dashboardStore';
import { InlineEditableTextarea } from './InlineEditableTextarea';

export const TricksterPanel = () => {
  const trickster = useDashboardStore((s) => s.dashboard.trickster);
  const setTrickster = useDashboardStore((s) => s.setTrickster);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="hud-card p-4 border-[#f72585]/20">
          <div className="text-[11px] uppercase tracking-[0.28em] text-pink-200/90 font-title mb-2">
            Absurd mission of the day
          </div>
          <p className="text-[10px] text-slate-500 mb-2">One gloriously unreasonable objective. Click to edit.</p>
          <InlineEditableTextarea
            value={trickster.absurdMission}
            placeholder="Today I shall…"
            rows={4}
            className="min-h-[100px] rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-slate-200"
            inputClassName="w-full min-h-[120px] rounded-xl border border-[#f72585]/25 bg-black/25 p-3 text-sm text-slate-100 focus:outline-none focus:border-[#f72585]/45 resize-y"
            onCommit={(absurdMission) => setTrickster({ absurdMission })}
          />
        </section>

        <section className="hud-card p-4 border-[#f72585]/20">
          <div className="text-[11px] uppercase tracking-[0.28em] text-pink-200/90 font-title mb-2">
            Daily quirk — rule of the Fool
          </div>
          <p className="text-[10px] text-slate-500 mb-2">One small behavioral twist you commit to for the whole day.</p>
          <InlineEditableTextarea
            value={trickster.dailyQuirk}
            placeholder="E.g. speak in third person until sunset…"
            rows={4}
            className="min-h-[100px] rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-slate-200"
            inputClassName="w-full min-h-[120px] rounded-xl border border-[#f72585]/25 bg-black/25 p-3 text-sm text-slate-100 focus:outline-none focus:border-[#f72585]/45 resize-y"
            onCommit={(dailyQuirk) => setTrickster({ dailyQuirk })}
          />
        </section>
      </div>

      <section className="hud-card p-4 border-[#f9c74f]/15">
        <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/85 font-title mb-2">
          Fool&apos;s footnote — the rest
        </div>
        <p className="text-[10px] text-slate-500 mb-2">
          Loose threads, punchlines, omens you refuse to take seriously. Expand this lens later.
        </p>
        <InlineEditableTextarea
          value={trickster.foolsFootnote}
          placeholder="Anything else the Trickster wants on the record…"
          rows={5}
          className="min-h-[100px] rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-slate-200"
          inputClassName="w-full min-h-[130px] rounded-xl border border-amber-400/20 bg-black/25 p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400/40 resize-y"
          onCommit={(foolsFootnote) => setTrickster({ foolsFootnote })}
        />
      </section>

      <section className="hud-card p-4 border-white/10 bg-black/10">
        <div className="text-[10px] uppercase tracking-[0.26em] text-slate-500 font-title mb-1">Coming soon</div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Trickster life sectors, chaos matrix, or a deck of micro-dares — wire them here when you know what you want.
        </p>
      </section>
    </div>
  );
};

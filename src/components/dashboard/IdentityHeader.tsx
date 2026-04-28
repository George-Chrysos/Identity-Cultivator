import { computeLifeScore, useDashboardStore } from '@/store/dashboardStore';
import { InlineEditableText } from './InlineEditableText';
import { ProgressBar } from './ProgressBar';

const lifeScoreTone = (lifeScore: number) => {
  if (lifeScore >= 70) return 'text-emerald-300 border-emerald-400/40';
  if (lifeScore >= 40) return 'text-amber-300 border-amber-400/40';
  return 'text-rose-300 border-rose-400/40';
};

export const IdentityHeader = () => {
  const dashboard = useDashboardStore((s) => s.dashboard);
  const updateIdentity = useDashboardStore((s) => s.updateIdentity);

  const lifeScore = computeLifeScore(dashboard.scores);
  const tone = lifeScoreTone(lifeScore);

  const xpToNext = Math.max(1, dashboard.identity.xpToNext);
  const xpPct = Math.max(0, Math.min(100, (dashboard.identity.currentXp / xpToNext) * 100));

  return (
    <section className="hud-card hud-pulse p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <InlineEditableText
            value={dashboard.identity.name}
            placeholder="Name"
            className="block w-full text-left text-2xl md:text-3xl font-title tracking-wide text-white"
            inputClassName="w-full bg-transparent border-b border-cyan-400/40 focus:outline-none text-2xl md:text-3xl font-title text-white"
            onCommit={(name) => updateIdentity({ name: name || 'Jester' })}
          />

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">
            <InlineEditableText
              value={dashboard.identity.title}
              placeholder="Title"
              className="text-left hover:text-cyan-200 transition-colors"
              inputClassName="bg-transparent border-b border-cyan-400/40 focus:outline-none text-cyan-100/90 font-title text-sm tracking-[0.18em]"
              onCommit={(title) => updateIdentity({ title: title || 'Systems Architect' })}
            />
            <span className="opacity-40">/</span>
            <InlineEditableText
              value={dashboard.identity.motto}
              placeholder="Motto (one-line principle)"
              className="text-left text-slate-300 hover:text-white transition-colors normal-case tracking-normal font-body"
              inputClassName="w-full bg-transparent border-b border-cyan-400/40 focus:outline-none text-slate-100 font-body"
              onCommit={(motto) => updateIdentity({ motto: motto || 'Clarity over chaos.' })}
            />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div
            className={`w-16 h-16 md:w-[72px] md:h-[72px] rounded-full border bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center ${tone}`}
          >
            <div className="font-data text-xl leading-none">{Math.round(lifeScore)}</div>
            <div className="text-[9px] uppercase tracking-[0.24em] text-white/60">
              Life
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-[auto,1fr,auto] items-center gap-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-slate-300">
          <span className="text-purple-300/90 font-title">XP</span>
          <span className="text-slate-400">Lvl</span>
          <span className="font-data text-slate-100">{dashboard.identity.level}</span>
        </div>

        <div className="min-w-0">
          <ProgressBar value={xpPct} accent="purple" />
        </div>

        <div className="flex items-center justify-end gap-2 text-[11px] text-slate-300">
          <span className="font-data text-slate-100">{dashboard.identity.currentXp}</span>
          <span className="opacity-60">/</span>
          <span className="font-data text-slate-100">{dashboard.identity.xpToNext}</span>
          <span className="opacity-60">to next</span>
        </div>
      </div>
    </section>
  );
};


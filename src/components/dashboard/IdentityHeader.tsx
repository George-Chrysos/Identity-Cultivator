import { computeUnifiedLifeScore, useDashboardStore } from '@/store/dashboardStore';
import { InlineEditableText } from './InlineEditableText';
import { ProgressBar } from './ProgressBar';

const rankForScore = (score: number): 'D' | 'C' | 'B' | 'A' | 'S' => {
  if (score >= 81) return 'S';
  if (score >= 61) return 'A';
  if (score >= 41) return 'B';
  if (score >= 21) return 'C';
  return 'D';
};

const rankTone = (rank: 'D' | 'C' | 'B' | 'A' | 'S') => {
  if (rank === 'S') return { classes: 'text-fuchsia-200 border-fuchsia-300/70', glow: '0 0 24px rgba(217,70,239,0.55)' };
  if (rank === 'A') return { classes: 'text-emerald-200 border-emerald-300/65', glow: '0 0 22px rgba(16,185,129,0.5)' };
  if (rank === 'B') return { classes: 'text-cyan-200 border-cyan-300/60', glow: '0 0 20px rgba(34,211,238,0.48)' };
  if (rank === 'C') return { classes: 'text-amber-200 border-amber-300/55', glow: '0 0 18px rgba(245,158,11,0.45)' };
  return { classes: 'text-rose-200 border-rose-300/55', glow: '0 0 16px rgba(244,63,94,0.45)' };
};

export const IdentityHeader = () => {
  const dashboard = useDashboardStore((s) => s.dashboard);
  const updateIdentity = useDashboardStore((s) => s.updateIdentity);

  const lifeScore = computeUnifiedLifeScore(dashboard);
  const rank = rankForScore(Math.round(lifeScore));
  const tone = rankTone(rank);
  const mainStreak = dashboard.mainQuestStreak.current;
  const hottestVisitStreak = Math.max(...Object.values(dashboard.sectorVisits).map((s) => s.streak.current), 0);

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
            className={`w-16 h-16 md:w-[78px] md:h-[78px] rounded-full border bg-black/25 backdrop-blur-sm flex flex-col items-center justify-center ${tone.classes}`}
            style={{ boxShadow: tone.glow }}
          >
            <div className="text-[8px] uppercase tracking-[0.24em] text-white/65">RANK</div>
            <div className="font-data text-2xl leading-none">{rank}</div>
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
      <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-slate-400">
        <span>Main streak 🔥 {mainStreak}</span>
        <span className="opacity-40">/</span>
        <span>Visit ember ✨ {hottestVisitStreak}</span>
      </div>
    </section>
  );
};


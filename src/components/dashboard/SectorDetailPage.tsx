import type { SectorId } from '@/types/dashboard';
import { useDashboardStore } from '@/store/dashboardStore';
import { InlineEditableNumber } from './InlineEditableNumber';

const LABEL: Record<SectorId, string> = {
  finance: 'Finance',
  selfCare: 'Self‑Care',
  home: 'Home',
  motorcycle: 'Motorcycle',
};

export const SectorDetailPage = ({
  sector,
  onBack,
}: {
  sector: SectorId;
  onBack: () => void;
}) => {
  const score = useDashboardStore((s) => s.dashboard.scores[sector] ?? 0);
  const setSectorScore = useDashboardStore((s) => s.setSectorScore);

  return (
    <div className="space-y-4">
      <div className="hud-card p-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-2 rounded-xl border border-white/10 bg-black/20 text-slate-200 text-xs uppercase tracking-[0.22em] font-title hover:border-cyan-400/25 hover:text-white transition-colors"
        >
          ← Back
        </button>

        <div className="text-right">
          <div className="font-title text-sm uppercase tracking-[0.26em] text-slate-300">
            {LABEL[sector]}
          </div>
          <div className="mt-1 flex items-center justify-end gap-2 text-xs text-slate-400">
            <span className="uppercase tracking-[0.22em]">Score</span>
            <InlineEditableNumber
              value={score}
              min={0}
              max={100}
              className="font-data text-slate-100 hover:text-white transition-colors"
              inputClassName="w-16 bg-transparent border-b border-white/20 focus:outline-none font-data text-right text-slate-100"
              onCommit={(next) => setSectorScore(sector, next)}
            />
          </div>
        </div>
      </div>

      <section className="hud-card p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-2">
          Sector page
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          This is the dedicated page for <span className="text-slate-200">{LABEL[sector]}</span>.
          Next we can add sector-specific widgets (budgets, workouts, projects, rituals, etc.).
        </p>
      </section>
    </div>
  );
};


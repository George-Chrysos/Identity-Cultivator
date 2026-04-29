import { Drama, PartyPopper, Users } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { TricksterSectorId } from '@/types/dashboard';
import { InlineEditableNumber } from './InlineEditableNumber';
import { ProgressBar } from './ProgressBar';

const SECTORS: Array<{
  id: TricksterSectorId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'pink' | 'amber' | 'purple';
  iconTone: string;
}> = [
  { id: 'chaos', name: 'Chaos', icon: Drama, accent: 'pink', iconTone: 'text-pink-300' },
  { id: 'play', name: 'Play', icon: PartyPopper, accent: 'amber', iconTone: 'text-amber-300' },
  { id: 'social', name: 'Social', icon: Users, accent: 'purple', iconTone: 'text-purple-300' },
];

export const TricksterLifeSectorsPanel = () => {
  const scores = useDashboardStore((s) => s.dashboard.tricksterScores);
  const visits = useDashboardStore((s) => s.dashboard.sectorVisits);
  const setTricksterSectorScore = useDashboardStore((s) => s.setTricksterSectorScore);
  const recordSectorVisit = useDashboardStore((s) => s.recordSectorVisit);

  return (
    <section className="hud-card p-4 border-pink-500/15">
      <div className="text-[11px] uppercase tracking-[0.34em] text-pink-200/80 font-title mb-3">
        Life Sectors — Trickster
      </div>
      <div className="space-y-3">
        {SECTORS.map(({ id, name, icon: Icon, accent, iconTone }) => {
          const value = scores[id] ?? 0;
          const danger = value < 40;
          const unvisited = !visits[id]?.lastVisitedDate;
          return (
            <div key={id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => recordSectorVisit(id)}
                  className="flex items-center gap-2 min-w-0 text-left hover:text-white transition-colors"
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${iconTone}`} />
                  <div className="text-xs text-slate-200 truncate">{name}</div>
                  {danger && <span className="text-[10px] font-title text-[#f72585] tracking-[0.2em]">!</span>}
                  {unvisited && <span className="text-[9px] text-amber-300/90 uppercase tracking-[0.18em]">New</span>}
                </button>
                <InlineEditableNumber
                  value={value}
                  min={0}
                  max={100}
                  className={`font-data text-xs ${danger ? 'text-[#f72585]' : 'text-slate-100'} hover:text-white transition-colors`}
                  inputClassName="w-16 bg-transparent border-b border-pink-400/30 focus:outline-none font-data text-right text-slate-100"
                  onCommit={(next) => {
                    setTricksterSectorScore(id, next);
                    recordSectorVisit(id);
                  }}
                />
              </div>
              <ProgressBar value={value} accent={accent} showDanger />
            </div>
          );
        })}
      </div>
    </section>
  );
};

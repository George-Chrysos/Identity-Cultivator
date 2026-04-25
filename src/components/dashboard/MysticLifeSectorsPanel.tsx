import type { ComponentType } from 'react';
import { Zap, Anchor, Orbit, Sparkles } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { MysticSectorId } from '@/types/dashboard';
import { InlineEditableNumber } from './InlineEditableNumber';
import { ProgressBar } from './ProgressBar';

const SECTORS: Array<{
  id: MysticSectorId;
  name: string;
  icon: ComponentType<{ className?: string }>;
  accent: 'purple' | 'cyan' | 'amber' | 'pink';
  iconTone: string;
}> = [
  { id: 'energySense', name: 'Energy sense', icon: Zap, accent: 'purple', iconTone: 'text-purple-300' },
  { id: 'grounding', name: 'Grounding', icon: Anchor, accent: 'cyan', iconTone: 'text-cyan-300' },
  { id: 'alignment', name: 'Alignment', icon: Orbit, accent: 'amber', iconTone: 'text-amber-200' },
  { id: 'synchronicities', name: 'Synchronicities', icon: Sparkles, accent: 'pink', iconTone: 'text-pink-300' },
];

export const MysticLifeSectorsPanel = () => {
  const scores = useDashboardStore((s) => s.dashboard.mysticScores);
  const setMysticSectorScore = useDashboardStore((s) => s.setMysticSectorScore);

  return (
    <section className="hud-card p-4 border-purple-500/15">
      <div className="text-[11px] uppercase tracking-[0.34em] text-purple-200/80 font-title mb-3">
        Life Sectors — Mystic
      </div>

      <div className="space-y-3">
        {SECTORS.map(({ id, name, icon: Icon, accent, iconTone }) => {
          const value = scores[id] ?? 0;
          const danger = value < 40;
          return (
            <div key={id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${iconTone}`} />
                  <div className="text-xs text-slate-200 truncate">{name}</div>
                  {danger && (
                    <span className="text-[10px] font-title text-[#f72585] tracking-[0.2em]">!</span>
                  )}
                </div>

                <InlineEditableNumber
                  value={value}
                  min={0}
                  max={100}
                  className={`font-data text-xs ${danger ? 'text-[#f72585]' : 'text-slate-100'} hover:text-white transition-colors`}
                  inputClassName="w-16 bg-transparent border-b border-purple-400/30 focus:outline-none font-data text-right text-slate-100"
                  onCommit={(next) => setMysticSectorScore(id, next)}
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

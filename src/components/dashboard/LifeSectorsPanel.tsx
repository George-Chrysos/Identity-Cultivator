import { DollarSign, HeartPulse, Briefcase, Heart, Sparkles, Leaf } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { SectorId } from '@/types/dashboard';
import { InlineEditableNumber } from './InlineEditableNumber';
import { ProgressBar } from './ProgressBar';

const SECTORS: Array<{
  id: SectorId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'amber' | 'cyan' | 'purple' | 'pink';
  iconTone: string;
}> = [
  { id: 'finance', name: 'Finance', icon: DollarSign, accent: 'amber', iconTone: 'text-amber-300' },
  { id: 'health', name: 'Health', icon: HeartPulse, accent: 'cyan', iconTone: 'text-emerald-300' },
  { id: 'career', name: 'Career', icon: Briefcase, accent: 'cyan', iconTone: 'text-sky-300' },
  { id: 'romantic', name: 'Romantic', icon: Heart, accent: 'pink', iconTone: 'text-pink-300' },
  { id: 'growth', name: 'Growth', icon: Sparkles, accent: 'purple', iconTone: 'text-purple-300' },
  { id: 'environment', name: 'Environment', icon: Leaf, accent: 'cyan', iconTone: 'text-cyan-300' },
];

export const LifeSectorsPanel = () => {
  const scores = useDashboardStore((s) => s.dashboard.scores);
  const setSectorScore = useDashboardStore((s) => s.setSectorScore);

  return (
    <section className="hud-card p-4">
      <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-3">
        Life Sectors
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
                    <span className="text-[10px] font-title text-[#f72585] tracking-[0.2em]">
                      !
                    </span>
                  )}
                </div>

                <InlineEditableNumber
                  value={value}
                  min={0}
                  max={100}
                  className={`font-data text-xs ${danger ? 'text-[#f72585]' : 'text-slate-100'} hover:text-white transition-colors`}
                  inputClassName="w-16 bg-transparent border-b border-white/20 focus:outline-none font-data text-right text-slate-100"
                  onCommit={(next) => setSectorScore(id, next)}
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


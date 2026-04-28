import { DollarSign, HeartPulse, Home, Bike } from 'lucide-react';
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
  { id: 'selfCare', name: 'Self‑Care', icon: HeartPulse, accent: 'pink', iconTone: 'text-pink-300' },
  { id: 'home', name: 'Home', icon: Home, accent: 'cyan', iconTone: 'text-cyan-300' },
  { id: 'motorcycle', name: 'Motorcycle', icon: Bike, accent: 'purple', iconTone: 'text-purple-300' },
];

export const LifeSectorsPanel = ({ onOpenSector }: { onOpenSector?: (sector: SectorId) => void }) => {
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
                <button
                  type="button"
                  onClick={() => onOpenSector?.(id)}
                  className="flex items-center gap-2 min-w-0 text-left hover:text-white transition-colors"
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${iconTone}`} />
                  <div className="text-xs text-slate-200 truncate">{name}</div>
                  {danger && (
                    <span className="text-[10px] font-title text-[#f72585] tracking-[0.2em]">
                      !
                    </span>
                  )}
                </button>

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


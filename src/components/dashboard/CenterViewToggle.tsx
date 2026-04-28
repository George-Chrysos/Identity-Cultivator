import type { CenterKey } from '@/types/dashboard';
import { useDashboardStore } from '@/store/dashboardStore';
import type { ComponentType } from 'react';
import { Leaf, Trees, TreePine } from 'lucide-react';

const CENTERS: Array<{
  id: CenterKey;
  ariaLabel: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  activeClass: string;
  inactiveClass: string;
}> = [
  {
    id: 'mystic',
    ariaLabel: 'Mystic',
    icon: Trees,
    title: 'Forest',
    activeClass:
      'border-[#a855f7]/55 bg-[#a855f7]/12 text-[#d8b4fe] shadow-[0_0_22px_-8px_rgba(168,85,247,0.5)]',
    inactiveClass: 'border-white/10 bg-black/20 text-slate-400 hover:text-slate-200 hover:border-purple-400/20',
  },
  {
    id: 'sovereign',
    ariaLabel: 'Sovereign',
    icon: TreePine,
    title: 'Tree',
    activeClass:
      'border-[#00f5d4]/50 bg-[#00f5d4]/10 text-[#00f5d4] shadow-[0_0_20px_-8px_rgba(0,245,212,0.45)]',
    inactiveClass: 'border-white/10 bg-black/20 text-slate-400 hover:text-slate-200 hover:border-cyan-400/20',
  },
  {
    id: 'trickster',
    ariaLabel: 'Fool / Trickster',
    icon: Leaf,
    title: 'Leaf',
    activeClass:
      'border-[#f72585]/50 bg-[#f72585]/10 text-[#fda4af] shadow-[0_0_22px_-8px_rgba(247,37,133,0.45)]',
    inactiveClass: 'border-white/10 bg-black/20 text-slate-400 hover:text-slate-200 hover:border-pink-400/20',
  },
];

export const CenterViewToggle = () => {
  const active = useDashboardStore((s) => s.dashboard.activeCenter);
  const setActiveCenter = useDashboardStore((s) => s.setActiveCenter);

  return (
    <div className="hud-card p-2 md:p-3">
      <div className="text-[10px] uppercase tracking-[0.32em] text-slate-500 font-title mb-2 px-1">
        Center lens
      </div>
      <div className="grid grid-cols-3 gap-2">
        {CENTERS.map((c) => {
          const on = active === c.id;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCenter(c.id)}
              title={c.title}
              aria-label={c.ariaLabel}
              className={`rounded-xl border px-2 py-3 text-center transition-all duration-200 flex items-center justify-center ${
                on ? c.activeClass : c.inactiveClass
              }`}
            >
              <span className="sr-only">{c.ariaLabel}</span>
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

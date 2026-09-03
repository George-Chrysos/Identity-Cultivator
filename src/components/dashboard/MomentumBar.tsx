import type { MomentumKey } from '@/types/dashboard';

interface MomentumBarProps {
  bits: boolean[];
  label: string;
  accent?: 'cyan' | 'violet' | 'pink';
}

const FILL: Record<NonNullable<MomentumBarProps['accent']>, string> = {
  cyan: 'bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.45)]',
  violet: 'bg-violet-400/80 shadow-[0_0_8px_rgba(168,85,247,0.45)]',
  pink: 'bg-pink-400/80 shadow-[0_0_8px_rgba(236,72,153,0.45)]',
};

export const MomentumBar = ({ bits, label, accent = 'cyan' }: MomentumBarProps) => (
  <div className="space-y-1.5" aria-label={`${label} last ${bits.length} days`}>
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase tracking-widest font-section text-slate-300">{label}</span>
    </div>
    <div className="flex gap-1">
      {bits.map((filled, i) => (
        <span
          key={`${label}-${i}`}
          className={`h-3 flex-1 rounded-sm border ${
            filled ? `border-transparent ${FILL[accent]}` : 'border-white/10 bg-slate-950/50'
          }`}
          title={filled ? 'Logged' : 'Empty'}
        />
      ))}
    </div>
  </div>
);

export type { MomentumKey };

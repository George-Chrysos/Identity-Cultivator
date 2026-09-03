import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { MomentumKey } from '@/types/dashboard';

interface MomentumBarProps {
  bits: boolean[];
  label: string;
  accent?: 'cyan' | 'violet' | 'pink' | 'amber';
}

const FILL: Record<NonNullable<MomentumBarProps['accent']>, string> = {
  cyan: 'bg-gradient-to-b from-cyan-300 to-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]',
  violet: 'bg-gradient-to-b from-violet-300 to-violet-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
  pink: 'bg-gradient-to-b from-pink-300 to-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]',
  amber: 'bg-gradient-to-b from-amber-200 to-amber-500 shadow-[0_0_8px_rgba(249,199,79,0.55)]',
};

const EMPTY: Record<NonNullable<MomentumBarProps['accent']>, string> = {
  cyan: 'bg-cyan-400/10',
  violet: 'bg-violet-400/10',
  pink: 'bg-pink-400/10',
  amber: 'bg-amber-400/10',
};

const Slot = ({
  filled,
  pop,
  accent,
  title,
}: {
  filled: boolean;
  pop: boolean;
  accent: NonNullable<MomentumBarProps['accent']>;
  title: string;
}) => (
  <span
    title={title}
    className={`h-3 flex-1 rounded-sm ${filled ? FILL[accent] : EMPTY[accent]} ${pop ? 'slot-pop' : ''}`}
  />
);

const WeekLabel = ({ children, align = 'start' }: { children: ReactNode; align?: 'start' | 'between' }) => (
  <div
    className={`mt-1 flex ${align === 'between' ? 'justify-between' : 'justify-start'} font-section uppercase tracking-[0.16em] text-[0.65rem] text-white opacity-40`}
  >
    {children}
  </div>
);

export const MomentumBar = ({ bits, label, accent = 'cyan' }: MomentumBarProps) => {
  const prevRef = useRef<boolean[] | null>(null);
  const newlyFilled = bits.map((filled, i) => {
    if (prevRef.current === null) return false;
    return filled && !prevRef.current[i];
  });

  useEffect(() => {
    prevRef.current = bits;
  }, [bits]);

  const lastWeek = bits.slice(0, 7);
  const thisWeek = bits.slice(7);

  return (
    <div className="space-y-1.5 mb-1" aria-label={`${label} last ${bits.length} days, oldest left, today right`}>
      <span className="text-[10px] uppercase tracking-widest font-section text-slate-300">{label}</span>
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex gap-1">
            {lastWeek.map((filled, i) => (
              <Slot
                key={`${label}-${i}`}
                filled={filled}
                pop={newlyFilled[i]}
                accent={accent}
                title={filled ? 'Logged' : 'Empty'}
              />
            ))}
          </div>
          <WeekLabel>Last week</WeekLabel>
        </div>
        {thisWeek.length > 0 && (
          <>
            <span className="w-px h-4 bg-white/25 shrink-0 mt-0.5" aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="flex gap-1">
                {thisWeek.map((filled, i) => (
                  <Slot
                    key={`${label}-${i + 7}`}
                    filled={filled}
                    pop={newlyFilled[i + 7]}
                    accent={accent}
                    title={filled ? 'Logged' : 'Empty'}
                  />
                ))}
              </div>
              <WeekLabel align="between">
                <span>This week</span>
                <span>Today →</span>
              </WeekLabel>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export type { MomentumKey };

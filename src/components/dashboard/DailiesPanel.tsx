import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Moon, Sunrise } from 'lucide-react';
import { getEntry, momentumBits, useDashboardStore } from '@/store/dashboardStore';
import { todayKey } from '@/utils/date';
import type { DailyKey } from '@/types/dashboard';
import { MomentumBar } from './MomentumBar';

const DAILIES: {
  key: DailyKey;
  label: string;
  Icon: typeof Sunrise;
  accent: 'cyan' | 'violet' | 'pink';
  icon: string;
  box: string;
  dotOff: string;
  dotOn: string;
  ripple: string;
}[] = [
  {
    key: 'morningActivation',
    label: 'Morning Activation',
    Icon: Sunrise,
    accent: 'pink',
    icon: 'text-pink-400',
    box: 'border-pink-400/70 text-pink-400',
    dotOff: 'border-pink-400/45',
    dotOn: 'bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]',
    ripple: 'text-pink-400',
  },
  {
    key: 'ritual',
    label: 'Ritual',
    Icon: Flame,
    accent: 'violet',
    icon: 'text-violet-400',
    box: 'border-violet-400/70 text-violet-400',
    dotOff: 'border-violet-400/45',
    dotOn: 'bg-violet-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
    ripple: 'text-violet-400',
  },
  {
    key: 'nightProtocol',
    label: 'Night Protocol',
    Icon: Moon,
    accent: 'cyan',
    icon: 'text-cyan-400',
    box: 'border-cyan-400/70 text-cyan-400',
    dotOff: 'border-cyan-400/45',
    dotOn: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    ripple: 'text-cyan-400',
  },
];

const DailyRow = ({
  done,
  onToggle,
  label,
  Icon,
  icon,
  box,
  dotOff,
  dotOn,
  ripple,
}: {
  done: boolean;
  onToggle: () => void;
  label: string;
  Icon: typeof Sunrise;
  icon: string;
  box: string;
  dotOff: string;
  dotOn: string;
  ripple: string;
}) => {
  const wasDone = useRef(done);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (done && !wasDone.current) {
      setPulse(true);
      const id = window.setTimeout(() => setPulse(false), 600);
      wasDone.current = done;
      return () => window.clearTimeout(id);
    }
    wasDone.current = done;
  }, [done]);

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      aria-pressed={done}
      aria-label={`${label}${done ? ', completed' : ''}`}
      className={`relative w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left overflow-visible ${
        pulse ? 'stat-orb-pulse' : ''
      }`}
    >
      {pulse && <span className={`daily-row-ripple ${ripple}`} />}
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
          done ? box : 'border-white/30 text-transparent'
        }`}
      >
        <Check className={`h-3.5 w-3.5 ${done ? 'opacity-100' : 'opacity-0'}`} />
      </span>
      <Icon className={`h-4 w-4 shrink-0 ${icon}`} />
      <span
        className={`font-body text-sm flex-1 ${done ? 'text-white/[0.55]' : 'text-white'}`}
      >
        {label}
      </span>
      <span
        className={`h-2.5 w-2.5 rounded-full shrink-0 border ${done ? `border-transparent ${dotOn}` : `${dotOff} bg-transparent`}`}
      />
    </motion.button>
  );
};

export const DailiesPanel = () => {
  const date = todayKey();
  const entry = useDashboardStore((s) => getEntry(s.dashboard, date));
  const dashboard = useDashboardStore((s) => s.dashboard);
  const toggleDaily = useDashboardStore((s) => s.toggleDaily);

  return (
    <section className="h-full flex flex-col" aria-label="Recurring dailies">
      <h2 className="text-sm sm:text-base uppercase tracking-widest text-slate-200 font-section m-0 mb-[var(--space-sm)]">
        Dailies
      </h2>
      <ul className="flex flex-col gap-[var(--space-xs)]">
        {DAILIES.map((daily) => (
          <li key={daily.key}>
            <DailyRow
              done={entry[daily.key]}
              onToggle={() => toggleDaily(date, daily.key)}
              label={daily.label}
              Icon={daily.Icon}
              icon={daily.icon}
              box={daily.box}
              dotOff={daily.dotOff}
              dotOn={daily.dotOn}
              ripple={daily.ripple}
            />
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-[var(--space-md)] mt-[var(--space-md)]">
        {DAILIES.map(({ key, label, accent }) => (
          <MomentumBar key={key} bits={momentumBits(dashboard, key)} label={label} accent={accent} />
        ))}
      </div>
    </section>
  );
};

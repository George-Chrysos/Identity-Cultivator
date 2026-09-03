import { motion } from 'framer-motion';
import { Check, Flame, Moon, Sunrise } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { DailyKey } from '@/types/dashboard';

const DAILIES: { key: DailyKey; label: string; Icon: typeof Sunrise }[] = [
  { key: 'morningActivation', label: 'Morning Activation', Icon: Sunrise },
  { key: 'ritual', label: 'Ritual', Icon: Flame },
  { key: 'nightProtocol', label: 'Night Protocol', Icon: Moon },
];

export const DailiesPanel = () => {
  const dailies = useDashboardStore((s) => s.dashboard.dailies);
  const toggleDaily = useDashboardStore((s) => s.toggleDaily);

  return (
    <section className="card-style p-5 sm:p-6 space-y-3" aria-label="Recurring dailies">
      <h2 className="text-sm sm:text-base uppercase tracking-widest text-cyan-200/90 font-section m-0 mb-4">
        Dailies
      </h2>
      <ul className="space-y-2">
        {DAILIES.map(({ key, label, Icon }) => {
          const done = dailies[key];
          return (
            <li key={key}>
              <motion.button
                type="button"
                onClick={() => toggleDaily(key)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                aria-pressed={done}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                  done
                    ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-100'
                    : 'bg-slate-950/40 border-white/10 text-slate-200 hover:border-violet-400/40'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    done ? 'border-cyan-400/50 bg-cyan-500/20' : 'border-white/10 bg-slate-900/60'
                  }`}
                >
                  {done ? <Check className="h-4 w-4 text-cyan-200" /> : <Icon className="h-4 w-4 text-violet-200" />}
                </span>
                <span className={`font-body ${done ? 'line-through opacity-80' : ''}`}>{label}</span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

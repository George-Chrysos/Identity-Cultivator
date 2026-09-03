import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { getEntry, momentumBits, useDashboardStore } from '@/store/dashboardStore';
import { todayKey } from '@/utils/date';
import { MomentumBar } from './MomentumBar';

export const MainTaskCard = () => {
  const date = todayKey();
  const entry = useDashboardStore((s) => getEntry(s.dashboard, date));
  const bits = useDashboardStore((s) => momentumBits(s.dashboard, 'mainTask'));
  const setMainTaskText = useDashboardStore((s) => s.setMainTaskText);
  const toggleMainTask = useDashboardStore((s) => s.toggleMainTask);

  return (
    <section className="card-style p-5 sm:p-6 space-y-4 h-full" aria-label="Main task">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm sm:text-base uppercase tracking-widest text-violet-200/90 font-section m-0">
          Main task
        </h2>
        <motion.button
          type="button"
          onClick={() => toggleMainTask(date)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={entry.mainTaskDone}
          aria-label={entry.mainTaskDone ? 'Mark main task incomplete' : 'Complete main task'}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-colors ${
            entry.mainTaskDone
              ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-200'
              : 'bg-slate-800/50 border border-white/10 text-slate-300'
          }`}
        >
          <Check className="h-4 w-4" />
          {entry.mainTaskDone ? 'Done' : 'Complete'}
        </motion.button>
      </div>
      <input
        type="text"
        value={entry.mainTaskText}
        onChange={(e) => setMainTaskText(date, e.target.value)}
        placeholder="Name today's one task"
        aria-label="Main task"
        className={`w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-4 text-lg text-white font-body outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/70 ${
          entry.mainTaskDone ? 'line-through text-slate-400' : ''
        }`}
      />
      <MomentumBar bits={bits} label="Momentum" accent="violet" />
    </section>
  );
};

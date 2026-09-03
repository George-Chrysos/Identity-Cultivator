import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { todayKey } from '@/utils/date';

export const MainTaskCard = () => {
  const mainTask = useDashboardStore((s) => s.dashboard.mainTask);
  const setMainTaskText = useDashboardStore((s) => s.setMainTaskText);
  const toggleMainTaskComplete = useDashboardStore((s) => s.toggleMainTaskComplete);
  const doneToday = mainTask.completedDate === todayKey();

  return (
    <section className="card-style p-5 sm:p-6 space-y-4" aria-label="Main task">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm sm:text-base uppercase tracking-widest text-violet-200/90 font-section m-0">
          Main task
        </h2>
        <motion.button
          type="button"
          onClick={toggleMainTaskComplete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={doneToday}
          aria-label={doneToday ? 'Mark main task incomplete' : 'Complete main task'}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-colors ${
            doneToday
              ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-200'
              : 'bg-slate-800/50 border border-white/10 text-slate-300'
          }`}
        >
          <Check className="h-4 w-4" />
          {doneToday ? 'Done' : 'Complete'}
        </motion.button>
      </div>
      <input
        type="text"
        value={mainTask.text}
        onChange={(e) => setMainTaskText(e.target.value)}
        placeholder="Name today's one task"
        aria-label="Main task"
        className={`w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white font-body outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/70 ${
          doneToday ? 'line-through text-slate-400' : ''
        }`}
      />
    </section>
  );
};

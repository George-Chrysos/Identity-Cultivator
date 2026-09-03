import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { getEntry, momentumBits, useDashboardStore } from '@/store/dashboardStore';
import { todayKey } from '@/utils/date';
import { MomentumBar } from './MomentumBar';

export const MainTaskCard = () => {
  const date = todayKey();
  const entry = useDashboardStore((s) => getEntry(s.dashboard, date));
  const bits = useDashboardStore((s) => momentumBits(s.dashboard, 'mainTask'));
  const setMainTaskText = useDashboardStore((s) => s.setMainTaskText);
  const toggleMainTask = useDashboardStore((s) => s.toggleMainTask);
  const empty = !entry.mainTaskText.trim();
  const wasDone = useRef(entry.mainTaskDone);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (entry.mainTaskDone && !wasDone.current) {
      setCelebrate(true);
      const id = window.setTimeout(() => setCelebrate(false), 800);
      wasDone.current = entry.mainTaskDone;
      return () => window.clearTimeout(id);
    }
    wasDone.current = entry.mainTaskDone;
  }, [entry.mainTaskDone]);

  return (
    <section
      className={`quest-card p-5 sm:p-6 space-y-4 h-full ${
        empty && !entry.mainTaskDone ? 'quest-empty-pulse' : ''
      } ${celebrate ? 'quest-complete-pulse' : ''}`}
      aria-label="Main task"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm sm:text-base uppercase tracking-widest text-amber-200/90 font-section m-0">
          Main task
          {entry.carriedOver && (
            <span title="Carried over from yesterday">
              <RotateCcw
                className="h-3.5 w-3.5 text-slate-400"
                aria-label="Carried over from yesterday"
              />
            </span>
          )}
        </h2>
        <motion.button
          type="button"
          onClick={() => toggleMainTask(date)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={entry.mainTaskDone}
          aria-label={entry.mainTaskDone ? 'Mark main task incomplete' : 'Complete main task'}
          className={`quest-complete-btn relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest ${
            celebrate ? 'quest-check-bounce' : ''
          } ${
            entry.mainTaskDone
              ? 'bg-amber-400 border border-amber-400 text-slate-950 shadow-[0_0_16px_rgba(249,199,79,0.45)]'
              : 'bg-slate-800/50 border border-amber-400/35 text-amber-100 hover:border-amber-400/80'
          }`}
        >
          {celebrate && <span className="quest-complete-burst" />}
          {entry.mainTaskDone ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <span className="h-4 w-4 rounded-full border border-current" />
          )}
          {entry.mainTaskDone ? 'Complete' : 'Check'}
        </motion.button>
      </div>
      <input
        type="text"
        value={entry.mainTaskText}
        onChange={(e) => setMainTaskText(date, e.target.value)}
        placeholder="Name today's one task"
        aria-label="Main task"
        className={`w-full bg-slate-950/60 border border-amber-400/20 rounded-xl px-4 py-4 text-lg text-white font-body outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/70 quest-strike ${
          entry.mainTaskDone ? 'quest-strike-on text-slate-400' : ''
        }`}
      />
      <MomentumBar bits={bits} label="Momentum" accent="amber" />
    </section>
  );
};

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BaseModal } from '@/components/common';
import { DayEditor } from './DayEditor';
import { FinanceHistory } from '@/components/finance/FinanceHistory';
import { YearlyInsights } from '@/components/finance/YearlyInsights';
import { useDashboardStore } from '@/store/dashboardStore';
import { monthGrid, monthLabel, todayKey } from '@/utils/date';
import type { DailyEntry, MetricKey } from '@/types/dashboard';

export type HistoryTab = 'stats' | 'finance' | 'insights';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  closeOnEscape?: boolean;
  initialTab?: HistoryTab;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STAT_DOT: Record<MetricKey | 'muted', string> = {
  body: 'bg-pink-400 shadow-[0_0_6px_rgba(244,114,182,0.7)]',
  soul: 'bg-violet-400 shadow-[0_0_6px_rgba(192,132,252,0.7)]',
  mind: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]',
  muted: 'bg-white/35',
};

const STAT_WASH: Record<MetricKey, string> = {
  body: 'bg-pink-500/15',
  soul: 'bg-violet-500/15',
  mind: 'bg-cyan-500/15',
};

const hasAny = (entry: DailyEntry | undefined) => {
  if (!entry) return false;
  return (
    entry.body !== null ||
    entry.mind !== null ||
    entry.soul !== null ||
    entry.mainTaskDone ||
    entry.mainTaskText.trim().length > 0 ||
    entry.morningActivation ||
    entry.ritual ||
    entry.nightProtocol
  );
};

/** Highest logged score; ties prefer Vitality, then Sovereignty, then Clarity. */
const dominantStat = (entry: DailyEntry | undefined): MetricKey | 'muted' | null => {
  if (!entry) return null;
  const order: MetricKey[] = ['body', 'soul', 'mind'];
  let best: MetricKey | null = null;
  let bestVal = -1;
  for (const key of order) {
    const value = entry[key];
    if (typeof value === 'number' && value > bestVal) {
      best = key;
      bestVal = value;
    }
  }
  if (best) return best;
  return hasAny(entry) ? 'muted' : null;
};

export const CalendarModal = ({
  isOpen,
  onClose,
  onOpenHelp,
  closeOnEscape,
  initialTab = 'stats',
}: CalendarModalProps) => {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<HistoryTab>(initialTab);
  const entries = useDashboardStore((s) => s.dashboard.entries);

  const cells = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const today = todayKey();

  useEffect(() => {
    if (!isOpen) return;
    const fresh = new Date();
    setCursor({ year: fresh.getFullYear(), month: fresh.getMonth() });
    setSelected(null);
    setTab(initialTab);
  }, [isOpen, initialTab]);

  const shiftMonth = (delta: number) => {
    const date = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  };

  const jumpToday = () => {
    const fresh = new Date();
    setCursor({ year: fresh.getFullYear(), month: fresh.getMonth() });
    setSelected(todayKey());
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="History" maxWidth="2xl" closeOnEscape={closeOnEscape}>
      <div className="p-[var(--space-md)] flex flex-col gap-[var(--space-md)]">
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {([
            ['stats', 'Stats'],
            ['finance', 'Finance'],
            ['insights', 'Insights'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 py-2 text-xs uppercase tracking-widest font-section ${
                tab === id ? 'bg-white/10 text-white' : 'bg-transparent text-white/45 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'finance' ? (
          <FinanceHistory />
        ) : tab === 'insights' ? (
          <YearlyInsights />
        ) : (
        <>
          <div className="flex items-center justify-between gap-[var(--space-xs)] mb-[var(--space-sm)]">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-sm uppercase tracking-widest font-section m-0">
                {monthLabel(cursor.year, cursor.month)}
              </h3>
              <button
                type="button"
                onClick={jumpToday}
                className="px-3 py-1 rounded-lg border border-cyan-400/40 text-[10px] uppercase tracking-widest font-section text-cyan-200 hover:bg-cyan-500/10"
              >
                Today
              </button>
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] uppercase tracking-widest text-white/40 font-section py-1"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={`pad-${i}`} />;
              const entry = entries[date];
              const marked = hasAny(entry);
              const dominant = dominantStat(entry);
              const isSelected = date === selected;
              const isToday = date === today;
              const future = date > today;
              const wash =
                !isSelected && marked && dominant && dominant !== 'muted' ? STAT_WASH[dominant] : '';
              const border = isToday
                ? 'border-cyan-400/80'
                : isSelected
                  ? 'border-white/40'
                  : marked
                    ? 'border-white/10'
                    : 'border-transparent';
              const fill = isSelected
                ? 'bg-white/15 text-white'
                : marked
                  ? `${wash || 'bg-white/[0.04]'} text-white`
                  : 'bg-transparent text-white/40';
              return (
                <button
                  key={date}
                  type="button"
                  disabled={future}
                  onClick={() => setSelected((prev) => (prev === date ? null : date))}
                  aria-pressed={isSelected}
                  aria-label={`${date}${marked ? ', has data' : ''}${isToday ? ', today' : ''}`}
                  className={`relative aspect-square rounded-lg text-xs font-data border flex flex-col items-center justify-center pb-1.5 disabled:opacity-30 disabled:cursor-not-allowed ${border} ${fill}`}
                >
                  {Number(date.slice(8))}
                  {dominant && (
                    <span
                      className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${STAT_DOT[dominant]}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
              className="border-t border-white/10 -mx-[var(--space-md)]"
            >
              <DayEditor
                variant="history"
                date={selected}
                onOpenHelp={onOpenHelp}
                onSaved={() => setSelected(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </>
        )}
      </div>
    </BaseModal>
  );
};

import { memo, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus, Check, Trash2, Sparkles } from 'lucide-react';
import { useIdentityStore } from '@/store/identityStore';
import { todayKey } from '@/utils/leveling';
import type { SectorTag } from '@/types/dashboard';

const SECTOR_OPTIONS: SectorTag[] = [
  'finance',
  'selfCare',
  'home',
  'motorcycle',
  'energySense',
  'grounding',
  'logos',
  'gratitude',
  'focus',
  'chaos',
  'play',
  'social',
];

const SideQuestDrawer = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorTag>('selfCare');

  const sideQuests = useIdentityStore((s) => s.sideQuests);
  const addSideQuest = useIdentityStore((s) => s.addSideQuest);
  const removeSideQuest = useIdentityStore((s) => s.removeSideQuest);
  const toggleSideQuestActive = useIdentityStore((s) => s.toggleSideQuestActive);
  const completeSideQuestToday = useIdentityStore((s) => s.completeSideQuestToday);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const created = addSideQuest(draft);
      if (created) setDraft('');
    },
    [addSideQuest, draft]
  );

  const activeCount = sideQuests.filter((q) => q.active).length;
  const today = todayKey();

  return (
    <section className="card-base border-2 border-cyan-400/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <Sparkles
            className="w-4 h-4 text-cyan-300"
            style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.6))' }}
          />
          <span className="text-sm font-bold uppercase tracking-[0.22em] text-white">
            Side Quests
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-200/70">
            {sideQuests.length} saved{activeCount ? ` \u00b7 ${activeCount} active` : ''}
          </span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-cyan-200/80" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="drawer-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="border-t border-cyan-400/20"
          >
            <div className="p-5 space-y-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="A small extra task for today..."
                  className="flex-1 min-w-0 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-400/60 focus:outline-none px-4 py-2 text-sm text-white placeholder:text-slate-500 transition-colors"
                  maxLength={140}
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-cyan-400/50 bg-cyan-500/15 text-cyan-200 text-sm font-semibold uppercase tracking-[0.18em] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-500/25 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </form>

              {sideQuests.length === 0 ? (
                <p className="text-sm text-slate-400/80 text-center py-6">
                  No side quests yet. Add anything small that would make today
                  feel more yours.
                </p>
              ) : (
                <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {sideQuests.map((quest) => {
                    const done = quest.lastCompletedDate === today;
                    return (
                      <li
                        key={quest.id}
                        className={[
                          'flex items-center gap-3 rounded-xl px-3 py-2 border transition-colors',
                          quest.active
                            ? 'border-cyan-400/50 bg-cyan-500/10'
                            : 'border-slate-700 bg-slate-900/50',
                        ].join(' ')}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSideQuestActive(quest.id)}
                          className={[
                            'flex-shrink-0 w-4 h-4 rounded border transition-colors',
                            quest.active
                              ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                              : 'border-slate-500 hover:border-cyan-400',
                          ].join(' ')}
                          aria-label={quest.active ? 'Deactivate' : 'Activate'}
                          aria-pressed={quest.active}
                        />

                        <span
                          className={[
                            'flex-1 min-w-0 text-sm truncate',
                            done ? 'line-through text-slate-500' : 'text-white',
                          ].join(' ')}
                        >
                          {quest.title}
                        </span>

                        <button
                          type="button"
                          onClick={() => completeSideQuestToday(quest.id, selectedSector)}
                          disabled={done}
                          className={[
                            'inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] uppercase tracking-[0.18em] transition-colors',
                            done
                              ? 'border-emerald-400/60 text-emerald-300 cursor-default'
                              : 'border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/20',
                          ].join(' ')}
                          aria-label={done ? 'Completed for today' : 'Complete'}
                        >
                          <Check className="w-3 h-3" />
                          {done ? 'Done' : 'Complete'}
                        </button>
                        <select
                          value={quest.sectorTag ?? selectedSector}
                          onChange={(e) => setSelectedSector(e.target.value as SectorTag)}
                          className="rounded-md border border-white/10 bg-transparent px-1.5 py-1 text-[10px]"
                        >
                          {SECTOR_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => removeSideQuest(quest.id)}
                          className="flex-shrink-0 p-1 text-slate-500 hover:text-red-300 transition-colors"
                          aria-label="Remove side quest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

SideQuestDrawer.displayName = 'SideQuestDrawer';

export default SideQuestDrawer;

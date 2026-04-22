/**
 * ArsenalDrawer — collapsed-by-default side-quest container.
 *
 * Per the Cyber-Grimoire plan:
 *  - Collapsed state: a single ribbon showing a peripheral echo
 *    (ArsenalEcho) for high-priority side quests + an "Open Arsenal" action.
 *  - Expanded state: the full side-quest list (today / backlog / completed
 *    tabs), reusing the existing QuestList behavior but scoped away from
 *    the hero area.
 *
 * The drawer is deliberately "lower in the visual hierarchy" — its title
 * treatment is muted, its backdrop is darker, and it only reveals when the
 * user explicitly opens it. This enforces the Main Quest priority without
 * hiding side quests outright.
 */
import { memo, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, ChevronDown, ChevronUp } from 'lucide-react';
import { shallow } from 'zustand/shallow';
import { useQuestStore } from '@/store/questStore';
import { useAuthStore } from '@/store/authStore';
import { QuestList } from './QuestList';
import ArsenalEcho from './ArsenalEcho';
import { logger } from '@/utils/logger';

interface ArsenalDrawerProps {
  onQuestForge?: () => void;
}

const ArsenalDrawer = memo(({ onQuestForge }: ArsenalDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = useAuthStore((s) => s.currentUser);
  const userId = currentUser?.id;

  const { quests, loadQuests } = useQuestStore(
    (state) => ({
      quests: state.quests,
      loadQuests: state.loadQuests,
    }),
    shallow
  );

  useEffect(() => {
    if (userId) loadQuests(userId);
  }, [userId, loadQuests]);

  const handleEchoOpen = useCallback(
    (questId: string) => {
      logger.info('ArsenalDrawer: opened via echo', { questId });
      setIsOpen(true);
      // Scroll the drawer into view after expansion animation starts so the
      // user's attention lands on the list, not a blank spot.
      requestAnimationFrame(() => {
        const el = document.getElementById('arsenal-drawer-body');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
    [setIsOpen]
  );

  return (
    <section
      className="relative"
      aria-label="Arsenal — side quests"
    >
      {/* Echo: only visible when drawer is collapsed. Keeps high-priority
          side quests from being fully invisible. */}
      {!isOpen && <ArsenalEcho quests={quests} onOpen={handleEchoOpen} />}

      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={[
          'w-full flex items-center justify-between gap-3',
          'rounded-xl px-4 py-3',
          'border border-slate-700/60 bg-slate-900/50 backdrop-blur-sm',
          'hover:border-slate-500/70 transition-colors',
          'text-slate-300',
        ].join(' ')}
        aria-expanded={isOpen}
        aria-controls="arsenal-drawer-body"
      >
        <span className="inline-flex items-center gap-3">
          <Swords className="w-4 h-4 text-slate-400" />
          <span className="font-section uppercase tracking-[0.18em] text-sm text-slate-300">
            Arsenal
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {quests.filter((q) => q.status !== 'completed' && !q.isMainQuest).length} active
          </span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="arsenal-drawer-body"
            key="arsenal-body"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <QuestList onQuestAdd={onQuestForge} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

ArsenalDrawer.displayName = 'ArsenalDrawer';

export default ArsenalDrawer;

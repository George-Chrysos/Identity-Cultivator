/**
 * ArsenalEcho — peripheral glitch-ghost of high-priority side quests.
 *
 * Purpose: when the Arsenal drawer is collapsed, the user should NOT be
 * totally blind to high-priority side quests. Complete object impermanence
 * breeds shame. So we flicker their titles in a faintly-glitchy ghost strip
 * above the drawer. Tapping the echo pops the drawer open focused on that
 * quest.
 *
 * "High priority" = any today-dated side quest with difficulty Difficult+
 * or daysNotCompleted >= 3. Cap: 3 ghosts max (prevents noise).
 */
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quest } from './QuestCard';

interface ArsenalEchoProps {
  quests: readonly Quest[];
  onOpen: (questId: string) => void;
  maxGhosts?: number;
}

const HIGH_PRIORITY_DIFFICULTIES = new Set(['Difficult', 'Hard', 'Hell']);
const DAYS_NOT_COMPLETED_THRESHOLD = 3;

const selectHighPriority = (quests: readonly Quest[], limit: number): Quest[] => {
  return quests
    .filter((q) => {
      if (q.status === 'completed' || q.status === 'expired' || q.status === 'someday') {
        return false;
      }
      if (q.isMainQuest) return false;
      if (q.difficulty && HIGH_PRIORITY_DIFFICULTIES.has(q.difficulty)) return true;
      if ((q.daysNotCompleted ?? 0) >= DAYS_NOT_COMPLETED_THRESHOLD) return true;
      return false;
    })
    .slice(0, limit);
};

const ArsenalEcho = memo(({ quests, onOpen, maxGhosts = 3 }: ArsenalEchoProps) => {
  const ghosts = selectHighPriority(quests, maxGhosts);
  if (ghosts.length === 0) return null;

  return (
    <motion.ul
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-2"
      aria-label="High-priority quest echoes"
      layout
    >
      <AnimatePresence>
        {ghosts.map((quest, i) => (
          <motion.li
            key={quest.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{
              duration: 0.5,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              type="button"
              onClick={() => onOpen(quest.id)}
              className="arsenal-echo font-mono text-[11px] tracking-[0.14em] uppercase bg-transparent border-0 px-0 py-0"
              aria-label={`Open arsenal at ${quest.title}`}
            >
              ∙ {quest.title}
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
});

ArsenalEcho.displayName = 'ArsenalEcho';

export default ArsenalEcho;

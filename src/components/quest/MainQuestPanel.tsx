/**
 * MainQuestPanel — the right-hand hero panel of the Homepage.
 *
 * Holds the single Main Quest — the most important task of the day. Sits
 * co-equal to the DailyIdentityPanel so both the Trinity reps and the
 * single-shot objective share center stage.
 *
 * States:
 *  - No quests: invite to forge one (opens QuestForgeSheet in Phase 3)
 *  - Quests exist, none pinned: picker list of today's unpinned quests
 *  - Pinned: renders the pinned quest via QuestCard + a "Demote" affordance
 *
 * Demote behavior: calling demote sets `isMainQuest=false` and increments
 * `demotionCount` for future Phase 4 Alchemical Recycle logic. The quest
 * returns to the Arsenal (visible after the pinned slot is empty).
 */
import { memo, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Target, Plus } from 'lucide-react';
import { shallow } from 'zustand/shallow';
import { useQuestStore } from '@/store/questStore';
import { useAuthStore } from '@/store/authStore';
import { useTestingStore } from '@/store/testingStore';
import { QuestCard, type Quest } from './QuestCard';
import { decideMercyOnDemote } from '@/services/MercyService';
import RuneReRollSheet from '@/components/grimoire/RuneReRollSheet';
import { logger } from '@/utils/logger';

interface MainQuestPanelProps {
  /** Handler for creating a new quest (routes to QuestForgeSheet in Phase 3). */
  onQuestForge?: () => void;
}

const MainQuestPanel = memo(({ onQuestForge }: MainQuestPanelProps) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const userId = currentUser?.id;
  const { getTestingDateFormatted } = useTestingStore();

  const {
    quests,
    mainQuestId,
    isLoading,
    loadQuests,
    pinMainQuest,
    completeQuest,
    updateQuest,
    deleteQuest,
  } = useQuestStore(
    (state) => ({
      quests: state.quests,
      mainQuestId: state.mainQuestId,
      isLoading: state.isLoading,
      loadQuests: state.loadQuests,
      pinMainQuest: state.pinMainQuest,
      completeQuest: state.completeQuest,
      updateQuest: state.updateQuest,
      deleteQuest: state.deleteQuest,
    }),
    shallow
  );

  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [completedSubtasks, setCompletedSubtasks] = useState<Set<string>>(new Set());
  const [recycleQuest, setRecycleQuest] = useState<Quest | null>(null);

  useEffect(() => {
    if (userId) loadQuests(userId);
  }, [userId, loadQuests]);

  const todayFormatted = getTestingDateFormatted();
  const mainQuest = mainQuestId
    ? quests.find((q) => q.id === mainQuestId) ?? null
    : null;

  // Candidates: today's quests that aren't completed and aren't pinned.
  const candidates = quests.filter(
    (q) =>
      q.date === todayFormatted &&
      q.status !== 'completed' &&
      !completedQuests.has(q.id) &&
      q.id !== mainQuestId
  );

  const handlePin = useCallback(
    (questId: string) => {
      pinMainQuest(questId);
      logger.info('MainQuestPanel: quest pinned as Main', { questId });
    },
    [pinMainQuest]
  );

  const handleDemote = useCallback(() => {
    if (!mainQuest) return;
    const decision = decideMercyOnDemote(mainQuest);
    logger.info('MainQuestPanel: Main Quest demote decision', {
      questId: mainQuest.id,
      ...decision,
    });

    if (decision.shouldRecycle) {
      // Alchemical Recycle: open the RuneReRollSheet instead of piling
      // another demotion. The sheet resets demotionCount on commit.
      setRecycleQuest(mainQuest);
      return;
    }

    if (decision.shouldDemote) {
      updateQuest(mainQuest.id, {
        demotionCount: decision.nextDemotionCount,
        isMainQuest: false,
      });
      pinMainQuest(null);
    }
  }, [mainQuest, pinMainQuest, updateQuest]);

  const handleComplete = useCallback(
    async (questId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const prev = new Set(completedQuests);
      const next = new Set(completedQuests);
      if (next.has(questId)) {
        next.delete(questId);
      } else {
        next.add(questId);
      }
      setCompletedQuests(next);
      try {
        await completeQuest(questId);
        // A completed Main Quest releases the pin so a new one can be chosen.
        if (questId === mainQuestId) pinMainQuest(null);
      } catch (error) {
        setCompletedQuests(prev);
        logger.error('MainQuestPanel: failed to complete quest', { error });
      }
    },
    [completedQuests, completeQuest, mainQuestId, pinMainQuest]
  );

  const handleSubtaskComplete = useCallback(
    async (_questId: string, subtaskId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const next = new Set(completedSubtasks);
      if (next.has(subtaskId)) {
        next.delete(subtaskId);
      } else {
        next.add(subtaskId);
      }
      setCompletedSubtasks(next);
    },
    [completedSubtasks]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card-style p-5 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-300" style={{ filter: 'drop-shadow(0 0 6px rgba(250,204,21,0.5))' }} />
          <h3
            className="text-2xl font-bold text-white font-section tracking-wide"
            style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.35)' }}
          >
            Main Quest
          </h3>
        </div>
        {mainQuest ? (
          <motion.button
            onClick={handleDemote}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="text-xs font-mono tracking-wider text-slate-400 hover:text-amber-300 transition-colors border border-slate-700/60 rounded-md px-2 py-1"
            aria-label="Demote main quest back to the Arsenal"
          >
            DEMOTE
          </motion.button>
        ) : (
          onQuestForge && (
            <motion.button
              onClick={onQuestForge}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center hover:bg-amber-500/30 hover:border-amber-400 transition-all shadow-[0_0_8px_rgba(250,204,21,0.35)]"
              aria-label="Forge a new quest"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          )
        )}
      </div>

      <div className="relative z-10 flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full mx-auto mb-3"
            />
            Loading quests...
          </div>
        ) : mainQuest ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={mainQuest.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <QuestCard
                quest={mainQuest}
                isCompleted={completedQuests.has(mainQuest.id) || mainQuest.status === 'completed'}
                completedSubtasks={completedSubtasks}
                onComplete={handleComplete}
                onSubtaskComplete={handleSubtaskComplete}
                onDateChange={(qid, newDate) => updateQuest(qid, { date: newDate })}
                onTimeChange={(qid, newTime) => updateQuest(qid, { hour: newTime })}
                onRecurringToggle={(qid, isRecurring) => updateQuest(qid, { isRecurring })}
                onDelete={async (qid) => {
                  await deleteQuest(qid);
                  if (qid === mainQuestId) pinMainQuest(null);
                }}
              />
            </motion.div>
          </AnimatePresence>
        ) : candidates.length === 0 ? (
          <EmptyMainQuest onForge={onQuestForge} />
        ) : (
          <QuestPicker candidates={candidates} onPin={handlePin} />
        )}
      </div>

      <RuneReRollSheet
        isOpen={recycleQuest !== null}
        onClose={() => setRecycleQuest(null)}
        quest={recycleQuest}
      />
    </motion.div>
  );
});

MainQuestPanel.displayName = 'MainQuestPanel';

// ==================== SUBCOMPONENTS ====================

const EmptyMainQuest = memo(({ onForge }: { onForge?: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center text-center gap-4 py-10 px-4"
  >
    <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
      <Target className="w-7 h-7 text-amber-300" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-accent italic text-amber-200/80">
        No sigil is carved for today.
      </p>
      <p className="text-xs text-slate-400">
        Forge a quest below, then pin it as your single priority.
      </p>
    </div>
    {onForge && (
      <button
        onClick={onForge}
        className="btn-primary inline-flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Forge Quest
      </button>
    )}
  </motion.div>
));
EmptyMainQuest.displayName = 'EmptyMainQuest';

interface QuestPickerProps {
  candidates: Quest[];
  onPin: (questId: string) => void;
}

const QuestPicker = memo(({ candidates, onPin }: QuestPickerProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-2"
  >
    <p className="text-xs font-mono tracking-[0.14em] uppercase text-amber-300/70 mb-2">
      Choose your Main Quest
    </p>
    {candidates.map((quest) => (
      <button
        key={quest.id}
        onClick={() => onPin(quest.id)}
        className="w-full text-left rounded-lg border border-slate-700/60 bg-slate-900/50 hover:border-amber-400/60 hover:bg-slate-900/80 transition-all px-4 py-3 flex items-center justify-between gap-3 group"
      >
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-slate-100 truncate">
            {quest.title}
          </span>
          {quest.project && (
            <span className="text-[11px] font-mono text-slate-500 truncate">
              {quest.project}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono tracking-wider uppercase text-amber-300/0 group-hover:text-amber-300 transition-colors">
          Pin ↑
        </span>
      </button>
    ))}
  </motion.div>
));
QuestPicker.displayName = 'QuestPicker';

export default MainQuestPanel;

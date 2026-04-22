/**
 * RuneReRollSheet — the Alchemical Recycle.
 *
 * When a Main Quest has been demoted RECYCLE_THRESHOLD times, instead of
 * demoting it again (and letting shame accrete), we offer the user an
 * escape hatch:
 *
 *   - Reword the title (optional).
 *   - Pick a fresh intent rune.
 *   - Commit — the quest is updated with a new title/rune, `recycled_at`
 *     is stamped, and `demotionCount` resets to 0. The user also gets a
 *     'recycle' Grimoire entry logged as a neutral ritual.
 *
 * Dissolve-or-recycle framing: NO "delete" button is present. The user
 * can always dismiss without committing, but the flow is explicitly
 * recycle-shaped — shame-free, not shame-clearing.
 */
import { memo, useCallback, useEffect, useState } from 'react';
import { Recycle } from 'lucide-react';
import { BaseModal } from '@/components/common';
import { useQuestStore } from '@/store/questStore';
import { useGrimoireStore } from '@/store/grimoireStore';
import RuneGrid from './RuneGrid';
import type { Quest } from '../quest/QuestCard';
import { logger } from '@/utils/logger';

interface RuneReRollSheetProps {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest | null;
}

const RuneReRollSheet = memo(({ isOpen, onClose, quest }: RuneReRollSheetProps) => {
  const updateQuest = useQuestStore((s) => s.updateQuest);
  const pinMainQuest = useQuestStore((s) => s.pinMainQuest);
  const logRunes = useGrimoireStore((s) => s.logRunes);

  const [title, setTitle] = useState('');
  const [intentRunes, setIntentRunes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && quest) {
      setTitle(quest.title);
      setIntentRunes([]);
      setSubmitting(false);
    }
  }, [isOpen, quest]);

  const handleToggleRune = useCallback((runeId: string) => {
    setIntentRunes((prev) => (prev[0] === runeId ? [] : [runeId]));
  }, []);

  const handleRecycle = useCallback(async () => {
    if (!quest) return;
    setSubmitting(true);
    try {
      const trimmed = title.trim() || quest.title;
      await updateQuest(quest.id, {
        title: trimmed,
        demotionCount: 0,
        recycledAt: new Date().toISOString(),
      });
      // Log a neutral grimoire entry so the recycle is visible in history
      // without being marked as a failure.
      if (intentRunes.length > 0) {
        logRunes(intentRunes, {
          source: 'recycle',
          note: `Recycled: ${trimmed}`,
          linkedRef: quest.id,
        });
      }
      // Re-pin as Main — the user has signaled intent to try again.
      pinMainQuest(quest.id);
      logger.info('RuneReRollSheet: quest recycled', {
        questId: quest.id,
        newTitle: trimmed,
        intentRunes,
      });
      onClose();
    } catch (error) {
      logger.error('RuneReRollSheet: recycle failed', { error });
    } finally {
      setSubmitting(false);
    }
  }, [quest, title, intentRunes, updateQuest, pinMainQuest, logRunes, onClose]);

  const handleDismiss = useCallback(() => {
    if (!quest) return onClose();
    // Dismiss without recycling: quest stays demoted but NOT expired; the
    // user has seen the offer and chosen to walk away. No shame event.
    logger.info('RuneReRollSheet: dismissed without recycle', { questId: quest.id });
    onClose();
  }, [quest, onClose]);

  if (!quest) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleDismiss}
      title="Alchemical Recycle"
      maxWidth="lg"
      borderColor="rgba(34, 211, 238, 0.55)"
      glowColor="rgba(8, 145, 178, 0.4)"
    >
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            <Recycle className="w-5 h-5 text-cyan-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-cyan-100/90 font-accent italic">
              This quest has been demoted three times. That's not failure — that's
              data. Rewrite it. Re-sigil it. Strike it fresh.
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono tracking-wider">
              No counters reset in shame. The old intent dissolves.
            </p>
          </div>
        </div>

        {/* Title (editable) */}
        <div className="space-y-1">
          <label
            htmlFor="recycle-title"
            className="text-xs font-mono tracking-[0.16em] uppercase text-slate-400"
          >
            New sigil
          </label>
          <input
            id="recycle-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={quest.title}
            className="w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/40 transition-colors"
          />
        </div>

        {/* Intent rune — single select */}
        <RuneGrid
          selectedRuneIds={intentRunes}
          onToggle={handleToggleRune}
          maxSelectable={1}
          label="New intent (optional)"
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="btn-secondary text-sm"
          >
            Not yet
          </button>
          <button
            type="button"
            onClick={handleRecycle}
            disabled={submitting}
            className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Recycle className="w-4 h-4" />
            {submitting ? 'Recycling...' : 'Recycle'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
});

RuneReRollSheet.displayName = 'RuneReRollSheet';

export default RuneReRollSheet;

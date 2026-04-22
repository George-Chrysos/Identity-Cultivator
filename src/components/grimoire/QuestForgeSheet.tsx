/**
 * QuestForgeSheet — fast Rune-first quest creation.
 *
 * Replaces the text-heavy NewQuestModal for the common case. Flow:
 *   1. Tap a single "intent" rune (what kind of quest is this)
 *   2. Type 1 title (required) and optional project tag
 *   3. Difficulty quick-pick (Easy / Moderate / Difficult) — defaults Moderate
 *   4. Optional "pin as Main Quest" toggle
 *   5. Forge
 *
 * NOT a replacement for the advanced NewQuestModal (that remains available
 * for power-user subtask + custom-reward creation). This is the 80% path.
 */
import { memo, useCallback, useEffect, useState } from 'react';
import { Pin } from 'lucide-react';
import { BaseModal } from '@/components/common';
import { useQuestStore } from '@/store/questStore';
import { useTestingStore } from '@/store/testingStore';
import RuneGrid from './RuneGrid';
import { logger } from '@/utils/logger';

type Difficulty = 'Easy' | 'Moderate' | 'Difficult' | 'Hard' | 'Hell';
const DIFFICULTY_QUICKPICK: readonly Difficulty[] = ['Easy', 'Moderate', 'Difficult'];

interface QuestForgeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** When true the new quest is automatically pinned as the Main Quest. */
  defaultPinAsMain?: boolean;
}

const QuestForgeSheet = memo(({
  isOpen,
  onClose,
  defaultPinAsMain = false,
}: QuestForgeSheetProps) => {
  const addQuest = useQuestStore((s) => s.addQuest);
  const pinMainQuest = useQuestStore((s) => s.pinMainQuest);
  const { getTestingDateFormatted } = useTestingStore();

  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Moderate');
  const [intentRunes, setIntentRunes] = useState<string[]>([]);
  const [pinAsMain, setPinAsMain] = useState(defaultPinAsMain);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setProject('');
      setDifficulty('Moderate');
      setIntentRunes([]);
      setPinAsMain(defaultPinAsMain);
      setSubmitting(false);
    }
  }, [isOpen, defaultPinAsMain]);

  const handleToggleRune = useCallback((runeId: string) => {
    setIntentRunes((prev) => {
      // Single-select: tapping a different rune replaces, tapping the same
      // one clears. This keeps the ritual fast — no multi-rune ambiguity.
      if (prev[0] === runeId) return [];
      return [runeId];
    });
  }, []);

  const handleForge = useCallback(async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSubmitting(true);
    try {
      const date = getTestingDateFormatted();
      const newQuest = await addQuest({
        title: trimmedTitle,
        project: project.trim() || 'Unbound',
        date,
        status: 'today',
        difficulty,
      });

      if (pinAsMain && newQuest?.id) {
        pinMainQuest(newQuest.id);
      }

      logger.info('QuestForgeSheet: quest forged', {
        id: newQuest?.id,
        pinAsMain,
        intentRunes,
      });
      onClose();
    } catch (error) {
      logger.error('QuestForgeSheet: forge failed', { error });
    } finally {
      setSubmitting(false);
    }
  }, [
    title,
    project,
    difficulty,
    pinAsMain,
    intentRunes,
    addQuest,
    pinMainQuest,
    getTestingDateFormatted,
    onClose,
  ]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Forge a Quest"
      maxWidth="lg"
      borderColor="rgba(250, 204, 21, 0.5)"
      glowColor="rgba(180, 83, 9, 0.4)"
    >
      <div className="p-6 space-y-5">
        <p className="text-sm text-amber-200/80 italic font-accent">
          One clear sigil. One clear act. Forge and strike.
        </p>

        {/* Title (required) */}
        <div className="space-y-1">
          <label
            htmlFor="forge-title"
            className="text-xs font-mono tracking-[0.16em] uppercase text-slate-400"
          >
            Sigil (title)
          </label>
          <input
            id="forge-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What single act matters?"
            autoFocus
            className="w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
          />
        </div>

        {/* Project / tag */}
        <div className="space-y-1">
          <label
            htmlFor="forge-project"
            className="text-xs font-mono tracking-[0.16em] uppercase text-slate-400"
          >
            Bound to (optional)
          </label>
          <input
            id="forge-project"
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="A domain, project, or realm"
            className="w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
          />
        </div>

        {/* Difficulty quick pick */}
        <div className="space-y-1">
          <p className="text-xs font-mono tracking-[0.16em] uppercase text-slate-400">
            Weight
          </p>
          <div className="flex gap-2">
            {DIFFICULTY_QUICKPICK.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={[
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                  difficulty === d
                    ? 'bg-amber-500/25 border border-amber-400/70 text-amber-100 shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                    : 'bg-slate-900/50 border border-slate-700/60 text-slate-400 hover:border-slate-500/70',
                ].join(' ')}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Intent rune — single select */}
        <div className="space-y-1">
          <RuneGrid
            selectedRuneIds={intentRunes}
            onToggle={handleToggleRune}
            maxSelectable={1}
            label="Intent rune (optional)"
          />
        </div>

        {/* Pin as Main toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={pinAsMain}
            onChange={(e) => setPinAsMain(e.target.checked)}
            className="w-4 h-4 accent-amber-400"
          />
          <span className="text-sm text-slate-300 inline-flex items-center gap-2">
            <Pin className="w-4 h-4 text-amber-300" />
            Pin as today's Main Quest
          </span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleForge}
            disabled={submitting || title.trim().length === 0}
            className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Forging...' : 'Forge'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
});

QuestForgeSheet.displayName = 'QuestForgeSheet';

export default QuestForgeSheet;

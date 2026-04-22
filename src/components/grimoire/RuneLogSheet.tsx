/**
 * RuneLogSheet — the Grimoire micro-log entry sheet.
 *
 * Opens from the homepage via a small "Log ✶" button (typically near the
 * Seals area or the NavMenu). Three-tap commit flow:
 *   1. Tap up to 3 runes
 *   2. (Optional) type a single-line note (<= 80 chars)
 *   3. Commit
 *
 * Commit writes a GrimoireEntry via grimoireStore. No DB round-trip is
 * required — the store persists locally; Supabase sync is a follow-up.
 */
import { memo, useCallback, useEffect, useState } from 'react';
import { BaseModal } from '@/components/common';
import { useGrimoireStore } from '@/store/grimoireStore';
import RuneGrid from './RuneGrid';
import { logger } from '@/utils/logger';

interface RuneLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_NOTE = 80;

const RuneLogSheet = memo(({ isOpen, onClose }: RuneLogSheetProps) => {
  const logRunes = useGrimoireStore((s) => s.logRunes);

  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Fresh state each time the sheet opens.
      setSelected([]);
      setNote('');
    }
  }, [isOpen]);

  const handleToggle = useCallback((runeId: string) => {
    setSelected((prev) => {
      if (prev.includes(runeId)) return prev.filter((id) => id !== runeId);
      if (prev.length >= 3) return prev;
      return [...prev, runeId];
    });
  }, []);

  const handleCommit = useCallback(() => {
    if (selected.length === 0) return;
    const entry = logRunes(selected, {
      note: note.trim() || undefined,
      source: 'manual',
    });
    logger.info('RuneLogSheet: entry committed', { id: entry.id, runes: entry.rune_ids });
    onClose();
  }, [selected, note, logRunes, onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Inscribe in the Grimoire"
      maxWidth="lg"
      borderColor="rgba(168, 85, 247, 0.55)"
      glowColor="rgba(76, 29, 149, 0.45)"
    >
      <div className="p-6 space-y-5">
        <p className="text-sm text-slate-400 italic font-accent">
          Mark the day. Three runes, one line. Nothing else.
        </p>

        <RuneGrid
          selectedRuneIds={selected}
          onToggle={handleToggle}
          maxSelectable={3}
          label="Runes"
        />

        <div className="space-y-1">
          <label
            htmlFor="grimoire-note"
            className="text-xs font-mono tracking-[0.16em] uppercase text-slate-400"
          >
            Single line (optional)
          </label>
          <input
            id="grimoire-note"
            type="text"
            maxLength={MAX_NOTE}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A word. A sigil. Anything."
            className="w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-400/70 focus:ring-1 focus:ring-violet-400/40 transition-colors"
          />
          <p className="text-[10px] font-mono text-slate-600 text-right">
            {note.length} / {MAX_NOTE}
          </p>
        </div>

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
            onClick={handleCommit}
            disabled={selected.length === 0}
            className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Inscribe
          </button>
        </div>
      </div>
    </BaseModal>
  );
});

RuneLogSheet.displayName = 'RuneLogSheet';

export default RuneLogSheet;

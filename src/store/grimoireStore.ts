/**
 * grimoireStore — the Grimoire micro-log.
 *
 * Holds the player's rune-tagged daily entries. Manual entries come from the
 * RuneLogSheet; auto-entries come from ChronosManager (streak_rest),
 * StreakManager (streak_rest), questStore (respawn, recycle), and
 * PathTaskService (task_complete).
 *
 * Persistence: entries persist to localStorage via the Zustand persist
 * middleware. Full Supabase sync is a follow-up (see GRIMOIRE_ENTRIES table
 * constant); for now the store is single-device to avoid blocking this
 * refactor on a database migration.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORE_KEYS } from '@/constants/storage';
import { logger } from '@/utils/logger';
import type {
  GrimoireEntry,
  GrimoireSource,
  SeedAxis,
} from '@/types/database';
import { RUNE_BY_ID, sumAuraDelta } from '@/constants/runes';
import { getTodayDate } from '@/constants/seals';

interface GrimoireState {
  entries: GrimoireEntry[];
  userId: string | null;

  // ---- Derived / selectors (kept as methods so consumers don't recompute) ----
  getEntriesForDate: (isoDate: string) => GrimoireEntry[];
  getTodayEntries: () => GrimoireEntry[];
  getTodayRuneIds: () => string[];
  getTodayAuraDelta: () => number;

  // ---- Actions ----
  setUserId: (userId: string | null) => void;
  logRunes: (runeIds: string[], opts?: {
    note?: string;
    source?: GrimoireSource;
    linkedRef?: string;
    axisHint?: SeedAxis;
  }) => GrimoireEntry;
  deleteEntry: (entryId: string) => void;
  clearEntries: () => void;
}

const newEntryId = (): string => {
  // Short, collision-resistant-enough id for client-side logs.
  return `grm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useGrimoireStore = create<GrimoireState>()(
  persist(
    (set, get) => ({
      entries: [],
      userId: null,

      getEntriesForDate: (isoDate) => {
        return get().entries.filter((e) => e.entry_date === isoDate);
      },

      getTodayEntries: () => {
        const today = getTodayDate();
        return get().entries.filter((e) => e.entry_date === today);
      },

      getTodayRuneIds: () => {
        const today = getTodayDate();
        const ids = new Set<string>();
        for (const entry of get().entries) {
          if (entry.entry_date !== today) continue;
          for (const rid of entry.rune_ids) {
            if (RUNE_BY_ID[rid]) ids.add(rid);
          }
        }
        return Array.from(ids);
      },

      getTodayAuraDelta: () => {
        return sumAuraDelta(get().getTodayRuneIds());
      },

      setUserId: (userId) => set({ userId }),

      logRunes: (runeIds, opts = {}) => {
        const filtered = runeIds.filter((id) => Boolean(RUNE_BY_ID[id]));
        // Enforce the 3-rune cap per sheet commit. We don't reject beyond
        // that — we truncate silently and log a warning to keep the UX soft.
        const capped = filtered.slice(0, 3);
        if (capped.length < runeIds.length) {
          logger.warn('Grimoire logRunes truncated beyond 3-rune cap', {
            submitted: runeIds.length,
            kept: capped.length,
          });
        }
        const { userId } = get();
        const entry: GrimoireEntry = {
          id: newEntryId(),
          user_id: userId ?? 'unknown',
          entry_date: getTodayDate(),
          rune_ids: capped,
          note: opts.note?.trim() || undefined,
          source: opts.source ?? 'manual',
          linked_ref: opts.linkedRef,
          created_at: new Date().toISOString(),
        };
        // Idempotency soft-guard: if an auto-entry with same source + linkedRef
        // already exists today, skip duplicate writes. Manual entries never
        // dedupe — the user chose to log twice.
        if (entry.source !== 'manual' && entry.linked_ref) {
          const today = getTodayDate();
          const duplicate = get().entries.find(
            (e) =>
              e.entry_date === today &&
              e.source === entry.source &&
              e.linked_ref === entry.linked_ref
          );
          if (duplicate) {
            logger.debug('Grimoire auto-entry deduped', {
              source: entry.source,
              linkedRef: entry.linked_ref,
            });
            return duplicate;
          }
        }
        set((state) => ({ entries: [...state.entries, entry] }));
        logger.info('Grimoire entry logged', {
          id: entry.id,
          runes: entry.rune_ids,
          source: entry.source,
        });
        return entry;
      },

      deleteEntry: (entryId) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== entryId) }));
      },

      clearEntries: () => {
        set({ entries: [], userId: null });
      },
    }),
    {
      name: STORE_KEYS.GRIMOIRE,
      partialize: (state) => ({
        entries: state.entries,
        userId: state.userId,
      }),
    }
  )
);

/**
 * Core domain types for the Identity Cultivator.
 *
 * An Archetype is a static template bundled in code (Hermes, Musashi, ...).
 * A UserIdentity is a user's binding to one archetype, carrying their level
 * and XP progress. Completions are one-per-day logs, and a side quest is an
 * ad-hoc user-created task unrelated to any identity.
 */

export type ArchetypeId =
  | 'hermes'
  | 'musashi'
  | 'wukong'
  | 'sovereign'
  | 'sage'
  | 'artisan';

/**
 * A single task at a given level for an archetype. Multiple tasks at the
 * same level are all required for a day's completion.
 */
export interface IdentityTask {
  title: string;
  detail?: string;
}

/**
 * One rung on the identity's level ladder.
 */
export interface LevelEntry {
  level: number; // 1..100
  tasks: IdentityTask[];
  intensity?: string; // human-readable summary, e.g. "Warm-up", "Forging", "Mastery"
}

/**
 * Static archetype template (code-bundled).
 */
export interface ArchetypeTemplate {
  id: ArchetypeId;
  name: string;
  archetype: string; // e.g. "Trickster", "Sovereign"
  tagline: string;
  description: string;
  lore: string; // longer prose for the detail sheet
  accent: 'cyan' | 'violet' | 'magenta' | 'gold' | 'emerald' | 'rose';
  glyph: string; // short symbol/emoji used as a visual mark
  levels: LevelEntry[];
}

/**
 * Persisted state for a user's binding to an archetype.
 */
export interface UserIdentity {
  id: string; // stable uuid per binding
  templateId: ArchetypeId;
  level: number; // starts at 1
  xpIntoLevel: number; // starts at 0; resets on level-up
  lastCompletedDate: string | null; // YYYY-MM-DD
  boundAt: string; // ISO timestamp
}

/**
 * One side quest — ad-hoc, user-created, not tied to an identity.
 */
export interface SideQuest {
  id: string;
  title: string;
  createdAt: string;
  active: boolean; // whether the user has opted this into today's list
  lastCompletedDate: string | null;
  sectorTag?: string;
}

/**
 * Result of applying a completion for today's task.
 */
export interface CompletionResult {
  alreadyCompleted: boolean;
  leveledUp: boolean;
  newLevel: number;
  newXpIntoLevel: number;
}

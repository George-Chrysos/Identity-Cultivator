/**
 * Supabase Database Types - New Schema
 * Generated from the new database architecture
 * @updated December 26, 2025
 * 
 * ARCHITECTURE:
 * - identity_templates / player_identities = Player's activated paths (progress tracking)
 * - paths / path_levels / gates / trials = Game configuration data (synced from temperingPath.ts)
 * 
 * The "identity" represents what a player has become (their journey/progress).
 * The "path" represents the game's configuration data (static content).
 */

// ==================== ENUMS ====================
export type PrimaryStat = 'BODY' | 'MIND' | 'SOUL';
export type PlayerIdentityStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type IdentityTier = 'D' | 'D+' | 'C' | 'C+' | 'B' | 'B+' | 'A' | 'A+' | 'S' | 'S+' | 'SS' | 'SS+' | 'SSS';

/**
 * The three fixed Seed axes of the Trinity. Lowercase for URL/storage parity;
 * use SEED_AXIS_TO_PRIMARY_STAT to cross into the legacy PrimaryStat enum.
 */
export type SeedAxis = 'body' | 'mind' | 'soul';

export const SEED_AXES: readonly SeedAxis[] = ['body', 'mind', 'soul'] as const;

export const SEED_AXIS_TO_PRIMARY_STAT: Record<SeedAxis, PrimaryStat> = {
  body: 'BODY',
  mind: 'MIND',
  soul: 'SOUL',
};

export const PRIMARY_STAT_TO_SEED_AXIS: Record<PrimaryStat, SeedAxis> = {
  BODY: 'body',
  MIND: 'mind',
  SOUL: 'soul',
};

// ==================== CORE TABLES ====================

/**
 * User profile with stats and currency
 * @table public.profiles
 */
export interface UserProfile {
  id: string; // UUID from auth.users
  display_name: string;
  coins: number;
  stars: number;
  body_points: number;
  mind_points: number;
  soul_points: number;
  will_points: number; // Numeric type for precision
  final_score: number; // Overall rank score (calculated from dimensions)
  rank_tier: string; // Overall rank tier (F, F+, E, E+, D, D+, C, C+, B, B+, A, A+, S)
  timezone: string;
  created_at: string;
  updated_at: string;
  last_reset_date?: string; // ISO date string (YYYY-MM-DD) for Chronos Reset tracking

  /**
   * Trinity Seed slot bindings. Each holds the player_identities.id that
   * currently expresses this axis. Null = empty slot. Migration derives these
   * from the player's existing active identities by PrimaryStat.
   */
  trinity_body_identity_id?: string | null;
  trinity_mind_identity_id?: string | null;
  trinity_soul_identity_id?: string | null;
}

/**
 * Path statistics snapshot for daily records
 */
export interface PathDailyStat {
  path_id: string;
  path_name: string;
  completed_count: number;
  total_count: number;
  streak_before: number;
  streak_after: number;
}

/**
 * Daily record for historical tracking
 * Saved before daily reset to preserve yesterday's data
 */
export interface DailyRecord {
  id: string;
  user_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  path_stats: PathDailyStat[];
  quests_completed: number;
  total_coins_earned: number;
  created_at: string;
}

/**
 * Daily path progress tracking for real-time completion percentage
 * Used for Calendar view and streak verification at midnight
 * @table public.daily_path_progress
 */
export interface DailyPathProgress {
  id: string;
  user_id: string;
  path_id: string; // References player_identities.template_id (path identifier)
  date: string; // ISO date string (YYYY-MM-DD)
  tasks_total: number;
  tasks_completed: number;
  percentage: number; // 0-100, auto-calculated
  status: 'PENDING' | 'COMPLETED';
  completed_task_ids: string[]; // Array of completed task IDs
  completed_subtask_ids: string[]; // Array of completed subtask IDs
  created_at: string;
  updated_at: string;
}

// ==================== PATH SYNC TABLES ====================
// These tables store normalized path data from the client-side path
// constants (temperingPath.ts, presencePath.ts, magePath.ts). The legacy
// pathSyncService has been removed; these types remain for any callers
// that still read the normalized path schema directly from the DB.

/**
 * Main path metadata (e.g., Tempering Warrior path)
 * @table public.paths
 */
export interface Path {
  id: string;
  name: string;
  description?: string;
  primary_stat: PrimaryStat;
  tier: string;
  max_level: number;
  created_at: string;
  updated_at: string;
}

/**
 * Level configuration per path
 * @table public.path_levels
 */
export interface PathLevel {
  id: string;
  path_id: string;
  level: number;
  subtitle?: string;
  xp_to_level_up: number;
  days_required: number;
  main_stat_limit: number;
  gate_stat_cap: number;
  base_coins: number;
  base_stat_points: number;
  created_at: string;
  updated_at: string;
}

/**
 * Gate/task within a level
 * @table public.gates
 */
export interface Gate {
  id: string;
  path_level_id: string;
  gate_name: string; // rooting, foundation, core, flow, breath, sealing
  task_name: string;
  focus_description?: string;
  task_order: number;
  created_at: string;
}

/**
 * Subtask within a gate
 * @table public.gate_subtasks
 */
export interface GateSubtask {
  id: string;
  gate_id: string;
  name: string;
  focus_description?: string;
  subtask_order: number;
  created_at: string;
}

/**
 * Trial info per level
 * @table public.trials
 */
export interface Trial {
  id: string;
  path_level_id: string;
  name: string;
  description?: string;
  tasks_description?: string;
  focus_description?: string;
  reward_coins: number;
  reward_stars: number;
  reward_stat_points: number;
  reward_item?: string;
  created_at: string;
}

/**
 * Static identity definitions (game data)
 * @table public.identity_templates
 */
export interface IdentityTemplate {
  id: string;
  name: string;
  primary_stat: PrimaryStat;
  tier: IdentityTier;
  unlock_cost_stars: number;
  description?: string;
  parent_path_id?: string; // Links to PathNode id (e.g., 'warrior-1-center' for Tempering)
  created_at: string;
}

/**
 * Subtask definition (part of a task)
 */
export interface SubtaskTemplate {
  id: string;
  task_template_id: string;
  name: string;
  description?: string;
}

/**
 * Static task definitions
 * @table public.task_templates
 * 
 * Rewards are determined by:
 * 1. If path_id is set: Look up rewards from PathRegistry using path_id + path_level
 * 2. Fallback: Use coin_reward and base_points_reward fields directly
 * 
 * This allows both path-based dynamic rewards and legacy static rewards
 */
export interface TaskTemplate {
  id: string;
  identity_template_id: string;
  name: string;
  target_stat: PrimaryStat;
  base_points_reward: number;
  coin_reward: number;
  xp_reward: number;
  description?: string;
  created_at: string;
  subtasks?: SubtaskTemplate[]; // Optional subtasks for detailed task breakdown
  // Path integration fields (for dynamic reward lookup)
  path_id?: string;    // Reference to PathRegistry (e.g., 'tempering-warrior-trainee')
  path_level?: number; // Level within the path (1-10 for tempering)
}

/**
 * User's active identity instances (replaces old user_progress)
 * @table public.player_identities
 */
export interface PlayerIdentity {
  id: string;
  user_id: string;
  template_id: string;
  is_active: boolean;
  current_level: number;
  current_xp: number;
  current_streak: number;
  will_contribution: number;
  status: PlayerIdentityStatus;
  created_at: string;
  updated_at: string;
  // Joined fields (when fetching with template data)
  template?: IdentityTemplate;
}

/**
 * Task completion history (replaces old task_completions)
 * @table public.task_logs
 */
export interface TaskLog {
  id: string;
  user_id: string;
  identity_instance_id: string;
  task_template_id: string;
  completed_at: string;
  stat_points_earned: number;
  coins_earned?: number;
  xp_earned?: number;
  // Joined fields
  task_template?: TaskTemplate;
  player_identity?: PlayerIdentity;
}

/**
 * Shop item definitions
 * @table public.item_templates
 */
export interface ItemTemplate {
  id: string;
  name: string;
  description?: string;
  cost_coins: number;
  cost_stars?: number;
  effect_type: string;
  effect_value: number;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  // Ticket-specific fields
  category?: 'tickets' | 'items' | 'buffs';
  short_description?: string;
  full_description?: string;
  cooldown_time?: number;
  base_inflation?: number;
  icon?: string;
  // Inflation tracking (runtime only)
  basePrice?: number; // Original price
  currentPrice?: number; // Price after inflation
  isInflated?: boolean; // If price is currently inflated
  inflationResetTime?: string; // ISO timestamp when price resets
  activeDuration?: number; // Hours the luxury lasts once used
}

/**
 * User's inventory
 * @table public.player_inventory
 */
export interface PlayerInventoryItem {
  id: string;
  user_id: string;
  item_template_id: string;
  quantity: number;
  acquired_at: string;
  // Joined fields
  item_template?: ItemTemplate;
  // Active ticket state (runtime only)
  is_active?: boolean;
  activated_at?: string;
  expires_at?: string;
  // Ghost Card state - for used tickets
  is_used?: boolean;          // True when ticket has been consumed
  used_at?: string;           // ISO timestamp when ticket was used
  cooldown_duration?: number; // Hours until ticket purifies (from item_template.cooldown_time)
}

/**
 * Market inflation/cooldown state for shop tickets
 * @table public.market_states
 */
export interface MarketState {
  id?: string;
  user_id: string;
  ticket_id: string;
  last_purchased_at: string; // ISO timestamp
  cooldown_duration: number; // Hours until inflation expires
  base_inflation: number; // e.g., 0.25 for 25%
  created_at?: string;
  updated_at?: string;
}

// ==================== VIEW TYPES ====================

/**
 * Enhanced player identity with template data and task info
 * Used for dashboard display
 */
export interface PlayerIdentityWithDetails extends PlayerIdentity {
  template: IdentityTemplate;
  available_tasks: TaskTemplate[];
  completed_today: boolean;
  last_completed_at?: string;
}

/**
 * Dashboard summary data
 */
export interface DashboardData {
  profile: UserProfile;
  active_identities: PlayerIdentityWithDetails[];
  recent_completions: TaskLog[];
  available_items: ItemTemplate[];
}

// ==================== API REQUEST/RESPONSE TYPES ====================

/**
 * Request to activate a new identity
 */
export interface ActivateIdentityRequest {
  user_id: string;
  template_id: string;
}

/**
 * Request to complete a task
 */
export interface CompleteTaskRequest {
  user_id: string;
  identity_instance_id: string;
  task_template_id: string;
}

/**
 * Response from task completion
 */
export interface CompleteTaskResponse {
  task_log: TaskLog;
  updated_profile: UserProfile;
  updated_identity: PlayerIdentity;
  leveled_up: boolean;
  stat_increased: boolean; // Indicates Body stat increased (for UI animation)
  rewards: {
    body_points?: number;
    mind_points?: number;
    soul_points?: number;
    coins: number;
    xp: number;
  };
}

/**
 * Level progress tracking for progressive stat rewards
 * Tracks points earned per gate within a level
 */
export interface LevelProgress {
  level: number;
  gateProgress: {
    rooting: number;
    foundation: number;
    core: number;
    flow: number;
    breath: number;
  };
  totalPointsEarned: number;
}

/**
 * Purchase item request
 */
export interface PurchaseItemRequest {
  user_id: string;
  item_template_id: string;
  quantity?: number;
}

// ==================== CONSTANTS ====================

/**
 * Supabase table names
 */
export const SUPABASE_TABLES = {
  PROFILES: 'profiles',
  IDENTITY_TEMPLATES: 'identity_templates',
  TASK_TEMPLATES: 'task_templates',
  PLAYER_IDENTITIES: 'player_identities',
  TASK_LOGS: 'task_logs',
  ITEM_TEMPLATES: 'item_templates',
  PLAYER_INVENTORY: 'player_inventory',
  MARKET_STATES: 'market_states',
  DAILY_RECORDS: 'daily_records',
  DAILY_PATH_PROGRESS: 'daily_path_progress',
  // Path sync tables (from temperingPath.ts constants)
  PATHS: 'paths',
  PATH_LEVELS: 'path_levels',
  GATES: 'gates',
  GATE_SUBTASKS: 'gate_subtasks',
  TRIALS: 'trials',
  // Quest tables
  QUESTS: 'quests',
  QUEST_SUBTASKS: 'quest_subtasks',
  QUEST_CUSTOM_REWARDS: 'quest_custom_rewards',
  // Grimoire micro-log
  GRIMOIRE_ENTRIES: 'grimoire_entries',
} as const;

// ==================== QUEST TYPES ====================

export type QuestDifficulty = 'Easy' | 'Moderate' | 'Difficult' | 'Hard' | 'Hell';

/**
 * Quest lifecycle states.
 * - today: visible in today's list
 * - backlog: future-dated or deferred
 * - completed: archived
 * - main: pinned as the single Main Quest for today (only one may hold this state)
 * - expired: rolled past its date >= 2 times; surfaces in the Rebirth list, not today
 * - respawning: queued for Respawn (transient state during the re-plant animation)
 * - someday: Alchemical Recycle "defer" rune target — visible in a Someday vault, not expected
 */
export type QuestStatus = 'today' | 'backlog' | 'completed' | 'main' | 'expired' | 'respawning' | 'someday';

/**
 * Quest subtask stored in database
 */
export interface DBQuestSubtask {
  id: string;
  quest_id: string;
  title: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

/**
 * Quest custom reward stored in database
 */
export interface DBQuestCustomReward {
  id: string;
  quest_id: string;
  description: string;
  created_at: string;
}

/**
 * Quest stored in database
 * @table public.quests
 */
export interface DBQuest {
  id: string;
  user_id: string;
  title: string;
  project: string;
  date: string;
  hour?: string;
  status: QuestStatus;
  difficulty: QuestDifficulty;
  completed_at?: string;
  is_recurring: boolean;
  days_not_completed: number;
  created_at: string;
  updated_at: string;

  /**
   * Cyber-Grimoire mercy fields.
   * - respawn_count: times this quest has been re-planted after expiry (soft friction).
   * - expired_at: ISO timestamp when quest was marked expired; cleared on respawn.
   * - demotion_count: times this quest has been pinned as Main and demoted without completion.
   *   At >= 3 the Alchemical Recycle (RuneReRollSheet) is forced on next open.
   * - recycled_at: ISO timestamp of last Alchemical Recycle resolution; resets demotion_count.
   */
  respawn_count?: number;
  expired_at?: string | null;
  demotion_count?: number;
  recycled_at?: string | null;

  // Joined fields
  subtasks?: DBQuestSubtask[];
  custom_rewards?: DBQuestCustomReward[];
}

// ==================== GRIMOIRE / RUNE TYPES ====================

/**
 * Rune categories — determines glyph styling and auraDelta direction.
 * - action: something done (Trained, Studied, Meditated, Created, Connected)
 * - state: felt condition (Energized, Drained, Focused, Scattered)
 * - mercy: mercy-loop entries, never shame-inducing (Rest, Reset, Slipped)
 */
export type RuneCategory = 'action' | 'state' | 'mercy';

/**
 * A single Rune — the atomic unit of the Grimoire micro-log.
 * Intentionally lightweight: runes are UI-level tags, not heavy entities.
 */
export interface Rune {
  id: string;
  label: string;
  category: RuneCategory;
  /** Lucide icon name, consumed by RuneGrid to render the glyph. */
  iconName: string;
  /** Optional aura bias: positive runes nudge the aura brighter, mercy runes soften it. */
  auraDelta?: number;
  /** Optional Seed axis affinity — routes the rune into the right Seed's narrative when logged. */
  statHint?: SeedAxis;
  /** Optional hex color override for the glyph (otherwise derived from category). */
  tint?: string;
}

/**
 * Source of a grimoire entry — distinguishes manual rune-log taps from
 * auto-entries written by task/quest completions and mercy events.
 */
export type GrimoireSource = 'manual' | 'task_complete' | 'quest_complete' | 'streak_rest' | 'respawn' | 'recycle';

/**
 * A single day's grimoire entry. Users may log multiple entries per day; the
 * UI concatenates them into the day's "grimoire page". The default sheet
 * commits one entry with up to 3 runes + optional 1-line note.
 * @table public.grimoire_entries
 */
export interface GrimoireEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  rune_ids: string[];
  note?: string;
  source: GrimoireSource;
  /** Optional link to the quest/identity/seal that triggered an auto-entry. */
  linked_ref?: string;
  created_at: string;
}

// ==================== VITALITY AURA TYPES ====================

/**
 * Aura visual states. Mapped to [data-aura] on <html> by useVitalityAura.
 * - initializing: pre-auth / during the Aha! boot sequence
 * - neon-ascendant: peak state — all Seed tasks + Main Quest done + Will healthy
 * - neon-steady:    default active state — progress today, Will present
 * - shrouded:       debuff — yesterday missed OR Will low
 * - respawn:        mercy mode — a quest is awaiting Respawn / RuneReRoll
 */
export type AuraState = 'initializing' | 'neon-ascendant' | 'neon-steady' | 'shrouded' | 'respawn';

/**
 * Map stat types to profile columns
 */
export const STAT_COLUMN_MAPPING = {
  BODY: 'body_points',
  MIND: 'mind_points',
  SOUL: 'soul_points',
} as const;

/**
 * Default starting values for new profiles
 */
export const DEFAULT_PROFILE_VALUES = {
  coins: 100,
  // 15 stars = enough to plant one starter identity per Seed axis
  // (Body + Mind + Soul), each costing 5 stars at the Stage 1 hero node.
  stars: 15,
  body_points: 0,
  mind_points: 0,
  soul_points: 0,
  will_points: 0,
  final_score: 0,
  rank_tier: 'F',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
} as const;

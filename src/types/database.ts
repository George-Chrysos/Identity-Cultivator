/**
 * Supabase Database Types - New Schema
 * Generated from the new database architecture
 * @updated December 13, 2025
 */

// ==================== ENUMS ====================
export type PrimaryStat = 'BODY' | 'MIND' | 'SOUL';
export type PlayerIdentityStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type IdentityTier = 'D' | 'D+' | 'C' | 'C+' | 'B' | 'B+' | 'A' | 'A+' | 'S' | 'S+' | 'SS' | 'SS+' | 'SSS';

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
} as const;

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
  stars: 5,
  body_points: 0,
  mind_points: 0,
  soul_points: 0,
  will_points: 0,
  final_score: 0,
  rank_tier: 'F',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
} as const;

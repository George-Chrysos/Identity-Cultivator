/**
 * Supabase row shapes for the Identity Cultivator schema.
 *
 * Tables:
 *  - profiles           (1 row per auth user, slim metadata)
 *  - user_identities    (<=3 per user, bound archetype templates with level/xp)
 *  - identity_completions (one row per identity per day completed)
 */

export interface ProfileRow {
  id: string;
  display_name: string | null;
  dashboard_state?: unknown | null;
  dashboard_updated_at?: string | null;
  created_at: string;
}

export interface UserIdentityRow {
  id: string;
  user_id: string;
  template_id: string;
  level: number;
  xp_into_level: number;
  last_completed_date: string | null; // YYYY-MM-DD
  bound_at: string;
}

export interface IdentityCompletionRow {
  id: string;
  user_identity_id: string;
  completed_date: string; // YYYY-MM-DD
  created_at: string;
}

// ============================================================================
// Life Widgets tables
// ============================================================================

export interface FinanceExpenseRow {
  id: string;
  user_id: string;
  amount_cents: number;
  category: string;
  created_at: string;
}

export interface FinanceAccountRow {
  id: string;
  user_id: string;
  label: string;
  balance_cents: number;
  updated_at: string;
}

export interface FinanceDebtRow {
  id: string;
  user_id: string;
  label: string;
  balance_cents: number;
  apr: number | null;
  updated_at: string;
}

export interface SelfCareCheckinRow {
  id: string;
  user_id: string;
  day: string; // YYYY-MM-DD
  sleep_quality: number | null;
  meals_count: number | null;
  meals_quality: number | null;
  activated: boolean;
  stretched: boolean;
  created_at: string;
}

export interface HygieneEventRow {
  id: string;
  user_id: string;
  type: string;
  created_at: string;
}

export interface HomeCheckinRow {
  id: string;
  user_id: string;
  day: string; // YYYY-MM-DD
  cleanliness: number | null;
  organization: number | null;
  created_at: string;
}

export interface MotorcycleOdometerRow {
  id: string;
  user_id: string;
  km: number;
  recorded_at: string;
}

export interface MotorcycleFuelLogRow {
  id: string;
  user_id: string;
  liters: number | null;
  price_cents: number | null;
  total_cents: number | null;
  km_at_fill: number | null;
  recorded_at: string;
}

export interface MotorcycleEventRow {
  id: string;
  user_id: string;
  type: string;
  recorded_at: string;
}

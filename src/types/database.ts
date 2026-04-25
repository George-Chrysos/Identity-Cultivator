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

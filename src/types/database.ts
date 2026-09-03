/**
 * Supabase row shape used by dashboard JSON sync.
 * Remote persistence is a single JSON blob on profiles.
 */

export interface ProfileRow {
  id: string;
  display_name: string | null;
  dashboard_state?: unknown | null;
  dashboard_updated_at?: string | null;
  created_at: string;
}

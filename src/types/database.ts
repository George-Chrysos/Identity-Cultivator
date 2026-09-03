/**
 * Supabase row shapes for profiles + daily_entries.
 */

export interface ProfileRow {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface DailyEntryRow {
  id: string;
  user_id: string;
  entry_date: string;
  body: number | null;
  mind: number | null;
  soul: number | null;
  main_task_text: string;
  main_task_done: boolean;
  morning_activation: boolean;
  ritual: boolean;
  night_protocol: boolean;
  updated_at: string;
}

/**
 * Supabase row shapes for profiles + daily_entries + finance.
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
  main_task_carried_over: boolean;
  morning_activation: boolean;
  ritual: boolean;
  night_protocol: boolean;
  updated_at: string;
}

export interface FinanceExpenseRow {
  id: string;
  user_id: string;
  entry_date: string;
  logged_at: string;
  amount: number;
  category: string;
  updated_at: string;
}

export interface FinanceIncomeRow {
  id: string;
  user_id: string;
  month: string;
  amount: number;
  source: string | null;
  updated_at: string;
}

export interface FinanceBudgetRow {
  user_id: string;
  caps: Record<string, number>;
  updated_at: string;
}

export interface FinanceIncomeBaseRow {
  user_id: string;
  amount: number;
  cadence: string;
  updated_at: string;
}

export interface FinanceIncomeExtraRow {
  id: string;
  user_id: string;
  entry_date: string;
  amount: number;
  label: string | null;
  month: string;
  updated_at: string;
}

export interface FinanceNetWorthSnapshotRow {
  id: string;
  user_id: string;
  entry_date: string;
  savings: number;
  debt: number;
  assets: unknown;
  updated_at: string;
}

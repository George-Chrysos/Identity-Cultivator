import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import type { FinanceAccountRow, FinanceDebtRow, FinanceExpenseRow } from '@/types/database';

export type FinanceCategory =
  | 'Food & Drinks'
  | 'SuperMarket'
  | 'Bills & Subs'
  | 'Shopping'
  | 'Entertaiment'
  | 'Other';

export const financeDB = {
  isReady(): boolean {
    return isSupabaseConfigured();
  },

  async listExpenses(userId: string, limit = 300): Promise<FinanceExpenseRow[]> {
    if (!this.isReady()) return [];
    const { data, error } = await supabase
      .from('finance_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      logger.error('listExpenses failed', error);
      throw error;
    }
    return (data ?? []) as FinanceExpenseRow[];
  },

  async addExpense(params: {
    userId: string;
    amountCents: number;
    category: FinanceCategory | string;
    createdAt?: string;
  }): Promise<FinanceExpenseRow> {
    if (!this.isReady()) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('finance_expenses')
      .insert({
        user_id: params.userId,
        amount_cents: params.amountCents,
        category: params.category,
        ...(params.createdAt ? { created_at: params.createdAt } : {}),
      })
      .select('*')
      .single();

    if (error) {
      logger.error('addExpense failed', error);
      throw error;
    }
    return data as FinanceExpenseRow;
  },

  async listAccounts(userId: string): Promise<FinanceAccountRow[]> {
    if (!this.isReady()) return [];
    const { data, error } = await supabase
      .from('finance_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) {
      logger.error('listAccounts failed', error);
      throw error;
    }
    return (data ?? []) as FinanceAccountRow[];
  },

  async upsertAccount(params: {
    id?: string;
    userId: string;
    label: string;
    balanceCents: number;
  }): Promise<FinanceAccountRow> {
    if (!this.isReady()) {
      throw new Error('Supabase not configured');
    }

    const payload = {
      ...(params.id ? { id: params.id } : {}),
      user_id: params.userId,
      label: params.label,
      balance_cents: params.balanceCents,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('finance_accounts')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      logger.error('upsertAccount failed', error);
      throw error;
    }
    return data as FinanceAccountRow;
  },

  async listDebts(userId: string): Promise<FinanceDebtRow[]> {
    if (!this.isReady()) return [];
    const { data, error } = await supabase
      .from('finance_debts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) {
      logger.error('listDebts failed', error);
      throw error;
    }
    return (data ?? []) as FinanceDebtRow[];
  },

  async upsertDebt(params: {
    id?: string;
    userId: string;
    label: string;
    balanceCents: number;
    apr?: number | null;
  }): Promise<FinanceDebtRow> {
    if (!this.isReady()) {
      throw new Error('Supabase not configured');
    }

    const payload = {
      ...(params.id ? { id: params.id } : {}),
      user_id: params.userId,
      label: params.label,
      balance_cents: params.balanceCents,
      apr: params.apr ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('finance_debts')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      logger.error('upsertDebt failed', error);
      throw error;
    }
    return data as FinanceDebtRow;
  },
};


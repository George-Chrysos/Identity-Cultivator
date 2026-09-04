import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { normalizeExpense, normalizeExtra, normalizeIncomeBase, normalizeSnapshot } from '@/store/financeStore';
import type {
  FinanceBudgetRow,
  FinanceExpenseRow,
  FinanceIncomeBaseRow,
  FinanceIncomeExtraRow,
  FinanceNetWorthSnapshotRow,
} from '@/types/database';
import type { Expense, FinanceCaps, IncomeBase, IncomeExtra, NetWorthSnapshot } from '@/types/finance';

const CATEGORY_SET = new Set(['food', 'business', 'utilities', 'groceries', 'shopping', 'bills', 'other']);

const rowToExpense = (row: FinanceExpenseRow): Expense | null =>
  normalizeExpense({
    id: row.id,
    date: row.entry_date,
    timestamp: Date.parse(row.logged_at) || Date.now(),
    amount: Number(row.amount),
    category: CATEGORY_SET.has(row.category) ? (row.category as Expense['category']) : undefined,
    updatedAt: Date.parse(row.updated_at) || Date.now(),
  });

const expenseToRow = (userId: string, expense: Expense) => ({
  id: expense.id,
  user_id: userId,
  entry_date: expense.date,
  logged_at: new Date(expense.timestamp).toISOString(),
  amount: expense.amount,
  category: expense.category,
  updated_at: new Date(expense.updatedAt).toISOString(),
} satisfies Partial<FinanceExpenseRow>);

const extraToRow = (userId: string, extra: IncomeExtra) => ({
  id: extra.id,
  user_id: userId,
  entry_date: extra.date,
  amount: extra.amount,
  label: extra.label ?? null,
  month: extra.month,
  updated_at: new Date(extra.updatedAt).toISOString(),
} satisfies Partial<FinanceIncomeExtraRow>);

const snapshotToRow = (userId: string, snapshot: NetWorthSnapshot) => ({
  id: snapshot.id,
  user_id: userId,
  entry_date: snapshot.date,
  savings: snapshot.savings,
  debt: snapshot.debt,
  assets: snapshot.assets,
  updated_at: new Date(snapshot.updatedAt).toISOString(),
} satisfies Partial<FinanceNetWorthSnapshotRow>);

const rowToSnapshot = (row: FinanceNetWorthSnapshotRow): NetWorthSnapshot | null =>
  normalizeSnapshot({
    id: row.id,
    date: row.entry_date,
    savings: Number(row.savings),
    debt: Number(row.debt),
    assets: Array.isArray(row.assets) ? row.assets : [],
    updatedAt: Date.parse(row.updated_at) || Date.now(),
  });

export const financeDB = {
  isReady(): boolean {
    return isSupabaseConfigured();
  },

  async fetchAll(userId: string, fromDate: string): Promise<{
    expenses: Expense[];
    incomeBase: IncomeBase;
    extras: IncomeExtra[];
    caps: FinanceCaps;
    snapshots: NetWorthSnapshot[];
  }> {
    const empty = {
      expenses: [] as Expense[],
      incomeBase: normalizeIncomeBase(),
      extras: [] as IncomeExtra[],
      caps: {} as FinanceCaps,
      snapshots: [] as NetWorthSnapshot[],
    };
    if (!this.isReady()) return empty;

    const [expRes, baseRes, extraRes, capRes, snapRes] = await Promise.all([
      supabase
        .from('finance_expenses')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', fromDate)
        .order('logged_at', { ascending: false }),
      supabase.from('finance_income_base').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('finance_income_extras').select('*').eq('user_id', userId),
      supabase.from('finance_budgets').select('*').eq('user_id', userId).maybeSingle(),
      supabase
        .from('finance_net_worth_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: true }),
    ]);

    if (expRes.error) {
      logger.error('finance fetch expenses failed', expRes.error);
      throw expRes.error;
    }
    if (baseRes.error) {
      logger.error('finance fetch income base failed', baseRes.error);
      throw baseRes.error;
    }
    if (extraRes.error) {
      logger.error('finance fetch extras failed', extraRes.error);
      throw extraRes.error;
    }
    if (capRes.error) {
      logger.error('finance fetch budgets failed', capRes.error);
      throw capRes.error;
    }
    if (snapRes.error) {
      logger.error('finance fetch net worth snapshots failed', snapRes.error);
      throw snapRes.error;
    }

    const expenses = ((expRes.data as FinanceExpenseRow[]) ?? [])
      .map(rowToExpense)
      .filter((e): e is Expense => Boolean(e));
    const baseRow = baseRes.data as FinanceIncomeBaseRow | null;
    const incomeBase = normalizeIncomeBase(
      baseRow
        ? { amount: Number(baseRow.amount), updatedAt: Date.parse(baseRow.updated_at) || Date.now() }
        : undefined
    );
    const extras = ((extraRes.data as FinanceIncomeExtraRow[]) ?? [])
      .map((row) =>
        normalizeExtra({
          id: row.id,
          date: row.entry_date,
          amount: Number(row.amount),
          label: row.label ?? undefined,
          month: row.month,
          updatedAt: Date.parse(row.updated_at) || Date.now(),
        })
      )
      .filter((e): e is IncomeExtra => Boolean(e));
    const caps = ((capRes.data as FinanceBudgetRow | null)?.caps ?? {}) as FinanceCaps;
    const snapshots = ((snapRes.data as FinanceNetWorthSnapshotRow[]) ?? [])
      .map(rowToSnapshot)
      .filter((s): s is NetWorthSnapshot => Boolean(s));

    return { expenses, incomeBase, extras, caps, snapshots };
  },

  async upsertExpense(userId: string, expense: Expense): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('finance_expenses').upsert(expenseToRow(userId, expense), {
      onConflict: 'id',
    });
    if (error) {
      logger.error('finance upsert expense failed', error);
      throw error;
    }
  },

  async deleteExpense(userId: string, id: string): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('finance_expenses').delete().eq('user_id', userId).eq('id', id);
    if (error) {
      logger.error('finance delete expense failed', error);
      throw error;
    }
  },

  async upsertIncomeBase(userId: string, base: IncomeBase): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('finance_income_base').upsert(
      {
        user_id: userId,
        amount: base.amount,
        cadence: base.cadence,
        updated_at: new Date(base.updatedAt).toISOString(),
      } satisfies Partial<FinanceIncomeBaseRow>,
      { onConflict: 'user_id' }
    );
    if (error) {
      logger.error('finance upsert income base failed', error);
      throw error;
    }
  },

  async upsertExtra(userId: string, extra: IncomeExtra): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('finance_income_extras').upsert(extraToRow(userId, extra), {
      onConflict: 'id',
    });
    if (error) {
      logger.error('finance upsert extra failed', error);
      throw error;
    }
  },

  async deleteExtra(userId: string, id: string): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('finance_income_extras').delete().eq('user_id', userId).eq('id', id);
    if (error) {
      logger.error('finance delete extra failed', error);
      throw error;
    }
  },

  async upsertCaps(userId: string, caps: FinanceCaps): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('finance_budgets').upsert(
      {
        user_id: userId,
        caps,
        updated_at: new Date().toISOString(),
      } satisfies Partial<FinanceBudgetRow>,
      { onConflict: 'user_id' }
    );
    if (error) {
      logger.error('finance upsert caps failed', error);
      throw error;
    }
  },

  async upsertSnapshot(userId: string, snapshot: NetWorthSnapshot): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('finance_net_worth_snapshots').upsert(snapshotToRow(userId, snapshot), {
      onConflict: 'id',
    });
    if (error) {
      logger.error('finance upsert net worth snapshot failed', error);
      throw error;
    }
  },

  async deleteSnapshot(userId: string, id: string): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase
      .from('finance_net_worth_snapshots')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);
    if (error) {
      logger.error('finance delete net worth snapshot failed', error);
      throw error;
    }
  },
};

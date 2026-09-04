export type CategoryKey =
  | 'food'
  | 'business'
  | 'utilities'
  | 'groceries'
  | 'shopping'
  | 'bills'
  | 'other';

export type CapState = 'neutral' | 'safe' | 'warning' | 'over';

export type PulsePeriod = 'week' | 'month';

export interface Expense {
  id: string;
  date: string;
  timestamp: number;
  amount: number;
  category: CategoryKey;
  updatedAt: number;
}

export interface IncomeBase {
  amount: number;
  cadence: 'monthly';
  updatedAt: number;
}

export interface IncomeExtra {
  id: string;
  date: string;
  amount: number;
  label?: string;
  month: string;
  updatedAt: number;
}

export type FinanceCaps = Partial<Record<CategoryKey, number>>;

export interface NetWorthAsset {
  id: string;
  label: string;
  value: number;
}

export interface NetWorthSnapshot {
  id: string;
  date: string;
  savings: number;
  debt: number;
  assets: NetWorthAsset[];
  updatedAt: number;
}

export interface FinanceStateShape {
  expenses: Record<string, Expense>;
  incomeBase: IncomeBase;
  extras: Record<string, IncomeExtra>;
  caps: FinanceCaps;
  snapshots: Record<string, NetWorthSnapshot>;
  dirtyExpenseIds: string[];
  deletedExpenseIds: string[];
  dirtyExtraIds: string[];
  deletedExtraIds: string[];
  dirtySnapshotIds: string[];
  deletedSnapshotIds: string[];
  incomeBaseDirty: boolean;
  capsDirty: boolean;
}

export interface PeriodCategoryRow {
  category: CategoryKey;
  spent: number;
  capState: CapState;
}

export interface PeriodSummary {
  period: PulsePeriod;
  start: string;
  end: string;
  totalIncome: number;
  totalSpent: number;
  spentPct: number | null;
  avgPerDay: number | null;
  topCategory: { key: CategoryKey; amount: number } | null;
  perCategory: PeriodCategoryRow[];
}

export interface YearlyCategoryRow {
  category: CategoryKey;
  avgPerMonth: number;
  trendPct: number | null;
}

export interface YearlyInsights {
  year: number;
  monthsUsed: number;
  perCategory: YearlyCategoryRow[];
  avgTotalPerMonth: number;
  avgIncomePerMonth: number;
  avgSavingsPerMonth: number;
  savingsPct: number | null;
  insufficient: boolean;
}

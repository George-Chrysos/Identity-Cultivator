import {
  daysElapsedInMonth,
  daysElapsedInRange,
  daysInMonth,
  isoWeekBounds,
  monthKey,
  monthKeyFromDate,
  parseMonthKey,
  todayKey,
} from '@/utils/date';
import { CATEGORY_KEYS, INSIGHT_CATEGORY_KEYS } from '@/components/finance/financeConfig';
import type {
  CapState,
  CategoryKey,
  Expense,
  FinanceCaps,
  IncomeBase,
  IncomeExtra,
  NetWorthSnapshot,
  PeriodSummary,
  PulsePeriod,
  YearlyInsights,
} from '@/types/finance';

export const formatMoney = (amount: number, opts?: { cents?: boolean }): string => {
  const cents = opts?.cents !== false;
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
};

export const parseNumpadBuffer = (buffer: string): number => {
  if (!buffer || buffer === '.') return 0;
  const n = Number(buffer);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
};

export const appendNumpad = (buffer: string, key: string): string => {
  if (key === 'back') return buffer.slice(0, -1);
  if (key === '.') {
    if (buffer.includes('.')) return buffer;
    return buffer ? `${buffer}.` : '0.';
  }
  if (!/^\d$/.test(key)) return buffer;
  const [whole, frac] = buffer.split('.');
  if (frac !== undefined) {
    if (frac.length >= 2) return buffer;
    return `${whole}.${frac}${key}`;
  }
  if (buffer === '0') return key;
  if ((whole ?? '').length >= 7) return buffer;
  return `${buffer}${key}`;
};

export const expensesInRange = (expenses: Expense[], start: string, end: string): Expense[] =>
  expenses.filter((e) => e.date >= start && e.date <= end);

export const expensesInMonth = (expenses: Expense[], month: string): Expense[] =>
  expenses.filter((e) => monthKeyFromDate(e.date) === month);

export const sumAmounts = (list: { amount: number }[]): number =>
  list.reduce((sum, e) => sum + e.amount, 0);

export const spendByCategory = (list: Expense[]): { key: CategoryKey; amount: number }[] => {
  const totals = Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 0])) as Record<CategoryKey, number>;
  for (const e of list) totals[e.category] += e.amount;
  return CATEGORY_KEYS.map((key) => ({ key, amount: totals[key] })).filter((row) => row.amount > 0);
};

export const lifestyleExpenses = (list: Expense[]): Expense[] =>
  list.filter((e) => INSIGHT_CATEGORY_KEYS.includes(e.category));

export const topCategory = (list: Expense[]): { key: CategoryKey; amount: number } | null => {
  const rows = spendByCategory(list);
  if (rows.length === 0) return null;
  return rows.reduce((best, row) => (row.amount > best.amount ? row : best));
};

export const getCapState = (spent: number, cap: number | null | undefined): CapState => {
  if (typeof cap !== 'number' || cap <= 0) return 'neutral';
  const pct = spent / cap;
  if (pct < 0.8) return 'safe';
  if (pct < 1) return 'warning';
  return 'over';
};

export const monthIncome = (
  base: IncomeBase,
  extras: IncomeExtra[],
  month: string
): number => base.amount + sumAmounts(extras.filter((e) => e.month === month));

export const periodWindow = (
  period: PulsePeriod,
  today = todayKey()
): { start: string; end: string } => {
  if (period === 'week') return isoWeekBounds(new Date(`${today}T00:00:00`));
  const m = monthKeyFromDate(today);
  const { year, month } = parseMonthKey(m);
  const last = daysInMonth(year, month);
  return { start: `${m}-01`, end: `${m}-${String(last).padStart(2, '0')}` };
};

export const periodSummary = (
  period: PulsePeriod,
  expenses: Expense[],
  base: IncomeBase,
  extras: IncomeExtra[],
  caps: FinanceCaps,
  today = todayKey()
): PeriodSummary => {
  const window = periodWindow(period, today);
  const end = today < window.end ? today : window.end;
  const list = expensesInRange(expenses, window.start, end);
  const spent = sumAmounts(list);
  const lifestyleSpent = sumAmounts(lifestyleExpenses(list));
  const income = monthIncome(base, extras, monthKeyFromDate(today));
  const elapsed =
    period === 'week'
      ? daysElapsedInRange(window.start, window.end, today)
      : daysElapsedInMonth(monthKeyFromDate(today), today);
  const rows = spendByCategory(list);
  return {
    period,
    start: window.start,
    end: window.end,
    totalIncome: income,
    totalSpent: spent,
    spentPct: income > 0 ? (spent / income) * 100 : null,
    avgPerDay: elapsed > 0 ? Math.round((lifestyleSpent / elapsed) * 100) / 100 : null,
    topCategory: topCategory(list),
    perCategory: rows.map((row) => ({
      category: row.key,
      spent: row.amount,
      capState: getCapState(row.amount, caps[row.key]),
    })),
  };
};

const monthsInYear = (year: number): string[] =>
  Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);

const avgSpendForYear = (expenses: Expense[], extras: IncomeExtra[], base: IncomeBase, year: number) => {
  const months = monthsInYear(year);
  const active = months.filter((m) => {
    const hasExp = expenses.some((e) => monthKeyFromDate(e.date) === m);
    const hasExtra = extras.some((e) => e.month === m);
    return hasExp || hasExtra || (base.amount > 0 && m <= monthKey());
  });
  const used = active.length === 0 ? months.filter((m) => m <= monthKey()) : active;
  const insightExpenses = expenses.filter(
    (e) => e.date.startsWith(String(year)) && INSIGHT_CATEGORY_KEYS.includes(e.category)
  );
  const perCategory = INSIGHT_CATEGORY_KEYS.map((category) => {
    const total = sumAmounts(insightExpenses.filter((e) => e.category === category));
    return { category, avgPerMonth: used.length ? total / used.length : 0 };
  });
  const avgSpend = used.length ? sumAmounts(insightExpenses) / used.length : 0;
  const avgIncome = used.length
    ? used.reduce((sum, m) => sum + monthIncome(base, extras, m), 0) / used.length
    : 0;
  return { used, perCategory, avgSpend, avgIncome };
};

export const yearlyInsights = (
  year: number,
  expenses: Expense[],
  extras: IncomeExtra[],
  base: IncomeBase
): YearlyInsights => {
  const { used, perCategory, avgSpend, avgIncome } = avgSpendForYear(expenses, extras, base, year);
  const monthsUsed = used.length;
  const insufficient = monthsUsed < 2;

  const priorYear = avgSpendForYear(expenses, extras, base, year - 1);
  let priorCats = priorYear.perCategory;

  if (priorYear.used.length === 0 && monthsUsed >= 2) {
    const midIndex = Math.floor(used.length / 2);
    const first = used.slice(0, midIndex);
    priorCats = INSIGHT_CATEGORY_KEYS.map((category) => {
      const total = sumAmounts(
        expenses.filter((e) => first.includes(monthKeyFromDate(e.date)) && e.category === category)
      );
      return { category, avgPerMonth: first.length ? total / first.length : 0 };
    });
  }

  const rows = perCategory.map((row) => {
    const prev = priorCats.find((p) => p.category === row.category)?.avgPerMonth ?? 0;
    const trendPct =
      insufficient || prev === 0 ? (row.avgPerMonth === 0 ? 0 : null) : ((row.avgPerMonth - prev) / prev) * 100;
    return { category: row.category, avgPerMonth: row.avgPerMonth, trendPct };
  });

  const avgSavings = avgIncome - avgSpend;
  return {
    year,
    monthsUsed,
    perCategory: rows,
    avgTotalPerMonth: avgSpend,
    avgIncomePerMonth: avgIncome,
    avgSavingsPerMonth: avgSavings,
    savingsPct: avgIncome > 0 ? (avgSavings / avgIncome) * 100 : null,
    insufficient,
  };
};

export const netWorth = (s: NetWorthSnapshot): number =>
  Math.round((s.savings + s.assets.reduce((sum, asset) => sum + asset.value, 0) - s.debt) * 100) / 100;

export const snapshotList = (snapshots: Record<string, NetWorthSnapshot> | undefined): NetWorthSnapshot[] =>
  Object.values(snapshots ?? {}).sort((a, b) => a.date.localeCompare(b.date) || a.updatedAt - b.updatedAt);

export const yearSnapshots = (year: number, snapshots: Record<string, NetWorthSnapshot> | undefined): NetWorthSnapshot[] =>
  snapshotList(snapshots).filter((s) => s.date.startsWith(`${year}-`));

export const formatRelativeTime = (timestamp: number, now = Date.now()): string => {
  const date = new Date(timestamp);
  const today = todayKey();
  const key = todayKey(date);
  const mins = Math.max(0, Math.floor((now - timestamp) / 60000));
  if (key === today) {
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 12) return `${hours}h ago`;
    return `Today, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
  }
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (key === todayKey(yest)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

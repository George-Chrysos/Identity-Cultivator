import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { financeDB, type FinanceCategory } from '@/api/financeDatabase';
import { ArrowLeft, Plus, Wallet, CreditCard } from 'lucide-react';

const CATEGORIES: Array<{ id: FinanceCategory; glyph: string }> = [
  { id: 'Food & Drinks', glyph: '🍜' },
  { id: 'SuperMarket', glyph: '🛒' },
  { id: 'Bills & Subs', glyph: '🧾' },
  { id: 'Shopping', glyph: '🛍️' },
  { id: 'Entertaiment', glyph: '🎭' },
  { id: 'Other', glyph: '⬡' },
];

const cents = (n: number) => Math.round(n * 100);
const eur = (amountCents: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format((amountCents ?? 0) / 100);

function startOfDayMs(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function startOfMonthMs(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export const FinancePage = ({ onBack }: { onBack: () => void }) => {
  const userId = useAuthStore((s) => s.currentUser?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<FinanceCategory | null>(null);
  const [amount, setAmount] = useState<string>('');

  const [expenses, setExpenses] = useState<Array<{ amount_cents: number; category: string; created_at: string }>>(
    []
  );
  const [liquidCents, setLiquidCents] = useState<number>(0);
  const [debtCents, setDebtCents] = useState<number>(0);

  const cacheRef = useRef<{ userId: string; metricsKey: string; metrics: FinanceMetrics } | null>(null);

  const metricsKey = useMemo(() => {
    // v1: fixed window for averages
    return 'window:last90days';
  }, []);

  useEffect(() => {
    if (!userId || !financeDB.isReady()) return;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const [exp, accounts, debts] = await Promise.all([
          financeDB.listExpenses(userId, 800),
          financeDB.listAccounts(userId),
          financeDB.listDebts(userId),
        ]);
        setExpenses(exp);
        setLiquidCents(accounts.reduce((sum, a) => sum + (a.balance_cents ?? 0), 0));
        setDebtCents(debts.reduce((sum, d) => sum + (d.balance_cents ?? 0), 0));
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const metrics = useMemo(() => {
    if (!userId) return null;
    if (cacheRef.current && cacheRef.current.userId === userId && cacheRef.current.metricsKey === metricsKey) {
      // Invalidate if expense count changed (simple, safe)
      if (cacheRef.current.metrics.expenseCount === expenses.length) return cacheRef.current.metrics;
    }

    const computed = computeFinanceMetrics(expenses);
    cacheRef.current = { userId, metricsKey, metrics: computed };
    return computed;
  }, [expenses, userId, metricsKey]);

  const canUseDb = Boolean(userId) && financeDB.isReady();

  return (
    <div className="space-y-4">
      <div className="hud-card p-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-2 rounded-xl border border-white/10 bg-black/20 text-slate-200 text-xs uppercase tracking-[0.22em] font-title hover:border-cyan-400/25 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="sr-only">Back</span>
        </button>

        <div className="text-right">
          <div className="font-title text-sm uppercase tracking-[0.26em] text-slate-300">Finance</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Manual entry • DB-backed
          </div>
        </div>
      </div>

      {!canUseDb && (
        <section className="hud-card p-4 border-amber-400/20 bg-black/20">
          <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/80 font-title">
            DB not connected
          </div>
          <div className="mt-1 text-sm text-slate-300">
            The Finance UI is visible, but actions are disabled until you sign in and Supabase is configured.
          </div>
        </section>
      )}

      <section className="hud-card p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-3">
          Metrics
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Metric label="Avg daily spend" value={metrics ? eur(metrics.avgDailyCents) : eur(0)} />
          <Metric label="Avg monthly spend" value={metrics ? eur(metrics.avgMonthlyCents) : eur(0)} />
          <Metric label="Bills+subs avg/mo" value={metrics ? eur(metrics.billsSubsMonthlyCents) : eur(0)} />
          <Metric label="Food+drinks avg/mo" value={metrics ? eur(metrics.foodMonthlyCents) : eur(0)} />
          <Metric label="Liquid" value={eur(liquidCents)} icon={<Wallet className="w-4 h-4" />} />
          <Metric label="Debt" value={eur(debtCents)} icon={<CreditCard className="w-4 h-4" />} />
        </div>
      </section>

      <section className="hud-card p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-3">
          Quick expense
        </div>

        <RadialCategoryPicker
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={(c) => setSelectedCategory(c)}
        />

        <div className="mt-3 flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-title mb-1">
              Amount (EUR)
            </div>
            <input
              value={amount}
              disabled={!canUseDb}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="e.g. 12.50"
              className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            disabled={!canUseDb || loading || !selectedCategory || !amount}
            onClick={() => {
              if (!userId || !selectedCategory) return;
              const parsed = Number(amount);
              if (!Number.isFinite(parsed) || parsed <= 0) return;
              setLoading(true);
              setError(null);
              void (async () => {
                try {
                  await financeDB.addExpense({
                    userId,
                    category: selectedCategory,
                    amountCents: cents(parsed),
                  });
                  const exp = await financeDB.listExpenses(userId, 800);
                  setExpenses(exp);
                  setAmount('');
                  setSelectedCategory(null);
                } catch (e: any) {
                  setError(e?.message ?? String(e));
                } finally {
                  setLoading(false);
                }
              })();
            }}
            className="px-4 py-2 rounded-xl bg-[#00f5d4]/15 border border-[#00f5d4]/30 text-[#00f5d4] text-xs uppercase tracking-[0.22em] font-title hover:bg-[#00f5d4]/20 disabled:opacity-50 disabled:hover:bg-[#00f5d4]/15"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </div>
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-rose-300">{error}</div>}
      </section>

      <section className="hud-card p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-3">
          Recent expenses
        </div>
        <div className="space-y-2">
          {expenses.slice(0, 20).map((e, idx) => (
            <div
              key={`${e.created_at}-${idx}`}
              className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm text-slate-100 truncate">{e.category}</div>
                <div className="text-[10px] text-slate-500 font-data">{new Date(e.created_at).toLocaleString()}</div>
              </div>
              <div className="font-data text-slate-100">{eur(e.amount_cents)}</div>
            </div>
          ))}
          {expenses.length === 0 && <div className="text-sm text-slate-500">No expenses yet.</div>}
        </div>
      </section>
    </div>
  );
};

const Metric = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500 font-title">
      {icon}
      <span>{label}</span>
    </div>
    <div className="mt-1 font-data text-lg text-slate-100">{value}</div>
  </div>
);

const RadialCategoryPicker = ({
  categories,
  selected,
  onSelect,
}: {
  categories: Array<{ id: FinanceCategory; glyph: string }>;
  selected: FinanceCategory | null;
  onSelect: (c: FinanceCategory) => void;
}) => {
  const radius = 116;
  const size = 300;
  const center = size / 2;
  const nodeTone = (id: FinanceCategory) => {
    switch (id) {
      case 'Food & Drinks':
        return 'border-amber-300/35 shadow-[0_0_20px_-8px_rgba(249,199,79,0.55)]';
      case 'SuperMarket':
        return 'border-emerald-300/30 shadow-[0_0_20px_-8px_rgba(52,211,153,0.45)]';
      case 'Bills & Subs':
        return 'border-sky-300/30 shadow-[0_0_20px_-8px_rgba(56,189,248,0.45)]';
      case 'Shopping':
        return 'border-pink-300/30 shadow-[0_0_20px_-8px_rgba(247,37,133,0.45)]';
      case 'Entertaiment':
        return 'border-purple-300/30 shadow-[0_0_20px_-8px_rgba(168,85,247,0.5)]';
      case 'Other':
      default:
        return 'border-slate-300/20 shadow-[0_0_16px_-8px_rgba(148,163,184,0.35)]';
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-2">
      <div
        className="relative"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* minimal center hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-title">Category</div>
          <div className="mt-1 text-sm text-slate-100 font-semibold">{selected ?? 'Tap'}</div>
        </div>

        {categories.map((c, i) => {
          const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const on = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-[56px] h-[56px] rounded-full border transition-all duration-200 ${
                on
                  ? 'border-[#00f5d4]/50 bg-[#00f5d4]/15 text-[#00f5d4] shadow-[0_0_18px_-6px_rgba(0,245,212,0.35)]'
                  : `bg-black/20 text-slate-200 hover:border-cyan-400/25 hover:bg-black/30 ${nodeTone(c.id)}`
              }`}
              style={{ left: `${x}px`, top: `${y}px` }}
              title={c.id}
              aria-label={c.id}
            >
              <span className="sr-only">{c.id}</span>
              <span className="text-xl leading-none">{c.glyph}</span>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 border border-white/10 flex items-center justify-center font-data text-[10px] text-slate-200">
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

type FinanceMetrics = {
  expenseCount: number;
  avgDailyCents: number;
  avgMonthlyCents: number;
  billsSubsMonthlyCents: number;
  foodMonthlyCents: number;
};

function computeFinanceMetrics(expenses: Array<{ amount_cents: number; category: string; created_at: string }>): FinanceMetrics {
  if (expenses.length === 0) {
    return {
      expenseCount: 0,
      avgDailyCents: 0,
      avgMonthlyCents: 0,
      billsSubsMonthlyCents: 0,
      foodMonthlyCents: 0,
    };
  }

  const nowDate = new Date();
  const windowStart = new Date(nowDate.getTime() - 90 * 24 * 60 * 60 * 1000);
  const startMs = startOfDayMs(windowStart);
  const endMs = startOfDayMs(nowDate) + 24 * 60 * 60 * 1000;

  const inWindow = expenses.filter((e) => {
    const t = Date.parse(e.created_at);
    return Number.isFinite(t) && t >= startMs && t < endMs;
  });

  const total = inWindow.reduce((sum, e) => sum + (e.amount_cents ?? 0), 0);
  const dayCount = Math.max(1, Math.round((endMs - startMs) / (24 * 60 * 60 * 1000)));

  // Monthly average: compute using number of months touched in window (min 1).
  const monthStart = startOfMonthMs(windowStart);
  const months = Math.max(1, Math.round((endMs - monthStart) / (30 * 24 * 60 * 60 * 1000)));

  const bills = inWindow
    .filter((e) => (e.category ?? '') === 'Bills & Subs')
    .reduce((sum, e) => sum + (e.amount_cents ?? 0), 0);

  const food = inWindow
    .filter((e) => (e.category ?? '') === 'Food & Drinks')
    .reduce((sum, e) => sum + (e.amount_cents ?? 0), 0);

  return {
    expenseCount: expenses.length,
    avgDailyCents: Math.round(total / dayCount),
    avgMonthlyCents: Math.round(total / months),
    billsSubsMonthlyCents: Math.round(bills / months),
    foodMonthlyCents: Math.round(food / months),
  };
}


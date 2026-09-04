import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { financeExpenseList, useFinanceStore } from '@/store/financeStore';
import { expensesInMonth, formatMoney, getCapState, spendByCategory } from '@/utils/money';
import { monthKey } from '@/utils/date';
import type { CategoryKey } from '@/types/finance';
import { CATEGORY_CONFIG, CATEGORY_KEYS, CategoryIcon, capStateColor } from './financeConfig';
import { ExpenseNumpad } from './ExpenseNumpad';

export const QuickAddExpense = () => {
  const addExpense = useFinanceStore((s) => s.addExpense);
  const expenses = useFinanceStore((s) => financeExpenseList(s.finance));
  const caps = useFinanceStore((s) => s.finance.caps);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [flash, setFlash] = useState<{ amount: number; category: CategoryKey } | null>(null);

  const states = useMemo(() => {
    const spent = spendByCategory(expensesInMonth(expenses, monthKey()));
    const map = {} as Record<CategoryKey, ReturnType<typeof getCapState>>;
    for (const key of CATEGORY_KEYS) {
      const amount = spent.find((r) => r.key === key)?.amount ?? 0;
      map[key] = getCapState(amount, caps[key]);
    }
    return map;
  }, [expenses, caps]);

  const save = (amount: number) => {
    if (!category) return;
    addExpense({ amount, category });
    const saved = { amount, category };
    setCategory(null);
    setFlash(saved);
    window.setTimeout(() => setFlash(null), 600);
  };

  if (flash) {
    const cfg = CATEGORY_CONFIG[flash.category];
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2" aria-live="polite">
        <Check className="h-8 w-8 text-emerald-300" strokeWidth={2.5} />
        <p className="m-0 font-data text-lg text-white flex items-center gap-2">
          +{formatMoney(flash.amount)}
          <CategoryIcon category={flash.category} className="h-5 w-5" style={{ color: cfg.hex }} />
        </p>
      </div>
    );
  }

  if (category) {
    return <ExpenseNumpad category={category} onBack={() => setCategory(null)} onSave={save} />;
  }

  return (
    <section aria-label="Quick add expense">
      <h2 className="m-0 mb-[var(--space-sm)] font-section text-sm uppercase tracking-widest text-white">
        Quick add
      </h2>
      <div className="grid grid-cols-4 gap-[var(--space-xs)]">
        {CATEGORY_KEYS.map((key) => {
          const { label, hex } = CATEGORY_CONFIG[key];
          const state = states[key];
          const color = capStateColor(state, hex);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className="flex flex-col items-center gap-1 py-2 rounded-xl border border-white/10 hover:border-white/25"
              style={{
                boxShadow: state === 'over' || state === 'warning' ? `0 0 10px ${color}` : undefined,
                outline: state === 'over' ? `1px solid ${color}` : undefined,
              }}
            >
              <CategoryIcon category={key} className="h-6 w-6" style={{ color }} />
              <span className="font-section text-[9px] uppercase tracking-widest text-white/70">{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

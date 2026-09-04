import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { financeExpenseList, useFinanceStore } from '@/store/financeStore';
import { expensesInMonth } from '@/utils/money';
import { monthKey, monthShortLabel, shiftMonthKey } from '@/utils/date';
import type { CategoryKey, Expense } from '@/types/finance';
import { CATEGORY_CONFIG, CATEGORY_KEYS } from './financeConfig';
import { ExpenseNumpad } from './ExpenseNumpad';
import { ExpenseRow } from './ExpenseRow';

export const FinanceHistory = () => {
  const currentMonth = monthKey();
  const [month, setMonth] = useState(currentMonth);
  const [filter, setFilter] = useState<CategoryKey | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const expenses = useFinanceStore((s) => financeExpenseList(s.finance));
  const updateExpense = useFinanceStore((s) => s.updateExpense);
  const deleteExpense = useFinanceStore((s) => s.deleteExpense);

  const monthList = useMemo(() => {
    const list = expensesInMonth(expenses, month);
    return filter ? list.filter((e) => e.category === filter) : list;
  }, [expenses, month, filter]);

  if (editing) {
    return (
      <ExpenseNumpad
        key={editing.id}
        category={editing.category}
        initialAmount={editing.amount}
        saveLabel="Update"
        onBack={() => setEditing(null)}
        onCategoryChange={(category) => setEditing({ ...editing, category })}
        onSave={(amount) => {
          updateExpense(editing.id, { amount, category: editing.category });
          setEditing(null);
        }}
        onDelete={() => {
          deleteExpense(editing.id);
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <div className="flex items-center justify-between gap-[var(--space-xs)]">
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonthKey(m, -1))}
          className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-section text-sm uppercase tracking-widest">{monthShortLabel(month)}</span>
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonthKey(m, 1))}
          disabled={month >= currentMonth}
          className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`px-2 py-1 rounded-lg border text-[10px] uppercase tracking-widest font-section ${
            filter === null ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-white/50'
          }`}
        >
          All
        </button>
        {CATEGORY_KEYS.map((key) => {
          const { label, hex } = CATEGORY_CONFIG[key];
          const on = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(on ? null : key)}
              className="px-2 py-1 rounded-lg border text-[10px] uppercase tracking-widest font-section"
              style={{
                borderColor: on ? hex : 'rgba(255,255,255,0.1)',
                color: on ? hex : 'rgba(255,255,255,0.55)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {monthList.length === 0 ? (
        <p className="m-0 text-sm text-white/45">No expenses this month</p>
      ) : (
        <ul className="flex flex-col gap-[var(--space-xs)] m-0 p-0 list-none">
          {monthList.map((expense) => (
            <li key={expense.id}>
              <ExpenseRow expense={expense} onClick={() => setEditing(expense)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

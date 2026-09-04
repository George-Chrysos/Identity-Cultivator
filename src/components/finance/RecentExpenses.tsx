import { financeExpenseList, useFinanceStore } from '@/store/financeStore';
import { ExpenseRow } from './ExpenseRow';

interface RecentExpensesProps {
  onViewAll: () => void;
}

export const RecentExpenses = ({ onViewAll }: RecentExpensesProps) => {
  const recent = useFinanceStore((s) => financeExpenseList(s.finance).slice(0, 5));

  return (
    <section aria-label="Recent expenses">
      <div className="flex items-center justify-between mb-[var(--space-sm)]">
        <h2 className="m-0 font-section text-sm uppercase tracking-widest text-white">Recent</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="font-section text-[10px] uppercase tracking-widest text-emerald-200/80 hover:text-emerald-100"
        >
          View all
        </button>
      </div>
      {recent.length === 0 ? (
        <p className="m-0 text-sm text-white/45 font-body">No expenses yet</p>
      ) : (
        <ul className="flex flex-col gap-[var(--space-xs)] m-0 p-0 list-none">
          {recent.map((expense) => (
            <li key={expense.id}>
              <ExpenseRow expense={expense} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

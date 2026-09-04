import { CATEGORY_CONFIG, CategoryIcon } from './financeConfig';
import { formatMoney, formatRelativeTime } from '@/utils/money';
import type { Expense } from '@/types/finance';

interface ExpenseRowProps {
  expense: Expense;
  onClick?: () => void;
}

export const ExpenseRow = ({ expense, onClick }: ExpenseRowProps) => {
  const cfg = CATEGORY_CONFIG[expense.category];
  const inner = (
    <>
      <CategoryIcon category={expense.category} className="h-4 w-4 shrink-0" style={{ color: cfg.hex }} />
      <span className="font-body text-sm flex-1 text-white">{cfg.label}</span>
      <span className="font-data text-sm text-white">{formatMoney(expense.amount)}</span>
      <span
        className="h-2.5 w-2.5 rounded-full shrink-0"
        style={{ background: cfg.hex, boxShadow: `0 0 8px ${cfg.hex}` }}
      />
      <span className="font-section text-[10px] uppercase tracking-widest text-white/45 w-[5.5rem] text-right">
        {formatRelativeTime(expense.timestamp)}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left"
      >
        {inner}
      </button>
    );
  }

  return <div className="w-full flex items-center gap-3 px-2 py-1.5">{inner}</div>;
};

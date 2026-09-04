import { useMemo, useState } from 'react';
import { BarChart3, Settings } from 'lucide-react';
import { financeExpenseList, financeExtraList, useFinanceStore } from '@/store/financeStore';
import { formatMoney, periodSummary } from '@/utils/money';
import { CATEGORY_CONFIG, CategoryIcon, ringColorForPct } from './financeConfig';
import { CategorySpendBar } from './CategorySpendBar';
import { PulseRing } from './PulseRing';
import type { PulsePeriod } from '@/types/finance';

interface FinancialPulseCardProps {
  onOpenSettings: () => void;
  onOpenInsights: () => void;
}

export const FinancialPulseCard = ({ onOpenSettings, onOpenInsights }: FinancialPulseCardProps) => {
  const [period, setPeriod] = useState<PulsePeriod>('month');
  const expenses = useFinanceStore((s) => financeExpenseList(s.finance));
  const extras = useFinanceStore((s) => financeExtraList(s.finance));
  const base = useFinanceStore((s) => s.finance.incomeBase);
  const caps = useFinanceStore((s) => s.finance.caps);

  const summary = useMemo(
    () => periodSummary(period, expenses, base, extras, caps),
    [period, expenses, base, extras, caps]
  );

  const hasIncome = summary.totalIncome > 0;
  const stroke = ringColorForPct(summary.spentPct);
  const topCfg = summary.topCategory ? CATEGORY_CONFIG[summary.topCategory.key] : null;

  return (
    <section className="pulse-card p-5 sm:p-6 flex flex-col gap-[var(--space-md)]" aria-label="Financial pulse">
      <header className="flex items-center justify-between gap-[var(--space-sm)]">
        <h2 className="m-0 font-section text-sm uppercase tracking-widest text-emerald-200/90">
          Financial pulse
        </h2>
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            {(['week', 'month'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setPeriod(choice)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-section ${
                  period === choice ? 'bg-white/10 text-white' : 'bg-transparent text-white/45 hover:text-white'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenInsights}
            className="p-1.5 rounded-lg border border-white/10 text-white/55 hover:text-white"
            aria-label="Yearly averages"
          >
            <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-white/10 text-white/55 hover:text-white"
            aria-label="Income and cap settings"
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="flex flex-col items-center gap-[var(--space-xs)]">
        <PulseRing percent={hasIncome ? summary.spentPct : null} stroke={stroke} />
        <span className="font-data text-2xl font-bold text-white tabular-nums">
          {summary.spentPct === null ? '—' : `${Math.round(summary.spentPct)}%`}
        </span>
        <span className="font-section text-[10px] uppercase tracking-widest text-white/50">
          Spent of income
        </span>
        <p className="m-0 font-data text-sm text-emerald-100">
          {formatMoney(summary.totalSpent, { cents: false })} /{' '}
          {hasIncome ? formatMoney(summary.totalIncome, { cents: false }) : '—'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-[var(--space-md)]">
        <div>
          <p className="m-0 font-section text-[10px] uppercase tracking-widest text-white/50">Avg/day</p>
          <p className="m-0 mt-1 font-data text-lg text-white">
            {summary.avgPerDay === null ? '—' : formatMoney(summary.avgPerDay, { cents: false })}
          </p>
        </div>
        <div>
          <p className="m-0 font-section text-[10px] uppercase tracking-widest text-white/50">Top category</p>
          {summary.topCategory && topCfg ? (
            <p className="m-0 mt-1 font-body text-sm text-white flex items-center gap-1.5">
              <CategoryIcon
                category={summary.topCategory.key}
                className="h-4 w-4 shrink-0"
                style={{ color: topCfg.hex }}
              />
              <span>{topCfg.label}</span>
              <span className="font-data ml-auto">{formatMoney(summary.topCategory.amount)}</span>
            </p>
          ) : (
            <p className="m-0 mt-1 text-sm text-white/45">—</p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 pt-[var(--space-sm)]">
        <p className="m-0 mb-[var(--space-xs)] font-section text-[10px] uppercase tracking-widest text-white/50">
          Category breakdown
        </p>
        <CategorySpendBar rows={summary.perCategory} />
      </div>
    </section>
  );
};

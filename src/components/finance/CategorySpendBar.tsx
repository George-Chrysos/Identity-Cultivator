import { useEffect, useRef, useState } from 'react';
import { CATEGORY_CONFIG, CategoryIcon, capStateColor } from './financeConfig';
import type { CapState, CategoryKey } from '@/types/finance';

interface CategorySpendBarProps {
  rows: { category: CategoryKey; spent: number; capState: CapState }[];
}

export const CategorySpendBar = ({ rows }: CategorySpendBarProps) => {
  const total = rows.reduce((sum, row) => sum + row.spent, 0);
  const prevOver = useRef<Set<CategoryKey>>(new Set());
  const [pulse, setPulse] = useState<Set<CategoryKey>>(new Set());

  useEffect(() => {
    const next = new Set<CategoryKey>();
    const crossed = new Set<CategoryKey>();
    for (const row of rows) {
      if (row.capState === 'over') {
        next.add(row.category);
        if (!prevOver.current.has(row.category)) crossed.add(row.category);
      }
    }
    prevOver.current = next;
    if (crossed.size === 0) return;
    setPulse(crossed);
    const id = window.setTimeout(() => setPulse(new Set()), 700);
    return () => window.clearTimeout(id);
  }, [rows]);

  if (total <= 0 || rows.length === 0) {
    return <p className="m-0 text-xs font-body text-white/45">No spend this period</p>;
  }

  return (
    <div className="flex flex-col gap-[var(--space-xs)]" aria-label="Category breakdown">
      <div className="flex h-3 w-full gap-0.5">
        {rows.map(({ category, spent, capState }) => {
          const { hex, label } = CATEGORY_CONFIG[category];
          const color = capStateColor(capState, hex);
          const over = capState === 'over';
          return (
            <span
              key={category}
              title={label}
              className={`h-full min-w-[4px] rounded-sm ${pulse.has(category) ? 'cap-over-pulse' : ''}`}
              style={{
                width: `${(spent / total) * 100}%`,
                background: `linear-gradient(to bottom, ${color}cc, ${color})`,
                boxShadow: over ? `0 0 10px ${color}` : `0 0 6px ${color}66`,
                outline: over ? `1px solid ${color}` : undefined,
              }}
            />
          );
        })}
      </div>
      <div className="flex gap-0.5">
        {rows.map(({ category, spent, capState }) => {
          const { hex, label } = CATEGORY_CONFIG[category];
          const color = capStateColor(capState, hex);
          return (
            <div
              key={category}
              className="flex flex-col items-center gap-0.5 min-w-0"
              style={{ flexGrow: spent, flexBasis: 0 }}
            >
              <CategoryIcon category={category} className="h-3.5 w-3.5" style={{ color }} aria-label={label} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

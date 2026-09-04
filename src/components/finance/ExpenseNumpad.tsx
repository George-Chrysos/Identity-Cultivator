import { ArrowLeft, Check, Delete } from 'lucide-react';
import { useState } from 'react';
import type { CategoryKey } from '@/types/finance';
import { appendNumpad, formatMoney, parseNumpadBuffer } from '@/utils/money';
import { CATEGORY_CONFIG, CategoryIcon, INCOME_GREEN, QUICK_AMOUNTS } from './financeConfig';

interface ExpenseNumpadProps {
  category?: CategoryKey;
  heading?: string;
  accent?: string;
  initialAmount?: number;
  saveLabel?: string;
  showLabelField?: boolean;
  onBack: () => void;
  onSave: (amount: number, label?: string) => void;
  onDelete?: () => void;
  onCategoryChange?: (key: CategoryKey) => void;
}

export const ExpenseNumpad = ({
  category,
  heading,
  accent,
  initialAmount,
  saveLabel = 'Save',
  showLabelField,
  onBack,
  onSave,
  onDelete,
  onCategoryChange,
}: ExpenseNumpadProps) => {
  const [buffer, setBuffer] = useState(() =>
    typeof initialAmount === 'number' && initialAmount > 0 ? initialAmount.toFixed(2).replace(/\.00$/, '') : ''
  );
  const [label, setLabel] = useState('');
  const cfg = category ? CATEGORY_CONFIG[category] : null;
  const color = accent ?? cfg?.hex ?? INCOME_GREEN;
  const title = heading ?? cfg?.label ?? 'Amount';
  const amount = parseNumpadBuffer(buffer);
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'] as const;

  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <div className="flex items-center gap-[var(--space-xs)]">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {category && <CategoryIcon category={category} className="h-6 w-6" style={{ color }} />}
        <span className="font-section text-xs uppercase tracking-widest" style={{ color }}>
          {title}
        </span>
      </div>

      {onCategoryChange && (
        <div className="flex flex-wrap gap-1">
          {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
            const item = CATEGORY_CONFIG[key];
            const on = key === category;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onCategoryChange(key)}
                className="p-1.5 rounded-lg border"
                style={{
                  borderColor: on ? item.hex : 'rgba(255,255,255,0.1)',
                  color: item.hex,
                  boxShadow: on ? `0 0 8px ${item.hex}66` : undefined,
                }}
                aria-label={item.label}
                aria-pressed={on}
              >
                <CategoryIcon category={key} className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      )}

      <p className="m-0 text-center font-data text-4xl text-white tabular-nums">{formatMoney(amount)}</p>

      {showLabelField && (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-white font-body outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      )}

      <div className="flex justify-center gap-2">
        {QUICK_AMOUNTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setBuffer(String(n))}
            className="px-3 py-1 rounded-lg border border-white/10 font-data text-sm text-white/80 hover:text-white"
          >
            {formatMoney(n, { cents: false })}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setBuffer((prev) => appendNumpad(prev, key))}
            className="h-12 rounded-xl border border-white/10 bg-slate-950/40 font-data text-xl text-white hover:border-white/30"
            aria-label={key === 'back' ? 'Backspace' : key}
          >
            {key === 'back' ? <Delete className="h-5 w-5 mx-auto" /> : key}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={amount <= 0}
        onClick={() => onSave(amount, label.trim() || undefined)}
        className="w-full py-3 rounded-xl font-semibold text-slate-950 flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ background: color, boxShadow: `0 0 16px ${color}88` }}
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
        {saveLabel}
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-full py-2 rounded-xl border border-red-400/40 text-red-200 text-xs uppercase tracking-widest font-section hover:bg-red-500/10"
        >
          Delete
        </button>
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { BaseModal } from '@/components/common';
import { financeExtraList, useFinanceStore } from '@/store/financeStore';
import { monthKey } from '@/utils/date';
import { formatMoney, parseNumpadBuffer } from '@/utils/money';
import { CATEGORY_CONFIG, CATEGORY_KEYS, CategoryIcon, INCOME_GREEN } from './financeConfig';
import { ExpenseNumpad } from './ExpenseNumpad';

interface FinanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinanceSettingsModal = ({ isOpen, onClose }: FinanceSettingsModalProps) => {
  const [tab, setTab] = useState<'income' | 'caps'>('income');
  const [adding, setAdding] = useState(false);
  const [editingBase, setEditingBase] = useState(false);
  const [baseDraft, setBaseDraft] = useState('');
  const [capDraft, setCapDraft] = useState<Record<string, string>>({});
  const incomeBase = useFinanceStore((s) => s.finance.incomeBase);
  const extras = useFinanceStore((s) => financeExtraList(s.finance));
  const caps = useFinanceStore((s) => s.finance.caps);
  const setIncomeBase = useFinanceStore((s) => s.setIncomeBase);
  const addExtra = useFinanceStore((s) => s.addExtra);
  const deleteExtra = useFinanceStore((s) => s.deleteExtra);
  const setCaps = useFinanceStore((s) => s.setCaps);
  const thisMonth = monthKey();
  const monthExtras = extras.filter((e) => e.month === thisMonth);

  useEffect(() => {
    if (!isOpen) return;
    setTab('income');
    setAdding(false);
    setEditingBase(false);
    setBaseDraft(incomeBase.amount > 0 ? String(incomeBase.amount) : '');
    const next: Record<string, string> = {};
    for (const key of CATEGORY_KEYS) {
      const cap = caps[key];
      next[key] = typeof cap === 'number' ? String(cap) : '';
    }
    setCapDraft(next);
  }, [isOpen, incomeBase.amount, caps]);

  const saveCaps = () => {
    const next: Partial<Record<(typeof CATEGORY_KEYS)[number], number>> = {};
    for (const key of CATEGORY_KEYS) {
      const n = parseNumpadBuffer(capDraft[key] ?? '');
      if (n > 0) next[key] = n;
    }
    setCaps(next);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Finance settings" maxWidth="md">
      <div className="p-[var(--space-md)] flex flex-col gap-[var(--space-md)]">
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {(['income', 'caps'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 py-2 text-xs uppercase tracking-widest font-section ${
                tab === id ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'
              }`}
            >
              {id === 'income' ? 'Income' : 'Caps'}
            </button>
          ))}
        </div>

        {tab === 'income' && adding && (
          <ExpenseNumpad
            heading="Extra income"
            accent={INCOME_GREEN}
            showLabelField
            onBack={() => setAdding(false)}
            onSave={(amount, label) => {
              addExtra({ amount, label });
              setAdding(false);
            }}
          />
        )}

        {tab === 'income' && !adding && (
          <>
            <div className="flex flex-col gap-[var(--space-xs)]">
              <span className="font-section text-[10px] uppercase tracking-widest text-white/50">
                Base monthly salary
              </span>
              {editingBase ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={baseDraft}
                    onChange={(e) => setBaseDraft(e.target.value.replace(/[^\d.]/g, ''))}
                    className="flex-1 bg-slate-950/60 border border-emerald-400/30 rounded-xl px-3 py-2 text-white font-data outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIncomeBase(parseNumpadBuffer(baseDraft));
                      setEditingBase(false);
                    }}
                    className="px-3 rounded-xl bg-emerald-400 text-slate-950 text-xs uppercase tracking-widest font-section"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-data text-lg text-white">
                    {incomeBase.amount > 0 ? formatMoney(incomeBase.amount) : 'Not set'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingBase(true)}
                    className="px-3 py-1 rounded-lg border border-white/10 text-[10px] uppercase tracking-widest font-section text-white/70 hover:text-white"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-[var(--space-xs)]">
              <span className="font-section text-[10px] uppercase tracking-widest text-white/50">
                Extra income this month
              </span>
              {monthExtras.length === 0 && (
                <p className="m-0 text-sm text-white/45">None yet</p>
              )}
              {monthExtras.map((extra) => (
                <div key={extra.id} className="flex items-center gap-2">
                  <span className="flex-1 font-body text-sm text-white">
                    {extra.label || 'Extra'}
                  </span>
                  <span className="font-data text-sm text-emerald-200">{formatMoney(extra.amount)}</span>
                  <button
                    type="button"
                    onClick={() => deleteExtra(extra.id)}
                    className="text-[10px] uppercase tracking-widest font-section text-red-200/80 hover:text-red-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="w-full py-2 rounded-xl border border-emerald-400/40 text-emerald-200 text-xs uppercase tracking-widest font-section hover:bg-emerald-500/10"
              >
                Add extra income
              </button>
            </div>
          </>
        )}

        {tab === 'caps' && (
          <>
            {CATEGORY_KEYS.map((key) => {
              const { label, hex } = CATEGORY_CONFIG[key];
              return (
                <label key={key} className="flex items-center gap-2">
                  <CategoryIcon category={key} className="h-4 w-4 shrink-0" style={{ color: hex }} />
                  <span className="flex-1 font-body text-sm text-white">{label}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={capDraft[key] ?? ''}
                    onChange={(e) =>
                      setCapDraft((prev) => ({ ...prev, [key]: e.target.value.replace(/[^\d.]/g, '') }))
                    }
                    placeholder="None"
                    className="w-24 bg-slate-950/60 border border-white/10 rounded-lg px-2 py-1 text-right text-white font-data outline-none focus:ring-2 focus:ring-emerald-500/40"
                    aria-label={`${label} cap`}
                  />
                </label>
              );
            })}
            <button
              type="button"
              onClick={saveCaps}
              className="w-full py-3 rounded-xl bg-emerald-400 text-slate-950 font-semibold"
            >
              Save caps
            </button>
          </>
        )}
      </div>
    </BaseModal>
  );
};

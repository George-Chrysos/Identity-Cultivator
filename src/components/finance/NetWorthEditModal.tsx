import { useEffect, useState } from 'react';
import { BaseModal } from '@/components/common';
import { useFinanceStore } from '@/store/financeStore';
import { parseNumpadBuffer, snapshotList } from '@/utils/money';
import type { NetWorthAsset } from '@/types/finance';

interface NetWorthEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AssetDraft {
  id: string;
  label: string;
  value: string;
}

const emptyAsset = (): AssetDraft => ({ id: crypto.randomUUID(), label: '', value: '' });

export const NetWorthEditModal = ({ isOpen, onClose }: NetWorthEditModalProps) => {
  const snapshots = useFinanceStore((s) => s.finance.snapshots);
  const addSnapshot = useFinanceStore((s) => s.addSnapshot);
  const [savings, setSavings] = useState('');
  const [debt, setDebt] = useState('');
  const [assets, setAssets] = useState<AssetDraft[]>([emptyAsset()]);

  useEffect(() => {
    if (!isOpen) return;
    const listed = snapshotList(snapshots);
    const latest = listed[listed.length - 1];
    setSavings(latest && latest.savings > 0 ? String(latest.savings) : '');
    setDebt(latest && latest.debt > 0 ? String(latest.debt) : '');
    setAssets(
      latest && latest.assets.length > 0
        ? latest.assets.map((a) => ({
            id: crypto.randomUUID(),
            label: a.label,
            value: a.value > 0 ? String(a.value) : '',
          }))
        : [emptyAsset()]
    );
  }, [isOpen, snapshots]);

  const updateAsset = (id: string, patch: Partial<AssetDraft>) => {
    setAssets((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const save = () => {
    const nextAssets: NetWorthAsset[] = assets
      .map((row) => ({
        id: row.id,
        label: row.label.trim(),
        value: parseNumpadBuffer(row.value),
      }))
      .filter((row) => row.label || row.value > 0);
    addSnapshot({
      savings: parseNumpadBuffer(savings),
      debt: parseNumpadBuffer(debt),
      assets: nextAssets,
    });
    onClose();
  };

  const fieldClass =
    'bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-white font-data outline-none focus:ring-2 focus:ring-slate-400/40';

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Update net worth" maxWidth="md">
      <div className="p-[var(--space-md)] flex flex-col gap-[var(--space-md)]">
        <label className="flex flex-col gap-1">
          <span className="font-section text-[10px] uppercase tracking-widest text-white/50">Savings</span>
          <input
            type="text"
            inputMode="decimal"
            value={savings}
            onChange={(e) => setSavings(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="0"
            className={fieldClass}
            aria-label="Savings"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-section text-[10px] uppercase tracking-widest text-white/50">Debt</span>
          <input
            type="text"
            inputMode="decimal"
            value={debt}
            onChange={(e) => setDebt(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="0"
            className={fieldClass}
            aria-label="Debt"
          />
        </label>

        <div className="flex flex-col gap-[var(--space-xs)]">
          <span className="font-section text-[10px] uppercase tracking-widest text-white/50">Assets</span>
          {assets.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <input
                type="text"
                value={row.label}
                onChange={(e) => updateAsset(row.id, { label: e.target.value })}
                placeholder="Label"
                className={`flex-1 ${fieldClass}`}
                aria-label="Asset label"
              />
              <input
                type="text"
                inputMode="decimal"
                value={row.value}
                onChange={(e) => updateAsset(row.id, { value: e.target.value.replace(/[^\d.]/g, '') })}
                placeholder="EUR"
                className={`w-24 text-right ${fieldClass}`}
                aria-label="Asset value"
              />
              <button
                type="button"
                onClick={() =>
                  setAssets((prev) => (prev.length <= 1 ? [emptyAsset()] : prev.filter((a) => a.id !== row.id)))
                }
                className="text-[10px] uppercase tracking-widest font-section text-white/45 hover:text-white"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAssets((prev) => [...prev, emptyAsset()])}
            className="w-full py-2 rounded-xl border border-slate-400/40 text-slate-200 text-xs uppercase tracking-widest font-section hover:bg-slate-500/10"
          >
            Add asset
          </button>
        </div>

        <button
          type="button"
          onClick={save}
          className="w-full py-3 rounded-xl bg-slate-300 text-slate-950 font-semibold"
        >
          Save Snapshot
        </button>
      </div>
    </BaseModal>
  );
};

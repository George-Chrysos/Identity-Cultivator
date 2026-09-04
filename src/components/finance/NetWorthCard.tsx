import { useMemo, useState } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { formatMoney, netWorth, snapshotList } from '@/utils/money';
import { NetWorthEditModal } from './NetWorthEditModal';

const SILVER = '#94A3B8';
const DEBT = '#F87171';

const CompositionBar = ({
  label,
  value,
  max,
  debt,
}: {
  label: string;
  value: number;
  max: number;
  debt?: boolean;
}) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="font-section text-[10px] uppercase tracking-widest text-white/50">{label}</span>
    <span className="font-data text-sm text-white tabular-nums truncate">
      {formatMoney(value, { cents: false })}
    </span>
    <span
      className="h-1.5 rounded-sm overflow-hidden"
      style={{ background: debt ? 'rgba(248, 113, 113, 0.18)' : 'rgba(148, 163, 184, 0.18)' }}
    >
      <span
        className="block h-full rounded-sm"
        style={{
          width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`,
          background: debt ? DEBT : SILVER,
          opacity: debt ? 0.75 : 1,
        }}
      />
    </span>
  </div>
);

export const NetWorthCard = () => {
  const [editOpen, setEditOpen] = useState(false);
  const snapshots = useFinanceStore((s) => s.finance.snapshots);
  const list = useMemo(() => snapshotList(snapshots), [snapshots]);
  const latest = list[list.length - 1];
  const previous = list.length >= 2 ? list[list.length - 2] : undefined;
  const latestNet = latest ? netWorth(latest) : null;
  const delta = latest && previous ? latestNet! - netWorth(previous) : null;
  const assetSum = latest ? latest.assets.reduce((sum, asset) => sum + asset.value, 0) : 0;
  const barMax = latest ? Math.max(latest.savings, assetSum, latest.debt, 1) : 1;

  return (
    <>
      <section className="worth-card p-5 sm:p-6 flex flex-col gap-[var(--space-md)]" aria-label="Net worth">
        <header className="flex items-center justify-between gap-[var(--space-sm)]">
          <h2 className="m-0 font-section text-sm uppercase tracking-widest text-slate-300">Net Worth</h2>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="px-3 py-1 rounded-lg border border-white/10 text-[10px] uppercase tracking-widest font-section text-white/70 hover:text-white"
          >
            Edit
          </button>
        </header>

        <div className="flex items-end gap-3 flex-wrap">
          <span className="font-data text-3xl font-bold text-white tabular-nums">
            {latestNet === null ? '—' : formatMoney(latestNet, { cents: false })}
          </span>
          {delta !== null && (
            <span
              className={`font-data text-sm tabular-nums pb-0.5 ${
                delta < 0 ? 'text-rose-300/80' : 'text-slate-200'
              }`}
            >
              {delta === 0 && '—'}
              {delta > 0 && `▲ ${formatMoney(delta, { cents: false })}`}
              {delta < 0 && `▼ ${formatMoney(Math.abs(delta), { cents: false })}`}
            </span>
          )}
        </div>

        {latest ? (
          <div className="grid grid-cols-3 gap-[var(--space-sm)]">
            <CompositionBar label="Savings" value={latest.savings} max={barMax} />
            <CompositionBar label="Assets" value={assetSum} max={barMax} />
            <CompositionBar label="Debt" value={latest.debt} max={barMax} debt />
          </div>
        ) : (
          <p className="m-0 text-sm text-white/45">No snapshot yet. Edit to log your position.</p>
        )}

        <div className="flex flex-col gap-1">
          <span className="font-section text-[10px] uppercase tracking-widest text-white/50">Assets</span>
          {!latest || latest.assets.length === 0 ? (
            <p className="m-0 text-sm text-white/45">—</p>
          ) : (
            <ul className="m-0 p-0 list-none flex flex-col gap-1">
              {latest.assets.map((asset) => (
                <li key={asset.id} className="flex items-center justify-between gap-2">
                  <span className="font-body text-sm text-white truncate">{asset.label}</span>
                  <span className="font-data text-sm text-slate-200 tabular-nums">
                    {formatMoney(asset.value, { cents: false })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <NetWorthEditModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
};

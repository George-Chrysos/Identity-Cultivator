import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { financeExpenseList, financeExtraList, useFinanceStore } from '@/store/financeStore';
import { formatMoney, netWorth, yearSnapshots, yearlyInsights } from '@/utils/money';
import { CATEGORY_CONFIG, CategoryIcon } from './financeConfig';
import type { NetWorthSnapshot } from '@/types/finance';

const MONTH_TICKS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WORTH_SILVER = '#94A3B8';

const dayOfYear = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor((Date.UTC(y, (m ?? 1) - 1, d ?? 1) - Date.UTC(y, 0, 0)) / 86400000);
};

const daysInYear = (year: number): number =>
  year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0) ? 366 : 365;

const NetWorthTrend = ({ year, snapshots }: { year: number; snapshots: NetWorthSnapshot[] }) => {
  if (snapshots.length === 0) {
    return (
      <p className="m-0 text-sm text-white/45">Save a snapshot on the Net Worth card.</p>
    );
  }

  const values = snapshots.map(netWorth);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const padY = minV === maxV ? Math.max(Math.abs(minV) * 0.15, 100) : (maxV - minV) * 0.12;
  const y0 = minV - padY;
  const y1 = maxV + padY;
  const span = y1 - y0 || 1;
  const yearLen = daysInYear(year);

  const vb = { w: 640, h: 180 };
  const pad = { l: 72, r: 12, t: 16, b: 28 };
  const innerW = vb.w - pad.l - pad.r;
  const innerH = vb.h - pad.t - pad.b;
  const xOf = (key: string) => pad.l + ((dayOfYear(key) - 1) / (yearLen - 1)) * innerW;
  const yOf = (v: number) => pad.t + (1 - (v - y0) / span) * innerH;

  const pts = snapshots.map((s) => ({ x: xOf(s.date), y: yOf(netWorth(s)) }));
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area =
    pts.length === 1
      ? ''
      : `M ${pts[0].x.toFixed(1)} ${(pad.t + innerH).toFixed(1)} L ${line} L ${pts[pts.length - 1].x.toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;
  const zeroY = y0 < 0 && y1 > 0 ? yOf(0) : null;
  const gid = `nw-fill-${year}`;

  return (
    <svg viewBox={`0 0 ${vb.w} ${vb.h}`} className="w-full h-auto" role="img" aria-label={`Net worth trend ${year}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={WORTH_SILVER} stopOpacity="0.35" />
          <stop offset="100%" stopColor={WORTH_SILVER} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line
        x1={pad.l}
        y1={pad.t}
        x2={pad.l}
        y2={pad.t + innerH}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <line
        x1={pad.l}
        y1={pad.t + innerH}
        x2={pad.l + innerW}
        y2={pad.t + innerH}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <text x={pad.l - 8} y={yOf(maxV) + 4} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize="11" fontFamily="inherit">
        {formatMoney(maxV, { cents: false })}
      </text>
      {minV !== maxV && (
        <text
          x={pad.l - 8}
          y={yOf(minV) + 4}
          textAnchor="end"
          fill="rgba(255,255,255,0.45)"
          fontSize="11"
          fontFamily="inherit"
        >
          {formatMoney(minV, { cents: false })}
        </text>
      )}
      {zeroY !== null && (
        <line
          x1={pad.l}
          y1={zeroY}
          x2={pad.l + innerW}
          y2={zeroY}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 4"
        />
      )}
      {MONTH_TICKS.map((label, i) => {
        const x = pad.l + ((i + 0.5) / 12) * innerW;
        return (
          <text
            key={label}
            x={x}
            y={vb.h - 6}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            fontFamily="inherit"
          >
            {label}
          </text>
        );
      })}
      {area && <path d={area} fill={`url(#${gid})`} />}
      {pts.length > 1 && (
        <polyline points={line} fill="none" stroke={WORTH_SILVER} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {pts.map((p, i) => (
        <circle key={snapshots[i].id} cx={p.x} cy={p.y} r="3.5" fill={WORTH_SILVER} />
      ))}
    </svg>
  );
};

export const YearlyInsights = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const expenses = useFinanceStore((s) => financeExpenseList(s.finance));
  const extras = useFinanceStore((s) => financeExtraList(s.finance));
  const base = useFinanceStore((s) => s.finance.incomeBase);
  const snapshots = useFinanceStore((s) => s.finance.snapshots);
  const data = useMemo(
    () => yearlyInsights(year, expenses, extras, base),
    [year, expenses, extras, base]
  );
  const worthPoints = useMemo(() => yearSnapshots(year, snapshots), [year, snapshots]);
  const maxAvg = Math.max(...data.perCategory.map((r) => r.avgPerMonth), 1);

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white"
          aria-label="Previous year"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="m-0 font-section text-sm uppercase tracking-widest">Yearly averages — {year}</h3>
        <button
          type="button"
          onClick={() => setYear((y) => y + 1)}
          disabled={year >= currentYear}
          className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white disabled:opacity-30"
          aria-label="Next year"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {data.insufficient && (
        <p className="m-0 text-sm text-white/45">
          Not enough months logged yet. Trends appear after two months of data.
        </p>
      )}

      <ul className="flex flex-col gap-[var(--space-sm)] m-0 p-0 list-none">
        {data.perCategory.map((row) => {
          const cfg = CATEGORY_CONFIG[row.category];
          const trend =
            row.trendPct === null
              ? 'flat'
              : Math.abs(row.trendPct) < 1
                ? 'flat'
                : row.trendPct > 0
                  ? 'up'
                  : 'down';
          return (
            <li key={row.category} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <CategoryIcon category={row.category} className="h-4 w-4 shrink-0" style={{ color: cfg.hex }} />
                <span className="flex-1 font-body text-sm text-white">{cfg.label}</span>
                <span className="font-data text-sm text-white">
                  avg {formatMoney(row.avgPerMonth, { cents: false })}/mo
                </span>
                <span
                  className={`font-data text-xs w-14 text-right ${
                    trend === 'up' ? 'text-rose-300' : trend === 'down' ? 'text-emerald-300' : 'text-white/40'
                  }`}
                >
                  {trend === 'flat' && '—'}
                  {trend === 'up' && `▲ +${Math.round(row.trendPct ?? 0)}%`}
                  {trend === 'down' && `▼ ${Math.round(row.trendPct ?? 0)}%`}
                </span>
              </div>
              <span
                className="h-1 rounded-sm"
                style={{
                  width: `${(row.avgPerMonth / maxAvg) * 100}%`,
                  background: cfg.hex,
                  minWidth: row.avgPerMonth > 0 ? 4 : 0,
                }}
              />
            </li>
          );
        })}
      </ul>

      <div className="border-t border-white/10 pt-[var(--space-sm)] flex flex-col gap-1">
        <p className="m-0 font-section text-[10px] uppercase tracking-widest text-white/50">
          Total avg/month {formatMoney(data.avgTotalPerMonth, { cents: false })}
        </p>
        <p className="m-0 font-data text-lg text-emerald-200">
          Avg savings/month {formatMoney(data.avgSavingsPerMonth, { cents: false })}
          {data.savingsPct !== null && (
            <span className="ml-2 text-sm text-white/50">({data.savingsPct.toFixed(1)}%)</span>
          )}
        </p>
      </div>

      <div className="border-t border-white/10 pt-[var(--space-md)] flex flex-col gap-[var(--space-sm)]">
        <h3 className="m-0 font-section text-sm uppercase tracking-widest text-slate-300">
          Net Worth — {year}
        </h3>
        <NetWorthTrend year={year} snapshots={worthPoints} />
      </div>
    </div>
  );
};

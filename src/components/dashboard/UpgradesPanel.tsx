import { useMemo, useState } from 'react';
import type { SectorId } from '@/types/dashboard';
import { useDashboardStore } from '@/store/dashboardStore';

const SECTOR_LABEL: Record<SectorId, string> = {
  finance: 'Finance',
  health: 'Health',
  career: 'Career',
  romantic: 'Romantic',
  growth: 'Growth',
  environment: 'Environment',
};

const dots = (count: number) =>
  Array.from({ length: 5 }, (_, i) => (i < count ? '●' : '○')).join('');

const tier = (roi: number) => {
  if (roi >= 1.5) return { label: 'Best ROI', tone: 'text-[#00f5d4]' };
  if (roi >= 1.0) return { label: 'Good ROI', tone: 'text-[#f9c74f]' };
  return { label: 'Low ROI', tone: 'text-slate-400' };
};

export const UpgradesPanel = () => {
  const upgrades = useDashboardStore((s) => s.dashboard.upgrades);
  const addUpgrade = useDashboardStore((s) => s.addUpgrade);
  const deleteUpgrade = useDashboardStore((s) => s.deleteUpgrade);

  const sorted = useMemo(() => {
    return [...upgrades].sort((a, b) => b.value / b.effort - a.value / a.effort);
  }, [upgrades]);

  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState('');
  const [effort, setEffort] = useState(3);
  const [value, setValue] = useState(3);
  const [sector, setSector] = useState<SectorId>('growth');

  return (
    <section className="hud-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title">
            Upgrades
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Auto-sorted by ROI = value ÷ effort.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="px-3 py-2 rounded-xl border border-cyan-400/25 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-100 text-xs uppercase tracking-[0.22em] font-title"
        >
          {expanded ? 'Close' : 'Add upgrade'}
        </button>
      </div>

      {expanded && (
        <form
          className="mt-4 grid grid-cols-1 md:grid-cols-[1fr,120px,120px,160px,auto] gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            addUpgrade({ name, effort, value, sector });
            setName('');
            setEffort(3);
            setValue(3);
            setSector('growth');
            setExpanded(false);
          }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-title mb-1">
              Name
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30"
              placeholder="Upgrade name…"
            />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-title mb-1">
              Effort
            </div>
            <input
              type="number"
              min={1}
              max={5}
              value={effort}
              onChange={(e) => setEffort(Number(e.target.value))}
              className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data"
            />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-title mb-1">
              Value
            </div>
            <input
              type="number"
              min={1}
              max={5}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data"
            />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-title mb-1">
              Sector
            </div>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorId)}
              className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30"
            >
              {Object.entries(SECTOR_LABEL).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#00f5d4]/15 border border-[#00f5d4]/30 text-[#00f5d4] text-xs uppercase tracking-[0.22em] font-title hover:bg-[#00f5d4]/20"
          >
            Save
          </button>
        </form>
      )}

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.map((u) => {
          const roi = u.value / u.effort;
          const t = tier(roi);
          return (
            <div
              key={u.id}
              className="rounded-2xl border border-white/10 bg-black/15 p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-white font-semibold truncate">{u.name}</div>
                  <span className={`text-[10px] uppercase tracking-[0.26em] font-title ${t.tone}`}>
                    {t.label}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <div className="font-data">
                    Effort <span className="text-slate-200">{dots(u.effort)}</span>
                  </div>
                  <div className="font-data">
                    Value <span className="text-slate-200">{dots(u.value)}</span>
                  </div>
                  <div className="text-slate-300">
                    Sector <span className="text-slate-100">{SECTOR_LABEL[u.sector]}</span>
                  </div>
                  <div className="font-data">
                    ROI <span className="text-slate-100">{roi.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteUpgrade(u.id)}
                className="text-[10px] uppercase tracking-[0.22em] text-slate-400 hover:text-white"
                aria-label="Delete upgrade"
              >
                Del
              </button>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-black/10 p-6 text-sm text-slate-400">
            No upgrades yet. Add one and it’ll auto-rank by ROI.
          </div>
        )}
      </div>
    </section>
  );
};


import { useDashboardStore } from '@/store/dashboardStore';

const LAYERS = ['muscle', 'tendon', 'pulse', 'subtle'] as const;
const RADII = [
  { id: 'self', label: 'Self' },
  { id: 'touch', label: 'Touch' },
  { id: 'nearField', label: 'Near field' },
] as const;

export const EnergySenseWidget = () => {
  const log = useDashboardStore((s) => s.getMysticDailyLog());
  const upsert = useDashboardStore((s) => s.upsertMysticDailyLog);
  const rewardLog = useDashboardStore((s) => s.rewardLog);

  return (
    <section className="hud-card p-4 border-purple-500/15">
      <div className="text-[11px] uppercase tracking-[0.28em] text-purple-200/80 font-title mb-2">
        Energy Sense
      </div>
      <div className="space-y-3">
        <div>
          <div className="text-[10px] text-slate-400 mb-1">Sensitivity (0–100)</div>
          <input
            type="range"
            min={0}
            max={100}
            value={log.energySense}
            onChange={(e) => {
              upsert({ energySense: Number(e.target.value) });
              rewardLog('Energy sense update', 'energySense');
            }}
            className="w-full accent-fuchsia-400"
          />
          <div className="font-data text-sm text-slate-100">{log.energySense}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 mb-1">Body layer</div>
          <div className="flex flex-wrap gap-2">
            {LAYERS.map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => {
                  upsert({ energyLayer: layer });
                  rewardLog('Energy layer update', 'energySense');
                }}
                className={`px-2 py-1 rounded-lg border text-xs uppercase tracking-[0.18em] ${
                  log.energyLayer === layer
                    ? 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200'
                    : 'border-white/10 text-slate-300'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 mb-1">Radius</div>
          <div className="flex gap-2">
            {RADII.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  upsert({ energyRadius: r.id });
                  rewardLog('Energy radius update', 'energySense');
                }}
                className={`px-2 py-1 rounded-lg border text-xs ${
                  log.energyRadius === r.id
                    ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
                    : 'border-white/10 text-slate-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


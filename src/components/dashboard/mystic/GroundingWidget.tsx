import { useDashboardStore } from '@/store/dashboardStore';

export const GroundingWidget = () => {
  const log = useDashboardStore((s) => s.getMysticDailyLog());
  const upsert = useDashboardStore((s) => s.upsertMysticDailyLog);
  const rewardLog = useDashboardStore((s) => s.rewardLog);

  return (
    <section className="hud-card p-4 border-cyan-500/15">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80 font-title mb-2">
        Grounding
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-slate-400 mb-1">Physical</div>
          <input
            type="number"
            min={0}
            max={100}
            value={log.groundingPhysical}
            onChange={(e) => {
              upsert({ groundingPhysical: Number(e.target.value) });
              rewardLog('Grounding physical update', 'grounding');
            }}
            className="w-full rounded-lg bg-transparent border border-white/10 px-2 py-1 font-data"
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-400 mb-1">Psychological</div>
          <input
            type="number"
            min={0}
            max={100}
            value={log.groundingPsychological}
            onChange={(e) => {
              upsert({ groundingPsychological: Number(e.target.value) });
              rewardLog('Grounding psychological update', 'grounding');
            }}
            className="w-full rounded-lg bg-transparent border border-white/10 px-2 py-1 font-data"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          upsert({ weightDropped: !log.weightDropped });
          rewardLog('Grounding weight drop toggle', 'grounding');
        }}
        className={`mt-3 px-3 py-2 rounded-lg border text-xs uppercase tracking-[0.2em] ${
          log.weightDropped
            ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
            : 'border-white/10 text-slate-300'
        }`}
      >
        Weight dropped
      </button>
    </section>
  );
};


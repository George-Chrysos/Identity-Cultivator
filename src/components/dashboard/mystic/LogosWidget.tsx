import { useDashboardStore } from '@/store/dashboardStore';

export const LogosWidget = () => {
  const log = useDashboardStore((s) => s.getMysticDailyLog());
  const upsert = useDashboardStore((s) => s.upsertMysticDailyLog);
  const rewardLog = useDashboardStore((s) => s.rewardLog);

  const derivedIntegrity =
    log.logosSet > 0 ? Math.round((Math.min(log.logosDone, log.logosSet) / log.logosSet) * 100) : 0;

  return (
    <section className="hud-card p-4 border-amber-500/20">
      <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/80 font-title mb-2">
        Logos
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] text-slate-400 mb-1">Set</div>
          <input
            type="number"
            min={0}
            max={20}
            value={log.logosSet}
            onChange={(e) => {
              upsert({ logosSet: Number(e.target.value) });
              rewardLog('Logos set update', 'logos');
            }}
            className="w-full rounded-lg bg-transparent border border-white/10 px-2 py-1 font-data"
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-400 mb-1">Done</div>
          <input
            type="number"
            min={0}
            max={20}
            value={log.logosDone}
            onChange={(e) => {
              upsert({ logosDone: Number(e.target.value) });
              rewardLog('Logos done update', 'logos');
            }}
            className="w-full rounded-lg bg-transparent border border-white/10 px-2 py-1 font-data"
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-400 mb-1">Integrity</div>
          <div className="rounded-lg border border-white/10 px-2 py-1 font-data text-slate-100">
            {derivedIntegrity}%
          </div>
        </div>
      </div>
    </section>
  );
};


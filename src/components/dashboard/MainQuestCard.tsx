import { InlineEditableText } from './InlineEditableText';
import { useDashboardStore } from '@/store/dashboardStore';

export const MainQuestCard = () => {
  const mainQuest = useDashboardStore((s) => s.dashboard.mainQuest);
  const setMainQuest = useDashboardStore((s) => s.setMainQuest);

  return (
    <section className="hud-card hud-pulse hud-pulse--cyan p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
          <span className="text-xl leading-none">⚡</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/70 font-title">
            Main Quest <span className="text-slate-500">— Your focus right now.</span>
          </div>
          <div className="mt-2">
            <InlineEditableText
              value={mainQuest}
              placeholder="What do you do right now?"
              className="block w-full text-left text-lg md:text-xl text-white leading-snug"
              inputClassName="w-full bg-transparent border-b border-cyan-400/40 focus:outline-none text-lg md:text-xl text-white"
              onCommit={(next) => setMainQuest(next || '')}
            />
          </div>
        </div>
      </div>
    </section>
  );
};


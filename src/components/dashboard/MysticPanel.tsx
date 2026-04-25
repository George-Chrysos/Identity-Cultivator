import { useDashboardStore } from '@/store/dashboardStore';
import { MysticLifeSectorsPanel } from './MysticLifeSectorsPanel';
import { InlineEditableText } from './InlineEditableText';
import { InlineEditableTextarea } from './InlineEditableTextarea';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const TarotMonthBlock = ({
  title,
  which,
}: {
  title: string;
  which: 'themeOfMonth' | 'dangerOfMonth';
}) => {
  const pair = useDashboardStore((s) => s.dashboard.mystic[which]);
  const setMysticTarot = useDashboardStore((s) => s.setMysticTarot);

  return (
    <section className="hud-card p-4 border-purple-500/15">
      <div className="text-[11px] uppercase tracking-[0.28em] text-purple-200/80 font-title mb-3">{title}</div>
      <div className="space-y-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500 mb-1">Card I</div>
          <InlineEditableText
            value={pair.cardA}
            placeholder="Major / name…"
            className="block w-full text-left text-sm text-slate-100"
            inputClassName="w-full bg-transparent border-b border-purple-400/35 focus:outline-none text-sm text-slate-100"
            onCommit={(cardA) => setMysticTarot(which, { ...pair, cardA })}
          />
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500 mb-1">Card II (optional)</div>
          <InlineEditableText
            value={pair.cardB}
            placeholder="Second card…"
            className="block w-full text-left text-sm text-slate-300"
            inputClassName="w-full bg-transparent border-b border-purple-400/25 focus:outline-none text-sm text-slate-200"
            onCommit={(cardB) => setMysticTarot(which, { ...pair, cardB })}
          />
        </div>
      </div>
    </section>
  );
};

export const MysticPanel = () => {
  const journey = useDashboardStore((s) => s.dashboard.mystic.weeksJourney);
  const notes = useDashboardStore((s) => s.dashboard.mystic.notesOfTheDay);
  const setMysticWeekDay = useDashboardStore((s) => s.setMysticWeekDay);
  const setMysticNotesOfTheDay = useDashboardStore((s) => s.setMysticNotesOfTheDay);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[210px,1fr] gap-4 items-start">
        <MysticLifeSectorsPanel />

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TarotMonthBlock title="Theme of the month" which="themeOfMonth" />
            <TarotMonthBlock title="Danger of the month" which="dangerOfMonth" />
          </div>

          <section className="hud-card p-4 border-purple-500/15">
            <div className="text-[11px] uppercase tracking-[0.28em] text-purple-200/80 font-title mb-3">
              Week&apos;s journey — 7 draws
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
              {DAY_LABELS.map((label, i) => {
                const row = journey[i] ?? { name: '', meaning: '' };
                return (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-black/20 p-2 min-h-[120px] flex flex-col gap-2"
                  >
                    <div className="text-[9px] uppercase tracking-[0.22em] text-purple-300/90 font-title">
                      {label}
                    </div>
                    <InlineEditableText
                      value={row.name}
                      placeholder="Card name"
                      className="block w-full text-left text-xs text-slate-100 font-title tracking-wide"
                      inputClassName="w-full bg-transparent border-b border-purple-400/30 focus:outline-none text-xs text-slate-100"
                      onCommit={(name) => setMysticWeekDay(i, { name })}
                    />
                    <InlineEditableText
                      value={row.meaning}
                      placeholder="Meaning"
                      className="block w-full text-left text-[11px] text-slate-400 leading-snug"
                      inputClassName="w-full bg-transparent border-b border-white/10 focus:outline-none text-[11px] text-slate-300"
                      onCommit={(meaning) => setMysticWeekDay(i, { meaning })}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="hud-card p-4 border-purple-500/15">
            <div className="text-[11px] uppercase tracking-[0.28em] text-purple-200/80 font-title mb-2">
              Notes of the day
            </div>
            <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
              At day&apos;s end — what you learned about yourself and life (mystical / spiritual).
            </p>
            <InlineEditableTextarea
              value={notes}
              placeholder="Write tonight’s reflection…"
              rows={6}
              className="min-h-[120px] rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-slate-200"
              inputClassName="w-full min-h-[140px] rounded-xl border border-purple-400/25 bg-black/25 p-3 text-sm text-slate-100 focus:outline-none focus:border-purple-400/45 resize-y"
              onCommit={setMysticNotesOfTheDay}
            />
          </section>
        </div>
      </div>
    </>
  );
};

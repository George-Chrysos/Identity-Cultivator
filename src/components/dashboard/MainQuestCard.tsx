import { useDashboardStore } from '@/store/dashboardStore';
import { useState } from 'react';
import type { CenterKey, SectorTag } from '@/types/dashboard';

const SECTORS_BY_CENTER: Record<CenterKey, SectorTag[]> = {
  sovereign: ['finance', 'selfCare', 'home', 'motorcycle'],
  mystic: ['energySense', 'grounding', 'logos', 'gratitude', 'focus'],
  trickster: ['chaos', 'play', 'social'],
};

export const MainQuestCard = () => {
  const dashboard = useDashboardStore((s) => s.dashboard);
  const activeCenter = dashboard.activeCenter;
  const mainQuests = dashboard.mainQuests;
  const addMainQuest = useDashboardStore((s) => s.addMainQuest);
  const updateMainQuestText = useDashboardStore((s) => s.updateMainQuestText);
  const completeMainQuest = useDashboardStore((s) => s.completeMainQuest);
  const undoMainQuestCompletion = useDashboardStore((s) => s.undoMainQuestCompletion);
  const today = new Date().toISOString().slice(0, 10);
  const completedToday = mainQuests.some((q) => q.completedDate === today);
  const unlockedSlots =
    1 + ((dashboard.identity.totalXp ?? 0) >= 10 ? 1 : 0) + ((dashboard.identity.totalXp ?? 0) >= 20 ? 1 : 0);
  const [draft, setDraft] = useState('');
  const sectorsInCenter = SECTORS_BY_CENTER[activeCenter];
  const usedSectors = new Set(mainQuests.map((q) => q.sectorTag));
  const selectableSectors = sectorsInCenter.filter((s) => !usedSectors.has(s));
  const [sectorTag, setSectorTag] = useState<SectorTag>(selectableSectors[0] ?? sectorsInCenter[0]);

  return (
    <section className="hud-card hud-pulse hud-pulse--cyan p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
          <span className="text-xl leading-none">⚡</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/70 font-title">
            Main Quest
          </div>
          <div className="mt-3 space-y-2">
            {mainQuests.map((quest) => (
              <div key={quest.id} className="rounded-xl border border-white/10 bg-black/20 p-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">{quest.sectorTag}</div>
                <input
                  value={quest.text}
                  onChange={(e) => updateMainQuestText(quest.id, e.target.value)}
                  className="mt-1 w-full bg-transparent border-b border-cyan-400/30 text-sm text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    quest.completedDate === today
                      ? undoMainQuestCompletion(quest.id)
                      : completeMainQuest(quest.id)
                  }
                  className="mt-2 px-2 py-1 rounded-lg border border-cyan-400/45 bg-cyan-500/10 text-cyan-200 text-[10px] uppercase tracking-[0.2em]"
                  disabled={quest.completedDate !== today && completedToday}
                >
                  {quest.completedDate === today ? 'Undo today' : 'Complete'}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={sectorTag}
              onChange={(e) => setSectorTag(e.target.value as SectorTag)}
              className="rounded-lg bg-black/20 border border-white/10 px-2 py-1 text-xs text-slate-200"
              disabled={mainQuests.length >= 3 || selectableSectors.length === 0}
            >
              {selectableSectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="New main quest..."
              className="flex-1 min-w-0 rounded-lg bg-black/20 border border-white/10 px-2 py-1 text-xs text-slate-100"
            />
            <button
              type="button"
              onClick={() => {
                addMainQuest(sectorTag, draft);
                setDraft('');
              }}
              className="px-3 py-1.5 rounded-lg border border-cyan-400/45 bg-cyan-500/10 text-cyan-200 text-xs uppercase tracking-[0.2em]"
              disabled={mainQuests.length >= unlockedSlots || selectableSectors.length === 0 || !draft.trim()}
            >
              Add Main Quest
            </button>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            Slots unlocked: {unlockedSlots}/3 (unlock at XP 10 and XP 20)
          </div>
        </div>
      </div>
    </section>
  );
};


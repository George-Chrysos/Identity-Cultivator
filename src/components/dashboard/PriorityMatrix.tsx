import { useMemo, useState } from 'react';
import { Trash2, Check } from 'lucide-react';
import type { QuadrantKey, SectorTag } from '@/types/dashboard';
import { useDashboardStore } from '@/store/dashboardStore';

const QUADRANTS: Array<{
  key: QuadrantKey;
  title: string;
  subtitle: string;
  accent: string;
  border: string;
}> = [
  {
    key: 'doNow',
    title: 'Do now',
    subtitle: 'Urgent + Important',
    accent: 'text-[#f72585]',
    border: 'border-[#f72585]/30',
  },
  {
    key: 'schedule',
    title: 'Schedule',
    subtitle: 'Important, not urgent',
    accent: 'text-[#f9c74f]',
    border: 'border-[#f9c74f]/25',
  },
  {
    key: 'delegate',
    title: 'Delegate',
    subtitle: 'Urgent, not important',
    accent: 'text-sky-300',
    border: 'border-sky-400/20',
  },
  {
    key: 'eliminate',
    title: 'Eliminate',
    subtitle: 'Neither',
    accent: 'text-slate-300',
    border: 'border-white/10',
  },
];

const quadrantLabel = (q: QuadrantKey) => QUADRANTS.find((x) => x.key === q)?.title ?? q;
const SECTOR_OPTIONS: SectorTag[] = [
  'finance',
  'selfCare',
  'home',
  'motorcycle',
  'energySense',
  'grounding',
  'logos',
  'gratitude',
  'focus',
  'chaos',
  'play',
  'social',
];

export const PriorityMatrix = () => {
  const tasks = useDashboardStore((s) => s.dashboard.tasks);
  const addTask = useDashboardStore((s) => s.addTask);
  const toggleTaskDone = useDashboardStore((s) => s.toggleTaskDone);
  const deleteTask = useDashboardStore((s) => s.deleteTask);
  const moveTask = useDashboardStore((s) => s.moveTask);
  const setTaskSector = useDashboardStore((s) => s.setTaskSector);
  const completeDashboardTask = useDashboardStore((s) => s.completeDashboardTask);

  const grouped = useMemo(() => {
    const map: Record<QuadrantKey, typeof tasks> = {
      doNow: [],
      schedule: [],
      delegate: [],
      eliminate: [],
    };
    for (const t of tasks) map[t.quadrant].push(t);
    return map;
  }, [tasks]);

  return (
    <section className="hud-card p-4">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title">
            Priority Matrix
          </div>
          <div className="text-xs text-slate-400 mt-1">
            The quadrant a task lives in is the strategic decision.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {QUADRANTS.map((q) => (
          <Quadrant
            key={q.key}
            title={q.title}
            subtitle={q.subtitle}
            accent={q.accent}
            border={q.border}
            tasks={grouped[q.key]}
            onAdd={(text) => addTask(q.key, text)}
            onToggle={toggleTaskDone}
            onDelete={deleteTask}
            onMove={moveTask}
            onSetSector={setTaskSector}
            onCompleteWithSector={completeDashboardTask}
          />
        ))}
      </div>
    </section>
  );
};

const Quadrant = ({
  title,
  subtitle,
  accent,
  border,
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onMove,
  onSetSector,
  onCompleteWithSector,
}: {
  title: string;
  subtitle: string;
  accent: string;
  border: string;
  tasks: Array<{ id: string; text: string; done: boolean; quadrant: QuadrantKey; sectorTag?: SectorTag }>;
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, quadrant: QuadrantKey) => void;
  onSetSector: (id: string, sectorTag: SectorTag) => void;
  onCompleteWithSector: (id: string, sectorTag: SectorTag) => void;
}) => {
  const [draft, setDraft] = useState('');

  return (
    <div className={`rounded-2xl border ${border} bg-black/20 p-3 min-h-[220px] flex flex-col`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className={`font-title text-xs uppercase tracking-[0.3em] ${accent}`}>{title}</div>
          <div className="text-[10px] text-slate-400 mt-1">{subtitle}</div>
        </div>
        <div className="text-[10px] text-slate-500 font-data">{tasks.length}</div>
      </div>

      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          const text = draft.trim();
          if (!text) return;
          onAdd(text);
          setDraft('');
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add task…"
          className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400/30"
        />
      </form>

      <div className="mt-3 space-y-2 flex-1 overflow-auto pr-1">
        {tasks.map((t) => (
          <div
            key={t.id}
            className={`group flex items-start gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 transition-opacity ${
              t.done ? 'opacity-45' : 'opacity-100'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (t.done) onToggle(t.id);
                else onCompleteWithSector(t.id, t.sectorTag ?? 'selfCare');
              }}
              className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                t.done
                  ? 'bg-cyan-400/20 border-cyan-400/50'
                  : 'bg-transparent border-white/20 hover:border-white/35'
              }`}
              aria-label={t.done ? 'Mark as not done' : 'Mark as done'}
            >
              {t.done && <Check className="w-3.5 h-3.5 text-cyan-200" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className={`text-sm text-slate-100 break-words ${t.done ? 'line-through' : ''}`}>
                {t.text}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="uppercase tracking-[0.22em]">{quadrantLabel(t.quadrant)}</span>
                <span className="opacity-40">•</span>
                <select
                  value={t.sectorTag ?? 'selfCare'}
                  onChange={(e) => onSetSector(t.id, e.target.value as SectorTag)}
                  className="bg-transparent border border-white/10 rounded-lg px-2 py-1 focus:outline-none"
                >
                  {SECTOR_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="opacity-40">•</span>
                <select
                  value={t.quadrant}
                  onChange={(e) => onMove(t.id, e.target.value as QuadrantKey)}
                  className="bg-transparent border border-white/10 rounded-lg px-2 py-1 focus:outline-none"
                >
                  {QUADRANTS.map((q) => (
                    <option key={q.key} value={q.key}>
                      {q.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDelete(t.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-white"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


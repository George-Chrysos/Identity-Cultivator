import { useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { GratitudeCategory } from '@/types/dashboard';
import { Trash2 } from 'lucide-react';

const CATEGORIES: GratitudeCategory[] = ['self', 'people', 'nature', 'work', 'other'];

export const GratitudeWidget = () => {
  const log = useDashboardStore((s) => s.getMysticDailyLog());
  const addItem = useDashboardStore((s) => s.addMysticGratitudeItem);
  const removeItem = useDashboardStore((s) => s.removeMysticGratitudeItem);
  const rewardLog = useDashboardStore((s) => s.rewardLog);

  const [text, setText] = useState('');
  const [category, setCategory] = useState<GratitudeCategory>('other');

  return (
    <section className="hud-card p-4 border-pink-500/20">
      <div className="text-[11px] uppercase tracking-[0.28em] text-pink-200/80 font-title mb-2">
        Gratitude
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const trimmed = text.trim();
              if (!trimmed) return;
              addItem(trimmed, category);
              rewardLog('Gratitude entry', 'gratitude');
              setText('');
            }
          }}
          placeholder="I am grateful for..."
          className="flex-1 rounded-lg bg-transparent border border-white/10 px-2 py-1 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as GratitudeCategory)}
          className="rounded-lg bg-transparent border border-white/10 px-2 py-1 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            const trimmed = text.trim();
            if (!trimmed) return;
            addItem(trimmed, category);
            rewardLog('Gratitude entry', 'gratitude');
            setText('');
          }}
          className="px-3 py-1 rounded-lg border border-pink-400/40 bg-pink-400/10 text-pink-200 text-xs uppercase tracking-[0.2em]"
        >
          Add
        </button>
      </div>

      <div className="mt-3 space-y-2 max-h-40 overflow-auto">
        {log.gratitudeItems.map((g) => (
          <div key={g.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2 py-1">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{g.category}</span>
            <span className="text-sm text-slate-100 flex-1">{g.text}</span>
            <button
              type="button"
              onClick={() => {
                removeItem(g.id);
                rewardLog('Gratitude cleanup', 'gratitude');
              }}
              className="text-slate-300 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {log.gratitudeItems.length === 0 && (
          <div className="text-xs text-slate-400">No gratitude entries yet today.</div>
        )}
      </div>
    </section>
  );
};


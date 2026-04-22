/**
 * RuneGrid — 3x4 constellation of Runes grouped by category.
 *
 * Pure, controlled component. Parent owns the selected set and the cap.
 * We render three rows (action / state / mercy) so categories stay
 * visually distinct without requiring a separate legend.
 *
 * Icons are dynamically resolved from lucide-react. We resolve once on
 * mount into a local map so we don't re-import per render.
 */
import { memo, useCallback, useMemo } from 'react';
import * as Lucide from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RUNES_BY_CATEGORY } from '@/constants/runes';
import type { Rune, RuneCategory } from '@/types/database';

interface RuneGridProps {
  selectedRuneIds: readonly string[];
  onToggle: (runeId: string) => void;
  /** Max runes the parent accepts in a single commit. Defaults to 3. */
  maxSelectable?: number;
  /** Optional heading override. */
  label?: string;
}

const CATEGORY_ORDER: readonly RuneCategory[] = ['action', 'state', 'mercy'];

const CATEGORY_LABEL: Record<RuneCategory, string> = {
  action: 'Acts',
  state:  'State',
  mercy:  'Mercy',
};

const CATEGORY_TINT: Record<RuneCategory, { text: string; border: string; glow: string }> = {
  action: { text: 'text-cyan-300',   border: 'border-cyan-400/50',   glow: 'rgba(34,211,238,0.45)' },
  state:  { text: 'text-violet-300', border: 'border-violet-400/50', glow: 'rgba(168,85,247,0.45)' },
  mercy:  { text: 'text-amber-300',  border: 'border-amber-400/50',  glow: 'rgba(250,204,21,0.4)'  },
};

/**
 * Look up a Lucide icon by string name, falling back to Circle so a typo
 * in a rune definition never crashes the grid at runtime.
 */
const getIcon = (iconName: string): LucideIcon => {
  const candidate = (Lucide as unknown as Record<string, LucideIcon>)[iconName];
  return candidate ?? Lucide.Circle;
};

interface RuneButtonProps {
  rune: Rune;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (id: string) => void;
}

const RuneButton = memo(({ rune, isSelected, isDisabled, onToggle }: RuneButtonProps) => {
  const Icon = getIcon(rune.iconName);
  const tint = CATEGORY_TINT[rune.category];
  const handleClick = useCallback(() => {
    onToggle(rune.id);
  }, [rune.id, onToggle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled && !isSelected}
      aria-pressed={isSelected}
      className={[
        'relative flex flex-col items-center justify-center gap-1 rounded-xl',
        'px-2 py-3 min-h-[72px] transition-all',
        'border backdrop-blur-sm',
        isSelected
          ? `${tint.border} bg-slate-900/80 ${tint.text}`
          : isDisabled
          ? 'border-slate-800/60 bg-slate-900/30 text-slate-600 opacity-40 cursor-not-allowed'
          : 'border-slate-700/60 bg-slate-900/40 text-slate-300 hover:border-slate-500/70 hover:bg-slate-900/70',
      ].join(' ')}
      style={isSelected ? { boxShadow: `0 0 12px ${tint.glow}` } : undefined}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[11px] font-mono tracking-wider uppercase leading-none">
        {rune.label}
      </span>
    </button>
  );
});
RuneButton.displayName = 'RuneButton';

const RuneGrid = memo(({
  selectedRuneIds,
  onToggle,
  maxSelectable = 3,
  label,
}: RuneGridProps) => {
  const selectedSet = useMemo(() => new Set(selectedRuneIds), [selectedRuneIds]);
  const atCap = selectedSet.size >= maxSelectable;

  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono tracking-[0.16em] uppercase text-slate-400">
            {label}
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            {selectedSet.size} / {maxSelectable}
          </p>
        </div>
      )}

      {CATEGORY_ORDER.map((cat) => (
        <div key={cat} className="space-y-2">
          <p className={`text-[10px] font-mono tracking-[0.2em] uppercase ${CATEGORY_TINT[cat].text}`}>
            {CATEGORY_LABEL[cat]}
          </p>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {RUNES_BY_CATEGORY[cat].map((rune) => (
              <RuneButton
                key={rune.id}
                rune={rune}
                isSelected={selectedSet.has(rune.id)}
                isDisabled={atCap}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

RuneGrid.displayName = 'RuneGrid';

export default RuneGrid;

/**
 * SeedMedallion — a single Seed of the Trinity.
 *
 * Visualizes one axis (body / mind / soul) with:
 * - glyph: axis-typed icon
 * - name: axis label
 * - XP ring: thin SVG progress ring indicating current level progress
 * - state class: idle / active drives CSS-level animation in index.css
 *
 * Tapping the medallion fires onSelect; the parent decides whether that
 * activates this axis, opens an empty-Seed planter, etc.
 *
 * Performance: the XP ring is a single SVG with a single path — no
 * per-frame JS animation. Active state pulses via CSS transform only.
 */
import { memo, useCallback } from 'react';
import { Dumbbell, Brain, Sparkles } from 'lucide-react';
import type { SeedAxis } from '@/types/database';

interface SeedMedallionProps {
  axis: SeedAxis;
  /** Level of the identity bound to this Seed (0 when empty). */
  level: number;
  /** Current XP within this level (0 when empty). */
  currentXP: number;
  /** XP needed to reach the next level (1 when empty, to avoid div-by-zero). */
  xpToNextLevel: number;
  /** True when this is the selected Seed of the Trinity. */
  isActive: boolean;
  /** True when no identity is bound to this Seed yet. */
  isEmpty: boolean;
  onSelect: (axis: SeedAxis) => void;
}

const AXIS_META: Record<SeedAxis, { label: string; Icon: typeof Dumbbell; tint: string }> = {
  body: { label: 'BODY',  Icon: Dumbbell, tint: 'rgb(244, 114, 182)' }, // pink-400
  mind: { label: 'MIND',  Icon: Brain,    tint: 'rgb(34, 211, 238)'  }, // cyan-400
  soul: { label: 'SOUL',  Icon: Sparkles, tint: 'rgb(168, 85, 247)'  }, // violet-500
};

/** SVG circumference of a circle with r=26 (the ring radius used below). */
const RING_CIRCUMFERENCE = 2 * Math.PI * 26;

const SeedMedallion = memo(({
  axis,
  level,
  currentXP,
  xpToNextLevel,
  isActive,
  isEmpty,
  onSelect,
}: SeedMedallionProps) => {
  const { label, Icon, tint } = AXIS_META[axis];

  const handleClick = useCallback(() => {
    onSelect(axis);
  }, [axis, onSelect]);

  const safeTotal = Math.max(1, xpToNextLevel);
  const progress = Math.max(0, Math.min(1, currentXP / safeTotal));
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      aria-label={`${label} Seed${isEmpty ? ' (empty)' : `, level ${level}`}`}
      className={[
        'seed-medallion',
        'relative flex flex-col items-center justify-center gap-1 rounded-full',
        'w-14 h-14 sm:w-[72px] sm:h-[72px]',
        'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        isActive ? 'seed-medallion--active' : 'seed-medallion--idle',
      ].join(' ')}
      style={{
        ['--seed-tint' as string]: tint,
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 60 60"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx="30"
          cy="30"
          r="26"
          fill="rgba(15, 7, 40, 0.65)"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="2"
        />
        {/* XP progress arc */}
        {!isEmpty && (
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke={tint}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 30 30)"
            style={{ transition: 'stroke-dashoffset 600ms var(--grim-easing-ritual)' }}
          />
        )}
      </svg>

      <Icon
        className="relative z-10 w-[18px] h-[18px] sm:w-6 sm:h-6"
        style={{
          color: isEmpty ? 'rgba(203, 213, 225, 0.55)' : tint,
          filter: isActive ? `drop-shadow(0 0 6px ${tint})` : undefined,
        }}
      />

      <span
        className="relative z-10 font-mono text-[9px] sm:text-[10px] tracking-[0.18em] leading-none"
        style={{ color: isEmpty ? 'rgba(203, 213, 225, 0.55)' : 'rgba(233, 213, 255, 0.92)' }}
      >
        {isEmpty ? '—' : `L${level}`}
      </span>

      <span className="sr-only">{label}</span>
    </button>
  );
});

SeedMedallion.displayName = 'SeedMedallion';

export default SeedMedallion;

import { useEffect, useId, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { formatMetricAvg } from '@/utils/metrics';
import { HUD_RING, RING_EMPTY_OPACITY, pipFill } from './ringGeometry';

interface StatRingProps {
  label: string;
  Icon: LucideIcon;
  value: number | null;
  stroke: string;
  textClass: string;
}

const { size: SIZE, center: CENTER, radius: RADIUS, stroke: STROKE, pipPaths: PIP_PATHS, ticks: TICKS } =
  HUD_RING;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animateValue = (from: number, to: number, ms: number, onFrame: (n: number) => void) => {
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - (1 - t) * (1 - t);
    onFrame(Math.round((from + (to - from) * eased) * 10) / 10);
    if (t < 1) raf = window.requestAnimationFrame(tick);
  };
  raf = window.requestAnimationFrame(tick);
  return () => window.cancelAnimationFrame(raf);
};

export const StatRing = ({ label, Icon, value, stroke, textClass }: StatRingProps) => {
  const maskPrefix = useId().replace(/:/g, '');
  const [shown, setShown] = useState<number | null>(value === null ? null : 0);
  const [pulse, setPulse] = useState(false);
  const [ripple, setRipple] = useState(false);
  const prevRef = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    const reduce = prefersReducedMotion();
    const nextN = value ?? 0;

    if (reduce) {
      setShown(value);
      return;
    }

    if (prev === undefined) {
      if (value === null) {
        setShown(null);
        return;
      }
      setShown(0);
      return animateValue(0, value, 700, setShown);
    }

    const increased = typeof prev === 'number' && typeof value === 'number' && value > prev;

    if (increased) {
      setPulse(true);
      setRipple(true);
      const stop = animateValue(prev, value, 400, setShown);
      const id = window.setTimeout(() => {
        setPulse(false);
        setRipple(false);
      }, 700);
      return () => {
        stop();
        window.clearTimeout(id);
      };
    }

    if (typeof prev !== 'number' && typeof value === 'number') {
      setShown(0);
      return animateValue(0, value, 700, setShown);
    }

    if (value === null) {
      setShown(null);
      return;
    }

    setShown(nextN);
  }, [value]);

  const display = shown === null ? null : formatMetricAvg(shown);
  const decimal = display !== null && display.includes('.');

  return (
    <div className={`stat-orb-body relative flex flex-col items-center gap-1.5 ${pulse ? 'stat-orb-pulse' : ''}`}>
      <div className="relative w-[5.5rem] h-[5.5rem] sm:w-[8.25rem] sm:h-[8.25rem] overflow-visible">
        {ripple && (
          <span
            className="stat-orb-ripple pointer-events-none absolute inset-0 rounded-full"
            style={{ border: `2px solid ${stroke}` }}
          />
        )}
        <div
          className="absolute inset-[18%] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(6,6,16,0.88) 38%, ${stroke}22 100%)`,
          }}
        />
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative z-[1] block w-full h-full overflow-visible" aria-hidden>
          <defs>
            {PIP_PATHS.map((d, i) => (
              <mask key={i} id={`${maskPrefix}-half-${i}`} maskUnits="userSpaceOnUse">
                <path
                  d={d}
                  fill="none"
                  stroke="white"
                  strokeWidth={STROKE}
                  strokeLinecap="butt"
                  pathLength={1}
                  strokeDasharray="0.5 1"
                />
              </mask>
            ))}
          </defs>
          <circle
            className="ring-track"
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={stroke}
            strokeWidth={6}
            opacity={0.07}
          />
          {PIP_PATHS.map((d, i) => {
            const fill = pipFill(i, shown);
            const halfMask = fill === 'half' ? `url(#${maskPrefix}-half-${i})` : undefined;
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeOpacity={RING_EMPTY_OPACITY}
                  strokeWidth={STROKE}
                  strokeLinecap="butt"
                />
                {fill !== 'empty' && (
                  <>
                    <path
                      className="segment-glow"
                      d={d}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={6}
                      strokeLinecap="butt"
                      mask={halfMask}
                    />
                    <path
                      className="stat-pip"
                      d={d}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={STROKE}
                      strokeLinecap="butt"
                      mask={halfMask}
                    />
                  </>
                )}
              </g>
            );
          })}
          {TICKS.map((tick, i) => (
            <line
              key={`tick-${i}`}
              className="ring-tick"
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={stroke}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.35}
            />
          ))}
        </svg>
        <Icon className={`absolute inset-0 z-[1] m-auto h-7 w-7 sm:h-8 sm:w-8 ${textClass}`} strokeWidth={1.5} />
      </div>
      <span className={`stat-value font-data leading-none text-white ${decimal ? 'stat-value-decimal' : ''}`}>
        {display === null ? (
          <span className="text-2xl sm:text-[2rem] font-bold">—</span>
        ) : (
          <>
            <span className="text-2xl sm:text-[2rem] font-bold">{display}</span>
            <span className="stat-denominator font-data">/5</span>
          </>
        )}
      </span>
      <span className={`font-section text-[11px] uppercase tracking-[0.2em] ${textClass}`}>{label}</span>
    </div>
  );
};

import { useId } from 'react';
import { MINI_RING, RING_EMPTY_OPACITY, pipFill } from './ringGeometry';

interface MiniStatRingProps {
  value: number | null;
  stroke: string;
  layout?: typeof MINI_RING;
}

export const MiniStatRing = ({ value, stroke, layout = MINI_RING }: MiniStatRingProps) => {
  const maskPrefix = useId().replace(/:/g, '');
  const { size, center, radius, stroke: sw, pipPaths, ticks } = layout;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 overflow-visible"
      aria-hidden
    >
      <defs>
        {pipPaths.map((d, i) => (
          <mask key={i} id={`${maskPrefix}-half-${i}`} maskUnits="userSpaceOnUse">
            <path
              d={d}
              fill="none"
              stroke="white"
              strokeWidth={sw}
              strokeLinecap="butt"
              pathLength={1}
              strokeDasharray="0.5 1"
            />
          </mask>
        ))}
      </defs>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        opacity={0.07}
      />
      {pipPaths.map((d, i) => {
        const fill = pipFill(i, value);
        const halfMask = fill === 'half' ? `url(#${maskPrefix}-half-${i})` : undefined;
        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke={stroke}
              strokeOpacity={RING_EMPTY_OPACITY}
              strokeWidth={sw}
              strokeLinecap="butt"
            />
            {fill !== 'empty' && (
              <path
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={sw}
                strokeLinecap="butt"
                mask={halfMask}
              />
            )}
          </g>
        );
      })}
      {ticks.map((tick, i) => (
        <line
          key={i}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke={stroke}
          strokeWidth={1}
          strokeLinecap="round"
          opacity={0.35}
        />
      ))}
    </svg>
  );
};

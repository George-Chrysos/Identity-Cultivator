interface PulseRingProps {
  percent: number | null;
  stroke: string;
}

export const PulseRing = ({ percent, stroke }: PulseRingProps) => {
  const size = 96;
  const radius = 36;
  const sw = 8;
  const center = size / 2;
  const circ = 2 * Math.PI * radius;
  const pct = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const filled = percent !== null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" aria-hidden>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        opacity={0.12}
      />
      {filled && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          style={{ filter: `drop-shadow(0 0 6px ${stroke})` }}
        />
      )}
    </svg>
  );
};

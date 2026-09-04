export const RING_SEGMENTS = 5;
export const RING_GAP_DEGREES = 14;
export const RING_START_OFFSET = -90;
export const RING_EMPTY_OPACITY = 0.12;
export const RING_SEGMENT_DEGREES = (360 - RING_SEGMENTS * RING_GAP_DEGREES) / RING_SEGMENTS;

export type PipFill = 'full' | 'half' | 'empty';

export const pipFill = (index: number, current: number | null): PipFill => {
  if (current === null || current <= 0) return 'empty';
  const floor = Math.floor(current);
  const frac = current - floor;
  if (index < floor) return 'full';
  if (index === floor && frac > 0) return 'half';
  return 'empty';
};

const polarAt = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

export const makeRingLayout = (size: number, radius: number, stroke: number, tickLength: number) => {
  const center = size / 2;
  const tickOuter = radius + stroke / 2;
  const segmentStart = (index: number) => RING_START_OFFSET + index * (RING_SEGMENT_DEGREES + RING_GAP_DEGREES);

  const pipPaths = Array.from({ length: RING_SEGMENTS }, (_, i) => {
    const start = segmentStart(i);
    const end = start + RING_SEGMENT_DEGREES;
    const s = polarAt(center, center, radius, start);
    const e = polarAt(center, center, radius, end);
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 0 1 ${e.x} ${e.y}`;
  });

  const ticks = Array.from({ length: RING_SEGMENTS }, (_, i) => {
    const gapCenter = segmentStart(i) + RING_SEGMENT_DEGREES + RING_GAP_DEGREES / 2;
    const outer = polarAt(center, center, tickOuter, gapCenter);
    const inner = polarAt(center, center, tickOuter - tickLength, gapCenter);
    return { x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y };
  });

  return { size, center, radius, stroke, pipPaths, ticks };
};

export const HUD_RING = makeRingLayout(132, 50, 10, 6);
export const MINI_RING = makeRingLayout(44, 16, 4, 3);
export const PULSE_RING = makeRingLayout(96, 36, 8, 4);

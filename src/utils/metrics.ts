export const METRIC_MIN = 1;
export const METRIC_MAX = 5;

/** Valid scores are 1–5. Empty / 0 / invalid become null (not logged). Values above 5 clamp to 5. */
export const clampMetric = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < METRIC_MIN) return null;
  return Math.min(METRIC_MAX, rounded);
};

export const formatMetricAvg = (value: number | null): string => {
  if (value === null) return '—';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

/** Local calendar date as YYYY-MM-DD. */
export const todayKey = (date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const shiftDate = (key: string, days: number): string => {
  const date = parseKey(key);
  date.setDate(date.getDate() + days);
  return todayKey(date);
};

export const yesterdayKey = (from = todayKey()): string => shiftDate(from, -1);

export const lastNDates = (count: number, end = todayKey()): string[] => {
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    dates.push(shiftDate(end, -i));
  }
  return dates;
};

export const isEditableDate = (key: string, today = todayKey()): boolean =>
  key === today || key === yesterdayKey(today);

export const compareDates = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

export const daysInMonth = (year: number, monthIndex: number): number =>
  new Date(year, monthIndex + 1, 0).getDate();

/** Monday-first month cells; null = padding from adjacent month. */
export const monthGrid = (year: number, monthIndex: number): (string | null)[] => {
  const first = new Date(year, monthIndex, 1);
  const weekday = (first.getDay() + 6) % 7;
  const count = daysInMonth(year, monthIndex);
  const cells: (string | null)[] = [];
  for (let i = 0; i < weekday; i += 1) cells.push(null);
  for (let d = 1; d <= count; d += 1) {
    cells.push(todayKey(new Date(year, monthIndex, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export const monthLabel = (year: number, monthIndex: number): string =>
  new Date(year, monthIndex, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });

/**
 * Storage keys for localStorage and Zustand persist.
 */
export const STORE_KEYS = {
  AUTH: 'identity-auth-store',
  TOAST: 'identity-toast-store',
  DASHBOARD: 'anima-dashboard-v3',
} as const;

export const HISTORY_DAYS = 45;
export const AVERAGE_WINDOW = 7;
export const MOMENTUM_WINDOW = 14;

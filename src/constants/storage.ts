/**
 * Storage keys for localStorage and Zustand persist
 */

/**
 * Zustand store keys
 */
export const STORE_KEYS = {
  AUTH: 'auth-store',
  CULTIVATOR: 'cultivator-store',
  TOAST: 'toast-store',
} as const;

/**
 * Database keys (for CultivatorDatabase)
 */
export const DB_KEYS = {
  USERS: 'cultivator-users',
  IDENTITIES: 'cultivator-identities',
  USER_PROGRESS: 'cultivator-user-progress',
} as const;

/**
 * Generate identity history key (without prefix - used directly with localStorage)
 */
export const getIdentityHistoryKey = (identityID: string): string => {
  return `identity-history-${identityID}`;
};

/**
 * Generate identity tasks key (without prefix - used directly with localStorage)
 */
export const getIdentityTasksKey = (identityID: string): string => {
  return `identity-tasks-${identityID}`;
};

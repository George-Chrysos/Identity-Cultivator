/**
 * Storage keys for localStorage and Zustand persist
 */

/**
 * Zustand store keys
 * @see STORE_KEYS for all available store identifiers
 */
export const STORE_KEYS = {
  AUTH: 'auth-store',
  GAME: 'game-store',
  SHOP: 'shop-store',
  TOAST: 'toast-store',
  QUEST: 'quest-store',
} as const;

/**
 * Database keys (for CultivatorDatabase)
 */
export const DB_KEYS = {
  USERS: 'cultivator-users',
  IDENTITIES: 'cultivator-identities',
  USER_PROGRESS: 'cultivator-user-progress',
} as const;

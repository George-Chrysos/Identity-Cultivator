/**
 * Clear localStorage Cache Utility
 * Use this to completely reset the local cache when database is cleared
 */

import { logger } from '@/utils/logger';
import { STORE_KEYS, DB_KEYS } from '@/constants/storage';

export const clearLocalStorageCache = () => {
  logger.info('Clearing all localStorage cache...');

  const keysToDelete = [
    // Zustand stores
    STORE_KEYS.CULTIVATOR,
    STORE_KEYS.AUTH,
    STORE_KEYS.TOAST,
    
    // Database keys
    DB_KEYS.USERS,
    DB_KEYS.IDENTITIES,
    DB_KEYS.USER_PROGRESS,
  ];

  // Clear known keys
  keysToDelete.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      logger.info(`Removed localStorage key: ${key}`);
    }
  });

  // Clear all identity-history and identity-tasks keys
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('identity-history-') || key.startsWith('identity-tasks-')) {
      localStorage.removeItem(key);
      logger.info(`Removed localStorage key: ${key}`);
    }
  });

  logger.info('✅ localStorage cache cleared! Please refresh the page.');
};

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).clearLocalStorageCache = clearLocalStorageCache;
}

/**
 * Minimal localStorage wrapper with JSON + try/catch.
 * Used by stores that persist their own slices of state.
 */

import { logger } from '@/utils/logger';

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      logger.error(`storage.get failed for ${key}`, error);
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error(`storage.set failed for ${key}`, error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      logger.error(`storage.remove failed for ${key}`, error);
    }
  },
};

/**
 * Centralized storage service
 * - Abstracts localStorage operations
 * - Provides type-safe storage interface
 * - Handles errors gracefully
 * - Adds consistent prefix to avoid collisions
 */

import { logger } from '@/utils/logger';

interface StorageOptions {
  prefix?: string;
}

class StorageService {
  private readonly prefix: string;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'cultivator_';
  }

  /**
   * Get a value from storage
   * @param key Storage key (prefix will be added automatically)
   * @returns Parsed value or null if not found/error
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = `${this.prefix}${key}`;
      const item = localStorage.getItem(fullKey);
      
      if (item === null) {
        return null;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      logger.error(`Failed to get item from storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set a value in storage
   * @param key Storage key (prefix will be added automatically)
   * @param value Value to store (will be JSON stringified)
   * @returns True if successful, false otherwise
   */
  set<T>(key: string, value: T): boolean {
    try {
      const fullKey = `${this.prefix}${key}`;
      const serialized = JSON.stringify(value);
      localStorage.setItem(fullKey, serialized);
      return true;
    } catch (error) {
      logger.error(`Failed to set item in storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove a value from storage
   * @param key Storage key (prefix will be added automatically)
   * @returns True if successful, false otherwise
   */
  remove(key: string): boolean {
    try {
      const fullKey = `${this.prefix}${key}`;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      logger.error(`Failed to remove item from storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all items with the configured prefix
   * @returns True if successful, false otherwise
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      logger.error('Failed to clear storage', error);
      return false;
    }
  }

  /**
   * Check if a key exists in storage
   * @param key Storage key (prefix will be added automatically)
   * @returns True if key exists, false otherwise
   */
  has(key: string): boolean {
    const fullKey = `${this.prefix}${key}`;
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * Get all keys with the configured prefix
   * @returns Array of keys (without prefix)
   */
  keys(): string[] {
    try {
      const allKeys = Object.keys(localStorage);
      return allKeys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      logger.error('Failed to get storage keys', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes (approximate)
   * @returns Size in bytes
   */
  size(): number {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            // Approximate size: key + value in UTF-16
            totalSize += (key.length + value.length) * 2;
          }
        }
      });
      
      return totalSize;
    } catch (error) {
      logger.error('Failed to calculate storage size', error);
      return 0;
    }
  }

  /**
   * Get storage size in human-readable format
   * @returns Size string (e.g., "2.5 KB")
   */
  sizeFormatted(): string {
    const bytes = this.size();
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }
}

// Export singleton instance with default prefix
export const storage = new StorageService({ prefix: 'cultivator_' });

// Export class for creating custom instances
export { StorageService };

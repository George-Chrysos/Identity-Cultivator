/**
 * Application limits and constraints
 */

/**
 * Identity limits
 */
export const IDENTITY_LIMITS = {
  MAX_ACTIVE: 5,
  MIN_ACTIVE: 1,
  MAX_TOTAL: 20,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 50,
} as const;

/**
 * User limits
 */
export const USER_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

/**
 * Progress limits
 */
export const PROGRESS_LIMITS = {
  MAX_LEVEL: 100,
  MIN_LEVEL: 1,
  MAX_DAYS_PER_LEVEL: 1000,
  MIN_DAYS_PER_LEVEL: 1,
} as const;

/**
 * Storage limits
 */
export const STORAGE_LIMITS = {
  MAX_SIZE_MB: 10,
  WARN_SIZE_MB: 8,
} as const;

/**
 * Query limits
 */
export const QUERY_LIMITS = {
  MAX_RESULTS: 100,
  PAGE_SIZE: 20,
} as const;

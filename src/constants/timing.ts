/**
 * Timing-related constants
 * Durations, delays, and timeouts
 */

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  TOAST: 4000,
  LEVEL_UP: 2000,
  EVOLUTION: 3000,
  CARD_TRANSITION: 300,
  FADE: 200,
  BOUNCE: 500,
} as const;

/**
 * Delay before actions (in milliseconds)
 */
export const DELAY = {
  OPTIMISTIC_TIMEOUT: 3000,
  DEBOUNCE: 300,
  THROTTLE: 1000,
} as const;

/**
 * Retry configuration
 */
export const RETRY = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  BACKOFF_MULTIPLIER: 2,
} as const;

/**
 * Cache durations (in milliseconds)
 */
export const CACHE_DURATION = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
} as const;

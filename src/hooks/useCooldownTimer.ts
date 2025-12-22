import { useState, useEffect, useMemo } from 'react';
import { formatTimeRemaining } from '@/utils/inflationCalculator';

interface CooldownTimerResult {
  /** Remaining time in milliseconds */
  remainingMs: number;
  /** Whether the cooldown has expired */
  isExpired: boolean;
  /** Formatted time string (HH:mm) */
  formattedTime: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether cooldown is active */
  isActive: boolean;
}

/**
 * useCooldownTimer - Track and format cooldown timers
 * 
 * Single source of truth for all cooldown timer logic.
 * Automatically updates every minute and handles expiration.
 * 
 * @param expiresAt - ISO timestamp when cooldown expires (or undefined if no cooldown)
 * @param startedAt - ISO timestamp when cooldown started (for progress calculation)
 * @param durationHours - Total duration of the cooldown in hours
 * @param updateInterval - Update interval in milliseconds (default: 60000 = 1 minute)
 * @returns Cooldown timer info
 * 
 * @example
 * ```tsx
 * // For shop market cooldown
 * const { formattedTime, isExpired, progress } = useCooldownTimer(
 *   marketState?.reset_at,
 *   marketState?.last_purchased_at,
 *   marketState?.cooldown_duration
 * );
 * 
 * // For inventory ticket cooldown
 * const { isExpired, formattedTime } = useCooldownTimer(
 *   ticket.expires_at,
 *   ticket.used_at,
 *   ticket.cooldown_duration
 * );
 * ```
 */
export const useCooldownTimer = (
  expiresAt: string | undefined | null,
  startedAt?: string | undefined | null,
  durationHours?: number | undefined | null,
  updateInterval: number = 60000
): CooldownTimerResult => {
  const [now, setNow] = useState(Date.now());

  // Update current time at interval
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [expiresAt, updateInterval]);

  return useMemo(() => {
    if (!expiresAt) {
      return {
        remainingMs: 0,
        isExpired: true,
        formattedTime: '',
        progress: 100,
        isActive: false,
      };
    }

    const expiresTime = new Date(expiresAt).getTime();
    const remainingMs = Math.max(0, expiresTime - now);
    const isExpired = remainingMs === 0;
    const formattedTime = isExpired ? '' : formatTimeRemaining(remainingMs);

    // Calculate progress (0-100)
    let progress = 100;
    if (startedAt && durationHours && durationHours > 0) {
      const startTime = new Date(startedAt).getTime();
      const totalDurationMs = durationHours * 60 * 60 * 1000;
      const elapsed = now - startTime;
      progress = Math.min(100, Math.max(0, (elapsed / totalDurationMs) * 100));
    }

    return {
      remainingMs,
      isExpired,
      formattedTime,
      progress,
      isActive: !isExpired,
    };
  }, [expiresAt, startedAt, durationHours, now]);
};

/**
 * useCooldownFromDuration - Calculate cooldown from start time and duration
 * 
 * Convenience hook when you have start time and duration instead of expiry time.
 * 
 * @param startedAt - ISO timestamp when cooldown started
 * @param durationHours - Cooldown duration in hours
 * @returns Cooldown timer info
 */
export const useCooldownFromDuration = (
  startedAt: string | undefined | null,
  durationHours: number | undefined | null
): CooldownTimerResult => {
  const expiresAt = useMemo(() => {
    if (!startedAt || !durationHours) return undefined;
    const startTime = new Date(startedAt).getTime();
    const durationMs = durationHours * 60 * 60 * 1000;
    return new Date(startTime + durationMs).toISOString();
  }, [startedAt, durationHours]);

  return useCooldownTimer(expiresAt, startedAt, durationHours);
};

export default useCooldownTimer;

/**
 * Performance Styles Hook
 * 
 * "Shadow Deferral" system to suspend expensive rendering during active animations.
 * Returns CSS properties that defer box-shadow, filter: drop-shadow, and backdrop-filter
 * during animations to ensure buttery-smooth 60+ FPS motion.
 * 
 * @module components/common/usePerformanceStyles
 */

import { useMemo } from 'react';
import type { CSSProperties } from 'react';

/**
 * Performance style configuration for different aesthetic modes
 */
interface PerformanceStyleConfig {
  /** box-shadow values when not animating */
  boxShadow?: string;
  /** filter (including drop-shadow) when not animating */
  filter?: string;
  /** backdrop-filter (blur, etc.) when not animating */
  backdropFilter?: string;
}

/**
 * Extended CSS properties with transition timing
 */
interface PerformanceStyles extends CSSProperties {
  transition?: string;
}

/**
 * GPU acceleration styles for forced layer promotion
 */
export const GPU_ACCELERATION_STYLES: CSSProperties = {
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  willChange: 'transform, opacity',
} as const;

/**
 * Transition timing for effect re-introduction (200ms smooth "power up")
 */
const EFFECT_TRANSITION = 'box-shadow 200ms ease-out, filter 200ms ease-out, backdrop-filter 200ms ease-out';

/**
 * Hook that returns CSS styles with expensive effects deferred during animations
 * 
 * @param isAnimating - Whether animation is currently active
 * @param config - Full aesthetic configuration (shadows, filters, blurs)
 * @returns CSS properties object - stripped during animation, full with transition when settled
 * 
 * @example
 * ```tsx
 * const [isAnimating, setIsAnimating] = useState(false);
 * const performanceStyles = usePerformanceStyles(isAnimating, {
 *   boxShadow: '0 0 20px rgba(0, 242, 255, 0.5)',
 *   filter: 'drop-shadow(0 0 10px #00f2ff)',
 *   backdropFilter: 'blur(8px)',
 * });
 * 
 * <motion.div
 *   style={performanceStyles}
 *   onAnimationStart={() => setIsAnimating(true)}
 *   onAnimationComplete={() => setIsAnimating(false)}
 * />
 * ```
 */
export const usePerformanceStyles = (
  isAnimating: boolean,
  config: PerformanceStyleConfig
): PerformanceStyles => {
  return useMemo(() => {
    if (isAnimating) {
      // Performance state: Strip expensive effects
      return {
        boxShadow: 'none',
        filter: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none', // Safari support
        transition: EFFECT_TRANSITION,
      };
    }

    // Full aesthetic state: Apply all effects with smooth transition
    return {
      boxShadow: config.boxShadow ?? 'none',
      filter: config.filter ?? 'none',
      backdropFilter: config.backdropFilter ?? 'none',
      WebkitBackdropFilter: config.backdropFilter ?? 'none', // Safari support
      transition: EFFECT_TRANSITION,
    };
  }, [isAnimating, config.boxShadow, config.filter, config.backdropFilter]);
};

/**
 * Simplified hook for components that only use box-shadow
 */
export const usePerformanceShadow = (
  isAnimating: boolean,
  boxShadow: string
): PerformanceStyles => {
  return useMemo(() => ({
    boxShadow: isAnimating ? 'none' : boxShadow,
    transition: 'box-shadow 200ms ease-out',
  }), [isAnimating, boxShadow]);
};

/**
 * Simplified hook for components that only use filter (drop-shadow)
 */
export const usePerformanceFilter = (
  isAnimating: boolean,
  filter: string
): PerformanceStyles => {
  return useMemo(() => ({
    filter: isAnimating ? 'none' : filter,
    transition: 'filter 200ms ease-out',
  }), [isAnimating, filter]);
};

/**
 * Simplified hook for components that only use backdrop-filter
 */
export const usePerformanceBackdrop = (
  isAnimating: boolean,
  backdropFilter: string
): PerformanceStyles => {
  return useMemo(() => ({
    backdropFilter: isAnimating ? 'none' : backdropFilter,
    WebkitBackdropFilter: isAnimating ? 'none' : backdropFilter,
    transition: 'backdrop-filter 200ms ease-out',
  }), [isAnimating, backdropFilter]);
};

export default usePerformanceStyles;

/**
 * Streak Counter Component
 * 
 * Visual evolution of the streak counter through 4 stages:
 * Stage 1: The Ember (Days 1-2) - Small vibrating orange dot
 * Stage 2: The Blue Flame (Day 3 to Sub-Milestone) - Blue SVG flame
 * Stage 3: The Singularity (1-2 Days before Milestone) - Cyan transition
 * Stage 4: The Explosion (Milestone Day) - Full celebration effect
 * 
 * @module components/streak/StreakCounter
 */

import { memo, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { getStreakVisualState } from '@/services/StreakManager';
import { GPU_ACCELERATION_STYLES } from '@/components/common';

// ==================== TYPES ====================

interface StreakCounterProps {
  streak: number;
  level: number;
  onMilestoneReached?: () => void;
  className?: string;
}

// ==================== STAGE CONFIGURATIONS ====================

const STAGE_COLORS = {
  ember: '#f59e0b',      // Orange
  flame: '#3b82f6',       // Blue
  singularity: '#00f2ff', // Cyan
  explosion: '#00f2ff',   // Cyan
} as const;

const STAGE_STYLES = {
  ember: {
    filter: 'blur(1px) drop-shadow(0 0 5px #f59e0b)',
    scale: 0.8,
  },
  flame: {
    filter: 'drop-shadow(0 0 10px #3b82f6) contrast(1.2)',
    scale: 1,
  },
  singularity: {
    filter: 'drop-shadow(0 0 15px #00f2ff) brightness(1.5)',
    scale: 1.1,
  },
  explosion: {
    filter: 'drop-shadow(0 0 25px #00f2ff) brightness(2)',
    scale: 1.2,
  },
} as const;

// ==================== ANIMATIONS ====================

// Stage 1: Ember - Slow breathing opacity
const emberAnimation = {
  opacity: [0.6, 1, 0.6],
  scale: [0.95, 1.02, 0.95],
};

const emberTransition = {
  duration: 2.5,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

// Stage 2: Blue Flame - Jittery flicker
const flameAnimation = {
  scale: [0.95, 1.05, 0.98, 1.02, 0.95],
  filter: [
    'drop-shadow(0 0 10px #3b82f6) contrast(1.2) brightness(1)',
    'drop-shadow(0 0 15px #3b82f6) contrast(1.3) brightness(1.1)',
    'drop-shadow(0 0 8px #3b82f6) contrast(1.2) brightness(1)',
    'drop-shadow(0 0 12px #3b82f6) contrast(1.25) brightness(1.05)',
    'drop-shadow(0 0 10px #3b82f6) contrast(1.2) brightness(1)',
  ],
};

const flameTransition = {
  duration: 0.8,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

// Stage 3: Singularity - Rhythmic pulse (card "inhaling")
const singularityAnimation = {
  scale: [0.98, 1.02, 0.98],
  filter: [
    'drop-shadow(0 0 15px #00f2ff) brightness(1.5)',
    'drop-shadow(0 0 25px #00f2ff) brightness(1.8)',
    'drop-shadow(0 0 15px #00f2ff) brightness(1.5)',
  ],
};

const singularityTransition = {
  duration: 1.2,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

// Stage 4: Explosion - Intense pulse before celebration
const explosionAnimation = {
  scale: [1, 1.15, 1, 1.2, 1],
  filter: [
    'drop-shadow(0 0 25px #00f2ff) brightness(2)',
    'drop-shadow(0 0 40px #00f2ff) brightness(2.5)',
    'drop-shadow(0 0 25px #00f2ff) brightness(2)',
    'drop-shadow(0 0 50px #00f2ff) brightness(3)',
    'drop-shadow(0 0 25px #00f2ff) brightness(2)',
  ],
};

const explosionTransition = {
  duration: 0.6,
  repeat: Infinity,
  ease: 'easeOut' as const,
};

// ==================== SUB-COMPONENTS ====================

/**
 * Ember Stage - Small vibrating orange dot
 */
const EmberIndicator = memo(() => (
  <motion.div
    className="w-3 h-3 rounded-full"
    style={{
      backgroundColor: STAGE_COLORS.ember,
      ...STAGE_STYLES.ember,
    }}
    animate={emberAnimation}
    transition={emberTransition}
  />
));
EmberIndicator.displayName = 'EmberIndicator';

/**
 * Flame Stage - Blue SVG Flame
 */
const FlameIndicator = memo(() => (
  <motion.div
    animate={flameAnimation}
    transition={flameTransition}
  >
    <Flame
      className="w-5 h-5"
      style={{ color: STAGE_COLORS.flame }}
      strokeWidth={2.5}
    />
  </motion.div>
));
FlameIndicator.displayName = 'FlameIndicator';

/**
 * Singularity Stage - Cyan pulsing flame with lacing edges
 */
const SingularityIndicator = memo(() => (
  <motion.div
    className="relative"
    animate={singularityAnimation}
    transition={singularityTransition}
  >
    {/* Outer glow ring */}
    <motion.div
      className="absolute inset-0 -m-2 rounded-full"
      style={{
        background: `radial-gradient(circle, ${STAGE_COLORS.singularity}40 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <Flame
      className="w-6 h-6 relative z-10"
      style={{ color: STAGE_COLORS.singularity }}
      strokeWidth={2.5}
    />
  </motion.div>
));
SingularityIndicator.displayName = 'SingularityIndicator';

/**
 * Explosion Stage - Maximum intensity with particle hints
 */
const ExplosionIndicator = memo(() => (
  <motion.div
    className="relative"
    animate={explosionAnimation}
    transition={explosionTransition}
  >
    {/* Inner glow */}
    <motion.div
      className="absolute inset-0 -m-2 rounded-full"
      style={{
        background: `radial-gradient(circle, ${STAGE_COLORS.explosion}60 0%, transparent 60%)`,
      }}
      animate={{
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
      }}
    />
    <Flame
      className="w-7 h-7 relative z-10"
      style={{ color: STAGE_COLORS.explosion }}
      strokeWidth={3}
    />
  </motion.div>
));
ExplosionIndicator.displayName = 'ExplosionIndicator';

// ==================== MAIN COMPONENT ====================

export const StreakCounter = memo(({
  streak,
  level,
  className = '',
}: StreakCounterProps) => {
  const [isAnimating, setIsAnimating] = useState(true);
  
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);
  
  const visualState = useMemo(
    () => getStreakVisualState(streak, level),
    [streak, level]
  );

  const { stage, daysUntilMilestone, isSubMilestoneDay } = visualState;

  // Get appropriate indicator based on stage
  const StageIndicator = useMemo(() => {
    switch (stage) {
      case 'ember':
        return EmberIndicator;
      case 'flame':
        return FlameIndicator;
      case 'singularity':
        return SingularityIndicator;
      case 'explosion':
        return ExplosionIndicator;
    }
  }, [stage]);

  // Get text color based on stage
  const textColorClass = useMemo(() => {
    switch (stage) {
      case 'ember':
        return 'text-orange-400';
      case 'flame':
        return 'text-blue-400';
      case 'singularity':
      case 'explosion':
        return 'text-cyan-400';
    }
  }, [stage]);

  // Get glow style for counter number - defer during animation
  const numberGlow = useMemo(() => {
    if (isAnimating) return 'none';
    const color = STAGE_COLORS[stage];
    switch (stage) {
      case 'ember':
        return `drop-shadow(0 0 4px ${color}80)`;
      case 'flame':
        return `drop-shadow(0 0 8px ${color}90)`;
      case 'singularity':
        return `drop-shadow(0 0 12px ${color})`;
      case 'explosion':
        return `drop-shadow(0 0 20px ${color})`;
    }
  }, [stage, isAnimating]);

  // Haptic feedback simulation via visual pulse
  const hapticIntensity = useMemo(() => {
    switch (stage) {
      case 'ember':
        return 'light';
      case 'flame':
        return 'medium';
      case 'singularity':
      case 'explosion':
        return 'heavy';
    }
  }, [stage]);

  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      data-haptic={hapticIntensity}
      style={GPU_ACCELERATION_STYLES}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={handleAnimationComplete}
          style={GPU_ACCELERATION_STYLES}
        >
          <StageIndicator />
        </motion.div>
      </AnimatePresence>

      <motion.span
        className={`font-black text-lg ${textColorClass}`}
        style={{ 
          filter: numberGlow,
          transition: 'filter 200ms ease-out',
          ...GPU_ACCELERATION_STYLES,
        }}
        animate={
          stage === 'explosion'
            ? { scale: [1, 1.1, 1] }
            : stage === 'singularity'
            ? { scale: [1, 1.05, 1] }
            : {}
        }
        transition={
          stage === 'explosion' || stage === 'singularity'
            ? { duration: 0.8, repeat: Infinity }
            : {}
        }
      >
        {streak}
      </motion.span>

      {/* Sub-milestone indicator */}
      {isSubMilestoneDay && (
        <motion.div
          className="text-xs text-cyan-300 font-semibold"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✦
        </motion.div>
      )}

      {/* Days until milestone (only show for singularity stage) */}
      {stage === 'singularity' && daysUntilMilestone > 0 && (
        <motion.span
          className="text-xs text-cyan-300/70"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ({daysUntilMilestone}d)
        </motion.span>
      )}
    </div>
  );
});

StreakCounter.displayName = 'StreakCounter';

export default StreakCounter;

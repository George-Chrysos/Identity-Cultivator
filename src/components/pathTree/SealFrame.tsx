import { memo } from 'react';
import { motion } from 'framer-motion';
import type { PathTheme } from '@/constants/pathTreeData';
import { THEME_COLORS } from '@/constants/pathTreeData';

interface SealFrameProps {
  theme: PathTheme;
  isActive: boolean;
  isMastered: boolean;
}

export const SealFrame = memo(({ theme, isActive, isMastered }: SealFrameProps) => {
  const colors = THEME_COLORS[theme];

  return (
    <svg 
      viewBox="0 0 100 100" 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={`glow-${theme}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Inner Glow Ring */}
      <motion.circle
        cx={50}
        cy={50}
        r={38}
        fill="none"
        stroke={colors.primary}
        strokeWidth={2}
        opacity={isMastered ? 0.8 : 0.4}
        filter={`url(#glow-${theme})`}
        animate={
          isActive
            ? {
                opacity: [0.4, 0.8, 0.4],
                r: [37, 39, 37],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Outer Geometric Star Frame */}
      <motion.path
        d="M50 5 L58 35 L88 35 L64 52 L72 82 L50 65 L28 82 L36 52 L12 35 L42 35 Z"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1.5"
        opacity={isMastered ? 1 : 0.6}
        filter={`url(#glow-${theme})`}
        animate={
          isActive
            ? {
                rotate: [0, 360],
              }
            : {}
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ transformOrigin: 'center' }}
      />

      {/* Inner Mandala Ring */}
      <motion.circle
        cx={50}
        cy={50}
        r={32}
        fill="none"
        stroke={colors.primary}
        strokeWidth={1}
        strokeDasharray="5 3"
        opacity={0.5}
        animate={
          isActive
            ? {
                rotate: [0, -360],
              }
            : {}
        }
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ transformOrigin: 'center' }}
      />

      {/* Outer Energy Circle */}
      {isActive && (
        <motion.circle
          cx={50}
          cy={50}
          r={45}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{ transformOrigin: 'center' }}
        />
      )}
    </svg>
  );
});

SealFrame.displayName = 'SealFrame';

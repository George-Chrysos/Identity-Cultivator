import { memo } from 'react';
import { motion } from 'framer-motion';
import type { PathTheme } from '@/constants/pathTreeData';
import { THEME_COLORS } from '@/constants/pathTreeData';

interface PathIndicatorProps {
  totalPaths: number;
  activeIndex: number;
  themes: PathTheme[];
  onSelect: (index: number) => void;
}

export const PathIndicator = memo(({ totalPaths, activeIndex, themes, onSelect }: PathIndicatorProps) => {
  return (
    <div className="flex items-end justify-center gap-4 h-16">
      {Array.from({ length: totalPaths }).map((_, index) => {
        const isActive = index === activeIndex;
        const colors = THEME_COLORS[themes[index]];

        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className="relative flex items-end"
            aria-label={`Switch to path ${index + 1}`}
          >
            <motion.div
              className="w-2 rounded-t-full"
              style={{
                backgroundColor: colors.primary,
                boxShadow: isActive ? `0 0 15px ${colors.glow}` : 'none',
              }}
              animate={{
                height: isActive ? '48px' : '24px',
                opacity: isActive ? 1 : 0.4,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />
            
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-t-full"
                style={{
                  backgroundColor: colors.primary,
                  opacity: 0.3,
                }}
                animate={{
                  scaleY: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
});

PathIndicator.displayName = 'PathIndicator';

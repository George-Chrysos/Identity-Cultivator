import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GiSwordSmithing, GiBrain, GiFireShield, GiWaterBolt } from 'react-icons/gi';
import type { CultivationPath } from '@/constants/pathTreeData';
import { THEME_COLORS } from '@/constants/pathTreeData';

interface PathTabsProps {
  paths: CultivationPath[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const getPathIcon = (pathId: string) => {
  switch (pathId) {
    case 'warrior':
      return GiSwordSmithing;
    case 'mage':
      return GiBrain;
    case 'mystic':
      return GiWaterBolt;
    case 'guardian':
      return GiFireShield;
    default:
      return GiSwordSmithing;
  }
};

export const PathTabs = memo(({ paths, activeIndex, onSelect }: PathTabsProps) => {
  const handleSelect = useCallback((index: number) => {
    onSelect(index);
  }, [onSelect]);

  return (
    <div className="flex items-center justify-center gap-10 px-4">
      {paths.map((path, index) => {
        const isActive = index === activeIndex;
        const colors = THEME_COLORS[path.themeColor];
        const Icon = getPathIcon(path.id);

        return (
          <button
            key={path.id}
            onClick={() => handleSelect(index)}
            className="relative flex flex-col items-center min-w-[50px]"
            aria-label={`Switch to ${path.title} path`}
          >
            {/* Path Icon */}
            <motion.div
              className="mb-2 flex items-center justify-center"
              animate={{
                opacity: isActive ? 1 : 0.5,
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon
                size={32}
                strokeWidth={2}
                style={{
                  color: colors.primary,
                  filter: isActive ? `drop-shadow(0 0 10px ${colors.glow})` : 'none',
                }}
              />
            </motion.div>

            {/* Progress Bar - Always full, path color */}
            <div className="relative w-full h-1 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-full rounded-full"
                style={{
                  backgroundColor: colors.primary,
                  boxShadow: isActive ? `0 0 8px ${colors.glow}` : 'none',
                  opacity: isActive ? 1 : 0.5,
                }}
              />
            </div>

            {/* Active Indicator Glow */}
            {isActive && (
              <motion.div
                className="absolute -bottom-2 left-1/2 w-1 h-1 rounded-full"
                style={{ backgroundColor: colors.primary }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.5, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
});

PathTabs.displayName = 'PathTabs';

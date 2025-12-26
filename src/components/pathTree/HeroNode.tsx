import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { GiSwordSmithing, GiBrain, GiFireShield, GiWaterBolt } from 'react-icons/gi';
import type { PathNode, PathTheme } from '@/constants/pathTreeData';
import { THEME_COLORS } from '@/constants/pathTreeData';
import { GPU_ACCELERATION_STYLES } from '@/components/common';

interface HeroNodeProps {
  node: PathNode;
  pathTheme: PathTheme;
  pathId: string;
  level?: number;
  onClick?: (nodeId: string) => void;
}

// Icons match PathTabs navigation buttons exactly
const getIconComponent = (pathId: string) => {
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

export const HeroNode = memo(({ node, pathTheme, pathId, onClick }: HeroNodeProps) => {
  const Icon = getIconComponent(pathId);
  const colors = THEME_COLORS[pathTheme];
  const [isAnimating, setIsAnimating] = useState(true);
  
  const isLocked = node.status === 'locked';
  const isUnlockable = node.status === 'unlockable';
  const isActive = node.status === 'active';
  const isCompleted = node.status === 'completed';
  
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(node.id);
    }
  }, [node.id, onClick]);
  
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);
  
  // Another 20% bigger (total 44% increase)
  const nodeSize = 'w-[103px] h-[103px] sm:w-[138px] sm:h-[138px] md:w-[161px] md:h-[161px]';
  
  // Determine display color and glow based on state
  const displayColor = isLocked ? 'rgb(71, 85, 105)' : isUnlockable ? 'rgb(192, 192, 192)' : colors.primary;
  const displayGlow = isUnlockable ? 'rgba(192, 192, 192, 0.6)' : colors.glow;
  
  // Performance: defer expensive filter during animation
  const getFilterStyle = useCallback((defaultFilter: string) => {
    if (isAnimating) return 'none';
    return defaultFilter;
  }, [isAnimating]);

  return (
    <div className="flex flex-col items-center">
      {/* Title - Fixed height container */}
      <div className="h-10 sm:h-12 flex items-center justify-center mb-2 sm:mb-4">
        <motion.h2
          className="font-bold text-xl sm:text-2xl md:text-3xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: (isLocked || isUnlockable) ? 'rgb(148, 163, 184)' : 'white',
            textShadow: (isLocked || isUnlockable) ? 'none' : isAnimating ? 'none' : `0 0 20px ${displayGlow}`,
            transition: 'text-shadow 200ms ease-out',
          }}
        >
          {node.title}
        </motion.h2>
      </div>

      {/* Main Node Container */}
      <motion.button
        onClick={handleClick}
        className={`relative ${nodeSize} cursor-pointer hover:scale-105 transition-transform`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onAnimationComplete={handleAnimationComplete}
        style={GPU_ACCELERATION_STYLES}
      >
        {/* Ornate Frame SVG */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id={`hero-glow-${pathTheme}-${node.id}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id={`hero-gradient-${pathTheme}-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={displayColor} stopOpacity="1" />
              <stop offset="50%" stopColor={displayColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={displayColor} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Outer Ornate Frame - Only animate if active */}
          <motion.path
            d="
              M100 8
              L108 20 L120 12 L118 28 L135 25 L128 40 L145 42 L135 55 L152 62 L138 72 L152 85
              L138 90 L148 105 L132 105 L138 120 L122 115 L122 132 L108 122 L100 138
              L92 122 L78 132 L78 115 L62 120 L68 105 L52 105 L62 90 L48 85
              L62 72 L48 62 L65 55 L55 42 L72 40 L65 25 L82 28 L80 12 L92 20 Z
            "
            fill="none"
            stroke={`url(#hero-gradient-${pathTheme}-${node.id})`}
            strokeWidth="2"
            opacity={isLocked ? 0.3 : isUnlockable ? 1 : 1}
            filter={isLocked ? 'none' : isUnlockable ? getFilterStyle('drop-shadow(0 0 12px rgba(192,192,192,0.6))') : isAnimating ? 'none' : `url(#hero-glow-${pathTheme}-${node.id})`}
            animate={(isActive || isCompleted) ? {
              rotate: [0, 360],
            } : {}}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ transformOrigin: 'center', transition: 'filter 200ms ease-out' }}
          />

          {/* Inner Decorative Ring - Only animate if active */}
          <motion.circle
            cx={100}
            cy={100}
            r={70}
            fill="none"
            stroke={displayColor}
            strokeWidth={2}
            strokeDasharray="8 4"
            opacity={isLocked ? 0.2 : isUnlockable ? 1 : 0.4}
            animate={(isActive || isCompleted) ? {
              rotate: [0, -360],
            } : {}}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={isUnlockable ? { filter: getFilterStyle('drop-shadow(0 0 8px rgba(192,192,192,0.6))'), transition: 'filter 200ms ease-out', transformOrigin: 'center' } : { transformOrigin: 'center' }}
          />

          {/* Main Circle Fill - Always fully opaque to hide lines behind */}
          <circle
            cx="100"
            cy="100"
            r="58"
            fill="rgb(15, 23, 42)"
            stroke="none"
          />
          
          {/* Main Circle Stroke - Drawn on top with conditional opacity */}
          <circle
            cx="100"
            cy="100"
            r="58"
            fill="none"
            stroke={displayColor}
            strokeWidth="3"
            opacity={isLocked ? 0.5 : isUnlockable ? 1 : 1}
            filter={isLocked ? 'none' : isUnlockable ? getFilterStyle('drop-shadow(0 0 8px rgba(192,192,192,0.6))') : isAnimating ? 'none' : `url(#hero-glow-${pathTheme}-${node.id})`}
            style={{ transition: 'filter 200ms ease-out' }}
          />

          {/* Corner Decorations - Only animate if active */}
          {[0, 90, 180, 270].map((angle) => (
            <motion.circle
              key={angle}
              cx={100 + 75 * Math.cos((angle * Math.PI) / 180)}
              cy={100 + 75 * Math.sin((angle * Math.PI) / 180)}
              fill={displayColor}
              opacity={isLocked ? 0.2 : isUnlockable ? 1 : 0.6}
              style={isUnlockable ? { filter: getFilterStyle('drop-shadow(0 0 8px rgba(192,192,192,0.6))'), transition: 'filter 200ms ease-out' } : undefined}
              initial={{ r: 3 }}
              animate={(isActive || isCompleted) ? {
                opacity: [0.4, 0.8, 0.4],
                r: [2, 4, 2],
              } : { r: 3 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: angle / 180,
              }}
            />
          ))}
        </svg>

        {/* Center Icon and Level */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isLocked ? (
            <Lock
              size={24}
              strokeWidth={1.5}
              className="text-slate-500"
            />
          ) : (
            <Icon
              size={24}
              strokeWidth={1.5}
              style={{
                color: isUnlockable ? 'rgb(192, 192, 192)' : colors.primary,
                filter: isAnimating ? 'none' : `drop-shadow(0 0 15px ${displayGlow})`,
                transition: 'filter 200ms ease-out',
              }}
            />
          )}
        </div>
      </motion.button>
    </div>
  );
});

HeroNode.displayName = 'HeroNode';

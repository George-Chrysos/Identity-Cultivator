import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Eye, Lock, Crown, Zap, Star, Heart, Target, Compass, BookOpen, Lightbulb, Mountain, Wind } from 'lucide-react';
import { GiSwordSmithing, GiBrain, GiFireShield, GiWaterBolt } from 'react-icons/gi';
import type { PathNode, PathTheme } from '@/constants/pathTreeData';
import { THEME_COLORS } from '@/constants/pathTreeData';
import { GPU_ACCELERATION_STYLES } from '@/components/common';

interface SubNodeProps {
  node: PathNode;
  pathTheme: PathTheme;
  onClick?: (nodeId: string) => void;
}

const getNodeIcon = (_nodeId: string, title: string) => {
  // Match icon to node title/type based on Diamond Synthesis naming
  const titleLower = title.toLowerCase();
  
  // Warrior path icons
  if (titleLower.includes('temper')) return Flame;
  if (titleLower.includes('fluid')) return Wind;
  if (titleLower.includes('density')) return Mountain;
  if (titleLower.includes('ronin') || titleLower.includes('blade')) return GiSwordSmithing;
  if (titleLower.includes('samurai') || titleLower.includes('shogun')) return Crown;
  if (titleLower.includes('knight') || titleLower.includes('paladin')) return GiFireShield;
  if (titleLower.includes('vagabond')) return Compass;
  if (titleLower.includes('war-lord') || titleLower.includes('iron-wall')) return GiFireShield;
  if (titleLower.includes('grandmaster')) return Crown;
  
  // Mage path icons
  if (titleLower.includes('focus')) return Target;
  if (titleLower.includes('synthesis')) return GiWaterBolt;
  if (titleLower.includes('logic')) return GiBrain;
  if (titleLower.includes('scholar') || titleLower.includes('adept')) return BookOpen;
  if (titleLower.includes('sage') || titleLower.includes('arch-mage')) return Star;
  if (titleLower.includes('strategist') || titleLower.includes('tactician')) return Target;
  if (titleLower.includes('visionary') || titleLower.includes('architect')) return Lightbulb;
  if (titleLower.includes('overseer')) return Eye;
  
  // Mystic path icons
  if (titleLower.includes('presence') || titleLower.includes('stillness')) return Heart;
  if (titleLower.includes('reflection')) return Eye;
  if (titleLower.includes('seer') || titleLower.includes('oracle') || titleLower.includes('ethereal')) return Eye;
  if (titleLower.includes('enlighten') || titleLower.includes('hierophant')) return GiWaterBolt;
  if (titleLower.includes('ascetic') || titleLower.includes('anchor')) return Mountain;
  if (titleLower.includes('void') || titleLower.includes('spirit')) return Star;
  if (titleLower.includes('saint')) return Crown;
  
  // Guardian path icons
  if (titleLower.includes('vow') || titleLower.includes('votary')) return Heart;
  if (titleLower.includes('resistance') || titleLower.includes('sentinel') || titleLower.includes('aegis')) return GiFireShield;
  if (titleLower.includes('command') || titleLower.includes('imperator') || titleLower.includes('monarch')) return Crown;
  if (titleLower.includes('warden') || titleLower.includes('inquisitor')) return Eye;
  if (titleLower.includes('sovereign') || titleLower.includes('exemplar')) return Crown;
  
  // Fallback
  if (titleLower.includes('berserker') || titleLower.includes('rage')) return Zap;
  if (titleLower.includes('master') || titleLower.includes('god')) return Crown;
  return GiWaterBolt;
};

export const SubNode = memo(({ node, pathTheme, onClick }: SubNodeProps) => {
  const colors = THEME_COLORS[pathTheme];
  const Icon = getNodeIcon(node.id, node.title);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const isLocked = node.status === 'locked';
  const isUnlockable = node.status === 'unlockable';
  const isActive = node.status === 'active';
  const isCompleted = node.status === 'completed';
  
  // Another 20% bigger (total 44% increase)
  const nodeSize = 'w-[103px] h-[103px] sm:w-[138px] sm:h-[138px] md:w-[161px] md:h-[161px]';
  const iconSize = 31;
  const circleRadius = 55;

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(node.id);
    }
  }, [node.id, onClick]);
  
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);
  
  // Determine display color based on state
  const displayColor = isLocked ? 'rgb(71, 85, 105)' : isUnlockable ? 'rgb(192, 192, 192)' : colors.primary;
  const displayGlow = isUnlockable ? 'rgba(192, 192, 192, 0.4)' : colors.glow;
  
  // Performance: defer expensive filter during animation
  const getFilterStyle = useCallback((defaultFilter: string) => {
    if (isAnimating) return 'none';
    return defaultFilter;
  }, [isAnimating]);

  return (
    <motion.div
      className="flex flex-col items-center relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={handleAnimationComplete}
      style={{ minHeight: '100px', ...GPU_ACCELERATION_STYLES }}
    >
      {/* Price Badge - Absolute positioned top-right */}
      {isUnlockable && (
        <div 
          className="absolute -top-1 -right-1 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(34, 211, 238, 0.6)',
            boxShadow: isAnimating ? 'none' : '0 0 8px rgba(34, 211, 238, 0.3)',
            color: 'rgb(34, 211, 238)',
            transition: 'box-shadow 200ms ease-out',
          }}
        >
          <Star size={10} fill="rgb(34, 211, 238)" />
          <span>{node.starsRequired}</span>
        </div>
      )}

      {/* Node Button */}
      <motion.button
        onClick={handleClick}
        className={`relative ${nodeSize} cursor-pointer hover:scale-105 transition-transform`}
      >
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id={`sub-glow-${node.id}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ornate Frame - Show for active and completed nodes, centered at 100,100 */}
          {(isActive || isCompleted) && (
            <motion.path
              d="
                M100 43
                L112 58 L130 51 L125 71 L145 71 L135 88 L152 95 L135 105 L148 121
                L128 118 L135 138 L115 128 L112 148 L100 133
                L88 148 L85 128 L65 138 L72 118 L52 121
                L65 105 L48 95 L65 88 L55 71 L75 71 L70 51 L88 58 Z
              "
              fill="none"
              stroke={colors.primary}
              strokeWidth="2"
              opacity={0.7}
              filter={getFilterStyle(`url(#sub-glow-${node.id})`)}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transition: 'filter 200ms ease-out', transformOrigin: '100px 100px' }}
            />
          )}

          {/* Inner Circle Fill - Always fully opaque to hide lines behind */}
          <circle
            cx="100"
            cy="100"
            r={circleRadius}
            fill="rgb(15, 23, 42)"
            stroke="none"
          />
          
          {/* Inner Circle Stroke - Drawn on top with conditional opacity */}
          <circle
            cx="100"
            cy="100"
            r={circleRadius}
            fill="none"
            stroke={displayColor}
            strokeWidth="3"
            opacity={isLocked ? 0.4 : 1}
            filter={isLocked ? 'none' : getFilterStyle(`url(#sub-glow-${node.id})`)}
            style={isUnlockable ? { filter: getFilterStyle('drop-shadow(0 0 8px rgba(192, 192, 192, 0.6))'), transition: 'filter 200ms ease-out' } : { transition: 'filter 200ms ease-out' }}
          />
        </svg>

        {/* Icon Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isLocked ? (
            <Lock
              size={iconSize - 4}
              className="text-slate-500"
            />
          ) : (
            <Icon
              size={iconSize}
              strokeWidth={1.5}
              style={{
                color: isUnlockable ? 'rgb(192, 192, 192)' : colors.primary,
                filter: getFilterStyle(`drop-shadow(0 0 8px ${displayGlow})`),
                transition: 'filter 200ms ease-out',
              }}
            />
          )}
        </div>
      </motion.button>

      {/* Node Title - Fixed position below icon */}
      <div className="h-7 flex items-center justify-center -mt-5">
        <p
          className="font-semibold text-center uppercase tracking-wider max-w-[80px] sm:max-w-[90px] text-[11px] sm:text-xs md:text-sm leading-tight"
          style={{
            color: isLocked ? 'rgb(148, 163, 184)' : isUnlockable ? 'rgb(192, 192, 192)' : colors.primary,
            textShadow: isLocked ? 'none' : isUnlockable ? (isAnimating ? 'none' : '0 0 8px rgba(192, 192, 192, 0.6)') : (isAnimating ? 'none' : `0 0 8px ${displayGlow}`),
            transition: 'text-shadow 200ms ease-out',
          }}
        >
          {node.title}
        </p>
      </div>
    </motion.div>
  );
});

SubNode.displayName = 'SubNode';

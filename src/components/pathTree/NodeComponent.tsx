import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Swords, Flame, Eye, Lock, Sparkles } from 'lucide-react';
import type { PathNode, PathTheme } from '@/constants/pathTreeData';
import { THEME_COLORS } from '@/constants/pathTreeData';
import { SealFrame } from './SealFrame';

interface NodeComponentProps {
  node: PathNode;
  pathTheme: PathTheme;
  pathId: string;
  onUnlock: (nodeId: string) => void;
}

const getIconComponent = (pathId: string) => {
  switch (pathId) {
    case 'warrior':
      return Swords;
    case 'mage':
      return Flame;
    case 'mystic':
      return Eye;
    default:
      return Swords;
  }
};

export const NodeComponent = memo(({ node, pathTheme, pathId, onUnlock }: NodeComponentProps) => {
  const Icon = getIconComponent(pathId);
  const colors = THEME_COLORS[pathTheme];
  const progressPercent = (node.starsCurrent / node.starsRequired) * 100;
  const circumference = 2 * Math.PI * 38; // radius of 38 for progress ring
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
  
  const isLocked = node.status === 'locked';
  const isUnlockable = node.status === 'unlockable';
  const isActive = node.status === 'active';
  const isCompleted = node.status === 'completed';

  const handleClick = useCallback(() => {
    if (isUnlockable) {
      onUnlock(node.id);
    }
  }, [isUnlockable, node.id, onUnlock]);

  const getNodeStyles = () => {
    if (isCompleted) {
      return {
        opacity: 1,
        filter: 'grayscale(0)',
        borderColor: colors.primary,
      };
    }
    if (isActive) {
      return {
        opacity: 1,
        filter: 'grayscale(0)',
        borderColor: colors.primary,
      };
    }
    if (isUnlockable) {
      return {
        opacity: 0.9,
        filter: 'grayscale(0)',
        borderColor: colors.primary,
      };
    }
    // locked
    return {
      opacity: 0.4,
      filter: 'grayscale(1)',
      borderColor: 'rgb(71, 85, 105)',
    };
  };

  const styles = getNodeStyles();

  return (
    <motion.div
      className="flex flex-col items-center gap-3 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ zIndex: 2 }}
    >
      {/* Node Seal Container */}
      <motion.button
        onClick={handleClick}
        disabled={isLocked || isCompleted}
        className="relative w-24 h-24 cursor-pointer disabled:cursor-not-allowed"
        whileHover={isUnlockable ? { scale: 1.08 } : {}}
        whileTap={isUnlockable ? { scale: 0.92 } : {}}
        animate={{
          opacity: styles.opacity,
        }}
        style={{
          filter: styles.filter,
        }}
      >
        {/* Custom Seal Frame SVG */}
        <SealFrame 
          theme={pathTheme} 
          isActive={isActive} 
          isMastered={isCompleted}
        />

        {/* Main Node Circle */}
        <div
          className="absolute inset-2 rounded-full flex items-center justify-center relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: `2px solid ${colors.primary}`,
            boxShadow: `
              0 0 20px ${colors.glow},
              inset 0 0 20px ${colors.glow}
            `,
          }}
        >
          {/* Progress Ring */}
          {!isLocked && !isUnlockable && (
            <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="50%"
                cy="50%"
                r="35%"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                opacity="0.5"
                style={{
                  transition: 'stroke-dashoffset 1s ease-out',
                }}
              />
            </svg>
          )}

          {/* Icon */}
          <Icon
            size={32}
            strokeWidth={2.5}
            className="relative z-10"
            style={{
              color: (isLocked || isUnlockable) ? 'rgb(148, 163, 184)' : colors.primary,
              filter: (!isLocked && !isUnlockable) ? `drop-shadow(0 0 8px ${colors.glow})` : 'none',
            }}
          />

          {/* Lock Overlay */}
          {(isLocked || isUnlockable) && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm rounded-full z-20">
              <Lock size={20} className="text-slate-400" />
            </div>
          )}
        </div>
      </motion.button>

      {/* Node Title */}
      <p
        className="text-xs font-bold text-center uppercase tracking-wider max-w-[100px]"
        style={{
          color: (isLocked || isUnlockable) ? 'rgb(148, 163, 184)' : colors.primary,
          textShadow: (!isLocked && !isUnlockable) ? `0 0 10px ${colors.glow}` : 'none',
        }}
      >
        {node.title}
      </p>

      {/* Star Price Tag - Show for locked/unlockable */}
      {(isLocked || isUnlockable) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
            isUnlockable 
              ? 'bg-cyan-500/20 border-cyan-400/50' 
              : 'bg-slate-800/80 border-slate-600/50'
          }`}
        >
          <Sparkles 
            size={12} 
            className={isUnlockable ? 'text-cyan-400' : 'text-slate-500'} 
          />
          <span className={`text-xs font-bold ${isUnlockable ? 'text-cyan-400' : 'text-slate-500'}`}>
            {node.starsRequired}
          </span>
        </motion.div>
      )}

      {/* Progress Bar - only for active nodes */}
      {isActive && (
        <div className="flex items-center gap-1">
          <div className="relative w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                backgroundColor: colors.primary,
                width: `${progressPercent}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex items-center gap-0.5 text-xs font-mono">
            <span style={{ color: colors.primary }}>{node.starsCurrent}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{node.starsRequired}</span>
            <Sparkles size={10} style={{ color: colors.primary }} />
          </div>
        </div>
      )}
      
      {/* Completed Badge */}
      {isCompleted && (
        <div className="flex items-center gap-1 text-xs font-semibold">
          <span style={{ color: colors.primary }}>MASTERED</span>
          <Sparkles size={12} style={{ color: colors.primary }} />
        </div>
      )}
    </motion.div>
  );
});

NodeComponent.displayName = 'NodeComponent';

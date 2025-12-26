import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiSwordSmithing, GiBrain, GiFireShield, GiWaterBolt } from 'react-icons/gi';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { getRankStyle, getRankGlowColor } from '@/utils/rankStyles';
import { calculateOverallRank, getRankPlasmaIntensity } from '@/utils/overallRank';
import { shallow } from 'zustand/shallow';
import RankCircle from './RankCircle';

interface SoulInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const SoulInterface = ({ isOpen, onClose }: SoulInterfaceProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  const userProfile = useGameStore(
    (state) => state.userProfile,
    shallow
  );
  const setUIVisibility = useUIStore((state) => state.setUIVisibility);

  // Reset animation state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Prevent body scroll and hide header/navMenu when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setUIVisibility(false);
    } else {
      document.body.style.overflow = 'unset';
      setUIVisibility(true);
    }
    return () => {
      document.body.style.overflow = 'unset';
      setUIVisibility(true);
    };
  }, [isOpen, setUIVisibility]);

  if (!userProfile) return null;

  // Calculate overall rank
  const overallRank = calculateOverallRank({
    body: userProfile.body_points,
    mind: userProfile.mind_points,
    soul: userProfile.soul_points,
    will: userProfile.will_points || 0,
  });

  // Convert stat points to rank letter
  const getStatRank = (points: number): string => {
    if (points >= 60) return 'S';
    if (points >= 55) return 'A+';
    if (points >= 50) return 'A';
    if (points >= 45) return 'B+';
    if (points >= 40) return 'B';
    if (points >= 35) return 'C+';
    if (points >= 30) return 'C';
    if (points >= 25) return 'D+';
    if (points >= 20) return 'D';
    if (points >= 15) return 'E+';
    if (points >= 10) return 'E';
    if (points >= 5) return 'F+';
    return 'F';
  };

  // Calculate progress to next rank (0-100%)
  const getProgressToNextRank = (points: number): number => {
    const thresholds = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    
    let currentThreshold = 0;
    let nextThreshold = 5;
    
    for (let i = 0; i < thresholds.length - 1; i++) {
      if (points >= thresholds[i] && points < thresholds[i + 1]) {
        currentThreshold = thresholds[i];
        nextThreshold = thresholds[i + 1];
        break;
      }
    }
    
    if (points >= 60) return 100;
    
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  // Orbiting paths configuration - Static positioning around upper half circle
  const staticPaths = [
    { icon: GiSwordSmithing, color: '#ef4444', label: 'Body', x: -90, y: -35 },
    { icon: GiBrain, color: '#8b5cf6', label: 'Mind', x: -40, y: -90 },
    { icon: GiWaterBolt, color: '#06b6d4', label: 'Soul', x: 40, y: -90 },
    { icon: GiFireShield, color: '#f59e0b', label: 'Will', x: 90, y: -35 },
  ];

  // Stats configuration
  const stats = [
    { 
      key: 'body', 
      points: userProfile.body_points, 
      icon: GiSwordSmithing, 
      label: 'BODY',
      gradient: 'linear-gradient(to right, #f59e0b, #d97706)'
    },
    { 
      key: 'mind', 
      points: userProfile.mind_points, 
      icon: GiBrain, 
      label: 'MIND',
      gradient: 'linear-gradient(to right, #06b6d4, #0891b2)'
    },
    { 
      key: 'soul', 
      points: userProfile.soul_points, 
      icon: GiWaterBolt, 
      label: 'SOUL',
      gradient: 'linear-gradient(to right, #ec4899, #db2777)'
    },
    { 
      key: 'will', 
      points: userProfile.will_points || 0, 
      icon: GiFireShield, 
      label: 'WILL',
      gradient: 'linear-gradient(to right, #8b5cf6, #7c3aed)'
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          onClick={onClose}
          style={{ 
            transform: 'translateZ(0)',
            willChange: 'opacity',
          }}
        >
          {/* Background - simplified, no heavy blur during animation */}
          <div 
            className="absolute inset-0"
            style={{
              backdropFilter: isAnimating ? 'none' : 'blur(4px)',
              WebkitBackdropFilter: isAnimating ? 'none' : 'blur(4px)',
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 70%)',
              transition: 'backdrop-filter 300ms ease-out',
            }}
          />

          {/* Main Window - responsive height with vh units */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            onAnimationComplete={handleAnimationComplete}
            className="relative w-full bg-slate-900/95 border-2 border-purple-500/30 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: 'min(24rem, 90vw)',
              height: 'min(92vh, 700px)',
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateZ(0)',
              willChange: 'transform, opacity',
            }}
          >
            {/* Header Title - responsive font */}
            <div className="pt-4 pb-4 text-center flex-shrink-0 mb-6" style={{ paddingTop: 'clamp(12px, 2vh, 20px)' }}>
              <h1 
                className="font-black text-purple-400"
                style={{
                  fontSize: 'clamp(1.25rem, 4vh, 1.875rem)',
                  textShadow: isAnimating ? 'none' : '0 1px 0 rgba(0, 0, 0, 0.8), 0 0 10px rgba(168, 85, 247, 0.6)',
                  transition: 'text-shadow 200ms ease-out',
                }}
              >
                {userProfile.display_name.toUpperCase()}
              </h1>
            </div>

            {/* Central Rank Emblem with Static Path Icons - responsive */}
            <div 
              className="relative flex items-center justify-center flex-shrink-0"
              style={{ 
                paddingTop: 'clamp(8px, 1vh, 24px)',
                paddingBottom: 'clamp(8px, 1vh, 24px)',
                marginTop: 'clamp(16px, 4vh, 48px)',
              }}
            >
              {/* Static Path Icons around upper half circle - responsive positioning */}
              {staticPaths.map((path) => {
                const Icon = path.icon;
                // Scale positions based on viewport
                const scaleFactor = 0.9;
                return (
                  <div
                    key={path.label}
                    className="absolute z-30"
                    style={{
                      left: `calc(50% + ${path.x * scaleFactor}px)`,
                      top: `calc(50% + ${path.y * scaleFactor}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div
                      className="rounded-full backdrop-blur-sm"
                      style={{
                        padding: 'clamp(8px, 1.5vh, 12px)',
                        background: `${path.color}20`,
                        border: `1px solid ${path.color}60`,
                        boxShadow: isAnimating ? 'none' : `0 0 8px ${path.color}50`,
                        transition: 'box-shadow 200ms ease-out',
                      }}
                    >
                      <Icon 
                        className="text-current" 
                        style={{ 
                          color: path.color,
                          width: 'clamp(20px, 3vh, 28px)',
                          height: 'clamp(20px, 3vh, 28px)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Central Shield/Emblem - responsive size */}
              <div className="relative z-10">
                <RankCircle
                  rankTier={overallRank.rankTier}
                  glowColor={getRankGlowColor(overallRank.rankTier)}
                  rankStyle={getRankStyle(overallRank.rankTier)}
                  size={80}
                  plasmaIntensity={isAnimating ? 0 : getRankPlasmaIntensity(overallRank.rankTier)}
                />
              </div>
            </div>

            {/* Glass Conduit Stats */}
            <div 
              className="flex-1 "
              style={{ 
                paddingLeft: 'clamp(16px, 4vw, 40px)',
                paddingRight: 'clamp(16px, 4vw, 40px)',
                paddingBottom: 'clamp(8px, 3vh, 16px)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2px, 1vh, 12px)' }}>
              {stats.map((stat, index) => {
                const rank = getStatRank(stat.points);
                const progress = getProgressToNextRank(stat.points);
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.key}
                  >
                    {/* Label Row - responsive font sizes */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="ml-1 flex items-center gap-2">
                        <Icon 
                          className="text-current"
                          style={{ 
                            color: getRankGlowColor(rank),
                            filter: isAnimating ? 'none' : `drop-shadow(0 0 3px ${getRankGlowColor(rank)}60)`,
                            transition: 'filter 200ms ease-out',
                            width: 'clamp(24px, 4vh, 32px)',
                            height: 'clamp(24px, 4vh, 32px)',
                          }}
                        />
                        <span 
                          className="font-bold tracking-widest text-slate-300"
                          style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.875rem)' }}
                        >
                          {stat.label}
                        </span>
                      </div>
                      <span 
                        className="font-black mr-3"
                        style={{
                          ...getRankStyle(rank),
                          fontSize: 'clamp(1.25rem, 4vh, 1.875rem)',
                        }}
                      >
                        {rank}
                      </span>
                    </div>

                    {/* Progress Bar - responsive height */}
                    <div 
                      className="relative rounded-xl overflow-hidden"
                      style={{
                        height: 'clamp(24px, 4vh, 32px)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                      }}
                    >
                      {/* The Fill Bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{
                          duration: 1.5,
                          delay: 0.7 + index * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="relative h-full rounded-xl"
                      >
                        {/* 1. Base Glow - Using rank color */}
                        <div className="absolute inset-0 opacity-90 blur-[2px]" style={{ background: `linear-gradient(to right, ${getRankGlowColor(rank)}90, ${getRankGlowColor(rank)}60)` }} />
                        
                        {/* 2. Core Beam */}
                        <div className="absolute inset-y-[25%] left-0 right-1 opacity-50 blur-[1px]" style={{ background: `linear-gradient(to right, transparent, ${getRankGlowColor(rank)}40, ${getRankGlowColor(rank)}30)` }} />

                        {/* 3. Lightning Texture */}
                          <div 
                          className="absolute inset-0 w-full h-full opacity-50 mix-blend-overlay animate-lightning-flow"
                            style={{ 
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='100%25' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 10 0 20 10 T 40 10' fill='none' stroke='%23ffffff' stroke-width='2' opacity='0.95'/%3E%3C/svg%3E")`,
                            backgroundSize: '30px 100%',
                          }}
                        />

                        {/* 4. Flash Tip */}
                        <div className="absolute right-0 top-0 h-full w-[1.5px] z-20" style={{ background: `${getRankGlowColor(rank)}40`, boxShadow: `0 0 6px 2px ${getRankGlowColor(rank)}30` }} />
                        
                        {/* 5. Lens Flare */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-[110%] blur-md rounded-full -translate-x-1/2" style={{ background: `${getRankGlowColor(rank)}20` }} />
                      </motion.div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Close Button - responsive padding */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.2 }}
              className="flex-shrink-0"
              style={{ 
                paddingLeft: 'clamp(16px, 4vw, 36px)',
                paddingRight: 'clamp(16px, 4vw, 36px)',
                paddingBottom: 'clamp(12px, 3vh, 32px)',
              }}
            >
              <button
                onClick={onClose}
                className="relative w-full py-4 rounded-xl border border-purple-700/50 bg-purple-950/30 text-purple-300 font-bold uppercase tracking-widest overflow-hidden hover:bg-purple-900/40 transition-colors"
              >
                {/* Scanline animation */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 50%, transparent 100%)',
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                />
                <span className="relative z-10">CLOSE SYSTEM WINDOW</span>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoulInterface;

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiSwordSmithing, GiBrain, GiFireShield, GiWaterBolt } from 'react-icons/gi';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { getRankStyle, getRankGlowColor } from '@/utils/rankStyles';
import { calculateOverallRank } from '@/utils/overallRank';
import { shallow } from 'zustand/shallow';

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
    { icon: GiSwordSmithing, color: '#ef4444', label: 'Body', x: -80, y: -50 },
    { icon: GiBrain, color: '#8b5cf6', label: 'Mind', x: -30, y: -90 },
    { icon: GiWaterBolt, color: '#06b6d4', label: 'Soul', x: 30, y: -90 },
    { icon: GiFireShield, color: '#f59e0b', label: 'Will', x: 80, y: -50 },
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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
          style={{ transform: 'translateZ(0)' }}
        >
          {/* Background with glassmorphism and nebula - disable blur during animation */}
          <div 
            className="absolute inset-0 bg-slate-950/90"
            style={{
              backdropFilter: isAnimating ? 'none' : 'blur(16px)',
              WebkitBackdropFilter: isAnimating ? 'none' : 'blur(16px)',
              background: `
                radial-gradient(circle at center, rgba(46, 16, 101, 0.3) 0%, transparent 70%),
                linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)
              `,
              transition: 'backdrop-filter 200ms ease-out',
            }}
          >
            {/* Subtle noise texture overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
              }}
            />
          </div>

          {/* Main Window - disable heavy effects during animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            onAnimationComplete={handleAnimationComplete}
            className="relative max-w-md w-full bg-slate-900/40 border-2 border-purple-500/30 rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              transform: 'translateZ(0)',
              maxHeight: '90vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              backdropFilter: isAnimating ? 'none' : 'blur(12px)',
              WebkitBackdropFilter: isAnimating ? 'none' : 'blur(12px)',
              boxShadow: isAnimating ? 'none' : '0 0 50px rgba(139, 92, 246, 0.3)',
              transition: 'backdrop-filter 200ms ease-out, box-shadow 200ms ease-out',
            }}
          >
            {/* Header Title */}
            <div className="pt-8 pb-4 text-center mb-16">
              <motion.h1 
                className="text-3xl font-black tracking-wider text-purple-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  textShadow: '0 0 20px rgba(168, 85, 247, 0.6)',
                }}
              >
                {userProfile.display_name.toUpperCase()}
              </motion.h1>
            </div>

            {/* Central Rank Emblem with Static Path Icons */}
            <div className="relative flex items-center justify-center py-6 ">
              {/* Static Path Icons around upper half circle */}
              {staticPaths.map((path, index) => {
                const Icon = path.icon;
                return (
                  <motion.div
                    key={path.label}
                    className="absolute z-30"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                    }}
                    transition={{
                      opacity: { delay: 0.3 + index * 0.1, duration: 0.4 },
                      scale: { delay: 0.3 + index * 0.1, duration: 0.4 },
                    }}
                    style={{
                      left: `calc(50% + ${path.x}px - 18px)`,
                      top: `calc(50% + ${path.y}px - 15px )`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div
                      className="rounded-full p-2 backdrop-blur-sm"
                      style={{
                        background: `${path.color}20`,
                        border: `1px solid ${path.color}60`,
                        boxShadow: isAnimating ? 'none' : `0 0 20px ${path.color}60`,
                        transition: 'box-shadow 200ms ease-out',
                      }}
                    >
                      <Icon 
                        className="h-5 w-5" 
                        strokeWidth={2.5}
                        style={{ color: path.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}

              {/* Central Shield/Emblem */}
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1,
                }}
                className="relative z-10  "
              >
                {/* Hexagonal Shield Background */}
                <div 
                  className="relative w-20 h-20 flex items-center justify-center rounded-full"
                  style={{
                    background: `
                      radial-gradient(circle, ${getRankGlowColor(overallRank.rankTier)}40 0%, ${getRankGlowColor(overallRank.rankTier)}10 50%, transparent 100%),
                      linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 10, 45, 0.9) 100%)
                    `,
                    border: `3px solid ${getRankGlowColor(overallRank.rankTier)}`,
                    boxShadow: isAnimating ? 'none' : `
                      0 0 30px ${getRankGlowColor(overallRank.rankTier)}80,
                      inset 0 0 30px ${getRankGlowColor(overallRank.rankTier)}20,
                      0 0 60px ${getRankGlowColor(overallRank.rankTier)}40
                    `,
                    transition: 'box-shadow 200ms ease-out',
                  }}
                >
                  {/* Rank Letter */}
                  <motion.span
                    className="text-5xl font-black"
                    style={{
                      ...getRankStyle(overallRank.rankTier),
                      textShadow: isAnimating ? 'none' : `0 0 20px ${getRankGlowColor(overallRank.rankTier)}`,
                      transition: 'text-shadow 200ms ease-out',
                    }}
                  >
                    {overallRank.rankTier}
                  </motion.span>
                </div>

                {/* Rotating Ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid ${getRankGlowColor(overallRank.rankTier)}30`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            </div>

            {/* Glass Conduit Stats */}
            <div className="px-8 pb-8 space-y-4 ">
              {stats.map((stat, index) => {
                const rank = getStatRank(stat.points);
                const progress = getProgressToNextRank(stat.points);
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.key}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.5 + index * 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                    }}
                    className="space-y-2"
                  >
                    {/* Label Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon 
                          className="h-4 w-4" 
                          strokeWidth={2.5}
                          style={{ 
                            color: getRankGlowColor(rank),
                            filter: isAnimating ? 'none' : `drop-shadow(0 0 4px ${getRankGlowColor(rank)}80)`,
                            transition: 'filter 200ms ease-out',
                          }}
                        />
                        <span className="text-xs font-bold tracking-widest text-slate-300">
                          {stat.label}
                        </span>
                      </div>
                      <span 
                        className="text-sm font-black mr-2"
                        style={getRankStyle(rank)}
                      >
                        {rank}
                      </span>
                    </div>

                    {/* Progress Bar with Thunder Animation */}
                    <div 
                      className="relative h-8 rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
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
                  </motion.div>
                );
              })}
            </div>

            {/* Close Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="px-8 pb-8"
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
                    duration: 1.5,
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

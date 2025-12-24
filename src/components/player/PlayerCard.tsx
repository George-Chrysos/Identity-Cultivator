import { useState, lazy, Suspense, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getRankStyle, getRankGlowColor } from '@/utils/rankStyles';
import { calculateOverallRank } from '@/utils/overallRank';
import { shallow } from 'zustand/shallow';

// Lazy load SoulInterface
const SoulInterface = lazy(() => import('./SoulInterface'));

// Medallion size constants
const MEDALLION_SIZE = 88;
const CUTOUT_RADIUS = 46;

// --- NEW COMPONENT: The Plasma/Lightning Sphere ---
const PlasmaSphere = ({ rankTier, glowColor, rankStyle }: { rankTier: string; glowColor: string; rankStyle: React.CSSProperties }) => {
  // Animation variants for the rotating energy layers
  const spinClockwise = {
    animate: { rotate: 360 },
    transition: { duration: 8, repeat: Infinity, ease: "linear" as const }
  };
  const spinCounterClockwise = {
    animate: { rotate: -360 },
    transition: { duration: 5, repeat: Infinity, ease: "linear" as const }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
       {/* 1. Outer Atmosphere Bloom (Static Glow outside sphere) */}
       <div 
          className="absolute inset-0 rounded-full opacity-60 blur-xl"
          style={{ background: glowColor, transform: 'scale(1.4)' }}
       />

      {/* 2. The Main Sphere Container (The Containment Field) */}
      <div 
        className="relative w-full h-full rounded-full overflow-hidden z-10"
        style={{
          // Purple border matching PathCard style
          border: '2px solid rgba(168, 85, 245, 0.5)',
          // Shadow matching PathCard style
          boxShadow: '0 0 12px rgba(76,29,149,0.4)'
        }}
      >
        {/* Dark Core Background - Deep radial gradient fading to near-black */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, rgba(15, 23, 42, 0.6) 0%, #020617 70%, #020617 100%)`
          }}
        />
        
        {/* 3. Plasma Layer 1 (Slow base swirl) - Outer ring only */}
        <motion.div
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-70 mix-blend-screen"
          {...spinClockwise}
          style={{
            // Ring-shaped gradients that stay on the outer edge
            background: `
              radial-gradient(circle at 30% 40%, ${glowColor} 0%, transparent 30%),
              radial-gradient(circle at 70% 60%, ${glowColor}40 0%, transparent 35%),
              radial-gradient(circle at 50% 20%, ${glowColor}60 0%, transparent 25%),
              radial-gradient(circle at 80% 40%, ${glowColor}50 0%, transparent 30%)
            `
          }}
        />

        {/* 4. Plasma Layer 2 (Faster, opposing swirl for interference patterns) - Outer ring only */}
        <motion.div
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-80 mix-blend-screen"
          {...spinCounterClockwise}
          style={{
            // Different offset positions, keeping to outer edges
            background: `
              radial-gradient(circle at 60% 30%, ${glowColor} 0%, transparent 28%),
              radial-gradient(circle at 20% 80%, ${glowColor}60 0%, transparent 32%),
              radial-gradient(circle at 85% 70%, ${glowColor}50 0%, transparent 25%)
            `
          }}
        />

         {/* 5. Core Mask - Darkens the center to create the outer ring effect */}
         <div 
            className="absolute inset-0 z-10"
            style={{
                background: `radial-gradient(circle at center, #020617 0%, #020617 35%, transparent 60%)`
            }}
         />

        {/* 6. The Rank Text */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <span 
            className="text-3xl font-black  tracking-tighter "
            style={{ 
              ...rankStyle,
              marginLeft: '-5%',
              // Subtle black outline for visibility + stronger colored glow for aesthetics
              textShadow: `
                -1px -1px 0 rgba(0, 0, 0, 0.8),
                1px -1px 0 rgba(0, 0, 0, 0.8),
                0 0 24px ${glowColor}20,
                0 0 32px ${glowColor}40,
                0 0 40px ${glowColor}60
              ` 
            }}
          >
            {rankTier}
          </span>
        </div>
      </div>
    </div>
  );
};


const PlayerCard = memo(() => {
  const userProfile = useGameStore(
    (state) => state.userProfile,
    shallow
  );
  const [showSoulInterface, setShowSoulInterface] = useState(false);

  const handleOpenProfile = useCallback(() => {
    setShowSoulInterface(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowSoulInterface(false);
  }, []);

  if (!userProfile) return null;

  const overallRank = calculateOverallRank({
    body: userProfile.body_points,
    mind: userProfile.mind_points,
    soul: userProfile.soul_points,
    will: userProfile.will_points || 0,
  });

  const glowColor = getRankGlowColor(overallRank.rankTier);
  const rankStyle = getRankStyle(overallRank.rankTier);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-center px-4"
      >
        <div className="relative max-w-2xl w-full" style={{ overflow: 'visible', minHeight: '88px', display: 'flex', alignItems: 'center' }}>
          {/* The Obsidian Bar Container with CSS Mask Cutout */}
          <motion.div
            className="glass-panel-purple w-full h-14 flex items-center justify-between px-6 cursor-pointer group"
            style={{
              maskImage: `radial-gradient(circle ${CUTOUT_RADIUS}px at center, transparent 99%, black 100%)`,
              WebkitMaskImage: `radial-gradient(circle ${CUTOUT_RADIUS}px at center, transparent 99%, black 100%)`,
              overflow: 'visible',
            }}
            onClick={handleOpenProfile}
            whileTap={{ scale: 0.98 }}
          >
            {/* Top Edge Chromatic Glow effect (added back for high fidelity) */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

            {/* Left Text: RANK */}
            <span 
              className="text-s font-black uppercase text-violet-500 transition-colors group-hover:text-violet-400"
              style={{ 
                letterSpacing: '0.3em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              RANK
            </span>

            {/* Right Icon: Chevron */}
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ color: glowColor }}
            >
              <ChevronDown 
                className="w-5 h-5"
                style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
              />
            </motion.div>
          </motion.div>

          {/* --- The NEW Plasma Sphere Medallion --- */}
          <motion.div
            className="absolute flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: MEDALLION_SIZE,
              height: MEDALLION_SIZE,
              top: '0%',
              left: '36%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            {/* Replaced the entire metal structure with the PlasmaSphere component */}
            <PlasmaSphere 
                rankTier={overallRank.rankTier} 
                glowColor={glowColor} 
                rankStyle={rankStyle}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Soul Interface Modal */}
      {showSoulInterface && (
        <Suspense fallback={null}>
          <SoulInterface
            isOpen={showSoulInterface}
            onClose={handleCloseProfile}
          />
        </Suspense>
      )}
    </>
  );
});

PlayerCard.displayName = 'PlayerCard';

export default PlayerCard;
import { useState, lazy, Suspense, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getRankStyle, getRankGlowColor } from '@/utils/rankStyles';
import { calculateOverallRank, getRankPlasmaIntensity } from '@/utils/overallRank';
import { shallow } from 'zustand/shallow';
import RankCircle from './RankCircle';

// Lazy load SoulInterface
const SoulInterface = lazy(() => import('./SoulInterface'));

// Medallion size constants
const MEDALLION_SIZE = 90;
const CUTOUT_RADIUS = 46;


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
              top: '-2%',
              left: '35%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <RankCircle 
              rankTier={overallRank.rankTier} 
              glowColor={glowColor} 
              rankStyle={rankStyle}
              size={MEDALLION_SIZE}
              plasmaIntensity={getRankPlasmaIntensity(overallRank.rankTier)}
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
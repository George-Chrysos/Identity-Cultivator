/**
 * Milestone Celebration Component
 * 
 * The "Cyan Supernova" celebration when a streak milestone is reached.
 * Includes: Flash, Shockwave, Particle Rain, and WILL TEMPERED stamp.
 * 
 * @module components/streak/MilestoneCelebration
 */

import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { GPU_ACCELERATION_STYLES } from '@/components/common';

// ==================== TYPES ====================

interface MilestoneCelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
  willGained?: number;
  level?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  delay: number;
  duration: number;
}

// ==================== CONSTANTS ====================

const CYAN_COLOR = '#00f2ff';
const FLASH_DURATION = 100; // ms - faster flash
const SHOCKWAVE_DURATION = 400; // ms - faster shockwave
const PARTICLE_COUNT = 30;
const CELEBRATION_TOTAL_DURATION = 1800; // ms - faster overall animation

// ==================== SUB-COMPONENTS ====================

/**
 * The Flash - 150ms Cyan-tinted full-screen overlay
 */
const CyanFlash = memo(({ onComplete }: { onComplete?: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), FLASH_DURATION);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ backgroundColor: `rgba(0, 242, 255, 0.3)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: FLASH_DURATION / 1000 }}
    />
  );
});
CyanFlash.displayName = 'CyanFlash';

/**
 * The Shockwave - Radial SVG ring expanding from center
 */
const Shockwave = memo(() => (
  <motion.div
    className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center"
    style={GPU_ACCELERATION_STYLES}
  >
    <motion.div
      className="rounded-full border-4"
      style={{ borderColor: CYAN_COLOR, ...GPU_ACCELERATION_STYLES }}
      initial={{ width: 50, height: 50, opacity: 1 }}
      animate={{ 
        width: ['50px', '400vw'],
        height: ['50px', '400vh'],
        opacity: [1, 0],
      }}
      transition={{ 
        duration: SHOCKWAVE_DURATION / 1000,
        ease: 'easeOut',
      }}
    />
  </motion.div>
));
Shockwave.displayName = 'Shockwave';

/**
 * Digital Cinders - Small cyan rectangles floating upward
 */
const ParticleRain = memo(() => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // vw
      y: 100 + Math.random() * 20, // Start below screen
      width: 2 + Math.random() * 6,
      height: 8 + Math.random() * 16,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-[9997] pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}vw`,
            bottom: `-${particle.height}px`,
            width: particle.width,
            height: particle.height,
            background: `linear-gradient(to top, ${CYAN_COLOR}, ${CYAN_COLOR}80)`,
            borderRadius: 2,
            boxShadow: `0 0 10px ${CYAN_COLOR}`,
            ...GPU_ACCELERATION_STYLES,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ 
            y: -window.innerHeight - 100,
            opacity: [1, 1, 0],
            rotate: Math.random() > 0.5 ? 45 : -45,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
});
ParticleRain.displayName = 'ParticleRain';

/**
 * WILL TEMPERED Stamp - Jagged ticket-edged seal
 */
const WillTemperedStamp = memo(({ willGained, level }: { willGained?: number; level?: number }) => (
  <motion.div
    className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center"
    style={GPU_ACCELERATION_STYLES}
  >
    <motion.div
      className="relative"
      initial={{ scale: 3, opacity: 0, rotate: -15 }}
      animate={{ 
        scale: [3, 0.9, 1],
        opacity: [0, 1, 1],
        rotate: [-15, 5, 0],
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        duration: 0.4,
        times: [0, 0.6, 1],
        ease: 'easeOut',
      }}
    >
      {/* Jagged ticket edge container */}
      <svg
        width="320"
        height="160"
        viewBox="0 0 320 160"
        className="drop-shadow-[0_0_30px_rgba(0,242,255,0.8)]"
      >
        {/* Ticket path with jagged edges */}
        <defs>
          <linearGradient id="stampGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={CYAN_COLOR} />
            <stop offset="50%" stopColor="#00d4e6" />
            <stop offset="100%" stopColor={CYAN_COLOR} />
          </linearGradient>
          <filter id="stampGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Jagged border path */}
        <path
          d="M10,10 
             L30,10 L32,5 L34,10 L50,10 L52,5 L54,10 L70,10 L72,5 L74,10 
             L90,10 L92,5 L94,10 L110,10 L112,5 L114,10 L130,10 L132,5 L134,10
             L150,10 L152,5 L154,10 L170,10 L172,5 L174,10 L190,10 L192,5 L194,10
             L210,10 L212,5 L214,10 L230,10 L232,5 L234,10 L250,10 L252,5 L254,10
             L270,10 L272,5 L274,10 L290,10 L292,5 L294,10 L310,10
             L310,30 L315,32 L310,34 L310,50 L315,52 L310,54 L310,70 L315,72 L310,74
             L310,90 L315,92 L310,94 L310,110 L315,112 L310,114 L310,130 L315,132 L310,134 L310,150
             L290,150 L288,155 L286,150 L270,150 L268,155 L266,150 L250,150 L248,155 L246,150
             L230,150 L228,155 L226,150 L210,150 L208,155 L206,150 L190,150 L188,155 L186,150
             L170,150 L168,155 L166,150 L150,150 L148,155 L146,150 L130,150 L128,155 L126,150
             L110,150 L108,155 L106,150 L90,150 L88,155 L86,150 L70,150 L68,155 L66,150
             L50,150 L48,155 L46,150 L30,150 L28,155 L26,150 L10,150
             L10,130 L5,128 L10,126 L10,110 L5,108 L10,106 L10,90 L5,88 L10,86
             L10,70 L5,68 L10,66 L10,50 L5,48 L10,46 L10,30 L5,28 L10,26
             Z"
          fill="rgba(15, 23, 42, 0.95)"
          stroke="url(#stampGradient)"
          strokeWidth="3"
          filter="url(#stampGlow)"
        />
        
        {/* Inner decorative border */}
        <rect
          x="25"
          y="25"
          width="270"
          height="110"
          fill="none"
          stroke={CYAN_COLOR}
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity="0.5"
        />
      </svg>
      
      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-3xl font-black tracking-widest"
          style={{
            color: CYAN_COLOR,
            textShadow: `0 0 20px ${CYAN_COLOR}, 0 0 40px ${CYAN_COLOR}80`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          WILL TEMPERED
        </motion.div>
        
        {willGained !== undefined && (
          <motion.div
            className="text-lg font-bold mt-2"
            style={{ color: '#a5f3fc' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            +{willGained.toFixed(2)} Will
          </motion.div>
        )}
        
        {level !== undefined && (
          <motion.div
            className="text-sm font-medium mt-1 opacity-70"
            style={{ color: '#67e8f9' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.6 }}
          >
            Level {level} Complete
          </motion.div>
        )}
      </div>
    </motion.div>
  </motion.div>
));
WillTemperedStamp.displayName = 'WillTemperedStamp';

// ==================== MAIN COMPONENT ====================

export const MilestoneCelebration = memo(({
  isVisible,
  onComplete,
  willGained,
  level,
}: MilestoneCelebrationProps) => {
  const [showFlash, setShowFlash] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showStamp, setShowStamp] = useState(false);

  const handleFlashComplete = useCallback(() => {
    setShowFlash(false);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setShowFlash(false);
      setShowShockwave(false);
      setShowParticles(false);
      setShowStamp(false);
      return;
    }

    // Sequence the celebration effects
    // 1. Flash (0-150ms)
    setShowFlash(true);
    
    // 2. Shockwave (50ms delay)
    const shockwaveTimer = setTimeout(() => setShowShockwave(true), 50);
    
    // 3. Particles (100ms delay)
    const particleTimer = setTimeout(() => setShowParticles(true), 100);
    
    // 4. Stamp (200ms delay - after flash settles)
    const stampTimer = setTimeout(() => setShowStamp(true), 200);
    
    // 5. Complete callback
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, CELEBRATION_TOTAL_DURATION);

    // Cleanup effects after celebration
    const cleanupTimer = setTimeout(() => {
      setShowShockwave(false);
      setShowParticles(false);
      setShowStamp(false);
    }, CELEBRATION_TOTAL_DURATION - 500);

    // Trigger haptic feedback (heavy)
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 100, 50, 150]);
    }

    return () => {
      clearTimeout(shockwaveTimer);
      clearTimeout(particleTimer);
      clearTimeout(stampTimer);
      clearTimeout(completeTimer);
      clearTimeout(cleanupTimer);
    };
  }, [isVisible, onComplete]);

  // Use portal to render at document root for full-screen overlay
  const content = (
    <AnimatePresence>
      {isVisible && (
        <>
          {showFlash && <CyanFlash onComplete={handleFlashComplete} />}
          {showShockwave && <Shockwave />}
          {showParticles && <ParticleRain />}
          {showStamp && <WillTemperedStamp willGained={willGained} level={level} />}
        </>
      )}
    </AnimatePresence>
  );

  // Render to body for full-screen effect
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
});

MilestoneCelebration.displayName = 'MilestoneCelebration';

export default MilestoneCelebration;

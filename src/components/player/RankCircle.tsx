import { motion } from 'framer-motion';

interface RankCircleProps {
  rankTier: string;
  glowColor: string;
  rankStyle: React.CSSProperties;
  size?: number;
  plasmaIntensity?: number; // 0-100, higher ranks = higher value
}

const RankCircle = ({ rankTier, glowColor, rankStyle, size = 88, plasmaIntensity = 15 }: RankCircleProps) => {
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
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* 1. Outer Atmosphere Bloom (Static Glow outside sphere) */}
      <div 
        className="absolute inset-0 rounded-full opacity-60 blur-xl"
        style={{ background: glowColor, transform: 'scale(0.6)' }}
      />

      {/* 2. The Main Sphere Container (The Containment Field) */}
      <div 
        className="relative w-full h-full rounded-full overflow-hidden z-10"
        style={{
          border: '2px solid rgba(168, 85, 245, 0.5)',
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
            background: `
              radial-gradient(circle at 30% 40%, ${glowColor} 0%, transparent 20%),
              radial-gradient(circle at 70% 60%, ${glowColor}40 0%, transparent 35%),
              radial-gradient(circle at 50% 20%, ${glowColor}60 0%, transparent 35%),
              radial-gradient(circle at 80% 40%, ${glowColor}50 0%, transparent 20%)
            `
          }}
        />

        {/* 4. Plasma Layer 2 (Faster, opposing swirl for interference patterns) - Outer ring only */}
        <motion.div
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-80 mix-blend-screen"
          {...spinCounterClockwise}
          style={{
            background: `
              radial-gradient(circle at 60% 30%, ${glowColor} 0%, transparent 38%),
              radial-gradient(circle at 20% 80%, ${glowColor}60 0%, transparent ${plasmaIntensity}%),
              radial-gradient(circle at 85% 70%, ${glowColor}50 0%, transparent ${plasmaIntensity}%)
            `
          }}
        />

        {/* 5. Core Mask - Darkens the center to create the outer ring effect */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: `radial-gradient(circle at center, #020617 0%, #020617 35%, transparent 50%)`
          }}
        />

        {/* 6. The Rank Text */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <span 
            className="text-3xl font-black tracking-tighter"
            style={{ 
              ...rankStyle,
              marginLeft: '-3%',
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

export default RankCircle;

import { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Clock, TrendingUp, Coins } from 'lucide-react';
import { formatTimeRemaining, getInflationResetTime, getInflationLevel } from '@/utils/inflationCalculator';
import { GPU_ACCELERATION_STYLES } from '@/components/common';

interface TicketCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  basePrice: number;
  currentPrice?: number;
  isInflated?: boolean;
  inflationResetTime?: string;
  currentCoins: number;
  onPurchase?: () => void;
  disabled?: boolean;
  /** Rarity tier for glow color: 'common' | 'luxury' | 'exclusive' */
  rarity?: 'common' | 'luxury' | 'exclusive';
}

// ==================== CYBERPUNK COLOR PALETTE ====================
const COLORS = {
  obsidian: '#050A0E',
  neonYellow: '#FCEE09',
  cyberRed: '#FF003C',
  brainFreeze: '#00F0FF',
  // Rarity-based glows with shadow intensities
  common: { primary: '#00F0FF', secondary: '#C0C0C0', shadow: '0 0 15px rgba(0,240,255,0.3)' },
  luxury: { primary: '#FFD700', secondary: '#F59E0B', shadow: '0 0 20px rgba(252,238,9,0.3)' },
  exclusive: { primary: '#E879F9', secondary: '#A855F7', shadow: '0 0 25px rgba(255,0,60,0.3)' },
} as const;

// ==================== TICKET CLIP PATHS ====================
// Semi-circular notch cutouts at precisely 70% height using mask-image approach
// This creates the "clamped" punch-out look like a physical ticket
const TICKET_MASK = `
  radial-gradient(circle at 0% 70%, transparent 12px, black 12px),
  radial-gradient(circle at 100% 70%, transparent 12px, black 12px)
`;

// Icon container clip path - hexagonal circuit grid style
const ICON_CLIP_PATH = 'polygon(15% 0%, 85% 0%, 100% 25%, 100% 75%, 85% 100%, 15% 100%, 0% 75%, 0% 25%)';

export const TicketCard = memo(({
  icon: Icon,
  title,
  description,
  basePrice,
  currentPrice,
  isInflated = false,
  inflationResetTime,
  currentCoins,
  onPurchase,
  disabled = false,
  rarity = 'common',
}: TicketCardProps) => {
  const displayPrice = currentPrice || basePrice;
  const canAfford = currentCoins >= displayPrice && !disabled;
  const inflationPercent = isInflated && currentPrice ? ((currentPrice - basePrice) / basePrice) * 100 : 0;
  const inflationInfo = getInflationLevel(inflationPercent);
  
  const [timeRemaining, setTimeRemaining] = useState('');
  const [glitchActive, setGlitchActive] = useState(false);
  const [hologramPhase, setHologramPhase] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  // Get rarity colors and shadow
  const rarityColors = COLORS[rarity];
  const glowColor = isInflated ? COLORS.cyberRed : rarityColors.primary;
  const secondaryGlow = rarityColors.secondary;
  const rarityShadow = isInflated ? '0 0 20px rgba(255,0,60,0.4)' : rarityColors.shadow;

  // Update countdown timer
  useEffect(() => {
    if (!inflationResetTime) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const remaining = getInflationResetTime(inflationResetTime);
      setTimeRemaining(formatTimeRemaining(remaining));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [inflationResetTime]);

  // Holographic shimmer animation - subtle movement
  useEffect(() => {
    const shimmerInterval = setInterval(() => {
      setHologramPhase(prev => (prev + 0.5) % 360);
    }, 100);
    return () => clearInterval(shimmerInterval);
  }, []);

  // Periodic glitch effect on price (micro-interaction every 5-10s)
  useEffect(() => {
    if (!isInflated) return;
    
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(glitchInterval);
  }, [isInflated]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAfford && onPurchase) {
      onPurchase();
    }
  }, [canAfford, onPurchase]);
  
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Holographic gradient that shifts with phase - subtle foil effect
  const holographicGradient = useMemo(() => {
    return `linear-gradient(
      ${135 + hologramPhase * 0.1}deg,
      transparent 40%,
      rgba(255,255,255,0.05) 50%,
      transparent 60%
    )`;
  }, [hologramPhase]);

  return (
    <motion.div
      className="relative w-[90%] max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={canAfford ? { scale: 1.02 } : {}}
      whileTap={canAfford ? { scale: 0.95 } : {}}
      onAnimationComplete={handleAnimationComplete}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      style={GPU_ACCELERATION_STYLES}
    >
      {/* Main Ticket Container with mask-based cutouts */}
      <div
        className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
          canAfford ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
        }`}
        style={{
          // Mask creates semi-circular notches at 70% height
          WebkitMaskImage: TICKET_MASK,
          WebkitMaskComposite: 'source-in',
          maskImage: TICKET_MASK,
          maskComposite: 'intersect',
          background: `linear-gradient(180deg, ${COLORS.obsidian} 0%, rgba(15,23,42,0.95) 100%)`,
          backdropFilter: isAnimating ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isAnimating ? 'none' : 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: glowColor,
          borderTopWidth: '3px',
          boxShadow: canAfford && !isAnimating ? rarityShadow : 'none',
          transition: 'box-shadow 200ms ease-out, backdrop-filter 200ms ease-out',
        }}
      >
        {/* Holographic Foil Overlay - subtle shimmer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ 
            background: holographicGradient,
            opacity: canAfford ? 0.6 : 0.2,
          }}
        />

        {/* Glassmorphism Surface - bg-slate-950/80 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
          }}
        />

        {/* Scan Lines Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.02) 2px,
              rgba(255, 255, 255, 0.02) 4px
            )`,
          }}
        />

        {/* ==================== HEADER SECTION (70%) ==================== */}
        <div className="relative p-5 pb-4">
          {/* Pass Name / Title - Futuristic typography with chromatic aberration */}
          <h3
            className="text-lg sm:text-xl font-bold uppercase tracking-[0.2em] mb-5 text-center"
            style={{
              fontFamily: "'Rajdhani', 'Orbitron', system-ui, sans-serif",
              color: canAfford ? '#ffffff' : '#64748b',
              textShadow: canAfford && !isAnimating
                ? `-1px 0 ${COLORS.cyberRed}, 1px 0 ${COLORS.brainFreeze}`
                : 'none',
            }}
          >
            {title}
          </h3>

          {/* Center Visual - Icon inside Circuit Grid Container */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              {/* Circuit grid background pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(${glowColor}20 1px, transparent 1px),
                    linear-gradient(90deg, ${glowColor}20 1px, transparent 1px)
                  `,
                  backgroundSize: '8px 8px',
                }}
              />
              
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center ${
                  canAfford
                    ? 'bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-cyan-600/30'
                    : 'bg-slate-800/50'
                }`}
                style={{
                  clipPath: ICON_CLIP_PATH,
                  boxShadow: canAfford && !isAnimating
                    ? `0 0 25px ${glowColor}50, inset 0 0 20px rgba(0, 0, 0, 0.4)`
                    : 'inset 0 0 15px rgba(0, 0, 0, 0.3)',
                  transition: 'box-shadow 200ms ease-out',
                }}
              >
                <Icon
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${canAfford ? 'text-cyan-300' : 'text-slate-500'}`}
                  style={{
                    filter: canAfford && !isAnimating
                      ? `drop-shadow(0 0 12px ${glowColor})`
                      : 'none',
                    transition: 'filter 200ms ease-out',
                  }}
                />
              </div>
              
              {/* Corner accent nodes */}
              {canAfford && !isAnimating && (
                <>
                  <div
                    className="absolute -top-1 -left-1 w-3 h-3 rounded-full"
                    style={{
                      background: glowColor,
                      boxShadow: `0 0 8px ${glowColor}`,
                    }}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full"
                    style={{
                      background: secondaryGlow,
                      boxShadow: `0 0 8px ${secondaryGlow}`,
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p
            className={`text-sm text-center leading-relaxed ${
              canAfford ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {description}
          </p>

          {/* Inflation Badge */}
          {isInflated && inflationPercent > 0 && (
            <div className="mt-4 flex items-center justify-center">
              <div
                className="px-4 py-1.5 flex items-center gap-2 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                }}
              >
                <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: inflationInfo.color }}
                >
                  +{inflationPercent.toFixed(0)}% SURGE
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ==================== STUB SEPARATOR (dashed line at 70%) ==================== */}
        <div className="relative px-6">
          <hr 
            className="border-t border-dashed border-white/20"
            style={{
              borderStyle: 'dashed',
              borderSpacing: '8px',
            }}
          />
        </div>

        {/* ==================== STUB SECTION (30%) ==================== */}
        <div
          className="relative p-5 pt-4"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(5, 10, 14, 0.6) 100%)',
          }}
        >
          {/* Price and Timer Row */}
          <div className="flex items-center justify-between mb-4">
            {/* Price Column - High contrast mono font */}
            <div className="flex flex-col items-start">
              {/* Base Price (strikethrough when inflated) */}
              {isInflated && currentPrice && currentPrice > basePrice && (
                <span className="text-xs text-slate-500 line-through font-mono">
                  PRICE: {basePrice} GOLD
                </span>
              )}
            
              {/* Current Price with Glitch Effect */}
              <div className="flex items-center gap-2">
                <Coins className={`w-5 h-5 ${isInflated ? 'text-red-400' : 'text-yellow-400'}`} />
                <span
                  className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                    isInflated ? 'text-red-400' : 'text-yellow-300'
                  }`}
                  style={{
                    textShadow: glitchActive
                      ? `2px 0 ${COLORS.cyberRed}, -2px 0 ${COLORS.brainFreeze}`
                      : canAfford && !isAnimating
                        ? `0 0 10px ${isInflated ? COLORS.cyberRed : '#fde047'}80`
                        : 'none',
                    transform: glitchActive ? 'translateX(1px)' : 'none',
                    opacity: glitchActive ? 0.9 : 1,
                    transition: glitchActive ? 'none' : 'all 0.2s ease-out',
                  }}
                >
                  {displayPrice}
                </span>
              </div>
            </div>

            {/* Cooldown Timer */}
            {timeRemaining && (
              <div className="flex items-center gap-2 text-cyan-400 font-mono">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{timeRemaining}</span>
              </div>
            )}
          </div>

          {/* BUY / ACQUIRE Button */}
          <motion.button
            whileHover={canAfford ? { scale: 1.03 } : {}}
            whileTap={canAfford ? { scale: 0.97 } : {}}
            onClick={handleClick}
            disabled={!canAfford}
            className={`w-full py-3.5 font-bold uppercase tracking-[0.15em] transition-all ${
              canAfford
                ? 'text-white'
                : 'text-slate-500 cursor-not-allowed'
            }`}
            style={{
              background: canAfford
                ? `linear-gradient(90deg, ${rarityColors.primary}30 0%, ${rarityColors.secondary}30 100%)`
                : 'rgba(71, 85, 105, 0.2)',
              border: `2px solid ${canAfford ? rarityColors.primary : 'rgba(71, 85, 105, 0.4)'}`,
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
              boxShadow: canAfford && !isAnimating
                ? `0 0 20px ${rarityColors.primary}40, inset 0 0 15px ${rarityColors.primary}15`
                : 'none',
              fontFamily: "'Rajdhani', 'Orbitron', system-ui, sans-serif",
              transition: 'box-shadow 200ms ease-out',
              ...GPU_ACCELERATION_STYLES,
            }}
          >
            {canAfford ? '⚡ ACQUIRE' : 'INSUFFICIENT'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

TicketCard.displayName = 'TicketCard';

export default TicketCard;

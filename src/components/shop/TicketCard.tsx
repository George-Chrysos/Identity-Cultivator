import { memo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Clock, TrendingUp } from 'lucide-react';
import { formatTimeRemaining, getInflationResetTime, getInflationLevel } from '@/utils/inflationCalculator';

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
}

// Asymmetric clip-path with sharp torn edges and side notches (Phase-Shifted Ticket)
const JAGGED_CLIP_PATH = 'polygon(4% 0%, 94% 2%, 100% 8%, 97% 45%, 100% 55%, 98% 92%, 94% 100%, 5% 98%, 0% 92%, 3% 55%, 0% 45%, 2% 8%)';
const ICON_CLIP_PATH = 'polygon(5% 0%, 95% 3%, 100% 10%, 97% 90%, 92% 100%, 8% 97%, 0% 88%, 3% 15%)';

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
}: TicketCardProps) => {
  const displayPrice = currentPrice || basePrice;
  const canAfford = currentCoins >= displayPrice && !disabled;
  const inflationPercent = isInflated && currentPrice ? ((currentPrice - basePrice) / basePrice) * 100 : 0;
  const inflationInfo = getInflationLevel(inflationPercent);
  
  const [timeRemaining, setTimeRemaining] = useState('');
  const [neonPhase, setNeonPhase] = useState(0);

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

  // Neon flicker animation
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setNeonPhase(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(flickerInterval);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAfford && onPurchase) {
      onPurchase();
    }
  }, [canAfford, onPurchase]);

  // Neon glow intensity based on phase (creates flicker effect)
  const flickerIntensity = Math.sin(neonPhase * 0.15) * 0.3 + 0.7;
  
  // Double-layered drop-shadow
  const innerShadowColor = '#a855f7'; // Neon purple
  const outerShadowColor = isInflated ? '#ef4444' : '#a855f7'; // Red when inflated, purple otherwise
  const doubleShadow = `0 0 2px ${innerShadowColor}, 0 0 ${8 * flickerIntensity}px ${innerShadowColor}80, ${isInflated ? '1.5px 1.5px' : '0 0'} ${15 * flickerIntensity}px ${outerShadowColor}60`;

  return (
    <motion.div
      className="relative"
      whileHover={canAfford ? { scale: 1.02 } : {}}
      animate={isInflated ? {
        opacity: [0.9, 1.0, 0.9],
      } : {}}
      transition={isInflated ? {
        opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      } : {}}
    >
      {/* SVG Filter for neon effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id={`neon-glow-${title.replace(/\s/g, '-')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor={innerShadowColor} floodOpacity={flickerIntensity * 0.8} />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Diagonal scan-line pattern */}
          <pattern id="scan-lines" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(168, 85, 247, 0.03)" strokeWidth="2" />
          </pattern>
        </defs>
      </svg>

      {/* Main Card Container with Silver Border and Double-Layer Shadow */}
      <div
        className={`relative backdrop-blur-md p-12 sm:p-8 md:p-8 transition-all overflow-hidden ${
          canAfford
            ? 'bg-slate-900/70'
            : 'bg-slate-900/40 opacity-60'
        } ${isInflated ? 'saturate-75' : ''}`}
        style={{
          clipPath: JAGGED_CLIP_PATH,
          boxShadow: canAfford ? `${doubleShadow}, inset 0 0 15px rgba(192, 192, 192, 0.6)` : 'inset 0 0 15px rgba(192, 192, 192, 0.6)',
        }}
      >
        {/* Holographic scan-line overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                135deg,
                transparent,
                transparent 2px,
                rgba(168, 85, 247, 0.02) 2px,
                rgba(168, 85, 247, 0.02) 4px
              )
            `,
          }}
        />
        
        {/* Inner glow border effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            clipPath: JAGGED_CLIP_PATH,
            boxShadow: canAfford 
              ? `inset 0 0 ${15 * flickerIntensity}px ${innerShadowColor}30, inset 0 0 ${5 * flickerIntensity}px ${innerShadowColor}50`
              : 'none',
          }}
        />

        {/* Market Exhaustion Overlay */}
        {inflationPercent > 100 && (
          <div 
            className="absolute inset-0 bg-red-950/20 pointer-events-none"
            style={{ clipPath: JAGGED_CLIP_PATH }}
          />
        )}

        {/* Column Layout - Mobile First */}
        <div className="flex flex-col items-center gap-2 sm:gap-4 md:gap-5 relative z-10">
          {/* Icon with jagged container */}
          <div className="relative">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center ${
                canAfford
                  ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40'
                  : 'bg-slate-800/50'
              }`}
              style={{
                clipPath: ICON_CLIP_PATH,
                boxShadow: canAfford ? `0 0 ${12 * flickerIntensity}px ${innerShadowColor}60` : 'none',
              }}
            >
              <Icon
                className={`w-7 h-7 sm:w-8 sm:h-8 mb-10md:w-10 md:h-10 ${canAfford ? 'text-pink-400' : 'text-slate-500'}`}
                style={canAfford ? {
                  filter: `drop-shadow(0 0 ${4 * flickerIntensity}px ${innerShadowColor})`,
                } : {}}
              />
            </div>
            {/* Corner accents */}
            {canAfford && (
              <>
                <div 
                  className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2"
                  style={{
                    background: `linear-gradient(135deg, ${innerShadowColor} 50%, transparent 50%)`,
                    opacity: flickerIntensity,
                  }}
                />
                <div 
                  className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2"
                  style={{
                    background: `linear-gradient(-45deg, ${innerShadowColor} 50%, transparent 50%)`,
                    opacity: flickerIntensity,
                  }}
                />
              </>
            )}
          </div>

          {/* Title - Centered */}
          <h3
            className={`text-base sm:text-lg md:text-xl font-bold text-center mt-10  leading-tight ${canAfford ? 'text-white' : 'text-slate-400'}`}
            style={canAfford ? {
              textShadow: `0 0 ${8 * flickerIntensity}px ${innerShadowColor}40`,
            } : {}}
          >
            {title}
          </h3>

          {/* Description - Below title */}
          {description && (
            <p
              className={`text-lg sm:text-sm md:text-base text-center leading-relaxed mb-8 px-2 ${canAfford ? 'text-slate-300' : 'text-slate-500'}`}
              style={canAfford ? {
                textShadow: `0 0 ${4 * flickerIntensity}px ${innerShadowColor}20`,
              } : {}}
            >
              {description}
            </p>
          )}

          {/* Price Section - Old Price and Current Price */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 mt-auto">
            {/* Base Price (Strikethrough when inflated) - Bigger */}
            {isInflated && currentPrice && currentPrice > basePrice && (
              <div className="text-sm sm:text-base md:text-lg text-slate-400 line-through opacity-80">
                {basePrice} Gold
              </div>
            )}
            
            {/* Current Price Button - Bigger */}
            <motion.button
              whileHover={canAfford ? { scale: 1.05 } : {}}
              whileTap={canAfford ? { scale: 0.95 } : {}}
              onClick={handleClick}
              disabled={!canAfford}
              className={`px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 text-base sm:text-lg md:text-xl font-bold transition-all ${
                canAfford
                  ? isInflated
                    ? 'bg-gradient-to-r from-red-600/40 to-orange-600/40 text-red-400 cursor-pointer'
                    : 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 cursor-pointer'
                  : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
              }`}
              style={{
                clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20%)',
                boxShadow: canAfford 
                  ? `0 0 ${15 * flickerIntensity}px ${isInflated ? '#ef4444' : '#eab308'}40`
                  : 'none',
                textShadow: canAfford 
                  ? `0 0 ${10 * flickerIntensity}px ${isInflated ? '#ef4444' : '#fde047'}80`
                  : 'none',
                fontWeight: isInflated ? 'bold' : '600',
              }}
            >
              {displayPrice} Gold
            </motion.button>
          </div>
        </div>

        {/* Bottom Info Row - Inflation Left, Reset Timer Right */}
        {(isInflated || timeRemaining) && (
          <div className="flex justify-between items-end mt-4 sm:mt-5 relative z-10 px-1">
            {/* Inflation Info - Bottom Left */}
            <div className="flex-1">
              {isInflated && inflationPercent > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: inflationInfo.color }} />
                  <span 
                    style={{ color: inflationInfo.color }} 
                    className="text-s sm:text-s font-semibold"
                  >
                    +{inflationPercent.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {/* Cooldown Timer - Bottom Right - 50% bigger */}
            <div className="flex-1 flex justify-end">
              {timeRemaining && (
                <div className="flex mt-4 items-center gap-1.5 sm:gap-2 text-cyan-400">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-s sm:text-s font-medium">{timeRemaining}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom edge accent */}
        {canAfford && (
          <div 
            className="absolute bottom-0 left-[5%] right-[5%] h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${innerShadowColor}${Math.floor(flickerIntensity * 255).toString(16).padStart(2, '0')}, transparent)`,
            }}
          />
        )}
      </div>

      {/* Outer glow effect */}
      {canAfford && (
        <div 
          className="absolute inset-0 -z-10 blur-sm"
          style={{
            clipPath: JAGGED_CLIP_PATH,
            background: `${outerShadowColor}10`,
            transform: 'scale(1.02)',
          }}
        />
      )}
    </motion.div>
  );
});

TicketCard.displayName = 'TicketCard';

export default TicketCard;

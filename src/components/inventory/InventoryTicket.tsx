import { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { PlayerInventoryItem } from '@/types/database';
import { BurningProgress } from './BurningProgress';
import { useShopStore, type MarketState } from '@/store/shopStore';
import { GPU_ACCELERATION_STYLES } from '@/components/common';
import { CYBERPUNK_COLORS, TICKET_CLIP_PATHS, type TicketRarity } from '@/components/common/TicketBase';

interface InventoryTicketProps {
  item: PlayerInventoryItem;
  onActivate: () => void;
  isActivating: boolean;
}

// Ticket clip path with stub cutouts
const TICKET_CLIP_PATH = TICKET_CLIP_PATHS.card;
const ICON_CLIP_PATH = TICKET_CLIP_PATHS.icon;
const BUTTON_CLIP_PATH = TICKET_CLIP_PATHS.button;

/**
 * Check if ticket's market cooldown has expired (based on shop state)
 */
const isMarketCooldownExpired = (marketState: MarketState | null): boolean => {
  if (!marketState) return true;
  
  const lastPurchased = new Date(marketState.last_purchased_at).getTime();
  const cooldownMs = marketState.cooldown_duration * 60 * 60 * 1000;
  return Date.now() > lastPurchased + cooldownMs;
};

/**
 * Compute if a ticket has expired based on used_at + cooldown_duration
 * DEPRECATED: Use shop market state instead
 */
export const isTicketExpired = (item: PlayerInventoryItem): boolean => {
  if (!item.is_used || !item.used_at || !item.cooldown_duration) {
    return false;
  }
  const usedTime = new Date(item.used_at).getTime();
  const cooldownMs = item.cooldown_duration * 60 * 60 * 1000; // Convert hours to ms
  return Date.now() > usedTime + cooldownMs;
};

/**
 * Get remaining cooldown time in milliseconds
 * DEPRECATED: Use shop market state instead
 */
export const getRemainingCooldown = (item: PlayerInventoryItem): number => {
  if (!item.is_used || !item.used_at || !item.cooldown_duration) {
    return 0;
  }
  const usedTime = new Date(item.used_at).getTime();
  const cooldownMs = item.cooldown_duration * 60 * 60 * 1000;
  const expiresAt = usedTime + cooldownMs;
  return Math.max(0, expiresAt - Date.now());
};

/**
 * Get elapsed cooldown percentage (0-100)
 * DEPRECATED: Use shop market state instead
 */
export const getCooldownProgress = (item: PlayerInventoryItem): number => {
  if (!item.is_used || !item.used_at || !item.cooldown_duration) {
    return 0;
  }
  const usedTime = new Date(item.used_at).getTime();
  const cooldownMs = item.cooldown_duration * 60 * 60 * 1000;
  const elapsed = Date.now() - usedTime;
  return Math.min(100, (elapsed / cooldownMs) * 100);
};

export const InventoryTicket = memo(({
  item,
  onActivate,
  isActivating,
}: InventoryTicketProps) => {
  // Get shop market state for this ticket's template
  const marketState = useShopStore((state) => 
    state.getMarketState(item.item_template_id)
  );
  const getRemainingCooldownMs = useShopStore((state) => state.getRemainingCooldown);
  const [isAnimating, setIsAnimating] = useState(true);
  const [hologramPhase, setHologramPhase] = useState(0);
  
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);
  
  const hasQuantity = item.quantity > 0;
  
  // Ghost state: Market inflation is active (someone purchased recently)
  const isMarketActive = marketState && !isMarketCooldownExpired(marketState);
  const isGhost = isMarketActive && !hasQuantity;

  // Get icon component
  const Icon = useMemo(() => {
    if (item.item_template?.icon && (LucideIcons as Record<string, unknown>)[item.item_template.icon]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (LucideIcons as any)[item.item_template.icon];
    }
    return Package;
  }, [item.item_template?.icon]);

  const inflationPercent = (item.item_template?.base_inflation || 0) * 100;
  const remainingTime = getRemainingCooldownMs(item.item_template_id);
  const cooldownProgress = marketState 
    ? Math.min(100, ((Date.now() - new Date(marketState.last_purchased_at).getTime()) / (marketState.cooldown_duration * 60 * 60 * 1000)) * 100)
    : 0;
  
  // Determine rarity based on item cost
  const basePrice = item.item_template?.cost_coins || 0;
  const rarity: TicketRarity = basePrice >= 100 ? 'exclusive' : basePrice >= 50 ? 'luxury' : 'common';
  const rarityColors = CYBERPUNK_COLORS[rarity];
  
  // Neon color based on state
  const glowColor = isGhost ? CYBERPUNK_COLORS.cyberRed : rarityColors.primary;
  const secondaryGlow = rarityColors.secondary;

  // Holographic shimmer animation
  useEffect(() => {
    if (isGhost) return;
    const shimmerInterval = setInterval(() => {
      setHologramPhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(shimmerInterval);
  }, [isGhost]);

  // Holographic gradient
  const holographicGradient = useMemo(() => {
    return `conic-gradient(
      from ${hologramPhase}deg at 50% 50%,
      rgba(168, 85, 247, 0.08) 0deg,
      rgba(236, 72, 153, 0.08) 60deg,
      rgba(6, 182, 212, 0.08) 120deg,
      rgba(168, 85, 247, 0.08) 180deg,
      rgba(236, 72, 153, 0.08) 240deg,
      rgba(6, 182, 212, 0.08) 300deg,
      rgba(168, 85, 247, 0.08) 360deg
    )`;
  }, [hologramPhase]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={!isMarketActive && isGhost ? { opacity: 0, scale: 0.8 } : undefined}
      whileHover={!isGhost ? { scale: 1.02 } : {}}
      whileTap={!isGhost ? { scale: 0.95 } : {}}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      onAnimationComplete={handleAnimationComplete}
      className="relative w-full"
      style={GPU_ACCELERATION_STYLES}
    >
      {/* Main Ticket Container */}
      <div
        className={`relative overflow-hidden transition-all duration-300 ${
          isGhost ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          clipPath: TICKET_CLIP_PATH,
          background: CYBERPUNK_COLORS.obsidian,
          filter: isGhost ? 'grayscale(80%) brightness(0.7)' : undefined,
          backdropFilter: isAnimating ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isAnimating ? 'none' : 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: glowColor,
          borderTopWidth: '2px',
          boxShadow: !isGhost && !isAnimating
            ? `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20, inset 0 0 30px rgba(0, 0, 0, 0.5)`
            : 'inset 0 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Holographic Foil Background (non-ghost only) */}
        {!isGhost && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{ background: holographicGradient }}
          />
        )}

        {/* Glassmorphism Tint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isGhost 
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
          }}
        />

        {/* Scan Lines Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.03) 2px,
              rgba(255, 255, 255, 0.03) 4px
            )`,
          }}
        />

        {/* Market Toll Badge (Ghost State) */}
        {isGhost && inflationPercent > 0 && (
          <div className="absolute top-2 right-2 z-20">
            <div 
              className="px-2 py-1 flex items-center gap-1"
              style={{
                background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
              }}
            >
              <TrendingUp className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">
                +{inflationPercent.toFixed(0)}% TOLL
              </span>
            </div>
          </div>
        )}

        {/* ==================== HEADER SECTION ==================== */}
        <div className="relative p-5 pb-3">
          {/* Item Header Row */}
          <div className="flex items-start gap-4 mb-3 relative z-10">
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-14 h-14 flex items-center justify-center ${
                  isGhost
                    ? 'bg-slate-700/50'
                    : 'bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-cyan-600/30'
                }`}
                style={{
                  clipPath: ICON_CLIP_PATH,
                  boxShadow: !isGhost && !isAnimating
                    ? `0 0 20px ${glowColor}40, inset 0 0 15px rgba(0, 0, 0, 0.3)`
                    : 'inset 0 0 15px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Icon 
                  className={`w-7 h-7 ${isGhost ? 'text-amber-400' : 'text-cyan-300'}`}
                  style={{
                    filter: !isGhost && !isAnimating ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
                  }}
                />
              </div>
              {/* Corner accents */}
              {!isGhost && (
                <>
                  <div 
                    className="absolute -top-1 -left-1 w-2 h-2"
                    style={{
                      background: `linear-gradient(135deg, ${glowColor} 50%, transparent 50%)`,
                    }}
                  />
                  <div 
                    className="absolute -bottom-1 -right-1 w-2 h-2"
                    style={{
                      background: `linear-gradient(-45deg, ${secondaryGlow} 50%, transparent 50%)`,
                    }}
                  />
                </>
              )}
              {/* Ghost glow effect */}
              {isGhost && (
                <motion.div
                  className="absolute inset-0"
                  style={{ clipPath: ICON_CLIP_PATH }}
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(245, 158, 11, 0.3)',
                      '0 0 15px rgba(239, 68, 68, 0.5)',
                      '0 0 5px rgba(245, 158, 11, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <h3 
                className={`text-lg font-bold uppercase tracking-wider mb-1 ${isGhost ? 'text-slate-400' : 'text-white'}`}
                style={{
                  fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
                  textShadow: !isGhost && !isAnimating ? `0 0 10px ${glowColor}60` : 'none',
                }}
              >
                {item.item_template?.name || 'Unknown Item'}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-2">
                {item.item_template?.short_description || item.item_template?.description || 'No description'}
              </p>
            </div>

            {/* Quantity Badge */}
            <div 
              className={`px-3 py-1.5 flex-shrink-0 ${
                isGhost
                  ? 'bg-slate-700/30'
                  : 'bg-gradient-to-br from-purple-600/30 to-cyan-600/30'
              }`}
              style={{
                clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 30%)',
                boxShadow: !isGhost && !isAnimating ? `0 0 10px ${glowColor}30` : 'none',
                border: `1px solid ${isGhost ? 'rgba(71, 85, 105, 0.5)' : `${glowColor}40`}`,
              }}
            >
              <span className={`font-bold text-lg ${isGhost ? 'text-slate-400' : 'text-cyan-300'}`}>
                ×{item.quantity}
              </span>
            </div>
          </div>

          {/* Active Status Info (Non-Ghost) */}
          {!isGhost && item.is_active && item.expires_at && (
            <div 
              className="flex items-center justify-between text-xs px-3 py-2 mt-2"
              style={{
                background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                clipPath: 'polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)',
              }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300">ACTIVE</span>
              </div>
              <span className="text-cyan-400 font-semibold">
                {new Date(item.expires_at).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* ==================== PERFORATION LINE ==================== */}
        <div className="relative px-4 py-1">
          <div
            className="w-full h-[2px]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                ${isGhost ? 'rgba(100, 116, 139, 0.5)' : CYBERPUNK_COLORS.cyberRed + '80'} 0px,
                ${isGhost ? 'rgba(100, 116, 139, 0.5)' : CYBERPUNK_COLORS.cyberRed + '80'} 8px,
                transparent 8px,
                transparent 16px
              )`,
            }}
          />
          {/* Side notch indicators */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 -ml-2"
            style={{
              background: `radial-gradient(ellipse at left, ${CYBERPUNK_COLORS.obsidian} 50%, transparent 50%)`,
            }}
          />
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 -mr-2"
            style={{
              background: `radial-gradient(ellipse at right, ${CYBERPUNK_COLORS.obsidian} 50%, transparent 50%)`,
            }}
          />
        </div>

        {/* ==================== STUB SECTION ==================== */}
        <div
          className="relative p-4 pt-3"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(5, 10, 14, 0.8) 100%)',
          }}
        >
          {/* Ghost State: Burning Progress */}
          {isGhost ? (
            <div className="relative z-10">
              <BurningProgress
                remainingMs={remainingTime}
                progress={cooldownProgress}
              />
              <p className="text-xs text-slate-500 mt-3 text-center">
                Market Cooldown Active
              </p>
            </div>
          ) : (
            /* Normal State: Activate Button */
            <div className="relative z-10">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate();
                }}
                disabled={isActivating}
                className={`w-full py-3 font-bold uppercase tracking-widest transition-all ${
                  isActivating
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-white'
                }`}
                style={{
                  background: isActivating
                    ? 'rgba(71, 85, 105, 0.3)'
                    : `linear-gradient(90deg, ${rarityColors.primary}40 0%, ${rarityColors.secondary}40 100%)`,
                  border: `1px solid ${isActivating ? 'rgba(71, 85, 105, 0.5)' : rarityColors.primary}`,
                  clipPath: BUTTON_CLIP_PATH,
                  boxShadow: !isActivating && !isAnimating
                    ? `0 0 15px ${rarityColors.primary}40, inset 0 0 10px ${rarityColors.primary}20`
                    : 'none',
                  ...GPU_ACCELERATION_STYLES,
                }}
              >
                {isActivating ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full"
                    />
                    ACTIVATING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ⚡ ACTIVATE
                  </span>
                )}
              </motion.button>

              {/* Acquired Date */}
              <p className="text-xs text-slate-500 mt-3 text-center">
                Acquired: {new Date(item.acquired_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Outer Glow Effect */}
      {!isGhost && !isAnimating && (
        <div
          className="absolute inset-0 -z-10 blur-xl opacity-30"
          style={{
            background: `radial-gradient(ellipse at center, ${glowColor}40 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
});

InventoryTicket.displayName = 'InventoryTicket';


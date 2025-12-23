import { memo, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { PlayerInventoryItem } from '@/types/database';
import { BurningProgress } from './BurningProgress';
import { useShopStore, type MarketState } from '@/store/shopStore';
import { GPU_ACCELERATION_STYLES } from '@/components/common';

interface InventoryTicketProps {
  item: PlayerInventoryItem;
  onActivate: () => void;
  isActivating: boolean;
}

// Jagged clip-path for torn ticket effect (matching TicketCard)
const JAGGED_CLIP_PATH = 'polygon(3% 0%, 97% 2%, 100% 8%, 98% 92%, 95% 100%, 5% 98%, 0% 90%, 2% 12%)';
const ICON_CLIP_PATH = 'polygon(5% 0%, 95% 3%, 100% 10%, 97% 90%, 92% 100%, 8% 97%, 0% 88%, 3% 15%)';

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
  
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);
  
  const hasQuantity = item.quantity > 0;
  
  // Ghost state: Market inflation is active (someone purchased recently)
  // The card should remain as "ghost/cinder" while shop inflation is active
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
  
  // Neon color based on state
  const neonColor = isGhost ? '#ef4444' : '#a855f7';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={!isMarketActive && isGhost ? { opacity: 0, scale: 0.8 } : undefined}
      transition={{ duration: 0.3 }}
      onAnimationComplete={handleAnimationComplete}
      className="relative"
      style={GPU_ACCELERATION_STYLES}
    >
      {/* Main Card Container with Jagged edges and Silver Border */}
      <div
        className={`relative p-5 transition-all overflow-hidden ${
          isGhost
            ? 'bg-slate-900/40'
            : 'bg-slate-900/60'
        }`}
        style={{
          clipPath: JAGGED_CLIP_PATH,
          filter: isGhost ? 'grayscale(100%) brightness(0.7)' : undefined,
          backdropFilter: isAnimating ? 'none' : 'blur(12px)',
          WebkitBackdropFilter: isAnimating ? 'none' : 'blur(12px)',
          boxShadow: `${isGhost || isAnimating ? 'none' : `0 0 15px ${neonColor}, 0 0 30px ${neonColor}40`}, inset 0 0 15px rgba(192, 192, 192, 0.6)`,
          transition: 'backdrop-filter 200ms ease-out, box-shadow 200ms ease-out',
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
            boxShadow: isGhost || isAnimating
              ? 'none'
              : `inset 0 0 15px ${neonColor}30, inset 0 0 5px ${neonColor}50`,
            transition: 'box-shadow 200ms ease-out',
          }}
        />

        {/* Market Toll Badge (Ghost State) */}
        {isGhost && inflationPercent > 0 && (
          <div className="absolute -top-1 -right-1 z-20">
            <div className="px-2 py-1 bg-gradient-to-r from-amber-600 to-red-600 text-xs font-bold text-white shadow-lg animate-pulse"
              style={{ clipPath: 'polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 30%)' }}
            >
              ⚠️ MARKET TOLL +{inflationPercent.toFixed(0)}%
            </div>
          </div>
        )}

        {/* Item Header */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div className="flex items-center gap-3 flex-1">
            {/* Icon with jagged container */}
            <div className="relative">
              <div
                className={`w-12 h-12 flex items-center justify-center ${
                  isGhost
                    ? 'bg-slate-700/50'
                    : 'bg-gradient-to-br from-purple-600/40 to-pink-600/40'
                }`}
                style={{
                  clipPath: ICON_CLIP_PATH,
                  boxShadow: isGhost || isAnimating ? 'none' : `0 0 12px ${neonColor}60`,
                  transition: 'box-shadow 200ms ease-out',
                }}
              >
                <Icon 
                  className={`w-6 h-6 ${isGhost ? 'text-amber-400' : 'text-pink-400'}`}
                  style={{
                    filter: isGhost || isAnimating ? 'none' : `drop-shadow(0 0 4px ${neonColor})`,
                    transition: 'filter 200ms ease-out',
                  }}
                />
              </div>
              {/* Pulsing glow effect for ghost state */}
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
              {/* Corner accents for non-ghost */}
              {!isGhost && (
                <>
                  <div 
                    className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5"
                    style={{
                      background: `linear-gradient(135deg, ${neonColor} 50%, transparent 50%)`,
                    }}
                  />
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5"
                    style={{
                      background: `linear-gradient(-45deg, ${neonColor} 50%, transparent 50%)`,
                    }}
                  />
                </>
              )}
            </div>
            <div className="flex-1">
              <h3 
                className={`text-lg font-bold mb-1 ${isGhost ? 'text-slate-400' : 'text-white'}`}
                style={{
                  textShadow: isGhost || isAnimating ? 'none' : `0 0 8px ${neonColor}40`,
                  transition: 'text-shadow 200ms ease-out',
                }}
              >
                {item.item_template?.name || 'Unknown Item'}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-1">
                {item.item_template?.short_description || item.item_template?.description || 'No description'}
              </p>
            </div>
          </div>

          {/* Quantity Badge */}
          <div 
            className={`ml-3 px-3 py-1 flex-shrink-0 ${
              isGhost
                ? 'bg-slate-700/30'
                : 'bg-gradient-to-br from-purple-600/30 to-pink-600/30'
            }`}
            style={{
              clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 30%)',
              boxShadow: isGhost || isAnimating ? 'none' : `0 0 8px ${neonColor}40`,
              transition: 'box-shadow 200ms ease-out',
            }}
          >
            <span className={`font-bold ${isGhost ? 'text-slate-400' : 'text-white'}`}>
              ×{item.quantity}
            </span>
          </div>
        </div>

        {/* Ticket Info (Non-Ghost) */}
        {!isGhost && item.item_template && (
          <div className="space-y-2 mb-4 relative z-10">
            {item.item_template.base_inflation && (
              <div 
                className="flex items-center justify-between text-xs bg-amber-900/20 px-3 py-2"
                style={{
                  clipPath: 'polygon(2% 0%, 98% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-300">Inflation Impact</span>
                </div>
                <span className="text-amber-400 font-semibold">
                  +{(item.item_template.base_inflation * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {item.is_active && item.expires_at && (
              <div 
                className="flex items-center justify-between text-xs bg-cyan-900/20 px-3 py-2"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 98% 100%, 2% 100%, 0% 70%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300">Active</span>
                </div>
                <span className="text-cyan-400 font-semibold">
                  {new Date(item.expires_at).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Ghost State: Burning Progress */}
        {isGhost ? (
          <div className="relative z-10">
            <BurningProgress
              remainingMs={remainingTime}
              progress={cooldownProgress}
            />
          </div>
        ) : (
          /* Normal State: Use Button */
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
            disabled={isActivating}
            className={`w-full py-2.5 font-semibold transition-all relative z-10 ${
              isActivating
                ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
            }`}
            style={{
              clipPath: 'polygon(3% 0%, 97% 0%, 100% 30%, 100% 70%, 97% 100%, 3% 100%, 0% 70%, 0% 30%)',
              boxShadow: isActivating || isAnimating ? 'none' : `0 0 12px ${neonColor}50`,
              transition: 'box-shadow 200ms ease-out',
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
                Activating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                ✨ Activate Ticket
              </span>
            )}
          </motion.button>
        )}

        {/* Acquired Date */}
        <p className="text-xs text-slate-500 mt-3 text-center relative z-10">
          {isGhost ? 'Market Cooldown Active' : 'Acquired'}: {new Date(item.acquired_at).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
});

InventoryTicket.displayName = 'InventoryTicket';

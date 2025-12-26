import { memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// ==================== CYBERPUNK COLOR PALETTE ====================
export const CYBERPUNK_COLORS = {
  obsidian: '#050A0E',
  neonYellow: '#FCEE09',
  cyberRed: '#FF003C',
  brainFreeze: '#00F0FF',
  // Rarity-based glows
  common: { primary: '#00F0FF', secondary: '#C0C0C0' }, // Cyan/Silver
  luxury: { primary: '#FFD700', secondary: '#F59E0B' }, // Gold/Amber
  exclusive: { primary: '#E879F9', secondary: '#A855F7' }, // Magenta/Purple
} as const;

/**
 * Shared clip-paths for ticket styling
 * Used by TicketCard (shop) and InventoryTicket
 */
export const TICKET_CLIP_PATHS = {
  // Vertical rectangle with semi-circular cutouts at 70% mark (ticket stub look)
  card: 'polygon(0% 0%, 100% 0%, 100% 68%, 96% 68%, 96% 72%, 100% 72%, 100% 100%, 0% 100%, 0% 72%, 4% 72%, 4% 68%, 0% 68%)',
  cardSimple: 'polygon(3% 0%, 97% 2%, 100% 8%, 98% 92%, 95% 100%, 5% 98%, 0% 90%, 2% 12%)',
  // Icon container - hexagonal style
  icon: 'polygon(8% 0%, 92% 0%, 100% 15%, 100% 85%, 92% 100%, 8% 100%, 0% 85%, 0% 15%)',
  // Button clip path
  button: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
} as const;

/**
 * Neon color presets for ticket states
 */
export const TICKET_NEON_COLORS = {
  default: '#a855f7', // Purple
  inflated: '#ef4444', // Red
  ghost: '#ef4444', // Red
  expired: '#6b7280', // Gray
  cyan: '#00F0FF', // Brain Freeze
  gold: '#FFD700', // Luxury
} as const;

export type TicketRarity = 'common' | 'luxury' | 'exclusive';

interface TicketBaseProps {
  /** Icon to display - can be a LucideIcon component or string name */
  icon?: LucideIcon | string;
  /** Whether the ticket is in a disabled/ghost state */
  isGhost?: boolean;
  /** Whether the ticket is inflated (for shop display) */
  isInflated?: boolean;
  /** The neon glow color */
  neonColor?: string;
  /** Flicker intensity for neon effect (0-1) */
  flickerIntensity?: number;
  /** Child content to render */
  children: ReactNode;
  /** Additional class name */
  className?: string;
  /** Whether to use the simpler clip path */
  useSimpleClip?: boolean;
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;
  /** Rarity tier for glow color */
  rarity?: TicketRarity;
}

/**
 * TicketBase - Shared ticket styling component
 * 
 * Provides consistent cyberpunk styling, holographic effects, and animations
 * for both shop TicketCard and inventory InventoryTicket components.
 */
export const TicketBase = memo(({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  icon: _icon,
  isGhost = false,
  isInflated = false,
  neonColor,
  flickerIntensity = 0.85,
  children,
  className = '',
  useSimpleClip = false,
  onClick,
  rarity = 'common',
}: TicketBaseProps) => {
  const clipPath = useSimpleClip ? TICKET_CLIP_PATHS.cardSimple : TICKET_CLIP_PATHS.card;
  
  // Get rarity-based colors
  const rarityColors = CYBERPUNK_COLORS[rarity];
  const effectiveNeonColor = neonColor || (isGhost 
    ? TICKET_NEON_COLORS.ghost 
    : isInflated 
      ? TICKET_NEON_COLORS.inflated 
      : rarityColors.primary);

  return (
    <motion.div
      className={`relative ${className}`}
      onClick={onClick}
      whileHover={!isGhost ? { scale: 1.02 } : {}}
      whileTap={!isGhost ? { scale: 0.95 } : {}}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {/* Main Card Container */}
      <div
        className={`relative overflow-hidden transition-all ${
          isGhost
            ? 'bg-slate-900/40'
            : ''
        }`}
        style={{
          clipPath,
          background: CYBERPUNK_COLORS.obsidian,
          filter: isGhost ? 'grayscale(100%) brightness(0.7)' : undefined,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: effectiveNeonColor,
          borderTopWidth: '2px',
          boxShadow: `${isGhost ? 'none' : `0 0 20px ${effectiveNeonColor}40, 0 0 40px ${effectiveNeonColor}20`}, inset 0 0 30px rgba(0, 0, 0, 0.5)`,
        }}
      >
        {/* Glassmorphism Tint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
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

        {/* Inner glow border effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            clipPath,
            boxShadow: isGhost 
              ? 'none'
              : `inset 0 0 ${15 * flickerIntensity}px ${effectiveNeonColor}30, inset 0 0 ${5 * flickerIntensity}px ${effectiveNeonColor}50`,
          }}
        />

        {/* Content wrapper */}
        <div className="relative z-10 p-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
});

TicketBase.displayName = 'TicketBase';

/**
 * TicketIcon - Shared icon component for tickets
 */
interface TicketIconProps {
  icon: LucideIcon | string;
  isGhost?: boolean;
  neonColor?: string;
  flickerIntensity?: number;
  size?: 'sm' | 'md' | 'lg';
  rarity?: TicketRarity;
}

const ICON_SIZES = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  md: { container: 'w-14 h-14', icon: 'w-7 h-7' },
  lg: { container: 'w-20 h-20', icon: 'w-10 h-10' },
} as const;

export const TicketIcon = memo(({
  icon,
  isGhost = false,
  neonColor,
  flickerIntensity = 0.85,
  size = 'md',
  rarity = 'common',
}: TicketIconProps) => {
  // Resolve icon component - handle both LucideIcon and string
  let IconComponent: LucideIcon = Package;
  if (typeof icon === 'string') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const icons = LucideIcons as any;
    IconComponent = icons[icon] || Package;
  } else {
    IconComponent = icon;
  }

  const sizeClasses = ICON_SIZES[size];
  const rarityColors = CYBERPUNK_COLORS[rarity];
  const effectiveNeonColor = neonColor || rarityColors.primary;

  return (
    <div className="relative">
      <div
        className={`${sizeClasses.container} flex items-center justify-center ${
          isGhost
            ? 'bg-slate-700/50'
            : 'bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-cyan-600/30'
        }`}
        style={{
          clipPath: TICKET_CLIP_PATHS.icon,
          boxShadow: isGhost 
            ? 'inset 0 0 15px rgba(0, 0, 0, 0.3)'
            : `0 0 ${20 * flickerIntensity}px ${effectiveNeonColor}40, inset 0 0 15px rgba(0, 0, 0, 0.3)`,
        }}
      >
        <IconComponent 
          className={`${sizeClasses.icon} ${isGhost ? 'text-amber-400' : 'text-cyan-300'}`}
          style={isGhost ? {} : {
            filter: `drop-shadow(0 0 8px ${effectiveNeonColor})`,
          }}
        />
      </div>
      
      {/* Corner accents */}
      {!isGhost && (
        <>
          <div 
            className="absolute -top-1 -left-1 w-2.5 h-2.5"
            style={{
              background: `linear-gradient(135deg, ${effectiveNeonColor} 50%, transparent 50%)`,
              opacity: flickerIntensity,
            }}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-2.5 h-2.5"
            style={{
              background: `linear-gradient(-45deg, ${rarityColors.secondary} 50%, transparent 50%)`,
              opacity: flickerIntensity,
            }}
          />
        </>
      )}
    </div>
  );
});

TicketIcon.displayName = 'TicketIcon';

export default TicketBase;

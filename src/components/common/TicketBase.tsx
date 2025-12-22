import { memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * Shared clip-paths for ticket styling
 * Used by TicketCard (shop) and InventoryTicket
 */
export const TICKET_CLIP_PATHS = {
  card: 'polygon(4% 0%, 94% 2%, 100% 8%, 97% 45%, 100% 55%, 98% 92%, 94% 100%, 5% 98%, 0% 92%, 3% 55%, 0% 45%, 2% 8%)',
  cardSimple: 'polygon(3% 0%, 97% 2%, 100% 8%, 98% 92%, 95% 100%, 5% 98%, 0% 90%, 2% 12%)',
  icon: 'polygon(5% 0%, 95% 3%, 100% 10%, 97% 90%, 92% 100%, 8% 97%, 0% 88%, 3% 15%)',
} as const;

/**
 * Neon color presets for ticket states
 */
export const TICKET_NEON_COLORS = {
  default: '#a855f7', // Purple
  inflated: '#ef4444', // Red
  ghost: '#ef4444', // Red
  expired: '#6b7280', // Gray
} as const;

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
}

/**
 * TicketBase - Shared ticket styling component
 * 
 * Provides consistent jagged clip-path, neon glow effects, and styling
 * for both shop TicketCard and inventory InventoryTicket components.
 */
export const TicketBase = memo(({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  icon: _icon,
  isGhost = false,
  isInflated = false,
  neonColor = TICKET_NEON_COLORS.default,
  flickerIntensity = 0.85,
  children,
  className = '',
  useSimpleClip = false,
  onClick,
}: TicketBaseProps) => {
  const clipPath = useSimpleClip ? TICKET_CLIP_PATHS.cardSimple : TICKET_CLIP_PATHS.card;
  const effectiveNeonColor = isGhost 
    ? TICKET_NEON_COLORS.ghost 
    : isInflated 
      ? TICKET_NEON_COLORS.inflated 
      : neonColor;

  return (
    <motion.div
      className={`relative ${className}`}
      onClick={onClick}
      whileHover={!isGhost ? { scale: 1.01 } : {}}
      animate={isInflated ? {
        opacity: [0.9, 1.0, 0.9],
      } : {}}
      transition={isInflated ? {
        opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      } : {}}
    >
      {/* Main Card Container with Silver Border and Neon Shadow */}
      <div
        className={`relative backdrop-blur-md p-4 transition-all overflow-hidden ${
          isGhost
            ? 'bg-slate-900/40'
            : 'bg-slate-900/60'
        }`}
        style={{
          clipPath,
          filter: isGhost ? 'grayscale(100%) brightness(0.7)' : undefined,
          boxShadow: `${isGhost ? 'none' : `0 0 15px ${effectiveNeonColor}, 0 0 30px ${effectiveNeonColor}40`}, inset 0 0 15px rgba(192, 192, 192, 0.6)`,
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
            clipPath,
            boxShadow: isGhost 
              ? 'none'
              : `inset 0 0 ${15 * flickerIntensity}px ${effectiveNeonColor}30, inset 0 0 ${5 * flickerIntensity}px ${effectiveNeonColor}50`,
          }}
        />

        {/* Content wrapper */}
        <div className="relative z-10">
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
}

const ICON_SIZES = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  md: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
} as const;

export const TicketIcon = memo(({
  icon,
  isGhost = false,
  neonColor = TICKET_NEON_COLORS.default,
  flickerIntensity = 0.85,
  size = 'md',
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

  return (
    <div className="relative">
      <div
        className={`${sizeClasses.container} flex items-center justify-center ${
          isGhost
            ? 'bg-slate-700/50'
            : 'bg-gradient-to-br from-purple-600/40 to-pink-600/40'
        }`}
        style={{
          clipPath: TICKET_CLIP_PATHS.icon,
          boxShadow: isGhost ? 'none' : `0 0 ${12 * flickerIntensity}px ${neonColor}60`,
        }}
      >
        <IconComponent 
          className={`${sizeClasses.icon} ${isGhost ? 'text-amber-400' : 'text-pink-400'}`}
          style={isGhost ? {} : {
            filter: `drop-shadow(0 0 4px ${neonColor})`,
          }}
        />
      </div>
      
      {/* Corner accents */}
      {!isGhost && (
        <>
          <div 
            className="absolute -top-0.5 -left-0.5 w-2 h-2"
            style={{
              background: `linear-gradient(135deg, ${neonColor} 50%, transparent 50%)`,
              opacity: flickerIntensity,
            }}
          />
          <div 
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2"
            style={{
              background: `linear-gradient(-45deg, ${neonColor} 50%, transparent 50%)`,
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

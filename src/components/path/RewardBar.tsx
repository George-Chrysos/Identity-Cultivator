import { memo } from 'react';
import { Swords, ArrowBigUp } from 'lucide-react';

interface RewardBarProps {
  xp?: number;
  stat?: string;
  statPoints?: number;
  coins?: number;
  isStatCapped?: boolean;
}

// Shared card styles - flex-1 to grow and fill available space, min-w-0 allows shrinking if needed
const CARD_BASE_CLASSES = 'flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 h-8 sm:h-10 flex-1 rounded-lg backdrop-blur-md';

/**
 * RewardBar - Glasscard-style reward display for tasks
 * 
 * Design principles:
 * - Glass morphism aesthetic (backdrop blur + subtle transparency)
 * - No "+" symbols - addition is implied in Rewards context
 * - Conditional rendering - only shows non-zero rewards
 * - Body stat dims when gateStatCap is reached
 * - Responsive: stays on same line with smaller padding on mobile
 */
export const RewardBar = memo(({
  xp = 0,
  stat,
  statPoints = 0,
  coins = 0,
  isStatCapped = false,
}: RewardBarProps) => {
  // Don't render if no rewards
  if (xp === 0 && statPoints === 0 && coins === 0) return null;

  return (
    <div className="flex flex-nowrap items-center gap-2 sm:gap-3 w-full">
      {/* XP Reward - Purple theme synced with progress bar */}
      {xp > 0 && (
        <div 
          className={CARD_BASE_CLASSES}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.15)',
          }}
        >
          <span 
            className="text-sm sm:text-base font-semibold tabular-nums text-purple-300 whitespace-nowrap"
            style={{
              textShadow: '0 0 6px rgba(168, 85, 247, 0.4)',
            }}
          >
            {xp} XP
          </span>
        </div>
      )}

      {/* Body/Stat Reward - Red Warrior theme with swords + arrow icon only */}
      {stat && statPoints > 0 && (
        <div 
          className={`${CARD_BASE_CLASSES} transition-opacity ${
            isStatCapped ? 'opacity-30' : ''
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isStatCapped ? 'rgba(100, 116, 139, 0.2)' : 'rgba(225, 29, 72, 0.2)'}`,
            boxShadow: isStatCapped ? 'none' : '0 0 8px rgba(225, 29, 72, 0.15)',
          }}
          title={isStatCapped ? 'Gate stat limit reached for this level' : `${statPoints} ${stat} points`}
        >
          <Swords 
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isStatCapped ? 'text-slate-500' : 'text-rose-400'}`}
            style={!isStatCapped ? {
              filter: 'drop-shadow(0 0 4px rgba(225, 29, 72, 0.6))',
            } : undefined}
          />
          <ArrowBigUp 
            className={`w-4 h-4 sm:w-5 sm:h-5 -ml-0.5 sm:-ml-1 ${isStatCapped ? 'text-slate-500' : 'text-rose-400'}`}
            style={!isStatCapped ? {
              filter: 'drop-shadow(0 0 4px rgba(225, 29, 72, 0.6))',
            } : undefined}
          />
        </div>
      )}

      {/* Coins Reward - Gold/Amber theme matching CurrencyDisplay */}
      {coins > 0 && (
        <div 
          className={CARD_BASE_CLASSES}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            boxShadow: '0 0 8px rgba(251, 191, 36, 0.15)',
          }}
        >
          <span className="text-base sm:text-lg drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]">🪙</span>
          <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent whitespace-nowrap">
            {coins}
          </span>
        </div>
      )}
    </div>
  );
});

RewardBar.displayName = 'RewardBar';

export default RewardBar;

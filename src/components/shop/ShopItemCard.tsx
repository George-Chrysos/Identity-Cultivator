import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ShopItemCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: number;
  currentCoins: number;
  onPurchase?: () => void;
  disabled?: boolean;
}

export const ShopItemCard = memo(({
  icon: Icon,
  title,
  description,
  price,
  currentCoins,
  onPurchase,
  disabled = false,
}: ShopItemCardProps) => {
  const canAfford = currentCoins >= price && !disabled;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAfford && onPurchase) {
      onPurchase();
    }
  }, [canAfford, onPurchase]);

  return (
    <motion.div
      className={`bg-slate-900/60 backdrop-blur-md border-2 rounded-2xl p-4 transition-all ${
        canAfford
          ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
          : 'border-slate-700/50 opacity-60'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
            canAfford
              ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500/50'
              : 'bg-slate-800/50 border-2 border-slate-700/50'
          }`}
          style={
            canAfford
              ? { boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }
              : {}
          }
        >
          <Icon
            className={`w-8 h-8 ${
              canAfford ? 'text-pink-400' : 'text-slate-500'
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-bold mb-1 ${
              canAfford ? 'text-white' : 'text-slate-400'
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${
              canAfford ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {description}
          </p>
        </div>

        {/* Price Button */}
        <motion.button
          whileHover={canAfford ? { scale: 1.05 } : {}}
          whileTap={canAfford ? { scale: 0.95 } : {}}
          onClick={handleClick}
          disabled={!canAfford}
          className={`px-4 py-2 rounded-xl font-bold flex-shrink-0 transition-all ${
            canAfford
              ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 text-yellow-300 cursor-pointer hover:border-yellow-400/70 hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]'
              : 'bg-slate-800/50 border-2 border-slate-700/50 text-slate-500 cursor-not-allowed'
          }`}
          style={
            canAfford
              ? {
                  boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)',
                  textShadow: '0 0 10px rgba(253, 224, 71, 0.5)',
                }
              : {}
          }
        >
          {price} Gold
        </motion.button>
      </div>
    </motion.div>
  );
});

ShopItemCard.displayName = 'ShopItemCard';

export default ShopItemCard;

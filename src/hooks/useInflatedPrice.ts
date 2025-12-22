import { useMemo } from 'react';
import { calculateInflation, getInflationLevel } from '@/utils/inflationCalculator';
import type { ItemTemplate } from '@/types/database';

interface InflatedPriceResult {
  /** Base price before inflation */
  basePrice: number;
  /** Current price after inflation */
  currentPrice: number;
  /** Whether price is currently inflated */
  isInflated: boolean;
  /** Inflation percentage (0-100+) */
  inflationPercent: number;
  /** Inflation level info (color, level) */
  inflationInfo: { color: string; level: string };
  /** Whether user can afford the item */
  canAfford: boolean;
  /** Formatted display string */
  displayPrice: string;
}

/**
 * useInflatedPrice - Calculate inflated price for shop items
 * 
 * Single source of truth for all price calculations with inflation.
 * Use this hook in shop components and anywhere prices need to be displayed.
 * 
 * @param item - The item template with base price and inflation settings
 * @param activeCount - Number of active instances affecting inflation
 * @param userCoins - User's current coin balance
 * @returns Calculated price info with inflation applied
 * 
 * @example
 * ```tsx
 * const { currentPrice, isInflated, inflationPercent, canAfford } = useInflatedPrice(
 *   ticketItem,
 *   inventoryCount,
 *   userProfile.coins
 * );
 * ```
 */
export const useInflatedPrice = (
  item: ItemTemplate | null | undefined,
  activeCount: number,
  userCoins: number
): InflatedPriceResult => {
  return useMemo(() => {
    if (!item) {
      return {
        basePrice: 0,
        currentPrice: 0,
        isInflated: false,
        inflationPercent: 0,
        inflationInfo: { color: '#22c55e', level: 'low' },
        canAfford: false,
        displayPrice: '0',
      };
    }

    const basePrice = item.cost_coins;
    const { currentPrice, inflationPercent } = calculateInflation(item, activeCount);
    const isInflated = currentPrice > basePrice;
    const inflationInfo = getInflationLevel(inflationPercent);
    const canAfford = userCoins >= currentPrice;

    return {
      basePrice,
      currentPrice,
      isInflated,
      inflationPercent,
      inflationInfo,
      canAfford,
      displayPrice: `${currentPrice}`,
    };
  }, [item, activeCount, userCoins]);
};

export default useInflatedPrice;

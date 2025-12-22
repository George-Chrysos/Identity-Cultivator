/**
 * Hyper-Inflation System for Ticket Shop
 * Calculates dynamic pricing based on active ticket usage
 */

import type { ItemTemplate, PlayerInventoryItem } from '@/types/database';

/**
 * Calculate current price with inflation
 * Price increases by baseInflation% for each active instance
 */
export const calculateInflation = (
  item: ItemTemplate,
  activeCount: number
): { currentPrice: number; inflationPercent: number } => {
  const basePrice = item.cost_coins;
  const baseInflation = item.base_inflation || 0;
  
  if (activeCount === 0 || baseInflation === 0) {
    return { currentPrice: basePrice, inflationPercent: 0 };
  }
  
  // Each active instance adds baseInflation% to the price
  const inflationPercent = baseInflation * activeCount * 100;
  const multiplier = 1 + (baseInflation * activeCount);
  const currentPrice = Math.round(basePrice * multiplier);
  
  return { currentPrice, inflationPercent };
};

/**
 * Check if item is currently inflated
 */
export const isItemInflated = (item: ItemTemplate): boolean => {
  return item.isInflated === true || (item.currentPrice || 0) > item.cost_coins;
};

/**
 * Calculate time remaining until price reset
 */
export const getInflationResetTime = (resetTimestamp?: string): number => {
  if (!resetTimestamp) return 0;
  
  const resetTime = new Date(resetTimestamp).getTime();
  const now = Date.now();
  const remaining = Math.max(0, resetTime - now);
  
  return remaining;
};

/**
 * Format time remaining as HH:mm
 */
export const formatTimeRemaining = (milliseconds: number): string => {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Check if a ticket is in ghost state (used but not yet expired)
 */
const isTicketInGhostState = (item: PlayerInventoryItem): boolean => {
  if (!item.is_used || !item.used_at || !item.cooldown_duration) {
    return false;
  }
  const usedTime = new Date(item.used_at).getTime();
  const cooldownMs = item.cooldown_duration * 60 * 60 * 1000;
  return Date.now() <= usedTime + cooldownMs; // Not expired yet
};

/**
 * Apply inflation to shop items based on active inventory
 * Includes both unused tickets AND used tickets in ghost state (not yet expired)
 */
export const applyInflationToShopItems = (
  shopItems: ItemTemplate[],
  inventory: PlayerInventoryItem[]
): ItemTemplate[] => {
  return shopItems.map(item => {
    if (item.category !== 'tickets') {
      return item;
    }
    
    // Count active instances of this ticket in inventory
    // Includes: unused tickets (quantity > 0) AND used tickets in ghost state
    let activeCount = 0;
    
    inventory.forEach(inv => {
      if (inv.item_template_id !== item.id) return;
      
      // Count unused tickets
      if (!inv.is_used && inv.quantity > 0) {
        activeCount += inv.quantity;
      }
      // Count used tickets that are in ghost state (still applying inflation)
      else if (isTicketInGhostState(inv)) {
        activeCount += 1; // Each ghost ticket counts as 1 inflation hit
      }
    });
    
    const { currentPrice } = calculateInflation(item, activeCount);
    const isInflated = currentPrice > item.cost_coins;
    
    // Calculate reset time (cooldown_time hours from now)
    const resetTime = new Date();
    resetTime.setHours(resetTime.getHours() + (item.cooldown_time || 24));
    
    return {
      ...item,
      basePrice: item.cost_coins,
      currentPrice,
      isInflated,
      inflationResetTime: isInflated ? resetTime.toISOString() : undefined,
      activeDuration: item.cooldown_time || 24,
    };
  });
};

/**
 * Get inflation level classification
 */
export const getInflationLevel = (inflationPercent: number): {
  level: 'low' | 'medium' | 'high' | 'extreme';
  color: string;
} => {
  if (inflationPercent === 0) {
    return { level: 'low', color: '#10b981' }; // green
  } else if (inflationPercent < 100) {
    return { level: 'medium', color: '#f59e0b' }; // amber
  } else if (inflationPercent < 200) {
    return { level: 'high', color: '#ef4444' }; // red
  } else {
    return { level: 'extreme', color: '#dc2626' }; // deep red
  }
};

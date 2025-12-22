import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/utils/logger';

/**
 * Market state for a specific ticket/item
 * Tracks when it was last purchased for inflation/cooldown calculation
 */
export interface MarketState {
  ticketId: string;
  last_purchased_at: string; // ISO timestamp
  cooldown_duration: number; // Hours until inflation expires
  base_inflation: number; // e.g., 0.25 for 25%
}

interface ShopState {
  marketStates: Record<string, MarketState>; // Key: ticketId
  
  // Actions
  recordPurchase: (ticketId: string, cooldownDuration: number, baseInflation: number) => void;
  getMarketState: (ticketId: string) => MarketState | null;
  isInflationActive: (ticketId: string) => boolean;
  getCurrentPrice: (ticketId: string, basePrice: number) => number;
  getRemainingCooldown: (ticketId: string) => number; // milliseconds
  cleanExpiredStates: () => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      marketStates: {},
      
      /**
       * Record a purchase - creates or resets the market state for this ticket
       * If purchased during active inflation, resets the cooldown timer
       */
      recordPurchase: (ticketId: string, cooldownDuration: number, baseInflation: number) => {
        const currentTime = new Date().toISOString();
        
        set((state) => ({
          marketStates: {
            ...state.marketStates,
            [ticketId]: {
              ticketId,
              last_purchased_at: currentTime,
              cooldown_duration: cooldownDuration,
              base_inflation: baseInflation,
            },
          },
        }));
        
        logger.info('Market state recorded', { ticketId, cooldownDuration, baseInflation });
      },
      
      /**
       * Get the market state for a ticket
       */
      getMarketState: (ticketId: string) => {
        return get().marketStates[ticketId] || null;
      },
      
      /**
       * Check if inflation is currently active for a ticket
       */
      isInflationActive: (ticketId: string) => {
        const state = get().marketStates[ticketId];
        if (!state) return false;
        
        const lastPurchased = new Date(state.last_purchased_at).getTime();
        const cooldownMs = state.cooldown_duration * 60 * 60 * 1000;
        const currentTime = Date.now();
        
        return currentTime < (lastPurchased + cooldownMs);
      },
      
      /**
       * Calculate current price based on inflation state
       * Returns inflated price if within cooldown duration, otherwise base price
       */
      getCurrentPrice: (ticketId: string, basePrice: number) => {
        const state = get().marketStates[ticketId];
        if (!state) return basePrice;
        
        const isActive = get().isInflationActive(ticketId);
        if (!isActive) return basePrice;
        
        // Apply inflation
        return Math.ceil(basePrice * (1 + state.base_inflation));
      },
      
      /**
       * Get remaining cooldown time in milliseconds
       * Returns 0 if no active cooldown
       */
      getRemainingCooldown: (ticketId: string) => {
        const state = get().marketStates[ticketId];
        if (!state) return 0;
        
        const lastPurchased = new Date(state.last_purchased_at).getTime();
        const cooldownMs = state.cooldown_duration * 60 * 60 * 1000;
        const expiresAt = lastPurchased + cooldownMs;
        
        return Math.max(0, expiresAt - Date.now());
      },
      
      /**
       * Clean up expired market states to prevent memory bloat
       */
      cleanExpiredStates: () => {
        const { marketStates } = get();
        const now = Date.now();
        const activeStates: Record<string, MarketState> = {};
        
        Object.values(marketStates).forEach(state => {
          const lastPurchased = new Date(state.last_purchased_at).getTime();
          const cooldownMs = state.cooldown_duration * 60 * 60 * 1000;
          const isExpired = now > lastPurchased + cooldownMs;
          
          if (!isExpired) {
            activeStates[state.ticketId] = state;
          }
        });
        
        if (Object.keys(activeStates).length !== Object.keys(marketStates).length) {
          set({ marketStates: activeStates });
          logger.info('Cleaned expired market states', {
            removed: Object.keys(marketStates).length - Object.keys(activeStates).length,
          });
        }
      },
    }),
    { name: 'shop-store' }
  )
);

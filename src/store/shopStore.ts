import { create } from 'zustand';
import { logger } from '@/utils/logger';
import { gameDB } from '@/api/gameDatabase';
import type { MarketState as DBMarketState } from '@/types/database';

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
  currentUserId: string | null;
  isLoading: boolean;
  
  // Actions
  loadMarketStates: (userId: string) => Promise<void>;
  recordPurchase: (ticketId: string, cooldownDuration: number, baseInflation: number) => Promise<void>;
  getMarketState: (ticketId: string) => MarketState | null;
  isInflationActive: (ticketId: string) => boolean;
  getCurrentPrice: (ticketId: string, basePrice: number) => number;
  getRemainingCooldown: (ticketId: string) => number; // milliseconds
  cleanExpiredStates: () => Promise<void>;
  clearMarketStates: () => void;
}

export const useShopStore = create<ShopState>()(
  (set, get) => ({
    marketStates: {},
    currentUserId: null,
    isLoading: false,
    
    /**
     * Load market states from database for a user
     */
    loadMarketStates: async (userId: string) => {
      if (get().isLoading) return;
      
      set({ isLoading: true });
      
      try {
        const dbStates = await gameDB.getMarketStates(userId);
        
        // Convert DB format to store format
        const marketStates: Record<string, MarketState> = {};
        dbStates.forEach((state: DBMarketState) => {
          marketStates[state.ticket_id] = {
            ticketId: state.ticket_id,
            last_purchased_at: state.last_purchased_at,
            cooldown_duration: state.cooldown_duration,
            base_inflation: state.base_inflation,
          };
        });
        
        set({ 
          marketStates, 
          currentUserId: userId,
          isLoading: false,
        });
        
        logger.info('Loaded market states from database', { userId, count: dbStates.length });
      } catch (error) {
        logger.error('Failed to load market states', error);
        set({ isLoading: false });
      }
    },
    
    /**
     * Record a purchase - creates or resets the market state for this ticket
     * If purchased during active inflation, resets the cooldown timer
     */
    recordPurchase: async (ticketId: string, cooldownDuration: number, baseInflation: number) => {
      const userId = get().currentUserId;
      const currentTime = new Date().toISOString();
      
      // Optimistic update
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
      
      // Persist to database if user is logged in
      if (userId) {
        try {
          await gameDB.upsertMarketState({
            user_id: userId,
            ticket_id: ticketId,
            last_purchased_at: currentTime,
            cooldown_duration: cooldownDuration,
            base_inflation: baseInflation,
          });
          
          logger.info('Market state persisted to database', { ticketId, userId });
        } catch (error) {
          logger.error('Failed to persist market state', error);
          // Note: We don't rollback the optimistic update since the purchase already happened
        }
      }
      
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
     * Clean up expired market states from database
     */
    cleanExpiredStates: async () => {
      const { marketStates, currentUserId } = get();
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
      
      const removedCount = Object.keys(marketStates).length - Object.keys(activeStates).length;
      
      if (removedCount > 0) {
        set({ marketStates: activeStates });
        
        // Clean from database if user is logged in
        if (currentUserId) {
          try {
            await gameDB.cleanExpiredMarketStates(currentUserId);
          } catch (error) {
            logger.error('Failed to clean expired market states from database', error);
          }
        }
        
        logger.info('Cleaned expired market states', { removed: removedCount });
      }
    },
    
    /**
     * Clear all market states (used on logout)
     */
    clearMarketStates: () => {
      set({ marketStates: {}, currentUserId: null });
    },
  })
);

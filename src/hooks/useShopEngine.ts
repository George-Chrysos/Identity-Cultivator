/**
 * useShopEngine Hook
 * 
 * Encapsulates all shop-related logic including:
 * - Item filtering by category
 * - Price inflation calculations
 * - Purchase handling with optimistic updates
 * - Icon resolution
 * 
 * @module hooks/useShopEngine
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Pizza, LucideIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useShopStore } from '@/store/shopStore';
import { toast } from '@/store/toastStore';
import { logger } from '@/utils/logger';
import type { ItemTemplate } from '@/types/database';

const DEFAULT_ICON = Pizza;

export type ShopTab = 'items' | 'tickets';

export interface ShopItemWithMeta extends ItemTemplate {
  iconComponent: LucideIcon;
  basePrice: number;
  currentPrice: number;
  isInflated: boolean;
  inflationResetTime?: string;
}

interface UseShopEngineReturn {
  /** Processed shop items with icons and inflation data */
  shopItems: ShopItemWithMeta[];
  /** Current active tab */
  activeTab: ShopTab;
  /** Set the active tab */
  setActiveTab: (tab: ShopTab) => void;
  /** Whether a purchase is in progress */
  isPurchasing: boolean;
  /** User's current coin balance */
  coins: number;
  /** Handle item purchase */
  handlePurchase: (item: ShopItemWithMeta) => Promise<void>;
  /** Whether the store is initialized */
  isInitialized: boolean;
}

/**
 * Hook for managing shop state and operations
 * 
 * @example
 * const { shopItems, handlePurchase, isPurchasing } = useShopEngine();
 */
export const useShopEngine = (): UseShopEngineReturn => {
  const { userProfile, availableItems, purchaseItem, isInitialized, initializeUser } = useGameStore();
  const { currentUser: authUser, isAuthenticated } = useAuthStore();
  const { getCurrentPrice, isInflationActive, getRemainingCooldown } = useShopStore();
  const marketStates = useShopStore((state) => state.marketStates);
  
  const [activeTab, setActiveTab] = useState<ShopTab>('tickets');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const initStartedRef = useRef(false);

  // Initialize store if not already done
  useEffect(() => {
    const initStore = async () => {
      if (initStartedRef.current || isInitialized) return;
      if (!isAuthenticated || !authUser?.id) return;

      initStartedRef.current = true;
      try {
        await initializeUser(authUser.id);
        logger.info('Shop engine initialized store');
      } catch (error) {
        logger.error('Failed to initialize store from shop', error);
        initStartedRef.current = false;
      }
    };

    initStore();
  }, [isAuthenticated, authUser?.id, isInitialized, initializeUser]);

  const coins = userProfile?.coins ?? 0;

  // Memoize shop items with icons and inflation data
  const shopItems = useMemo((): ShopItemWithMeta[] => {
    // Filter by active tab
    const filtered = availableItems.filter(item => {
      const itemCategory = item.category || 'items';
      return itemCategory === activeTab;
    });

    return filtered.map(item => {
      // Get icon from lucide-react dynamically
      const iconName = item.icon as keyof typeof LucideIcons | undefined;
      const IconComponent = iconName && iconName in LucideIcons
        ? (LucideIcons[iconName] as LucideIcon)
        : DEFAULT_ICON;

      // Calculate price using shop store (shop-centric inflation)
      const basePrice = item.cost_coins;
      const currentPrice = getCurrentPrice(item.id, basePrice);
      const isInflated = isInflationActive(item.id);
      const remainingCooldown = getRemainingCooldown(item.id);

      return {
        ...item,
        iconComponent: IconComponent,
        basePrice,
        currentPrice,
        isInflated,
        inflationResetTime: remainingCooldown > 0 
          ? new Date(Date.now() + remainingCooldown).toISOString() 
          : undefined,
      };
    });
  }, [availableItems, activeTab, marketStates, getCurrentPrice, isInflationActive, getRemainingCooldown]);

  // Handle purchase with optimistic update pattern
  const handlePurchase = useCallback(async (item: ShopItemWithMeta): Promise<void> => {
    const effectivePrice = item.currentPrice || item.cost_coins;
    
    if (coins < effectivePrice) {
      toast.error('⚠️ INSUFFICIENT FUNDS');
      return;
    }
    
    if (isPurchasing) {
      return;
    }

    setIsPurchasing(true);
    try {
      await purchaseItem(item.id);
      toast.acquisition(item.name, effectivePrice);
    } catch (error) {
      toast.error('⚠️ TRANSACTION FAILED // RETRY');
      logger.error('Purchase failed', error);
    } finally {
      setIsPurchasing(false);
    }
  }, [coins, isPurchasing, purchaseItem]);

  return {
    shopItems,
    activeTab,
    setActiveTab,
    isPurchasing,
    coins,
    handlePurchase,
    isInitialized,
  };
};

export default useShopEngine;

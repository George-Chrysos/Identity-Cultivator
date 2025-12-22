/**
 * Shared hooks for the Identity Cultivator application
 * 
 * These hooks consolidate duplicated logic and provide single sources of truth.
 */

export { useInflatedPrice } from './useInflatedPrice';
export { useCooldownTimer, useCooldownFromDuration } from './useCooldownTimer';
export { 
  useTransformedIdentity,
  type TransformedTask,
  type TrialInfo,
  type NextLevelData,
} from './useTransformedIdentity';
export { useShopEngine, type ShopItemWithMeta, type ShopTab } from './useShopEngine';
export { useInventoryManager, type InventoryItemWithMeta } from './useInventoryManager';

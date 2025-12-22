/**
 * Centralized Type Definitions
 * 
 * All shared interfaces and types for the Identity Cultivator app.
 * Import from '@/types' instead of defining inline types.
 * 
 * @module types/index
 */

// Re-export all database types
export * from './database';

// ==================== COMPONENT PROPS ====================

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Base props for modal components
 */
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

/**
 * Props for shop item cards
 */
export interface ShopItemCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: number;
  currentCoins: number;
  onPurchase?: () => void;
  disabled?: boolean;
}

/**
 * Props for ticket cards with inflation
 */
export interface TicketCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  basePrice: number;
  currentPrice?: number;
  isInflated?: boolean;
  inflationResetTime?: string;
  currentCoins: number;
  onPurchase?: () => void;
  disabled?: boolean;
}

/**
 * Props for inventory ticket display
 */
export interface InventoryTicketProps {
  icon: LucideIcon;
  title: string;
  quantity: number;
  isGhost?: boolean;
  cooldownRemaining?: number;
  onClick?: () => void;
}

// ==================== HOOK RETURN TYPES ====================

/**
 * Return type for useShopEngine hook
 */
export interface ShopEngineState {
  shopItems: ShopItemWithMeta[];
  isLoading: boolean;
  isPurchasing: boolean;
  handlePurchase: (itemId: string) => Promise<void>;
  activeTab: 'items' | 'tickets';
  setActiveTab: (tab: 'items' | 'tickets') => void;
}

/**
 * Return type for useInventoryManager hook
 */
export interface InventoryManagerState {
  tickets: PlayerInventoryItemWithMeta[];
  regularItems: PlayerInventoryItemWithMeta[];
  totalItems: number;
  isUsingItem: boolean;
  handleUseItem: (itemId: string) => Promise<void>;
  selectedTicket: PlayerInventoryItemWithMeta | null;
  setSelectedTicket: (ticket: PlayerInventoryItemWithMeta | null) => void;
}

// ==================== ENHANCED TYPES ====================

import type { ItemTemplate, PlayerInventoryItem } from './database';

/**
 * Shop item with computed metadata (icon component, inflation state)
 */
export interface ShopItemWithMeta extends ItemTemplate {
  iconComponent: LucideIcon;
  basePrice: number;
  currentPrice: number;
  isInflated: boolean;
  inflationResetTime?: string;
}

/**
 * Inventory item with computed metadata
 */
export interface PlayerInventoryItemWithMeta extends PlayerInventoryItem {
  iconComponent?: LucideIcon;
  isGhost?: boolean;
  cooldownRemaining?: number;
}

// ==================== UI STATE TYPES ====================

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'acquisition';

/**
 * Toast notification data
 */
export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  itemName?: string;
  cost?: number;
}

/**
 * Loading state for async operations
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ==================== PATH TREE TYPES ====================

/**
 * Path node status
 */
export type PathNodeStatus = 'locked' | 'unlockable' | 'active' | 'completed';

/**
 * Branch position in path tree
 */
export type BranchPosition = 'center' | 'left-branch' | 'right-branch' | 'center-branch';

/**
 * Path node in cultivation tree
 */
export interface PathNodeData {
  id: string;
  name: string;
  stage: number;
  position: BranchPosition;
  status: PathNodeStatus;
  description?: string;
  unlockCost?: number;
  linkedIdentityId?: string;
}

// ==================== VALIDATION TYPES ====================

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Quest input validation
 */
export interface QuestInput {
  name: string;
  difficulty: 'easy' | 'moderate' | 'hell';
  description?: string;
}

// ==================== UTILITY TYPES ====================

/**
 * Make all properties optional except specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

/**
 * Extract the element type from an array type
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Make specific properties required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Async function return type
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = 
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

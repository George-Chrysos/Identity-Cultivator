/**
 * useInventoryManager Hook
 * 
 * Encapsulates all inventory-related logic including:
 * - Ticket/item separation and filtering
 * - Ghost ticket detection
 * - Item usage with optimistic updates
 * - Auto-cleanup of expired items
 * 
 * @module hooks/useInventoryManager
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Pizza, LucideIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useShopStore } from '@/store/shopStore';
import { toast } from '@/store/toastStore';
import { logger } from '@/utils/logger';
import { isTicketExpired } from '@/components/inventory';
import type { PlayerInventoryItem } from '@/types/database';

const DEFAULT_ICON = Pizza;
const CLEANUP_INTERVAL = 60000; // 60 seconds

export interface InventoryItemWithMeta extends PlayerInventoryItem {
  iconComponent: LucideIcon;
  isGhost: boolean;
  cooldownRemaining: number;
}

interface UseInventoryManagerReturn {
  /** Ticket items with metadata */
  tickets: InventoryItemWithMeta[];
  /** Regular (non-ticket) items with metadata */
  regularItems: InventoryItemWithMeta[];
  /** Total item count */
  totalItems: number;
  /** ID of item currently being used */
  usingItemId: string | null;
  /** Handle using an item */
  handleUseItem: (inventoryItemId: string, itemName: string) => Promise<void>;
  /** Currently selected ticket for modal */
  selectedTicket: InventoryItemWithMeta | null;
  /** Set selected ticket */
  setSelectedTicket: (ticket: InventoryItemWithMeta | null) => void;
  /** Handle ticket click */
  handleTicketClick: (item: InventoryItemWithMeta) => void;
  /** Close ticket modal */
  handleCloseModal: () => void;
  /** Activate ticket from modal */
  handleActivateTicket: () => Promise<void>;
  /** Whether store is initialized */
  isInitialized: boolean;
}

/**
 * Hook for managing inventory state and operations
 * 
 * @example
 * const { tickets, regularItems, handleUseItem } = useInventoryManager();
 */
export const useInventoryManager = (): UseInventoryManagerReturn => {
  const { 
    playerInventory, 
    useItem, 
    removeExpiredTickets,
    isInitialized,
    initializeUser,
  } = useGameStore();
  const { currentUser: authUser, isAuthenticated } = useAuthStore();
  
  const [usingItemId, setUsingItemId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<InventoryItemWithMeta | null>(null);
  const initStartedRef = useRef(false);

  // Initialize store if not already done
  useEffect(() => {
    const initStore = async () => {
      if (initStartedRef.current || isInitialized) return;
      if (!isAuthenticated || !authUser?.id) return;

      initStartedRef.current = true;
      try {
        await initializeUser(authUser.id);
        logger.info('Inventory manager initialized store');
      } catch (error) {
        logger.error('Failed to initialize store from inventory', error);
        initStartedRef.current = false;
      }
    };

    initStore();
  }, [isAuthenticated, authUser?.id, isInitialized, initializeUser]);

  // Auto-cleanup for expired tickets and expired market states
  useEffect(() => {
    const checkExpiredTickets = () => {
      // Clean expired shop market states
      useShopStore.getState().cleanExpiredStates();
      
      // Clean expired tickets from inventory
      const expiredItems = playerInventory.filter(
        item => item.item_template?.category === 'tickets' && item.is_used && isTicketExpired(item)
      );
      
      if (expiredItems.length > 0) {
        logger.info('Found expired tickets to clean up', { count: expiredItems.length });
        removeExpiredTickets?.();
      }
    };

    checkExpiredTickets();
    const interval = setInterval(checkExpiredTickets, CLEANUP_INTERVAL);
    return () => clearInterval(interval);
  }, [playerInventory, removeExpiredTickets]);

  // Separate and process tickets from regular items
  const { tickets, regularItems } = useMemo(() => {
    const ticketList: InventoryItemWithMeta[] = [];
    const itemList: InventoryItemWithMeta[] = [];

    playerInventory.forEach(item => {
      // Get icon component
      const iconName = item.item_template?.icon as keyof typeof LucideIcons | undefined;
      const IconComponent = iconName && iconName in LucideIcons
        ? (LucideIcons[iconName] as LucideIcon)
        : DEFAULT_ICON;

      if (item.item_template?.category === 'tickets') {
        // Check if market cooldown has expired using shop state
        const remainingCooldown = useShopStore.getState().getRemainingCooldown(item.item_template_id);
        const isMarketExpired = remainingCooldown === 0;
        
        // Skip tickets with no quantity and expired market cooldown
        if (item.quantity === 0 && isMarketExpired) return;
        
        // Also skip old logic expired tickets
        if (item.is_used && isTicketExpired(item)) return;
        
        // Determine if this is a ghost ticket
        const isGhost = item.quantity === 0 && remainingCooldown > 0;
        
        ticketList.push({
          ...item,
          iconComponent: IconComponent,
          isGhost,
          cooldownRemaining: remainingCooldown,
        });
      } else {
        itemList.push({
          ...item,
          iconComponent: IconComponent,
          isGhost: false,
          cooldownRemaining: 0,
        });
      }
    });

    // Sort tickets: active/unused first, then ghost (used but market active)
    ticketList.sort((a, b) => {
      if (a.isGhost && !b.isGhost) return 1;
      if (!a.isGhost && b.isGhost) return -1;
      return 0;
    });

    return { tickets: ticketList, regularItems: itemList };
  }, [playerInventory]);

  const totalItems = tickets.length + regularItems.length;

  // Handle using an item
  const handleUseItem = useCallback(async (inventoryItemId: string, itemName: string): Promise<void> => {
    if (usingItemId) return;
    
    setUsingItemId(inventoryItemId);
    try {
      await useItem(inventoryItemId);
      toast.success(`✨ ${itemName} activated!`);
      logger.info('Item used from inventory', { inventoryItemId });
    } catch (error) {
      toast.error('⚠️ Failed to activate item');
      logger.error('Failed to use item', error);
    } finally {
      setUsingItemId(null);
    }
  }, [usingItemId, useItem]);

  // Handle ticket click
  const handleTicketClick = useCallback((item: InventoryItemWithMeta) => {
    // Don't open modal for ghost tickets
    if (item.isGhost) return;
    setSelectedTicket(item);
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  // Activate ticket from modal
  const handleActivateTicket = useCallback(async (): Promise<void> => {
    if (!selectedTicket) return;
    await handleUseItem(selectedTicket.id, selectedTicket.item_template?.name || 'Ticket');
    setSelectedTicket(null);
  }, [selectedTicket, handleUseItem]);

  return {
    tickets,
    regularItems,
    totalItems,
    usingItemId,
    handleUseItem,
    selectedTicket,
    setSelectedTicket,
    handleTicketClick,
    handleCloseModal,
    handleActivateTicket,
    isInitialized,
  };
};

export default useInventoryManager;

import { memo, useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Sparkles, Check, LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Header from '@/components/layout/Header';
import { NavMenu } from '@/components/layout/NavMenu';
import ParticleBackground from '@/components/layout/ParticleBackground';
import { ErrorBoundary } from '@/components/common';
import { TicketDetailModal } from '@/components/shop/TicketDetailModal';
import { InventoryTicket, isTicketExpired } from '@/components/inventory';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useShopStore } from '@/store/shopStore';
import { toast } from '@/store/toastStore';
import { logger } from '@/utils/logger';
import type { PlayerInventoryItem } from '@/types/database';

// Auto-cleanup interval in milliseconds (60 seconds)
const CLEANUP_INTERVAL = 60000;

const InventoryPage = memo(() => {
  const { 
    playerInventory, 
    useItem, 
    removeExpiredTickets,
    isInitialized,
    initializeUser,
  } = useGameStore();
  const { currentUser: authUser, isAuthenticated } = useAuthStore();
  const initStartedRef = useRef(false);
  
  const [usingItemId, setUsingItemId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<PlayerInventoryItem | null>(null);

  // Initialize store if not already done
  useEffect(() => {
    const initStore = async () => {
      if (initStartedRef.current || isInitialized) return;
      if (!isAuthenticated || !authUser?.id) return;

      initStartedRef.current = true;
      try {
        await initializeUser(authUser.id);
        logger.info('Inventory page initialized store');
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
      
      // Clean expired tickets from inventory (old logic, kept for backward compatibility)
      const expiredItems = playerInventory.filter(
        item => item.item_template?.category === 'tickets' && item.is_used && isTicketExpired(item)
      );
      
      if (expiredItems.length > 0) {
        logger.info('Found expired tickets to clean up', { count: expiredItems.length });
        removeExpiredTickets?.();
      }
    };

    // Check immediately on mount
    checkExpiredTickets();

    // Check every 60 seconds
    const interval = setInterval(checkExpiredTickets, CLEANUP_INTERVAL);

    return () => clearInterval(interval);
  }, [playerInventory, removeExpiredTickets]);

  // Separate tickets from regular items, and filter out tickets with expired market cooldown
  const { tickets, regularItems } = useMemo(() => {
    const ticketList: PlayerInventoryItem[] = [];
    const itemList: PlayerInventoryItem[] = [];

    playerInventory.forEach(item => {
      if (item.item_template?.category === 'tickets') {
        // Check if market cooldown has expired using shop state
        const marketState = useShopStore.getState().getMarketState(item.item_template_id);
        const isMarketExpired = !marketState || useShopStore.getState().getRemainingCooldown(item.item_template_id) === 0;
        
        // Skip tickets with no quantity and expired market cooldown
        if (item.quantity === 0 && isMarketExpired) return;
        
        // Also skip old logic expired tickets
        if (item.is_used && isTicketExpired(item)) return;
        
        ticketList.push(item);
      } else {
        itemList.push(item);
      }
    });

    // Sort tickets: active/unused first, then ghost (used but market active)
    ticketList.sort((a, b) => {
      const aMarketState = useShopStore.getState().getMarketState(a.item_template_id);
      const bMarketState = useShopStore.getState().getMarketState(b.item_template_id);
      const aIsGhost = aMarketState && useShopStore.getState().getRemainingCooldown(a.item_template_id) > 0 && a.quantity === 0;
      const bIsGhost = bMarketState && useShopStore.getState().getRemainingCooldown(b.item_template_id) > 0 && b.quantity === 0;
      
      if (aIsGhost && !bIsGhost) return 1;
      if (!aIsGhost && bIsGhost) return -1;
      return 0;
    });

    return { tickets: ticketList, regularItems: itemList };
  }, [playerInventory]);

  const handleUseItem = useCallback(async (inventoryItemId: string, itemName: string) => {
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

  const handleTicketClick = useCallback((item: PlayerInventoryItem) => {
    // Don't open modal for ghost tickets
    if (item.is_used && !isTicketExpired(item)) return;
    setSelectedTicket(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  const handleActivateTicket = useCallback(async () => {
    if (!selectedTicket) return;
    await handleUseItem(selectedTicket.id, selectedTicket.item_template?.name || 'Ticket');
    setSelectedTicket(null);
  }, [selectedTicket, handleUseItem]);

  const totalItems = tickets.length + regularItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10">
        <Header />
        <NavMenu />
        
        <ErrorBoundary
          fallbackTitle="Inventory Error"
          fallbackMessage="Failed to load your inventory. Please try again."
          onRetry={() => window.location.reload()}
        >
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
            style={{ marginTop: '30px', marginBottom: '48px' }}
          >
            <h1 
              className="text-4xl md:text-5xl font-bold text-white font-section uppercase tracking-[0.2em] animate-glitch"
              style={{
                textShadow: '1px 0 0 rgba(255, 0, 0, 0.15), -1px 0 0 rgba(0, 255, 255, 0.15)',
                marginBottom: '24px'
              }}
            >
              INVENTORY
            </h1>
            <p className="text-slate-400 mb-2">Your collected items and rewards</p>
            
            {/* Item Count */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Package className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-semibold">
                {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-purple-500 to-purple-600" />
              <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rotate-45 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
              <div className="h-[2px] w-32 bg-gradient-to-l from-transparent via-pink-500 to-pink-600" />
            </div>
          </motion.div>

          {/* Empty State */}
          {totalItems === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-slate-800/40 to-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-slate-700/50">
                <Package className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">
                Empty Inventory
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Purchase items from the shop to see them here. Collect rewards and boost your cultivation journey!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Tickets Section */}
              {tickets.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎫</span> Luxury Tickets
                    <span className="text-sm text-slate-500 font-normal">({tickets.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {tickets.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleTicketClick(item)}
                          className="cursor-pointer"
                        >
                          <InventoryTicket
                            item={item}
                            onActivate={() => handleUseItem(item.id, item.item_template?.name || 'Ticket')}
                            isActivating={usingItemId === item.id}
                          />
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Regular Items Section */}
              {regularItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📦</span> Items & Buffs
                    <span className="text-sm text-slate-500 font-normal">({regularItems.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {regularItems.map((item, index) => {
                        const iconName = item.item_template?.icon as keyof typeof LucideIcons | undefined;
                        const Icon = iconName && iconName in LucideIcons
                          ? (LucideIcons[iconName] as LucideIcon)
                          : Package;

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="backdrop-blur-md border-2 rounded-2xl p-5 transition-all bg-slate-900/60 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                          >
                            {/* Item Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border-2 border-cyan-500/50">
                                  <Icon className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-white mb-1">
                                    {item.item_template?.name || 'Unknown Item'}
                                  </h3>
                                  <p className="text-sm text-slate-400 line-clamp-1">
                                    {item.item_template?.short_description || item.item_template?.description || 'No description'}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Quantity Badge */}
                              <div className="ml-3 border-2 rounded-lg px-3 py-1 flex-shrink-0 bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border-cyan-500/50">
                                <span className="text-white font-bold">×{item.quantity}</span>
                              </div>
                            </div>

                            {/* Item Effect */}
                            {item.item_template && (
                              <div className="bg-slate-800/50 rounded-lg px-3 py-2 mb-4 border border-slate-700/50">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-cyan-400" />
                                  <span className="text-sm text-cyan-300 font-medium">
                                    {item.item_template.effect_type === 'xp_multiplier' && `${item.item_template.effect_value}x XP Boost`}
                                    {item.item_template.effect_type === 'stat_boost' && `+${item.item_template.effect_value} All Stats`}
                                    {!['xp_multiplier', 'stat_boost'].includes(item.item_template.effect_type) && 'Special Effect'}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Use Button */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUseItem(item.id, item.item_template?.name || 'Item');
                              }}
                              disabled={usingItemId === item.id}
                              className={`w-full py-2.5 rounded-lg font-semibold transition-all ${
                                usingItemId === item.id
                                  ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                              }`}
                            >
                              {usingItemId === item.id ? (
                                <span className="flex items-center justify-center gap-2">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full"
                                  />
                                  Using...
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  <Check className="w-4 h-4" />
                                  Use Item
                                </span>
                              )}
                            </motion.button>

                            {/* Acquired Date */}
                            <p className="text-xs text-slate-500 mt-3 text-center">
                              Acquired: {new Date(item.acquired_at).toLocaleDateString()}
                            </p>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </main>
        </ErrorBoundary>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && selectedTicket.item_template && (() => {
        const iconName = selectedTicket.item_template.icon as keyof typeof LucideIcons | undefined;
        const ModalIcon = iconName && iconName in LucideIcons
          ? (LucideIcons[iconName] as LucideIcon)
          : Package;

        return (
          <TicketDetailModal
            isOpen={true}
            onClose={handleCloseModal}
            icon={ModalIcon}
            name={selectedTicket.item_template.name}
            fullDescription={selectedTicket.item_template.full_description || selectedTicket.item_template.description}
            activeDuration={selectedTicket.item_template.activeDuration || selectedTicket.item_template.cooldown_time || 24}
            inflationImpact={selectedTicket.item_template.base_inflation || 0}
            isActive={selectedTicket.is_active || false}
            remainingTime={
              selectedTicket.expires_at
                ? new Date(selectedTicket.expires_at).getTime() - Date.now()
                : undefined
            }
            onUse={handleActivateTicket}
          />
        );
      })()}
    </div>
  );
});

InventoryPage.displayName = 'InventoryPage';

export default InventoryPage;

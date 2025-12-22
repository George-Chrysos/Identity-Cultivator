import { memo, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Pizza, LucideIcon } from 'lucide-react';
import { ShopItemCard } from '@/components/shop/ShopItemCard';
import { TicketCard } from '@/components/shop/TicketCard';
import Header from '@/components/layout/Header';
import { NavMenu } from '@/components/layout/NavMenu';
import { ErrorBoundary } from '@/components/common';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useShopStore } from '@/store/shopStore';
import { toast } from '@/store/toastStore';
import { logger } from '@/utils/logger';
import type { ItemTemplate } from '@/types/database';

const DEFAULT_ICON = Pizza;

export const ShopPage = memo(() => {
  const { userProfile, availableItems, purchaseItem, isInitialized, initializeUser } = useGameStore();
  const { currentUser: authUser, isAuthenticated } = useAuthStore();
  const { getCurrentPrice, isInflationActive, getRemainingCooldown, loadMarketStates } = useShopStore();
  const marketStates = useShopStore((state) => state.marketStates); // Subscribe to market state changes
  const initStartedRef = useRef(false);
  const marketStatesLoadedRef = useRef(false);

  // Initialize store if not already done
  useEffect(() => {
    const initStore = async () => {
      if (initStartedRef.current || isInitialized) return;
      if (!isAuthenticated || !authUser?.id) return;

      initStartedRef.current = true;
      try {
        await initializeUser(authUser.id);
        logger.info('Shop page initialized store');
      } catch (error) {
        logger.error('Failed to initialize store from shop', error);
        initStartedRef.current = false;
      }
    };

    initStore();
  }, [isAuthenticated, authUser?.id, isInitialized, initializeUser]);

  // Load market states from database when user is authenticated
  useEffect(() => {
    const loadStates = async () => {
      if (marketStatesLoadedRef.current) return;
      if (!isAuthenticated || !authUser?.id) return;

      marketStatesLoadedRef.current = true;
      try {
        await loadMarketStates(authUser.id);
        logger.info('Market states loaded from database');
      } catch (error) {
        logger.error('Failed to load market states', error);
        marketStatesLoadedRef.current = false;
      }
    };

    loadStates();
  }, [isAuthenticated, authUser?.id, loadMarketStates]);
  
  const coins = userProfile?.coins || 0;
  const [activeTab, setActiveTab] = useState<'items' | 'tickets'>('tickets');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Memoize shop items with icons, shop-centric inflation, and filter by category
  const shopItems = useMemo(() => {
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
        inflationResetTime: remainingCooldown > 0 ? new Date(Date.now() + remainingCooldown).toISOString() : undefined,
      };
    });
  }, [availableItems, activeTab, marketStates, getCurrentPrice, isInflationActive, getRemainingCooldown]);

  // Type for processed shop items
  type ShopItemWithMeta = ItemTemplate & {
    iconComponent: LucideIcon;
    basePrice: number;
    currentPrice: number;
    isInflated: boolean;
    inflationResetTime?: string;
  };

  const handlePurchase = useCallback(async (item: ShopItemWithMeta) => {
    const effectivePrice = item.currentPrice || item.cost_coins;
    
    if (coins >= effectivePrice && !isPurchasing) {
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
    }
  }, [coins, isPurchasing, purchaseItem]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 relative overflow-hidden">
      <Header />
      <NavMenu />
      
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Circuit Lines */}
      <div className="absolute top-0 left-0 w-full h-32 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path
            d="M0,50 L150,50 L200,100 L350,100 L400,150 L600,150"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M1000,80 L850,80 L800,120 L650,120 L600,160 L400,160"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content Container with Error Boundary */}
      <ErrorBoundary 
        fallbackTitle="Shop Error" 
        fallbackMessage="Failed to load shop items. Please try again."
        onRetry={() => window.location.reload()}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 pb-24">

        {/* Header Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
          style={{ marginTop: '30px' }}
        >
          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold text-white text-center font-section uppercase tracking-[0.2em] animate-glitch"
            style={{
              textShadow: '1px 0 0 rgba(255, 0, 0, 0.15), -1px 0 0 rgba(0, 255, 255, 0.15)',
              marginBottom: '24px'
            }}
          >
            THE SHOP
          </h1>

          {/* Subtitle */}
          <p className="text-center text-purple-300/80 text-lg mb-6">
            Spend your hard-earned gold on rewards
          </p>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-slate-900/60 backdrop-blur-md border-2 border-purple-500/50 rounded-lg p-1 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
                  activeTab === 'tickets'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                    : 'text-purple-300/60 hover:text-purple-300'
                }`}
              >
                Tickets
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
                  activeTab === 'items'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                    : 'text-purple-300/60 hover:text-purple-300'
                }`}
              >
                Items
              </button>
            </div>
          </div>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-purple-500 to-purple-600" />
            <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rotate-45 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
            <div className="h-[2px] w-32 bg-gradient-to-l from-transparent via-pink-500 to-pink-600" />
          </div>
        </motion.div>

        {/* Shop Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {shopItems.length === 0 ? (
            <div className="text-center text-purple-300/60 py-8">
              {activeTab === 'tickets' ? 'No tickets available yet...' : 'No items available yet...'}
            </div>
          ) : (
            shopItems.map((item, _index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + _index * 0.1 }}
              >
                {item.category === 'tickets' ? (
                  <TicketCard
                    icon={item.iconComponent}
                    title={item.name}
                    description={item.short_description || item.description || ''}
                    basePrice={item.basePrice || item.cost_coins}
                    currentPrice={item.currentPrice}
                    isInflated={item.isInflated}
                    inflationResetTime={item.inflationResetTime}
                    currentCoins={coins}
                    onPurchase={() => handlePurchase(item)}
                    disabled={isPurchasing}
                  />
                ) : (
                  <ShopItemCard
                    icon={item.iconComponent}
                    title={item.name}
                    description={item.description || ''}
                    price={item.cost_coins}
                    currentCoins={coins}
                    onPurchase={() => handlePurchase(item)}
                    disabled={isPurchasing}
                  />
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-24" />
        </div>
      </ErrorBoundary>

      {/* Bottom Circuit Lines */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-30 rotate-180">
        <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path
            d="M0,50 L150,50 L200,100 L350,100 L400,150 L600,150"
            stroke="url(#gradient3)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M1000,80 L850,80 L800,120 L650,120 L600,160 L400,160"
            stroke="url(#gradient4)"
            strokeWidth="2"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
});

ShopPage.displayName = 'ShopPage';

export default ShopPage;

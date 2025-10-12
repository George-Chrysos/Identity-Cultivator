import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Plus, Sparkles, X } from 'lucide-react';
import { useCultivatorStore } from '@/store/cultivatorStore';
import { useAuthStore } from '@/store/authStore';
import CultivatorCard from '@/components/CultivatorCard';
import Header from '@/components/Header';
import { IdentityTier, IdentityType } from '@/models/cultivatorTypes';

const CultivatorHomepage = () => {
  const { isAuthenticated, currentUser: authUser } = useAuthStore();
  const {
    currentUser,
    getSortedIdentities,
    getProgressForIdentity,
    animationEvents,
    clearAnimationEvent,
    isLoading,
    isInitialized,
    initializeUser,
    createNewIdentity,
  } = useCultivatorStore();

  // Initialize cultivator data when user logs in
  const initStartedRef = useRef(false);

  useEffect(() => {
    console.log('🔄 useEffect triggered:', { 
      isAuthenticated, 
      hasAuthUser: !!authUser, 
      hasCultivatorUser: !!currentUser, 
      isLoading,
      isInitialized
    });
    
    const initializeCultivatorData = async () => {
      if (!isAuthenticated) {
        initStartedRef.current = false; // reset when logged out
        return;
      }

      if (initStartedRef.current) return; // prevent duplicate inits

      if (isAuthenticated && !currentUser && !isInitialized) {
        initStartedRef.current = true;
        // Use the actual Supabase auth user ID if available, otherwise create a deterministic ID
        const userID = authUser?.id || (authUser?.email ? `user-${authUser.email.split('@')[0]}` : `user-${authUser?.name || 'cultivator'}`);
        const userName = authUser?.name || authUser?.email || 'Cultivator';
        
        console.log('🚀 Starting cultivator data initialization:', { userID, userName });
        await initializeUser(userName, userID);
        console.log('✅ Cultivator data initialization complete');
      } else {
        console.log('⏭️ Skipping initialization:', {
          needsAuth: !isAuthenticated,
          needsAuthUser: !authUser,
          hasCurrentUser: !!currentUser,
          isCurrentlyLoading: isLoading,
          alreadyInitialized: isInitialized
        });
      }
    };
    
    initializeCultivatorData();
  }, [isAuthenticated, authUser?.id, isInitialized, currentUser?.userID]);

  // Active identities list
  const sortedIdentities = getSortedIdentities();
  const todayDisplay = new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  const getTierColor = (tier: IdentityTier) => {
    const colors: Record<IdentityTier, string> = {
      'D': 'text-violet-300',
      'D+': 'text-violet-300',
      'C': 'text-cyan-300',
      'C+': 'text-cyan-300',
      'B': 'text-cyan-200',
      'B+': 'text-cyan-200',
      'A': 'text-violet-200',
      'A+': 'text-violet-200',
      'S': 'text-cyan-100',
      'S+': 'text-cyan-100',
      'SS': 'text-amber-200',
      'SS+': 'text-amber-200',
      'SSS': 'text-amber-100',
    };
    return colors[tier];
  };

  // Create the three default identities once
  const [creatingDefaults, setCreatingDefaults] = useState(false);
  const handleCreateNewIdentity = async () => {
    if (creatingDefaults) return;
    if (!currentUser) return;
    setCreatingDefaults(true);
    try {
      const defaultTypes: IdentityType[] = ['CULTIVATOR', 'BODYSMITH', 'PATHWEAVER'];
      const existingTypes = new Set(useCultivatorStore.getState().identities.map(i => i.identityType));
      for (const t of defaultTypes) {
        if (!existingTypes.has(t)) {
          await createNewIdentity(t);
        }
      }
    } finally {
      setCreatingDefaults(false);
    }
  };

  // Debug logging
  console.log('🎭 Render state:', { 
    isAuthenticated, 
    authUser: !!authUser, 
    currentUser: !!currentUser, 
    isLoading,
    isInitialized
  });

  // Show welcome page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <Header />
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700/10 via-violet-800/10 to-cyan-700/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-center min-h-screen px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.3)",
                  "0 0 40px rgba(168, 85, 247, 0.5)",
                  "0 0 20px rgba(168, 85, 247, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 bg-gradient-to-br from-violet-600 via-violet-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_-10px_rgba(139,92,246,0.6),0_0_50px_-10px_rgba(56,189,248,0.5)]"
            >
              <Crown className="h-16 w-16 text-white" />
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              System
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed">
              Master yourself through the ancient art of cultivation.<br />
              Build identities, track progress, and evolve beyond limits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Alpha Version Ready</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show loading spinner when initializing cultivator data
  if (isAuthenticated && (isLoading || (!isInitialized && !currentUser))) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Header />
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-4"
          />
          <p className="text-white">Initializing your cultivation journey...</p>
          <p className="text-gray-400 text-sm mt-2">
            Loading: {isLoading ? '✓' : '✗'} | 
            Initialized: {isInitialized ? '✓' : '✗'} | 
            User: {currentUser ? '✓' : '✗'}
          </p>
        </div>
      </div>
    );
  }

  // Calendar data derived from selected identity

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0612] via-[#0e0a18] to-[#071d26]">
      <Header />
      
      {/* Animation Events */}
      <AnimatePresence>
        {animationEvents.map((event, index) => (
          <motion.div
            key={`${event.identityID}-${event.type}-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, y: -40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              className={`relative p-8 rounded-2xl border-2 shadow-2xl backdrop-blur-xl pointer-events-auto ${
                event.type === 'EVOLUTION' 
                  ? 'bg-gradient-to-br from-yellow-500/20 via-orange-500/25 to-rose-600/30 border-yellow-400/60' 
                  : 'bg-gradient-to-br from-cyan-500/20 via-violet-500/25 to-indigo-600/30 border-cyan-400/60'
              }`}
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-violet-500/30 blur-xl opacity-60" />
              {/* Close button */}
              <button
                onClick={() => clearAnimationEvent(index)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all z-10"
                aria-label="Close notification"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative text-center text-white select-none">
                <div className="text-6xl mb-4 drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]">
                  {event.type === 'EVOLUTION' ? '🐉' : '⚡'}
                </div>
                <h2 className="text-3xl font-extrabold tracking-wide mb-3 bg-gradient-to-r from-cyan-300 via-violet-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(56,189,248,0.45)]">
                  {event.type === 'EVOLUTION' ? 'EVOLUTION!' : 'LEVEL UP!'}
                </h2>
                <p className="text-lg text-cyan-100/90 font-medium tracking-wide">
                  {event.message}
                </p>
              </div>
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3, ease: 'linear' }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400/60 via-cyan-400/60 to-violet-400/60 rounded-b-xl"
                onAnimationComplete={() => clearAnimationEvent(index)}
              />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center shadow-violet-glow-lg">
                <Crown className="h-12 w-12 text-white" />  
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6">
            {currentUser?.name || 'Cultivator'}
          </h1>
          
          {currentUser && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className={`tier-glow-base tier-glow-pulse text-3xl font-extrabold ${getTierColor(currentUser.tier)} tier-glow-${currentUser.tier} tier-grad-${currentUser.tier}`} data-text={`${currentUser.tier} Tier`}>
                {currentUser.tier} Tier
              </span>
            </div>
          )}
        </motion.div>

        {/* Active Identities */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center gap-1 mb-10 relative w-full"
          >
            <h2 className="text-2xl font-bold text-white tracking-wide mb-2">Active Identities</h2>
            <div className="h-1 w-32 bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 rounded-full shadow-[0_0_12px_2px_rgba(56,189,248,0.5)]" />
            <p className="text-xs md:text-sm text-gray-400 mt-1 tracking-wide">{todayDisplay}</p>
          </motion.div>

          {sortedIdentities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-violet-700/40 to-cyan-600/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-8px_rgba(139,92,246,0.5)]">
                <Sparkles className="h-10 w-10 text-cyan-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Begin Your Cultivation Journey
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Create your first identity and start your path to enlightenment. 
                Each day of practice brings you closer to mastery.
              </p>
              <motion.button
                onClick={handleCreateNewIdentity}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={creatingDefaults}
                className={`btn-primary inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_25px_-6px_rgba(139,92,246,0.6),0_0_25px_-6px_rgba(56,189,248,0.6)] ${creatingDefaults ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {creatingDefaults ? (
                  <>
                    <span className="h-5 w-5 inline-block border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Identities...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Start Cultivating
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full">
              {sortedIdentities.map((identity, index) => {
                const progress = getProgressForIdentity(identity.identityID);
                return progress ? (
                  <div key={identity.identityID} className="w-[90%]">
                    <CultivatorCard
                      identity={identity}
                      progress={progress}
                      index={index}
                    />
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Add New Identity Button - COMMENTED FOR FUTURE USE */}
        {/* {sortedIdentities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <motion.button
              onClick={handleCreateNewIdentity}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_25px_-6px_rgba(139,92,246,0.6),0_0_25px_-6px_rgba(56,189,248,0.6)]"
            >
              <Plus className="h-5 w-5" />
              Add New Path
            </motion.button>
          </motion.div>
        )} */}
      </div>

      {/* Removed Calendar Modal (now per card) */}
    </div>
  );
};

export default CultivatorHomepage;

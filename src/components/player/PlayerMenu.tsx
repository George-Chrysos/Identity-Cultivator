import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, CalendarPlus, Coins, Star, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useTestingStore } from '@/store/testingStore';
import { useQuestStore } from '@/store/questStore';
import { runAllTests } from '@/tests';
import { logger } from '@/utils/logger';

const PlayerMenu = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { userProfile } = useGameStore();
  const { logout } = useAuthStore();
  const { 
    isTestingMode, 
    enableTestingMode, 
    disableTestingMode, 
    advanceToNextDay,
    getTestingDateFormatted,
    addTestCoins,
    addTestStars,
  } = useTestingStore();

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleToggleTestingMode = useCallback(async () => {
    if (isTestingMode) {
      await disableTestingMode();
    } else {
      enableTestingMode();
    }
  }, [isTestingMode, enableTestingMode, disableTestingMode]);

  const handleAdvanceDay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    advanceToNextDay();
  }, [advanceToNextDay]);

  const handleAddCoins = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addTestCoins(500);
  }, [addTestCoins]);

  const handleAddStars = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addTestStars(50);
  }, [addTestStars]);

  const handleRunTests = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🧪 Running all tests...');
    runAllTests();
    setOpenMenu(false);
  }, []);

  // Reset User (Debug) - Resets coins, stars, paths, quests, and daily records
  const handleResetUser = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Browser confirmation
    const confirmed = window.confirm(
      '⚠️ RESET USER DATA?\n\n' +
      'This will:\n' +
      '• Reset Coins to 100\n' +
      '• Reset Stars to 5\n' +
      '• Lock all Paths (reset levels/xp to 0)\n' +
      '• Clear all Quests\n' +
      '• Clear daily records history\n\n' +
      'This action cannot be undone!'
    );
    
    if (!confirmed) return;
    
    try {
      logger.info('🔄 Starting user data reset...');
      
      // 1. Reset coins and stars via gameStore
      const { userProfile } = useGameStore.getState();
      if (userProfile) {
        // Import gameDB to reset all data directly
        const { gameDB } = await import('@/api/gameDatabase');
        await gameDB.updateProfile(userProfile.id, {
          coins: 100,
          stars: 5,
          body_points: 0,
          mind_points: 0,
          soul_points: 0,
          will_points: 0,
        });
        
        // Reload profile to ensure state is updated properly
        await useGameStore.getState().loadUserProfile(userProfile.id);
        logger.info('✅ Reset coins to 100, stars to 5, stats to 0');
      }
      
      // 2. Clear all quests
      const questState = useQuestStore.getState();
      const questIds = questState.quests.map(q => q.id);
      for (const id of questIds) {
        await questState.deleteQuest(id);
      }
      logger.info('✅ Cleared all quests');
      
      // 3. Deactivate all paths and reset path tree
      const gameState = useGameStore.getState();
      if (userProfile && gameState.activeIdentities) {
        // Deactivate all identities using gameStore method
        for (const identity of gameState.activeIdentities) {
          await gameState.deactivateIdentity(identity.id);
          gameState.clearDailyTasks(identity.id);
        }
        
        // Reload active identities (should be empty now)
        await gameState.loadActiveIdentities(userProfile.id);
        logger.info('✅ Deactivated all paths');
      }
      
      // 4. Clear daily task states from store
      useGameStore.setState({ 
        dailyTaskStates: {},
        activeIdentities: [],
      });
      logger.info('✅ Reset daily task states');
      
      // 5. Force page reload to reset path tree state
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      setOpenMenu(false);
      logger.info('🎉 User data reset complete!');
      
    } catch (error) {
      logger.error('Failed to reset user data', { error });
      alert('Failed to reset user data. Check console for details.');
    }
  }, []);

  if (!userProfile) return null;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setOpenMenu((v) => !v)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 transition-colors"
        aria-haspopup="menu"
        aria-expanded={openMenu}
      >
        {/* Avatar Circle */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 ${
          isTestingMode 
            ? 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-400/50' 
            : 'bg-gradient-to-br from-violet-500 to-cyan-500 border-violet-400/50'
        }`}>
          {userProfile.display_name.charAt(0).toUpperCase()}
        </div>
        {/* Centered Name */}
        <div className="text-white font-semibold text-xs flex items-center gap-1.5">
          {userProfile.display_name}
          {isTestingMode && (
            <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
              TEST
            </span>
          )}
        </div>
      </motion.button>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="menu"
            className="absolute left-0 mt-2 w-56 bg-slate-900/80 backdrop-blur-md border-2 border-purple-500/50 rounded-lg shadow-[0_0_8px_rgba(192,132,252,0.3)] overflow-hidden"
          >
            {/* Testing Mode Toggle */}
            <button
              onClick={handleToggleTestingMode}
              className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                isTestingMode 
                  ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' 
                  : 'text-white hover:bg-white/10'
              }`}
              role="menuitem"
            >
              <FlaskConical className={`w-4 h-4 ${isTestingMode ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="flex-1">
                {isTestingMode ? 'Exit Testing Mode' : 'Start Testing Mode'}
              </span>
              {isTestingMode && (
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* Next Day Button - Only visible in testing mode */}
            {isTestingMode && (
              <>
                <button
                  onClick={handleAdvanceDay}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-cyan-300 hover:bg-cyan-500/10 transition-colors border-t border-slate-700/50"
                  role="menuitem"
                >
                  <CalendarPlus className="w-4 h-4 text-cyan-400" />
                  <span className="flex-1">Advance to Next Day</span>
                  <span className="text-xs text-slate-500">
                    {getTestingDateFormatted()}
                  </span>
                </button>

                <button
                  onClick={handleAddCoins}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-amber-300 hover:bg-amber-500/10 transition-colors border-t border-slate-700/50"
                  role="menuitem"
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="flex-1">Add 500 Coins</span>
                  <span className="text-xs text-slate-500">
                    {userProfile.coins}
                  </span>
                </button>

                <button
                  onClick={handleAddStars}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-purple-300 hover:bg-purple-500/10 transition-colors border-t border-slate-700/50"
                  role="menuitem"
                >
                  <Star className="w-4 h-4 text-purple-400" />
                  <span className="flex-1">Add 50 Stars</span>
                  <span className="text-xs text-slate-500">
                    {userProfile.stars || 0}
                  </span>
                </button>

                <button
                  onClick={handleRunTests}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-green-300 hover:bg-green-500/10 transition-colors border-t border-slate-700/50"
                  role="menuitem"
                >
                  <FlaskConical className="w-4 h-4 text-green-400" />
                  <span className="flex-1">Run All Tests</span>
                  <span className="text-xs text-slate-500">Console</span>
                </button>
              </>
            )}

            {/* Reset User Button - Always visible */}
            <button
              onClick={handleResetUser}
              className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-red-300 hover:bg-red-500/10 transition-colors border-t border-slate-700/50"
              role="menuitem"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span className="flex-1">Reset User</span>
              <span className="text-xs text-red-400/70">⚠️</span>
            </button>

            {/* Divider */}
            <div className="border-t border-slate-700/50" />

            {/* Logout */}
            <button
              onClick={() => { setOpenMenu(false); logout(); }}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
              role="menuitem"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerMenu;

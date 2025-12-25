import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/layout/Header';
import { NavMenu } from '@/components/layout/NavMenu';
import ParticleBackground from '@/components/layout/ParticleBackground';
import PlayerCard from '@/components/player/PlayerCard';
import SealsCard from '@/components/player/SealsCard';
import PathCard from '@/components/path/PathCard';
import { InitialStatRankingModal } from '@/components/modals/InitialStatRankingModal';
import { NewQuestModal } from '@/components/modals/NewQuestModal';
import { QuestList } from '@/components/quest';
import { logger } from '@/utils/logger';
import { shallow } from 'zustand/shallow';
import { StatType } from '@/constants/statRanks';
import { getTemperingLevel, generateTemperingTaskTemplates } from '@/constants/temperingPath';
import { useChronosReset } from '@/hooks';

const Homepage = () => {
  const { isAuthenticated, currentUser: authUser } = useAuthStore();
  const [showStatRankingModal, setShowStatRankingModal] = useState(false);
  const [showNewQuestModal, setShowNewQuestModal] = useState(false);
  const statModalCheckedRef = useRef(false); // Track if we've already checked for stat modal this session
  
  // Chronos Reset hook - handles day change detection and daily resets
  // Note: showDawnSummary and dismissDawnSummary will be used for the Dawn Summary modal (future implementation)
  // executeManualReset is exposed for testing via PlayerMenu
  const chronosReset = useChronosReset();
  // Expose for testing in dev console
  if (typeof window !== 'undefined') {
    (window as unknown as { __chronosReset?: typeof chronosReset }).__chronosReset = chronosReset;
  }
  
  // ✅ OPTIMIZED: Use new game store
  const {
    userProfile,
    activeIdentities,
    todaySealLog,
    isLoading,
    isInitialized,
    initializeUser,
  } = useGameStore(
    (state) => ({
      userProfile: state.userProfile,
      activeIdentities: state.activeIdentities,
      todaySealLog: state.todaySealLog,
      isLoading: state.isLoading,
      isInitialized: state.isInitialized,
      initializeUser: state.initializeUser,
    }),
    shallow
  );

  // Initialize game data when user logs in
  const initStartedRef = useRef(false);

  useEffect(() => {
    logger.debug('useEffect triggered', { 
      isAuthenticated, 
      hasAuthUser: !!authUser, 
      hasUserProfile: !!userProfile, 
      isLoading,
      isInitialized
    });
    
    const initializeGameData = async () => {
      if (!isAuthenticated || !authUser?.id) {
        initStartedRef.current = false;
        return;
      }

      if (initStartedRef.current) return;

      if (isAuthenticated && !userProfile && !isInitialized) {
        initStartedRef.current = true;
        const userID = authUser.id;
        
        logger.info('Starting game data initialization', { userID });
        await initializeUser(userID);
        logger.info('Game data initialization complete');
      } else {
        logger.debug('Skipping initialization', {
          needsAuth: !isAuthenticated,
          hasUserProfile: !!userProfile,
          isCurrentlyLoading: isLoading,
          alreadyInitialized: isInitialized
        });
      }
    };
    
    initializeGameData();
  }, [isAuthenticated, authUser?.id, isInitialized, userProfile, initializeUser]);

  // Check if user is first-time (all stats are 0) - only check once per session
  useEffect(() => {
    if (userProfile && !isLoading && !statModalCheckedRef.current) {
      statModalCheckedRef.current = true; // Mark as checked to prevent re-triggering
      
      const isFirstTime = 
        userProfile.body_points === 0 &&
        userProfile.mind_points === 0 &&
        userProfile.soul_points === 0 &&
        (userProfile.will_points === 0 || userProfile.will_points === undefined);
      
      if (isFirstTime) {
        logger.info('First-time user detected, showing stat ranking modal');
        setShowStatRankingModal(true);
      }
    }
  }, [userProfile, isLoading]);

  const handleStatRankingSubmit = async (rankings: Record<StatType, number>) => {
    if (!userProfile) return;

    try {
      const { gameDB } = await import('@/api/gameDatabase');
      await gameDB.updateProfile(userProfile.id, {
        body_points: rankings.body,
        mind_points: rankings.mind,
        soul_points: rankings.soul,
        will_points: rankings.will,
      });

      // Reload profile to reflect changes
      const { loadUserProfile } = useGameStore.getState();
      await loadUserProfile(userProfile.id);

      setShowStatRankingModal(false);
      logger.info('Initial stat rankings saved', rankings);
    } catch (error) {
      logger.error('Failed to save initial stat rankings', error);
    }
  };

  const handleNewQuestSubmit = async (questData: {
    title: string;
    project: string;
    difficulty: string;
    date: string;
    time: string;
    subtasks: Array<{ id: string; title: string }>;
    customRewards: Array<{ id: string; description: string }>;
  }) => {
    try {
      const { useQuestStore } = await import('@/store/questStore');
      const { addQuest } = useQuestStore.getState();
      
      // Determine status based on date
      const getTodayFormatted = () => {
        // Check if testing mode is active
        const testingStore = (window as any).__testingStore;
        let today = new Date();
        if (testingStore) {
          const state = testingStore.getState();
          if (state.isTestingMode) {
            today = new Date(state.testingDate);
          }
        }
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[today.getMonth()]} ${today.getDate()}`;
      };
      
      const isToday = questData.date === getTodayFormatted();
      
      await addQuest({
        title: questData.title,
        project: questData.project,
        date: questData.date,
        hour: questData.time !== '--:--' ? questData.time : undefined,
        status: isToday ? 'today' : 'backlog',
        difficulty: questData.difficulty as 'Easy' | 'Moderate' | 'Difficult' | 'Hard' | 'Hell',
        subtasks: questData.subtasks,
        customRewards: questData.customRewards,
      });
      
      logger.info('New quest created successfully', questData);
    } catch (error) {
      logger.error('Failed to create quest', error);
    }
  };

  // Get display date (respects testing mode)
  const getDisplayDate = () => {
    const testingStore = (window as any).__testingStore;
    if (testingStore) {
      const state = testingStore.getState();
      if (state.isTestingMode) {
        return new Date(state.testingDate);
      }
    }
    return new Date();
  };
  const todayDisplay = getDisplayDate().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  // Debug logging
  logger.debug('Render state', { 
    isAuthenticated, 
    authUser: !!authUser, 
    userProfile: !!userProfile, 
    isLoading,
    isInitialized,
    activeIdentitiesCount: activeIdentities.length
  });

  // Show welcome page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <ParticleBackground />
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

  // Show loading spinner when initializing game data
  if (isAuthenticated && (isLoading || (!isInitialized && !userProfile))) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
        <ParticleBackground />
        <Header />
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-4"
          />
          <p className="text-white">Initializing your cultivation journey...</p>
          <p className="text-gray-400 text-sm mt-2">
            Loading: {isLoading ? '✓' : '✗'} | 
            Initialized: {isInitialized ? '✓' : '✗'} | 
            Profile: {userProfile ? '✓' : '✗'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white">
      <ParticleBackground />
      <Header />
      <NavMenu />
      
      {/* Animation Events - TODO: Add back animation system later */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-4 pb-24 relative z-10">
        {/* NEW DESIGN: Combined Player Card with Expandable Stats */}
        <PlayerCard />

        {/* Seals System */}
        <SealsCard todayLog={todaySealLog || undefined} />

        {/* ORIGINAL DESIGN: Separate Cards for comparison */}
        {/* Uncomment to compare with original design */}
        {/* 
        <PlayerRankCard />
        <PlayerStatsCard />
        */}

        {/* Active Identities */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center gap-3 mb-10 relative w-full"
          >
            {/* PATHS Title with Glitch Effect */}
            <h2 
              className="text-3xl md:text-4xl font-bold text-white font-section uppercase tracking-[0.2em] animate-glitch"
              style={{
                textShadow: '1px 0 0 rgba(255, 0, 0, 0.15), -1px 0 0 rgba(0, 255, 255, 0.15)'
              }}
            >
              PATHS
            </h2>
            
            {/* Diamond with Fading Lines */}
            <div className="flex items-center justify-center w-full max-w-md gap-2">
              {/* Left fading line */}
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-violet-500" />
              
              {/* Central diamond */}
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-br from-violet-400 to-cyan-400 rotate-45 shadow-[0_0_10px_2px_rgba(168,85,247,0.6)]" />
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-violet-400 to-cyan-400 rotate-45 blur-sm animate-pulse" />
              </div>
              
              {/* Right fading line */}
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-cyan-500/50 to-cyan-500" />
            </div>
            
            {/* Date with Monospace Font */}
            <p className="text-xs font-mono text-gray-400 opacity-60 tracking-wider mt-3">{todayDisplay}</p>
          </motion.div>

          {activeIdentities.length === 0 ? (
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
                No Active Paths
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Unlock paths in the Path Tree to begin your cultivation journey.
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
              {activeIdentities.map((identity) => {
                // Check if this is a tempering identity
                const isTemperingPath = identity.template.id.startsWith('tempering-warrior-trainee');
                const currentLevel = identity.current_level;
                
                // Get tempering level config if applicable
                const temperingConfig = isTemperingPath ? getTemperingLevel(currentLevel) : null;
                
                // Transform tasks to PathCard format - include path_id and path_level for registry lookup
                const transformedTasks = identity.available_tasks.map((task) => {
                  const transformed = {
                    id: task.id,
                    title: task.name,
                    description: task.description || `Complete ${task.name} to earn rewards and progress your cultivation journey.`,
                    rewards: {
                      xp: task.xp_reward,
                      stat: task.target_stat,
                      points: task.base_points_reward,
                      coins: task.coin_reward,
                    },
                    subtasks: task.subtasks?.map((subtask) => ({
                      id: subtask.id,
                      name: subtask.name,
                      description: subtask.description,
                    })),
                    // Path integration - enables dynamic reward lookup from pathRegistry
                    path_id: task.path_id || (isTemperingPath ? 'tempering-warrior-trainee' : undefined),
                    path_level: task.path_level || (isTemperingPath ? currentLevel : undefined),
                  };
                  logger.debug('Task transformed', { 
                    taskId: task.id, 
                    originalPathId: task.path_id,
                    finalPathId: transformed.path_id,
                    finalPathLevel: transformed.path_level,
                    isTemperingPath,
                  });
                  return transformed;
                });

                // Calculate XP to next level
                const maxXP = temperingConfig?.xpToLevelUp || 100 * (currentLevel + 1);
                
                // Build trial info from tempering config
                const trialInfo = temperingConfig ? {
                  name: temperingConfig.trial.name,
                  description: temperingConfig.trial.focus,
                  tasks: temperingConfig.trial.tasks,
                  rewards: temperingConfig.trial.rewards,
                } : undefined;

                // Helper to get next level data for level up
                const getNextLevelData = (newLevel: number) => {
                  const nextConfig = getTemperingLevel(newLevel);
                  if (!nextConfig) return null;
                  
                  // Generate tasks for next level
                  const nextTasks = generateTemperingTaskTemplates(newLevel);
                  const transformedNextTasks = nextTasks.map((task) => ({
                    id: task.id,
                    title: task.name,
                    description: task.description || '',
                    rewards: {
                      xp: task.xp_reward,
                      stat: task.target_stat,
                      points: task.base_points_reward,
                      coins: task.coin_reward,
                    },
                    subtasks: task.subtasks?.map((st) => ({
                      id: st.id,
                      name: st.name,
                      description: st.description,
                    })),
                    // Path integration for next level
                    path_id: task.path_id || 'tempering-warrior-trainee',
                    path_level: task.path_level || newLevel,
                  }));
                  
                  return {
                    title: `Tempering Lv.${newLevel}`,
                    subtitle: nextConfig.subtitle,
                    tasks: transformedNextTasks,
                    trialInfo: {
                      name: nextConfig.trial.name,
                      description: nextConfig.trial.focus,
                      tasks: nextConfig.trial.tasks,
                      rewards: nextConfig.trial.rewards,
                    },
                    maxXP: nextConfig.xpToLevelUp,
                  };
                };

                return (
                  <div key={identity.id} className="w-full">
                    <PathCard
                      identityId={identity.id}
                      title={identity.template.name}
                      subtitle={temperingConfig?.subtitle}
                      status={identity.completed_today ? 'completed' : 'pending'}
                      currentXP={identity.current_xp}
                      maxXP={maxXP}
                      streak={identity.current_streak}
                      level={currentLevel}
                      tasks={transformedTasks}
                      trialInfo={trialInfo}
                      onLevelUp={isTemperingPath ? getNextLevelData : undefined}
                      onTaskComplete={async (taskId) => {
                        logger.info('Task completed', { taskId, identityId: identity.id });
                        const result = await useGameStore.getState().completeTask(identity.id, taskId);
                        const didGainBody = (result.rewards.body_points ?? 0) > 0;
                        return { didGainBody };
                      }}
                      onAllTasksComplete={async (newStreak) => {
                        logger.info('All tasks completed for identity', { identityId: identity.id, newStreak });
                        // Persist streak to database
                        await useGameStore.getState().updateIdentityStreak(identity.id, newStreak);
                      }}
                      onTrialStart={() => {
                        logger.info('Trial started for identity', { identityId: identity.id });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quests Section */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center gap-3 mb-10 relative w-full"
          >
            {/* QUESTS Title with Glitch Effect */}
            <h2 
              className="text-3xl md:text-4xl font-bold text-white font-section uppercase tracking-[0.2em] animate-glitch"
              style={{
                textShadow: '1px 0 0 rgba(255, 0, 0, 0.15), -1px 0 0 rgba(0, 255, 255, 0.15)'
              }}
            >
              QUESTS
            </h2>
            
            {/* Diamond with Fading Lines */}
            <div className="flex items-center justify-center w-full max-w-md gap-2">
              {/* Left fading line */}
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-violet-500" />
              
              {/* Central diamond */}
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-br from-violet-400 to-cyan-400 rotate-45 shadow-[0_0_10px_2px_rgba(168,85,247,0.6)]" />
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-violet-400 to-cyan-400 rotate-45 blur-sm animate-pulse" />
              </div>
              
              {/* Right fading line */}
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-cyan-500/50 to-cyan-500" />
            </div>
          </motion.div>

          {/* One-Time Tasks Quest List */}
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
            <div className="w-full">
              <QuestList
                onQuestAdd={() => {
                  logger.info('Add quest clicked');
                  setShowNewQuestModal(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Removed Calendar Modal (now per card) */}

      {/* Initial Stat Ranking Modal for first-time users */}
      <InitialStatRankingModal 
        isOpen={showStatRankingModal}
        onSubmit={handleStatRankingSubmit}
      />

      {/* New Quest Modal */}
      <NewQuestModal
        isOpen={showNewQuestModal}
        onClose={() => setShowNewQuestModal(false)}
        onSubmit={handleNewQuestSubmit}
      />
    </div>
  );
};

export default Homepage;

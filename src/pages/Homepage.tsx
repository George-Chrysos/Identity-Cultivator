/**
 * Homepage — the Cyber-Grimoire dashboard.
 *
 * Structural hierarchy:
 *  1. PlayerCard           — rank, coins, stats (untouched)
 *  2. TrinityStrip         — three Seeds; the Mirror of Identity
 *  3. IdentityProclamation — docked daily mantra for the active Seed
 *  4. Twin-hero grid
 *     - DailyIdentityPanel  (left/top)  — PathCard for the active Seed
 *     - MainQuestPanel      (right/bot) — the single pinned Main Quest
 *  5. Side Quests (Arsenal) — demoted below the fold, QuestList for now
 *                             (replaced by ArsenalDrawer + ArsenalEcho in Phase 3)
 *  6. SealsCard             — demoted below the fold; its data now feeds the
 *                             Vitality Aura passively.
 *
 * The aura is mounted at the App level; `useVitalityAura` runs here to
 * derive and write the current state.
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { shallow } from 'zustand/shallow';

import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';

import Header from '@/components/layout/Header';
import { NavMenu } from '@/components/layout/NavMenu';
import ParticleBackground from '@/components/layout/ParticleBackground';

import PlayerCard from '@/components/player/PlayerCard';
import SealsCard from '@/components/player/SealsCard';

import TrinityStrip from '@/components/trinity/TrinityStrip';
import DailyIdentityPanel from '@/components/trinity/DailyIdentityPanel';
import IdentityProclamation from '@/components/trinity/IdentityProclamation';
import MainQuestPanel from '@/components/quest/MainQuestPanel';

import { InitialStatRankingModal } from '@/components/modals/InitialStatRankingModal';
import ArsenalDrawer from '@/components/quest/ArsenalDrawer';
import QuestForgeSheet from '@/components/grimoire/QuestForgeSheet';
import RuneLogSheet from '@/components/grimoire/RuneLogSheet';
import IdentityInitializer from '@/components/layout/IdentityInitializer';

import { logger } from '@/utils/logger';
import { StatType } from '@/constants/statRanks';
import { useChronosReset } from '@/hooks';
import { useVitalityAura } from '@/hooks/useVitalityAura';
import { useGrimoireStore } from '@/store/grimoireStore';
import { ScrollText } from 'lucide-react';

const Homepage = () => {
  const { isAuthenticated, currentUser: authUser } = useAuthStore();
  const [showStatRankingModal, setShowStatRankingModal] = useState(false);
  const [showForgeSheet, setShowForgeSheet] = useState(false);
  const [forgePinAsMain, setForgePinAsMain] = useState(false);
  const [showRuneLog, setShowRuneLog] = useState(false);
  const statModalCheckedRef = useRef(false);

  // Chronos reset hook (keeps its dev-console hookup from legacy Homepage).
  const chronosReset = useChronosReset();
  if (typeof window !== 'undefined') {
    (window as unknown as { __chronosReset?: typeof chronosReset }).__chronosReset = chronosReset;
  }

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

  // Vitality Aura derivation runs here so the data-aura attribute is set
  // as soon as the homepage has mounted with any meaningful state.
  useVitalityAura();

  // Bind grimoire store to current user so manual entries are user-scoped.
  const setGrimoireUser = useGrimoireStore((s) => s.setUserId);
  useEffect(() => {
    setGrimoireUser(authUser?.id ?? null);
  }, [authUser?.id, setGrimoireUser]);

  // ===== Game data initialization =====
  const initStartedRef = useRef(false);
  useEffect(() => {
    const initializeGameData = async () => {
      if (!isAuthenticated || !authUser?.id) {
        initStartedRef.current = false;
        return;
      }
      if (initStartedRef.current) return;
      if (isAuthenticated && !userProfile && !isInitialized) {
        initStartedRef.current = true;
        await initializeUser(authUser.id);
        logger.info('Game data initialization complete');
      }
    };
    initializeGameData();
  }, [isAuthenticated, authUser?.id, isInitialized, userProfile, initializeUser]);

  // First-time users: trigger the stat ranking modal.
  useEffect(() => {
    if (userProfile && !isLoading && !statModalCheckedRef.current) {
      statModalCheckedRef.current = true;
      const isFirstTime =
        userProfile.body_points === 0 &&
        userProfile.mind_points === 0 &&
        userProfile.soul_points === 0 &&
        (userProfile.will_points === 0 || userProfile.will_points === undefined);
      if (isFirstTime) setShowStatRankingModal(true);
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
      const { loadUserProfile } = useGameStore.getState();
      await loadUserProfile(userProfile.id);
      setShowStatRankingModal(false);
      logger.info('Initial stat rankings saved', rankings);
    } catch (error) {
      logger.error('Failed to save initial stat rankings', error);
    }
  };

  const openForgeSheet = (opts?: { pinAsMain?: boolean }) => {
    setForgePinAsMain(opts?.pinAsMain ?? false);
    setShowForgeSheet(true);
  };

  const getDisplayDate = () => {
    const testingStore = (window as unknown as { __testingStore?: { getState: () => { isTestingMode: boolean; testingDate: string } } }).__testingStore;
    if (testingStore) {
      const state = testingStore.getState();
      if (state.isTestingMode) return new Date(state.testingDate);
    }
    return new Date();
  };
  const todayDisplay = getDisplayDate().toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // ===== Unauthenticated landing =====
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <ParticleBackground />
        <Header />
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
                  '0 0 20px rgba(168, 85, 247, 0.3)',
                  '0 0 40px rgba(168, 85, 247, 0.5)',
                  '0 0 20px rgba(168, 85, 247, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-32 h-32 bg-gradient-to-br from-violet-600 via-violet-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_-10px_rgba(139,92,246,0.6),0_0_50px_-10px_rgba(56,189,248,0.5)]"
            >
              <Crown className="h-16 w-16 text-white" />
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">System</h1>
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

  // ===== Initialization spinner =====
  if (isAuthenticated && (isLoading || (!isInitialized && !userProfile))) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
        <ParticleBackground />
        <Header />
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-4"
          />
          <p className="text-white">Initializing your cultivation journey...</p>
        </div>
      </div>
    );
  }

  // ===== Main Cyber-Grimoire dashboard =====
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white">
      <ParticleBackground />
      <Header />
      <NavMenu />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-4 pb-24 relative z-10">
        <PlayerCard />

        {/* Trinity strip: three Seeds, centered */}
        <div className="mt-6 mb-3">
          <TrinityStrip />
        </div>

        {/* Docked mantra for the active Seed */}
        <div className="mb-8">
          <IdentityProclamation mode="docked" />
        </div>

        {/* Date ribbon (kept as a subtle anchor) */}
        <div className="flex items-center justify-center w-full max-w-md mx-auto gap-2 mb-8 opacity-70">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-violet-500" />
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-br from-violet-400 to-cyan-400 rotate-45 shadow-[0_0_10px_2px_rgba(168,85,247,0.6)]" />
          </div>
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-cyan-500/50 to-cyan-500" />
          <p className="text-xs font-mono text-gray-400 opacity-60 tracking-wider ml-3">
            {todayDisplay}
          </p>
        </div>

        {/* Twin-hero grid: DailyIdentityPanel + MainQuestPanel co-equal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
          <section
            aria-label="Daily Identity reps"
            className="min-w-0"
          >
            {activeIdentities.length === 0 ? (
              <EmptyIdentities />
            ) : (
              <DailyIdentityPanel />
            )}
          </section>

          <section aria-label="Main Quest" className="min-w-0">
            <MainQuestPanel
              onQuestForge={() => openForgeSheet({ pinAsMain: true })}
            />
          </section>
        </div>

        {/* Arsenal — collapsed-by-default drawer with peripheral glitch-echo
            for high-priority side quests. */}
        <div className="mb-12 w-full max-w-2xl mx-auto">
          <ArsenalDrawer onQuestForge={() => openForgeSheet()} />
        </div>

        {/* Seals — demoted; its data now drives the Vitality Aura passively. */}
        <section className="opacity-90 relative" aria-label="Seals">
          <SealsCard todayLog={todaySealLog || undefined} />

          {/* Grimoire micro-log affordance: a small, non-intrusive button
              that opens the RuneLogSheet for a three-tap ritual log. */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowRuneLog(true)}
              className={[
                'inline-flex items-center gap-2',
                'rounded-full px-4 py-2',
                'border border-violet-500/40 bg-violet-950/30 backdrop-blur-sm',
                'text-xs font-mono tracking-[0.16em] uppercase text-violet-200',
                'hover:border-violet-400/70 hover:bg-violet-900/40 transition-colors',
              ].join(' ')}
              aria-label="Inscribe a Grimoire entry"
            >
              <ScrollText className="w-3.5 h-3.5" />
              Inscribe
            </button>
          </div>
        </section>
      </div>

      <InitialStatRankingModal
        isOpen={showStatRankingModal}
        onSubmit={handleStatRankingSubmit}
      />

      <QuestForgeSheet
        isOpen={showForgeSheet}
        onClose={() => setShowForgeSheet(false)}
        defaultPinAsMain={forgePinAsMain}
      />

      <RuneLogSheet
        isOpen={showRuneLog}
        onClose={() => setShowRuneLog(false)}
      />

      {/* Aha! ritual — runs once per session, once initialization is done. */}
      <IdentityInitializer isReady={Boolean(userProfile && isInitialized)} />
    </div>
  );
};

/**
 * Empty-state for users with zero activated identities. The CTA routes to
 * the Path Tree where they can bind their first Seed.
 */
const EmptyIdentities = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35 }}
    className="card-style flex flex-col items-center text-center gap-4 py-12 px-6"
  >
    <div className="w-20 h-20 bg-gradient-to-br from-violet-700/40 to-cyan-600/30 rounded-full flex items-center justify-center shadow-[0_0_30px_-8px_rgba(139,92,246,0.5)]">
      <Crown className="h-10 w-10 text-cyan-300" />
    </div>
    <h3 className="text-xl font-bold text-white">Three Seeds Await</h3>
    <p className="text-gray-400 max-w-md">
      The Trinity is empty. Walk the Path Tree to bind your first Seed — one
      for Body, one for Mind, one for Soul.
    </p>
  </motion.div>
);

export default Homepage;

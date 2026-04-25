import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Crown, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';
import { useIdentityStore } from '@/store/identityStore';

import Header from '@/components/layout/Header';
import { NavMenu } from '@/components/layout/NavMenu';
import ParticleBackground from '@/components/layout/ParticleBackground';

import MainTaskCard from '@/components/home/MainTaskCard';
import SideQuestDrawer from '@/components/home/SideQuestDrawer';

const Homepage = () => {
  const { isAuthenticated } = useAuthStore();
  const identities = useIdentityStore((s) => s.identities);

  const todayDisplay = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    []
  );

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
                  '0 0 40px rgba(34, 211, 238, 0.5)',
                  '0 0 20px rgba(168, 85, 247, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-32 h-32 bg-gradient-to-br from-violet-600 via-violet-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_-10px_rgba(139,92,246,0.6),0_0_50px_-10px_rgba(56,189,248,0.5)]"
            >
              <Crown className="h-16 w-16 text-white" />
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              Identity Cultivator
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed">
              Bind yourself to archetypes. Grow them daily.
              <br />
              Anchor who you are &mdash; no matter where life takes you.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white">
      <ParticleBackground />
      <Header />
      <NavMenu />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 relative z-10">
        {/* Today ribbon */}
        <div className="flex items-center justify-center w-full max-w-md mx-auto gap-2 mb-6 opacity-80">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-violet-500" />
          <div className="w-3 h-3 bg-gradient-to-br from-violet-400 to-cyan-400 rotate-45 shadow-[0_0_10px_2px_rgba(168,85,247,0.6)]" />
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-cyan-500/50 to-cyan-500" />
          <p className="text-[10px] font-mono text-gray-400 opacity-70 tracking-[0.25em] uppercase ml-3">
            {todayDisplay}
          </p>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center text-[11px] uppercase tracking-[0.35em] text-cyan-200/70 mb-4"
        >
          Today &mdash; Non-Negotiable
        </motion.h2>

        {identities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5 mb-10">
            {identities.map((identity) => (
              <MainTaskCard key={identity.id} identity={identity} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <SideQuestDrawer />
        </div>
      </main>
    </div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35 }}
    className="card-style flex flex-col items-center text-center gap-4 py-12 px-6"
  >
    <div className="w-20 h-20 bg-gradient-to-br from-violet-700/40 to-cyan-600/30 rounded-full flex items-center justify-center shadow-[0_0_30px_-8px_rgba(139,92,246,0.5)]">
      <Compass className="h-10 w-10 text-cyan-300" />
    </div>
    <h3 className="text-xl font-bold text-white">No Identities Bound</h3>
    <p className="text-gray-400 max-w-md">
      Your anchors are empty. Walk the scroll wheel and bind two or three
      archetypes &mdash; they will become your daily non-negotiables.
    </p>
    <Link
      to="/identities"
      className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-sm uppercase tracking-[0.2em] shadow-[0_0_20px_-5px_rgba(34,211,238,0.6)] hover:from-violet-500 hover:to-cyan-500 transition-colors"
    >
      <Compass className="w-4 h-4" />
      Choose Identities
    </Link>
  </motion.div>
);

export default Homepage;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { RANK_TITLES } from '@/utils/rank';
import LoginModal from '@/components/auth/LoginModal';

const LOGO_SRC =
  'https://ecxiqlwdehbrvzvyyssx.supabase.co/storage/v1/object/sign/Images/logo%20no%20bd,%20no%20title.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYTg2YWQwNi1jMjc2LTRiMDAtOWFhMy03YWJhMWUzYTg5NTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvbG9nbyBubyBiZCwgbm8gdGl0bGUucG5nIiwiaWF0IjoxNzY2NTYzNTQ1LCJleHAiOjE4NjExNzE1NDV9.g7p567hF6OpwOI6C8-fQEbJCzB-gDAWN-rJ3qi7UuGQ';

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuthStore();
  const rank = useDashboardStore((s) => s.dashboard.rank);
  const [loginOpen, setLoginOpen] = useState(false);
  const letter = rank?.letter ?? 'D';
  const title = RANK_TITLES[letter];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 w-full h-12 md:h-20 flex items-center justify-between px-4 md:px-6 bg-slate-950/80 backdrop-blur-md border-b border-purple-500/20 z-50"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="flex items-center z-10 min-w-0">
          <div className="rank-badge flex flex-col min-w-0 leading-tight" aria-label={`Rank ${letter}, ${title}`}>
            <div className="flex items-baseline gap-1.5">
              <span className="font-section text-[0.75rem] uppercase tracking-[0.1em]">Rank</span>
              <span className="font-title text-xl md:text-3xl leading-none">{letter}</span>
            </div>
            <span className="hidden md:block font-section text-[10px] uppercase tracking-widest text-white/70 truncate max-w-[12rem]">
              {title}
            </span>
          </div>
        </div>

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-24 md:h-24 z-20 pointer-events-none"
          style={{ willChange: 'transform' }}
        >
          <motion.img
            src={LOGO_SRC}
            alt="Identity Cultivator logo"
            className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(168,85,247,0.3)] pointer-events-auto"
            style={{ transform: 'translateZ(0)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex items-center z-10 shrink-0">
          {isAuthenticated ? (
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-[14px] py-1.5 rounded-lg bg-transparent border border-red-400/40 text-red-200 text-[0.8rem] font-semibold uppercase tracking-widest hover:bg-red-500/10 transition-colors"
              style={{ transform: 'translateZ(0)' }}
              aria-label="Sign out"
            >
              {currentUser?.avatar_url && (
                <img
                  src={currentUser.avatar_url}
                  alt=""
                  className="hidden sm:block w-5 h-5 rounded-full border border-cyan-400/40"
                />
              )}
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setLoginOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="login-btn flex items-center gap-2"
              style={{ transform: 'translateZ(0)' }}
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </motion.button>
          )}
        </div>
      </header>

      <div className="h-12 md:h-20" />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Header;

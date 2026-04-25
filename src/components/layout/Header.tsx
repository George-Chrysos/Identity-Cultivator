import { motion } from 'framer-motion';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const Header = () => {
  const { isAuthenticated, currentUser, logout, login } = useAuthStore();

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 w-full h-12 md:h-20 flex items-center justify-between px-4 md:px-6 bg-slate-950/80 backdrop-blur-md border-b border-purple-500/20 z-50"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Left: user identity chip */}
        <div className="flex items-center gap-3 z-10">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.avatar_url && (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name || 'User'}
                  className="w-8 h-8 rounded-full border border-cyan-400/40"
                />
              )}
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-semibold text-white truncate max-w-[10rem]">
                  {currentUser.name || currentUser.email}
                </span>
                <span className="text-[10px] text-cyan-200/70 tracking-wider uppercase">
                  Cultivator
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>

        {/* Center: overflowing logo */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-2 w-14 h-14 md:-top-6 md:w-32 md:h-32 z-20"
          style={{ willChange: 'transform' }}
        >
          <motion.img
            src="https://ecxiqlwdehbrvzvyyssx.supabase.co/storage/v1/object/sign/Images/logo%20no%20bd,%20no%20title.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYTg2YWQwNi1jMjc2LTRiMDAtOWFhMy03YWJhMWUzYTg5NTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvbG9nbyBubyBiZCwgbm8gdGl0bGUucG5nIiwiaWF0IjoxNzY2NTYzNTQ1LCJleHAiOjE4NjExNzE1NDV9.g7p567hF6OpwOI6C8-fQEbJCzB-gDAWN-rJ3qi7UuGQ"
            alt="Identity Cultivator logo"
            className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(168,85,247,0.3)] hover:scale-110 transition-transform duration-300 cursor-pointer"
            style={{ transform: 'translateZ(0)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Right: login / sign-out */}
        <div className="flex items-center gap-4 z-10">
          {isAuthenticated ? (
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-400/40 text-red-200 text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{ transform: 'translateZ(0)' }}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => void login()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg backdrop-blur-sm font-body font-medium"
              style={{ transform: 'translateZ(0)' }}
            >
              <LogIn className="h-4 w-4" />
              Login
            </motion.button>
          )}
        </div>
      </header>

      {/* Spacer so content doesn't hide under the fixed header */}
      <div className="h-20 md:h-24" />
    </>
  );
};

export default Header;

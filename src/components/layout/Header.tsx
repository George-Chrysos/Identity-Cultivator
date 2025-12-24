import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import PlayerMenu from '../player/PlayerMenu';
import CurrencyDisplay from '../player/CurrencyDisplay';

// Lazy load LoginModal - only loads when user clicks login
const LoginModal = lazy(() => import('../auth/LoginModal'));

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const showHeader = useUIStore((state) => state.showHeader);

  if (!showHeader) return null;

  return (
    <>
      {/* Unified HUD Header - Glassmorphic Design */}
      <header 
        className="fixed top-0 left-0 right-0 w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-6 bg-slate-950/80 backdrop-blur-md border-b border-purple-500/20 z-50"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Left Section: Player Profile (Integrated) */}
        <div className="flex items-center gap-3 z-10">
          {isAuthenticated ? (
            <PlayerMenu />
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>

        {/* Center Section: Overflowing Logo */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-1 w-14 h-14 md:-top-6 md:w-32 md:h-32 z-20"
          style={{ willChange: 'transform' }}
        >
          <motion.img 
            src="https://ecxiqlwdehbrvzvyyssx.supabase.co/storage/v1/object/sign/Images/logo%20no%20bd,%20no%20title.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYTg2YWQwNi1jMjc2LTRiMDAtOWFhMy03YWJhMWUzYTg5NTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvbG9nbyBubyBiZCwgbm8gdGl0bGUucG5nIiwiaWF0IjoxNzY2NTYzNTQ1LCJleHAiOjE4NjExNzE1NDV9.g7p567hF6OpwOI6C8-fQEbJCzB-gDAWN-rJ3qi7UuGQ"
            alt="Anima Forge Logo"
            className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(168,85,247,0.3)] hover:scale-110 transition-transform duration-300 cursor-pointer"
            style={{ transform: 'translateZ(0)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Right Section: Currency Display or Login Button */}
        <div className="flex items-center gap-4 z-10">
          {isAuthenticated ? (
            <CurrencyDisplay />
          ) : (
            <motion.button
              onClick={() => setShowLoginModal(true)}
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

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-20 md:h-24" />

      {/* Lazy load LoginModal only when needed */}
      {showLoginModal && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
          />
        </Suspense>
      )}
    </>
  );
};

export default Header;

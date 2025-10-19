import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { isSupabaseConfigured } from '@/lib/supabase';

// Lazy load LoginModal - only loads when user clicks login
const LoginModal = lazy(() => import('./LoginModal'));

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const useSupabase = isSupabaseConfigured();
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <>
      <header className="fixed top-0 right-0 z-40 p-4">
        <div className="flex items-center gap-4">
          {useSupabase ? (
            // When using Supabase, show a centralized login modal instead of inline auth button
            isAuthenticated && currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpenMenu((v) => !v)}
                  className="flex items-center gap-2 bg-dark-surface/80 backdrop-blur-sm border border-dark-border rounded-lg px-4 py-2 text-white font-medium font-body hover:bg-white/5"
                  aria-haspopup="menu"
                  aria-expanded={openMenu}
                >
                  <span>{currentUser.name}</span>
                  <span className={`transition-transform ${openMenu ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {openMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 bg-[#1a1426]/95 border border-violet-500/30 rounded-lg shadow-xl backdrop-blur-md overflow-hidden"
                  >
                    <button
                      onClick={() => { setOpenMenu(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <motion.button
                onClick={() => setShowLoginModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg backdrop-blur-sm font-body font-medium"
              >
                <LogIn className="h-4 w-4" />
                Login
              </motion.button>
            )
          ) : isAuthenticated && currentUser ? (
            // Local auth (legacy)
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((v) => !v)}
                className="flex items-center gap-2 bg-dark-surface/80 backdrop-blur-sm border border-dark-border rounded-lg px-4 py-2 text-white font-medium font-body hover:bg-white/5"
                aria-haspopup="menu"
                aria-expanded={openMenu}
              >
                <span>{currentUser.name}</span>
                <span className={`transition-transform ${openMenu ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {openMenu && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 bg-[#1a1426]/95 border border-violet-500/30 rounded-lg shadow-xl backdrop-blur-md overflow-hidden"
                >
                  <button
                    onClick={() => { setOpenMenu(false); logout(); }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <motion.button
              onClick={() => setShowLoginModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg backdrop-blur-sm font-body font-medium"
            >
              <LogIn className="h-4 w-4" />
              Login
            </motion.button>
          )}
        </div>
      </header>

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

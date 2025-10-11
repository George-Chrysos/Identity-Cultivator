import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import LoginModal from './LoginModal';
import { isSupabaseConfigured } from '@/lib/supabase';

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const useSupabase = isSupabaseConfigured();

  return (
    <>
      <header className="fixed top-0 right-0 z-40 p-4">
        <div className="flex items-center gap-4">
          {useSupabase ? (
            // When using Supabase, show a centralized login modal instead of inline auth button
            isAuthenticated && currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-dark-surface/80 backdrop-blur-sm border border-dark-border rounded-lg px-4 py-2">
                  <span className="text-white font-medium">{currentUser.name}</span>
                </div>
                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600/80 backdrop-blur-sm hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowLoginModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg backdrop-blur-sm"
              >
                <LogIn className="h-4 w-4" />
                Login
              </motion.button>
            )
          ) : isAuthenticated && currentUser ? (
            // Local auth (legacy)
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-dark-surface/80 backdrop-blur-sm border border-dark-border rounded-lg px-4 py-2">
                <span className="text-white font-medium">{currentUser.name}</span>
              </div>
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600/80 backdrop-blur-sm hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={() => setShowLoginModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg backdrop-blur-sm"
            >
              <LogIn className="h-4 w-4" />
              Login
            </motion.button>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Header;

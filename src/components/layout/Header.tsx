import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import PlayerMenu from '../player/PlayerMenu';
import CurrencyDisplay from '../player/CurrencyDisplay';
import { GPU_ACCELERATION_STYLES } from '@/components/common';

// Lazy load LoginModal - only loads when user clicks login
const LoginModal = lazy(() => import('../auth/LoginModal'));

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Player Menu - Top Left (Sticky) */}
      {isAuthenticated && (
        <div className="fixed top-4 left-4 z-40" style={GPU_ACCELERATION_STYLES}>
          <PlayerMenu />
        </div>
      )}

      {/* Currencies - Top Right (Sticky) */}
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-40" style={GPU_ACCELERATION_STYLES}>
          <CurrencyDisplay />
        </div>
      )}

      {/* Login Button - Top Right (Only when not authenticated) */}
      {!isAuthenticated && (
        <header className="fixed top-4 right-4 z-40" style={GPU_ACCELERATION_STYLES}>
          <motion.button
            onClick={() => setShowLoginModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg backdrop-blur-sm font-body font-medium"
            style={GPU_ACCELERATION_STYLES}
          >
            <LogIn className="h-4 w-4" />
            Login
          </motion.button>
        </header>
      )}

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

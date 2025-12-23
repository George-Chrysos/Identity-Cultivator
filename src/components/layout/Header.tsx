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

      {/* Logo & Currencies - Top Right (Sticky) */}
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-3" style={GPU_ACCELERATION_STYLES}>
          <img 
            src="https://ecxiqlwdehbrvzvyyssx.supabase.co/storage/v1/object/sign/Images/logo_white_bd_anima_forge-removebg.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYTg2YWQwNi1jMjc2LTRiMDAtOWFhMy03YWJhMWUzYTg5NTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvbG9nb193aGl0ZV9iZF9hbmltYV9mb3JnZS1yZW1vdmViZy5wbmciLCJpYXQiOjE3NjY0OTk4MDksImV4cCI6MTg2MTEwNzgwOX0.7efNqwbhCovdK6Rl20xiY_2y99htXjxcw5mQ9mcX5XI"
            alt="Anima Forge Logo"
            className="h-10 w-auto"
            style={GPU_ACCELERATION_STYLES}
          />
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

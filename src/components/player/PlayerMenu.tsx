import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';

const PlayerMenu = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { userProfile } = useGameStore();
  const { logout } = useAuthStore();

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

  if (!userProfile) return null;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setOpenMenu((v) => !v)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border-2 border-purple-500/50 rounded-lg px-3 py-1.5 shadow-[0_0_8px_rgba(192,132,252,0.3)] hover:bg-slate-900/90 transition-colors"
        aria-haspopup="menu"
        aria-expanded={openMenu}
      >
        {/* Avatar Circle */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-violet-400/50">
          {userProfile.display_name.charAt(0).toUpperCase()}
        </div>
        {/* Centered Name */}
        <div className="text-white font-semibold text-xs">
          {userProfile.display_name}
        </div>
      </motion.button>
      
      {/* Dropdown Menu */}
      {openMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="menu"
          className="absolute left-0 mt-2 w-48 bg-slate-900/80 backdrop-blur-md border-2 border-purple-500/50 rounded-lg shadow-[0_0_8px_rgba(192,132,252,0.3)] overflow-hidden"
        >
          <button
            onClick={() => { setOpenMenu(false); logout(); }}
            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
            role="menuitem"
          >
            Logout
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PlayerMenu;

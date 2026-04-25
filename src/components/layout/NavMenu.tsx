import { memo, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { GPU_ACCELERATION_STYLES } from '@/components/common';

export const NavMenu = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleNavigate = useCallback(
    (path: string) => {
      setIsAnimating(true);
      navigate(path);
      window.scrollTo(0, 0);
      setTimeout(() => setIsAnimating(false), 200);
    },
    [navigate]
  );

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/identities', icon: Compass, label: 'Identities' },
  ];

  return (
    <nav
      className="nav-menu fixed bottom-0 left-0 right-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-t border-cyan-400/20"
      style={{
        backdropFilter: isAnimating ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: isAnimating ? 'none' : 'blur(12px)',
        boxShadow: isAnimating ? 'none' : '0 -4px 20px rgba(0,0,0,0.35)',
        transition: 'backdrop-filter 200ms ease-out, box-shadow 200ms ease-out',
        ...GPU_ACCELERATION_STYLES,
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <motion.button
              key={path}
              onClick={() => handleNavigate(path)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg transition-colors min-w-0 ${
                active ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={GPU_ACCELERATION_STYLES}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className="h-6 w-6 flex-shrink-0"
                style={{
                  filter:
                    active && !isAnimating
                      ? 'drop-shadow(0 0 4px rgba(34,211,238,0.7)) drop-shadow(0 0 10px rgba(168,85,247,0.4))'
                      : 'none',
                  transition: 'filter 200ms ease-out',
                }}
              />
              <span className="text-[10px] font-semibold truncate uppercase tracking-widest">
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
});

NavMenu.displayName = 'NavMenu';

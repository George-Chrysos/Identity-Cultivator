import { memo, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Network, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { GPU_ACCELERATION_STYLES } from '@/components/common';

export const NavMenu = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const handleNavigate = useCallback((path: string) => {
    setIsAnimating(true);
    navigate(path);
    // Reset animation state after navigation completes
    setTimeout(() => setIsAnimating(false), 200);
  }, [navigate]);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/path-tree', icon: Network, label: 'Paths' },
    { path: '/shop', icon: Store, label: 'Shop' },
    { path: '/inventory', icon: ShoppingBag, label: 'Inventory' }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 w-full bg-slate-900/95 border-t border-slate-700/50"
      style={{
        backdropFilter: isAnimating ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: isAnimating ? 'none' : 'blur(12px)',
        boxShadow: isAnimating ? 'none' : '0 -4px 20px rgba(0,0,0,0.3)',
        transition: 'backdrop-filter 200ms ease-out, box-shadow 200ms ease-out',
        ...GPU_ACCELERATION_STYLES,
      }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <motion.button
            key={path}
            onClick={() => handleNavigate(path)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg transition-colors min-w-0 ${
              isActive(path)
                ? 'text-purple-600'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={GPU_ACCELERATION_STYLES}
          >
            <Icon 
              className={`h-5 w-5 flex-shrink-0`} 
              style={{
                filter: isActive(path) && !isAnimating
                  ? 'drop-shadow(0 0 8px rgba(168,85,247,1)) drop-shadow(0 0 2px rgba(168,85,247,0.6)) drop-shadow(0 0 32px rgba(168,85,247,0.5)) drop-shadow(0 0 12px rgba(255,255,255,0.4))'
                  : 'none',
                transition: 'filter 200ms ease-out',
              }}
            />
            <span className="text-[10px] font-semibold truncate">{label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
});

NavMenu.displayName = 'NavMenu';

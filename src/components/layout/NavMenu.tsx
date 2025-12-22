import { memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Network, Store } from 'lucide-react';
import { motion } from 'framer-motion';

export const NavMenu = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/path-tree', icon: Network, label: 'Path Tree' },
    { path: '/shop', icon: Store, label: 'Shop' },
    { path: '/inventory', icon: ShoppingBag, label: 'Inventory' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              isActive(path)
                ? 'text-purple-600'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`h-6 w-6 ${isActive(path) ? 'drop-shadow-[0_0_8px_rgba(168,85,247,1)] drop-shadow-[0_0_2px_rgba(168,85,247,0.6)] drop-shadow-[0_0_32px_rgba(168,85,247,0.5)] drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : ''}`} />
            <span className="text-xs font-semibold">{label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
});

NavMenu.displayName = 'NavMenu';

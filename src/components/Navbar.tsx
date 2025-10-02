import { Link, useLocation } from 'react-router-dom';
import { Home, User, List, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  onCreateClick: () => void;
}

const Navbar = ({ onCreateClick }: NavbarProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Character', href: '/character', icon: User },
    { name: 'All Identities', href: '/identities', icon: List },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-dark-surface/95 backdrop-blur-sm border-r border-dark-border">
          {/* Logo */}
          <div className="flex items-center px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-900/30 rounded-xl shadow-violet-glow">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Plus className="h-6 w-6 text-violet-400" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Identity</h1>
                <p className="text-sm text-cyan-300 font-medium">Evolution</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${active ? 'active' : ''}`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full shadow-glow"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Create Button */}
          <div className="p-4">
            <motion.button
              onClick={onCreateClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Identity
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-dark-surface/95 backdrop-blur-sm border-t border-dark-border">
          <div className="flex items-center justify-around py-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-cyan-300 bg-dark-card shadow-glow'
                      : 'text-gray-400 hover:text-cyan-300'
                  }`}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            {/* FAB */}
            <motion.button
              onClick={onCreateClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-full shadow-violet-glow-lg transition-all duration-200"
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

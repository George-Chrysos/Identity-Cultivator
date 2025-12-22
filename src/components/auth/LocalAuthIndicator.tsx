import { motion } from 'framer-motion';
import { User, Settings } from 'lucide-react';
import { isLocalAuthEnabled, getDemoUsers, signInWithDemoUser } from '@/services/localAuthService';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

const LocalAuthIndicator = () => {
  const [showUserSelect, setShowUserSelect] = useState(false);
  const { isLocalAuth, currentUser, setUser } = useAuthStore();

  if (!isLocalAuthEnabled() || !isLocalAuth) return null;

  const demoUsers = getDemoUsers();
  const currentDemoIndex = demoUsers.findIndex(u => u.id === currentUser?.id);

  const handleSwitchUser = (index: number) => {
    const demoUser = signInWithDemoUser(index);
    setUser({ 
      id: demoUser.id, 
      name: demoUser.name, 
      email: demoUser.email,
      avatar_url: demoUser.avatar_url 
    });
    setShowUserSelect(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/20 backdrop-blur-sm border border-amber-400/50 rounded-lg px-4 py-2 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-amber-300" />
          <span className="text-sm font-semibold text-amber-200">DEV MODE</span>
          <button
            onClick={() => setShowUserSelect(!showUserSelect)}
            className="ml-2 p-1 hover:bg-amber-400/20 rounded transition-colors"
            title="Switch demo user"
          >
            <Settings className="h-4 w-4 text-amber-300" />
          </button>
        </div>
        
        {showUserSelect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 pt-2 border-t border-amber-400/30"
          >
            <p className="text-xs text-amber-200/70 mb-2">Select Demo User:</p>
            <div className="space-y-1">
              {demoUsers.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(index)}
                  disabled={index === currentDemoIndex}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    index === currentDemoIndex
                      ? 'bg-amber-400/30 text-amber-100 cursor-default'
                      : 'hover:bg-amber-400/20 text-amber-200'
                  }`}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-amber-300/60">{user.email}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LocalAuthIndicator;

import { memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface LevelUpNotificationProps {
  isVisible: boolean;
  pathName: string;
  newLevel: number;
  onComplete: () => void;
}

export const LevelUpNotification = memo(({
  isVisible,
  pathName,
  newLevel,
  onComplete,
}: LevelUpNotificationProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: [0.5, 1.1, 1],
              y: 0 
            }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ 
              duration: 0.6, 
              ease: 'easeOut',
              scale: { times: [0, 0.6, 1] }
            }}
            className="relative pointer-events-auto"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-2xl blur-3xl" />
            
            {/* Content */}
            <div className="relative bg-slate-900/95 backdrop-blur-md border-2 border-purple-500 rounded-2xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.8)]">
              {/* Close Button */}
              <button
                onClick={onComplete}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/50 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                
                <h2 
                  className="text-3xl font-bold text-white font-section tracking-wide mb-2"
                  style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }}
                >
                  LEVEL UP!
                </h2>
                
                <p className="text-purple-400 font-medium mb-1">
                  {pathName} Lv.{newLevel - 1}
                </p>
                
                <p className="text-slate-300 text-sm">
                  has advanced to <span className="text-purple-400 font-bold">Level {newLevel}</span>!
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

LevelUpNotification.displayName = 'LevelUpNotification';

export default LevelUpNotification;

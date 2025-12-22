import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface BurningProgressProps {
  remainingMs: number;
  progress: number; // 0-100
}

/**
 * Format milliseconds to HH:mm:ss
 */
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const BurningProgress = memo(({
  remainingMs,
  progress,
}: BurningProgressProps) => {
  const [timeLeft, setTimeLeft] = useState(remainingMs);
  const [currentProgress, setCurrentProgress] = useState(progress);

  // Update countdown every second
  useEffect(() => {
    setTimeLeft(remainingMs);
    setCurrentProgress(progress);

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000));
      // Recalculate progress based on time
      const newProgress = progress + ((1000 / remainingMs) * (100 - progress));
      setCurrentProgress(Math.min(100, newProgress));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingMs, progress]);

  return (
    <div className="space-y-2">
      {/* Progress Label */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-400">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Flame className="w-4 h-4" />
          </motion.div>
          <span className="font-medium">Purifying</span>
        </div>
        <span className="text-amber-300 font-mono font-semibold">
          {formatTime(timeLeft)} remaining
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(245, 158, 11, 0.2) 10px, rgba(245, 158, 11, 0.2) 20px)',
          }}
        />
        
        {/* Progress fill */}
        <motion.div
          className="h-full relative"
          style={{
            width: `${currentProgress}%`,
            background: 'linear-gradient(90deg, #f59e0b, #ef4444, #dc2626)',
          }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Animated fire edge */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-4"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.8))',
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
              x: [-2, 2, -2],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Ember particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-orange-400"
              style={{
                left: `${currentProgress - 5 + Math.random() * 10}%`,
                bottom: '0',
              }}
              animate={{
                y: [0, -15, -25],
                opacity: [1, 0.8, 0],
                scale: [1, 0.8, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* Status Text */}
      <p className="text-xs text-slate-500 text-center italic">
        Karma is being processed...
      </p>
    </div>
  );
});

BurningProgress.displayName = 'BurningProgress';

import { motion } from 'framer-motion';
import { formatXP } from '@/utils/gameLogic';

interface ProgressBarProps {
  currentXP: number;
  xpToNextLevel: number;
  level: number;
  animated?: boolean;
  showLabel?: boolean;
}

const ProgressBar = ({ 
  currentXP, 
  xpToNextLevel, 
  level, 
  animated = true,
  showLabel = true 
}: ProgressBarProps) => {
  const totalXPForLevel = currentXP + xpToNextLevel;
  const progress = totalXPForLevel > 0 ? (currentXP / totalXPForLevel) * 100 : 0;

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Level {level} Progress</span>
          <span className="text-cyan-300 font-medium">
            {formatXP(currentXP)} / {formatXP(totalXPForLevel)} XP
          </span>
        </div>
      )}
      
      <div className="progress-bar relative overflow-hidden">
        <motion.div 
          className="progress-fill h-full"
          initial={animated ? { width: 0 } : { width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            ease: "easeOut" 
          }}
        />
        
        {/* Glow effect overlay */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-30 animate-pulse"
          style={{ width: `${Math.min(progress + 10, 100)}%` }}
        />
      </div>
      
      {showLabel && (
        <div className="text-xs text-gray-400 text-center">
          {formatXP(xpToNextLevel)} XP to Level {level + 1}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

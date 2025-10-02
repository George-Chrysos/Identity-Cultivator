import { Link } from 'react-router-dom';
import { CheckCircle, Play, Pause, Calendar, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Identity } from '@/models/types';
import { useIdentityStore } from '@/store/identityStore';
import { toast } from '@/store/toastStore';

import ProgressBar from './ProgressBar';

interface IdentityCardProps {
  identity: Identity;
  isCompletedToday: boolean;
  index?: number;
}

const IdentityCard = ({ identity, isCompletedToday, index = 0 }: IdentityCardProps) => {
  const { completeDailyTask, activateIdentity, deactivateIdentity, canActivateMoreIdentities } = useIdentityStore();

  const handleCompleteTask = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCompletedToday && identity.isActive) {
      const result = await completeDailyTask(identity.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (identity.isActive) {
      const result = await deactivateIdentity(identity.id);
      if (result.success) {
        toast.info(result.message);
      } else {
        toast.error(result.message);
      }
    } else {
      if (!canActivateMoreIdentities()) {
        toast.error('Maximum 5 active identities allowed');
        return;
      }
      
      const result = await activateIdentity(identity.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  const getEvolutionBadgeStyle = (stage: string) => {
    const styles = {
      novice: 'bg-gray-700 text-gray-300 border-gray-600',
      apprentice: 'bg-green-900/50 text-green-300 border-green-600',
      expert: 'bg-yellow-900/50 text-yellow-300 border-yellow-600',
      master: 'bg-violet-900/50 text-violet-300 border-violet-600',
      legend: 'bg-red-900/50 text-red-300 border-red-600',
    };
    return styles[stage as keyof typeof styles] || styles.novice;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="identity-card group"
    >
      <Link to={`/identity/${identity.id}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {identity.name}
              </h3>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {identity.description}
            </p>
          </div>
          <div className="ml-4 flex flex-col items-end gap-2">
            <button
              onClick={handleToggleActive}
              className={`p-2 rounded-xl transition-all duration-200 ${
                identity.isActive
                  ? 'text-cyan-300 bg-cyan-900/30 hover:bg-cyan-800/40 shadow-glow'
                  : 'text-gray-400 bg-gray-800/30 hover:bg-gray-700/40'
              }`}
              title={identity.isActive ? 'Pause identity' : 'Activate identity'}
            >
              {identity.isActive ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Level, Evolution Stage & Today's Task inline */}
        <div className="flex items-center gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-lg font-bold text-cyan-300">Level {identity.level}</span>
            </div>
            <span className={`evolution-badge ${getEvolutionBadgeStyle(identity.evolutionStage)}`}>
              {identity.evolutionStage}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto sm:ml-4">
            <Calendar className="h-4 w-4 text-cyan-400" />
            {identity.isActive && (
              <motion.button
                onClick={handleCompleteTask}
                disabled={isCompletedToday}
                whileHover={!isCompletedToday ? { scale: 1.1 } : {}}
                whileTap={!isCompletedToday ? { scale: 0.95 } : {}}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isCompletedToday
                    ? 'text-green-400 bg-green-900/40 shadow-glow cursor-not-allowed'
                    : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-900/30 hover:shadow-glow'
                }`}
                title={isCompletedToday ? 'Completed' : 'Complete'}
              >
                <CheckCircle className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-6">
          <ProgressBar
            currentXP={identity.xp}
            xpToNextLevel={identity.xpToNextLevel}
            level={identity.level}
            animated={false}
          />
        </div>

        {/* Daily Task (Text Only Now) */}
        <div className="bg-dark-surface/60 rounded-xl p-4 mb-4 border border-dark-border backdrop-blur-sm">
          <p className={`text-sm leading-relaxed ${
            isCompletedToday ? 'text-green-300 line-through' : 'text-gray-300'
          }`}>
            {identity.dailyTask}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            identity.isActive
              ? 'bg-cyan-900/10 text-cyan-300/80 border-cyan-700/40'
              : 'bg-gray-800/20 text-gray-400/70 border-gray-600/40'
          }`}>
            {identity.isActive ? 'ACTIVE' : 'PAUSED'}
          </span>
          {isCompletedToday && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center text-green-400/90 text-xs font-semibold"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              COMPLETED
            </motion.span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default IdentityCard;

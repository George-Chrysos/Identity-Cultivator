import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Award, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatXP } from '@/utils/gameLogic';
import ProgressBar from '@/components/ProgressBar';

const IdentityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getIdentityById, getCompletionsByIdentity } = useGameStore();
  
  const identity = id ? getIdentityById(id) : undefined;
  const completions = id ? getCompletionsByIdentity(id) : [];

  if (!identity) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="card max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Identity Not Found</h2>
          <p className="text-gray-400 mb-6">The identity you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  const getEvolutionBadgeStyle = (stage: string) => {
    const styles = {
      novice: 'bg-gray-700/50 text-gray-300 border-gray-600',
      apprentice: 'bg-green-900/50 text-green-300 border-green-600',
      expert: 'bg-yellow-900/50 text-yellow-300 border-yellow-600',
      master: 'bg-violet-900/50 text-violet-300 border-violet-600',
      legend: 'bg-red-900/50 text-red-300 border-red-600',
    };
    return styles[stage as keyof typeof styles] || styles.novice;
  };

  const recentCompletions = completions.slice(-10).reverse();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link 
          to="/" 
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-white">
                  {identity.name}
                </h1>
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {identity.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-cyan-400" />
                  <span className="text-lg font-bold text-cyan-300">Level {identity.level}</span>
                </div>
                <div className={`evolution-badge ${getEvolutionBadgeStyle(identity.evolutionStage)}`}>
                  {identity.evolutionStage.toUpperCase()}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  identity.isActive
                    ? 'bg-cyan-900/30 text-cyan-300 border-cyan-600'
                    : 'bg-gray-800/30 text-gray-400 border-gray-600'
                }`}>
                  {identity.isActive ? 'ACTIVE' : 'PAUSED'}
                </div>
              </div>
            </div>
          </div>
          
          {/* XP Progress */}
          <ProgressBar
            currentXP={identity.xp}
            xpToNextLevel={identity.xpToNextLevel}
            level={identity.level}
            animated={true}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Task */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Daily Task</h2>
          </div>
          <div className="bg-dark-surface/60 rounded-xl p-6 border border-dark-border">
            <p className="text-gray-200 text-lg leading-relaxed">{identity.dailyTask}</p>
          </div>
          {identity.lastCompletedTask && (
            <p className="text-sm text-gray-400 mt-4">
              Last completed: {new Date(identity.lastCompletedTask).toLocaleDateString()}
            </p>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Statistics</h2>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Completions</span>
              <span className="font-bold text-xl text-cyan-300">{completions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total XP Earned</span>
              <span className="font-bold text-xl text-cyan-300">{formatXP(identity.xp)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Created</span>
              <span className="font-bold text-white">
                {new Date(identity.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Days Since Creation</span>
              <span className="font-bold text-white">
                {Math.ceil((Date.now() - new Date(identity.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          </div>
          
          {recentCompletions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400">
                No recent activity. Complete your daily task to see progress here!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCompletions.map((completion, index) => (
                <motion.div
                  key={completion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center justify-between py-4 px-6 bg-dark-surface/50 rounded-xl border border-dark-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-glow" />
                    <div>
                      <span className="text-white font-medium">Task completed</span>
                      <p className="text-xs text-gray-400">
                        {new Date(completion.date).toLocaleDateString()} at {new Date(completion.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      +{completion.xpGained} XP
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default IdentityDetails;

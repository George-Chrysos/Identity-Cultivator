import { CheckCircle, Clock, Star, Zap, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIdentityStore } from '@/store/identityStore';
import IdentityCard from '@/components/IdentityCard';
import { formatXP } from '@/utils/gameLogic';

const Dashboard = () => {
  const { character, gameStats, getActiveIdentities, getTodayCompletions } = useIdentityStore();
  
  const activeIdentities = getActiveIdentities();
  const todayCompletions = getTodayCompletions();
  const completedToday = todayCompletions.length;
  const totalActiveTasks = activeIdentities.length;

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

  const stats = [
    {
      name: 'Active Identities',
      value: `${activeIdentities.length}/5`,
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/30',
      borderColor: 'border-cyan-600/30',
    },
    {
      name: 'Tasks Completed Today',
      value: `${completedToday}/${totalActiveTasks}`,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-600/30',
    },
    {
      name: 'Current Streak',
      value: `${gameStats.currentStreak} days`,
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/30',
      borderColor: 'border-orange-600/30',
    },
    {
      name: 'Total XP',
      value: formatXP(character.totalXp),
      icon: Zap,
      color: 'text-violet-400',
      bgColor: 'bg-violet-900/30',
      borderColor: 'border-violet-600/30',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Character Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center shadow-violet-glow-lg">
                <Star className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-glow">
                {character.totalLevel}
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Character
          </h1>
          <div className={`evolution-badge text-lg ${getEvolutionBadgeStyle(character.evolutionStage)} mb-4`}>
            {character.evolutionStage.toUpperCase()}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold glow-text">{character.totalLevel}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold glow-text">{formatXP(character.totalXp)}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold glow-text">{character.activeIdentities}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Active</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`card ${stat.borderColor} border`}
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-xl border ${stat.borderColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{stat.name}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Identities Section */}
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 mb-6"
        >
          <TrendingUp className="h-6 w-6 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">Active Identities</h4>
          <div className="text-sm text-gray-400">({activeIdentities.length}/5)</div>
        </motion.div>

        {activeIdentities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="card text-center py-12"
          >
            <div className="w-16 h-16 bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to Begin Your Evolution?
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first identity and start tracking your daily progress. 
              Each completed task brings you closer to your evolved self.
            </p>
            <div className="glow-text text-sm font-medium">
              Click the + button to create your first identity
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeIdentities.map((identity, index) => (
              <IdentityCard
                key={identity.id}
                identity={identity}
                index={index}
                isCompletedToday={todayCompletions.some(
                  (completion) => completion.identityId === identity.id
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress Encouragement */}
      {activeIdentities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card bg-gradient-to-r from-violet-900/20 to-cyan-900/20 border-violet-600/30"
        >
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              Today's Progress: {completedToday}/{totalActiveTasks} Tasks Complete
            </h3>
            <div className="w-full bg-dark-surface rounded-full h-2 mb-4">
              <motion.div 
                className="bg-gradient-to-r from-cyan-400 to-violet-500 h-2 rounded-full shadow-glow"
                initial={{ width: 0 }}
                animate={{ width: `${totalActiveTasks > 0 ? (completedToday / totalActiveTasks) * 100 : 0}%` }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </div>
            <p className="text-gray-300 text-sm">
              {completedToday === totalActiveTasks && totalActiveTasks > 0
                ? "🎉 Amazing! You've completed all your tasks today!"
                : totalActiveTasks > 0
                ? `${totalActiveTasks - completedToday} more task${totalActiveTasks - completedToday !== 1 ? 's' : ''} to complete your daily evolution`
                : "Create some identities to start tracking your progress"
              }
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;

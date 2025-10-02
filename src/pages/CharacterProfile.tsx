import { User, Trophy, TrendingUp, Calendar, Award, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { useGameStore } from '@/store/gameStore';
import { formatXP } from '@/utils/gameLogic';

const CharacterProfile = () => {
  const { character, gameStats, identities, getActiveIdentities } = useGameStore();
  const activeIdentities = getActiveIdentities();

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

  // Prepare data for radial chart
  const identityData = activeIdentities.map((identity, index) => ({
    name: identity.name,
    value: identity.xp,
    level: identity.level,
    fill: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]
  }));

  const achievements = [
    {
      name: 'First Steps',
      description: 'Created your first identity',
      unlocked: identities.length >= 1,
      icon: '🎯',
      color: 'cyan',
    },
    {
      name: 'Multifaceted',
      description: 'Have 3 active identities',
      unlocked: activeIdentities.length >= 3,
      icon: '🔥',
      color: 'orange',
    },
    {
      name: 'Dedicated',
      description: 'Maintain a 7-day streak',
      unlocked: gameStats.longestStreak >= 7,
      icon: '💪',
      color: 'green',
    },
    {
      name: 'Consistent',
      description: 'Complete 50 tasks total',
      unlocked: gameStats.totalTasksCompleted >= 50,
      icon: '⭐',
      color: 'yellow',
    },
    {
      name: 'Evolution Master',
      description: 'Reach Master evolution stage',
      unlocked: character.evolutionStage === 'master' || character.evolutionStage === 'legend',
      icon: '👑',
      color: 'violet',
    },
    {
      name: 'Legendary',
      description: 'Reach Legend evolution stage',
      unlocked: character.evolutionStage === 'legend',
      icon: '🏆',
      color: 'red',
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const getAchievementStyle = (color: string, unlocked: boolean) => {
    if (!unlocked) return 'bg-gray-800/40 border-gray-600 opacity-60';
    
    const styles = {
      cyan: 'bg-cyan-900/40 border-cyan-600',
      orange: 'bg-orange-900/40 border-orange-600',
      green: 'bg-green-900/40 border-green-600',
      yellow: 'bg-yellow-900/40 border-yellow-600',
      violet: 'bg-violet-900/40 border-violet-600',
      red: 'bg-red-900/40 border-red-600',
    };
    return styles[color as keyof typeof styles] || styles.cyan;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Character Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Character Info */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center shadow-violet-glow-lg">
                  <User className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-glow">
                  {character.totalLevel}
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">Your Character</h1>
            <div className={`evolution-badge text-xl ${getEvolutionBadgeStyle(character.evolutionStage)} mb-6 inline-flex`}>
              {character.evolutionStage.toUpperCase()}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold glow-text">{character.totalLevel}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Level</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold glow-text">{formatXP(character.totalXp)}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total XP</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold glow-text">{character.activeIdentities}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Active</p>
              </div>
            </div>
          </div>

          {/* XP Distribution Chart */}
          <div className="flex items-center justify-center">
            {identityData.length > 0 ? (
              <div className="relative w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={identityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      {identityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{formatXP(character.totalXp)}</p>
                    <p className="text-xs text-gray-400">Total XP</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-dark-surface/50 rounded-full border border-dark-border">
                <div className="text-center">
                  <Target className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No active identities</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Statistics</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-cyan-900/30 p-4 rounded-xl border border-cyan-600/30 mb-3">
              <Calendar className="h-8 w-8 text-cyan-400 mx-auto" />
            </div>
            <p className="text-2xl font-bold text-white">{gameStats.totalDaysActive}</p>
            <p className="text-sm text-gray-400 uppercase tracking-wide">Days Active</p>
          </div>
          <div className="text-center">
            <div className="bg-green-900/30 p-4 rounded-xl border border-green-600/30 mb-3">
              <Trophy className="h-8 w-8 text-green-400 mx-auto" />
            </div>
            <p className="text-2xl font-bold text-white">{gameStats.totalTasksCompleted}</p>
            <p className="text-sm text-gray-400 uppercase tracking-wide">Tasks Done</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-900/30 p-4 rounded-xl border border-orange-600/30 mb-3">
              <span className="text-3xl block">🔥</span>
            </div>
            <p className="text-2xl font-bold text-white">{gameStats.currentStreak}</p>
            <p className="text-sm text-gray-400 uppercase tracking-wide">Current Streak</p>
          </div>
          <div className="text-center">
            <div className="bg-violet-900/30 p-4 rounded-xl border border-violet-600/30 mb-3">
              <span className="text-3xl block">🏅</span>
            </div>
            <p className="text-2xl font-bold text-white">{gameStats.longestStreak}</p>
            <p className="text-sm text-gray-400 uppercase tracking-wide">Best Streak</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center gap-3 mb-6">
          <Award className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">
            Achievements ({unlockedAchievements.length}/{achievements.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-4 rounded-xl border ${getAchievementStyle(achievement.color, achievement.unlocked)} ${
                achievement.unlocked ? 'shadow-glow' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">{achievement.name}</h4>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <div className="text-cyan-400">
                    <Trophy className="h-5 w-5" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Active Identities Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center gap-3 mb-6">
          <Zap className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Identity Breakdown</h2>
        </div>
        
        {activeIdentities.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              No active identities. Create and activate identities to see detailed stats here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeIdentities.map((identity, index) => (
              <motion.div
                key={identity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-dark-surface/50 rounded-xl border border-dark-border"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: identityData[index]?.fill || '#06b6d4' }}
                  />
                  <div>
                    <h3 className="font-bold text-white">{identity.name}</h3>
                    <p className="text-sm text-gray-400">
                      Level {identity.level} • {identity.evolutionStage}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-cyan-300">{formatXP(identity.xp)} XP</p>
                  <p className="text-xs text-gray-500">
                    {formatXP(identity.xpToNextLevel)} to level {identity.level + 1}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CharacterProfile;

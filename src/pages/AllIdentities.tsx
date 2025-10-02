import { motion } from 'framer-motion';
import { List, ToggleLeft, ToggleRight, Star, Pause, Play } from 'lucide-react';
import { useIdentityStore } from '@/store/identityStore';
import { toast } from '@/store/toastStore';
import { formatXP } from '@/utils/gameLogic';
import { MAX_ACTIVE_IDENTITIES } from '@/utils/leveling';

const AllIdentities = () => {
  const { identities, activateIdentity, deactivateIdentity, getActiveIdentities } = useIdentityStore();
  const activeIdentities = getActiveIdentities();
  const maxActiveIdentities = MAX_ACTIVE_IDENTITIES;

  const getButtonStyles = (isActive: boolean, canActivateIdentity: boolean) => {
    if (isActive) {
      return 'bg-cyan-900/40 text-cyan-300 shadow-glow hover:bg-cyan-800/50';
    } else if (canActivateIdentity) {
      return 'bg-gray-800/40 text-gray-400 hover:bg-gray-700/50 border border-gray-600';
    } else {
      return 'bg-gray-800/20 text-gray-600 cursor-not-allowed opacity-50';
    }
  };

  const getButtonTitle = (isActive: boolean, canActivateIdentity: boolean) => {
    if (isActive) {
      return 'Deactivate identity';
    } else if (canActivateIdentity) {
      return 'Activate identity';
    } else {
      return 'Maximum active identities reached';
    }
  };

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

  const handleToggle = async (identityId: string, currentlyActive: boolean) => {
    if (currentlyActive) {
      const result = await deactivateIdentity(identityId);
      if (result.success) {
        toast.info(result.message);
      } else {
        toast.error(result.message);
      }
    } else {
      // Prevent activation if already at max
      if (activeIdentities.length >= maxActiveIdentities) {
        toast.error(`Maximum ${maxActiveIdentities} active identities allowed`);
        return;
      }
      
      const result = await activateIdentity(identityId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  const canActivate = (isCurrentlyActive: boolean) => {
    return isCurrentlyActive || activeIdentities.length < maxActiveIdentities;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <List className="h-6 w-6 text-cyan-400" />
        <h1 className="text-3xl font-bold text-white">All Identities</h1>
        <div className="text-sm text-gray-400">
          ({activeIdentities.length} / {maxActiveIdentities} active)
        </div>
      </motion.div>

      {/* Active Limit Warning */}
      {activeIdentities.length >= maxActiveIdentities && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-yellow-900/20 border-yellow-600/30"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-900/30 rounded-xl">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-300">Maximum Active Identities Reached</h3>
              <p className="text-yellow-400/80 text-sm">
                You have {maxActiveIdentities} active identities. Deactivate one to activate another.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Identities List */}
      {identities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-12"
        >
          <div className="w-16 h-16 bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <List className="h-8 w-8 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Identities Yet</h3>
          <p className="text-gray-400">
            Create your first identity to start your evolution journey
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {identities.map((identity, index) => (
            <motion.div
              key={identity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className={`card ${
                identity.isActive 
                  ? 'border-cyan-600/50 bg-cyan-900/10' 
                  : 'border-dark-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{identity.name}</h3>
                    <span className={`evolution-badge ${getEvolutionBadgeStyle(identity.evolutionStage)}`}>
                      {identity.evolutionStage}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      identity.isActive
                        ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-600'
                        : 'bg-gray-800/40 text-gray-400 border border-gray-600'
                    }`}>
                      {identity.isActive ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                    {identity.description}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-cyan-400" />
                      <span className="text-gray-300">Level {identity.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">{formatXP(identity.xp)} XP</span>
                    </div>
                    <div className="text-gray-500">
                      Created {new Date(identity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-dark-surface/50 rounded-xl">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-cyan-300">Daily Task:</span> {identity.dailyTask}
                    </p>
                  </div>
                </div>

                <div className="ml-6 flex flex-col items-end gap-3">
                  {/* Toggle Button */}
                  <motion.button
                    onClick={() => handleToggle(identity.id, identity.isActive)}
                    disabled={!canActivate(identity.isActive)}
                    whileHover={canActivate(identity.isActive) ? { scale: 1.05 } : {}}
                    whileTap={canActivate(identity.isActive) ? { scale: 0.95 } : {}}
                    className={`p-3 rounded-xl transition-all duration-200 ${getButtonStyles(identity.isActive, canActivate(identity.isActive))}`}
                    title={getButtonTitle(identity.isActive, canActivate(identity.isActive))}
                  >
                    {identity.isActive ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </motion.button>

                  {/* Toggle Switch Visual */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {identity.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {identity.isActive ? (
                      <ToggleRight className="h-6 w-6 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AllIdentities;

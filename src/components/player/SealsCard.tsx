import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronDown, Eye, Shield, Flame, Heart, Info } from 'lucide-react';
import { SEALS, type UserSealLog } from '@/constants/seals';
import { SEALS_CONTENT, getSubPillarContent, type SubPillarContent } from '@/constants/sealsContent';
import SubPillarInfoModal from '@/components/modals/SubPillarInfoModal';
import { useGameStore } from '@/store/gameStore';
import { shallow } from 'zustand/shallow';

interface SealsCardProps {
  todayLog?: UserSealLog;
}

// Icon mapping
const ICON_MAP = {
  Eye,
  Shield,
  Flame,
  Heart,
} as const;

const SealsCard = ({ todayLog }: SealsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSubPillar, setSelectedSubPillar] = useState<SubPillarContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get setActiveSealIds and sealStats from store
  const { setActiveSealIds, sealStats } = useGameStore(
    (state) => ({
      setActiveSealIds: state.setActiveSealIds,
      sealStats: state.sealStats,
    }),
    shallow
  );

  // Track active subpillar IDs (these are what actually get toggled)
  const activeSubPillarIds = useMemo(() => {
    return todayLog?.activeSealIds || [];
  }, [todayLog]);

  // Get subpillar level from sealStats
  const getSubPillarLevel = useCallback((sealId: string, subPillarId: string): number => {
    const sealStat = sealStats.find(s => s.seal_id === sealId);
    if (!sealStat) return 1;
    const subPillarStat = sealStat.subpillar_stats.find(sp => sp.subpillar_id === subPillarId);
    return subPillarStat?.current_level || 1;
  }, [sealStats]);

  // Get main seal level (average of subpillars)
  const getSealLevel = useCallback((sealId: string): number => {
    const sealStat = sealStats.find(s => s.seal_id === sealId);
    return sealStat?.current_level || 1;
  }, [sealStats]);

  // Check if a subpillar is active
  const isSubPillarActive = useCallback((subPillarId: string) => {
    return activeSubPillarIds.includes(subPillarId);
  }, [activeSubPillarIds]);

  // Check if a seal (parent) is active - true if any of its subpillars are active
  const isSealActive = useCallback((sealId: string) => {
    const seal = SEALS.find(s => s.id === sealId);
    if (!seal) return false;
    return seal.subPillars.some(sp => activeSubPillarIds.includes(sp.id));
  }, [activeSubPillarIds]);

  // Count active subpillars for display
  const activeCount = useMemo(() => {
    return activeSubPillarIds.length;
  }, [activeSubPillarIds]);

  // Toggle subpillar active state
  const handleSubPillarToggle = useCallback((subPillarId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newActiveIds = activeSubPillarIds.includes(subPillarId)
      ? activeSubPillarIds.filter(id => id !== subPillarId)
      : [...activeSubPillarIds, subPillarId];
    
    setActiveSealIds(newActiveIds);
  }, [activeSubPillarIds, setActiveSealIds]);

  const handleInfoClick = useCallback((subPillarId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const content = getSubPillarContent(subPillarId);
    if (content) {
      setSelectedSubPillar(content);
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedSubPillar(null), 300);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex justify-center"
    >
      <div className="relative max-w-2xl w-full">
        {/* Main Card */}
        <div
          className="relative bg-slate-900/90 backdrop-blur-md border border-purple-500/50 rounded-2xl cursor-pointer shadow-[0_0_12px_rgba(76,29,149,0.4)] hover:border-purple-500/70 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Collapsed State - Header */}
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Left Icon - Lock */}
            <div className="flex-shrink-0">
              <Lock className="h-6 w-6 text-slate-400" />
            </div>

            {/* Center Area - The 4 Seal Icons */}
            <div className="flex items-center gap-6 mx-8">
              {SEALS.map((seal) => {
                const Icon = ICON_MAP[seal.icon];
                const isActive = isSealActive(seal.id);

                return (
                  <motion.div
                    key={seal.id}
                    animate={
                      isActive
                        ? {
                            filter: [
                              'drop-shadow(0 0 6px rgba(147, 51, 234, 1)) drop-shadow(0 0 12px rgba(147, 51, 234, 0.6))',
                              'drop-shadow(0 0 10px rgba(147, 51, 234, 0.8)) drop-shadow(0 0 20px rgba(147, 51, 234, 0.4))',
                              'drop-shadow(0 0 6px rgba(147, 51, 234, 1)) drop-shadow(0 0 12px rgba(147, 51, 234, 0.6))',
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <Icon
                      className={`h-7 w-7 transition-colors ${
                        isActive ? 'text-purple-500' : 'text-slate-500'
                      }`}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Right Icon - Chevron */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </motion.div>
          </div>

          {/* Expanded State - Seal Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pt-2 border-t border-slate-700/50">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-300 mb-4 text-center tracking-wider">
                    SEALS
                  </h3>

                  {/* Seals Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SEALS.map((seal, index) => {
                      const Icon = ICON_MAP[seal.icon];
                      const isActive = isSealActive(seal.id);
                      const sealContent = SEALS_CONTENT.find(s => s.id === seal.id);

                      return (
                        <motion.div
                          key={seal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={`p-4 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-violet-950/20 border-violet-700/50 shadow-[0_0_10px_rgba(76,29,149,0.2)]'
                              : 'bg-slate-800/30 border-slate-700/30'
                          }`}
                        >
                          {/* Seal Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Icon
                                className={`h-5 w-5 ${
                                  isActive ? 'text-purple-600' : 'text-slate-500'
                                }`}
                              />
                              <h4
                                className={`font-bold text-sm tracking-wide ${
                                  isActive ? 'text-purple-500' : 'text-slate-400'
                                }`}
                              >
                                {seal.name}
                              </h4>
                            </div>
                            {/* Seal Level Badge */}
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              isActive 
                                ? 'bg-purple-500/20 text-purple-300' 
                                : 'bg-slate-700/50 text-slate-500'
                            }`}>
                              Lv.{getSealLevel(seal.id)}
                            </span>
                          </div>

                          {/* Sub-pillars - Structured Layout */}
                          <div className="space-y-3">
                            {seal.subPillars.map((subPillar) => {
                              const content = sealContent?.subPillars.find(sp => sp.id === subPillar.id);
                              const isSubActive = isSubPillarActive(subPillar.id);
                              const subPillarLevel = getSubPillarLevel(seal.id, subPillar.id);
                              
                              return (
                                <div
                                  key={subPillar.id}
                                  className={`rounded-lg p-3 transition-all ${
                                    isSubActive 
                                      ? 'bg-violet-900/20 border border-violet-700/30' 
                                      : 'bg-slate-800/20 border border-slate-700/20'
                                  }`}
                                >
                                  {/* Header Row: Toggle + Title + Level + Info Button */}
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      {/* Toggle Switch */}
                                      <button
                                        onClick={(e) => handleSubPillarToggle(subPillar.id, e)}
                                        className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${
                                          isSubActive 
                                            ? 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.5)]' 
                                            : 'bg-slate-700'
                                        }`}
                                        aria-label={`Toggle ${subPillar.name}`}
                                      >
                                        <motion.div
                                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md"
                                          animate={{ left: isSubActive ? '22px' : '2px' }}
                                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                      </button>
                                      <h5 className={`font-semibold text-sm ${
                                        isSubActive ? 'text-purple-300' : 'text-slate-400'
                                      }`}>
                                        {subPillar.name}
                                      </h5>
                                      {/* SubPillar Level Badge */}
                                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                        isSubActive 
                                          ? 'bg-violet-500/20 text-violet-300' 
                                          : 'bg-slate-700/30 text-slate-500'
                                      }`}>
                                        Lv.{subPillarLevel}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => handleInfoClick(subPillar.id, e)}
                                      className={`p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0 ${
                                        isSubActive ? 'text-purple-400 hover:text-purple-300' : 'text-slate-500 hover:text-slate-400'
                                      }`}
                                      aria-label={`Info about ${subPillar.name}`}
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  {/* Short Description */}
                                  {content && (
                                    <p className={`text-xs leading-relaxed ${
                                      isSubActive ? 'text-slate-400' : 'text-slate-500'
                                    }`}>
                                      {content.shortDescription}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Footer Note */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-slate-500 italic">
                      {activeCount > 0
                        ? `${activeCount} subpillar${
                            activeCount > 1 ? 's' : ''
                          } active today`
                        : 'No subpillars active today'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sub-Pillar Info Modal */}
      <SubPillarInfoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        subPillar={selectedSubPillar}
      />
    </motion.div>
  );
};

export default SealsCard;

import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { STAT_RANKING_DATA, StatType, StatRank } from '@/constants/statRanks';
import { getRankStyle } from '@/utils/rankStyles';
import { logger } from '@/utils/logger';

interface InitialStatRankingModalProps {
  isOpen: boolean;
  onSubmit: (rankings: Record<StatType, number>) => void;
}

const STAT_ORDER: StatType[] = ['body', 'mind', 'soul', 'will'];

export const InitialStatRankingModal = memo(({ isOpen, onSubmit }: InitialStatRankingModalProps) => {
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [selectedRanks, setSelectedRanks] = useState<Record<StatType, StatRank | null>>({
    body: null,
    mind: null,
    soul: null,
    will: null,
  });

  const currentStatType = STAT_ORDER[currentStatIndex];
  const currentStatData = STAT_RANKING_DATA[currentStatType];
  const isLastStat = currentStatIndex === STAT_ORDER.length - 1;
  const canProceed = selectedRanks[currentStatType] !== null;

  const handleRankSelect = useCallback((rank: StatRank) => {
    setSelectedRanks(prev => ({
      ...prev,
      [currentStatType]: rank,
    }));
    logger.info('Rank selected', { stat: currentStatType, rank });
  }, [currentStatType]);

  const handleNext = useCallback(() => {
    if (canProceed && currentStatIndex < STAT_ORDER.length - 1) {
      setCurrentStatIndex(prev => prev + 1);
    }
  }, [canProceed, currentStatIndex]);

  const handlePrevious = useCallback(() => {
    if (currentStatIndex > 0) {
      setCurrentStatIndex(prev => prev - 1);
    }
  }, [currentStatIndex]);

  const handleSubmit = useCallback(() => {
    // Convert selected ranks to point values
    const pointValues: Record<StatType, number> = {
      body: 0,
      mind: 0,
      soul: 0,
      will: 0,
    };

    STAT_ORDER.forEach(stat => {
      const rank = selectedRanks[stat];
      if (rank) {
        const rankData = STAT_RANKING_DATA[stat].ranks.find(r => r.rank === rank);
        if (rankData) {
          pointValues[stat] = rankData.pointValue;
        }
      }
    });

    logger.info('Initial stat rankings submitted', { selectedRanks, pointValues });
    onSubmit(pointValues);
  }, [selectedRanks, onSubmit]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-purple-500/30">
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Rate Your Current Level
            </h2>
            <p className="text-sm text-slate-400 text-center">
              Step {currentStatIndex + 1} of {STAT_ORDER.length}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStatType}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stat Title */}
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {currentStatData.title}
                  </h3>
                  <p className="text-sm text-cyan-400 italic">
                    {currentStatData.attribute}
                  </p>
                </div>

                {/* Rank Options */}
                <div className="space-y-3">
                  {currentStatData.ranks.map((rankDef) => {
                    const isSelected = selectedRanks[currentStatType] === rankDef.rank;
                    const rankStyle = getRankStyle(rankDef.rank);

                    return (
                      <motion.button
                        key={rankDef.rank}
                        onClick={() => handleRankSelect(rankDef.rank)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-current bg-slate-800/50'
                            : 'border-slate-600 bg-slate-900/30 hover:border-slate-500'
                        }`}
                        style={{
                          borderColor: isSelected ? rankStyle.color : undefined,
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Rank Badge */}
                          <div
                            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl"
                            style={{
                              color: isSelected ? rankStyle.color : '#94a3b8',
                              textShadow: isSelected ? rankStyle.textShadow : 'none',
                              backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.8)' : 'rgba(51, 65, 85, 0.5)',
                            }}
                          >
                            {rankDef.rank}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white mb-1">
                              {rankDef.title}
                            </h4>
                            <p className="text-sm text-gray-300 mb-2 leading-relaxed">
                              {rankDef.description}
                            </p>
                            <p className="text-xs text-cyan-400 italic">
                              Reality: {rankDef.reality}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t border-purple-500/30 flex justify-between items-center bg-slate-900/50">
            <button
              onClick={handlePrevious}
              disabled={currentStatIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex gap-2">
              {STAT_ORDER.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStatIndex
                      ? 'bg-cyan-400'
                      : index < currentStatIndex
                      ? 'bg-cyan-600'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {isLastStat ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:from-violet-500 hover:to-cyan-500 transition-all"
              >
                Submit
                <Check className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-500 transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

InitialStatRankingModal.displayName = 'InitialStatRankingModal';

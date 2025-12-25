import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowBigUp, Shirt, Star } from 'lucide-react';
import { GiSwordSmithing } from 'react-icons/gi';
import { BaseModal } from '@/components/common';

interface TrialTask {
  id: string;
  title: string;
  description: string;
}

interface TrialModalProps {
  isOpen: boolean;
  pathName: string;
  trialName: string;
  level: number;
  description: string;
  tasks: TrialTask[];
  rewards: {
    coins: number;
    stars?: number;
    stat?: string;
    statPoints?: number;
    item?: string;
  };
  onClose: () => void;
  onComplete: () => void;
}

// Shared card styles for uniform sizing (matching RewardBar)
const REWARD_CARD_CLASSES = 'flex items-center justify-center gap-2 px-4 py-2 h-10 min-w-[70px] rounded-lg backdrop-blur-md';

export const TrialModal = memo(({
  isOpen,
  pathName,
  trialName,
  level,
  description,
  tasks,
  rewards,
  onClose,
  onComplete,
}: TrialModalProps) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleTaskToggle = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);

    // If all tasks completed, trigger completion after brief delay
    if (newCompleted.size === tasks.length) {
      setTimeout(() => {
        onComplete();
        setCompletedTasks(new Set()); // Reset for next time
      }, 300);
    }
  };

  const allTasksComplete = completedTasks.size === tasks.length;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={true}
      title={trialName}
      className=""
      overlayClassName="bg-black/90"
      borderColor="rgba(245, 158, 11, 0.7)"
      glowColor="rgba(217, 119, 6, 0.5)"
    >
      <div className="px-6 pb-6">
        {/* Subtitle */}
        <p className="text-sm text-amber-400/80 font-medium mb-4 mt-4">
          {pathName} • Level {level} Trial
        </p>

        {/* Description */}
        <div className="mb-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg">
          <p className="text-sm text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tasks Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-amber-400 mb-3 uppercase tracking-wider">
            Trial Tasks
          </h3>
          <div className="space-y-2">
            {tasks.map((task) => {
              const isCompleted = completedTasks.has(task.id);
              return (
                <motion.div
                  key={task.id}
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted 
                      ? 'rgba(217, 119, 6, 0.1)' 
                      : 'rgba(0, 0, 0, 0)',
                  }}
                  className="p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800/30 transition-all cursor-pointer"
                  onClick={() => handleTaskToggle(task.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded bg-amber-500/30 border border-amber-400 flex items-center justify-center"
                          style={{ 
                            boxShadow: '0 0 8px rgba(251, 191, 36, 0.4)' 
                          }}
                        >
                          <span className="text-amber-300 text-sm font-bold">✓</span>
                        </motion.div>
                      ) : (
                        <div className="w-5 h-5 rounded border-2 border-slate-600" />
                      )}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1">
                      <p 
                        className={`text-sm font-medium mb-1 transition-all ${
                          isCompleted 
                            ? 'text-slate-400 line-through' 
                            : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Rewards Section - Matching PathCard RewardBar format exactly */}
        <div className="p-4 bg-slate-800/40 border border-amber-500/20 rounded-lg">
          <h3 className="text-sm font-bold text-amber-400 mb-3 uppercase tracking-wider">
            Rewards
          </h3>
          {/* Row 1: Coins, Body Stat, Stars - flex-nowrap for responsive fit */}
          <div className="flex flex-row flex-nowrap items-center gap-2 mb-3">
            {/* Coins - Matching RewardBar format */}
            <div 
              className={REWARD_CARD_CLASSES}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                boxShadow: '0 0 8px rgba(251, 191, 36, 0.15)',
              }}
            >
              <span className="text-lg drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]">🪙</span>
              <span className="text-base font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                {rewards.coins}
              </span>
            </div>

            {/* Body Stat - Icon + Arrow only (no text), matching RewardBar */}
            {rewards.stat && rewards.statPoints && rewards.statPoints > 0 && (
              <div 
                className={REWARD_CARD_CLASSES}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(225, 29, 72, 0.2)',
                  boxShadow: '0 0 8px rgba(225, 29, 72, 0.15)',
                }}
                title={`${rewards.statPoints} ${rewards.stat} points`}
              >
                <GiSwordSmithing 
                  className="w-5 h-5 text-rose-400"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(225, 29, 72, 0.6))' }}
                />
                <ArrowBigUp 
                  className="w-5 h-5 -ml-1 text-rose-400"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(225, 29, 72, 0.6))' }}
                />
              </div>
            )}

            {/* Stars - Cyan icon only (no + sign) */}
            {rewards.stars && rewards.stars > 0 && (
              <div 
                className={REWARD_CARD_CLASSES}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  boxShadow: '0 0 8px rgba(56, 189, 248, 0.15)',
                }}
              >
                <Star 
                  className="w-5 h-5 text-cyan-400"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.8))' }}
                  strokeWidth={2.5}
                  fill="currentColor"
                />
                <span className="text-base font-bold bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
                  {rewards.stars}
                </span>
              </div>
            )}
          </div>
          
          {/* Row 2: Item (always on its own row) */}
          {rewards.item && (
            <div className="flex flex-wrap items-center gap-3">
              <div 
                className={REWARD_CARD_CLASSES}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 0 8px rgba(148, 163, 184, 0.15)',
                }}
              >
                <Shirt 
                  className="w-5 h-5 text-slate-300 flex-shrink-0"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(148, 163, 184, 0.6))' }}
                />
                <span className="text-base font-semibold text-slate-300">
                  {rewards.item}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {!allTasksComplete && (
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Complete all tasks to finish the trial ({completedTasks.size}/{tasks.length})
            </p>
          </div>
        )}
      </div>
    </BaseModal>
  );
});

TrialModal.displayName = 'TrialModal';

export default TrialModal;

import { useState, memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { QuestCard, QuestStatus, type Quest } from './QuestCard';
import { useQuestStore } from '../../store/questStore';
import { logger } from '@/utils/logger';

interface QuestListProps {
  onQuestAdd?: () => void;
}

export const QuestList = memo(({ onQuestAdd }: QuestListProps) => {
  const [activeTab, setActiveTab] = useState<QuestStatus>('today');
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [completedSubtasks, setCompletedSubtasks] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load quests from store
  const { quests, isLoading, loadQuests, updateQuest, completeQuest } = useQuestStore(
    (state: any) => ({
      quests: state.quests,
      isLoading: state.isLoading,
      loadQuests: state.loadQuests,
      updateQuest: state.updateQuest,
      completeQuest: state.completeQuest,
    })
  );

  // Initialize quests on mount
  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  // Dynamic title based on active tab
  const getTitle = useCallback(() => {
    switch (activeTab) {
      case 'today':
        return "Today's Quests";
      case 'backlog':
        return 'Backlog Quests';
      case 'completed':
        return 'Completed Quests';
      default:
        return "Today's Quests";
    }
  }, [activeTab]);

  // Get today's date in the same format as quest dates
  const getTodayFormatted = useCallback(() => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[today.getMonth()]} ${today.getDate()}`;
  }, []);

  // Filter quests by active tab with proper logic
  const filteredQuests = quests.filter((quest: Quest) => {
    const isQuestCompleted = completedQuests.has(quest.id) || quest.status === 'completed';
    const todayFormatted = getTodayFormatted();
    const isToday = quest.date === todayFormatted;

    if (activeTab === 'completed') {
      // All completed quests, ordered by completion date
      return isQuestCompleted;
    }
    if (activeTab === 'today') {
      // All quests with today's date (including completed ones)
      return isToday;
    }
    if (activeTab === 'backlog') {
      // All quests that are NOT today's date AND not completed
      return !isToday && !isQuestCompleted;
    }
    return false;
  });

  // Sort quests: completed quests at the bottom for today tab, by completion date for completed tab
  const sortedQuests = activeTab === 'completed'
    ? [...filteredQuests].sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      })
    : activeTab === 'today'
    ? [...filteredQuests].sort((a, b) => {
        const aCompleted = completedQuests.has(a.id) || a.status === 'completed';
        const bCompleted = completedQuests.has(b.id) || b.status === 'completed';
        // Sort completed quests to the bottom
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
        return 0;
      })
    : filteredQuests;

  const handleQuestComplete = useCallback(async (questId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const prevCompletedQuests = new Set(completedQuests);
    const prevCompletedSubtasks = new Set(completedSubtasks);
    const newCompletedQuests = new Set(completedQuests);
    const newCompletedSubtasks = new Set(completedSubtasks);
    
    const quest = quests.find((q: Quest) => q.id === questId);
    
    if (newCompletedQuests.has(questId)) {
      // Uncomplete parent and all subtasks
      newCompletedQuests.delete(questId);
      if (quest?.subtasks) {
        quest.subtasks.forEach((subtask: any) => {
          newCompletedSubtasks.delete(subtask.id);
        });
      }
    } else {
      // Complete parent and all subtasks
      newCompletedQuests.add(questId);
      if (quest?.subtasks) {
        quest.subtasks.forEach((subtask: any) => {
          newCompletedSubtasks.add(subtask.id);
        });
      }
    }
    
    // Optimistic update
    setCompletedQuests(newCompletedQuests);
    setCompletedSubtasks(newCompletedSubtasks);
    
    try {
      await completeQuest(questId);
    } catch (error) {
      // Rollback on error
      setCompletedQuests(prevCompletedQuests);
      setCompletedSubtasks(prevCompletedSubtasks);
      logger.error('Failed to update quest', { error });
    }
  }, [completedQuests, completedSubtasks, quests, completeQuest]);

  const handleSubtaskComplete = useCallback(async (questId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const quest = quests.find((q: Quest) => q.id === questId);
    if (!quest?.subtasks) return;
    
    const prevCompletedSubtasks = new Set(completedSubtasks);
    const prevCompletedQuests = new Set(completedQuests);
    const newCompletedSubtasks = new Set(completedSubtasks);
    const newCompletedQuests = new Set(completedQuests);
    
    const wasQuestCompleted = completedQuests.has(questId) || quest.status === 'completed';
    
    if (newCompletedSubtasks.has(subtaskId)) {
      // Uncomplete subtask and parent
      newCompletedSubtasks.delete(subtaskId);
      newCompletedQuests.delete(questId);
    } else {
      // Complete subtask
      newCompletedSubtasks.add(subtaskId);
      
      // Check if all subtasks are now completed
      const allSubtasksCompleted = quest.subtasks.every((st: any) => 
        st.id === subtaskId || newCompletedSubtasks.has(st.id)
      );
      
      // If all subtasks completed, complete parent
      if (allSubtasksCompleted) {
        newCompletedQuests.add(questId);
      }
    }
    
    // Optimistic update
    setCompletedSubtasks(newCompletedSubtasks);
    setCompletedQuests(newCompletedQuests);
    
    // If quest completion state changed (became completed or uncompleted), update in store
    const isQuestCompletedNow = newCompletedQuests.has(questId);
    if (wasQuestCompleted !== isQuestCompletedNow) {
      try {
        await completeQuest(questId);
      } catch (error) {
        // Rollback on error
        setCompletedSubtasks(prevCompletedSubtasks);
        setCompletedQuests(prevCompletedQuests);
        logger.error('Failed to update quest', { error });
      }
    }
  }, [completedSubtasks, completedQuests, quests, completeQuest]);

  const handleDateChange = useCallback(async (questId: string, newDate: string) => {
    try {
      await updateQuest(questId, { date: newDate });
      logger.debug('Quest date updated', { questId, newDate });
    } catch (error) {
      logger.error('Failed to update quest date', { error });
    }
  }, [updateQuest]);

  const handleTimeChange = useCallback(async (questId: string, newTime: string) => {
    try {
      await updateQuest(questId, { hour: newTime });
      logger.debug('Quest time updated', { questId, newTime });
    } catch (error) {
      logger.error('Failed to update quest time', { error });
    }
  }, [updateQuest]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-slate-900/80 backdrop-blur-md border-2 border-purple-500/50 shadow-[0_0_12px_rgba(76,29,149,0.4)] rounded-2xl p-5 transition-all"
    >
      {/* Header with Title and Add Button */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <h3 
          className="text-2xl font-bold text-white font-section tracking-wide"
          style={{ textShadow: '0 0 10px rgba(192, 132, 252, 0.4)' }}
        >
          {getTitle()}
        </h3>
        
        {/* Add Button */}
        <motion.button
          onClick={onQuestAdd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/20 border border-purple-400/50 text-purple-400 flex items-center justify-center hover:bg-purple-600/30 hover:border-purple-400 transition-all shadow-[0_0_8px_rgba(168,85,247,0.3)]"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Subtitle */}
      <div className="mb-4 relative z-10">
        <p className="text-sm text-purple-300/70">
          Track your one-time objectives
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 relative z-10">
        {(['today', 'backlog', 'completed'] as QuestStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (tab !== activeTab) {
                setIsTransitioning(true);
                setTimeout(() => {
                  setActiveTab(tab);
                  setIsTransitioning(false);
                }, 150);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-purple-600/30 border border-purple-400/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                : 'bg-slate-800/50 border border-slate-600/50 text-slate-400 hover:text-slate-300 hover:border-slate-500/50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Quest List */}
      <div className="space-y-3">
        {isLoading || isTransitioning ? (
          <div className="text-center py-8 text-slate-500">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full mx-auto mb-4"
            />
            {isTransitioning ? 'Switching view...' : 'Loading quests...'}
          </div>
        ) : (
          <AnimatePresence>
            {sortedQuests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-slate-500"
              >
                No quests in {activeTab}
              </motion.div>
            ) : (
              sortedQuests.map((quest: Quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  isCompleted={completedQuests.has(quest.id) || quest.status === 'completed'}
                  completedSubtasks={completedSubtasks}
                  onComplete={handleQuestComplete}
                  onSubtaskComplete={handleSubtaskComplete}
                  onDateChange={handleDateChange}
                  onTimeChange={handleTimeChange}
                />
              ))
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
});

QuestList.displayName = 'QuestList';

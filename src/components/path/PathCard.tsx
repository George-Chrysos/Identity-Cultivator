import { useState, memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/toastStore';
import { useGameStore } from '@/store/gameStore';
import { getPathTaskRewards, isPathRegistered } from '@/constants/pathRegistry';
// Import temperingPath to ensure it registers with the path registry before we use it
import '@/constants/temperingPath';
import { logger } from '@/utils/logger';
import { ChronosManager } from '@/logic/ChronosManager';
import TrialModal from '../modals/TrialModal';
import LevelUpNotification from '../notifications/LevelUpNotification';
import SubtaskInfoModal from '../modals/SubtaskInfoModal';
import TaskCard from './TaskCard';
import RewardBar from './RewardBar';
import { StreakCounter } from '../streak';
import { MilestoneCelebration } from '../streak/MilestoneCelebration';
import { 
  getMilestoneForLevel, 
  isSubMilestoneDay, 
  SUB_MILESTONE_REWARDS,
  awardMilestoneRewards 
} from '@/services/StreakManager';

interface Subtask {
  id: string;
  name: string;
  description?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  rewards: {
    xp: number;
    stat: string;
    points: number;
    coins: number;
  };
  subtasks?: Subtask[];
  // Path integration for dynamic reward lookup
  path_id?: string;
  path_level?: number;
}

interface TrialInfo {
  name: string;
  description: string;
  tasks: string;
  rewards: {
    coins: number;
    stars: number;
    bodyPoints: number;
    item: string;
  };
}

interface PathCardProps {
  title: string;
  subtitle?: string;
  status: 'pending' | 'completed';
  currentXP: number;
  maxXP: number;
  streak: number;
  level: number;
  tasks: Task[];
  trialInfo?: TrialInfo;
  isStatCapped?: boolean;
  identityId?: string; // For persisting task state across navigation
  onTaskComplete?: (taskId: string) => Promise<{ didGainBody?: boolean } | void>;
  onAllTasksComplete?: (newStreak: number) => Promise<void>;
  onTrialStart?: () => void;
  onLevelUp?: (newLevel: number) => { title: string; subtitle: string; tasks: Task[]; trialInfo?: TrialInfo; maxXP: number } | null;
}



export const PathCard = memo(({ 
  title: initialTitle, 
  subtitle: initialSubtitle,
  status: initialStatus, 
  currentXP: initialXP, 
  maxXP: initialMaxXP, 
  streak: initialStreak,
  level,
  tasks: initialTasks,
  trialInfo: initialTrialInfo,
  isStatCapped = false,
  identityId,
  onTaskComplete,
  onAllTasksComplete,
  onTrialStart,
  onLevelUp,
}: PathCardProps) => {
  // Use store for persisted task state if identityId provided, otherwise fallback to local state
  const storeCompletedTasks = useGameStore((s) => identityId ? s.getCompletedTasks(identityId) : new Set<string>());
  const storeCompletedSubtasks = useGameStore((s) => identityId ? s.getCompletedSubtasks(identityId) : new Set<string>());
  const setStoreCompletedTask = useGameStore((s) => s.setCompletedTask);
  const setStoreCompletedSubtask = useGameStore ((s) => s.setCompletedSubtask);
  
  // Local state as fallback when no identityId
  const [localCompletedTasks, setLocalCompletedTasks] = useState<Set<string>>(new Set());
  const [localCompletedSubtasks, setLocalCompletedSubtasks] = useState<Set<string>>(new Set());
  
  // Track processing tasks to prevent spam clicks
  const [processingTasks, setProcessingTasks] = useState<Set<string>>(new Set());
  
  // Use store state if identityId provided, otherwise use local state
  const completedTasks = identityId ? storeCompletedTasks : localCompletedTasks;
  const completedSubtasks = identityId ? storeCompletedSubtasks : localCompletedSubtasks;
  
  // Wrapper functions to set task state (store or local)
  const setCompletedTasks = useCallback((updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    if (identityId) {
      const newSet = typeof updater === 'function' ? updater(storeCompletedTasks) : updater;
      // Clear and re-add all tasks
      const currentTasks = Array.from(storeCompletedTasks);
      const newTasks = Array.from(newSet);
      // Remove tasks that are no longer in the set
      currentTasks.forEach(taskId => {
        if (!newTasks.includes(taskId)) {
          setStoreCompletedTask(identityId, taskId, false);
        }
      });
      // Add new tasks
      newTasks.forEach(taskId => {
        if (!currentTasks.includes(taskId)) {
          setStoreCompletedTask(identityId, taskId, true);
        }
      });
    } else {
      setLocalCompletedTasks(updater);
    }
  }, [identityId, storeCompletedTasks, setStoreCompletedTask]);
  
  const setCompletedSubtasks = useCallback((updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    if (identityId) {
      const newSet = typeof updater === 'function' ? updater(storeCompletedSubtasks) : updater;
      // Clear and re-add all subtasks
      const currentSubtasks = Array.from(storeCompletedSubtasks);
      const newSubtasks = Array.from(newSet);
      // Remove subtasks that are no longer in the set
      currentSubtasks.forEach(subtaskId => {
        if (!newSubtasks.includes(subtaskId)) {
          setStoreCompletedSubtask(identityId, subtaskId, false);
        }
      });
      // Add new subtasks
      newSubtasks.forEach(subtaskId => {
        if (!currentSubtasks.includes(subtaskId)) {
          setStoreCompletedSubtask(identityId, subtaskId, true);
        }
      });
    } else {
      setLocalCompletedSubtasks(updater);
    }
  }, [identityId, storeCompletedSubtasks, setStoreCompletedSubtask]);
  
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [currentXP, setCurrentXP] = useState(initialXP);
  const [maxXP, setMaxXP] = useState(initialMaxXP);
  const [status, setStatus] = useState(initialStatus);
  const [streak, setStreak] = useState(initialStreak);
  const [allTasksWereCompleted, setAllTasksWereCompleted] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [trialDismissed, setTrialDismissed] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(level);
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const [currentSubtitle, setCurrentSubtitle] = useState(initialSubtitle);
  const [tasks, setTasks] = useState(initialTasks);
  const [trialInfo, setTrialInfo] = useState(initialTrialInfo);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; description?: string }>({
    isOpen: false,
    title: '',
    description: '',
  });
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [milestoneRewardsData, setMilestoneRewardsData] = useState<{ coins: number; stars: number; willGain: number } | null>(null);
  
  const { showToast } = useToastStore();
  const { updateRewards } = useGameStore();

  const progressPercentage = (currentXP / maxXP) * 100;

  // Sync status with task completion state
  // When tasks are cleared (e.g., daily reset), status should reset to 'pending'
  // When all tasks are completed, status should update to 'completed'
  // CRITICAL: Also reset allTasksWereCompleted when tasks are cleared so streak can increment again
  useEffect(() => {
    const allCompleted = tasks.length > 0 && completedTasks.size === tasks.length;
    const tasksCleared = completedTasks.size === 0;
    const shouldBeCompleted = allCompleted && allTasksWereCompleted;
    const shouldBePending = !allCompleted || tasksCleared;
    
    if (shouldBeCompleted && status !== 'completed') {
      setStatus('completed');
    } else if (shouldBePending && status !== 'pending') {
      setStatus('pending');
      // Reset the flag when tasks are cleared so streak can increment next time
      if (tasksCleared && allTasksWereCompleted) {
        setAllTasksWereCompleted(false);
      }
    }
  }, [completedTasks.size, tasks.length, allTasksWereCompleted, status]);
  
  // Trial available when progress bar is full (100%) and streak >= 2n+1 where n is currentLevel
  const requiredStreak = 2 * currentLevel + 1;
  const isTrialReady = progressPercentage >= 100 && streak >= requiredStreak;

  /**
   * Get task rewards - uses path registry if available, falls back to task.rewards
   * This is the single source of truth for coin/stat rewards
   */
  const getTaskRewardsFromPath = useCallback((task: Task) => {
    // If task has path_id and path_level, use path registry (source of truth)
    const pathRegistered = task.path_id ? isPathRegistered(task.path_id) : false;
    
    logger.debug('getTaskRewardsFromPath', { 
      taskId: task.id, 
      path_id: task.path_id, 
      path_level: task.path_level,
      pathRegistered,
      fallbackCoins: task.rewards.coins,
    });
    
    if (task.path_id && task.path_level && pathRegistered) {
      const pathRewards = getPathTaskRewards(task.path_id, task.path_level);
      logger.debug('Using path registry rewards', { pathRewards });
      return {
        coins: pathRewards.coins,
        stat: pathRewards.primaryStat,
        points: pathRewards.statPoints,
      };
    }
    // Fallback to task's static rewards
    logger.debug('Using fallback rewards', { coins: task.rewards.coins });
    return {
      coins: task.rewards.coins,
      stat: task.rewards.stat,
      points: task.rewards.points,
    };
  }, []);

  const handleTaskComplete = useCallback(async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Prevent spam clicks - ignore if already processing this task
    if (processingTasks.has(taskId)) {
      logger.debug('Task already processing, ignoring click', { taskId });
      return;
    }
    
    // Mark task as processing
    setProcessingTasks(prev => new Set([...prev, taskId]));

    // Store previous state for rollback
    const prevCompletedTasks = new Set(completedTasks);
    const prevCompletedSubtasks = new Set(completedSubtasks);
    const prevXP = currentXP;
    const prevStatus = status;
    const prevStreak = streak;
    const prevAllTasksCompleted = allTasksWereCompleted;

    const wasCompleted = completedTasks.has(taskId);
    
    // Get rewards from path registry (source of truth) or fallback to task.rewards
    const taskRewards = getTaskRewardsFromPath(task);
    
    // Optimistic update
    const newCompletedTasks = new Set(completedTasks);
    const newCompletedSubtasks = new Set(completedSubtasks);
    let newXP = currentXP;
    let newStatus = status;
    let newStreak = streak;
    let newAllTasksCompleted = allTasksWereCompleted;
    
    if (wasCompleted) {
      // Uncomplete task
      newCompletedTasks.delete(taskId);
      newXP = Math.max(0, currentXP - task.rewards.xp);
      newStatus = 'pending';
      
      // Uncheck all subtasks when parent is unchecked
      if (task.subtasks) {
        task.subtasks.forEach(st => newCompletedSubtasks.delete(st.id));
      }
      
      // Reverse coin and stat rewards using path registry values
      // IMPORTANT: Combine into single updateRewards call to avoid race condition
      logger.info('Unchecking task - reversing rewards', { 
        taskId, 
        taskRewardsCoins: taskRewards.coins,
        taskRewardsPoints: taskRewards.points,
        taskRewardsStat: taskRewards.stat,
      });
      if (taskRewards.coins > 0 || (taskRewards.points > 0 && taskRewards.stat)) {
        logger.info('Deducting rewards', { coins: -taskRewards.coins, stat: taskRewards.stat, points: -taskRewards.points });
        updateRewards(-taskRewards.coins, taskRewards.stat || '', taskRewards.points > 0 ? -taskRewards.points : 0);
      }
      
      // If all tasks were previously completed, revert streak by 1 (not to initialStreak)
      // This fixes a bug where unchecking would jump to stale initialStreak value
      if (allTasksWereCompleted) {
        newStreak = Math.max(0, streak - 1);
        newAllTasksCompleted = false;
      }
    } else {
      // Complete task
      newCompletedTasks.add(taskId);
      newXP = Math.min(maxXP, currentXP + task.rewards.xp);
      
      // Check all subtasks when parent is checked
      if (task.subtasks) {
        task.subtasks.forEach(st => newCompletedSubtasks.add(st.id));
      }
      
      // Award coin and stat rewards using path registry values
      logger.info('Checking task - awarding rewards', { 
        taskId, 
        taskRewardsCoins: taskRewards.coins,
        willAward: taskRewards.coins > 0 || (taskRewards.points > 0 && taskRewards.stat)
      });
      if (taskRewards.coins > 0 || (taskRewards.points > 0 && taskRewards.stat)) {
        logger.info('Adding coins', { amount: taskRewards.coins });
        updateRewards(taskRewards.coins, taskRewards.stat || '', taskRewards.points);
      }
      
      // Check if this completes all tasks for the FIRST time
      if (newCompletedTasks.size === tasks.length && !allTasksWereCompleted) {
        newStatus = 'completed';
        newStreak = streak + 1;
        newAllTasksCompleted = true;
        
        // ========== MILESTONE REWARD CHECK ==========
        // Check for milestone or sub-milestone rewards based on new streak
        const milestone = getMilestoneForLevel(currentLevel);
        const isSubMilestone = isSubMilestoneDay(newStreak, currentLevel);
        const isFinalMilestone = milestone && newStreak === milestone.milestoneDays;
        
        if (isSubMilestone || isFinalMilestone) {
          let totalCoins = 0;
          let totalStars = 0;
          let willGain = 0;
          
          // Sub-milestone rewards
          if (isSubMilestone) {
            totalCoins += SUB_MILESTONE_REWARDS.rewards.coins;
            totalStars += SUB_MILESTONE_REWARDS.rewards.stars;
            willGain += SUB_MILESTONE_REWARDS.willGain;
            logger.info('Sub-milestone reached!', { streak: newStreak, level: currentLevel });
          }
          
          // Final milestone rewards
          if (isFinalMilestone && milestone) {
            totalCoins += milestone.rewards.coins;
            totalStars += milestone.rewards.stars;
            willGain += milestone.willGain;
            logger.info('Milestone reached!', { streak: newStreak, level: currentLevel, rewards: milestone.rewards });
          }
          
          // Award milestone rewards
          if (totalCoins > 0 || totalStars > 0 || willGain > 0) {
            awardMilestoneRewards(
              updateRewards,
              isFinalMilestone && milestone ? milestone.rewards : null,
              isSubMilestone ? SUB_MILESTONE_REWARDS.rewards : null,
              willGain
            );
            
            // Show celebration
            setMilestoneRewardsData({ coins: totalCoins, stars: totalStars, willGain });
            setShowMilestoneCelebration(true);
            
            // Don't show toast during milestone celebration - let animation play
          }
        }
      }
    }

    // Apply optimistic updates
    setCompletedTasks(newCompletedTasks);
    setCompletedSubtasks(newCompletedSubtasks);
    setCurrentXP(newXP);
    setStatus(newStatus);
    setStreak(newStreak);
    setAllTasksWereCompleted(newAllTasksCompleted);

    try {
      // Save task state to database with template_id (not identity UUID)
      if (identityId) {
        const userProfile = useGameStore.getState().userProfile;
        const identity = useGameStore.getState().getIdentityById(identityId);
        
        if (userProfile && identity) {
          // Use template_id as path_id for DB storage
          const pathId = identity.template_id || identity.template?.id;
          
          if (pathId) {
            await ChronosManager.upsertDailyPathProgress(
              userProfile.id,
              pathId, // Use template_id, not identity UUID
              tasks.length,
              newCompletedTasks.size,
              Array.from(newCompletedTasks),
              Array.from(newCompletedSubtasks)
            );
            logger.debug('Task progress saved to DB', { 
              identityId, 
              pathId, 
              completedCount: newCompletedTasks.size,
              totalTasks: tasks.length 
            });
          } else {
            logger.warn('No template_id found for identity, skipping DB save', { identityId });
          }
        }
      }
      
      // Call parent callback to update database
      if (!wasCompleted) {
        await onTaskComplete?.(taskId);
        
        // If all tasks completed, notify parent with new streak value
        if (newCompletedTasks.size === tasks.length && !prevAllTasksCompleted) {
          logger.info('🎯 All tasks completed - updating streak', { identityId, oldStreak: streak, newStreak });
          await onAllTasksComplete?.(newStreak);
        }
      } else if (wasCompleted && allTasksWereCompleted && onAllTasksComplete) {
        // Task uncompleted from "all complete" state - persist streak decrease
        logger.info('↩️ Task uncompleted - reverting streak', { identityId, oldStreak: streak, newStreak });
        await onAllTasksComplete(newStreak);
      }
    } catch (error) {
      // Rollback on error
      setCompletedTasks(prevCompletedTasks);
      setCompletedSubtasks(prevCompletedSubtasks);
      setCurrentXP(prevXP);
      setStatus(prevStatus);
      setStreak(prevStreak);
      setAllTasksWereCompleted(prevAllTasksCompleted);
      
      // Show error toast
      showToast('Failed to update task completion. Please try again.', 'error');
    } finally {
      // Always clear processing flag
      setProcessingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [tasks, maxXP, currentXP, status, streak, completedTasks, completedSubtasks, allTasksWereCompleted, initialStreak, onTaskComplete, onAllTasksComplete, updateRewards, showToast, processingTasks]);

  const toggleTaskExpansion = useCallback((taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const handleSubtaskComplete = useCallback((taskId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const task = tasks.find(t => t.id === taskId);
    if (!task?.subtasks) return;
    
    const wasSubtaskCompleted = completedSubtasks.has(subtaskId);
    const wasParentCompleted = completedTasks.has(taskId);
    
    // Get rewards from path registry (source of truth)
    const taskRewards = getTaskRewardsFromPath(task);
    
    if (wasSubtaskCompleted) {
      // Unchecking subtask - just uncheck this subtask only
      setCompletedSubtasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(subtaskId);
        return newSet;
      });
      
      // If parent was checked, uncheck parent and reverse rewards (but don't uncheck other subtasks)
      if (wasParentCompleted) {
        // Manually uncheck parent without triggering subtask cascade
        setCompletedTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
        
        // Reverse XP
        setCurrentXP(prev => Math.max(0, prev - task.rewards.xp));
        setStatus('pending');
        
        // Reverse coin and stat rewards using path registry values (single call to avoid race condition)
        if (taskRewards.coins > 0 || (taskRewards.points > 0 && taskRewards.stat)) {
          updateRewards(-taskRewards.coins, taskRewards.stat || '', taskRewards.points > 0 ? -taskRewards.points : 0);
        }
        
        // If all tasks were previously completed, revert streak
        if (allTasksWereCompleted) {
          setStreak(initialStreak);
          setAllTasksWereCompleted(false);
        }
      }
    } else {
      // Checking subtask
      setCompletedSubtasks(prev => {
        const newSet = new Set(prev);
        newSet.add(subtaskId);
        
        // Check if all subtasks for this task are now completed
        const allSubtasksCompleted = task.subtasks!.every(st => 
          st.id === subtaskId || newSet.has(st.id)
        );
        
        // Auto-check parent task if all subtasks are complete
        if (allSubtasksCompleted && !completedTasks.has(taskId)) {
          setTimeout(() => {
            const syntheticEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            handleTaskComplete(taskId, syntheticEvent as any);
          }, 300);
        }
        
        return newSet;
      });
    }
  }, [tasks, completedTasks, completedSubtasks, handleTaskComplete, getTaskRewardsFromPath, updateRewards, allTasksWereCompleted, initialStreak]);

  const handleSubtaskInfo = useCallback((taskId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const task = tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks?.find(st => st.id === subtaskId);
    
    if (subtask) {
      setInfoModal({
        isOpen: true,
        title: subtask.name,
        description: subtask.description,
      });
    }
  }, [tasks]);

  const handleTrialStart = useCallback(() => {
    setIsTrialModalOpen(true);
    onTrialStart?.();
  }, [onTrialStart]);

  const handleTrialComplete = useCallback(() => {
    // Close modal
    setIsTrialModalOpen(false);
    
    // Level up
    const newLevel = currentLevel + 1;
    
    // Get next level data if callback provided
    const nextLevelData = onLevelUp?.(newLevel);
    
    if (nextLevelData) {
      // Update to next level's data
      setCurrentTitle(nextLevelData.title);
      setCurrentSubtitle(nextLevelData.subtitle);
      setTasks(nextLevelData.tasks);
      setTrialInfo(nextLevelData.trialInfo);
      setMaxXP(nextLevelData.maxXP);
    }
    
    setCurrentLevel(newLevel);
    
    // Reset XP, streak, and completion states
    setCurrentXP(0);
    setStreak(0);
    setCompletedTasks(new Set());
    setCompletedSubtasks(new Set());
    setExpandedTasks(new Set());
    setAllTasksWereCompleted(false);
    setStatus('pending');
    setTrialDismissed(false);
    
    // Show level up notification
    setShowLevelUp(true);
    
    // Award trial rewards from trial info (coins + stars)
    const rewards = trialInfo?.rewards;
    if (rewards) {
      // Pass stars as 4th parameter to updateRewards
      updateRewards(rewards.coins, 'BODY', 0, rewards.stars || 0);
    }
  }, [currentLevel, updateRewards, onLevelUp, trialInfo]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-panel-purple p-5 transition-all ${
        isTrialReady && !trialDismissed
          ? '!border-amber-500 animate-shadow-pulse'
          : ''
      }`}
      style={{
        animation: isTrialReady && !trialDismissed ? 'shadow-pulse 2s ease-in-out infinite' : undefined,
      }}
    >
      {/* Trial Ready Background Overlay */}
      {isTrialReady && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.1) 0%, transparent 70%)'
          }}
        />
      )}
      {/* ROW 1: Title, Status, and Streak */}
      <div className="flex items-start justify-between gap-3 mb-1 relative z-10">
        {/* Left: Title - fluid scaling, never truncate */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h3 
            className="font-bold text-white font-section tracking-wide break-words"
            style={{ 
              textShadow: '0 0 10px rgba(192, 132, 252, 0.4)',
              fontSize: 'clamp(1.6rem, 6vw, 2.5rem)'
            }}
          >
            {currentTitle}
          </h3>
        </div>
        
        {/* Right: Status Badge */}
        {!isTrialReady && (
          <div 
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 mr-1 border-2 ${
              status === 'completed' 
                ? 'bg-green-500/20 border-green-400 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                : 'bg-transparent border-slate-600 text-slate-400'
            }`}
          >
            {status === 'completed' ? 'Complete' : 'Pending'}
          </div>
        )}
        
        {/* Right: Trial CTA only when ready - scaled down 10% */}
        {isTrialReady && (
          <div className="flex-shrink-0">
            <motion.button
              onClick={handleTrialStart}
              animate={{ scale: [0.9, 0.945, 0.9] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r mr-1 from-red-600 to-orange-600 text-white font-bold tracking-wide shadow-[0_0_12px_rgba(220,38,38,0.6)] hover:shadow-[0_0_20px_rgba(220,38,38,0.8)] transition-shadow"
            >
              TRIAL
            </motion.button>
          </div>
        )}
      </div>

      {/* ROW 2: Subtitle (The Identity Row) */}
      {currentSubtitle && (
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <p className="text-sm text-purple-300/70">
            {currentSubtitle}
          </p>
        </div>
      )}

      {/* ROW 3: Progress Bar (The Progress Row) */}
      <div className="mb-5 space-y-1 relative z-10">
        <div className="flex items-center justify-center">
          {/* Lightning Progress Bar - 98% of card width */}
          <div className="relative h-6 rounded-full bg-slate-900/80 ring-1 ring-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-sm overflow-hidden" style={{ width: '98%' }}>
            
            {/* 'XP' Label (Embedded inside, right aligned) */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest text-slate-500 z-0">
              XP
            </div>

            {/* The Fill Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative h-full rounded-full"
            >
              {/* 1. Base Glow (Dark Violet Background - matching card border) */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 via-purple-700/60 to-purple-500/50 opacity-90 blur-[2px]" />
              
              {/* 2. The Core Beam (Subtle Center Highlight) */}
              <div className="absolute inset-y-[25%] left-0 right-1 bg-gradient-to-r from-transparent via-purple-400/40 to-purple-300/30 opacity-50 blur-[1px]" />

              {/* 3. The Lightning Texture (SVG Pattern) */}
              <div 
                className="absolute inset-0 w-full h-full opacity-50 mix-blend-overlay animate-lightning-flow"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='100%25' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 10 0 20 10 T 40 10' fill='none' stroke='%23ffffff' stroke-width='2' opacity='0.95'/%3E%3C/svg%3E")`,
                  backgroundSize: '30px 100%',
                }}
              />

              {/* 4. The "Flash" Tip (Subtle vertical line at the end) */}
              <div className="absolute right-0 top-0 h-full w-[1.5px] bg-purple-300/40 shadow-[0_0_6px_2px_rgba(192,132,252,0.3)] z-20" />
              
              {/* 5. Lens Flare (Subtle horizontal spill at the tip) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-[110%] bg-purple-400/20 blur-md rounded-full -translate-x-1/2" />
            </motion.div>
          </div>
        </div>

        {/* XP Text and Streak Row - swapped positions */}
        <div className="flex items-center justify-between px-1 mt-2">
          {/* Streak Counter - Left aligned with left margin */}
          {!isTrialReady && (
            <div className="flex items-center gap-2 ml-3">
              <span className="text-xs text-slate-400">Streak:</span>
              <StreakCounter 
                streak={streak} 
                level={currentLevel} 
                className="flex-shrink-0"
              />
            </div>
          )}
          
          {/* XP Counter - Right aligned with right margin */}
          <motion.div 
            key={currentXP}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
            className="text-xs text-purple-300 mr-3"
          >
            <span>{currentXP} /</span>
            <span> {maxXP}</span>
          </motion.div>
        </div>
      </div>

      {/* Task List Section */}
      <div className="space-y-3 relative z-10">
        <p className="text-xs text-slate-400 mb-2">Tap to complete tasks</p>
        
        <div className="space-y-0">
          {tasks.map((task, index) => {
            const isCompleted = completedTasks.has(task.id);
            const isExpanded = expandedTasks.has(task.id);

            return (
              <div key={task.id} className="space-y-0">
                {/* Divider before each task (except first) */}
                {index > 0 && (
                  <div className="my-3 border-t border-slate-600/60" />
                )}
                
                {/* Task Card */}
                <TaskCard
                  id={task.id}
                  title={task.title}
                  isCompleted={isCompleted}
                  isExpanded={isExpanded}
                  hasExpand={true}
                  isGateCapped={isStatCapped}
                  onToggleComplete={handleTaskComplete}
                  onToggleExpansion={toggleTaskExpansion}
                />

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-slate-800/50 rounded-lg p-4 mt-1 mx-auto border border-slate-700/50 backdrop-blur-sm" style={{ width: '90%' }}>
                        {/* Description */}
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-slate-300 mb-1">Description</p>
                          <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                        </div>

                        {/* Subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-300 mb-2">Subtasks</p>
                            <div className="space-y-0">
                              {task.subtasks.map((subtask, subtaskIndex) => (
                                <div key={subtask.id}>
                                  {/* Divider between subtasks (except first) */}
                                  {subtaskIndex > 0 && (
                                    <div className="my-2 border-t border-slate-700/50" />
                                  )}
                                  <TaskCard
                                    id={subtask.id}
                                    title={subtask.name}
                                    isCompleted={completedSubtasks.has(subtask.id)}
                                    hasExpand={false}
                                    hasInfo={!!subtask.description}
                                    description={subtask.description}
                                    isGateCapped={isStatCapped}
                                    onToggleComplete={(subtaskId, e) => handleSubtaskComplete(task.id, subtaskId, e)}
                                    onInfoClick={(subtaskId, e) => handleSubtaskInfo(task.id, subtaskId, e)}
                                    className="bg-slate-900/40 border-slate-600/30"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rewards - Glasscard aesthetic */}
                        <div>
                          <p className="text-xs font-semibold text-slate-300 mb-2">Rewards</p>
                          <RewardBar
                            xp={task.rewards.xp}
                            stat={task.rewards.stat}
                            statPoints={task.rewards.points}
                            coins={task.rewards.coins}
                            isStatCapped={isStatCapped}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trial Modal */}
      <TrialModal
        isOpen={isTrialModalOpen}
        pathName={currentTitle}
        trialName={trialInfo?.name || `Level ${currentLevel + 1} Trial`}
        level={currentLevel + 1}
        description={trialInfo?.description || `Complete the trial to advance to Level ${currentLevel + 1}.`}
        tasks={[{
          id: 'trial-1',
          title: trialInfo?.tasks || 'Complete the Trial Challenge',
          description: '',
        }]}
        rewards={{
          coins: trialInfo?.rewards.coins || 100,
          stars: trialInfo?.rewards.stars || 0,
          stat: 'BODY',
          statPoints: trialInfo?.rewards.bodyPoints || 5,
          item: trialInfo?.rewards.item,
        }}
        onClose={() => {
          setIsTrialModalOpen(false);
          setTrialDismissed(true);
        }}
        onComplete={handleTrialComplete}
      />

      {/* Level Up Notification */}
      <LevelUpNotification
        isVisible={showLevelUp}
        pathName={currentTitle}
        newLevel={currentLevel}
        onComplete={() => setShowLevelUp(false)}
      />

      {/* Subtask Info Modal */}
      <SubtaskInfoModal
        isOpen={infoModal.isOpen}
        title={infoModal.title}
        description={infoModal.description}
        onClose={() => setInfoModal({ isOpen: false, title: '', description: '' })}
      />

      {/* Milestone Celebration */}
      <MilestoneCelebration
        isVisible={showMilestoneCelebration}
        onComplete={() => {
          setShowMilestoneCelebration(false);
          setMilestoneRewardsData(null);
        }}
        willGained={milestoneRewardsData?.willGain}
        level={currentLevel}
      />
    </motion.div>
  );
});

PathCard.displayName = 'PathCard';

export default PathCard;

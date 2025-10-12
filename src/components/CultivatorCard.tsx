import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, Calendar, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Identity, UserProgress, IdentityTier } from '@/models/cultivatorTypes';
import { useCultivatorStore } from '@/store/cultivatorStore';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabaseDB } from '@/api/supabaseService';
import { useAuthStore } from '@/store/authStore';
import { isSupabaseConfigured } from '@/lib/supabase';

interface CultivatorCardProps {
  identity: Identity;
  progress: UserProgress; // retained for backward compatibility but live store progress will override
  index?: number;
}

const CultivatorCard = ({ identity, progress, index = 0 }: CultivatorCardProps) => {
  // Split store selectors to reduce re-renders
  const getIdentityTitle = useCultivatorStore(state => state.getIdentityTitle);
  const getIdentityTasks = useCultivatorStore(state => state.getIdentityTasks);
  const canCompleteTaskToday = useCultivatorStore(state => state.canCompleteTaskToday);
  const canReverseTaskToday = useCultivatorStore(state => state.canReverseTaskToday);
  const progressUpdating = useCultivatorStore(state => state.progressUpdating);
  const getHistory = useCultivatorStore(state => state.getHistory);
  const setHistoryEntry = useCultivatorStore(state => state.setHistoryEntry);
  const historyVersion = useCultivatorStore(state => state.historyVersion);
  const liveProgress = useCultivatorStore(state => 
    state.userProgress.find(p => p.identityID === identity.identityID) || null
  );
  const effectiveProgress = liveProgress || progress; // ensure we always have latest

  // Determine if the task is completed for TODAY (guard against previous-day completedToday flag)
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const now = new Date();
  const doneToday = effectiveProgress.completedToday && isSameDay(new Date(effectiveProgress.lastUpdatedDate), now);

  const [showCalendar, setShowCalendar] = useState(false);
  const [isTasksExpanded, setIsTasksExpanded] = useState(true); // Default: expanded to show current tasks
  const [supabaseHistory, setSupabaseHistory] = useState<{ date: string; completed: boolean }[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, boolean>>(new Map());
  const { currentUser: authUser } = useAuthStore();
  
  // Fetch history from Supabase when calendar is opened
  useEffect(() => {
    if (showCalendar && isSupabaseConfigured() && authUser?.id) {
      supabaseDB.getCompletionHistory(authUser.id, identity.identityID)
        .then(completions => {
          const history = completions
            .filter(c => !c.reversed)
            .map(c => ({
              date: c.completion_date,
              completed: true
            }));
          setSupabaseHistory(history);
        })
        .catch(err => {
          console.error('Failed to fetch completion history:', err);
        });
    }
  }, [showCalendar, identity.identityID, authUser, historyVersion]);
  
  // lock body scroll when calendar open
  useEffect(() => {
    if (showCalendar) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showCalendar]);

  const calendarToday = useMemo(()=> new Date(), []);
  const [monthOffset, setMonthOffset] = useState<number>(() => 0);
  const localDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const todayISO = localDateKey(calendarToday);

  // Use Supabase history if available, otherwise use localStorage
  const identityHistory = useMemo(() => {
    if (isSupabaseConfigured() && supabaseHistory.length > 0) {
      return supabaseHistory;
    }
    return getHistory(identity.identityID);
  }, [identity.identityID, historyVersion, supabaseHistory]);
  
  // Merge actual history with optimistic updates
  const historyMap = useMemo(() => {
    const map = new Map(identityHistory.map(h => [h.date, h.completed]));
    // Apply optimistic updates on top
    optimisticUpdates.forEach((completed, date) => {
      map.set(date, completed);
    });
    return map;
  }, [identityHistory, optimisticUpdates]);

  const viewDate = useMemo(() => new Date(calendarToday.getFullYear(), calendarToday.getMonth() + monthOffset, 1), [calendarToday, monthOffset]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: { date: Date; iso: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      // Use local date key instead of UTC ISO to prevent off-by-one (timezone) shift
      list.push({ date: dateObj, iso: localDateKey(dateObj) });
    }
    return list;
  }, [year, month]);

  const toggleDay = (iso: string) => {
    const current = historyMap.get(iso) || false;
    const newState = !current;
    
    // Optimistically update the UI immediately
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.set(iso, newState);
      return next;
    });
    
    // Update via setHistoryEntry (which syncs with Supabase)
    setHistoryEntry(identity.identityID, iso, newState);
    
    // Clear the optimistic update after a delay to let real data come in
    setTimeout(() => {
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(iso);
        return next;
      });
    }, 3000);
  };

  const isUpdating = progressUpdating.includes(identity.identityID);

  const handleToggleTask = async () => {
    if (!isUpdating) {
      // Toggle today's completion through the calendar system
      // This ensures consistency between the button and calendar
      const newState = !doneToday;
      setHistoryEntry(identity.identityID, todayISO, newState);
    }
  };

  const canComplete = canCompleteTaskToday(identity.identityID);
  const canReverse = canReverseTaskToday(identity.identityID);
  const isClickable = canComplete || canReverse;

  const getTierColor = (tier: IdentityTier) => {
    // Unified theme: base card gradient always violet->cyan, tier only affects subtle ring
    const map: Record<IdentityTier,string> = {
      'D': 'ring-1 ring-violet-400/30',
      'D+': 'ring-1 ring-violet-400/35',
      'C': 'ring-1 ring-cyan-400/40',
      'C+': 'ring-1 ring-cyan-400/45',
      'B': 'ring-2 ring-cyan-300/50',
      'B+': 'ring-2 ring-cyan-300/55',
      'A': 'ring-2 ring-violet-300/60',
      'A+': 'ring-2 ring-violet-300/65',
      'S': 'ring-2 ring-cyan-200/70',
      'S+': 'ring-2 ring-cyan-200/72',
      'SS': 'ring-2 ring-amber-200/75',
      'SS+': 'ring-3 ring-amber-200/77',
      'SSS': 'ring-3 ring-amber-100/80',
    };
    return map[tier];
  };

  // Tier badge color styles (no icon)
  const tierBadgeClass = (() => {
    switch (identity.tier) {
      case 'SSS': return 'bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] border-amber-300/70';
      case 'SS+': return 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 text-transparent bg-clip-text drop-shadow-[0_0_7.5px_rgba(251,191,36,0.85)] border-amber-300/65';
      case 'SS': return 'bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-transparent bg-clip-text drop-shadow-[0_0_7px_rgba(251,191,36,0.8)] border-amber-400/60';
      case 'S+': return 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-transparent bg-clip-text drop-shadow-[0_0_6.5px_rgba(251,191,36,0.77)] border-amber-400/55';
      case 'S': return 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-transparent bg-clip-text drop-shadow-[0_0_6px_rgba(251,191,36,0.75)] border-amber-400/50';
      case 'A+': return 'bg-gradient-to-r from-fuchsia-300 via-violet-300 to-purple-300 text-transparent bg-clip-text drop-shadow-[0_0_6.5px_rgba(192,132,252,0.73)] border-violet-400/52';
      case 'A': return 'bg-gradient-to-r from-fuchsia-300 via-violet-300 to-purple-400 text-transparent bg-clip-text drop-shadow-[0_0_6px_rgba(192,132,252,0.7)] border-violet-400/50';
      case 'B+': return 'bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 text-transparent bg-clip-text drop-shadow-[0_0_6.3px_rgba(52,211,153,0.63)] border-emerald-400/52';
      case 'B': return 'bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 text-transparent bg-clip-text drop-shadow-[0_0_6px_rgba(52,211,153,0.6)] border-emerald-400/50';
      case 'C+': return 'bg-gradient-to-r from-cyan-300 via-sky-300 to-teal-300 text-transparent bg-clip-text drop-shadow-[0_0_6px_rgba(103,232,249,0.58)] border-cyan-400/42';
      case 'C': return 'bg-gradient-to-r from-cyan-300 via-sky-300 to-teal-300 text-transparent bg-clip-text drop-shadow-[0_0_6px_rgba(103,232,249,0.55)] border-cyan-400/40';
      case 'D+': return 'bg-gradient-to-r from-slate-300 via-gray-300 to-zinc-300 text-transparent bg-clip-text drop-shadow-[0_0_5.5px_rgba(209,213,219,0.48)] border-gray-400/42';
      default: return 'bg-gradient-to-r from-slate-300 via-gray-300 to-zinc-200 text-transparent bg-clip-text drop-shadow-[0_0_5px_rgba(209,213,219,0.45)] border-gray-400/40'; // D
    }
  })();

  const progressPercentage = (effectiveProgress.daysCompleted / identity.requiredDaysPerLevel) * 100;
  const identityTitle = getIdentityTitle(identity);
  const tasks = getIdentityTasks(identity); // Get dynamic tasks from detailed definition

  const getButtonStyles = () => {
    if (doneToday) {
      return 'bg-green-500/25 text-green-200 border-2 border-green-400 hover:bg-green-500/35';
    }
    if (isClickable) {
      return 'bg-cyan-500/25 text-cyan-200 border-2 border-cyan-400 hover:bg-cyan-500/35';
    }
    return 'bg-violet-900/30 text-violet-300/60 border-2 border-violet-600/40 cursor-not-allowed opacity-60';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="w-full cultivator-card group"
    >
      <div className={`relative rounded-2xl p-6 shadow-2xl border border-violet-500/20 backdrop-blur-sm bg-gradient-to-br from-[#1d1230] via-[#22153a] to-[#102a38] hover:from-[#261a42] hover:to-[#123646] transition-colors ${getTierColor(identity.tier)}`}>
        {/* Header row now includes calendar toggle */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2 relative">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold tracking-widest uppercase px-2 py-1 rounded-md border ${tierBadgeClass}`}>{identity.tier} Tier</span>
            </div>
            <div className="flex items-center gap-1 text-white/90 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-400/40">
              <Zap className="h-4 w-4 text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
              <span className="text-sm font-semibold tracking-wide">Level {identity.level}</span>
            </div>
            {effectiveProgress.streakDays > 0 && (
              <div className="flex items-center gap-1 text-yellow-200 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{effectiveProgress.streakDays}d</span>
              </div>
            )}
            {/* Spacer pushes calendar toggle to right */}
            <div className="ml-auto flex items-center">
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(s => !s)}
                  className={`p-2 rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${showCalendar ? 'bg-cyan-600/30 border-cyan-400/40 text-cyan-100 shadow-[0_0_8px_rgba(56,189,248,0.4)]' : 'bg-violet-900/30 border-violet-600/30 text-violet-200/70 hover:bg-violet-800/40'}`}
                  aria-label={showCalendar ? 'Close calendar' : 'Open calendar'}
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-200 transition-colors">
            {identityTitle}
          </h3>
          <p className="text-cyan-200/70 text-xs tracking-wide uppercase">{identity.identityType} Path</p>
        </div>
        
        {/* Daily Tasks Accordion */}
        <div className="mb-6">
          <button
            onClick={() => setIsTasksExpanded(!isTasksExpanded)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-violet-900/20 to-cyan-900/20 border border-violet-400/30 hover:border-cyan-400/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              {isTasksExpanded ? (
                <ChevronDown className="h-5 w-5 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
              ) : (
                <ChevronRight className="h-5 w-5 text-violet-300 group-hover:text-cyan-200 transition-colors" />
              )}
              <h4 className="text-sm font-semibold text-cyan-200 tracking-wide uppercase">
                Daily Tasks
              </h4>
            </div>
            <div className="text-xs text-cyan-300/70 font-medium">
              Level {identity.level}/10
            </div>
          </button>
          
          <AnimatePresence>
            {isTasksExpanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-3 mt-3 overflow-hidden"
              >
                {tasks.map((taskText, idx) => (
                  <motion.li
                    key={`task-${idx}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 shadow-[0_0_6px_2px_rgba(56,189,248,0.5)]" />
                    <div>
                      <p className="text-sm font-medium text-white">{taskText}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm font-medium">
              Progress to Next Level
            </span>
            <span className="text-white text-sm font-bold">
              {effectiveProgress.daysCompleted} / {identity.requiredDaysPerLevel}
            </span>
          </div>
          
          <div className="w-full bg-violet-900/40 rounded-full h-3 overflow-hidden ring-1 ring-violet-500/30">
            <motion.div 
              className="bg-gradient-to-r from-cyan-400 via-violet-300 to-cyan-300 h-full rounded-full shadow-[0_0_8px_2px_rgba(56,189,248,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Complete Today Button */}
        <motion.button
          onClick={handleToggleTask}
          disabled={!isClickable || isUpdating}
          whileHover={isClickable ? { scale: 1.05 } : {}}
          whileTap={isClickable ? { scale: 0.95 } : {}}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${getButtonStyles()} shadow-[0_0_12px_-2px_rgba(139,92,246,0.5),0_0_18px_-2px_rgba(56,189,248,0.4)]`}
        >
          <div className="flex items-center justify-center gap-2">
            {isUpdating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Calendar className="h-5 w-5" />
                {doneToday ? 'Completed' : 'Complete'}
              </>
            )}
          </div>
        </motion.button>

        {/* Evolution Preview */}
        {identity.level >= 8 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-violet-800/30 rounded-xl border border-cyan-300/30 shadow-[0_0_15px_-3px_rgba(56,189,248,0.5)]"
          >
            <div className="flex items-center gap-2 text-yellow-200 text-sm">
              <Crown className="h-4 w-4" />
              <span className="font-medium">
                {identity.level === 10 ? 'Ready to Evolve!' : `${10 - identity.level} levels to evolution`}
              </span>
            </div>
          </motion.div>
        )}
      </div>
      {showCalendar && createPortal(
        <AnimatePresence mode="wait">
          <motion.div
            key="cal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCalendar(false)}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <motion.div
              key="cal-pop"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 210, damping: 24 }}
              className="relative w-[95vw] min-w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] max-w-[1400px] max-h-[88vh] h-auto flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#201536] via-[#261b42] to-[#132f3a] border border-violet-500/40 shadow-[0_0_55px_-8px_rgba(56,189,248,0.55),0_0_55px_-8px_rgba(139,92,246,0.45)] backdrop-blur-xl pointer-events-auto"
            >
                {/* Header Controls */}
                <div className="flex items-center justify-between gap-2 p-4 pb-3 border-b border-violet-500/30">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMonthOffset(o => o - 1)} className="px-3 py-2 rounded-md bg-violet-800/40 hover:bg-violet-700/60 text-[12px] sm:text-sm border border-violet-600/40 shrink-0">Prev</button>
                    <span className="text-sm sm:text-base font-semibold text-white tracking-wide whitespace-nowrap select-none min-w-[140px] sm:min-w-[160px] text-center">
                      {viewDate.toLocaleString(undefined,{ month:'long', year:'numeric' })}
                    </span>
                    <button onClick={() => setMonthOffset(o => o + 1)} className="px-3 py-2 rounded-md bg-violet-800/40 hover:bg-violet-700/60 text-[12px] sm:text-sm border border-violet-600/40 shrink-0">Next</button>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setMonthOffset(0); }}
                      className="px-2 sm:px-3 py-2 rounded-md bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 text-xs font-semibold border border-cyan-500/40 shrink-0"
                    >Today</button>
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-violet-700/40 shrink-0"
                      aria-label="Close calendar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Identity Title and Streak */}
                <div className="px-5 pt-4 pb-3 border-b border-violet-500/20">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                        {identityTitle}
                      </h3>
                      <p className="text-cyan-200/70 text-xs tracking-wide uppercase">{identity.identityType} Path</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40">
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl">🔥</span>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-amber-200">{effectiveProgress.streakDays}</span>
                          <span className="text-[10px] text-amber-200/70 -mt-1 uppercase tracking-wide">Day Streak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 text-[11px] sm:text-xs text-cyan-200 px-5 pt-3 pb-2 flex-wrap">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-cyan-500/70 border border-cyan-300/40" /> Done</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-violet-800/60 border border-violet-500/40" /> Missed</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-transparent border border-cyan-300/30" /> Future</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gradient-to-r from-violet-400 to-cyan-400 animate-pulse" /> Today</span>
                </div>

                {/* Scrollable Calendar Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
                  <div className="grid grid-cols-7 gap-2 text-center text-[11px] sm:text-sm font-medium text-gray-300 mb-3">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2 auto-rows-[minmax(46px,1fr)] sm:auto-rows-[minmax(60px,1fr)]">
                    {(() => {
                      const firstWeekday = new Date(year, month, 1).getDay();
                      const blanks = Array.from({ length: firstWeekday });
                      return [
                        ...blanks.map((_,i) => <div key={`b${i}`} />),
                        ...calendarDays.map(day => {
                          const baseCompleted = historyMap.get(day.iso);
                          const completed = baseCompleted !== undefined ? baseCompleted : (day.iso === todayISO ? effectiveProgress.completedToday : false);
                          const future = day.date > calendarToday;
                          const isToday = day.iso === todayISO;
                          return (
                            <button
                              key={day.iso}
                              disabled={future}
                              onClick={() => toggleDay(day.iso)}
                              className={`relative group rounded-md sm:rounded-lg flex flex-col items-center justify-center gap-1 text-[11px] sm:text-sm font-semibold transition-all border p-1 sm:p-2 ${
                                completed
                                  ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-100 shadow-[0_0_6px_rgba(56,189,248,0.45)]'
                                  : 'bg-violet-900/40 border-violet-700/50 text-violet-200/80 hover:bg-violet-800/50'
                              } ${future ? 'opacity-25 cursor-not-allowed' : 'hover:scale-105'} ${isToday ? 'ring-2 ring-offset-2 ring-offset-[#201536] ring-cyan-400/60' : ''}`}
                              title={completed ? 'Click to mark missed' : 'Click to mark completed'}
                            >
                              <span className="drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]">{day.date.getDate()}</span>
                              {isToday && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 animate-pulse" />
                              )}
                              {completed && (
                                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                              )}
                            </button>
                          );
                        })
                      ];
                    })()}
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
};

export default CultivatorCard;

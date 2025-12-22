import { useState, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { QUEST_COIN_REWARDS } from '@/store/questStore';

export type QuestStatus = 'today' | 'backlog' | 'completed';
export type QuestDifficulty = 'Easy' | 'Moderate' | 'Difficult' | 'Hard' | 'Hell';

export interface SubQuest {
  id: string;
  title: string;
}

export interface Quest {
  id: string;
  title: string;
  project: string;
  date: string;
  hour?: string;
  status: QuestStatus;
  difficulty?: QuestDifficulty;
  completedAt?: string;
  subtasks?: SubQuest[];
}

interface QuestCardProps {
  quest: Quest;
  isCompleted: boolean;
  completedSubtasks: Set<string>;
  onComplete: (questId: string, e: React.MouseEvent) => void;
  onSubtaskComplete: (questId: string, subtaskId: string, e: React.MouseEvent) => void;
  onDateChange?: (questId: string, date: string) => void;
  onTimeChange?: (questId: string, time: string) => void;
}

export const QuestCard = memo(({
  quest,
  isCompleted,
  completedSubtasks,
  onComplete,
  onSubtaskComplete,
  onDateChange,
  onTimeChange,
}: QuestCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(quest.date);
  const [selectedTime, setSelectedTime] = useState<string>(quest.hour || '--:--');
  const [pickerMonth, setPickerMonth] = useState<number>(new Date().getMonth());
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());

  const toggleExpansion = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Calendar helper functions
  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  }, []);

  const formatDate = useCallback((date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    const formatted = formatDate(date);
    setSelectedDate(formatted);
    setShowDatePicker(false);
    onDateChange?.(quest.id, formatted);
  }, [formatDate, onDateChange, quest.id]);

  const handleTimeSelect = useCallback((hour: number, minute: number) => {
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    setSelectedTime(formattedTime);
    setShowTimePicker(false);
    onTimeChange?.(quest.id, formattedTime);
  }, [onTimeChange, quest.id]);

  const handleDatePickerToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDatePicker(prev => !prev);
    setShowTimePicker(false);
  }, []);

  const handleTimePickerToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTimePicker(prev => !prev);
    setShowDatePicker(false);
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDatePicker(false);
    setShowTimePicker(false);
  }, []);

  const handlePrevMonth = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerMonth(prev => {
      if (prev === 0) {
        setPickerYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerMonth(prev => {
      if (prev === 11) {
        setPickerYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={toggleExpansion}
      className={`relative rounded-lg p-4 cursor-pointer transition-all backdrop-blur-md ${
        isCompleted 
          ? 'bg-slate-900/30 border border-slate-800' 
          : 'bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]'
      }`}
    >
      {/* Collapsed View */}
      <div className="flex justify-between items-center">
        {/* Left Side: Title + Project */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h4 className={`font-semibold text-lg transition-all ${
            isCompleted 
              ? 'text-slate-500 line-through' 
              : 'text-white'
          }`}>
            {quest.title}
          </h4>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            {quest.project}
          </p>
        </div>

        {/* Right Side: Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-4"
        >
          <ChevronDown className={`w-5 h-5 transition-colors ${
            isCompleted ? 'text-slate-600' : 'text-slate-400'
          }`} />
        </motion.div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3">
              {/* Subtasks */}
              {quest.subtasks && quest.subtasks.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Subtasks</span>
                  {quest.subtasks.map((subtask, index) => {
                    const isSubtaskCompleted = completedSubtasks.has(subtask.id);
                    const isLastSubtask = index === quest.subtasks!.length - 1;
                    return (
                      <div key={subtask.id}>
                        <button
                          onClick={(e) => onSubtaskComplete(quest.id, subtask.id, e)}
                          className={`w-full flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg transition-all cursor-pointer ${
                            isSubtaskCompleted 
                              ? 'hover:bg-slate-800/30' 
                              : 'hover:bg-purple-900/20'
                          }`}
                        >
                          <div
                            className="relative w-4 h-4 rounded border-2 transition-all flex items-center justify-center flex-shrink-0"
                            style={{
                              borderColor: isSubtaskCompleted ? 'rgb(168, 85, 247)' : 'rgb(100, 116, 139)',
                              backgroundColor: isSubtaskCompleted ? 'rgb(168, 85, 247)' : 'transparent',
                              boxShadow: isSubtaskCompleted ? '0 0 6px rgba(168, 85, 247, 0.5)' : 'none'
                            }}
                          >
                            {isSubtaskCompleted && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <motion.path
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.2 }}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </motion.svg>
                            )}
                          </div>
                          <span className={`text-sm transition-all text-left ${
                            isSubtaskCompleted 
                              ? 'text-slate-500 line-through' 
                              : 'text-slate-300'
                          }`}>
                            {subtask.title}
                          </span>
                        </button>
                        {/* Divider between subtasks */}
                        {!isLastSubtask && (
                          <div className="border-b border-slate-700/50 mx-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Date and Hour */}
              <div className="grid grid-cols-2 gap-3 relative">
                {/* Date */}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Date</span>
                  <button
                    onClick={handleDatePickerToggle}
                    className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg border transition-all ${
                      isCompleted 
                        ? 'bg-slate-800/50 border-slate-700 text-slate-600' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-purple-500/50'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{selectedDate}</span>
                  </button>
                </div>

                {/* Hour */}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Hour</span>
                  <button
                    onClick={handleTimePickerToggle}
                    className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg border transition-all ${
                      isCompleted 
                        ? 'bg-slate-800/50 border-slate-700 text-slate-600' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-purple-500/50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{selectedTime}</span>
                  </button>
                </div>
              </div>

              {/* Rewards Section */}
              {quest.difficulty && (
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Rewards</span>
                  <div className="flex items-center gap-3">
                    {/* Coin Reward */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <span className="text-base">🪙</span>
                      <span className="text-sm font-semibold text-amber-300">+{QUEST_COIN_REWARDS[quest.difficulty]}</span>
                    </div>
                    {/* Difficulty Badge */}
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border ${
                      quest.difficulty === 'Easy' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                      quest.difficulty === 'Moderate' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                      quest.difficulty === 'Difficult' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                      quest.difficulty === 'Hard' ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' :
                      'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}>
                      {quest.difficulty}
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Button */}
              <button
                onClick={(e) => onComplete(quest.id, e)}
                className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                  isCompleted
                    ? 'bg-slate-800/50 border border-slate-700 text-slate-500'
                    : 'bg-purple-600/20 border border-purple-500/50 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                }`}
              >
                {isCompleted ? 'Completed ✓' : 'Mark Complete'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date Picker Overlay */}
      {showDatePicker && createPortal(
        <AnimatePresence>
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleOverlayClick}
              className="fixed inset-0 bg-black/40 z-[100]"
            />
            {/* Date Picker Container */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              {/* Date Picker Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] min-w-[280px] pointer-events-auto"
              >
              {(() => {
                const now = new Date();
                const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
                const firstDay = getFirstDayOfMonth(pickerYear, pickerMonth);
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                
                const days = [];
                // Add empty cells for days before first day of month
                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`empty-${i}`} className="p-2" />);
                }
                // Add days of month
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(pickerYear, pickerMonth, day);
                  const isToday = day === now.getDate() && pickerMonth === now.getMonth() && pickerYear === now.getFullYear();
                  days.push(
                    <button
                      key={day}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateSelect(date);
                      }}
                      className={`p-2 rounded text-sm font-medium transition-all hover:bg-purple-600/30 ${
                        isToday 
                          ? 'bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/50' 
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                }
                
                return (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1 rounded hover:bg-slate-700 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                      </button>
                      <div className="text-sm font-semibold text-slate-300">
                        {monthNames[pickerMonth]} {pickerYear}
                      </div>
                      <button
                        onClick={handleNextMonth}
                        className="p-1 rounded hover:bg-slate-700 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 mb-2">
                      <div className="text-center">Su</div>
                      <div className="text-center">Mo</div>
                      <div className="text-center">Tu</div>
                      <div className="text-center">We</div>
                      <div className="text-center">Th</div>
                      <div className="text-center">Fr</div>
                      <div className="text-center">Sa</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {days}
                    </div>
                  </>
                );
              })()}
              </motion.div>
            </div>
          </>
        </AnimatePresence>,
        document.body
      )}

      {/* Time Picker Overlay */}
      {showTimePicker && createPortal(
        <AnimatePresence>
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleOverlayClick}
              className="fixed inset-0 bg-black/40 z-[100]"
            />
            {/* Time Picker Container */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              {/* Time Picker Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] min-w-[240px] pointer-events-auto"
              >
              <div className="text-center text-sm font-semibold text-slate-300 mb-3">
                Select Time
              </div>
              <div className="flex gap-3 justify-center mb-3">
                {/* Hours */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-slate-500 text-center mb-1">Hour</div>
                  <div className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 pr-1 border border-slate-700 rounded">
                    {Array.from({ length: 24 }, (_, i) => {
                      const currentHour = parseInt(selectedTime.split(':')[0]);
                      const isSelected = currentHour === i;
                      return (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentMinute = parseInt(selectedTime.split(':')[1]) || 0;
                            handleTimeSelect(i, currentMinute);
                          }}
                          className={`w-full py-2 px-2 text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-purple-600/30 text-purple-300'
                              : 'text-slate-300 hover:bg-purple-600/20 hover:text-white'
                          }`}
                        >
                          {i.toString().padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Minutes */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-slate-500 text-center mb-1">Min</div>
                  <div className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 pr-1 border border-slate-700 rounded">
                    {Array.from({ length: 60 }, (_, i) => {
                      const currentMinute = parseInt(selectedTime.split(':')[1]);
                      const isSelected = currentMinute === i;
                      return (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentHour = parseInt(selectedTime.split(':')[0]) || 0;
                            handleTimeSelect(currentHour, i);
                          }}
                          className={`w-full py-2 px-2 text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-purple-600/30 text-purple-300'
                              : 'text-slate-300 hover:bg-purple-600/20 hover:text-white'
                          }`}
                        >
                          {i.toString().padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Done Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTimePicker(false);
                }}
                className="w-full py-2 px-4 rounded-lg bg-purple-600/20 border border-purple-500/50 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400 transition-all font-medium text-sm"
              >
                Done
              </button>
              </motion.div>
            </div>
          </>
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
});

QuestCard.displayName = 'QuestCard';

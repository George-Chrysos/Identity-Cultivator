import { useState, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
}

export const DateTimePicker = memo(({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  disabled = false,
}: DateTimePickerProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState<number>(new Date().getMonth());
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());

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
    onDateChange(formatted);
    setShowDatePicker(false);
  }, [formatDate, onDateChange]);

  const handleTimeSelect = useCallback((hour: number, minute: number) => {
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onTimeChange(formattedTime);
  }, [onTimeChange]);

  const handleDatePickerToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setShowDatePicker(prev => !prev);
    setShowTimePicker(false);
  }, [disabled]);

  const handleTimePickerToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setShowTimePicker(prev => !prev);
    setShowDatePicker(false);
  }, [disabled]);

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
    <>
      <div className="grid grid-cols-2 gap-4">
        {/* Date Picker */}
        <div>
          <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Date</span>
          <button
            onClick={handleDatePickerToggle}
            disabled={disabled}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg border transition-all ${
              disabled
                ? 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-purple-500/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{selectedDate}</span>
          </button>
        </div>

        {/* Time Picker */}
        <div>
          <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Time</span>
          <button
            onClick={handleTimePickerToggle}
            disabled={disabled}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg border transition-all ${
              disabled
                ? 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-purple-500/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm">{selectedTime}</span>
          </button>
        </div>
      </div>

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
    </>
  );
});

DateTimePicker.displayName = 'DateTimePicker';

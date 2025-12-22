import { useState, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { DateTimePicker } from '@/components/common/DateTimePicker';

type Difficulty = 'Easy' | 'Moderate' | 'Difficult' | 'Hard' | 'Hell';

interface Subtask {
  id: string;
  title: string;
}

interface NewQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questData: {
    title: string;
    project: string;
    difficulty: Difficulty;
    date: string;
    time: string;
    subtasks: Subtask[];
  }) => void;
}

export const NewQuestModal = memo(({
  isOpen,
  onClose,
  onSubmit,
}: NewQuestModalProps) => {
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[now.getMonth()]} ${now.getDate()}`;
  });
  const [selectedTime, setSelectedTime] = useState<string>('--:--');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = useCallback(() => {
    if (!newSubtaskTitle.trim()) return;
    
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle.trim(),
    };
    
    setSubtasks(prev => [...prev, newSubtask]);
    setNewSubtaskTitle('');
  }, [newSubtaskTitle]);

  const handleRemoveSubtask = useCallback((subtaskId: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== subtaskId));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !project.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      project: project.trim(),
      difficulty,
      date: selectedDate,
      time: selectedTime,
      subtasks,
    });

    // Reset form
    setTitle('');
    setProject('');
    setDifficulty('Easy');
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    setSelectedDate(`${months[now.getMonth()]} ${now.getDate()}`);
    setSelectedTime('--:--');
    setSubtasks([]);
    setNewSubtaskTitle('');
    onClose();
  }, [title, project, difficulty, selectedDate, selectedTime, subtasks, onSubmit, onClose]);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleTimeChange = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  const difficultyOptions: Difficulty[] = ['Easy', 'Moderate', 'Difficult', 'Hard', 'Hell'];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-slate-900/95 backdrop-blur-md border-2 border-purple-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.6)] w-full max-w-2xl pointer-events-auto my-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/50 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-6 pr-10">
                <h2 
                  className="text-3xl font-bold text-white font-section tracking-wide mb-2"
                  style={{ textShadow: '0 0 15px rgba(168, 85, 247, 0.5)' }}
                >
                  CREATE NEW QUEST
                </h2>
                <p className="text-sm text-purple-400/80 font-medium">
                  Define your next challenge
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter quest title..."
                    className="w-full py-2 px-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                {/* Project */}
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">
                    Project
                  </label>
                  <input
                    type="text"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full py-2 px-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 focus:outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                  >
                    {difficultyOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div>
                  <DateTimePicker
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateChange={handleDateChange}
                    onTimeChange={handleTimeChange}
                  />
                </div>

                {/* Subtasks */}
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">
                    Subtasks
                  </label>
                  
                  {/* Subtask List */}
                  {subtasks.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {subtasks.map(subtask => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-2 p-2 bg-slate-800/30 border border-slate-700/50 rounded-lg group"
                        >
                          <span className="flex-1 text-sm text-slate-300">{subtask.title}</span>
                          <button
                            onClick={() => handleRemoveSubtask(subtask.id)}
                            className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Subtask Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      placeholder="Add a subtask..."
                      className="flex-1 py-2 px-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                    <button
                      onClick={handleAddSubtask}
                      className="p-2 rounded-lg bg-purple-600/20 border border-purple-500/50 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-4 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !project.trim()}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    !title.trim() || !project.trim()
                      ? 'bg-slate-800/50 border border-slate-700 text-slate-600 cursor-not-allowed'
                      : 'bg-purple-600/20 border border-purple-500/50 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                  }`}
                >
                  Create Quest
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
});

NewQuestModal.displayName = 'NewQuestModal';

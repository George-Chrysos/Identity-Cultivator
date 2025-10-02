import { useState } from 'react';
import { X, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useIdentityStore } from '@/store/identityStore';
import { toast } from '@/store/toastStore';

interface CreateIdentityModalProps {
  onClose: () => void;
}

const CreateIdentityModal = ({ onClose }: CreateIdentityModalProps) => {
  const { createIdentity, getActiveIdentities } = useIdentityStore();
  const activeIdentities = getActiveIdentities();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyTask: '',
    isActive: activeIdentities.length < 5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const maxActiveIdentities = 5;
  const canSetActive = activeIdentities.length < maxActiveIdentities;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Identity name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!formData.dailyTask.trim()) {
      newErrors.dailyTask = 'Daily task is required';
    } else if (formData.dailyTask.length < 5) {
      newErrors.dailyTask = 'Task description must be at least 5 characters';
    }
    
    if (formData.isActive && !canSetActive) {
      newErrors.isActive = `Maximum ${maxActiveIdentities} active identities allowed`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await createIdentity(
        formData.name.trim(),
        formData.description.trim(),
        formData.dailyTask.trim()
      );
      
      if (result.success) {
        toast.success(result.message);
        
        // If user wanted it active and we can activate it
        if (formData.isActive && canSetActive && result.identity) {
          const activateResult = await useIdentityStore.getState().activateIdentity(result.identity.id);
          if (activateResult.success) {
            toast.success('Identity activated!');
          } else {
            toast.warning(activateResult.message);
          }
        }
        
        onClose();
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-dark-card rounded-2xl shadow-violet-glow-lg border border-dark-border max-w-md w-full backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-900/30 rounded-xl">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Create New Identity</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Active identities warning */}
            {!canSetActive && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-xl"
              >
                <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-yellow-300 text-sm font-medium">
                    Maximum Active Identities Reached
                  </p>
                  <p className="text-yellow-400/80 text-xs">
                    You have {activeIdentities.length}/{maxActiveIdentities} active identities. 
                    Deactivate one to activate this new identity.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Identity Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Mindful Reader, Fitness Enthusiast"
                className={`w-full px-4 py-3 bg-dark-surface border rounded-xl focus:outline-none focus:ring-2 transition-all text-white placeholder-gray-500 ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-dark-border focus:ring-cyan-500 focus:border-cyan-500'
                }`}
                required
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1"
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this identity represents to you..."
                rows={3}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-gray-500 resize-none"
              />
            </div>

            {/* Daily Task */}
            <div>
              <label htmlFor="dailyTask" className="block text-sm font-medium text-gray-300 mb-2">
                Daily Task *
              </label>
              <input
                type="text"
                id="dailyTask"
                name="dailyTask"
                value={formData.dailyTask}
                onChange={handleChange}
                placeholder="e.g., Read for 20 minutes, Do 30 push-ups"
                className={`w-full px-4 py-3 bg-dark-surface border rounded-xl focus:outline-none focus:ring-2 transition-all text-white placeholder-gray-500 ${
                  errors.dailyTask 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-dark-border focus:ring-cyan-500 focus:border-cyan-500'
                }`}
                required
              />
              {errors.dailyTask && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1"
                >
                  {errors.dailyTask}
                </motion.p>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 bg-dark-surface/50 rounded-xl border border-dark-border">
              <div>
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                  Start as Active Identity
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Active identities appear on your dashboard ({activeIdentities.length}/{maxActiveIdentities} active)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer" aria-label="Toggle active status">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  disabled={!canSetActive && formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className={`relative w-11 h-6 rounded-full peer transition-all duration-200 ${
                  formData.isActive 
                    ? 'bg-cyan-600 shadow-glow' 
                    : 'bg-gray-700'
                } ${!canSetActive && formData.isActive ? 'opacity-50 cursor-not-allowed' : ''} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300/20`}>
                  <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 shadow transition-all duration-200 ${
                    formData.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>

            {errors.isActive && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs"
              >
                {errors.isActive}
              </motion.p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Create Identity
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateIdentityModal;

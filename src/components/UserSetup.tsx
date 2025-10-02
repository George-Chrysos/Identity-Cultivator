import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

interface UserSetupProps {
  onCreateUser: (name: string) => void;
  isLoading?: boolean;
}

const UserSetup = ({ onCreateUser, isLoading = false }: UserSetupProps) => {
  const [name, setName] = useState('Alpha Tester');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateUser(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-surface border border-dark-border rounded-xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, Cultivator
          </h1>
          <p className="text-gray-400">
            Begin your journey of self-improvement and growth
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <User className="h-4 w-4" />
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your cultivator name"
              className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              disabled={isLoading}
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !name.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-violet-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating your profile...
              </div>
            ) : (
              'Begin Cultivation'
            )}
          </motion.button>
        </form>

        <div className="mt-6 pt-6 border-t border-dark-border">
          <p className="text-xs text-gray-500 text-center">
            Alpha Version - Your data will be preserved when Google login is added
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UserSetup;

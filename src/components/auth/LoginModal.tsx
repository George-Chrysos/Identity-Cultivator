import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import GoogleAuth from './GoogleAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuthStore();

  // Close modal when auth state becomes authenticated
  useEffect(() => {
    if (currentUser) onClose();
  }, [currentUser, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-center mb-6 relative">
          <h2 className="text-2xl font-bold text-white font-accent">Sign In</h2>
          <button
            onClick={onClose}
            className="absolute right-0 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-300 text-base leading-relaxed font-body">
              Sign in with your Google account to start your cultivation journey
            </p>
          </div>

          <div className="flex justify-center">
            <GoogleAuth
              onSignInStart={() => {
                setError(null);
              }}
              onSignInEnd={(errMsg) => {
                if (errMsg) setError(errMsg);
              }}
            />
          </div>

          {error && (
            <div className="bg-red-600/80 text-white px-4 py-3 rounded-md text-center">
              <strong className="block font-semibold">Login failed</strong>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;

import { useEffect, useState, memo } from 'react';
import { useAuthStore } from '@/store/authStore';
import GoogleAuth from './GoogleAuth';
import { BaseModal } from '@/components/common';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = memo(({ isOpen, onClose }: LoginModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuthStore();

  // Close modal when auth state becomes authenticated
  useEffect(() => {
    if (currentUser) onClose();
  }, [currentUser, onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign In"
      maxWidth="md"
    >
      <div className="p-6 space-y-6">
        <div className="text-center">
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
    </BaseModal>
  );
});

LoginModal.displayName = 'LoginModal';

export default LoginModal;

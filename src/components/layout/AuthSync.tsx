import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useIdentityStore } from '@/store/identityStore';

/**
 * Keeps the identity store's userId (and its remote hydration) in lockstep
 * with the auth store. Mounted once at the app root.
 */
const AuthSync = () => {
  const currentUserId = useAuthStore((s) => s.currentUser?.id ?? null);
  const setUserId = useIdentityStore((s) => s.setUserId);

  useEffect(() => {
    setUserId(currentUserId ?? null);
  }, [currentUserId, setUserId]);

  return null;
};

export default AuthSync;

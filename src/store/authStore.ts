import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithGoogle, signOut as supabaseSignOut, getCurrentUser, onAuthStateChange } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { storage } from '@/services/storageService';
import { STORE_KEYS } from '@/constants/storage';

// Localhost bypass for testing
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

interface AuthUser {
  id?: string;  // Supabase auth user ID
  name?: string;
  email?: string;
}

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  
  // Actions
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: IS_LOCALHOST ? { name: 'Test User', email: 'test@localhost.dev' } : null,
      isAuthenticated: IS_LOCALHOST,

      login: async () => {
        // Auto-login on localhost
        if (IS_LOCALHOST) {
          set({ currentUser: { name: 'Test User', email: 'test@localhost.dev' }, isAuthenticated: true });
          return true;
        }

        try {
          const { error } = await signInWithGoogle();
          if (error) {
            logger.error('Supabase sign-in error', error);
            return false;
          }
          // signInWithGoogle triggers a redirect; return true if call succeeded
          return true;
        } catch (err) {
          logger.error('Login error', err);
          return false;
        }
      },

      logout: async () => {
        // Skip logout on localhost (for testing)
        if (IS_LOCALHOST) {
          logger.info('Logout disabled on localhost for testing');
          return;
        }

        try {
          await supabaseSignOut();
        } catch (err) {
          logger.error('Sign out error', err);
        }
        set({ currentUser: null, isAuthenticated: false });
        // Clear storage to reset cultivator data
        storage.remove(STORE_KEYS.CULTIVATOR);
      },

      setUser: (user: AuthUser | null) => set({ currentUser: user, isAuthenticated: Boolean(user) }),
    }),
    {
      name: STORE_KEYS.AUTH,
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state from Supabase if available (skip on localhost)
if (!IS_LOCALHOST) {
  getCurrentUser().then(({ user }) => {
    if (user) {
      useAuthStore.setState({ 
        currentUser: { 
          id: user.id,  // Include user ID
          name: user.user_metadata?.full_name || user.email, 
          email: user.email 
        }, 
        isAuthenticated: true 
      });
    }
  });

  // Listen for auth state changes (keeps store in sync)
  onAuthStateChange((authUser) => {
    if (authUser) {
      useAuthStore.setState({ 
        currentUser: { 
          id: authUser.id,  // Include user ID
          name: authUser.user_metadata?.full_name || authUser.email, 
          email: authUser.email 
        }, 
        isAuthenticated: true 
      });
    } else {
      useAuthStore.setState({ currentUser: null, isAuthenticated: false });
    }
  });
}

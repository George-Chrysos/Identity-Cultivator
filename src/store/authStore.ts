import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithGoogle, signOut as supabaseSignOut, getCurrentUser, onAuthStateChange } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { storage } from '@/services/storageService';
import { STORE_KEYS } from '@/constants/storage';
import { 
  isLocalAuthEnabled, 
  getLocalUser, 
  signInWithDemoUser, 
  signOutLocalUser,
} from '@/services/localAuthService';

interface AuthUser {
  id?: string;  // Supabase auth user ID
  name?: string;
  email?: string;
  avatar_url?: string;
}

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLocalAuth: boolean;
  
  // Actions
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

// Initialize with local auth if enabled
const getInitialState = () => {
  if (isLocalAuthEnabled()) {
    const localUser = getLocalUser();
    if (localUser) {
      return {
        currentUser: { 
          id: localUser.id, 
          name: localUser.name, 
          email: localUser.email,
          avatar_url: localUser.avatar_url 
        },
        isAuthenticated: true,
        isLocalAuth: true,
      };
    }
  }
  return {
    currentUser: null,
    isAuthenticated: false,
    isLocalAuth: false,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...getInitialState(),

      login: async () => {
        // Use local auth in dev mode
        if (isLocalAuthEnabled()) {
          const demoUser = signInWithDemoUser();
          set({ 
            currentUser: { 
              id: demoUser.id, 
              name: demoUser.name, 
              email: demoUser.email,
              avatar_url: demoUser.avatar_url 
            }, 
            isAuthenticated: true,
            isLocalAuth: true,
          });
          logger.info('Signed in with demo user', { email: demoUser.email });
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
        // Handle local auth logout
        if (isLocalAuthEnabled()) {
          signOutLocalUser();
          set({ currentUser: null, isAuthenticated: false, isLocalAuth: false });
          storage.remove(STORE_KEYS.GAME);
          logger.info('Signed out demo user');
          return;
        }

        try {
          await supabaseSignOut();
        } catch (err) {
          logger.error('Sign out error', err);
        }
        set({ currentUser: null, isAuthenticated: false, isLocalAuth: false });
        // Clear storage to reset cultivator data
        storage.remove(STORE_KEYS.GAME);
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

// Initialize auth state from Supabase if not using local auth
if (!isLocalAuthEnabled()) {
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

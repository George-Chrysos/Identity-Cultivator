import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  signInWithGoogle,
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
} from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { STORE_KEYS } from '@/constants/storage';
import {
  isLocalAuthEnabled,
  getLocalUser,
  signInWithDemoUser,
  signOutLocalUser,
} from '@/services/localAuthService';
import { useIdentityStore } from './identityStore';

interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLocalAuth: boolean;

  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const getInitialState = () => {
  if (isLocalAuthEnabled()) {
    const localUser = getLocalUser();
    if (localUser) {
      return {
        currentUser: {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          avatar_url: localUser.avatar_url,
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

// Clears any identity-scoped state on logout.
const clearIdentityState = () => {
  try {
    useIdentityStore.getState().clearAll();
  } catch (error) {
    logger.error('Error clearing identity store on logout', error);
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...getInitialState(),

      login: async () => {
        if (isLocalAuthEnabled()) {
          const demoUser = signInWithDemoUser();
          set({
            currentUser: {
              id: demoUser.id,
              name: demoUser.name,
              email: demoUser.email,
              avatar_url: demoUser.avatar_url,
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
          return true;
        } catch (err) {
          logger.error('Login error', err);
          return false;
        }
      },

      logout: async () => {
        if (isLocalAuthEnabled()) {
          signOutLocalUser();
          set({ currentUser: null, isAuthenticated: false, isLocalAuth: false });
          clearIdentityState();
          if (typeof window !== 'undefined') window.location.href = '/';
          return;
        }

        try {
          await supabaseSignOut();
        } catch (err) {
          logger.error('Sign out error', err);
        }
        set({ currentUser: null, isAuthenticated: false, isLocalAuth: false });
        clearIdentityState();
        if (typeof window !== 'undefined') window.location.href = '/';
      },

      setUser: (user) => set({ currentUser: user, isAuthenticated: Boolean(user) }),
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

// Hydrate from Supabase if we aren't in local-auth mode.
if (!isLocalAuthEnabled()) {
  try {
    getCurrentUser()
      .then(({ user }) => {
        if (user) {
          useAuthStore.setState({
            currentUser: {
              id: user.id,
              name: user.user_metadata?.full_name || user.email,
              email: user.email,
            },
            isAuthenticated: true,
          });
        }
      })
      .catch((error) => logger.error('Failed to get current user', error));

    onAuthStateChange((authUser) => {
      if (authUser) {
        useAuthStore.setState({
          currentUser: {
            id: authUser.id,
            name: authUser.user_metadata?.full_name || authUser.email,
            email: authUser.email,
          },
          isAuthenticated: true,
        });
      } else {
        useAuthStore.setState({ currentUser: null, isAuthenticated: false });
      }
    });
  } catch (error) {
    logger.error('Failed to initialize auth state', error);
  }
}

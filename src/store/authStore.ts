import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithGoogle, signOut as supabaseSignOut, getCurrentUser, onAuthStateChange } from '@/lib/supabase';

// Localhost bypass for testing
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

interface AuthUser {
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
            console.error('Supabase sign-in error', error);
            return false;
          }
          // signInWithGoogle triggers a redirect; return true if call succeeded
          return true;
        } catch (err) {
          console.error('Login error', err);
          return false;
        }
      },

      logout: async () => {
        // Skip logout on localhost (for testing)
        if (IS_LOCALHOST) {
          console.log('Logout disabled on localhost for testing');
          return;
        }

        try {
          await supabaseSignOut();
        } catch (err) {
          console.error('Sign out error', err);
        }
        set({ currentUser: null, isAuthenticated: false });
        // Clear localStorage to reset cultivator data
        localStorage.removeItem('cultivator-store');
      },

      setUser: (user: AuthUser | null) => set({ currentUser: user, isAuthenticated: Boolean(user) }),
    }),
    {
      name: 'auth-store',
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
      useAuthStore.setState({ currentUser: { name: user.user_metadata?.full_name || user.email, email: user.email }, isAuthenticated: true });
    }
  });

  // Listen for auth state changes (keeps store in sync)
  onAuthStateChange((authUser) => {
    if (authUser) {
      useAuthStore.setState({ currentUser: { name: authUser.user_metadata?.full_name || authUser.email, email: authUser.email }, isAuthenticated: true });
    } else {
      useAuthStore.setState({ currentUser: null, isAuthenticated: false });
    }
  });
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCultivatorStore } from '@/store/cultivatorStore';

interface AuthUser {
  username: string;
  name: string;
}

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Default demo user
const DEMO_USER = {
  username: 'joji32',
  password: 'demo',
  name: 'Magician'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        // Simple demo authentication
        if (username === DEMO_USER.username && password === DEMO_USER.password) {
          const user = { username: DEMO_USER.username, name: DEMO_USER.name };
          set({ currentUser: user, isAuthenticated: true });

          // Sync cultivator store user name if already initialized with a different name
          const cultivatorState = useCultivatorStore.getState();
          if (cultivatorState.currentUser && cultivatorState.currentUser.name !== user.name) {
            useCultivatorStore.setState({
              currentUser: { ...cultivatorState.currentUser, name: user.name }
            });
          }
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
        
        // Clear localStorage to reset cultivator data
        localStorage.removeItem('cultivator-store');
      },
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

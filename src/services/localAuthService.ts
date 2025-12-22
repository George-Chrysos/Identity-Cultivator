import { logger } from '@/utils/logger';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

// Demo users for local development
const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-user-001',
    email: 'demo@cultivator.local',
    name: 'Demo Cultivator',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoCultivator',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-user-002',
    email: 'tester@cultivator.local',
    name: 'Test Master',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestMaster',
    created_at: new Date().toISOString(),
  },
];

const LOCAL_AUTH_KEY = 'local-auth-user';
const LOCAL_AUTH_ENABLED_KEY = 'local-auth-enabled';

/**
 * Check if we're in development mode
 */
export const isDevMode = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * Check if local auth is enabled
 */
export const isLocalAuthEnabled = (): boolean => {
  if (!isDevMode()) return false;
  const enabled = localStorage.getItem(LOCAL_AUTH_ENABLED_KEY);
  return enabled === 'true' || enabled === null; // Default to enabled in dev
};

/**
 * Enable/disable local auth
 */
export const setLocalAuthEnabled = (enabled: boolean): void => {
  localStorage.setItem(LOCAL_AUTH_ENABLED_KEY, String(enabled));
  logger.info('Local auth ' + (enabled ? 'enabled' : 'disabled'));
};

/**
 * Get current local user
 */
export const getLocalUser = (): DemoUser | null => {
  if (!isLocalAuthEnabled()) return null;
  
  const userJson = localStorage.getItem(LOCAL_AUTH_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as DemoUser;
  } catch (error) {
    logger.error('Failed to parse local user', error);
    return null;
  }
};

/**
 * Sign in with demo user
 */
export const signInWithDemoUser = (userIndex: number = 0): DemoUser => {
  const user = DEMO_USERS[userIndex] || DEMO_USERS[0];
  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
  logger.info('Signed in with demo user', { email: user.email });
  return user;
};

/**
 * Sign out local user
 */
export const signOutLocalUser = (): void => {
  localStorage.removeItem(LOCAL_AUTH_KEY);
  logger.info('Signed out local user');
};

/**
 * Get all demo users (for selection UI)
 */
export const getDemoUsers = (): DemoUser[] => {
  return DEMO_USERS;
};

/**
 * Convert DemoUser to Supabase-like user format
 */
export const demoUserToSupabaseUser = (demoUser: DemoUser) => {
  return {
    id: demoUser.id,
    email: demoUser.email,
    user_metadata: {
      full_name: demoUser.name,
      avatar_url: demoUser.avatar_url,
      email: demoUser.email,
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: demoUser.created_at,
    role: 'authenticated',
  };
};

/**
 * Check if user is a demo user
 */
export const isDemoUser = (userId: string): boolean => {
  return userId.startsWith('demo-user-');
};

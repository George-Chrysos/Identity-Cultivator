import { createClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Track if Supabase is configured
const _isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

if (!_isConfigured) {
  console.warn('Supabase credentials not configured. Using local storage mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (!_isConfigured) {
    console.log('🔧 Using Mock Database (Local Storage Mode)');
  }
  
  return _isConfigured;
};

// Auth helpers - these are safe to call even when Supabase isn't configured
export const signInWithGoogle = async () => {
  if (!_isConfigured) {
    console.warn('Supabase not configured, Google sign-in unavailable');
    return { data: null, error: new Error('Supabase not configured') };
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
      }
    }
  });
  return { data, error };
};

export const signOut = async () => {
  if (!_isConfigured) {
    return { error: null };
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!_isConfigured) {
    return { user: null, error: null };
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (err) {
    console.error('Error getting current user:', err);
    return { user: null, error: err };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!_isConfigured) {
    // Return a no-op subscription
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
};

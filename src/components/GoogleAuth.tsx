import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { signInWithGoogle, signOut, onAuthStateChange } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { LogOut, Loader2 } from 'lucide-react';

interface GoogleAuthProps {
  onAuthChange?: (user: User | null) => void;
}

const GoogleAuth = ({ onAuthChange }: GoogleAuthProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const { data: authListener } = onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
      onAuthChange?.(authUser);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onAuthChange]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Sign in error:', error);
        alert(`Login failed: ${error.message}`);
      }
      // Note: The actual sign-in happens via redirect, so we don't need to handle success here
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-cyan-200">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata?.full_name || 'User'}
              className="w-8 h-8 rounded-full border-2 border-cyan-400/50"
            />
          )}
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold text-white">
              {user.user_metadata?.full_name || user.email}
            </span>
            <span className="text-xs text-cyan-200/70">Cultivator</span>
          </div>
        </div>
        <motion.button
          onClick={handleSignOut}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-200 text-sm font-semibold transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleSignIn}
      disabled={signingIn}
      whileHover={!signingIn ? { scale: 1.05 } : {}}
      whileTap={!signingIn ? { scale: 0.95 } : {}}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-semibold transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {signingIn ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Sign in with Google</span>
        </>
      )}
    </motion.button>
  );
};

export default GoogleAuth;

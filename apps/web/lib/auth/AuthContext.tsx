'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile, AuthState, AuthActions } from '@/types/auth';

/**
 * Authentication Context
 *
 * This context provides authentication state and actions to all components
 * wrapped in the AuthProvider component.
 */
interface AuthContextType {
  state: AuthState;
  actions: AuthActions;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 *
 * Provides authentication context to child components.
 * Manages user authentication state and provides auth actions.
 *
 * Usage:
 * ```tsx
 * import { AuthProvider } from '@/lib/auth/AuthContext';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <AuthProvider>
 *       {children}
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = createClient();

  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  /**
   * Fetch user profile from database
   */
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    // Get current session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState((prev) => ({ ...prev, profile }));
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState((prev) => ({ ...prev, profile }));
      } else {
        setState((prev) => ({ ...prev, profile: null }));
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        setState((prev) => ({ ...prev, profile }));
      }

      return {};
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: 'An unexpected error occurred' };
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      console.error('Sign up error:', err);
      return { error: 'An unexpected error occurred' };
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setState({
        user: null,
        session: null,
        profile: null,
        loading: false,
      });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  /**
   * Sign in with OAuth provider
   */
  const signInWithOAuth = async (provider: 'github' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('OAuth sign in error:', error);
      }
    } catch (err) {
      console.error('OAuth sign in error:', err);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      console.error('Reset password error:', err);
      return { error: 'An unexpected error occurred' };
    }
  };

  /**
   * Update password
   */
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      console.error('Update password error:', err);
      return { error: 'An unexpected error occurred' };
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!state.user) {
        return { error: 'User not authenticated' };
      }

      // Update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
        },
      });

      if (updateError) {
        return { error: updateError.message };
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.user.id);

      if (profileError) {
        return { error: profileError.message };
      }

      // Refresh profile
      const profile = await fetchProfile(state.user.id);
      setState((prev) => ({ ...prev, profile }));

      return {};
    } catch (err) {
      console.error('Update profile error:', err);
      return { error: 'An unexpected error occurred' };
    }
  };

  /**
   * Auth actions
   */
  const actions: AuthActions = {
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    updateProfile,
  };

  const value: AuthContextType = {
    state,
    actions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 *
 * Hook to access authentication context.
 *
 * Usage:
 * ```tsx
 * import { useAuth } from '@/lib/auth/AuthContext';
 *
 * export default function MyComponent() {
 *   const { state, actions } = useAuth();
 *   const { user, loading } = state;
 *   const { signIn, signOut } = actions;
 *   // ...
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * useUser Hook
 *
 * Hook to access the current user.
 */
export function useUser() {
  const { state } = useAuth();
  return state.user;
}

/**
 * useSession Hook
 *
 * Hook to access the current session.
 */
export function useSession() {
  const { state } = useAuth();
  return state.session;
}

/**
 * useProfile Hook
 *
 * Hook to access the user profile.
 */
export function useProfile() {
  const { state } = useAuth();
  return state.profile;
}

/**
 * useAuthLoading Hook
 *
 * Hook to check if auth is loading.
 */
export function useAuthLoading() {
  const { state } = useAuth();
  return state.loading;
}

/**
 * useIsAuthenticated Hook
 *
 * Hook to check if user is authenticated.
 */
export function useIsAuthenticated() {
  const { state } = useAuth();
  return !!state.user && !state.loading;
}

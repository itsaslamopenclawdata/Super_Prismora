/**
 * Authentication Types
 *
 * TypeScript types for authentication and user management.
 */

import { User, Session } from '@supabase/supabase-js';

/**
 * Extended user profile with additional metadata
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  stripe_customer_id?: string;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Authentication context state
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

/**
 * Authentication context actions
 */
export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'github' | 'google') => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
}

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * Registration form data
 */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  agreeToTerms?: boolean;
}

/**
 * Password reset form data
 */
export interface PasswordResetFormData {
  email: string;
}

/**
 * Update password form data
 */
export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

/**
 * Subscription plan details
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

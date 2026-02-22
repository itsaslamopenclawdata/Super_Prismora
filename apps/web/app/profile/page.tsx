'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@super-prismora/ui';
import { Input } from '@super-prismora/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@super-prismora/ui';
import { Alert } from '@super-prismora/ui';
import { Badge } from '@super-prismora/ui';
import { StatCard } from '@super-prismora/ui';
import { Avatar } from '@super-prismora/ui';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/auth';

/**
 * User Profile Page
 *
 * This page allows users to:
 * - View their profile information
 * - Edit their profile details
 * - See their subscription status
 * - View their usage statistics
 */
export default function ProfilePage() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
  });

  /**
   * Fetch user data on mount
   */
  useEffect(() => {
    fetchUserData();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Fetch user data
   */
  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to view your profile');
        return;
      }

      setUser(user);
      await fetchProfile(user.id);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch user profile
   */
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Profile might not exist yet
        return;
      }

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  /**
   * Handle profile update
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
        },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Update profile in database
      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            avatar_url: formData.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) {
          setError(profileError.message);
          return;
        }
      }

      setSuccess(true);
      await fetchProfile(user.id);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to sign out');
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="default" padding="lg" className="max-w-md">
          <Alert variant="error">You must be logged in to view your profile</Alert>
          <div className="mt-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => (window.location.href = '/login')}
            >
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and view your statistics
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert variant="success" className="mb-6">
            Profile updated successfully!
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-2">
            <Card variant="default" padding="lg">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      {formData.avatar_url ? (
                        <img
                          src={formData.avatar_url}
                          alt="Avatar"
                          className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                          {formData.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {formData.full_name || 'Add your name'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      disabled={saving}
                    />

                    <Input
                      label="Avatar URL"
                      type="url"
                      name="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                      disabled={saving}
                      helperText="Enter a URL for your profile picture"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button type="submit" variant="primary" loading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Subscription and Stats */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card variant="default" padding="lg">
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
                      <Badge variant="primary" size="lg">
                        {profile.subscription_tier?.toUpperCase() || 'FREE'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <Badge
                        variant={
                          profile.subscription_status === 'active' ? 'success' :
                          profile.subscription_status === 'trialing' ? 'info' :
                          'warning'
                        }
                      >
                        {profile.subscription_status?.toUpperCase() || 'ACTIVE'}
                      </Badge>
                    </div>
                    {profile.subscription_tier !== 'pro' && (
                      <Button variant="primary" className="w-full mt-4">
                        Upgrade to Pro
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card variant="default" padding="lg">
              <CardHeader>
                <CardTitle>Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <StatCard
                    variant="primary"
                    title="Identifications"
                    value={profile.usage_count || 0}
                    change="0"
                  />
                )}
                {profile?.subscription_tier === 'free' && (
                  <p className="text-sm text-gray-500">
                    Free tier: Unlimited identifications
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card variant="default" padding="lg">
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full" onClick={() => (window.location.href = '/settings')}>
                  Settings
                </Button>
                <Button variant="danger" className="w-full" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

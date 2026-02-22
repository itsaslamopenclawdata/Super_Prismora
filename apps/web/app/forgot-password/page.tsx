'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@super-prismora/ui';
import { Input } from '@super-prismora/ui';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@super-prismora/ui';
import { Alert } from '@super-prismora/ui';
import type { PasswordResetFormData } from '@/types/auth';

/**
 * Forgot Password Page
 *
 * This page allows users to request a password reset email.
 */
export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [formData, setFormData] = useState<PasswordResetFormData>({
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Forgot Password?</CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Enter your email and we'll send you a reset link
            </p>
          </CardHeader>

          <CardContent>
            {/* Error Alert */}
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert variant="success" className="mb-4">
                <p className="font-semibold">Check your email</p>
                <p className="text-sm mt-1">
                  We've sent a password reset link to <strong>{formData.email}</strong>
                </p>
              </Alert>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="text-center space-y-2">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Back to Sign In
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

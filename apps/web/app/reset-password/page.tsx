'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@super-prismora/ui';
import { Input } from '@super-prismora/ui';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@super-prismora/ui';
import { Alert } from '@super-prismora/ui';
import type { UpdatePasswordFormData } from '@/types/auth';

/**
 * Reset Password Page
 *
 * This page allows users to reset their password after clicking the reset link from their email.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<UpdatePasswordFormData>({
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Check if user has a valid session (from password reset link)
   */
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    checkSession();
  }, [supabase]);

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  /**
   * Validate form data
   */
  const validateForm = (): string | null => {
    if (!formData.password) {
      return 'Password is required';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);

      // Redirect to login after successful password reset
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Enter your new password below
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
                <p className="font-semibold">Password reset successful!</p>
                <p className="text-sm mt-1">Redirecting to login...</p>
              </Alert>
            )}

            {!error && !success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="New Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    helperText="Must be at least 8 characters"
                  />
                </div>

                <div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  Update Password
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

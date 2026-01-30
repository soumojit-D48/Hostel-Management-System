'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isLoading, error, clearError } = useAuth();

  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!token) {
      alert('Invalid reset token');
      return;
    }

    try {
      await resetPassword(token, formData.newPassword);
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-error-50 border border-error-200 text-error-700 px-6 py-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Invalid Link</h2>
            <p className="mb-6">This password reset link is invalid or has expired.</p>
            <Link
              href="/forgot-password"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-success-50 border border-success-200 text-success-700 px-6 py-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Password Reset Successful!</h2>
            <p className="mb-6">Your password has been reset. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Enter your new password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="New password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
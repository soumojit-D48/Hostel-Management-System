'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await forgotPassword(email);
      setShowSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-success-50 border border-success-200 text-success-700 px-6 py-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Email Sent!</h2>
            <p className="mb-6">
              If an account with email <strong>{email}</strong> exists, you will receive a password reset link shortly.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Back to Login
            </Link>
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
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="student@hostel.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
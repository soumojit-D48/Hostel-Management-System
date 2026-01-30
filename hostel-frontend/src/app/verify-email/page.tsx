'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully!');
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.message || 'Verification failed');
      });
  }, [searchParams, verifyEmail]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (status === 'success' && countdown === 0) {
      router.push('/login');
    }
  }, [status, countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-success-50 border border-success-200 text-success-700 px-6 py-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Email Verified!</h2>
            <p className="mb-4">{message}</p>
            <p className="text-sm mb-6">
              Redirecting to login in {countdown} seconds...
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Go to Login Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-6 py-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Verification Failed</h2>
            <p className="mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
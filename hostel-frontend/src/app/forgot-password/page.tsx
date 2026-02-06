// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useAuth } from '@/hooks/use-auth';

// export default function ForgotPasswordPage() {
//   const { forgotPassword, isLoading, error, clearError } = useAuth();
//   const [email, setEmail] = useState('');
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       await forgotPassword(email);
//       setShowSuccess(true);
//     } catch (error) {
//       console.error('Forgot password error:', error);
//     }
//   };

//   if (showSuccess) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
//         <div className="max-w-md w-full space-y-8">
//           <div className="bg-success-50 border border-success-200 text-success-700 px-6 py-8 rounded-lg text-center">
//             <h2 className="text-2xl font-bold mb-4">Email Sent!</h2>
//             <p className="mb-6">
//               If an account with email <strong>{email}</strong> exists, you will receive a password reset link shortly.
//             </p>
//             <Link
//               href="/login"
//               className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
//             >
//               Back to Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
//             Forgot Password
//           </h2>
//           <p className="mt-2 text-center text-sm text-neutral-600">
//             Enter your email to receive a password reset link
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
//               {error}
//             </div>
//           )}

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
//               Email address
//             </label>
//             <input
//               id="email"
//               name="email"
//               type="email"
//               autoComplete="email"
//               required
//               value={email}
//               onChange={(e) => {
//                 setEmail(e.target.value);
//                 clearError();
//               }}
//               className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//               placeholder="student@hostel.com"
//             />
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Sending...' : 'Send Reset Link'}
//             </button>
//           </div>

//           <div className="text-center">
//             <Link href="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
//               Back to Login
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }









'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas/auth.schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuthStore();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email);
      setEmailSent(true);
      toast.success('Reset link sent!', {
        description: 'Please check your email for password reset instructions.',
      });
    } catch (error: any) {
      toast.error('Request failed', {
        description: error.message || 'Please try again.',
      });
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
        <div className="w-full max-w-md">
          <div className="card text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-950">
                <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400" />
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Check Your Email
            </h1>
            <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
              We've sent password reset instructions to{' '}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {getValues('email')}
              </span>
            </p>

            <div className="space-y-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <Button
                onClick={() => setEmailSent(false)}
                className="btn-outline w-full"
              >
                Try Another Email
              </Button>

              <Link href="/login" className="block">
                <Button className="btn-ghost w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Forgot Password?
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
                disabled={isLoading}
                autoFocus
              />
              {errors.email && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
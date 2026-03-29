// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { useAuth } from '@/hooks/use-auth';

// export default function ResetPasswordPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { resetPassword, isLoading, error, clearError } = useAuth();

//   const [token, setToken] = useState('');
//   const [formData, setFormData] = useState({
//     newPassword: '',
//     confirmPassword: '',
//   });
//   const [showSuccess, setShowSuccess] = useState(false);

//   useEffect(() => {
//     const resetToken = searchParams.get('token');
//     if (resetToken) {
//       setToken(resetToken);
//     }
//   }, [searchParams]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     clearError();
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (formData.newPassword !== formData.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }

//     if (!token) {
//       alert('Invalid reset token');
//       return;
//     }

//     try {
//       await resetPassword(token, formData.newPassword);
//       setShowSuccess(true);
//       setTimeout(() => {
//         router.push('/login');
//       }, 3000);
//     } catch (error) {
//       console.error('Reset password error:', error);
//     }
//   };

//   if (!token) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
//         <div className="max-w-md w-full space-y-8">
//           <div className="bg-error-50 border border-error-200 text-error-700 px-6 py-8 rounded-lg text-center">
//             <h2 className="text-2xl font-bold mb-4">Invalid Link</h2>
//             <p className="mb-6">This password reset link is invalid or has expired.</p>
//             <Link
//               href="/forgot-password"
//               className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
//             >
//               Request New Link
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (showSuccess) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
//         <div className="max-w-md w-full space-y-8">
//           <div className="bg-success-50 border border-success-200 text-success-700 px-6 py-8 rounded-lg text-center">
//             <h2 className="text-2xl font-bold mb-4">Password Reset Successful!</h2>
//             <p className="mb-6">Your password has been reset. Redirecting to login...</p>
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
//             Reset Password
//           </h2>
//           <p className="mt-2 text-center text-sm text-neutral-600">
//             Enter your new password
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
//               {error}
//             </div>
//           )}

//           <div className="space-y-4">
//             <div>
//               <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700">
//                 New Password
//               </label>
//               <input
//                 id="newPassword"
//                 name="newPassword"
//                 type="password"
//                 required
//                 value={formData.newPassword}
//                 onChange={handleChange}
//                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//                 placeholder="New password"
//               />
//             </div>

//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
//                 Confirm Password
//               </label>
//               <input
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type="password"
//                 required
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//                 placeholder="Confirm password"
//               />
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Resetting...' : 'Reset Password'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }










'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/auth.schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (token) {
      setValue('token', token);
    } else {
      toast.error('Invalid reset link', {
        description: 'Please request a new password reset link.',
      });
      router.push('/forgot-password');
    }
  }, [token, setValue, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(data.token, data.newPassword);
      setResetSuccess(true);
      toast.success('Password reset successful!', {
        description: 'You can now sign in with your new password.',
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      toast.error('Reset failed', {
        description: error.message || 'The reset link may be invalid or expired.',
      });
    }
  };

  if (resetSuccess) {
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
              Password Reset Complete!
            </h1>
            <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
              Your password has been successfully reset. Redirecting you to login...
            </p>

            <Link href="/login">
              <Button className="btn-primary w-full">
                Go to Login
              </Button>
            </Link>
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
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden token field */}
            <input type="hidden" {...register('token')} />

            {/* New Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  {...register('newPassword')}
                  aria-invalid={!!errors.newPassword}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  {...register('confirmPassword')}
                  aria-invalid={!!errors.confirmPassword}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
              <p className="mb-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Password must contain:
              </p>
              <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One number</li>
                <li>• One special character</li>
              </ul>
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
                  Resetting password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuth } from '@/hooks/use-auth';

// export default function LoginPage() {
//   const router = useRouter();
//   const { login, isLoading, error, clearError } = useAuth();

//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     rememberMe: false,
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//     clearError();
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       await login({
//         email: formData.email,
//         password: formData.password,
//         rememberMe: formData.rememberMe,
//       });

//       // Redirect to dashboard on success
//       router.push('/dashboard');
//     } catch (error) {
//       // Error is handled by the store
//       console.error('Login error:', error);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
//             Smart Hostel Management
//           </h2>
//           <p className="mt-2 text-center text-sm text-neutral-600">
//             Sign in to your account
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
//               {error}
//             </div>
//           )}

//           <div className="rounded-md shadow-sm space-y-4">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
//                 Email address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
//                 placeholder="student@hostel.com"
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="rememberMe"
//                 name="rememberMe"
//                 type="checkbox"
//                 checked={formData.rememberMe}
//                 onChange={handleChange}
//                 className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
//               />
//               <label htmlFor="rememberMe" className="ml-2 block text-sm text-neutral-900">
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
//                 Forgot password?
//               </Link>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </div>

//           <div className="text-center">
//             <span className="text-sm text-neutral-600">
//               Don't have an account?{' '}
//               <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
//                 Register here
//               </Link>
//             </span>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }









'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('Welcome back!', {
        description: 'You have successfully logged in.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Please check your credentials and try again.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600">
                <span className="text-2xl font-bold text-white">SH</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Sign in to your account to continue
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
              />
              {errors.email && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
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
              {errors.password && (
                <p className="text-xs text-error-600 dark:text-error-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Forgot password?
              </Link>
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
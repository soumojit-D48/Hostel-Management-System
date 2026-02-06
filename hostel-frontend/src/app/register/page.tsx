// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuth } from '@/hooks/use-auth';
// import { useHostels, useHostelBlocks } from '@/hooks/queries/use-hostels';

// export default function RegisterPage() {
//   const router = useRouter();
//   const { register, isLoading, error, clearError } = useAuth();
//   const { data: hostels, isLoading: hostelsLoading } = useHostels();

//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//     name: '',
//     rollNumber: '',
//     phone: '',
//     emergencyContact: '',
//     hostelId: '',
//     blockId: '',
//     roomNumber: '',
//   });

//   const { data: blocks, isLoading: blocksLoading } = useHostelBlocks(formData.hostelId);

//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;

//     // Reset blockId when hostel changes
//     if (name === 'hostelId') {
//       setFormData(prev => ({ ...prev, [name]: value, blockId: '' }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }

//     clearError();
//   };

//   const nextStep = () => {
//     setStep(prev => Math.min(prev + 1, 3));
//   };

//   const prevStep = () => {
//     setStep(prev => Math.max(prev - 1, 1));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }

//     try {
//       await register({
//         email: formData.email,
//         password: formData.password,
//         name: formData.name,
//         rollNumber: formData.rollNumber,
//         phone: formData.phone,
//         emergencyContact: formData.emergencyContact,
//         hostelId: formData.hostelId,
//         blockId: formData.blockId,
//         roomNumber: formData.roomNumber,
//       });

//       setShowSuccess(true);
//     } catch (error) {
//       console.error('Registration error:', error);
//     }
//   };

//   if (showSuccess) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
//         <div className="max-w-md w-full space-y-8 text-center">
//           <div className="bg-success-50 border border-success-200 text-success-700 px-6 py-8 rounded-lg">
//             <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
//             <p className="mb-6">
//               Please check your email ({formData.email}) to verify your account.
//             </p>
//             <Link
//               href="/login"
//               className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
//             >
//               Go to Login
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
//             Create your account
//           </h2>
//           <p className="mt-2 text-center text-sm text-neutral-600">
//             Step {step} of 3
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
//               {error}
//             </div>
//           )}

//           {/* Step 1: Basic Info */}
//           {step === 1 && (
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
//                   Email address *
//                 </label>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
//                   Password *
//                 </label>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
//                   Confirm Password *
//                 </label>
//                 <input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type="password"
//                   required
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
//                   Full Name *
//                 </label>
//                 <input
//                   id="name"
//                   name="name"
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={nextStep}
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//               >
//                 Next
//               </button>
//             </div>
//           )}

//           {/* Step 2: Student Details */}
//           {step === 2 && (
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="rollNumber" className="block text-sm font-medium text-neutral-700">
//                   Roll Number *
//                 </label>
//                 <input
//                   id="rollNumber"
//                   name="rollNumber"
//                   type="text"
//                   required
//                   value={formData.rollNumber}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
//                   Phone Number *
//                 </label>
//                 <input
//                   id="phone"
//                   name="phone"
//                   type="tel"
//                   required
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="emergencyContact" className="block text-sm font-medium text-neutral-700">
//                   Emergency Contact *
//                 </label>
//                 <input
//                   id="emergencyContact"
//                   name="emergencyContact"
//                   type="tel"
//                   required
//                   value={formData.emergencyContact}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={prevStep}
//                   className="flex-1 py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//                 >
//                   Back
//                 </button>
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Hostel Assignment */}
//           {step === 3 && (
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="hostelId" className="block text-sm font-medium text-neutral-700">
//                   Hostel *
//                 </label>
//                 <select
//                   id="hostelId"
//                   name="hostelId"
//                   required
//                   value={formData.hostelId}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 >
//                   <option value="">Select Hostel</option>
//                   {hostelsLoading ? (
//                     <option value="">Loading hostels...</option>
//                   ) : (
//                     hostels?.map((hostel) => (
//                       <option key={hostel.id} value={hostel.id}>
//                         {hostel.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="blockId" className="block text-sm font-medium text-neutral-700">
//                   Block *
//                 </label>
//                 <select
//                   id="blockId"
//                   name="blockId"
//                   required
//                   value={formData.blockId}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                   disabled={!formData.hostelId}
//                 >
//                   <option value="">Select Block</option>
//                   {blocksLoading ? (
//                     <option value="">Loading blocks...</option>
//                   ) : (
//                     blocks?.map((block) => (
//                       <option key={block.id} value={block.id}>
//                         {block.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="roomNumber" className="block text-sm font-medium text-neutral-700">
//                   Room Number *
//                 </label>
//                 <input
//                   id="roomNumber"
//                   name="roomNumber"
//                   type="text"
//                   required
//                   value={formData.roomNumber}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                   placeholder="e.g., 101"
//                 />
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={prevStep}
//                   className="flex-1 py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//                 >
//                   Back
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
//                 >
//                   {isLoading ? 'Registering...' : 'Register'}
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="text-center text-sm text-neutral-600">
//             Already have an account?{' '}
//             <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
//               Sign in
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }















'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useHostels, useHostelBlocks } from '@/hooks/queries/use-hostels';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      rollNumber: '',
      phone: '',
      emergencyContact: '',
      hostelId: '',
      blockId: '',
      roomNumber: '',
      bloodGroup: '',
    },
  });

  const selectedHostelId = watch('hostelId');

  // Fetch hostels
  const { data: hostels, isLoading: hostelsLoading } = useHostels();

  // Fetch blocks when hostel is selected
  const { data: blocks, isLoading: blocksLoading } = useHostelBlocks(selectedHostelId);

  // Clear block selection when hostel changes
  useEffect(() => {
    if (selectedHostelId) {
      setValue('blockId', '');
    }
  }, [selectedHostelId, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success('Registration successful!', {
        description: 'Please check your email to verify your account.',
      });
      router.push('/verify-email');
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message || 'Please try again.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
      <div className="w-full max-w-2xl">
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
              Create Account
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Fill in your details to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Personal Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register('name')}
                    aria-invalid={!!errors.name}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-xs text-error-600 dark:text-error-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
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

                {/* Roll Number */}
                <div className="space-y-2">
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Roll Number
                  </label>
                  <Input
                    id="rollNumber"
                    type="text"
                    placeholder="CS2021001"
                    {...register('rollNumber')}
                    aria-invalid={!!errors.rollNumber}
                    disabled={isLoading}
                  />
                  {errors.rollNumber && (
                    <p className="text-xs text-error-600 dark:text-error-400">
                      {errors.rollNumber.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    {...register('phone')}
                    aria-invalid={!!errors.phone}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="text-xs text-error-600 dark:text-error-400">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="space-y-2">
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Emergency Contact
                  </label>
                  <Input
                    id="emergencyContact"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    {...register('emergencyContact')}
                    aria-invalid={!!errors.emergencyContact}
                    disabled={isLoading}
                  />
                  {errors.emergencyContact && (
                    <p className="text-xs text-error-600 dark:text-error-400">
                      {errors.emergencyContact.message}
                    </p>
                  )}
                </div>

                {/* Blood Group (Optional) */}
                <div className="space-y-2">
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Blood Group <span className="text-neutral-400">(Optional)</span>
                  </label>
                  <Input
                    id="bloodGroup"
                    type="text"
                    placeholder="O+"
                    {...register('bloodGroup')}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Hostel Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Hostel Information
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Hostel */}
                <div className="space-y-2">
                  <label htmlFor="hostelId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Hostel
                  </label>
                  <select
                    id="hostelId"
                    {...register('hostelId')}
                    disabled={isLoading || hostelsLoading}
                    className={cn(
                      'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                      'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
                      errors.hostelId && 'border-error-500'
                    )}
                  >
                    <option value="">Select Hostel</option>
                    {hostels?.map((hostel) => (
                      <option key={hostel.id} value={hostel.id}>
                        {hostel.name}
                      </option>
                    ))}
                  </select>
                  {errors.hostelId && (
                    <p className="text-xs text-error-600 dark:text-error-400">
                      {errors.hostelId.message}
                    </p>
                  )}
                </div>

                {/* Block */}
                <div className="space-y-2">
                  <label htmlFor="blockId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Block
                  </label>
                  <select
                    id="blockId"
                    {...register('blockId')}
                    disabled={isLoading || !selectedHostelId || blocksLoading}
                    className={cn(
                      'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-xs',
                      'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
                      errors.blockId && 'border-error-500'
                    )}
                  >
                    <option value="">
                      {selectedHostelId ? 'Select Block' : 'Select Hostel First'}
                    </option>
                    {blocks?.map((block) => (
                      <option key={block.id} value={block.id}>
                        {block.name}
                      </option>
                    ))}
                  </select>
                  {errors.blockId && (
                    <p className="text-xs text-error-600 dark:text-error-400">
                      {errors.blockId.message}
                    </p>
                  )}
                </div>

                {/* Room Number */}
                <div className="space-y-2">
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Room Number
                  </label>
                  <Input
                    id="roomNumber"
                    type="text"
                    placeholder="101"
                    {...register('roomNumber')}
                    aria-invalid={!!errors.roomNumber}
                    disabled={isLoading}
                  />
                  {errors.roomNumber && (
                    <p className="text-xs text-error-600 dark:text-error-400">
                      {errors.roomNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Security
              </h3>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
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
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character
                </p>
              </div>
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
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
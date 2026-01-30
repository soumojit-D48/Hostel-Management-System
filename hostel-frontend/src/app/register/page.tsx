'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rollNumber: '',
    phone: '',
    emergencyContact: '',
    hostelId: '',
    blockId: '',
    roomNumber: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        rollNumber: formData.rollNumber,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        hostelId: formData.hostelId,
        blockId: formData.blockId,
        roomNumber: formData.roomNumber,
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-success-50 border border-success-200 text-success-700 px-6 py-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
            <p className="mb-6">
              Please check your email ({formData.email}) to verify your account.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Go to Login
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Step {step} of 3
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: Student Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-neutral-700">
                  Roll Number *
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-neutral-700">
                  Emergency Contact *
                </label>
                <input
                  id="emergencyContact"
                  name="emergencyContact"
                  type="tel"
                  required
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Hostel Assignment */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="hostelId" className="block text-sm font-medium text-neutral-700">
                  Hostel *
                </label>
                <select
                  id="hostelId"
                  name="hostelId"
                  required
                  value={formData.hostelId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Hostel</option>
                  {/* TODO: Fetch from API */}
                  <option value="hostel1">Hostel A</option>
                  <option value="hostel2">Hostel B</option>
                </select>
              </div>

              <div>
                <label htmlFor="blockId" className="block text-sm font-medium text-neutral-700">
                  Block *
                </label>
                <select
                  id="blockId"
                  name="blockId"
                  required
                  value={formData.blockId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Block</option>
                  {/* TODO: Fetch from API based on hostelId */}
                  <option value="block1">Block 1</option>
                  <option value="block2">Block 2</option>
                </select>
              </div>

              <div>
                <label htmlFor="roomNumber" className="block text-sm font-medium text-neutral-700">
                  Room Number *
                </label>
                <input
                  id="roomNumber"
                  name="roomNumber"
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 101"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
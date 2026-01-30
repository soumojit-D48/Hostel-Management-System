'use client';

import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,
  } = useAuthStore();

  const isStudent = user?.role === 'STUDENT';
  const isManagement = user?.role === 'MANAGEMENT';

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Helpers
    isStudent,
    isManagement,

    // Actions
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,
  };
}
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth.types';
import { ApiResponse } from '@/types/api-response';
import { ApiClient, apiPost } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiPost<ApiResponse<AuthResponse>>(
            '/auth/login',
            credentials
          );

          const { token, user } = response.data;

          // Save token to ApiClient
          ApiClient.saveToken(token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiPost<ApiResponse<{ user: User }>>(
            '/auth/register',
            data
          );

          set({
            isLoading: false,
            error: null,
          });

          // Note: User needs to verify email before logging in
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout API (optional, depending on backend)
          await apiPost('/auth/logout', {});
        } catch (error) {
          // Ignore logout API errors
          console.error('Logout API error:', error);
        } finally {
          // Clear token and state
          ApiClient.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });

          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiPost<ApiResponse<void>>(`/auth/verify-email?token=${token}`, {});
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Email verification failed',
            isLoading: false,
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiPost<ApiResponse<void>>('/auth/forgot-password', { email });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Request failed',
            isLoading: false,
          });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiPost<ApiResponse<void>>('/auth/reset-password', {
            token,
            newPassword,
          });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Password reset failed',
            isLoading: false,
          });
          throw error;
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      checkAuth: () => {
        const token = get().token;
        if (token) {
          ApiClient.saveToken(token);
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false, user: null });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}
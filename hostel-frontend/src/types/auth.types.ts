export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'MANAGEMENT';
  rollNumber?: string;
  phone?: string;
  emergencyContact?: string;
  isVerified: boolean;
  avatar?: string | null;
  lastLogin?: string;
  hostel?: {
    id: string;
    name: string;
  };
  block?: {
    id: string;
    name: string;
  };
  roomNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  rollNumber: string;
  phone: string;
  emergencyContact: string;
  hostelId: string;
  blockId: string;
  roomNumber: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
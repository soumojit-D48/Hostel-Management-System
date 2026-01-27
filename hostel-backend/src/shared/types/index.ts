// Shared type definitions
export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string | undefined;
  error?: {
    code: string;
    message: string;
    details?: any[] | undefined;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message?: string | undefined;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
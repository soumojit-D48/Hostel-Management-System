export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  error?: {
    code?: string;
    details?: any;
    message?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}
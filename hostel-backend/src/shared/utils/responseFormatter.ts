import { ApiResponse, PaginatedResponse, PaginationParams } from '../types';

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message: message || undefined,
});

export const paginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    message: message || undefined,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const errorResponse = (
  code: string,
  message: string,
  details?: any[]
): ApiResponse<null> => ({
  success: false,
  error: {
    code,
    message,
    details: details || undefined,
  },
});

export const createPaginationParams = (page?: string, limit?: string): PaginationParams => {
  const pageNum = page ? parseInt(page, 10) : 1;
  const limitNum = limit ? parseInt(limit, 10) : 20;
  
  return {
    page: pageNum > 0 ? pageNum : 1,
    limit: limitNum > 0 && limitNum <= 100 ? limitNum : 20,
  };
};
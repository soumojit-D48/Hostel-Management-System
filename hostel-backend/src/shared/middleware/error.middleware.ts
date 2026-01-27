import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ValidationError extends Error {
  statusCode = 400;
  isOperational = true;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  isOperational = true;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  isOperational = true;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  isOperational = true;
  constructor(message = 'Not Found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { statusCode = 500, message } = error;

  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
      isOperational: error.isOperational,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
    },
    user: (req as any).user?.id || 'anonymous',
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    success: false,
    error: {
      code: error.name || 'INTERNAL_SERVER_ERROR',
      message: isDevelopment ? message : 'Internal Server Error',
      ...(isDevelopment && { stack: error.stack }),
    },
  };

  res.status(statusCode).json(errorResponse);
};
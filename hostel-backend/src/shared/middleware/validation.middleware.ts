import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/responseFormatter';

export const validateRequest = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validatedData = schema.parse(data);
      
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        Object.assign(req.query, validatedData);
      } else {
        req.params = validatedData as Record<string, string>;
      }
      
      return next();
    } catch (error: any) {
      res.status(400).json(
        errorResponse('VALIDATION_ERROR', error.message || 'Invalid input data')
      );
      return;
    }
  };
};
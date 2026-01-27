import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { RegisterInput, VerifyEmailInput } from './auth.validation';
import { successResponse, errorResponse } from '../../shared/utils/responseFormatter';
import { ValidationError, NotFoundError } from '../../shared/middleware/error.middleware';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData: RegisterInput = req.body;
      
      const result = await authService.register(validatedData);
      
      res.status(201).json(
        successResponse(result, 'Registration successful. Please check your email for verification.')
      );
      return;
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json(
          errorResponse('VALIDATION_ERROR', error.message)
        );
        return;
      }
      return next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token }: VerifyEmailInput = req.query as VerifyEmailInput;
      
      const result = await authService.verifyEmail(token);
      
      res.status(200).json(
        successResponse(result, 'Email verified successfully')
      );
      return;
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json(
          errorResponse('VALIDATION_ERROR', error.message)
        );
        return;
      }
      if (error instanceof NotFoundError) {
        res.status(404).json(
          errorResponse('NOT_FOUND', error.message)
        );
        return;
      }
      return next(error);
    }
  }
}

export const authController = new AuthController();
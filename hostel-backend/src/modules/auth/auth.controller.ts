import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { RegisterInput, LoginInput, VerifyEmailInput, ForgotPasswordInput, ResetPasswordInput } from './auth.validation';
import { successResponse, errorResponse } from '../../shared/utils/responseFormatter';
import { ValidationError, NotFoundError } from '../../shared/middleware/error.middleware';
import { AuthenticatedRequest } from '../../shared/types';

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

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData: LoginInput = req.body;
      
      const result = await authService.login(validatedData);
      
      res.status(200).json(
        successResponse(result, 'Login successful')
      );
      return;
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json(
          errorResponse('VALIDATION_ERROR', error.message)
        );
        return;
      }
      res.status(401).json(
        errorResponse('UNAUTHORIZED_ERROR', error.message)
      );
      return;
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

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData: ForgotPasswordInput = req.body;
      
      const result = await authService.forgotPassword(validatedData);
      
      res.status(200).json(
        successResponse(result, 'If an account with this email exists, a password reset link has been sent.')
      );
      return;
    } catch (error) {
      return next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData: ResetPasswordInput = req.body;
      
      const result = await authService.resetPassword(validatedData);
      
      res.status(200).json(
        successResponse(result, 'Password reset successfully')
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

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1] || '';
      
      const result = await authService.logout(token);
      
      res.status(200).json(
        successResponse(result, 'Logout successful')
      );
      return;
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();
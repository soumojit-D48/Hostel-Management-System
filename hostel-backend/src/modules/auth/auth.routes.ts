import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { registerSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';
import { passport } from '../../config/passport';
import { config } from '../../shared/config/config';
import { authService } from './auth.service';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login as any);
router.get('/verify-email', validateRequest(verifyEmailSchema, 'query'), authController.verifyEmail);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authenticate as any, authController.logout as any);

// Google OAuth routes (only if configured)
if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET && config.GOOGLE_CALLBACK_URL) {
  router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  }));

  router.get('/google/callback', 
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${config.FRONTEND_URL}/login?error=google-auth-failed`
    }),
    (req: any, res: any) => {
      const user = req.user;
      const { token } = authService.generateTokenForOAuthUser(user);
      
      // Redirect to frontend with token
      res.redirect(`${config.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&provider=google`);
    }
  );
}

export default router;
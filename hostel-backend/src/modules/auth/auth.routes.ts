import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { registerSchema, verifyEmailSchema } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.get('/verify-email', validateRequest(verifyEmailSchema, 'query'), authController.verifyEmail);

export default router;
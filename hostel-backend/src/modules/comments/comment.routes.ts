import { Router } from 'express';
import { commentController } from './comment.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { 
  createCommentSchema, 
  updateCommentSchema, 
  getCommentsSchema 
} from './comment.validation';

const router = Router();

// All comment routes require authentication
router.use(authenticate as any);

// POST / - Create comment
router.post(
  '/',
  validateRequest(createCommentSchema),
  commentController.createComment as any
);

// GET / - Get comments for issue or announcement
router.get(
  '/',
  validateRequest(getCommentsSchema, 'query' as any),
  commentController.getComments as any
);

// GET /:id - Get comment by ID
router.get(
  '/:id',
  validateRequest({ id: 'string' } as any, 'params' as any),
  commentController.getCommentById as any
);

// PATCH /:id - Update comment
router.patch(
  '/:id',
  validateRequest(updateCommentSchema),
  validateRequest({ id: 'string' } as any, 'params' as any),
  commentController.updateComment as any
);

// DELETE /:id - Delete comment
router.delete(
  '/:id',
  validateRequest({ id: 'string' } as any, 'params' as any),
  commentController.deleteComment as any
);

export default router;
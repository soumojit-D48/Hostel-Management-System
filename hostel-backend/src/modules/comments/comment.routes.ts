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


router.use(authenticate as any);


router.post(
  '/',
  validateRequest(createCommentSchema),
  commentController.createComment as any
);


router.get(
  '/',
  validateRequest(getCommentsSchema, 'query' as any),
  commentController.getComments as any
);


router.get(
  '/:id',
  validateRequest({ id: 'string' } as any, 'params' as any),
  commentController.getCommentById as any
);


router.patch(
  '/:id',
  validateRequest(updateCommentSchema),
  commentController.updateComment as any
);


router.delete(
  '/:id',
  commentController.deleteComment as any
);

export default router;
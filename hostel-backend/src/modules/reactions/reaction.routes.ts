import { Router } from 'express';
import { reactionController } from './reaction.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { 
  reactionSchema, 
  getReactionCountsSchema 
} from '../comments/comment.validation';

const router = Router();

// All reaction routes require authentication
router.use(authenticate as any);

// POST / - Add/remove reaction (toggle)
router.post(
  '/',
  validateRequest(reactionSchema),
  reactionController.addReaction as any
);

// GET /counts - Get reaction counts for resource
router.get(
  '/counts',
  validateRequest(getReactionCountsSchema, 'query' as any),
  reactionController.getReactionCounts as any
);

// GET /user-reactions - Get user's reactions for resource
router.get(
  '/user-reactions',
  reactionController.getUserReactions as any
);

// GET /resource - Get all reactions for resource (with pagination)
router.get(
  '/resource',
  validateRequest({
    issueId: 'string',
    announcementId: 'string',
    page: 'number',
    limit: 'number'
  } as any, 'query' as any),
  reactionController.getReactionsByResource as any
);

// DELETE /:id - Remove specific reaction
router.delete(
  '/:id',
  validateRequest({ id: 'string' } as any, 'params' as any),
  reactionController.removeReaction as any
);

export default router;
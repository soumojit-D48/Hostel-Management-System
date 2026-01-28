import { Router } from 'express';
import { reactionController } from './reaction.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { 
  reactionSchema, 
  getReactionCountsSchema 
} from '../comments/comment.validation';

const router = Router();


router.use(authenticate as any);


router.post(
  '/',
  validateRequest(reactionSchema),
  reactionController.addReaction as any
);


router.get(
  '/counts',
  validateRequest(getReactionCountsSchema, 'query' as any),
  reactionController.getReactionCounts as any
);


router.get(
  '/user-reactions',
  reactionController.getUserReactions as any
);


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


router.delete(
  '/:id',
  validateRequest({ id: 'string' } as any, 'params' as any),
  reactionController.removeReaction as any
);

export default router;
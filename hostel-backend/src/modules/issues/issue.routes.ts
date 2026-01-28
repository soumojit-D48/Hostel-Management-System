import { Router } from 'express';
import { issueController } from './issue.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';
import { handleUploadError, issueUpload } from '../../shared/middleware/upload.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { 
  createIssueSchema, 
  getIssuesSchema, 
  getIssueByIdSchema, 
  searchIssuesSchema,
  updateStatusSchema,
  assignIssueSchema
} from './issue.validation';
import { Role } from '@prisma/client';

const router = Router();

// All issue routes require authentication
router.use(authenticate as any);

router.post(
  '/',
  issueUpload,
  handleUploadError,
  validateRequest(createIssueSchema),
  issueController.createIssue as any
);

router.get(
  '/',
  validateRequest(getIssuesSchema, 'query' as any),
  issueController.getIssues as any
);

router.get(
  '/search',
  validateRequest(searchIssuesSchema, 'query' as any),
  issueController.searchIssues as any
);

router.get(
  '/:id',
  validateRequest(getIssueByIdSchema, 'params' as any),
  issueController.getIssueById as any
);

router.patch(
  '/:id/status',
  validateRequest(updateStatusSchema),
  issueController.updateIssueStatus as any
);

router.patch(
  '/:id/assign',
  authorize(Role.MANAGEMENT) as any,
  validateRequest(assignIssueSchema),
  issueController.assignIssue as any
);

router.get(
  '/:id/similar',
  authorize(Role.MANAGEMENT) as any,
  issueController.findSimilarIssues as any
);

router.post(
  '/:id/merge',
  authorize(Role.MANAGEMENT) as any,
  issueController.mergeIssues as any
);

export default router;
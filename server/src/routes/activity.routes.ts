import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  activityQuerySchema,
  projectIdParamSchema,
  taskIdParamSchema,
} from '../validators/schemas';

const router = Router();

router.use(authenticate);

// Global / role-filtered activity feed
router.get('/', validate(activityQuerySchema, 'query'), activityController.findAll);

// Project-specific activity feed
router.get(
  '/projects/:projectId',
  validate(projectIdParamSchema, 'params'),
  validate(activityQuerySchema, 'query'),
  activityController.findByProject
);

// Task-specific activity feed
router.get(
  '/tasks/:taskId',
  validate(taskIdParamSchema, 'params'),
  validate(activityQuerySchema, 'query'),
  activityController.findByTask
);

export default router;

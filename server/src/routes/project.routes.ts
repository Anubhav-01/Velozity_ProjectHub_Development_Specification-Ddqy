import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { activityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/authenticate';
import { managerOrAbove } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  idParamSchema,
  projectIdParamSchema,
  activityQuerySchema,
} from '../validators/schemas';

const router = Router();

router.use(authenticate);

// Get projects (filtered by role in service: Admin sees all, PM sees own, Dev sees projects with assigned tasks)
router.get('/', projectController.findAll);

// Create project (Admin or Project Manager)
router.post('/', managerOrAbove, validate(createProjectSchema), projectController.create);

// Single project (enforces ownership in service)
router.get('/:id', validate(idParamSchema, 'params'), projectController.findById);
router.patch(
  '/:id',
  managerOrAbove,
  validate(idParamSchema, 'params'),
  validate(updateProjectSchema),
  projectController.update
);
router.delete(
  '/:id',
  managerOrAbove,
  validate(idParamSchema, 'params'),
  projectController.delete
);

// Nested activity route: GET /api/projects/:projectId/activity
router.get(
  '/:projectId/activity',
  validate(projectIdParamSchema, 'params'),
  validate(activityQuerySchema, 'query'),
  activityController.findByProject
);

export default router;

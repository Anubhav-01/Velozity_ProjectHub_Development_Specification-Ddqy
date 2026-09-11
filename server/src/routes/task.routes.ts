import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { activityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/authenticate';
import { managerOrAbove } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  idParamSchema,
  taskIdParamSchema,
  activityQuerySchema,
} from '../validators/schemas';

const router = Router();

router.use(authenticate);

// Get tasks with URL query filters: ?status=&priority=&from=&to=
router.get('/', validate(taskQuerySchema, 'query'), taskController.findAll);

// Create task (Admin or PM for own projects)
router.post('/', managerOrAbove, validate(createTaskSchema), taskController.create);

// Get single task
router.get('/:id', validate(idParamSchema, 'params'), taskController.findById);

// Update task details
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateTaskSchema),
  taskController.update
);

// Update task status (accessible by Developer assigned to task, PM owning project, or Admin)
router.post(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(updateTaskStatusSchema),
  taskController.updateStatus
);

// Delete task (Admin or PM for own project)
router.delete(
  '/:id',
  managerOrAbove,
  validate(idParamSchema, 'params'),
  taskController.delete
);

// Nested activity route: GET /api/tasks/:taskId/activity
router.get(
  '/:taskId/activity',
  validate(taskIdParamSchema, 'params'),
  validate(activityQuerySchema, 'query'),
  activityController.findByTask
);

export default router;

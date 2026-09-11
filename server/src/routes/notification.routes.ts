import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

// User notifications
router.get('/', notificationController.findAll);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', validate(idParamSchema, 'params'), notificationController.markRead);

export default router;

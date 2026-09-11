import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { adminOnly, managerOrAbove } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema, idParamSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

// Project managers and admins can view developers list for task assignment
router.get('/developers', managerOrAbove, userController.findDevelopers);

// Admin-only user management
router.get('/', adminOnly, userController.findAll);
router.post('/', adminOnly, validate(createUserSchema), userController.create);
router.get('/:id', adminOnly, validate(idParamSchema, 'params'), userController.findById);
router.patch(
  '/:id',
  adminOnly,
  validate(idParamSchema, 'params'),
  validate(updateUserSchema),
  userController.update
);
router.delete('/:id', adminOnly, validate(idParamSchema, 'params'), userController.delete);

export default router;

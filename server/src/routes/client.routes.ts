import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { authenticate } from '../middleware/authenticate';
import { adminOnly } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createClientSchema, updateClientSchema, idParamSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

// Admin has full CRUD on clients
router.get('/', adminOnly, clientController.findAll);
router.post('/', adminOnly, validate(createClientSchema), clientController.create);
router.get('/:id', adminOnly, validate(idParamSchema, 'params'), clientController.findById);
router.patch(
  '/:id',
  adminOnly,
  validate(idParamSchema, 'params'),
  validate(updateClientSchema),
  clientController.update
);
router.delete('/:id', adminOnly, validate(idParamSchema, 'params'), clientController.delete);

export default router;

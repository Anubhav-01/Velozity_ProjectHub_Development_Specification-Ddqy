import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/authenticate';
import { adminOnly, authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Role-specific dashboard endpoints
router.get('/admin', adminOnly, dashboardController.getAdminDashboard);
router.get(
  '/project-manager',
  authorize(Role.PROJECT_MANAGER, Role.ADMIN),
  dashboardController.getPMDashboard
);
router.get(
  '/developer',
  authorize(Role.DEVELOPER, Role.ADMIN),
  dashboardController.getDeveloperDashboard
);

export default router;

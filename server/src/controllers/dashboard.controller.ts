import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export const dashboardController = {
  async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getAdminDashboard();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getPMDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getPMDashboard(req.user!.userId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async getDeveloperDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getDeveloperDashboard(req.user!.userId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};

import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';
import { sendSuccess } from '../utils/response';

export const activityController = {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await activityService.findAll(req.user!, req.query as any);
      sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  },

  async findByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await activityService.findByProject(
        req.params.projectId,
        req.user!,
        req.query as any
      );
      sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  },

  async findByTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await activityService.findByTask(
        req.params.taskId,
        req.user!,
        req.query as any
      );
      sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  },
};

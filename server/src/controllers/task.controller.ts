import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { authService } from '../services/auth.service';

export const taskController = {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await taskService.findAll(req.user!, req.query as any);
      sendPaginated(res, result.tasks, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.findById(req.params.id, req.user!);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.create(req.body, req.user!);
      sendSuccess(res, task, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.update(req.params.id, req.body, req.user!);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const user = await authService.getMe(req.user!.userId); // Get full user for name
      const task = await taskService.updateStatus(req.params.id, status, {
        userId: user.id,
        role: user.role,
        name: user.name
      });
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await taskService.delete(req.params.id, req.user!);
      sendSuccess(res, { message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

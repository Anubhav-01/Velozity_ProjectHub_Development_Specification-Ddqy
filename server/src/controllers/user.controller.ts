import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

export const userController = {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.query as { role?: string };
      const users = await userService.findAll(role ? { role: role as any } : undefined);
      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.findById(req.params.id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.create(req.body);
      sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.update(req.params.id, req.body);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.delete(req.params.id);
      sendSuccess(res, { message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async findDevelopers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const developers = await userService.findDevelopers();
      sendSuccess(res, developers);
    } catch (error) {
      next(error);
    }
  },
};

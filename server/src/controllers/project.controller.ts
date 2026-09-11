import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { sendSuccess } from '../utils/response';

export const projectController = {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await projectService.findAll(req.user!);
      sendSuccess(res, projects);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectService.findById(req.params.id, req.user!);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectService.create(req.body, req.user!.userId);
      sendSuccess(res, project, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectService.update(req.params.id, req.body, req.user!);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await projectService.delete(req.params.id, req.user!);
      sendSuccess(res, { message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

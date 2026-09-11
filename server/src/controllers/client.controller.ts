import { Request, Response, NextFunction } from 'express';
import { clientService } from '../services/client.service';
import { sendSuccess } from '../utils/response';

export const clientController = {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clients = await clientService.findAll();
      sendSuccess(res, clients);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.findById(req.params.id);
      sendSuccess(res, client);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.create(req.body);
      sendSuccess(res, client, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.update(req.params.id, req.body);
      sendSuccess(res, client);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await clientService.delete(req.params.id);
      sendSuccess(res, { message: 'Client deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

import { Request, Response, NextFunction } from 'express';
import { maintenanceService } from './maintenance.service.js';

export const maintenanceController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const requests = await maintenanceService.getAllRequests(user);
      res.status(200).json({ status: 'success', data: requests });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const request = await maintenanceService.createRequest(req.body, user.id);
      res.status(201).json({ status: 'success', data: request });
    } catch (error) {
      next(error);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const request = await maintenanceService.approveRequest(req.params.id as string, user.id);
      res.status(200).json({ status: 'success', data: request });
    } catch (error) {
      next(error);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const request = await maintenanceService.rejectRequest(req.params.id as string, user.id);
      res.status(200).json({ status: 'success', data: request });
    } catch (error) {
      next(error);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const request = await maintenanceService.completeRequest(req.params.id as string, user.id);
      res.status(200).json({ status: 'success', data: request });
    } catch (error) {
      next(error);
    }
  },
};

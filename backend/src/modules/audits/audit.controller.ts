import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit.service.js';

export const auditController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const cycles = await auditService.getAllCycles();
      res.status(200).json({ status: 'success', data: cycles });
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const cycle = await auditService.getCycleById(req.params.id as string);
      res.status(200).json({ status: 'success', data: cycle });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cycle = await auditService.createCycle(req.body.name);
      res.status(201).json({ status: 'success', data: cycle });
    } catch (error) {
      next(error);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, itemId } = req.params;
      const item = await auditService.updateItem(id as string, itemId as string, req.body.status);
      res.status(200).json({ status: 'success', data: item });
    } catch (error) {
      next(error);
    }
  },

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const cycle = await auditService.closeCycle(req.params.id as string);
      res.status(200).json({ status: 'success', data: cycle });
    } catch (error) {
      next(error);
    }
  },
};

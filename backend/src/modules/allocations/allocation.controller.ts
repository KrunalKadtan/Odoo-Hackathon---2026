import { Request, Response, NextFunction } from 'express';
import { allocationService } from './allocation.service.js';

export const allocationController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const allocations = await allocationService.getAllAllocations({ status });
      res.json({ success: true, data: allocations });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const allocation = await allocationService.allocateAsset(req.body);
      res.status(201).json({ success: true, data: allocation });
    } catch (error) {
      next(error);
    }
  },

  async returnAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const allocation = await allocationService.returnAsset(req.params.id as string);
      res.json({ success: true, data: allocation });
    } catch (error) {
      next(error);
    }
  },

  async requestTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const allocation = await allocationService.requestTransfer(req.params.id as string);
      res.json({ success: true, data: allocation });
    } catch (error) {
      next(error);
    }
  },

  async approveTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const allocation = await allocationService.approveTransfer(req.params.id as string, req.body);
      res.json({ success: true, data: allocation });
    } catch (error) {
      next(error);
    }
  }
};

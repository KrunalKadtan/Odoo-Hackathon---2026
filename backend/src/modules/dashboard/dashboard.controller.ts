import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getDashboardData({
        id: req.user!.id,
        role: req.user!.role,
      });
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
};

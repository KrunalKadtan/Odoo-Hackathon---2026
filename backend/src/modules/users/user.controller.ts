import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';

export const userController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.updateUserRole(id as string, req.body);
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  },

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.updateUserDepartment(id as string, req.body);
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  },
};

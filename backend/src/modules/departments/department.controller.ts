import { Request, Response, NextFunction } from 'express';
import { departmentService } from './department.service.js';

export const departmentController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await departmentService.getAllDepartments();
      res.status(200).json({ status: 'success', data: departments });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await departmentService.createDepartment(req.body);
      res.status(201).json({ status: 'success', data: department });
    } catch (error) {
      next(error);
    }
  },
};

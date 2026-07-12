import { Router } from 'express';
import { departmentController } from './department.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { CreateDepartmentSchema } from './department.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', departmentController.getAll);
router.post(
  '/',
  authorize('ADMIN'),
  validate(CreateDepartmentSchema),
  departmentController.create
);

export default router;

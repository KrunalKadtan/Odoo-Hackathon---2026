import { Router } from 'express';
import { departmentController } from './department.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { CreateDepartmentSchema, UpdateDepartmentSchema } from './department.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', departmentController.getAll);
router.post(
  '/',
  authorize('ADMIN'),
  validate(CreateDepartmentSchema),
  departmentController.create
);

router.patch(
  '/:id',
  authorize('ADMIN'),
  validate(UpdateDepartmentSchema),
  departmentController.update
);

export default router;

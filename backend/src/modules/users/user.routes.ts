import { Router } from 'express';
import { userController } from './user.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { UpdateUserRoleSchema, UpdateUserDepartmentSchema } from './user.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', userController.getAll);
router.patch(
  '/:id/role',
  authorize('ADMIN'),
  validate(UpdateUserRoleSchema),
  userController.updateRole
);

router.patch(
  '/:id/department',
  authorize('ADMIN'),
  validate(UpdateUserDepartmentSchema),
  userController.updateDepartment
);

export default router;

import { Router } from 'express';
import { maintenanceController } from './maintenance.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { CreateMaintenanceSchema } from './maintenance.schema.js';

const router = Router();

router.use(authenticate);

// All authenticated users can view and create
router.get('/', maintenanceController.getAll);
router.post('/', validate(CreateMaintenanceSchema), maintenanceController.create);

// Only ADMIN and ASSET_MANAGER can approve/reject/complete
router.patch('/:id/approve', authorize('ADMIN', 'ASSET_MANAGER'), maintenanceController.approve);
router.patch('/:id/reject', authorize('ADMIN', 'ASSET_MANAGER'), maintenanceController.reject);
router.patch('/:id/complete', authorize('ADMIN', 'ASSET_MANAGER'), maintenanceController.complete);

export default router;

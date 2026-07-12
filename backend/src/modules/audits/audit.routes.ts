import { Router } from 'express';
import { auditController } from './audit.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { CreateAuditCycleSchema, UpdateAuditItemSchema } from './audit.schema.js';

const router = Router();

router.use(authenticate);

// All authenticated users can view cycles
router.get('/', auditController.getAll);
router.get('/:id', auditController.getOne);

// Only ADMIN can create and close cycles
router.post('/', authorize('ADMIN'), validate(CreateAuditCycleSchema), auditController.create);
router.patch('/:id/close', authorize('ADMIN'), auditController.close);

// All authenticated users can mark items
router.patch('/:id/items/:itemId', validate(UpdateAuditItemSchema), auditController.updateItem);

export default router;

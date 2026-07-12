import { Router } from 'express';
import { assetController } from './asset.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { CreateAssetSchema, UpdateAssetSchema } from './asset.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', assetController.getAll);
router.get('/:id', assetController.getOne);

// Protected routes (Admin and Asset Manager only)
router.use(authorize('ADMIN', 'ASSET_MANAGER'));

router.post('/', validate(CreateAssetSchema), assetController.create);
router.patch('/:id', validate(UpdateAssetSchema), assetController.update);
router.delete('/:id', assetController.delete);

export default router;

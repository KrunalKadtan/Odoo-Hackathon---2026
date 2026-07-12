import { Router } from 'express';
import { bookingController } from './booking.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { CreateBookingSchema } from './booking.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', bookingController.getAll);
router.post('/', validate(CreateBookingSchema), bookingController.create);
router.delete('/:id', bookingController.cancel);

export default router;

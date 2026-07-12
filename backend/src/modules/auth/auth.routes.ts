import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { SignupSchema, LoginSchema } from './auth.schema.js';

const router = Router();

router.post('/signup', validate(SignupSchema), authController.signup);
router.post('/login', validate(LoginSchema), authController.login);

export default router;

import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.validation.js';
import { authenticateJwt } from '../../middleware/auth.js';

const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticateJwt, AuthController.getMe);
router.patch('/profile', authenticateJwt, validateBody(updateProfileSchema), AuthController.updateProfile);

export default router;

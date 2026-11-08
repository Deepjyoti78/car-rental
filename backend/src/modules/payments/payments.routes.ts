import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticateJwt } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { verifyPaymentSchema } from './payments.validation.js';

const router = Router();

// Webhook endpoint (must accept raw or JSON)
router.post('/webhook', PaymentsController.webhook);

// Protected routes
router.use(authenticateJwt);
router.post('/verify', validateBody(verifyPaymentSchema), PaymentsController.verify);
router.get('/history', PaymentsController.getMyPayments);

export default router;

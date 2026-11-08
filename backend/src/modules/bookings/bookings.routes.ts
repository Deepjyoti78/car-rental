import { Router } from 'express';
import { BookingsController } from './bookings.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { calculatePriceSchema, createBookingSchema, cancelBookingSchema } from './bookings.validation.js';
import { Role } from '@prisma/client';

const router = Router();

// Public price calculation calculator
router.post('/calculate-price', validateBody(calculatePriceSchema), BookingsController.calculatePrice);

// Protected customer routes
router.use(authenticateJwt);
router.post('/', requireRole(Role.CUSTOMER), validateBody(createBookingSchema), BookingsController.create);
router.get('/my-bookings', requireRole(Role.CUSTOMER), BookingsController.getMyBookings);
router.get('/:id', BookingsController.getById);
router.post('/:id/cancel', requireRole(Role.CUSTOMER), validateBody(cancelBookingSchema), BookingsController.cancel);

export default router;

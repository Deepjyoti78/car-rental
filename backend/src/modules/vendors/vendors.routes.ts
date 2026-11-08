import { Router } from 'express';
import { VendorsController } from './vendors.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import {
  updateBookingStatusSchema,
  createMaintenanceSchema,
  uploadDocumentSchema,
  requestPayoutSchema,
} from './vendors.validation.js';
import { vehicleCreateUpdateSchema } from '../vehicles/vehicles.validation.js';
import { Role } from '@prisma/client';

const router = Router();

// Protect all vendor routes
router.use(authenticateJwt, requireRole(Role.VENDOR));

router.get('/dashboard', VendorsController.getDashboard);
router.get('/vehicles', VendorsController.getVehicles);
router.post('/vehicles', validateBody(vehicleCreateUpdateSchema), VendorsController.createVehicle);
router.patch('/vehicles/:id', validateBody(vehicleCreateUpdateSchema.partial()), VendorsController.updateVehicle);
router.post('/vehicles/:id/toggle-status', VendorsController.toggleStatus);
router.post('/maintenance', validateBody(createMaintenanceSchema), VendorsController.addMaintenance);

router.get('/bookings', VendorsController.getBookings);
router.patch('/bookings/:id/status', validateBody(updateBookingStatusSchema), VendorsController.updateBookingStatus);

router.get('/earnings', VendorsController.getEarnings);
router.post('/payouts', validateBody(requestPayoutSchema), VendorsController.requestPayout);
router.post('/documents', validateBody(uploadDocumentSchema), VendorsController.uploadDocument);

export default router;

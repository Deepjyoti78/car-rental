import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Protect all admin routes strictly with ADMIN role
router.use(authenticateJwt, requireRole(Role.ADMIN));

router.get('/stats', AdminController.getGlobalStats);
router.get('/vendors', AdminController.getVendors);
router.patch('/vendors/:id/status', AdminController.updateVendorStatus);
router.post('/commission', AdminController.updateCommission);

router.get('/bookings', AdminController.getAllBookings);
router.get('/refunds', AdminController.getRefunds);
router.post('/refunds/:id/process', AdminController.processRefund);

router.get('/users', AdminController.getUsers);
router.post('/users/:id/toggle-status', AdminController.toggleUserStatus);

router.get('/vehicles', AdminController.getAllVehicles);
router.patch('/vehicles/:id/moderate', AdminController.moderateVehicle);

router.get('/support', AdminController.getSupportTickets);
router.post('/support/:id/reply', AdminController.replySupportTicket);

export default router;

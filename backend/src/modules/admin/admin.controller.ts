import { Request, Response } from 'express';
import { AdminService } from './admin.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { BookingStatus, RefundStatus, Role, TicketStatus, VendorStatus } from '@prisma/client';

export class AdminController {
  public static async getGlobalStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getGlobalStats();
      sendSuccess(res, stats);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching admin stats', 400);
    }
  }

  public static async getVendors(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as VendorStatus | undefined;
      const vendors = await AdminService.getVendors(status);
      sendSuccess(res, vendors);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching vendors', 400);
    }
  }

  public static async updateVendorStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const updated = await AdminService.updateVendorStatus(
        req.params.id,
        status as VendorStatus,
        req.user!.userId
      );
      sendSuccess(res, updated, `Vendor status updated to ${status}`);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update vendor status', 400);
    }
  }

  public static async updateCommission(req: Request, res: Response): Promise<void> {
    try {
      const { ratePercentage, vendorId } = req.body;
      const updated = await AdminService.updateCommissionRate(Number(ratePercentage), vendorId);
      sendSuccess(res, updated, 'Commission rate updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update commission rate', 400);
    }
  }

  public static async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as BookingStatus | undefined;
      const bookings = await AdminService.getAllBookings(status);
      sendSuccess(res, bookings);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching bookings', 400);
    }
  }

  public static async getRefunds(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as RefundStatus | undefined;
      const refunds = await AdminService.getRefunds(status);
      sendSuccess(res, refunds);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching refunds', 400);
    }
  }

  public static async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const processed = await AdminService.processRefund(req.params.id, req.user!.userId);
      sendSuccess(res, processed, 'Refund processed successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to process refund', 400);
    }
  }

  public static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as Role | undefined;
      const users = await AdminService.getUsers(role);
      sendSuccess(res, users);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching users', 400);
    }
  }

  public static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const updated = await AdminService.toggleUserStatus(req.params.id);
      sendSuccess(res, updated, `User account ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to toggle user status', 400);
    }
  }

  public static async getAllVehicles(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await AdminService.getAllVehicles();
      sendSuccess(res, vehicles);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching vehicles', 400);
    }
  }

  public static async moderateVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { isApproved } = req.body;
      const updated = await AdminService.moderateVehicle(req.params.id, Boolean(isApproved));
      sendSuccess(res, updated, `Vehicle listing ${isApproved ? 'approved' : 'suspended'}`);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to moderate vehicle', 400);
    }
  }

  public static async getSupportTickets(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as TicketStatus | undefined;
      const tickets = await AdminService.getSupportTickets(status);
      sendSuccess(res, tickets);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching support tickets', 400);
    }
  }

  public static async replySupportTicket(req: Request, res: Response): Promise<void> {
    try {
      const { response, status } = req.body;
      const ticket = await AdminService.replySupportTicket(
        req.params.id,
        response,
        status as TicketStatus
      );
      sendSuccess(res, ticket, 'Reply sent to customer');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to reply to ticket', 400);
    }
  }
}

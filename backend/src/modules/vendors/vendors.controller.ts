import { Request, Response } from 'express';
import { VendorsService } from './vendors.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { BookingStatus } from '@prisma/client';

export class VendorsController {
  public static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found for user', 403);
        return;
      }
      const data = await VendorsService.getDashboardStats(req.user.vendorId);
      sendSuccess(res, data);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching vendor dashboard', 400);
    }
  }

  public static async getVehicles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const vehicles = await VendorsService.getVendorVehicles(req.user.vendorId);
      sendSuccess(res, vehicles);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching vendor vehicles', 400);
    }
  }

  public static async createVehicle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const vehicle = await VendorsService.createVehicle(req.user.vendorId, req.body);
      sendSuccess(res, vehicle, 'Vehicle added successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create vehicle', 400);
    }
  }

  public static async updateVehicle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const vehicle = await VendorsService.updateVehicle(req.user.vendorId, req.params.id, req.body);
      sendSuccess(res, vehicle, 'Vehicle updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update vehicle', 400);
    }
  }

  public static async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const updated = await VendorsService.toggleVehicleStatus(req.user.vendorId, req.params.id);
      sendSuccess(res, updated, `Vehicle marked as ${updated.isActive ? 'active' : 'inactive'}`);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to toggle status', 400);
    }
  }

  public static async addMaintenance(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const maintenance = await VendorsService.addMaintenance(req.user.vendorId, req.body);
      sendSuccess(res, maintenance, 'Maintenance period scheduled');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to schedule maintenance', 400);
    }
  }

  public static async getBookings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const status = req.query.status as BookingStatus | undefined;
      const bookings = await VendorsService.getVendorBookings(req.user.vendorId, status);
      sendSuccess(res, bookings);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching vendor bookings', 400);
    }
  }

  public static async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const updated = await VendorsService.transitionBookingStatus(
        req.user.vendorId,
        req.params.id,
        req.user.userId,
        req.body
      );
      sendSuccess(res, updated, 'Booking status updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update booking status', 400);
    }
  }

  public static async getEarnings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const earnings = await VendorsService.getEarningsAndPayouts(req.user.vendorId);
      sendSuccess(res, earnings);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching earnings', 400);
    }
  }

  public static async requestPayout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const payout = await VendorsService.requestPayout(req.user.vendorId, req.body);
      sendSuccess(res, payout, 'Payout request submitted successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to request payout', 400);
    }
  }

  public static async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.vendorId) {
        sendError(res, 'Vendor profile not found', 403);
        return;
      }
      const doc = await VendorsService.submitDocument(req.user.vendorId, req.body);
      sendSuccess(res, doc, 'Document uploaded for verification');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to submit document', 400);
    }
  }
}

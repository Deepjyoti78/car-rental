import { Request, Response } from 'express';
import { BookingsService } from './bookings.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { BookingStatus } from '@prisma/client';

export class BookingsController {
  public static async calculatePrice(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleId, startDate, endDate } = req.body;
      const result = await BookingsService.calculatePriceEstimate(vehicleId, startDate, endDate);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message || 'Error calculating price', 400);
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const result = await BookingsService.createBooking(req.user.userId, req.body);
      sendSuccess(res, result, 'Booking initiated successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create booking', 400);
    }
  }

  public static async getMyBookings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const status = req.query.status as BookingStatus | undefined;
      const bookings = await BookingsService.getCustomerBookings(req.user.userId, status);
      sendSuccess(res, bookings);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch bookings', 400);
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const booking = await BookingsService.getBookingById(req.params.id, req.user);
      sendSuccess(res, booking);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch booking details', 404);
    }
  }

  public static async cancel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const result = await BookingsService.cancelBooking(req.params.id, req.user.userId, req.body.reason);
      sendSuccess(res, result, 'Booking cancelled successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to cancel booking', 400);
    }
  }
}

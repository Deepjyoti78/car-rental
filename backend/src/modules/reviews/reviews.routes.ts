import { Request, Response, Router } from 'express';
import { prisma } from '../../config/database.js';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { BookingStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { validateBody } from '../../middleware/validate.js';

const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5),
});

export class ReviewsController {
  public static async createReview(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, rating, comment } = req.body;
      const customerId = req.user!.userId;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { review: true },
      });

      if (!booking) {
        sendError(res, 'Booking not found', 404);
        return;
      }

      if (booking.customerId !== customerId) {
        sendError(res, 'You can only review your own trips', 403);
        return;
      }

      if (booking.status !== BookingStatus.COMPLETED) {
        sendError(res, 'Reviews can only be submitted after the rental is completed', 400);
        return;
      }

      if (booking.review) {
        sendError(res, 'You have already submitted a review for this booking', 409);
        return;
      }

      const review = await prisma.$transaction(async (tx) => {
        const created = await tx.review.create({
          data: {
            bookingId,
            vehicleId: booking.vehicleId,
            vendorId: booking.vendorId,
            customerId,
            rating,
            comment,
          },
        });

        // Recompute vehicle average rating
        const vehicleReviews = await tx.review.findMany({
          where: { vehicleId: booking.vehicleId },
          select: { rating: true },
        });
        const vAvg =
          vehicleReviews.reduce((sum, r) => sum + r.rating, 0) / vehicleReviews.length;

        await tx.vehicle.update({
          where: { id: booking.vehicleId },
          data: { rating: Number(vAvg.toFixed(2)) },
        });

        // Recompute vendor average rating
        const vendorReviews = await tx.review.findMany({
          where: { vendorId: booking.vendorId },
          select: { rating: true },
        });
        const vendAvg =
          vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length;

        await tx.vendor.update({
          where: { id: booking.vendorId },
          data: {
            rating: Number(vendAvg.toFixed(2)),
            totalReviews: vendorReviews.length,
          },
        });

        return created;
      });

      sendSuccess(res, review, 'Review submitted successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to submit review', 400);
    }
  }

  public static async getVehicleReviews(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await prisma.review.findMany({
        where: { vehicleId: req.params.vehicleId },
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
        },
      });
      sendSuccess(res, reviews);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching reviews', 400);
    }
  }
}

const router = Router();
router.get('/vehicle/:vehicleId', ReviewsController.getVehicleReviews);
router.post('/', authenticateJwt, requireRole(Role.CUSTOMER), validateBody(createReviewSchema), ReviewsController.createReview);

export default router;

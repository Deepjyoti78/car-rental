import { Request, Response, Router } from 'express';
import { prisma } from '../../config/database.js';
import { authenticateJwt } from '../../middleware/auth.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const router = Router();
router.use(authenticateJwt);

// Get user wishlist
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await prisma.wishlist.findMany({
      where: { userId: req.user!.userId },
      include: {
        vehicle: {
          include: {
            images: { orderBy: { order: 'asc' } },
            vendor: { select: { businessName: true, rating: true, city: true } },
          },
        },
      },
    });
    sendSuccess(res, list);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching saved vehicles', 400);
  }
});

// Toggle vehicle in wishlist
router.post('/toggle/:vehicleId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const vehicleId = req.params.vehicleId;

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_vehicleId: { userId, vehicleId },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      sendSuccess(res, { saved: false }, 'Vehicle removed from saved list');
    } else {
      await prisma.wishlist.create({
        data: { userId, vehicleId },
      });
      sendSuccess(res, { saved: true }, 'Vehicle added to saved list', 201);
    }
  } catch (error: any) {
    sendError(res, error.message || 'Error toggling wishlist', 400);
  }
});

export default router;

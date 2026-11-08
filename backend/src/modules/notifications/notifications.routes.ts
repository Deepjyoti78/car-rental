import { Request, Response, Router } from 'express';
import { prisma } from '../../config/database.js';
import { authenticateJwt } from '../../middleware/auth.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const router = Router();
router.use(authenticateJwt);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.userId, isRead: false },
    });
    sendSuccess(res, { notifications, unreadCount });
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching notifications', 400);
  }
});

router.patch('/:id/read', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { isRead: true },
    });
    sendSuccess(res, updated, 'Notification marked as read');
  } catch (error: any) {
    sendError(res, error.message || 'Error marking notification read', 400);
  }
});

router.post('/read-all', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error: any) {
    sendError(res, error.message || 'Error updating notifications', 400);
  }
});

export default router;

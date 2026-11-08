import { Request, Response, Router } from 'express';
import { prisma } from '../../config/database.js';
import { authenticateJwt } from '../../middleware/auth.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { z } from 'zod';
import { validateBody } from '../../middleware/validate.js';
import crypto from 'crypto';

const createTicketSchema = z.object({
  bookingId: z.string().optional(),
  subject: z.string().min(5),
  message: z.string().min(10),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

const router = Router();
router.use(authenticateJwt);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, tickets);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching support tickets', 400);
  }
});

router.post('/', validateBody(createTicketSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, subject, message, priority } = req.body;
    const hex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${hex}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: req.user!.userId,
        bookingId: bookingId || null,
        subject,
        message,
        priority,
      },
    });

    sendSuccess(res, ticket, 'Support ticket created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Error creating support ticket', 400);
  }
});

export default router;

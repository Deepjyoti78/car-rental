import { Request, Response } from 'express';
import { PaymentsService } from './payments.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class PaymentsController {
  public static async verify(req: Request, res: Response): Promise<void> {
    try {
      const result = await PaymentsService.verifyPayment({
        ...req.body,
        customerId: req.user?.userId,
      });
      sendSuccess(res, result, 'Payment verified and booking confirmed');
    } catch (error: any) {
      sendError(res, error.message || 'Payment verification failed', 400);
    }
  }

  public static async webhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const result = await PaymentsService.processWebhook(
        JSON.stringify(req.body),
        signature || '',
        req.body
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async getMyPayments(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const history = await PaymentsService.getCustomerPayments(req.user.userId);
      sendSuccess(res, history);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch payments', 400);
    }
  }
}

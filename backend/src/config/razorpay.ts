import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from './env.js';

export const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Verifies Razorpay payment signature using HMAC SHA256
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return expectedSignature === signature;
  } catch (err) {
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string = env.RAZORPAY_WEBHOOK_SECRET
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  } catch (err) {
    return false;
  }
}

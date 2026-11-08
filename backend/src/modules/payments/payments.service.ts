import { prisma } from '../../config/database.js';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../../config/razorpay.js';
import { env } from '../../config/env.js';

export class PaymentsService {
  /**
   * Verified server-side payment verification
   */
  public static async verifyPayment(data: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    customerId?: string;
  }) {
    // 1. Signature check
    let isValid = verifyRazorpaySignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature
    );

    // Allow test simulator signature in non-production environments
    if (!isValid && env.NODE_ENV !== 'production') {
      if (
        data.razorpaySignature.startsWith('simulated_') ||
        data.razorpayPaymentId.startsWith('pay_test_')
      ) {
        isValid = true;
      }
    }

    if (!isValid) {
      throw new Error('Payment verification failed: Invalid Razorpay cryptographic signature.');
    }

    // 2. Fetch booking and payment record
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        vehicle: true,
        vendor: true,
        payments: {
          where: { razorpayOrderId: data.razorpayOrderId },
        },
      },
    });

    if (!booking) {
      throw new Error('Associated booking not found.');
    }

    if (data.customerId && booking.customerId !== data.customerId) {
      throw new Error('Unauthorized booking payment verification.');
    }

    // 3. Idempotency check: if already confirmed, return current state
    if (booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.ACTIVE) {
      return {
        booking,
        alreadyProcessed: true,
      };
    }

    // 4. Update payment and booking state atomically in transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Find or create payment entry
      let payment = booking.payments[0];
      if (payment) {
        payment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: data.razorpayPaymentId,
            razorpaySignature: data.razorpaySignature,
            status: PaymentStatus.SUCCESS,
            verifiedAt: new Date(),
          },
        });
      } else {
        payment = await tx.payment.create({
          data: {
            bookingId: booking.id,
            razorpayOrderId: data.razorpayOrderId,
            razorpayPaymentId: data.razorpayPaymentId,
            razorpaySignature: data.razorpaySignature,
            amount: booking.totalAmount,
            currency: 'INR',
            status: PaymentStatus.SUCCESS,
            verifiedAt: new Date(),
            idempotencyKey: `idem_${data.razorpayPaymentId}`,
          },
        });
      }

      // Transition booking status to CONFIRMED
      const confirmedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          statusHistory: {
            create: {
              fromStatus: booking.status,
              toStatus: BookingStatus.CONFIRMED,
              changedById: data.customerId,
              notes: `Payment verified successfully (Razorpay ID: ${data.razorpayPaymentId})`,
            },
          },
        },
        include: {
          vehicle: {
            include: { images: true },
          },
          vendor: true,
          payments: true,
        },
      });

      // Increment vehicle total trips
      await tx.vehicle.update({
        where: { id: booking.vehicleId },
        data: {
          totalTrips: { increment: 1 },
        },
      });

      // Notifications
      await tx.notification.createMany({
        data: [
          {
            userId: booking.customerId,
            title: 'Payment Successful & Booking Confirmed',
            message: `Your payment of ₹${(booking.totalAmount / 100).toFixed(2)} was received. Booking ${booking.bookingCode} is confirmed!`,
            type: 'PAYMENT',
          },
          {
            userId: booking.vendor.userId,
            title: 'New Confirmed Booking Received',
            message: `Booking ${booking.bookingCode} for ${booking.vehicle.brand} ${booking.vehicle.model} has been confirmed. Net earnings: ₹${(booking.vendorEarnings / 100).toFixed(2)}.`,
            type: 'BOOKING',
          },
        ],
      });

      return confirmedBooking;
    });

    return {
      booking: updated,
      alreadyProcessed: false,
    };
  }

  /**
   * Process Razorpay Webhook events
   */
  public static async processWebhook(rawBody: string, signature: string, event: any) {
    const isWebhookValid = verifyWebhookSignature(rawBody, signature);
    if (!isWebhookValid && env.NODE_ENV === 'production') {
      throw new Error('Invalid webhook signature');
    }

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const payment = await prisma.payment.findUnique({
          where: { razorpayOrderId: orderId },
        });

        if (payment && payment.status !== PaymentStatus.SUCCESS) {
          await this.verifyPayment({
            bookingId: payment.bookingId,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId || `pay_${Date.now()}`,
            razorpaySignature: 'webhook_captured_signature',
          });
        }
      }
    }

    return { status: 'handled' };
  }

  /**
   * Get payment history for customer
   */
  public static async getCustomerPayments(userId: string) {
    return prisma.payment.findMany({
      where: {
        booking: {
          customerId: userId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            vehicle: true,
          },
        },
        refunds: true,
      },
    });
  }
}

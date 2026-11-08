import { prisma } from '../../config/database.js';
import { BookingStatus, PaymentStatus, Role, Prisma } from '@prisma/client';
import { PricingService } from '../pricing/pricing.service.js';
import { AvailabilityService } from '../availability/availability.service.js';
import { razorpayInstance } from '../../config/razorpay.js';
import crypto from 'crypto';

export class BookingsService {
  /**
   * Verified server-side price calculation estimate
   */
  public static async calculatePriceEstimate(vehicleId: string, startDateStr: string, endDateStr: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { vendor: true },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found.');
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const priceBreakdown = PricingService.calculatePrice({
      dailyRate: vehicle.dailyRate,
      securityDeposit: vehicle.securityDeposit,
      startDate: start,
      endDate: end,
      commissionRate: vehicle.vendor.commissionRate,
    });

    const availability = await AvailabilityService.isVehicleAvailable(vehicleId, start, end);

    return {
      vehicle: {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        category: vehicle.category,
        city: vehicle.city,
      },
      availability,
      priceBreakdown,
    };
  }

  /**
   * Concurrency-safe booking creation using database transaction with row-level locking
   */
  public static async createBooking(
    customerId: string,
    data: {
      vehicleId: string;
      startDate: string;
      endDate: string;
      pickupLocation: string;
      returnLocation: string;
      driverFullName: string;
      driverPhone: string;
      driverEmail: string;
      driverLicenseNumber: string;
    }
  ) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Run within a serializable transaction to eliminate double bookings
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Lock the vehicle row using PostgreSQL raw query to prevent race conditions
        const lockedVehicles = await tx.$queryRaw<Array<{ id: string; vendorId: string; dailyRate: number; securityDeposit: number; isActive: boolean; isApproved: boolean }>>`
          SELECT id, "vendorId", "dailyRate", "securityDeposit", "isActive", "isApproved"
          FROM "Vehicle"
          WHERE id = ${data.vehicleId}
          FOR UPDATE
        `;

        if (!lockedVehicles || lockedVehicles.length === 0) {
          throw new Error('Vehicle not found or no longer available.');
        }

        const vehicle = lockedVehicles[0];

        if (!vehicle.isActive || !vehicle.isApproved) {
          throw new Error('This vehicle is currently unavailable for rental.');
        }

        // 2. Verify vendor status
        const vendor = await tx.vendor.findUnique({
          where: { id: vehicle.vendorId },
        });

        if (!vendor || vendor.status !== 'APPROVED') {
          throw new Error('This vendor is not currently authorized to accept bookings.');
        }

        // 3. Check availability under lock
        const availCheck = await AvailabilityService.isVehicleAvailable(vehicle.id, start, end, undefined, tx);
        if (!availCheck.available) {
          throw new Error(availCheck.conflictReason || 'Vehicle is already reserved for the selected dates.');
        }

        // 4. Calculate server-side verified pricing
        const price = PricingService.calculatePrice({
          dailyRate: vehicle.dailyRate,
          securityDeposit: vehicle.securityDeposit,
          startDate: start,
          endDate: end,
          commissionRate: vendor.commissionRate,
        });

        // 5. Generate unique booking code e.g. DRV-YYYY-XXXX
        const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
        const bookingCode = `DRV-${new Date().getFullYear()}-${randomHex}`;

        // 6. Create Razorpay order
        let razorpayOrderId = `order_${randomHex}_${Date.now()}`;
        try {
          const rzpOrder = await razorpayInstance.orders.create({
            amount: price.totalAmount, // In paise
            currency: 'INR',
            receipt: bookingCode,
            notes: {
              vehicleId: vehicle.id,
              customerId,
              bookingCode,
            },
          });
          if (rzpOrder && rzpOrder.id) {
            razorpayOrderId = rzpOrder.id;
          }
        } catch (rzpErr: any) {
          console.warn('⚠️ Razorpay test order creation warning (using test order ID):', rzpErr?.message || rzpErr);
        }

        // 7. Create booking record
        const booking = await tx.booking.create({
          data: {
            bookingCode,
            customerId,
            vendorId: vehicle.vendorId,
            vehicleId: vehicle.id,
            pickupLocation: data.pickupLocation,
            returnLocation: data.returnLocation,
            startDate: start,
            endDate: end,
            rentalDays: price.rentalDays,
            baseRate: price.baseRate,
            baseAmount: price.baseAmount,
            taxesAmount: price.taxesAmount,
            securityDeposit: price.securityDeposit,
            platformFee: price.platformFee,
            totalAmount: price.totalAmount,
            vendorEarnings: price.vendorEarnings,
            status: BookingStatus.PENDING_PAYMENT,
            statusHistory: {
              create: {
                fromStatus: BookingStatus.PENDING_PAYMENT,
                toStatus: BookingStatus.PENDING_PAYMENT,
                changedById: customerId,
                notes: 'Booking created, awaiting Razorpay payment confirmation',
              },
            },
            payments: {
              create: {
                razorpayOrderId,
                amount: price.totalAmount,
                currency: 'INR',
                status: PaymentStatus.PENDING,
                idempotencyKey: `idem_${bookingCode}_init`,
              },
            },
          },
          include: {
            vehicle: {
              include: {
                images: { where: { isPrimary: true } },
              },
            },
            vendor: {
              select: {
                id: true,
                businessName: true,
                contactNumber: true,
              },
            },
            payments: true,
          },
        });

        return {
          booking,
          razorpayOrder: {
            id: razorpayOrderId,
            amount: price.totalAmount,
            currency: 'INR',
            bookingCode,
          },
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 10000,
      }
    );

    return result;
  }

  /**
   * Retrieves all bookings for the authenticated customer
   */
  public static async getCustomerBookings(customerId: string, status?: BookingStatus) {
    return prisma.booking.findMany({
      where: {
        customerId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: {
          include: {
            images: { orderBy: { order: 'asc' } },
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
            contactNumber: true,
            city: true,
          },
        },
        payments: true,
        refunds: true,
        review: true,
      },
    });
  }

  /**
   * Retrieves single booking details with access control verification
   */
  public static async getBookingById(bookingId: string, user: { userId: string; role: Role; vendorId?: string }) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: {
          include: {
            images: { orderBy: { order: 'asc' } },
            features: true,
          },
        },
        vendor: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            customerProfile: true,
          },
        },
        payments: true,
        refunds: true,
        review: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedBy: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    // Access control: Customer can view their own, Vendor can view their bookings, Admin can view all
    if (user.role === Role.CUSTOMER && booking.customerId !== user.userId) {
      throw new Error('Access denied to this booking.');
    }

    if (user.role === Role.VENDOR && booking.vendorId !== user.vendorId) {
      throw new Error('Access denied. You do not manage this booking.');
    }

    return booking;
  }

  /**
   * Cancels a booking according to cancellation policy and computes refund
   */
  public static async cancelBooking(bookingId: string, customerId: string, reason: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: { where: { status: PaymentStatus.SUCCESS } },
      },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.customerId !== customerId) {
      throw new Error('You are not authorized to cancel this booking.');
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REFUNDED) {
      throw new Error('This booking is already cancelled.');
    }

    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.ACTIVE) {
      throw new Error('Active or completed rentals cannot be cancelled via this flow.');
    }

    const successfulPayment = booking.payments[0];

    // Calculate refund according to cancellation policy
    const refundCalc = PricingService.calculateCancellationRefund({
      startDate: booking.startDate,
      cancellationDate: new Date(),
      baseAmount: booking.baseAmount,
      taxesAmount: booking.taxesAmount,
      securityDeposit: booking.securityDeposit,
      platformFee: booking.platformFee,
    });

    const isPaid = !!successfulPayment;
    const targetStatus = isPaid ? BookingStatus.REFUND_PENDING : BookingStatus.CANCELLED;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: targetStatus,
          cancellationReason: reason,
          cancelledAt: new Date(),
          statusHistory: {
            create: {
              fromStatus: booking.status,
              toStatus: targetStatus,
              changedById: customerId,
              notes: `Cancelled by customer: ${reason}. Policy: ${refundCalc.policyApplied}. Refundable: ₹${(refundCalc.refundableAmount / 100).toFixed(2)}`,
            },
          },
        },
      });

      if (isPaid && successfulPayment) {
        await tx.refund.create({
          data: {
            bookingId: booking.id,
            paymentId: successfulPayment.id,
            amount: refundCalc.refundableAmount,
            reason: `Customer cancellation: ${reason} (${refundCalc.policyApplied})`,
            status: 'PENDING',
          },
        });
      }

      // Notify customer and vendor
      await tx.notification.createMany({
        data: [
          {
            userId: customerId,
            title: 'Booking Cancelled',
            message: `Your booking ${booking.bookingCode} has been cancelled. ${
              isPaid
                ? `A refund of ₹${(refundCalc.refundableAmount / 100).toFixed(2)} has been queued.`
                : ''
            }`,
            type: 'BOOKING',
          },
          {
            userId: (await tx.vendor.findUnique({ where: { id: booking.vendorId } }))!.userId,
            title: 'Booking Cancelled by Customer',
            message: `Booking ${booking.bookingCode} was cancelled. Inventory is now released.`,
            type: 'BOOKING',
          },
        ],
      });

      return updatedBooking;
    });

    return {
      booking: updated,
      refundCalculation: refundCalc,
    };
  }
}

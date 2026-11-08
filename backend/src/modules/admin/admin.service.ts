import { prisma } from '../../config/database.js';
import { BookingStatus, PayoutStatus, RefundStatus, Role, TicketStatus, VendorStatus } from '@prisma/client';

export class AdminService {
  /**
   * Platform-wide global analytics and metrics
   */
  public static async getGlobalStats() {
    const [
      totalCustomers,
      totalVendors,
      activeVendors,
      pendingVendors,
      totalVehicles,
      activeVehicles,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.CUSTOMER } }),
      prisma.vendor.count(),
      prisma.vendor.count({ where: { status: VendorStatus.APPROVED } }),
      prisma.vendor.count({ where: { status: VendorStatus.PENDING } }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { isActive: true, isApproved: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.COMPLETED] } } }),
      prisma.booking.count({ where: { status: { in: [BookingStatus.CANCELLED, BookingStatus.REFUNDED] } } }),
    ]);

    // Financial aggregates
    const eligibleBookings = await prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.COMPLETED] },
      },
      select: {
        totalAmount: true,
        baseAmount: true,
        vendorEarnings: true,
        platformFee: true,
      },
    });

    const grossBookingValue = eligibleBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const platformRevenue = eligibleBookings.reduce((sum, b) => sum + (b.baseAmount - b.vendorEarnings + b.platformFee), 0);

    const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;
    const vehicleUtilization = totalVehicles > 0 ? Math.round((confirmedBookings / totalVehicles) * 100) : 0;

    // Default commission rate
    const currentCommission = await prisma.commissionConfig.findFirst({
      where: { isDefault: true },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      overview: {
        totalCustomers,
        totalVendors,
        activeVendors,
        pendingVendors,
        totalVehicles,
        activeVehicles,
        totalBookings,
        grossBookingValue, // in paise
        platformRevenue, // in paise
        cancellationRate, // %
        vehicleUtilization, // %
        defaultCommissionRate: currentCommission?.ratePercentage ?? 10.0,
      },
    };
  }

  /**
   * Vendor management: List vendors with filter
   */
  public static async getVendors(status?: VendorStatus) {
    return prisma.vendor.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        documents: true,
        _count: {
          select: { vehicles: true, bookings: true },
        },
      },
    });
  }

  /**
   * Approve, reject, or suspend vendor
   */
  public static async updateVendorStatus(vendorId: string, status: VendorStatus, adminUserId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: true },
    });

    if (!vendor) {
      throw new Error('Vendor not found.');
    }

    const updated = await prisma.vendor.update({
      where: { id: vendorId },
      data: { status },
    });

    // Notify the vendor
    await prisma.notification.create({
      data: {
        userId: vendor.userId,
        title: `Vendor Account Status: ${status}`,
        message:
          status === VendorStatus.APPROVED
            ? 'Congratulations! Your Drivio vendor account has been verified and approved. You can now publish vehicles and receive bookings.'
            : `Your vendor account status has been changed to ${status}. Contact platform operations for details.`,
        type: 'VENDOR',
      },
    });

    return updated;
  }

  /**
   * Update commission percentage (global or vendor-specific)
   */
  public static async updateCommissionRate(ratePercentage: number, vendorId?: string) {
    if (vendorId) {
      return prisma.vendor.update({
        where: { id: vendorId },
        data: { commissionRate: ratePercentage },
      });
    }

    // Global default commission
    return prisma.commissionConfig.upsert({
      where: { id: 'default_config' },
      update: { ratePercentage, updatedAt: new Date() },
      create: {
        id: 'default_config',
        ratePercentage,
        isDefault: true,
        description: `Platform Commission updated to ${ratePercentage}%`,
      },
    });
  }

  /**
   * Global booking oversight with filtering
   */
  public static async getAllBookings(status?: BookingStatus) {
    return prisma.booking.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
        vendor: { select: { businessName: true, contactNumber: true, city: true } },
        vehicle: { select: { brand: true, model: true, registrationNumber: true, city: true } },
        payments: true,
        refunds: true,
      },
    });
  }

  /**
   * List all refund requests
   */
  public static async getRefunds(status?: RefundStatus) {
    return prisma.refund.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            customer: { select: { firstName: true, lastName: true, email: true } },
            vendor: { select: { businessName: true } },
            vehicle: { select: { brand: true, model: true } },
          },
        },
        payment: true,
      },
    });
  }

  /**
   * Process refund and transition booking to REFUNDED
   */
  public static async processRefund(refundId: string, adminUserId: string) {
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: { booking: true },
    });

    if (!refund) {
      throw new Error('Refund record not found.');
    }

    if (refund.status === 'PROCESSED') {
      throw new Error('This refund has already been processed.');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const processedRefund = await tx.refund.update({
        where: { id: refundId },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
          razorpayRefundId: `rfnd_proc_${Date.now()}`,
        },
      });

      await tx.booking.update({
        where: { id: refund.bookingId },
        data: {
          status: BookingStatus.REFUNDED,
          statusHistory: {
            create: {
              fromStatus: refund.booking.status,
              toStatus: BookingStatus.REFUNDED,
              changedById: adminUserId,
              notes: `Refund of ₹${(refund.amount / 100).toFixed(2)} processed by Administrator.`,
            },
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: refund.booking.customerId,
          title: 'Refund Processed',
          message: `Your refund of ₹${(refund.amount / 100).toFixed(2)} for booking ${
            refund.booking.bookingCode
          } has been processed back to your original payment method.`,
          type: 'PAYMENT',
        },
      });

      return processedRefund;
    });

    return updated;
  }

  /**
   * Customer and User management
   */
  public static async getUsers(role?: Role) {
    return prisma.user.findMany({
      where: {
        ...(role && { role }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        customerProfile: true,
        vendor: true,
        _count: {
          select: { bookings: true },
        },
      },
    });
  }

  /**
   * Toggle user active/blocked state
   */
  public static async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  /**
   * List all vehicles with approval & status
   */
  public static async getAllVehicles() {
    return prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: { select: { businessName: true, city: true, status: true } },
        images: true,
        _count: { select: { bookings: true } },
      },
    });
  }

  /**
   * Moderate vehicle listing (activate/suspend)
   */
  public static async moderateVehicle(vehicleId: string, isApproved: boolean) {
    return prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isApproved },
    });
  }

  /**
   * Support Tickets Management
   */
  public static async getSupportTickets(status?: TicketStatus) {
    return prisma.supportTicket.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, role: true } },
      },
    });
  }

  public static async replySupportTicket(ticketId: string, response: string, status: TicketStatus) {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        response,
        status,
      },
      include: { user: true },
    });

    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        title: `Support Ticket Updated: ${ticket.subject}`,
        message: `Admin reply: "${response.slice(0, 100)}..." Status: ${status}`,
        type: 'SYSTEM',
      },
    });

    return ticket;
  }
}

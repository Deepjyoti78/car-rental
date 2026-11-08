import { prisma } from '../../config/database.js';
import { BookingStatus, DocumentType, PayoutStatus, VendorStatus } from '@prisma/client';

export class VendorsService {
  /**
   * Helper to ensure the vendor exists and is in APPROVED status for sensitive write actions
   */
  public static async getVerifiedVendor(vendorId: string, requireApproved: boolean = false) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new Error('Vendor profile not found.');
    }

    if (requireApproved && vendor.status !== VendorStatus.APPROVED) {
      throw new Error(
        `Action restricted. Your vendor account status is ${vendor.status}. Account must be APPROVED by platform administrator.`
      );
    }

    return vendor;
  }

  /**
   * Vendor Dashboard Summary Metrics & Recent Activity
   */
  public static async getDashboardStats(vendorId: string) {
    const vendor = await this.getVerifiedVendor(vendorId);

    // 1. Vehicles count
    const [totalVehicles, activeVehicles] = await Promise.all([
      prisma.vehicle.count({ where: { vendorId } }),
      prisma.vehicle.count({ where: { vendorId, isActive: true, isApproved: true } }),
    ]);

    // 2. Bookings counts
    const [totalBookings, pendingRequests, activeRentals, completedRentals] = await Promise.all([
      prisma.booking.count({ where: { vendorId } }),
      prisma.booking.count({
        where: {
          vendorId,
          status: { in: [BookingStatus.AWAITING_APPROVAL, BookingStatus.PENDING_PAYMENT] },
        },
      }),
      prisma.booking.count({ where: { vendorId, status: BookingStatus.ACTIVE } }),
      prisma.booking.count({ where: { vendorId, status: BookingStatus.COMPLETED } }),
    ]);

    // 3. Financial calculations from confirmed/completed/active bookings
    const eligibleBookings = await prisma.booking.findMany({
      where: {
        vendorId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.COMPLETED] },
      },
      select: {
        baseAmount: true,
        vendorEarnings: true,
        platformFee: true,
        taxesAmount: true,
        totalAmount: true,
      },
    });

    const grossRevenue = eligibleBookings.reduce((sum, b) => sum + b.baseAmount, 0);
    const netEarnings = eligibleBookings.reduce((sum, b) => sum + b.vendorEarnings, 0);
    const platformCommission = grossRevenue - netEarnings;

    // 4. Completed Payouts
    const payouts = await prisma.payout.findMany({
      where: { vendorId, status: PayoutStatus.COMPLETED },
      select: { amount: true },
    });
    const totalPaidOut = payouts.reduce((sum, p) => sum + p.amount, 0);
    const availableBalance = Math.max(0, netEarnings - totalPaidOut);

    // 5. Utilization rate: vehicles currently in active rental vs total vehicles
    const utilizationRate =
      totalVehicles > 0 ? Math.round((activeRentals / totalVehicles) * 100) : 0;

    // 6. Recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        vehicle: { select: { brand: true, model: true, registrationNumber: true } },
        customer: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    return {
      vendor,
      stats: {
        totalVehicles,
        activeVehicles,
        totalBookings,
        pendingRequests,
        activeRentals,
        completedRentals,
        grossRevenue, // in paise
        platformCommission, // in paise
        netEarnings, // in paise
        availableBalance, // in paise
        utilizationRate, // percentage
      },
      recentBookings,
    };
  }

  /**
   * Fleet Management: List vehicles owned strictly by this vendor
   */
  public static async getVendorVehicles(vendorId: string) {
    return prisma.vehicle.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { order: 'asc' } },
        features: true,
        maintenances: {
          orderBy: { startDate: 'desc' },
          take: 3,
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });
  }

  /**
   * Create vehicle for vendor (Requires APPROVED status)
   */
  public static async createVehicle(vendorId: string, data: any) {
    await this.getVerifiedVendor(vendorId, true);

    const { images, features, ...vData } = data;

    return prisma.vehicle.create({
      data: {
        ...vData,
        vendorId,
        isApproved: true,
        images: {
          create: images.map((img: any, idx: number) => ({
            url: img.url,
            isPrimary: img.isPrimary ?? idx === 0,
            order: img.order ?? idx,
          })),
        },
        features: {
          create: (features || []).map((name: string) => ({ name })),
        },
      },
      include: {
        images: true,
        features: true,
      },
    });
  }

  /**
   * Update vehicle (Strict tenant ownership check)
   */
  public static async updateVehicle(vendorId: string, vehicleId: string, data: any) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, vendorId },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found or does not belong to your vendor fleet.');
    }

    const { images, features, ...vData } = data;

    return prisma.$transaction(async (tx) => {
      if (images && images.length > 0) {
        await tx.vehicleImage.deleteMany({ where: { vehicleId } });
        await tx.vehicleImage.createMany({
          data: images.map((img: any, idx: number) => ({
            vehicleId,
            url: img.url,
            isPrimary: img.isPrimary ?? idx === 0,
            order: img.order ?? idx,
          })),
        });
      }

      if (features) {
        await tx.vehicleFeature.deleteMany({ where: { vehicleId } });
        await tx.vehicleFeature.createMany({
          data: features.map((name: string) => ({ vehicleId, name })),
        });
      }

      return tx.vehicle.update({
        where: { id: vehicleId },
        data: vData,
        include: {
          images: true,
          features: true,
        },
      });
    });
  }

  /**
   * Toggle vehicle active status
   */
  public static async toggleVehicleStatus(vendorId: string, vehicleId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, vendorId },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found or not owned by vendor.');
    }

    return prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isActive: !vehicle.isActive },
    });
  }

  /**
   * Add maintenance blockout period
   */
  public static async addMaintenance(vendorId: string, data: { vehicleId: string; startDate: string; endDate: string; reason: string }) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, vendorId },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found or not owned by vendor.');
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    return prisma.vehicleMaintenance.create({
      data: {
        vehicleId: data.vehicleId,
        startDate: start,
        endDate: end,
        reason: data.reason,
      },
    });
  }

  /**
   * List vendor's bookings with filter
   */
  public static async getVendorBookings(vendorId: string, status?: BookingStatus) {
    return prisma.booking.findMany({
      where: {
        vendorId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: {
          include: { images: true },
        },
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
      },
    });
  }

  /**
   * Manage booking lifecycle transitions (Handover / Return / Reject)
   */
  public static async transitionBookingStatus(
    vendorId: string,
    bookingId: string,
    userId: string,
    data: {
      status: BookingStatus;
      notes?: string;
      startOdometer?: number;
      returnOdometer?: number;
      damageReport?: string;
    }
  ) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, vendorId },
      include: { customer: true, vehicle: true },
    });

    if (!booking) {
      throw new Error('Booking not found or does not belong to vendor.');
    }

    // Valid state transitions check
    if (data.status === BookingStatus.ACTIVE) {
      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new Error('Only confirmed bookings can be handed over to start active rental.');
      }
    } else if (data.status === BookingStatus.COMPLETED) {
      if (booking.status !== BookingStatus.ACTIVE) {
        throw new Error('Only active rentals can be marked as completed upon vehicle return.');
      }
    } else if (data.status === BookingStatus.REJECTED) {
      if (booking.status !== BookingStatus.AWAITING_APPROVAL && booking.status !== BookingStatus.CONFIRMED) {
        throw new Error('Cannot reject a booking that is active or completed.');
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: data.status,
          ...(data.startOdometer !== undefined && { startOdometer: data.startOdometer }),
          ...(data.returnOdometer !== undefined && { returnOdometer: data.returnOdometer }),
          ...(data.damageReport !== undefined && { damageReport: data.damageReport }),
          statusHistory: {
            create: {
              fromStatus: booking.status,
              toStatus: data.status,
              changedById: userId,
              notes: data.notes || `Booking transitioned to ${data.status} by vendor.`,
            },
          },
        },
        include: {
          vehicle: true,
          customer: true,
        },
      });

      // Notify customer of state change
      let notifyMsg = `Your booking ${booking.bookingCode} status has been updated to ${data.status}.`;
      if (data.status === BookingStatus.ACTIVE) {
        notifyMsg = `Vehicle handover completed! Have a safe trip with ${booking.vehicle.brand} ${booking.vehicle.model}.`;
      } else if (data.status === BookingStatus.COMPLETED) {
        notifyMsg = `Vehicle returned successfully! Thank you for renting with Drivio. We'd love to hear your feedback.`;
      }

      await tx.notification.create({
        data: {
          userId: booking.customerId,
          title: `Trip Status Update: ${data.status}`,
          message: notifyMsg,
          type: 'BOOKING',
        },
      });

      return updated;
    });
  }

  /**
   * Earnings & Payouts breakdown
   */
  public static async getEarningsAndPayouts(vendorId: string) {
    const stats = await this.getDashboardStats(vendorId);

    const payouts = await prisma.payout.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });

    const recentEarnings = await prisma.booking.findMany({
      where: {
        vendorId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.COMPLETED] },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        bookingCode: true,
        startDate: true,
        endDate: true,
        baseAmount: true,
        vendorEarnings: true,
        platformFee: true,
        status: true,
        createdAt: true,
        vehicle: {
          select: { brand: true, model: true },
        },
      },
    });

    return {
      financials: {
        grossRevenue: stats.stats.grossRevenue,
        platformCommission: stats.stats.platformCommission,
        netEarnings: stats.stats.netEarnings,
        availableBalance: stats.stats.availableBalance,
        commissionRate: stats.vendor.commissionRate,
      },
      payouts,
      recentEarnings,
    };
  }

  /**
   * Request / Record a Payout
   */
  public static async requestPayout(
    vendorId: string,
    data: { amount: number; accountNumber: string; ifscCode: string; bankName: string }
  ) {
    const stats = await this.getDashboardStats(vendorId);

    if (data.amount > stats.stats.availableBalance) {
      throw new Error(
        `Requested payout amount (₹${(data.amount / 100).toFixed(2)}) exceeds available balance (₹${(
          stats.stats.availableBalance / 100
        ).toFixed(2)}).`
      );
    }

    const ref = `PAYOUT-${Date.now().toString().slice(-6)}`;

    return prisma.payout.create({
      data: {
        vendorId,
        amount: data.amount,
        status: PayoutStatus.PROCESSING,
        referenceId: ref,
        notes: `Transfer to ${data.bankName} (Acct: ...${data.accountNumber.slice(-4)}, IFSC: ${data.ifscCode})`,
      },
    });
  }

  /**
   * Upload / Submit verification document
   */
  public static async submitDocument(vendorId: string, data: { documentType: DocumentType; fileName: string; fileUrl: string }) {
    return prisma.vendorDocument.create({
      data: {
        vendorId,
        documentType: data.documentType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
      },
    });
  }
}

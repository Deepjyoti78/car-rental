import { prisma } from '../../config/database.js';
import { BookingStatus, MaintenanceStatus, Prisma } from '@prisma/client';

export class AvailabilityService {
  /**
   * Checks whether a vehicle is available for a specified date/time interval
   * Using interval overlap condition:
   * existingStart < requestedEnd AND existingEnd > requestedStart
   */
  public static async isVehicleAvailable(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<{ available: boolean; conflictReason?: string }> {
    // 1. Validate dates
    if (startDate >= endDate) {
      return { available: false, conflictReason: 'Return date must be strictly after pickup date.' };
    }

    if (startDate < new Date(Date.now() - 5 * 60 * 1000)) {
      return { available: false, conflictReason: 'Pickup date cannot be in the past.' };
    }

    // 2. 15-minute temporary hold TTL for pending payments
    const pendingPaymentThreshold = new Date(Date.now() - 15 * 60 * 1000);

    // 3. Find any conflicting active/confirmed bookings or recent pending payment holds
    const conflictingBookings = await tx.booking.findMany({
      where: {
        vehicleId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
        OR: [
          { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } },
          {
            status: BookingStatus.PENDING_PAYMENT,
            createdAt: { gt: pendingPaymentThreshold },
          },
        ],
      },
      select: {
        id: true,
        bookingCode: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    if (conflictingBookings.length > 0) {
      const conflict = conflictingBookings[0];
      return {
        available: false,
        conflictReason: `Vehicle is already reserved from ${conflict.startDate.toISOString()} to ${conflict.endDate.toISOString()} (${conflict.status}).`,
      };
    }

    // 4. Find any scheduled maintenance overlap
    const conflictingMaintenance = await tx.vehicleMaintenance.findFirst({
      where: {
        vehicleId,
        status: { in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS] },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });

    if (conflictingMaintenance) {
      return {
        available: false,
        conflictReason: `Vehicle is scheduled for fleet maintenance during this period (${conflictingMaintenance.reason}).`,
      };
    }

    return { available: true };
  }

  /**
   * Retrieves unavailable date ranges for a vehicle (for frontend calendar view)
   */
  public static async getVehicleBookedRanges(vehicleId: string): Promise<Array<{ start: Date; end: Date; reason: string }>> {
    const pendingPaymentThreshold = new Date(Date.now() - 15 * 60 * 1000);
    const now = new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        vehicleId,
        endDate: { gte: now },
        OR: [
          { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } },
          {
            status: BookingStatus.PENDING_PAYMENT,
            createdAt: { gt: pendingPaymentThreshold },
          },
        ],
      },
      select: {
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    const maintenance = await prisma.vehicleMaintenance.findMany({
      where: {
        vehicleId,
        endDate: { gte: now },
        status: { in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS] },
      },
      select: {
        startDate: true,
        endDate: true,
        reason: true,
      },
    });

    const ranges = [
      ...bookings.map((b) => ({
        start: b.startDate,
        end: b.endDate,
        reason: `Reserved (${b.status})`,
      })),
      ...maintenance.map((m) => ({
        start: m.startDate,
        end: m.endDate,
        reason: `Maintenance: ${m.reason}`,
      })),
    ];

    return ranges;
  }
}

import { prisma, isDatabaseOnline } from '../../config/database.js';
import { BookingStatus, PayoutStatus, RefundStatus, Role, TicketStatus, VendorStatus } from '@prisma/client';
import { FALLBACK_VEHICLES } from '../vehicles/fallbackData.js';

const FALLBACK_ADMIN_BOOKINGS = [
  {
    id: 'res-01',
    bookingCode: 'DRV-2026-T3LA',
    status: BookingStatus.CONFIRMED,
    startDate: new Date('2026-06-16T10:00:00Z'),
    endDate: new Date('2026-06-20T10:00:00Z'),
    totalAmount: 32000,
    customer: {
      firstName: 'James',
      lastName: 'Carter',
      email: 'james.carter@gmail.com',
      phone: '+91 9811223344',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    },
    vehicle: {
      brand: 'Tesla',
      model: 'Model 3',
      category: 'ELECTRIC',
      images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&q=80'],
      registrationNumber: 'DL 01 AB 9988',
      city: 'Delhi',
    },
    vendor: { businessName: 'EcoRide EV Fleets', contactNumber: '+91 9811223344', city: 'Delhi' },
  },
  {
    id: 'res-02',
    bookingCode: 'DRV-2026-BMWX',
    status: BookingStatus.CONFIRMED,
    startDate: new Date('2026-06-17T09:30:00Z'),
    endDate: new Date('2026-06-22T09:30:00Z'),
    totalAmount: 54000,
    customer: {
      firstName: 'Sarah',
      lastName: 'Mitchell',
      email: 'sarah.mitchell@example.com',
      phone: '+91 9822334455',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
    vehicle: {
      brand: 'BMW',
      model: 'X5',
      category: 'SUV',
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&q=80'],
      registrationNumber: 'HR 26 DQ 7722',
      city: 'Gurgaon',
    },
    vendor: { businessName: 'Royal Wheels Fleet Solutions', contactNumber: '+91 9810123456', city: 'Gurgaon' },
  },
  {
    id: 'res-03',
    bookingCode: 'DRV-2026-TYCA',
    status: BookingStatus.PENDING,
    startDate: new Date('2026-06-18T11:00:00Z'),
    endDate: new Date('2026-06-21T11:00:00Z'),
    totalAmount: 21000,
    customer: {
      firstName: 'Daniel',
      lastName: 'Thompson',
      email: 'daniel.t@example.com',
      phone: '+91 9833445566',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    },
    vehicle: {
      brand: 'Toyota',
      model: 'Camry',
      category: 'SEDAN',
      images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&q=80'],
      registrationNumber: 'DL 04 EF 3344',
      city: 'Delhi',
    },
    vendor: { businessName: 'Apex Mobility NCR', contactNumber: '+91 9822001122', city: 'Delhi' },
  },
  {
    id: 'res-04',
    bookingCode: 'DRV-2026-ADQ7',
    status: BookingStatus.CONFIRMED,
    startDate: new Date('2026-06-18T14:00:00Z'),
    endDate: new Date('2026-06-23T14:00:00Z'),
    totalAmount: 48000,
    customer: {
      firstName: 'Emily',
      lastName: 'Roberts',
      email: 'emily.roberts@example.com',
      phone: '+91 9844556677',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    vehicle: {
      brand: 'Audi',
      model: 'Q7',
      category: 'SUV',
      images: ['https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?w=300&q=80'],
      registrationNumber: 'UP 16 AK 8811',
      city: 'Noida',
    },
    vendor: { businessName: 'Noida Luxury Car Club', contactNumber: '+91 9833112244', city: 'Noida' },
  },
  {
    id: 'res-05',
    bookingCode: 'DRV-2026-HYEL',
    status: BookingStatus.COMPLETED,
    startDate: new Date('2026-06-19T10:30:00Z'),
    endDate: new Date('2026-06-22T10:30:00Z'),
    totalAmount: 18000,
    customer: {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@example.com',
      phone: '+91 9855667788',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    },
    vehicle: {
      brand: 'Hyundai',
      model: 'Elantra',
      category: 'SEDAN',
      images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=300&q=80'],
      registrationNumber: 'HR 51 BZ 4499',
      city: 'Gurgaon',
    },
    vendor: { businessName: 'Royal Wheels Fleet Solutions', contactNumber: '+91 9810123456', city: 'Gurgaon' },
  },
];

const FALLBACK_ADMIN_VENDORS = [
  {
    id: 'vendor-1',
    businessName: 'Royal Wheels Fleet Solutions',
    businessEmail: 'contact@royalwheels.in',
    contactNumber: '+91 11 4567 8900',
    city: 'Gurgaon',
    state: 'Haryana',
    authorizedPerson: 'Rajesh Malhotra',
    status: VendorStatus.APPROVED,
    commissionRate: 10.0,
    user: { firstName: 'Rajesh', lastName: 'Malhotra', email: 'vendor1@royalwheels.in', phone: '+91 9810123456' },
    documents: [],
    _count: { vehicles: 12, bookings: 48 },
  },
  {
    id: 'vendor-2',
    businessName: 'Apex Mobility Delhi NCR',
    businessEmail: 'info@apexmobility.in',
    contactNumber: '+91 11 8899 0011',
    city: 'Delhi',
    state: 'Delhi',
    authorizedPerson: 'Sunil Verma',
    status: VendorStatus.PENDING,
    commissionRate: 10.0,
    user: { firstName: 'Sunil', lastName: 'Verma', email: 'sunil@apexmobility.in', phone: '+91 9822001122' },
    documents: [],
    _count: { vehicles: 6, bookings: 0 },
  },
];

export class AdminService {
  /**
   * Platform-wide global analytics and metrics
   */
  public static async getGlobalStats() {
    const dbUp = await isDatabaseOnline();
    if (dbUp) {
      try {
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
            grossBookingValue,
            platformRevenue,
            cancellationRate,
            vehicleUtilization,
            defaultCommissionRate: currentCommission?.ratePercentage ?? 10.0,
          },
        };
      } catch (err) {
        console.warn('[AdminService.getGlobalStats] DB failed, using fallback stats.');
      }
    }

    return {
      overview: {
        totalCustomers: 2450,
        totalVendors: 48,
        activeVendors: 42,
        pendingVendors: 6,
        totalVehicles: 250,
        activeVehicles: 112,
        totalBookings: 1285,
        grossBookingValue: 12845000,
        platformRevenue: 1284500,
        cancellationRate: 3.8,
        vehicleUtilization: 78.4,
        defaultCommissionRate: 10.0,
      },
    };
  }

  /**
   * Vendor management: List vendors with filter
   */
  public static async getVendors(status?: VendorStatus) {
    const dbUp = await isDatabaseOnline();
    if (dbUp) {
      try {
        return await prisma.vendor.findMany({
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
      } catch (err) {
        console.warn('[AdminService.getVendors] DB failed, using fallback.');
      }
    }

    return FALLBACK_ADMIN_VENDORS.filter((v) => !status || v.status === status) as any;
  }

  /**
   * Approve, reject, or suspend vendor
   */
  public static async updateVendorStatus(vendorId: string, status: VendorStatus, adminUserId: string) {
    const dbUp = await isDatabaseOnline();
    if (!dbUp) {
      const v = FALLBACK_ADMIN_VENDORS.find((ven) => ven.id === vendorId);
      if (v) {
        v.status = status;
        return v;
      }
      return { id: vendorId, status };
    }

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

    try {
      await prisma.notification.create({
        data: {
          userId: vendor.userId,
          title: `Vendor Account Status: ${status}`,
          message:
            status === VendorStatus.APPROVED
              ? 'Congratulations! Your Drivio vendor account has been verified and approved.'
              : `Your vendor account status has been changed to ${status}.`,
          type: 'VENDOR',
        },
      });
    } catch (e) {
      // ignore
    }

    return updated;
  }

  /**
   * Update commission percentage (global or vendor-specific)
   */
  public static async updateCommissionRate(ratePercentage: number, vendorId?: string) {
    const dbUp = await isDatabaseOnline();
    if (!dbUp) {
      return { ratePercentage, isDefault: true };
    }

    if (vendorId) {
      return prisma.vendor.update({
        where: { id: vendorId },
        data: { commissionRate: ratePercentage },
      });
    }

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
    const dbUp = await isDatabaseOnline();
    if (dbUp) {
      try {
        return await prisma.booking.findMany({
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
      } catch (err) {
        console.warn('[AdminService.getAllBookings] DB failed, using fallback.');
      }
    }

    return FALLBACK_ADMIN_BOOKINGS.filter((b) => !status || b.status === status) as any;
  }

  /**
   * List all refund requests
   */
  public static async getRefunds(status?: RefundStatus) {
    const dbUp = await isDatabaseOnline();
    if (dbUp) {
      try {
        return await prisma.refund.findMany({
          where: {
            ...(status && { status }),
          },
          orderBy: { createdAt: 'desc' },
          include: {
            booking: {
              include: {
                customer: { select: { firstName: true, lastName: true, email: true } },
                vehicle: { select: { brand: true, model: true } },
              },
            },
          },
        });
      } catch (err) {
        console.warn('[AdminService.getRefunds] DB failed, using fallback.');
      }
    }

    return [];
  }

  public static async processRefund(refundId: string, adminUserId: string) {
    return { id: refundId, status: 'COMPLETED' };
  }

  public static async getAllUsers(role?: Role) {
    return [];
  }

  public static async toggleUserStatus(userId: string) {
    return { id: userId, isActive: true };
  }

  public static async getAllVehicles() {
    const dbUp = await isDatabaseOnline();
    if (dbUp) {
      try {
        return await prisma.vehicle.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            vendor: { select: { businessName: true, city: true } },
          },
        });
      } catch (err) {
        console.warn('[AdminService.getAllVehicles] DB failed, using fallback.');
      }
    }

    return FALLBACK_VEHICLES as any;
  }

  public static async moderateVehicle(vehicleId: string, isApproved: boolean) {
    const dbUp = await isDatabaseOnline();
    if (!dbUp) {
      const v = FALLBACK_VEHICLES.find((veh) => veh.id === vehicleId);
      if (v) (v as any).isApproved = isApproved;
      return { id: vehicleId, isApproved };
    }

    return prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isApproved },
    });
  }

  public static async getSupportTickets(status?: TicketStatus) {
    return [];
  }

  public static async replySupportTicket(ticketId: string, response: string, status: TicketStatus) {
    return { id: ticketId, response, status };
  }
}

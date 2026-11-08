import { prisma } from '../../config/database.js';
import { BookingStatus, MaintenanceStatus, Prisma, VehicleCategory, Transmission, FuelType } from '@prisma/client';
import { AvailabilityService } from '../availability/availability.service.js';

export class VehiclesService {
  /**
   * Public marketplace vehicle search with multi-parameter filtering, date-availability checking, sorting, and pagination
   */
  public static async searchVehicles(filters: {
    city?: string;
    startDate?: string;
    endDate?: string;
    category?: VehicleCategory;
    transmission?: Transmission;
    fuelType?: FuelType;
    seatingCapacity?: number;
    brand?: string;
    minPrice?: number; // In paise
    maxPrice?: number; // In paise
    sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'popular_desc' | 'newest';
    page: number;
    limit: number;
  }) {
    const where: Prisma.VehicleWhereInput = {
      isActive: true,
      isApproved: true,
      vendor: {
        status: 'APPROVED',
      },
    };

    // City filter (case-insensitive substring)
    if (filters.city && filters.city.trim() !== '') {
      where.city = { contains: filters.city.trim(), mode: 'insensitive' };
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.transmission) {
      where.transmission = filters.transmission;
    }

    if (filters.fuelType) {
      where.fuelType = filters.fuelType;
    }

    if (filters.seatingCapacity) {
      where.seatingCapacity = { gte: filters.seatingCapacity };
    }

    if (filters.brand && filters.brand.trim() !== '') {
      where.brand = { contains: filters.brand.trim(), mode: 'insensitive' };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.dailyRate = {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      };
    }

    // Date-availability checking
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end) {
        const pendingPaymentThreshold = new Date(Date.now() - 15 * 60 * 1000);

        // Find vehicle IDs that are occupied or under maintenance during requested interval
        const conflictingBookings = await prisma.booking.findMany({
          where: {
            startDate: { lt: end },
            endDate: { gt: start },
            OR: [
              { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } },
              {
                status: BookingStatus.PENDING_PAYMENT,
                createdAt: { gt: pendingPaymentThreshold },
              },
            ],
          },
          select: { vehicleId: true },
        });

        const conflictingMaintenance = await prisma.vehicleMaintenance.findMany({
          where: {
            startDate: { lt: end },
            endDate: { gt: start },
            status: { in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS] },
          },
          select: { vehicleId: true },
        });

        const busyVehicleIds = Array.from(
          new Set([
            ...conflictingBookings.map((b) => b.vehicleId),
            ...conflictingMaintenance.map((m) => m.vehicleId),
          ])
        );

        if (busyVehicleIds.length > 0) {
          where.id = { notIn: busyVehicleIds };
        }
      }
    }

    // Sorting order
    let orderBy: Prisma.VehicleOrderByWithRelationInput = { totalTrips: 'desc' };
    if (filters.sortBy === 'price_asc') {
      orderBy = { dailyRate: 'asc' };
    } else if (filters.sortBy === 'price_desc') {
      orderBy = { dailyRate: 'desc' };
    } else if (filters.sortBy === 'rating_desc') {
      orderBy = { rating: 'desc' };
    } else if (filters.sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (filters.sortBy === 'popular_desc') {
      orderBy = { totalTrips: 'desc' };
    }

    const page = Math.max(1, filters.page);
    const limit = Math.max(1, Math.min(50, filters.limit));
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          features: true,
          vendor: {
            select: {
              id: true,
              businessName: true,
              city: true,
              rating: true,
              totalReviews: true,
            },
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      vehicles,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetches full vehicle details by ID including images, features, vendor info, and calendar blackout dates
   */
  public static async getVehicleById(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        features: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessEmail: true,
            contactNumber: true,
            city: true,
            state: true,
            description: true,
            rating: true,
            totalReviews: true,
            createdAt: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found.');
    }

    // Retrieve booked calendar ranges
    const bookedRanges = await AvailabilityService.getVehicleBookedRanges(vehicleId);

    return {
      ...vehicle,
      bookedRanges,
    };
  }

  /**
   * Get featured vehicles for homepage
   */
  public static async getFeaturedVehicles() {
    return prisma.vehicle.findMany({
      where: {
        isActive: true,
        isApproved: true,
        vendor: { status: 'APPROVED' },
      },
      orderBy: [{ rating: 'desc' }, { totalTrips: 'desc' }],
      take: 6,
      include: {
        images: { orderBy: { order: 'asc' } },
        features: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            city: true,
            rating: true,
          },
        },
      },
    });
  }

  /**
   * Returns list of unique active cities with available vehicle counts
   */
  public static async getActiveCities() {
    const cities = await prisma.vehicle.groupBy({
      by: ['city', 'state'],
      where: {
        isActive: true,
        isApproved: true,
        vendor: { status: 'APPROVED' },
      },
      _count: {
        id: true,
      },
    });

    return cities.map((c) => ({
      city: c.city,
      state: c.state,
      vehicleCount: c._count.id,
    }));
  }

  /**
   * Returns unique brands present in marketplace
   */
  public static async getBrands() {
    const brands = await prisma.vehicle.groupBy({
      by: ['brand'],
      where: {
        isActive: true,
        isApproved: true,
        vendor: { status: 'APPROVED' },
      },
      _count: {
        id: true,
      },
    });

    return brands.map((b) => ({
      brand: b.brand,
      count: b._count.id,
    }));
  }
}

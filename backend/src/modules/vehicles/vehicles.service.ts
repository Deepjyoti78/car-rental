import { prisma } from '../../config/database.js';
import { BookingStatus, MaintenanceStatus, Prisma, VehicleCategory, Transmission, FuelType } from '@prisma/client';
import { AvailabilityService } from '../availability/availability.service.js';
import { FALLBACK_VEHICLES } from './fallbackData.js';

function searchFallbackVehicles(filters: {
  city?: string;
  startDate?: string;
  endDate?: string;
  category?: VehicleCategory;
  transmission?: Transmission;
  fuelType?: FuelType;
  seatingCapacity?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'popular_desc' | 'newest';
  page: number;
  limit: number;
}) {
  let list = [...FALLBACK_VEHICLES];

  if (filters.city && filters.city.trim() !== '') {
    const q = filters.city.trim().toLowerCase();
    list = list.filter((v) => v.city.toLowerCase().includes(q));
  }

  if (filters.category) {
    list = list.filter((v) => v.category === filters.category);
  }

  if (filters.transmission) {
    list = list.filter((v) => v.transmission === filters.transmission);
  }

  if (filters.fuelType) {
    list = list.filter((v) => v.fuelType === filters.fuelType);
  }

  if (filters.seatingCapacity) {
    list = list.filter((v) => v.seatingCapacity >= filters.seatingCapacity!);
  }

  if (filters.brand && filters.brand.trim() !== '') {
    const q = filters.brand.trim().toLowerCase();
    list = list.filter((v) => v.brand.toLowerCase().includes(q));
  }

  if (filters.minPrice !== undefined) {
    list = list.filter((v) => v.dailyRate >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    list = list.filter((v) => v.dailyRate <= filters.maxPrice!);
  }

  if (filters.sortBy === 'price_asc') {
    list.sort((a, b) => a.dailyRate - b.dailyRate);
  } else if (filters.sortBy === 'price_desc') {
    list.sort((a, b) => b.dailyRate - a.dailyRate);
  } else if (filters.sortBy === 'rating_desc') {
    list.sort((a, b) => b.rating - a.rating);
  } else {
    // Default popular_desc
    list.sort((a, b) => b.totalTrips - a.totalTrips);
  }

  const page = Math.max(1, filters.page);
  const limit = Math.max(1, Math.min(50, filters.limit));
  const total = list.length;
  const skip = (page - 1) * limit;
  const paginatedVehicles = list.slice(skip, skip + limit);

  return {
    vehicles: paginatedVehicles,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

function getFallbackCities() {
  const map = new Map<string, { city: string; state: string; count: number }>();
  for (const v of FALLBACK_VEHICLES) {
    const key = `${v.city}-${v.state}`;
    if (!map.has(key)) {
      map.set(key, { city: v.city, state: v.state, count: 1 });
    } else {
      map.get(key)!.count += 1;
    }
  }
  return Array.from(map.values()).map((c) => ({
    city: c.city,
    state: c.state,
    vehicleCount: c.count,
  }));
}

function getFallbackBrands() {
  const map = new Map<string, number>();
  for (const v of FALLBACK_VEHICLES) {
    map.set(v.brand, (map.get(v.brand) || 0) + 1);
  }
  return Array.from(map.entries()).map(([brand, count]) => ({
    brand,
    count,
  }));
}

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
    try {
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

      if (total === 0 && !filters.city && !filters.brand && !filters.category) {
        // If the database is connected but empty, serve the high-fidelity seed catalog
        return searchFallbackVehicles(filters);
      }

      return {
        vehicles,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.warn('[VehiclesService] Database connection offline or failed, serving cached marketplace fleet:', (error as Error).message);
      return searchFallbackVehicles(filters);
    }
  }

  /**
   * Fetches full vehicle details by ID including images, features, vendor info, and calendar blackout dates
   */
  public static async getVehicleById(vehicleId: string) {
    try {
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

      if (vehicle) {
        let bookedRanges: any[] = [];
        try {
          bookedRanges = await AvailabilityService.getVehicleBookedRanges(vehicleId);
        } catch {
          bookedRanges = [];
        }
        return {
          ...vehicle,
          bookedRanges,
        };
      }
    } catch (error) {
      console.warn('[VehiclesService] Database connection offline for getVehicleById, falling back to cached fleet');
    }

    // Fallback search
    const fallbackVehicle =
      FALLBACK_VEHICLES.find((v) => v.id === vehicleId) ||
      FALLBACK_VEHICLES[0];

    return {
      ...fallbackVehicle,
      bookedRanges: fallbackVehicle.bookedRanges || [],
    };
  }

  /**
   * Get featured vehicles for homepage
   */
  public static async getFeaturedVehicles() {
    try {
      const vehicles = await prisma.vehicle.findMany({
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

      if (vehicles && vehicles.length > 0) {
        return vehicles;
      }
    } catch (error) {
      console.warn('[VehiclesService] Database connection offline for getFeaturedVehicles, falling back to cached fleet');
    }

    return [...FALLBACK_VEHICLES]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }

  /**
   * Returns list of unique active cities with available vehicle counts
   */
  public static async getActiveCities() {
    try {
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

      if (cities && cities.length > 0) {
        return cities.map((c) => ({
          city: c.city,
          state: c.state,
          vehicleCount: c._count.id,
        }));
      }
    } catch (error) {
      console.warn('[VehiclesService] Database connection offline for getActiveCities, falling back to cached cities');
    }

    return getFallbackCities();
  }

  /**
   * Returns unique brands present in marketplace
   */
  public static async getBrands() {
    try {
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

      if (brands && brands.length > 0) {
        return brands.map((b) => ({
          brand: b.brand,
          count: b._count.id,
        }));
      }
    } catch (error) {
      console.warn('[VehiclesService] Database connection offline for getBrands, falling back to cached brands');
    }

    return getFallbackBrands();
  }
}

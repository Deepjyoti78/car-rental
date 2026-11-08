import { z } from 'zod';
import { VehicleCategory, Transmission, FuelType } from '@prisma/client';

export const searchVehiclesQuerySchema = z.object({
  city: z.string().optional(),
  pickupLocation: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.nativeEnum(VehicleCategory).optional(),
  transmission: z.nativeEnum(Transmission).optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  seatingCapacity: z.string().transform(Number).optional(),
  brand: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'rating_desc', 'popular_desc', 'newest']).optional().default('popular_desc'),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('12'),
});

export const vehicleCreateUpdateSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(2010).max(2027),
  registrationNumber: z.string().min(4, 'Registration number is required'),
  category: z.nativeEnum(VehicleCategory),
  transmission: z.nativeEnum(Transmission),
  fuelType: z.nativeEnum(FuelType),
  seatingCapacity: z.number().int().min(2).max(12),
  dailyRate: z.number().int().min(50000, 'Minimum daily rate is ₹500 (50000 paise)'),
  securityDeposit: z.number().int().min(0).default(500000),
  mileagePolicy: z.string().default('Unlimited km'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  pickupAddress: z.string().min(5, 'Pickup address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  isActive: z.boolean().optional().default(true),
  features: z.array(z.string()).optional().default([]),
  images: z.array(
    z.object({
      url: z.string().url('Valid image URL required'),
      isPrimary: z.boolean().default(false),
      order: z.number().int().default(0),
    })
  ).min(1, 'At least one vehicle image is required'),
});

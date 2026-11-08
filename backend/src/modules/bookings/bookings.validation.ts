import { z } from 'zod';

export const calculatePriceSchema = z.object({
  vehicleId: z.string().uuid('Valid vehicle ID required'),
  startDate: z.string().datetime('Valid ISO pickup date required'),
  endDate: z.string().datetime('Valid ISO return date required'),
});

export const createBookingSchema = z.object({
  vehicleId: z.string().uuid('Valid vehicle ID required'),
  startDate: z.string().datetime('Valid ISO pickup date required'),
  endDate: z.string().datetime('Valid ISO return date required'),
  pickupLocation: z.string().min(3, 'Pickup location is required'),
  returnLocation: z.string().min(3, 'Return location is required'),
  driverFullName: z.string().min(2, 'Primary driver full name is required'),
  driverPhone: z.string().min(10, 'Driver contact number is required'),
  driverEmail: z.string().email('Driver email address is required'),
  driverLicenseNumber: z.string().min(5, 'Driver license number is required'),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the rental terms and cancellation policy' }),
  }),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(5, 'Please provide a valid cancellation reason'),
});

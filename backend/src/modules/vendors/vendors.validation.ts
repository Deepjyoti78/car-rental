import { z } from 'zod';
import { BookingStatus, DocumentType } from '@prisma/client';

export const vendorProfileUpdateSchema = z.object({
  businessName: z.string().min(2).optional(),
  businessEmail: z.string().email().optional(),
  contactNumber: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  postalCode: z.string().min(4).optional(),
  description: z.string().optional(),
  authorizedPerson: z.string().min(2).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    BookingStatus.ACTIVE,
    BookingStatus.COMPLETED,
    BookingStatus.REJECTED,
    BookingStatus.CONFIRMED,
  ]),
  notes: z.string().optional(),
  startOdometer: z.number().int().optional(),
  returnOdometer: z.number().int().optional(),
  damageReport: z.string().optional(),
});

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().min(3),
});

export const uploadDocumentSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
});

export const requestPayoutSchema = z.object({
  amount: z.number().int().min(100000, 'Minimum payout request is ₹1,000 (100000 paise)'),
  accountNumber: z.string().min(8),
  ifscCode: z.string().min(4),
  bankName: z.string().min(2),
});

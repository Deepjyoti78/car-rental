export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type VehicleCategory = 'SUV' | 'SEDAN' | 'HATCHBACK' | 'LUXURY' | 'ELECTRIC';

export type Transmission = 'AUTOMATIC' | 'MANUAL';

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'AWAITING_APPROVAL'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  vendorId?: string;
  vendorStatus?: VendorStatus;
  vendor?: Vendor;
  customerProfile?: CustomerProfile;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  emergencyContact?: string;
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  businessEmail: string;
  contactNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  description?: string;
  authorizedPerson: string;
  status: VendorStatus;
  commissionRate: number;
  rating: number;
  totalReviews: number;
  createdAt: string;
  documents?: VendorDocument[];
}

export interface VendorDocument {
  id: string;
  vendorId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

export interface VehicleImage {
  id: string;
  vehicleId: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface VehicleFeature {
  id: string;
  vehicleId: string;
  name: string;
}

export interface Vehicle {
  id: string;
  vendorId: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  category: VehicleCategory;
  transmission: Transmission;
  fuelType: FuelType;
  seatingCapacity: number;
  dailyRate: number; // in paise
  securityDeposit: number; // in paise
  mileagePolicy: string;
  description: string;
  pickupAddress: string;
  city: string;
  state: string;
  isActive: boolean;
  isApproved: boolean;
  rating: number;
  totalTrips: number;
  createdAt: string;
  images: VehicleImage[];
  features?: VehicleFeature[];
  vendor?: {
    id: string;
    businessName: string;
    city: string;
    rating: number;
    totalReviews?: number;
    contactNumber?: string;
    businessEmail?: string;
    description?: string;
  };
  bookedRanges?: Array<{ start: string; end: string; reason: string }>;
  reviews?: Review[];
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerId: string;
  vendorId: string;
  vehicleId: string;
  pickupLocation: string;
  returnLocation: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  baseRate: number; // in paise
  baseAmount: number; // in paise
  taxesAmount: number; // in paise
  securityDeposit: number; // in paise
  platformFee: number; // in paise
  totalAmount: number; // in paise
  vendorEarnings: number; // in paise
  status: BookingStatus;
  cancellationReason?: string;
  cancelledAt?: string;
  startOdometer?: number;
  returnOdometer?: number;
  damageReport?: string;
  createdAt: string;
  vehicle?: Vehicle;
  vendor?: Vendor;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    customerProfile?: CustomerProfile;
  };
  payments?: Payment[];
  refunds?: Refund[];
  review?: Review;
  statusHistory?: Array<{
    id: string;
    fromStatus: BookingStatus;
    toStatus: BookingStatus;
    notes?: string;
    createdAt: string;
    changedBy?: { firstName: string; lastName: string; role: Role };
  }>;
}

export interface Payment {
  id: string;
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number; // in paise
  currency: string;
  status: PaymentStatus;
  verifiedAt?: string;
  createdAt: string;
  booking?: Booking;
}

export interface Refund {
  id: string;
  bookingId: string;
  amount: number; // in paise
  reason: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  processedAt?: string;
  createdAt: string;
  booking?: Booking;
}

export interface Payout {
  id: string;
  vendorId: string;
  amount: number; // in paise
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  vehicleId: string;
  vendorId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  bookingId?: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  response?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

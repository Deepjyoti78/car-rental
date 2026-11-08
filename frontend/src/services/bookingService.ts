import { api } from './api';
import { Booking } from '../types';

export const bookingService = {
  async calculatePrice(params: {
    vehicleId: string;
    startDate: string;
    endDate: string;
  }): Promise<{
    vehicle: any;
    availability: { available: boolean; conflictReason?: string };
    priceBreakdown: {
      rentalDays: number;
      baseRate: number;
      baseAmount: number;
      taxesAmount: number;
      securityDeposit: number;
      platformFee: number;
      totalAmount: number;
      commissionRate: number;
      vendorEarnings: number;
    };
  }> {
    const res: any = await api.post('/bookings/calculate-price', params);
    return res.data;
  },

  async createBooking(data: {
    vehicleId: string;
    startDate: string;
    endDate: string;
    pickupLocation: string;
    returnLocation: string;
    driverFullName: string;
    driverPhone: string;
    driverEmail: string;
    driverLicenseNumber: string;
    agreeToTerms: boolean;
  }): Promise<{
    booking: Booking;
    razorpayOrder: {
      id: string;
      amount: number;
      currency: string;
      bookingCode: string;
    };
  }> {
    const res: any = await api.post('/bookings', data);
    return res.data;
  },

  async getMyBookings(status?: string): Promise<Booking[]> {
    const res: any = await api.get('/bookings/my-bookings', { params: { status } });
    return res.data;
  },

  async getById(id: string): Promise<Booking> {
    const res: any = await api.get(`/bookings/${id}`);
    return res.data;
  },

  async cancelBooking(id: string, reason: string): Promise<any> {
    const res: any = await api.post(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },

  async verifyPayment(data: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<any> {
    const res: any = await api.post('/payments/verify', data);
    return res.data;
  },
};

import { api } from './api';
import { Booking, Vehicle } from '../types';

export const vendorService = {
  async getDashboard(): Promise<{
    vendor: any;
    stats: {
      totalVehicles: number;
      activeVehicles: number;
      totalBookings: number;
      pendingRequests: number;
      activeRentals: number;
      completedRentals: number;
      grossRevenue: number;
      platformCommission: number;
      netEarnings: number;
      availableBalance: number;
      utilizationRate: number;
    };
    recentBookings: any[];
  }> {
    const res: any = await api.get('/vendors/dashboard');
    return res.data;
  },

  async getVehicles(): Promise<Vehicle[]> {
    const res: any = await api.get('/vendors/vehicles');
    return res.data;
  },

  async createVehicle(data: any): Promise<Vehicle> {
    const res: any = await api.post('/vendors/vehicles', data);
    return res.data;
  },

  async updateVehicle(id: string, data: any): Promise<Vehicle> {
    const res: any = await api.patch(`/vendors/vehicles/${id}`, data);
    return res.data;
  },

  async toggleVehicleStatus(id: string): Promise<Vehicle> {
    const res: any = await api.post(`/vendors/vehicles/${id}/toggle-status`);
    return res.data;
  },

  async addMaintenance(data: { vehicleId: string; startDate: string; endDate: string; reason: string }): Promise<any> {
    const res: any = await api.post('/vendors/maintenance', data);
    return res.data;
  },

  async getBookings(status?: string): Promise<Booking[]> {
    const res: any = await api.get('/vendors/bookings', { params: { status } });
    return res.data;
  },

  async updateBookingStatus(
    id: string,
    data: {
      status: string;
      notes?: string;
      startOdometer?: number;
      returnOdometer?: number;
      damageReport?: string;
    }
  ): Promise<Booking> {
    const res: any = await api.patch(`/vendors/bookings/${id}/status`, data);
    return res.data;
  },

  async getEarnings(): Promise<{
    financials: any;
    payouts: any[];
    recentEarnings: any[];
  }> {
    const res: any = await api.get('/vendors/earnings');
    return res.data;
  },

  async requestPayout(data: { amount: number; accountNumber: string; ifscCode: string; bankName: string }): Promise<any> {
    const res: any = await api.post('/vendors/payouts', data);
    return res.data;
  },

  async uploadDocument(data: { documentType: string; fileName: string; fileUrl: string }): Promise<any> {
    const res: any = await api.post('/vendors/documents', data);
    return res.data;
  },
};

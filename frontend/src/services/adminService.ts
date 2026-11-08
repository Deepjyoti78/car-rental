import { api } from './api';
import { Booking, Refund, SupportTicket, User, Vehicle, Vendor } from '../types';

export const adminService = {
  async getStats(): Promise<{ overview: any }> {
    const res: any = await api.get('/admin/stats');
    return res.data;
  },

  async getVendors(status?: string): Promise<Vendor[]> {
    const res: any = await api.get('/admin/vendors', { params: { status } });
    return res.data;
  },

  async updateVendorStatus(id: string, status: string): Promise<Vendor> {
    const res: any = await api.patch(`/admin/vendors/${id}/status`, { status });
    return res.data;
  },

  async updateCommission(ratePercentage: number, vendorId?: string): Promise<any> {
    const res: any = await api.post('/admin/commission', { ratePercentage, vendorId });
    return res.data;
  },

  async getAllBookings(status?: string): Promise<Booking[]> {
    const res: any = await api.get('/admin/bookings', { params: { status } });
    return res.data;
  },

  async getRefunds(status?: string): Promise<Refund[]> {
    const res: any = await api.get('/admin/refunds', { params: { status } });
    return res.data;
  },

  async processRefund(id: string): Promise<Refund> {
    const res: any = await api.post(`/admin/refunds/${id}/process`);
    return res.data;
  },

  async getUsers(role?: string): Promise<User[]> {
    const res: any = await api.get('/admin/users', { params: { role } });
    return res.data;
  },

  async toggleUserStatus(id: string): Promise<User> {
    const res: any = await api.post(`/admin/users/${id}/toggle-status`);
    return res.data;
  },

  async getAllVehicles(): Promise<Vehicle[]> {
    const res: any = await api.get('/admin/vehicles');
    return res.data;
  },

  async moderateVehicle(id: string, isApproved: boolean): Promise<Vehicle> {
    const res: any = await api.patch(`/admin/vehicles/${id}/moderate`, { isApproved });
    return res.data;
  },

  async getSupportTickets(status?: string): Promise<SupportTicket[]> {
    const res: any = await api.get('/admin/support', { params: { status } });
    return res.data;
  },

  async replySupportTicket(id: string, response: string, status: string): Promise<SupportTicket> {
    const res: any = await api.post(`/admin/support/${id}/reply`, { response, status });
    return res.data;
  },
};

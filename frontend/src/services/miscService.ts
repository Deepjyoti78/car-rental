import { api } from './api';
import { NotificationItem, Review, SupportTicket } from '../types';

export const miscService = {
  // Wishlist
  async getWishlist(): Promise<any[]> {
    const res: any = await api.get('/wishlist');
    return res.data;
  },

  async toggleWishlist(vehicleId: string): Promise<{ saved: boolean }> {
    const res: any = await api.post(`/wishlist/toggle/${vehicleId}`);
    return res.data;
  },

  // Reviews
  async submitReview(data: { bookingId: string; rating: number; comment: string }): Promise<Review> {
    const res: any = await api.post('/reviews', data);
    return res.data;
  },

  async getVehicleReviews(vehicleId: string): Promise<Review[]> {
    const res: any = await api.get(`/reviews/vehicle/${vehicleId}`);
    return res.data;
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const res: any = await api.get('/notifications');
    return res.data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },

  // Support Tickets
  async getMyTickets(): Promise<SupportTicket[]> {
    const res: any = await api.get('/support');
    return res.data;
  },

  async createTicket(data: { bookingId?: string; subject: string; message: string; priority: string }): Promise<SupportTicket> {
    const res: any = await api.post('/support', data);
    return res.data;
  },
};

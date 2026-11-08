import { api } from './api';
import { User } from '../types';

export const authService = {
  async register(data: any): Promise<{ user: User; token: string }> {
    const res: any = await api.post('/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res: any = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res: any = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data: any): Promise<User> {
    const res: any = await api.patch('/auth/profile', data);
    return res.data;
  },
};

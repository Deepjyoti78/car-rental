import { api } from './api';
import { Vehicle } from '../types';

export interface VehicleSearchParams {
  city?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  transmission?: string;
  fuelType?: string;
  seatingCapacity?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const vehicleService = {
  async search(params: VehicleSearchParams): Promise<{ data: Vehicle[]; meta: any }> {
    const res: any = await api.get('/vehicles', { params });
    return {
      data: res.data || [],
      meta: res.meta || { page: 1, limit: 12, total: 0, totalPages: 1 },
    };
  },

  async getById(id: string): Promise<Vehicle> {
    const res: any = await api.get(`/vehicles/${id}`);
    return res.data;
  },

  async getFeatured(): Promise<Vehicle[]> {
    const res: any = await api.get('/vehicles/featured');
    return res.data;
  },

  async getCities(): Promise<Array<{ city: string; state: string; vehicleCount: number }>> {
    const res: any = await api.get('/vehicles/cities');
    return res.data;
  },

  async getBrands(): Promise<Array<{ brand: string; count: number }>> {
    const res: any = await api.get('/vehicles/brands');
    return res.data;
  },
};

import { api } from './api';
import { Vehicle } from '../types';
import { MOCK_FLEET } from './mockFleet';

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

function searchMockFleet(params: VehicleSearchParams): { data: Vehicle[]; meta: any } {
  let list = [...MOCK_FLEET];

  if (params.city && params.city.trim() !== '') {
    const q = params.city.trim().toLowerCase();
    list = list.filter((v) => v.city.toLowerCase().includes(q));
  }

  if (params.category && params.category !== 'ALL') {
    list = list.filter((v) => v.category === params.category);
  }

  if (params.transmission) {
    list = list.filter((v) => v.transmission === params.transmission);
  }

  if (params.fuelType) {
    list = list.filter((v) => v.fuelType === params.fuelType);
  }

  if (params.seatingCapacity) {
    list = list.filter((v) => v.seatingCapacity >= params.seatingCapacity!);
  }

  if (params.brand && params.brand.trim() !== '') {
    const q = params.brand.trim().toLowerCase();
    list = list.filter((v) => v.brand.toLowerCase().includes(q));
  }

  if (params.minPrice !== undefined) {
    list = list.filter((v) => v.dailyRate >= params.minPrice!);
  }

  if (params.maxPrice !== undefined) {
    list = list.filter((v) => v.dailyRate <= params.maxPrice!);
  }

  if (params.sortBy === 'price_asc') {
    list.sort((a, b) => a.dailyRate - b.dailyRate);
  } else if (params.sortBy === 'price_desc') {
    list.sort((a, b) => b.dailyRate - a.dailyRate);
  } else if (params.sortBy === 'rating_desc') {
    list.sort((a, b) => b.rating - a.rating);
  } else {
    // default popular_desc
    list.sort((a, b) => b.totalTrips - a.totalTrips);
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 12));
  const total = list.length;
  const skip = (page - 1) * limit;
  const data = list.slice(skip, skip + limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export const vehicleService = {
  async search(params: VehicleSearchParams): Promise<{ data: Vehicle[]; meta: any }> {
    try {
      const res: any = await api.get('/vehicles', { params });
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        return {
          data: res.data,
          meta: res.meta || { page: 1, limit: 12, total: res.data.length, totalPages: 1 },
        };
      }
      // If backend returned empty list but no specific filters were applied, serve fallback
      if ((!res.data || res.data.length === 0) && !params.brand && !params.city && !params.category) {
        return searchMockFleet(params);
      }
      return {
        data: res?.data || [],
        meta: res?.meta || { page: 1, limit: 12, total: 0, totalPages: 1 },
      };
    } catch (err) {
      console.warn('[vehicleService] Backend unavailable, serving client mock fleet catalog.');
      return searchMockFleet(params);
    }
  },

  async getById(id: string): Promise<Vehicle> {
    try {
      const res: any = await api.get(`/vehicles/${id}`);
      if (res?.data) return res.data;
    } catch (err) {
      console.warn('[vehicleService] Backend unavailable for getById, serving mock vehicle.');
    }
    const found = MOCK_FLEET.find((v) => v.id === id) || MOCK_FLEET[0];
    return found;
  },

  async getFeatured(): Promise<Vehicle[]> {
    try {
      const res: any = await api.get('/vehicles/featured');
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('[vehicleService] Backend unavailable for getFeatured, serving mock featured fleet.');
    }
    return [...MOCK_FLEET].sort((a, b) => b.rating - a.rating).slice(0, 6);
  },

  async getCities(): Promise<Array<{ city: string; state: string; vehicleCount: number }>> {
    try {
      const res: any = await api.get('/vehicles/cities');
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('[vehicleService] Backend unavailable for getCities, serving mock cities.');
    }

    const map = new Map<string, { city: string; state: string; count: number }>();
    for (const v of MOCK_FLEET) {
      const key = `${v.city}-${v.state}`;
      if (!map.has(key)) {
        map.set(key, { city: v.city, state: v.state, count: 1 });
      } else {
        map.get(key)!.count += 1;
      }
    }
    return Array.from(map.values()).map((c) => ({
      city: c.city,
      state: c.state,
      vehicleCount: c.count,
    }));
  },

  async getBrands(): Promise<Array<{ brand: string; count: number }>> {
    try {
      const res: any = await api.get('/vehicles/brands');
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('[vehicleService] Backend unavailable for getBrands, serving mock brands.');
    }

    const map = new Map<string, number>();
    for (const v of MOCK_FLEET) {
      map.set(v.brand, (map.get(v.brand) || 0) + 1);
    }
    return Array.from(map.entries()).map(([brand, count]) => ({
      brand,
      count,
    }));
  },
};

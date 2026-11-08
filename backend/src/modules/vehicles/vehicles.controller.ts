import { Request, Response } from 'express';
import { VehiclesService } from './vehicles.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class VehiclesController {
  public static async search(req: Request, res: Response): Promise<void> {
    try {
      const result = await VehiclesService.searchVehicles(req.query as any);
      sendSuccess(res, result.vehicles, undefined, 200, result.meta);
    } catch (error: any) {
      sendError(res, error.message || 'Error searching vehicles', 400);
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const vehicle = await VehiclesService.getVehicleById(req.params.id);
      sendSuccess(res, vehicle);
    } catch (error: any) {
      sendError(res, error.message || 'Vehicle not found', 404);
    }
  }

  public static async getFeatured(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await VehiclesService.getFeaturedVehicles();
      sendSuccess(res, vehicles);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch featured vehicles', 400);
    }
  }

  public static async getCities(req: Request, res: Response): Promise<void> {
    try {
      const cities = await VehiclesService.getActiveCities();
      sendSuccess(res, cities);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch cities', 400);
    }
  }

  public static async getBrands(req: Request, res: Response): Promise<void> {
    try {
      const brands = await VehiclesService.getBrands();
      sendSuccess(res, brands);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch brands', 400);
    }
  }
}

import { Router } from 'express';
import { VehiclesController } from './vehicles.controller.js';
import { validateQuery } from '../../middleware/validate.js';
import { searchVehiclesQuerySchema } from './vehicles.validation.js';

const router = Router();

router.get('/', validateQuery(searchVehiclesQuerySchema), VehiclesController.search);
router.get('/featured', VehiclesController.getFeatured);
router.get('/cities', VehiclesController.getCities);
router.get('/brands', VehiclesController.getBrands);
router.get('/:id', VehiclesController.getById);

export default router;

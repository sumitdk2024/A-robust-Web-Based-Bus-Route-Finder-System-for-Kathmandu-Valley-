import { Router } from 'express';
import { getRoutes, getStops, getRouteStops, getRoute, getStop, getOrderedRouteStops } from '../controllers/dataController.js';

const router = Router();
router.get('/routes', getRoutes);
router.get('/routes/:routeId/stops', getOrderedRouteStops);
router.get('/routes/:routeId', getRoute);
router.get('/stops', getStops);
router.get('/stops/:stopId', getStop);
router.get('/route-stops', getRouteStops);
export default router;

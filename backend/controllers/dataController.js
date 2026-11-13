import { mainDataset } from '../services/mainDataset.js';
import { getRouteSequence } from '../services/routeSequenceService.js';
export const getRoutes = (req, res) => res.json(mainDataset.routes);
export const getStops = (req, res) => res.json(mainDataset.stops);
export const getRouteStops = (req, res) => res.json(mainDataset.route_stops);
const detail = (rows, field, parameter, label) => (req, res) => {
  const row = rows.find(row => row[field] === req.params[parameter]);
  return row ? res.json(row) : res.status(404).json({ message: `${label} not found` });
};
export const getRoute = detail(mainDataset.routes, 'route_id', 'routeId', 'Route');
export const getStop = detail(mainDataset.stops, 'stop_id', 'stopId', 'Stop');
export async function getOrderedRouteStops(req, res, next) {
  try { const sequence = await getRouteSequence(req.params.routeId); return sequence ? res.json(sequence) : res.status(404).json({ message: 'Route not found' }); } catch (error) { next(error); }
}

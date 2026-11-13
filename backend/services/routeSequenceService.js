import { mainDataset } from './mainDataset.js';
export async function getRouteSequence(routeId) {
  const route = mainDataset.routes.find(route => route.route_id === routeId);
  if (!route) return null;
  const byId = new Map(mainDataset.stops.map(stop => [stop.stop_id, stop]));
  return { route, stops: mainDataset.route_stops.filter(link => link.route_id === routeId).sort((a,b) => a.stop_order-b.stop_order).map(link => ({ ...link, stop: byId.get(link.stop_id) })) };
}

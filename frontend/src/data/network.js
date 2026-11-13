import data from './mainNetwork.json' with { type: 'json' };

export const networkData = data;
export const networkStops = data.stops.map(stop => ({ ...stop, id: stop.stop_id, name: stop.stop_name, position: [stop.latitude, stop.longitude] }));
export const stopsById = Object.fromEntries(networkStops.map(stop => [stop.id, stop]));
const colors = ['#146551', '#6853ab', '#ad344a', '#326c91', '#865800'];
export const networkRoutes = data.routes.map((route, index) => ({
  ...route, id: route.route_id, name: route.route_title_from_source, color: colors[index % colors.length],
  stops: data.route_stops.filter(row => row.route_id === route.route_id).sort((a, b) => a.stop_order - b.stop_order).map(row => row.stop_id),
}));

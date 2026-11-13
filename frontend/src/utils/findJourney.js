import { networkStops, networkRoutes } from '../data/network.js';

export function buildGraph(stops, routes) {
  const graph = new Map(stops.map(stop => [stop.id, []]));
  const routesById = new Map();
  for (const route of routes) {
    if (routesById.has(route.id)) throw new Error(`Duplicate route ${route.id}`);
    routesById.set(route.id, route);
    route.stops.forEach(id => { if (!graph.has(id)) throw new Error(`Unknown stop ${id}`); });
    for (let i = 1; i < route.stops.length; i++) {
      const from = route.stops[i - 1], to = route.stops[i];
      graph.get(from).push({ from, to, routeId: route.id, route_id: route.id, company: route.company, direction: route.direction, from_stop_id: from, to_stop_id: to });
    }
  }
  // Stable route-ID/next-stop order resolves otherwise equal-cost paths.
  for (const edges of graph.values()) edges.sort((a, b) => a.routeId.localeCompare(b.routeId) || a.to.localeCompare(b.to));
  return { graph, routesById };
}

export const transportNetwork = buildGraph(networkStops, networkRoutes);
const compare = (a, b) => a[0] - b[0] || a[1] - b[1];
const key = (stop, route) => JSON.stringify([stop, route]);

// Dijkstra over (stop, current route). Lexicographic costs guarantee fewer
// transfers first, then fewer edges/stops, with no arbitrary transfer penalty.
export function findJourney(origin, destination, network = transportNetwork) {
  const message = text => ({ type: 'message', message: text });
  if (!origin) return message('Please select a starting location.');
  if (!destination) return message('Please select a destination.');
  if (!network.graph.has(origin) || !network.graph.has(destination)) return message('Please select a valid bus stop from the suggestions.');
  if (origin === destination) return message('Starting location and destination cannot be the same.');
  const start = key(origin, null);
  const costs = new Map([[start, [0, 0]]]);
  const previous = new Map();
  const queue = [{ stop: origin, route: null, cost: [0, 0], key: start }];
  let end;
  while (queue.length) {
    queue.sort((a, b) => compare(a.cost, b.cost));
    const current = queue.shift();
    if (compare(current.cost, costs.get(current.key)) !== 0) continue;
    if (current.stop === destination) { end = current.key; break; }
    for (const edge of network.graph.get(current.stop)) {
      const nextKey = key(edge.to, edge.routeId);
      const cost = [current.cost[0] + Number(current.route !== null && current.route !== edge.routeId), current.cost[1] + 1];
      if (costs.has(nextKey) && compare(cost, costs.get(nextKey)) >= 0) continue;
      costs.set(nextKey, cost);
      previous.set(nextKey, { key: current.key, edge });
      queue.push({ stop: edge.to, route: edge.routeId, cost, key: nextKey });
    }
  }
  if (!end) return message('No suitable route is available in the current project dataset.');
  const edges = [];
  for (let cursor = end; cursor !== start;) {
    const step = previous.get(cursor);
    edges.push(step.edge);
    cursor = step.key;
  }
  edges.reverse();
  const legs = [];
  for (const edge of edges) {
    const last = legs.at(-1);
    if (last?.routeId === edge.routeId) last.stops.push(edge.to);
    else {
      const route = network.routesById.get(edge.routeId);
      legs.push({ routeId: route.id, routeName: route.name, company: route.company, direction: route.direction, color: route.color || '#146551', stops: [edge.from, edge.to] });
    }
  }
  return { type: legs.length === 1 ? 'direct' : 'transfer', legs,
    transfers: legs.slice(1).map(leg => leg.stops[0]), transferCount: legs.length - 1,
    stopCount: edges.length + 1, dataset_status: 'main_only_dataset' };
}

export function journeyLabel(result) {
  const count = result.legs.length - 1;
  return count === 0 ? 'Direct Route' : `${count} Transfer${count === 1 ? '' : 's'}`;
}

export function inspectConnectivity(network = transportNetwork) {
  const ids = [...network.graph.keys()];
  const undirected = new Map(ids.map(id => [id, new Set()]));
  for (const [from, edges] of network.graph) for (const edge of edges) { undirected.get(from).add(edge.to); undirected.get(edge.to).add(from); }
  const components = [], seen = new Set();
  for (const id of ids) if (!seen.has(id)) {
    const component = [id]; seen.add(id);
    for (let i=0;i<component.length;i++) for (const next of undirected.get(component[i])) if (!seen.has(next)) { seen.add(next); component.push(next); }
    components.push(component);
  }
  const used = new Set([...network.routesById.values()].flatMap(route => route.stops));
  return { totalStops: ids.length, networkStops: used.size, unusedStops: ids.filter(id => !used.has(id)), connectedComponents: components.length, components, disconnectedStops: components.slice().sort((a,b) => b.length-a.length).slice(1).flat(), noOutgoingStops: ids.filter(id => !network.graph.get(id).length), noIncomingStops: ids.filter(id => ![...network.graph.values()].some(edges => edges.some(edge => edge.to === id))) };
}

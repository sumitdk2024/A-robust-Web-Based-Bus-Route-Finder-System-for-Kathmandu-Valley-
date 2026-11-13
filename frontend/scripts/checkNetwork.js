import { inspectConnectivity, findJourney, transportNetwork } from '../src/utils/findJourney.js';
import { networkData, networkStops, stopsById } from '../src/data/network.js';
import { hasValidCoordinates } from '../src/utils/distance.js';
export const examples = [['thankot','airport'], ['kapan','balaju'], ['kamalbinayak','ratnapark'], ['budhanilkantha','lagankhel'], ['gongabu_chowk','chabahil'], ['kalanki','bouddha_stupa'], ['godawari','jamal'], ['riddhi_siddhi_mulpani','thankot'], ['baadbhanjyan(thankot)','petrol_pump-panipokhari']];
const connectivity = inspectConnectivity();
// Directed reachability is reported separately from weak connectivity.
const unreachableByOrigin = {};
for (const origin of networkStops) {
  const seen = new Set([origin.id]), queue = [origin.id];
  for (let i=0;i<queue.length;i++) for (const edge of transportNetwork.graph.get(queue[i])) if (!seen.has(edge.to)) { seen.add(edge.to); queue.push(edge.to); }
  const missing = networkStops.filter(stop => !seen.has(stop.id)).map(stop => stop.id);
  if (missing.length) unreachableByOrigin[origin.id] = missing;
}
const report = { ...connectivity, routeRecords: networkData.routes.length, routeStopRelationships: networkData.route_stops.length, missingCoordinates: networkStops.filter(stop => !hasValidCoordinates(stop.latitude,stop.longitude)).map(stop => stop.id), unreachableByOrigin,
  journeys: examples.map(([from,to]) => { const result = findJourney(from,to); return { from, to, origin: stopsById[from]?.name, destination: stopsById[to]?.name, transfers: result.transferCount, stops: result.stopCount, routes: result.legs?.map(leg => leg.routeId), message: result.message }; }) };
console.log(JSON.stringify(report,null,2));

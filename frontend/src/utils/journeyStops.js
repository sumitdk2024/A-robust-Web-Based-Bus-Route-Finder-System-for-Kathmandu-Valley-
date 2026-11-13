import { stopsById } from '../data/network.js';

export function getJourneyStops(result) {
  if (!result?.legs) return [];
  const ids = result.legs.flatMap((leg, index) => index ? leg.stops.slice(1) : leg.stops);
  const transfers = new Set(result.transfers);
  return ids.map((id, index) => ({ ...stopsById[id],
    role: index === 0 ? 'origin' : index === ids.length - 1 ? 'destination' : transfers.has(id) ? 'transfer' : 'intermediate',
  }));
}
